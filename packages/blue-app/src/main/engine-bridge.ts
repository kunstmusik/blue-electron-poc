/**
 * EngineBridge — manages the blue-engine subprocess and ZMQ connection.
 * Bridges the Electron main process to the C++ blue-engine.
 */
import { ChildProcess, spawn } from 'child_process';
import { EngineClient } from '@blue/engine-client';
import { BrowserWindow } from 'electron';

export class EngineBridge {
  private engineProcess: ChildProcess | null = null;
  private client: EngineClient | null = null;
  private mainWindow: BrowserWindow;
  private isPlaying = false;
  private enginePath: string;
  private port: number;

  constructor(mainWindow: BrowserWindow, enginePath?: string, port?: number) {
    this.mainWindow = mainWindow;
    this.enginePath = enginePath || 'blue-engine';
    this.port = port || 5555;
  }

  /**
   * Start the blue-engine process and connect via ZMQ.
   */
  async startEngine(): Promise<boolean> {
    try {
      // Spawn blue-engine
      this.engineProcess = spawn(this.enginePath, [`--port=${this.port}`], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.engineProcess.on('exit', (code, signal) => {
        this.isPlaying = false;
        this.mainWindow.webContents.send('playback-status', {
          status: 'stopped',
          message: `Engine exited (code: ${code}, signal: ${signal})`,
        });
      });

      this.engineProcess.on('error', (err) => {
        this.isPlaying = false;
        this.mainWindow.webContents.send('playback-error', `Engine spawn error: ${err.message}`);
      });

      // Connect ZMQ client
      this.client = new EngineClient({
        endpoint: `tcp://localhost:${this.port}`,
        timeout: 10000,
      });
      await this.client.connect();

      // Initialize engine
      await this.client.createEngine();
      await this.client.setOption('-d'); // Disable display

      return true;
    } catch (err: unknown) {
      this.mainWindow.webContents.send('playback-error', `Engine start failed: ${err instanceof Error ? err.message : String(err)}`);
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
