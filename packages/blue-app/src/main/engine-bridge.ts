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
      await this.client.createEngine();
      await this.client.setOption('-d'); // Disable display

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
      } catch {
        // Ignore disconnect errors
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
   */
  async playCSD(csd: string): Promise<boolean> {
    if (!this.client) {
      // First time — start engine
      const started = await this.startEngine();
      if (!started) return false;
    }

    if (!this.client) return false;

    try {
      // Parse CSD to extract orchestra and score sections
      const { orchestra, score, options } = parseCSD(csd);

      // Set options
      for (const opt of options) {
        await this.client.setOption(opt);
      }

      // Compile orchestra
      if (orchestra) {
        await this.client.compileOrc(orchestra);
      }

      // Read score
      if (score) {
        await this.client.readScore(score);
      }

      // Start performance
      await this.client.start();
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
        await this.client.stop();
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
      await this.client.setChannel(name, value);
    }
  }

  /**
   * Get a channel value during playback.
   */
  async getChannel(name: string): Promise<number> {
    if (this.client) {
      return this.client.getChannel(name);
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
