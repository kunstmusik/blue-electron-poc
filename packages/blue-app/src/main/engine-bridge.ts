/**
 * EngineBridge — manages the blue-engine subprocess and ZMQ connection.
 * Bridges the Electron main process to the C++ blue-engine.
 *
 * Lifecycle: For each playback, a fresh engine is spawned.
 * After stop (or natural completion), the engine is force-killed.
 * A playback lock prevents concurrent operations.
 */
import { ChildProcess, spawn } from 'child_process';
import { EngineClient, AutomationCurveCode, type EngineStateSnapshot } from '@blue/engine-client';
import { BrowserWindow, dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { Parameter, TempoMap } from '@blue/data';
import { AutomationCurve, getEngineAutomationPoints } from '@blue/data';

interface AutomationTimingContext {
  renderStartTime: number;
  tempoMap?: TempoMap | null;
}

interface PendingTerminalStateCandidate {
  snapshot: EngineStateSnapshot;
  firstSeenAt: number;
}

export class EngineBridge {
  private engineProcess: ChildProcess | null = null;
  private client: EngineClient | null = null;
  private mainWindow: BrowserWindow;
  private isPlaying = false;
  private enginePath: string;
  private port: number;
  private pubPort: number;
  private stderr = '';
  private playbackLock = false;
  private playbackSessionId = 0;
  private statePollingTimer: ReturnType<typeof setInterval> | null = null;
  private engineStateUnsubscribe: (() => void) | null = null;
  private awaitingPlaybackTerminalState = false;
  private lastEngineStateSequence = 0;
  private pendingPolledTerminalState: PendingTerminalStateCandidate | null = null;
  private terminalCleanupPromise: Promise<void> | null = null;

  constructor(mainWindow: BrowserWindow, enginePath?: string, port?: number, pubPort?: number) {
    this.mainWindow = mainWindow;
    this.enginePath = enginePath || 'blue-engine';
    this.port = port || 5555;
    this.pubPort = pubPort || this.port + 1;
  }

  private sendPlaybackStatus(status: 'starting' | 'playing' | 'stopping' | 'stopped' | 'error', message?: string): void {
    this.mainWindow.webContents.send('playback-status', message ? { status, message } : { status });
  }

  private clearStatePolling(): void {
    if (this.statePollingTimer) {
      clearInterval(this.statePollingTimer);
      this.statePollingTimer = null;
    }
  }

  private resetPlaybackTracking(): void {
    this.clearStatePolling();
    this.awaitingPlaybackTerminalState = false;
    this.pendingPolledTerminalState = null;
    this.lastEngineStateSequence = 0;
  }

  private detachEngineStateListener(): void {
    if (this.engineStateUnsubscribe) {
      this.engineStateUnsubscribe();
      this.engineStateUnsubscribe = null;
    }
  }

  private attachEngineStateListener(client: EngineClient): void {
    this.detachEngineStateListener();
    this.engineStateUnsubscribe = client.onEngineState((snapshot) => {
      void this.handleEngineState(snapshot, 'pubsub');
    });
  }

  private startStatePolling(sessionId: number): void {
    this.clearStatePolling();
    this.statePollingTimer = setInterval(() => {
      void this.pollEngineState(sessionId);
    }, 250);
  }

  private async pollEngineState(sessionId: number): Promise<void> {
    if (sessionId !== this.playbackSessionId || !this.client || !this.awaitingPlaybackTerminalState) {
      return;
    }

    try {
      const resp = await this.client.getEngineState();
      if (resp.ok && resp.state) {
        await this.handleEngineState(resp.state, 'poll');
      }
    } catch (error: unknown) {
      if (sessionId === this.playbackSessionId && this.awaitingPlaybackTerminalState) {
        console.warn(`[EngineBridge] getEngineState poll failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private async handleEngineState(snapshot: EngineStateSnapshot, source: 'pubsub' | 'poll'): Promise<void> {
    if (!this.awaitingPlaybackTerminalState) {
      return;
    }

    if (snapshot.sequence < this.lastEngineStateSequence) {
      return;
    }

    if (snapshot.sequence > this.lastEngineStateSequence) {
      this.lastEngineStateSequence = snapshot.sequence;
      if (snapshot.state !== 'stopped') {
        this.pendingPolledTerminalState = null;
      }
    }

    if (snapshot.state !== 'stopped') {
      return;
    }

    if (source === 'pubsub') {
      this.pendingPolledTerminalState = null;
      await this.finalizePlaybackFromEngine(snapshot, 'pubsub');
      return;
    }

    const now = Date.now();
    if (!this.pendingPolledTerminalState ||
        this.pendingPolledTerminalState.snapshot.sequence !== snapshot.sequence) {
      this.pendingPolledTerminalState = { snapshot, firstSeenAt: now };
      return;
    }

    if (now - this.pendingPolledTerminalState.firstSeenAt >= 400) {
      await this.finalizePlaybackFromEngine(snapshot, 'poll');
    }
  }

  private describeTerminalState(snapshot: EngineStateSnapshot, source: 'pubsub' | 'poll'): {
    status: 'stopped' | 'error';
    message: string;
  } {
    const sourceSuffix = source === 'poll' ? ' (reconciled via poll)' : '';

    switch (snapshot.stopReason) {
      case 'completed':
        return { status: 'stopped', message: `Playback finished${sourceSuffix}` };
      case 'stop-requested':
        return { status: 'stopped', message: `Playback stopped${sourceSuffix}` };
      case 'destroyed':
        return { status: 'stopped', message: `Playback stopped${sourceSuffix}` };
      case 'error':
        return {
          status: 'error',
          message: snapshot.lastError
            ? `Engine error: ${snapshot.lastError}${sourceSuffix}`
            : `Engine error${sourceSuffix}`,
        };
      case 'none':
      default:
        return { status: 'stopped', message: `Playback stopped${sourceSuffix}` };
    }
  }

  private async teardownClient(): Promise<void> {
    const client = this.client;
    this.client = null;
    this.detachEngineStateListener();

    if (!client) {
      return;
    }

    try {
      await client.disconnect();
    } catch (error: unknown) {
      console.warn(`[EngineBridge] client disconnect failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private killEngineProcess(): void {
    if (this.engineProcess && !this.engineProcess.killed) {
      try {
        this.engineProcess.kill('SIGKILL');
      } catch {
        // Process already dead
      }
    }

    this.engineProcess = null;
  }

  private async resetEngineResources(): Promise<void> {
    this.resetPlaybackTracking();
    await this.teardownClient();
    this.killEngineProcess();
    this.isPlaying = false;
    this.terminalCleanupPromise = null;
  }

  private async finalizePlaybackFromEngine(snapshot: EngineStateSnapshot, source: 'pubsub' | 'poll'): Promise<void> {
    if (!this.awaitingPlaybackTerminalState) {
      return;
    }

    if (this.terminalCleanupPromise) {
      return this.terminalCleanupPromise;
    }

    this.awaitingPlaybackTerminalState = false;
    this.clearStatePolling();
    this.pendingPolledTerminalState = null;
    const { status, message } = this.describeTerminalState(snapshot, source);

    this.terminalCleanupPromise = (async () => {
      this.isPlaying = false;
      await this.teardownClient();
      this.killEngineProcess();
      this.sendPlaybackStatus(status, message);
    })().finally(() => {
      this.terminalCleanupPromise = null;
    });

    return this.terminalCleanupPromise;
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
   * Does NOT send playback status.
   */
  private async killEngine(): Promise<void> {
    await this.resetEngineResources();
  }

  /**
   * Start a fresh blue-engine process and connect via ZMQ.
   */
  async startEngine(): Promise<boolean> {
    // Ensure no leftover process
    await this.killEngine();

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

    // Use unique port and shm name per instance to avoid stale shm collisions
    const shmName = `blue-engine-${Date.now()}`;

    this.stderr = '';
    console.log(`[EngineBridge] Starting: ${enginePath} --port ${this.port} --pub-port ${this.pubPort} --shm ${shmName}`);

    // Spawn blue-engine with unique shm name
    this.engineProcess = spawn(enginePath, ['--port', `${this.port}`, '--pub-port', `${this.pubPort}`, '--shm', shmName], {
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
      const awaitingTerminalState = this.awaitingPlaybackTerminalState;
      const stderrMessage = this.stderr.trim();
      const exitingClient = this.client;

      this.resetPlaybackTracking();
      this.detachEngineStateListener();
      this.engineProcess = null;
      this.client = null;
      this.isPlaying = false;

      if (exitingClient) {
        void exitingClient.disconnect(false).catch(() => undefined);
      }

      if (awaitingTerminalState && !this.terminalCleanupPromise) {
        const detail = stderrMessage
          ? `Engine error: ${stderrMessage.split('\n').pop()}`
          : `Engine exited before publishing terminal playback state (code: ${code}, signal: ${signal})`;
        this.sendPlaybackStatus('error', detail);
      }
    });

    this.engineProcess.on('error', (err) => {
      console.error(`[EngineBridge] Spawn error: ${err.message}`);
      this.isPlaying = false;
      this.mainWindow.webContents.send('playback-error', `Engine error: ${err.message}`);
    });

    // Wait for engine to start
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if process exited (killed by us OR exited on its own)
    if (!this.engineProcess || this.engineProcess.killed || this.engineProcess.exitCode !== null) {
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
        pubEndpoint: `tcp://localhost:${this.pubPort}`,
        timeout: 10000,
      });
      await this.client.connect();
      this.attachEngineStateListener(this.client);
    } catch (err: unknown) {
      console.error(`[EngineBridge] ZMQ connect failed: ${err instanceof Error ? err.message : String(err)}`);
      await this.killEngine();
      return false;
    }

    // Initialize engine
    try {
      const createResp = await this.client.createEngine();
      if (!createResp.ok) {
        console.error(`[EngineBridge] createEngine failed: ${createResp.message}`);
        await this.killEngine();
        return false;
      }

      const optResp = await this.client.setOption('-d');
      if (!optResp.ok) {
        console.warn(`[EngineBridge] setOption(-d) warning: ${optResp.message}`);
      }
    } catch (err: unknown) {
      console.error(`[EngineBridge] Engine init failed: ${err instanceof Error ? err.message : String(err)}`);
      await this.killEngine();
      return false;
    }

    console.log('[EngineBridge] Engine started successfully');
    return true;
  }

  /**
   * Stop playback, kill the engine, and reset state.
   */
  async stopEngine(emitStatus = true, message?: string): Promise<void> {
    // Send stop command if client is available and playing
    if (this.client && this.isPlaying) {
      if (emitStatus) {
        this.sendPlaybackStatus('stopping', message ?? 'Stopping playback...');
      }

      try {
        const resp = await this.client.stop();
        console.log(`[EngineBridge] stop: ${resp.ok ? 'OK' : 'FAILED'} ${resp.message}`);
        if (!resp.ok) {
          await this.killEngine();
          if (emitStatus) {
            this.sendPlaybackStatus('error', `Engine stop failed: ${resp.message}`);
          }
        }
      } catch (err) {
        console.warn(`[EngineBridge] stop command error: ${err instanceof Error ? err.message : String(err)}`);
        await this.killEngine();
        if (emitStatus) {
          this.sendPlaybackStatus('error', err instanceof Error ? err.message : String(err));
        }
      }

      return;
    }

    await this.killEngine();
    if (emitStatus) {
      this.sendPlaybackStatus('stopped', message);
    }
  }

  /**
   * Play a CSD string — compile and start performance.
   * Destroys any existing engine and starts fresh.
   * Uses a lock to prevent concurrent playback attempts.
   */
  async playCSD(
    csd: string,
    parameters?: Parameter[],
    automationTiming?: AutomationTimingContext,
  ): Promise<boolean> {
    // Prevent concurrent playback
    if (this.playbackLock) {
      console.warn('[EngineBridge] Playback already in progress, ignoring');
      return false;
    }
    this.playbackLock = true;

    try {
      const started = await this.startEngine();
      if (!started) return false;
      if (!this.client) return false;

      const { orchestra, score, options } = parseCSD(csd);

      console.log(`[EngineBridge] CSD: ${csd.length} bytes`);
      console.log(`[EngineBridge] Options: ${JSON.stringify(options)}`);
      console.log(`[EngineBridge] Orchestra: ${orchestra?.length || 0} chars`);
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

      // Compile orchestra first so Csound exports control channels before
      // fixed values and automation definitions are applied through the engine.
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

      // Send automation definitions after compileOrc so exported channels exist.
      if (parameters && parameters.length > 0) {
        await this.sendAutomationDefinitions(this.client, parameters, automationTiming);
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
      this.playbackSessionId += 1;
      this.awaitingPlaybackTerminalState = true;
      this.pendingPolledTerminalState = null;
      this.lastEngineStateSequence = 0;
      this.startStatePolling(this.playbackSessionId);
      this.sendPlaybackStatus('playing', 'Playing via blue-engine');

      return true;
    } finally {
      this.playbackLock = false;
    }
  }

  /**
   * Send automation definitions from all Parameters to the engine.
   * Called after compileOrc so the engine can bind them to exported channels.
   */
  private async sendAutomationDefinitions(
    client: EngineClient,
    parameters: Parameter[],
    automationTiming?: AutomationTimingContext,
  ): Promise<void> {
    // Clear any stale automation from previous playbacks
    try {
      await client.clearAutomations();
    } catch (err) {
      console.warn(`[EngineBridge] clearAutomations failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    for (const param of parameters) {
      const varName = param.getCompilationVarName();
      if (!varName) continue;

      if (param.isAutomationEnabled() && param.getPoints().length >= 2) {
        // Map AutomationCurve enum to protocol codes
        const curveCode = mapAutomationCurve(param.getCurve());

        // Java stores automation points in beat time. blue-engine currently
        // evaluates automation in elapsed seconds, so convert the point times
        // before sending them over the protocol.
        const points = getEngineAutomationPoints(
          param,
          automationTiming?.renderStartTime ?? 0,
          automationTiming?.tempoMap,
        );

        try {
          const resp = await client.createAutomation(
            varName,
            curveCode,
            true, // enabled
            param.getResolution(),
            param.getResolutionScale(),
            param.isHighPrecision(),
            points,
          );
          if (!resp.ok) {
            console.warn(`[EngineBridge] createAutomation(${varName}) failed: ${resp.message}`);
          }
        } catch (err) {
          console.warn(`[EngineBridge] createAutomation(${varName}) error: ${err instanceof Error ? err.message : String(err)}`);
        }
      } else {
        // Non-automated parameter: create/update the channel value. The engine
        // treats createChannel as a compatible "set or stage initial value"
        // command and falls back to setChannel when the channel already exists.
        try {
          const fixedVal = param.getFixedValue();
          const resp = await client.createChannel(varName, fixedVal);
          if (!resp.ok) {
            // Channel might already exist after orchestra export, try setChannel
            await client.setChannel(varName, fixedVal);
          }
        } catch (err) {
          console.warn(`[EngineBridge] createChannel(${varName}) error: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    console.log(`[EngineBridge] Sent ${parameters.length} parameter definitions`);
  }

  /**
   * Stop playback. Kills the engine and resets state.
   */
  async stopPlayback(): Promise<void> {
    if (!this.isPlaying && !this.client) {
      // Nothing to stop
      this.sendPlaybackStatus('stopped');
      return;
    }

    this.playbackLock = false; // Release lock so next playCSD can proceed
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

/**
 * Map blue-data AutomationCurve enum to blue-engine protocol AutomationCurveCode.
 */
function mapAutomationCurve(curve: AutomationCurve): AutomationCurveCode {
  switch (curve) {
    case AutomationCurve.STEP: return AutomationCurveCode.STEP;
    case AutomationCurve.LINEAR: return AutomationCurveCode.LINEAR;
    case AutomationCurve.EXPONENTIAL: return AutomationCurveCode.EXPONENTIAL;
    default: return AutomationCurveCode.LINEAR;
  }
}
