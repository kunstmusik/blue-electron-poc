import { BrowserWindow } from 'electron';
import { EngineBridge, EngineOutputCallback } from './engine-bridge';
import type { BlueData } from '@blue/data';
import { LiveData, mapMidiTrigger } from '@blue/data';
import { formatRenderCommandLine, writeTempCsdSnapshot } from './render-command';
import type {
  BlueLiveNoteTriggerRequest,
  BlueLiveNoteTriggerResult,
} from '../shared/project-editor';

export type BlueLiveEngineStatus = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

export interface BlueLiveStatusSnapshot {
  status: BlueLiveEngineStatus;
  running: boolean;
  message?: string;
  sessionId: number;
  projectRevision?: number | null;
}

export class BlueLiveEngineSession {
  private status: BlueLiveEngineStatus = 'idle';
  private message = '';
  private sessionId = 0;
  private projectRevision: number | null = null;
  private bridge: EngineBridge | null = null;
  private mainWindow: BrowserWindow;
  private enginePath: string;
  private port: number;
  private pubPort: number;
  private outputCallback: EngineOutputCallback | null = null;
  private namedInstrumentNumbers = new Map<string, number>();
  private projectDirectory: string | null = null;
  private projectData: BlueData | null = null;

  constructor(mainWindow: BrowserWindow, enginePath?: string, port = 5560, pubPort = 5561) {
    this.mainWindow = mainWindow;
    this.enginePath = enginePath || 'blue-engine';
    this.port = port;
    this.pubPort = pubPort;
  }

  private getSnapshot(): BlueLiveStatusSnapshot {
    return {
      status: this.status,
      running: this.status === 'running',
      message: this.message || undefined,
      sessionId: this.sessionId,
      projectRevision: this.projectRevision,
    };
  }

  private setStatus(status: BlueLiveEngineStatus, message?: string): void {
    this.status = status;
    this.message = message ?? '';
    this.mainWindow.webContents.send('blue-live-status', this.getSnapshot());
  }

  setOutputCallback(cb: EngineOutputCallback | null): void {
    this.outputCallback = cb;
    if (this.bridge) {
      this.bridge.setOutputCallback(cb);
    }
  }

  async start(
    data: BlueData,
    revision: number,
    projectDirectory?: string | null,
  ): Promise<BlueLiveStatusSnapshot> {
    if (this.status === 'starting' || this.status === 'running') {
      return this.getSnapshot();
    }

    this.setStatus('starting', 'Starting Blue Live...');
    this.sessionId++;
    this.projectRevision = revision;
    this.projectDirectory = projectDirectory && projectDirectory.trim().length > 0 ? projectDirectory : null;
    this.projectData = data;

    try {
      const liveData = data.getLiveData();
      const csd = data.toBlueLiveCSD();
      const { orchestra, score, options } = parseCSD(csd.csdText);
      this.namedInstrumentNumbers = resolveNamedInstrumentNumbers(orchestra);
      const runtimeScore = normalizeScoreForEngineApi(score, this.namedInstrumentNumbers);

      const liveOptions = this.buildLiveOptions(liveData, options);
      const tempCsdPath = await writeTempCsdSnapshot(csd.csdText, this.projectDirectory);

      this.outputCallback?.(
        formatRenderCommandLine(liveOptions, tempCsdPath, this.enginePath),
        'stdout',
      );

      this.bridge = new EngineBridge(this.mainWindow, this.enginePath, this.port, this.pubPort);
      this.bridge.setWorkingDirectory(this.projectDirectory);

      this.bridge.setOutputCallback((text, type) => {
        this.outputCallback?.(text, type);
      });

      const started = await this.bridge.startEngine();
      if (!started) {
        this.setStatus('error', 'Failed to start Blue Live engine');
        this.cleanup();
        return this.getSnapshot();
      }

      for (const opt of liveOptions) {
        try {
          await this.bridge['client']!.setOption(opt);
        } catch (err) {
          console.warn(`[BlueLive] setOption skipped: ${opt}`);
        }
      }

      if (orchestra) {
        const resp = await this.bridge['client']!.compileOrc(orchestra);
        if (!resp.ok) {
          this.setStatus('error', `Blue Live orchestra compile failed: ${resp.message}`);
          await this.cleanup();
          return this.getSnapshot();
        }
      }

      if (runtimeScore) {
        const resp = await this.bridge['client']!.readScore(runtimeScore);
        if (!resp.ok) {
          this.setStatus('error', `Blue Live score failed: ${resp.message}`);
          await this.cleanup();
          return this.getSnapshot();
        }
      }

      const startResp = await this.bridge['client']!.start();
      if (!startResp.ok) {
        this.setStatus('error', `Blue Live start failed: ${startResp.message}`);
        await this.cleanup();
        return this.getSnapshot();
      }

      this.setStatus('running', 'Blue Live running');
      return this.getSnapshot();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.setStatus('error', `Blue Live error: ${msg}`);
      await this.cleanup();
      return this.getSnapshot();
    }
  }

