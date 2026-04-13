/**
 * EngineBridge — manages the blue-engine subprocess and ZMQ connection.
 * Bridges the Electron main process to the C++ blue-engine.
 *
 * Lifecycle: For each playback, a fresh engine is spawned.
 * After stop (or natural completion), the engine is force-killed.
 * A playback lock prevents concurrent operations.
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
  private playbackLock = false;

  constructor(mainWindow: BrowserWindow, enginePath?: string, port?: number) {
    this.mainWindow = mainWindow;
    this.enginePath = enginePath || 'blue-engine';
    this.port = port || 5555;
  }

  /**
   * Find the blue-engine binary. Checks common locations.
   */
  private findEngine(): string | null {
    if (fs.existsSync(this.enginePath)) {
      return this.enginePath;
    }

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
   * Force-kill the engine process and clean up all resources.
   * Does NOT send ZMQ commands — just SIGKILL the process.
   */
  private killEngine(): void {
    if (this.engineProcess && !this.engineProcess.killed) {
      try {
        this.engineProcess.kill('SIGKILL');
      } catch {
        // Process already dead
      }
    }
    this.engineProcess = null;
    this.client = null;
    this.isPlaying = false;
  }

  /**
   * Start a fresh blue-engine process and connect via ZMQ.
   */
  async startEngine(): Promise<boolean> {
    // Ensure no leftover process
    this.killEngine();

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
    console.log(`[EngineBridge] Starting: ${enginePath} --port ${this.port}`);

    // Spawn blue-engine
    this.engineProcess = spawn(enginePath, ['--port', `${this.port}`], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Capture stderr
    this.engineProcess.stderr?.on('data', (data: Buffer) => {
      this.stderr += data.toString();
      console.error(`[EngineBridge] stderr: ${data.toString().trim()}`);
    });

    this.engineProcess.stdout?.on('data', (data: Buffer) => {
      console.log(`[EngineBridge] stdout: ${data.toString().trim()}`);
    });

    this.engineProcess.on('exit', (code, signal) => {
      console.log(`[EngineBridge] Engine exited: code=${code}, signal=${signal}`);
      if (this.isPlaying) {
        // Engine exited unexpectedly during playback
        this.isPlaying = false;
        this.mainWindow.webContents.send('playback-status', {
          status: 'stopped',
          message: this.stderr
            ? `Engine error: ${this.stderr.trim().split('\n').pop()}`
            : `Engine exited (code: ${code}, signal: ${signal})`,
        });
      }
    });

    this.engineProcess.on('error', (err) => {
      console.error(`[EngineBridge] Spawn error: ${err.message}`);
      this.isPlaying = false;
      this.mainWindow.webContents.send('playback-error', `Engine error: ${err.message}`);
    });

    // Wait for engine to start
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!this.engineProcess || this.engineProcess.killed) {
      await dialog.showErrorBox(
        'blue-engine Failed',
        `The blue-engine process exited immediately.\n\n` +
        `Error output:\n${this.stderr || '(no output)'}`,
      );
      return false;
    }

    // Connect ZMQ client
    try {
      this.client = new EngineClient({
        endpoint: `tcp://localhost:${this.port}`,
        timeout: 10000,
      });
      await this.client.connect();
    } catch (err: unknown) {
      console.error(`[EngineBridge] ZMQ connect failed: ${err instanceof Error ? err.message : String(err)}`);
      this.killEngine();
      return false;
    }

    // Initialize engine
    try {
      const createResp = await this.client.createEngine();
      if (!createResp.ok) {
        console.error(`[EngineBridge] createEngine failed: ${createResp.message}`);
        this.killEngine();
        return false;
      }

      const optResp = await this.client.setOption('-d');
      if (!optResp.ok) {
        console.warn(`[EngineBridge] setOption(-d) warning: ${optResp.message}`);
      }
    } catch (err: unknown) {
      console.error(`[EngineBridge] Engine init failed: ${err instanceof Error ? err.message : String(err)}`);
      this.killEngine();
      return false;
    }

    console.log('[EngineBridge] Engine started successfully');
    return true;
  }

  /**
   * Stop playback, kill the engine, and reset state.
   */
  async stopEngine(): Promise<void> {
    // Send stop command if client is available and playing
    if (this.client && this.isPlaying) {
      try {
        const resp = await this.client.stop();
        console.log(`[EngineBridge] stop: ${resp.ok ? 'OK' : 'FAILED'} ${resp.message}`);
      } catch (err) {
        console.warn(`[EngineBridge] stop command error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Force-kill the process regardless
    this.killEngine();
    this.mainWindow.webContents.send('playback-status', { status: 'stopped' });
  }

  /**
   * Play a CSD string — compile and start performance.
   * Destroys any existing engine and starts fresh.
   * Uses a lock to prevent concurrent playback attempts.
   */
  async playCSD(csd: string): Promise<boolean> {
    // Prevent concurrent playback
    if (this.playbackLock) {
      console.warn('[EngineBridge] Playback already in progress, ignoring');
      return false;
    }
    this.playbackLock = true;

    try {
      // Destroy existing engine and start fresh
      await this.stopEngine();

      const started = await this.startEngine();
      if (!started) return false;
      if (!this.client) return false;

      const { orchestra, score, options } = parseCSD(csd);

      console.log(`[EngineBridge] CSD: ${csd.length} bytes`);
      console.log(`[EngineBridge] Options: ${JSON.stringify(options)}`);
      console.log(`[EngineBridge] Orchestra: ${orchestra?.length || 0} chars`);
      if (orchestra) console.log(`[EngineBridge] Orchestra preview:\n${orchestra.substring(0, 200)}`);
      console.log(`[EngineBridge] Score: ${score?.length || 0} chars`);

      // Check if we have anything to play
      if (!orchestra && !score) {
        console.warn('[EngineBridge] Empty CSD — no orchestra or score to play');
        this.mainWindow.webContents.send('playback-status', {
          status: 'error',
          message: 'No instruments or score events to play',
        });
        return false;
      }

      // Set options (skip ones that cause errors)
      for (const opt of options) {
        console.log(`[EngineBridge] setOption: ${opt}`);
        try {
          const resp = await this.client.setOption(opt);
          if (!resp.ok) {
            console.warn(`[EngineBridge] setOption skipped: ${opt} — ${resp.message}`);
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
    } finally {
      this.playbackLock = false;
    }
  }

  /**
   * Stop playback. Kills the engine and resets state.
   */
  async stopPlayback(): Promise<void> {
    if (!this.isPlaying && !this.client) {
      // Nothing to stop
      this.mainWindow.webContents.send('playback-status', { status: 'stopped' });
      return;
    }

    await this.stopEngine();
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
    this.playbackLock = false;
    this.killEngine();
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
