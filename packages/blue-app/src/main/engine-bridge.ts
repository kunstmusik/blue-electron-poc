/**
 * EngineBridge — manages the blue-engine subprocess and ZMQ connection.
 * Bridges the Electron main process to the C++ blue-engine.
 */
import { ChildProcess, spawn } from 'child_process';
import { EngineClient } from '@blue/engine-client';
import { BrowserWindow, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export class EngineBridge {
  private engineProcess: ChildProcess | null = null;
  private client: EngineClient | null = null;
  private mainWindow: BrowserWindow;
  private isPlaying = false;
  private enginePath: string;
  private port: number;
  private stderr = '';

  constructor(mainWindow: BrowserWindow, enginePath?: string, port?: number) {
    this.mainWindow = mainWindow;
    this.enginePath = enginePath || 'blue-engine';
    this.port = port || 5555;
  }

  /**
   * Find the blue-engine binary. Checks common locations.
   */
  private findEngine(): string | null {
    // Check if the configured path exists
    if (fs.existsSync(this.enginePath)) {
      return this.enginePath;
    }

    // Common locations on macOS
    const candidates = [
      '/usr/local/bin/blue-engine',
      '/opt/homebrew/bin/blue-engine',
      path.join(process.env.HOME || '', '.local', 'bin', 'blue-engine'),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  /**
   * Start the blue-engine process and connect via ZMQ.
   */
  async startEngine(): Promise<boolean> {
    try {
      // Find the engine binary
      const enginePath = this.findEngine();
      if (!enginePath) {
        await dialog.showErrorBox(
          'blue-engine Not Found',
          `Could not find the blue-engine binary.\n\n` +
          `Searched: ${this.enginePath}, /usr/local/bin/blue-engine, /opt/homebrew/bin/blue-engine\n\n` +
          `Please install blue-engine or set the engine path in preferences.`,
        );
        return false;
      }

      this.stderr = '';
      console.log(`[EngineBridge] Starting: ${enginePath} --port=${this.port}`);

      // Spawn blue-engine
      this.engineProcess = spawn(enginePath, ['--port', `${this.port}`], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Capture stderr for error reporting
      this.engineProcess.stderr?.on('data', (data: Buffer) => {
        this.stderr += data.toString();
        console.error(`[EngineBridge] stderr: ${data.toString().trim()}`);
      });

      this.engineProcess.stdout?.on('data', (data: Buffer) => {
        console.log(`[EngineBridge] stdout: ${data.toString().trim()}`);
      });

      this.engineProcess.on('exit', (code, signal) => {
        console.log(`[EngineBridge] Engine exited: code=${code}, signal=${signal}`);
        console.log(`[EngineBridge] Captured stderr: ${this.stderr}`);
        this.isPlaying = false;
        this.mainWindow.webContents.send('playback-status', {
          status: 'stopped',
          message: this.stderr
            ? `Engine error: ${this.stderr.trim().split('\n').pop()}`
            : `Engine exited (code: ${code}, signal: ${signal})`,
        });
      });

      this.engineProcess.on('error', (err) => {
        console.error(`[EngineBridge] Spawn error: ${err.message}`);
        this.isPlaying = false;
        this.mainWindow.webContents.send('playback-error', `Engine error: ${err.message}`);
      });

      // Give the engine a moment to start
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if process is still running
      if (!this.engineProcess || this.engineProcess.killed) {
        await dialog.showErrorBox(
          'blue-engine Failed',
          `The blue-engine process exited immediately.\n\n` +
          `Error output:\n${this.stderr || '(no output)'}`,
        );
        return false;
      }

      // Connect ZMQ client
      this.client = new EngineClient({
        endpoint: `tcp://localhost:${this.port}`,
        timeout: 10000,
      });
      await this.client.connect();

      // Initialize engine
      const createResp = await this.client.createEngine();
      if (!createResp.ok) {
        console.error(`[EngineBridge] createEngine failed: ${createResp.message}`);
        return false;
      }

      const optResp = await this.client.setOption('-d'); // Disable display
      if (!optResp.ok) {
        console.warn(`[EngineBridge] setOption(-d) warning: ${optResp.message}`);
      }

      console.log('[EngineBridge] Engine started successfully');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[EngineBridge] Start failed: ${msg}`);
      console.error(`[EngineBridge] Captured stderr: ${this.stderr}`);

      await dialog.showErrorBox(
        'Engine Start Failed',
        `Could not start blue-engine:\n\n${msg}\n\n` +
        `Engine output:\n${this.stderr || '(no output)'}`,
      );
      return false;
    }
  }

  /**
   * Stop the engine and clean up.
   */
  async stopEngine(): Promise<void> {
    this.isPlaying = false;

    if (this.client) {
      try {
        await this.client.stop();
        await this.client.disconnect();
      } catch (err) {
        // Ignore disconnect errors
        console.warn(`[EngineBridge] disconnect error: ${err instanceof Error ? err.message : String(err)}`);
      }
      this.client = null;
    }

    if (this.engineProcess) {
      this.engineProcess.kill();
      this.engineProcess = null;
    }

    this.mainWindow.webContents.send('playback-status', { status: 'stopped' });
  }

  /**
   * Play a CSD string — compile and start performance.
   * Destroys and recreates the engine for each playback to ensure
   * a clean state (matching the test_client.js pattern).
   */
  async playCSD(csd: string): Promise<boolean> {
    // Always destroy existing engine and start fresh
    await this.stopEngine();

    // Start fresh engine
    const started = await this.startEngine();
    if (!started) return false;

    if (!this.client) return false;

    try {
      // Parse CSD to extract orchestra and score sections
      const { orchestra, score, options } = parseCSD(csd);

      // Log what we're sending for debugging
      console.log(`[EngineBridge] CSD: ${csd.length} bytes`);
      console.log(`[EngineBridge] Options: ${JSON.stringify(options)}`);
      console.log(`[EngineBridge] Orchestra: ${orchestra?.length || 0} chars`);
      if (orchestra) console.log(`[EngineBridge] Orchestra preview:\n${orchestra.substring(0, 200)}`);
      console.log(`[EngineBridge] Score: ${score?.length || 0} chars`);
      if (score) console.log(`[EngineBridge] Score:\n${score}`);

      // Check if we have anything to play
      if (!orchestra && !score) {
        console.warn('[EngineBridge] Empty CSD — no orchestra or score to play');
        this.mainWindow.webContents.send('playback-status', {
          status: 'error',
          message: 'No instruments or score events to play',
        });
        return false;
      }

      // Set options
      for (const opt of options) {
        console.log(`[EngineBridge] setOption: ${opt}`);
        try {
          const resp = await this.client.setOption(opt);
          if (!resp.ok) {
            console.error(`[EngineBridge] setOption failed: ${opt} — ${resp.message}`);
          }
        } catch (err: unknown) {
          console.error(`[EngineBridge] setOption error: ${opt} — ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      // Compile orchestra
      if (orchestra) {
        console.log(`[EngineBridge] compileOrc (${orchestra.length} chars)`);
        const resp = await this.client.compileOrc(orchestra);
        console.log(`[EngineBridge] compileOrc: ${resp.ok ? 'OK' : 'FAILED'} ${resp.message}`);
        if (!resp.ok) {
          this.mainWindow.webContents.send('playback-status', {
            status: 'error',
            message: `Orchestra compile failed: ${resp.message}`,
          });
          return false;
        }
      }

      // Read score
      if (score) {
        console.log(`[EngineBridge] readScore (${score.length} chars)`);
        const resp = await this.client.readScore(score);
        console.log(`[EngineBridge] readScore: ${resp.ok ? 'OK' : 'FAILED'} ${resp.message}`);
        if (!resp.ok) {
          this.mainWindow.webContents.send('playback-status', {
            status: 'error',
            message: `Score read failed: ${resp.message}`,
          });
          return false;
        }
      }

      // Start performance
      console.log(`[EngineBridge] start()`);
      const startResp = await this.client.start();
      console.log(`[EngineBridge] start: ${startResp.ok ? 'OK' : 'FAILED'} ${startResp.message}`);
      if (!startResp.ok) {
        this.mainWindow.webContents.send('playback-status', {
          status: 'error',
          message: `Engine start failed: ${startResp.message}`,
        });
        return false;
      }
      this.isPlaying = true;

      this.mainWindow.webContents.send('playback-status', {
        status: 'playing',
        message: 'Playing via blue-engine',
      });

      return true;
    } catch (err: unknown) {
      this.mainWindow.webContents.send('playback-error', `Play failed: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }

  /**
   * Stop playback.
   */
  async stopPlayback(): Promise<void> {
    if (this.client && this.isPlaying) {
      try {
        const resp = await this.client.stop();
        console.log(`[EngineBridge] stop: ${resp.ok ? 'OK' : 'FAILED'} ${resp.message}`);
      } catch {
        // Ignore stop errors
      }
    }
    this.isPlaying = false;
    this.mainWindow.webContents.send('playback-status', { status: 'stopped' });
  }

  /**
   * Set a channel value during playback.
   */
  async setChannel(name: string, value: number): Promise<void> {
    if (this.client) {
      const resp = await this.client.setChannel(name, value);
      if (!resp.ok) {
        console.warn(`[EngineBridge] setChannel(${name}) failed: ${resp.message}`);
      }
    }
  }

  /**
   * Get a channel value during playback.
   */
  async getChannel(name: string): Promise<number> {
    if (this.client) {
      const resp = await this.client.getChannel(name);
      if (resp.ok) return resp.value;
    }
    return 0;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Clean up all resources.
   */
  dispose(): void {
    this.stopEngine();
  }
}

/**
 * Parse a CSD string into its components.
 */
function parseCSD(csd: string): { orchestra: string; score: string; options: string[] } {
  const options: string[] = [];
  let orchestra = '';
  let score = '';

  // Extract CsOptions
  const optsMatch = csd.match(/<CsOptions>([\s\S]*?)<\/CsOptions>/);
  if (optsMatch) {
    const optsText = optsMatch[1].trim();
    // Parse each option
    for (const line of optsText.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith(';')) {
        options.push(trimmed);
      }
    }
  }

  // Extract CsInstruments (orchestra)
  const orcMatch = csd.match(/<CsInstruments>([\s\S]*?)<\/CsInstruments>/);
  if (orcMatch) {
    orchestra = orcMatch[1].trim();
  }

  // Extract CsScore
  const scoMatch = csd.match(/<CsScore>([\s\S]*?)<\/CsScore>/);
  if (scoMatch) {
    score = scoMatch[1].trim();
  }

  return { orchestra, score, options };
}