  async stop(): Promise<BlueLiveStatusSnapshot> {
    if (this.status !== 'running' && this.status !== 'starting') {
      return this.getSnapshot();
    }

    this.setStatus('stopping', 'Stopping Blue Live...');
    await this.cleanup();
    this.setStatus('stopped', 'Blue Live stopped');
    return this.getSnapshot();
  }

  async recompile(
    data: BlueData,
    revision: number,
    projectDirectory?: string | null,
  ): Promise<BlueLiveStatusSnapshot> {
    await this.stop();
    return this.start(data, revision, projectDirectory ?? this.projectDirectory);
  }

  async sendAllNotesOff(): Promise<{ ok: boolean; message?: string }> {
    const client = this.bridge?.['client'];
    if (this.status !== 'running' || !client) {
      return { ok: false, message: 'Blue Live is not running' };
    }

    try {
      const resp = await client.readScore(this.getAllNotesOffScoreEvent());
      return { ok: resp.ok, message: resp.ok ? undefined : resp.message };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  }

  async evaluateOrchestra(text: string): Promise<{ ok: boolean; message?: string }> {
    const client = this.bridge?.['client'];
    if (this.status !== 'running' || !client) {
      return { ok: false, message: 'Blue Live is not running' };
    }

    try {
      const resp = await client.compileOrc(text);
      return { ok: resp.ok, message: resp.ok ? undefined : resp.message };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  }

  async sendScore(text: string): Promise<{ ok: boolean; message?: string }> {
    const client = this.bridge?.['client'];
    if (this.status !== 'running' || !client) {
      return { ok: false, message: 'Blue Live is not running' };
    }

    try {
      const resp = await client.readScore(
        normalizeScoreForEngineApi(text, this.namedInstrumentNumbers),
      );
      return { ok: resp.ok, message: resp.ok ? undefined : resp.message };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  }

  isRunning(): boolean {
    return this.status === 'running';
  }

  async triggerNote(
    request: BlueLiveNoteTriggerRequest,
  ): Promise<BlueLiveNoteTriggerResult> {
    const client = this.bridge?.['client'];
    const projectData = this.projectData;

    if (this.status !== 'running' || !client || !projectData) {
      return { ok: false, message: 'Blue Live is not running' };
    }

    const arrangement = projectData.getArrangement().getArrangement();
    const assignment = arrangement[request.channel];
    if (!assignment) {
      return { ok: false, message: 'No instrument mapped to that channel' };
    }

    const mapped = mapMidiTrigger(projectData.getMidiInputProcessor(), {
      midiNote: request.midiNote,
      velocity: request.velocity,
      channel: request.channel,
    });

    const paddedNoteNum = this.getPaddedNoteNum(mapped.originalMidiNote);
    const arrangementId = assignment.arrangementId;
    const scoreText = request.type === 'noteOff'
      ? `i-${arrangementId}.${paddedNoteNum} 0 0`
      : `i${arrangementId}.${paddedNoteNum} 0 -1 ${mapped.mappedPitchValue} ${mapped.mappedAmplitudeValue}`;

    try {
      const resp = await client.readScore(
        normalizeScoreForEngineApi(scoreText, this.namedInstrumentNumbers),
      );
      return {
        ok: resp.ok,
        message: resp.ok ? undefined : resp.message,
        submittedScoreText: scoreText,
      };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
        submittedScoreText: scoreText,
      };
    }
  }

  getStatus(): BlueLiveStatusSnapshot {
    return this.getSnapshot();
  }

  private async cleanup(): Promise<void> {
    this.namedInstrumentNumbers.clear();
    this.projectData = null;
    if (this.bridge) {
      const bridge = this.bridge;
      this.bridge = null;
      await bridge.killAndWait();
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  private getAllNotesOffScoreEvent(): string {
    const instrNum = this.namedInstrumentNumbers.get('blueAllNotesOff');
    if (instrNum !== undefined) {
      return `i ${instrNum} 0 1`;
    }
    return 'i "blueAllNotesOff" 0 1';
  }

  private getPaddedNoteNum(noteNum: number): string {
    const noteStr = String(noteNum);
    let buffer = '';
    if (noteStr.length < 3) {
      buffer += '0';
    }
    if (noteStr.length < 2) {
      buffer += '1';
    }
    buffer += noteStr;
    return buffer;
  }

  private buildLiveOptions(liveData: LiveData, csdOptions: string[]): string[] {
    const options = [...csdOptions];

    if (liveData.isCommandLineEnabled()) {
      if (liveData.isCommandLineOverride()) {
        const cmdLine = liveData.getCommandLine().trim();
        if (cmdLine) {
          options.length = 0;
          options.push(...cmdLine.split(/\s+/));
        }
      } else {
        const cmdLine = liveData.getCommandLine().trim();
        if (cmdLine) {
          options.push(...cmdLine.split(/\s+/));
        }
      }
    }

    if (!options.includes('-Lstdin')) {
      options.push('-Lstdin');
    }
    if (!options.includes('--omacro:BLUE_LIVE=1')) {
      options.push('--omacro:BLUE_LIVE=1');
    }
    if (!options.includes('--smacro:BLUE_LIVE=1')) {
      options.push('--smacro:BLUE_LIVE=1');
    }

    return options;
  }
}

export function resolveNamedInstrumentNumbers(orchestra: string): Map<string, number> {
  const namedNumbers = new Map<string, number>();
  let maxNumericId = 0;
  const namedIdsInOrder: string[] = [];

  for (const line of orchestra.split('\n')) {
    const match = line.trim().match(/^instr\s+("[^"]+"|[^\s;]+)/);
    if (!match) {
      continue;
    }

    const rawId = match[1] ?? '';
    const instrId = rawId.startsWith('"') && rawId.endsWith('"')
      ? rawId.slice(1, -1)
      : rawId;

    if (/^\d+$/.test(instrId)) {
      maxNumericId = Math.max(maxNumericId, Number.parseInt(instrId, 10));
      continue;
    }

    namedIdsInOrder.push(instrId);
  }

  let nextInstrumentNumber = maxNumericId + 1;
  for (const namedId of namedIdsInOrder) {
    if (!namedNumbers.has(namedId)) {
      namedNumbers.set(namedId, nextInstrumentNumber);
      nextInstrumentNumber += 1;
    }
  }

  return namedNumbers;
}

export function normalizeScoreForEngineApi(
  score: string,
  namedInstrumentNumbers: ReadonlyMap<string, number>,
): string {
  if (namedInstrumentNumbers.size === 0 || !score.trim()) {
    return score;
  }

  return score
    .split('\n')
    .map((line) => {
      const match = line.match(/^(\s*i\s*)"([^"]+)"(\s+.*)$/);
      if (!match) {
        return line;
      }

      const instrumentName = match[2] ?? '';
      const instrumentNumber = namedInstrumentNumbers.get(instrumentName);
      if (instrumentNumber === undefined) {
        return line;
      }

      return `${match[1]}${instrumentNumber}${match[3]}`;
    })
    .join('\n');
}

function parseCSD(csd: string): { orchestra: string; score: string; options: string[] } {
  const options: string[] = [];
  let orchestra = '';
  let score = '';

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

  const orcMatch = csd.match(/<CsInstruments>([\s\S]*?)<\/CsInstruments>/);
  if (orcMatch) {
    orchestra = orcMatch[1].trim();
  }

  const scoMatch = csd.match(/<CsScore>([\s\S]*?)<\/CsScore>/);
  if (scoMatch) {
    score = scoMatch[1].trim();
  }

  return { orchestra, score, options };
}
