# Contract: Blue Live, Settings, and Evaluate Code Surfaces

## Scope

This contract describes the TypeScript surface expected between Electron main, preload, renderer stores/components, and `@blue/data` for Blue Live Part 1. Names may be refined during implementation, but the behavior and ownership boundaries should remain stable.

## Renderer API Additions

Extend `window.blueAPI` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`.

```ts
export type BlueLiveStatus = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

export interface BlueLiveStatusSnapshot {
  status: BlueLiveStatus;
  running: boolean;
  message?: string;
  sessionId: number;
  projectRevision?: number | null;
}

export interface EvaluateCodeRequest {
  editorKind: 'orc' | 'sco';
  text: string;
  sourcePanelId: 'GlobalOrchestraTopComponent' | 'GlobalScoreTopComponent' | 'BlueLiveTopComponent';
}

export interface EvaluateCodeResult {
  routedTo: 'blueLive' | 'realtime' | 'none';
  ok: boolean;
  message?: string;
}

interface BlueAPI {
  toggleBlueLive(): Promise<BlueLiveStatusSnapshot>;
  stopBlueLive(): Promise<BlueLiveStatusSnapshot>;
  recompileBlueLive(): Promise<BlueLiveStatusSnapshot>;
  sendBlueLiveAllNotesOff(): Promise<{ ok: boolean; message?: string }>;
  getBlueLiveStatus(): Promise<BlueLiveStatusSnapshot>;
  evaluateCode(request: EvaluateCodeRequest): Promise<EvaluateCodeResult>;
  openSettingsWindow(): Promise<void>;
  onBlueLiveStatus(callback: (snapshot: BlueLiveStatusSnapshot) => void): () => void;
}
```

## Main Process IPC Channels

All project-dependent handlers must safely reject or return a stopped/error status when no project is loaded.

- `blue-live:toggle`
  - Starts Blue Live when stopped; stops Blue Live when running or starting if cancellation is supported.
  - Returns `BlueLiveStatusSnapshot`.
- `blue-live:stop`
  - Stops only the Blue Live engine session.
  - Returns `BlueLiveStatusSnapshot`.
- `blue-live:recompile`
  - Stops any running Blue Live session, regenerates Blue Live CSD from canonical `BlueData`, and starts a fresh session.
  - Returns `BlueLiveStatusSnapshot`.
- `blue-live:all-notes-off`
  - Sends `i "blueAllNotesOff" 0 1` to the running Blue Live engine.
  - Returns `{ ok: boolean; message?: string }`.
- `blue-live:get-status`
  - Returns current Blue Live status without changing engine state.
- `engine:evaluate-code`
  - Accepts `EvaluateCodeRequest`.
  - Routes to Blue Live if running; otherwise realtime if playing; otherwise returns `{ routedTo: 'none', ok: false }`.
- `settings:open`
  - Opens or focuses the modal Settings BrowserWindow.

## Main Process Events

- `blue-live-status`
  - Payload: `BlueLiveStatusSnapshot`.
  - Emitted for start, running, stop, and error transitions.
- `engine-output`
  - Existing output event may be reused with `tabName: 'Csound (Blue Live)'`.
  - Blue Live output must not be mixed into the realtime `Csound` tab.
- `engine-output-reset`
  - Existing reset event may be reused with `tabName: 'Csound (Blue Live)'` before Blue Live start/recompile.
- `engine-output-select`
  - Existing select event may be reused with `tabName: 'Csound (Blue Live)'` when Blue Live starts.

## Project Document Contract Extension

Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`.

```ts
export interface ProjectEditorSnapshot {
  blueLive?: BlueLiveProjectSnapshot;
}

export interface BlueLiveProjectSnapshot {
  commandLine: string;
  commandLineEnabled: boolean;
  commandLineOverride: boolean;
  tempo: number;
  repeat: number;
  repeatEnabled: boolean;
  liveCodeText: string;
  bins: LiveObjectBinsSnapshot;
  sets: LiveObjectSetSnapshot[];
}

export interface LiveObjectBinsSnapshot {
  columns: number;
  rows: number;
  cells: Array<Array<LiveObjectCellSnapshot | null>>;
}

export interface LiveObjectCellSnapshot {
  uniqueId: string;
  enabled: boolean;
  keyTrigger: number;
  midiTrigger: number;
  displayName: string;
  soundObjectType: string;
  hasSoundObject: boolean;
}

export interface LiveObjectSetSnapshot {
  name: string;
  liveObjectIds: string[];
}

export type BlueLivePatch =
  | { type: 'updateOptions'; patch: Partial<Pick<BlueLiveProjectSnapshot, 'commandLine' | 'commandLineEnabled' | 'commandLineOverride'>> }
  | { type: 'updateTempoRepeat'; patch: Partial<Pick<BlueLiveProjectSnapshot, 'tempo' | 'repeat' | 'repeatEnabled'>> }
  | { type: 'updateLiveCodeText'; text: string }
  | { type: 'setCellEnabled'; column: number; row: number; enabled: boolean }
  | { type: 'insertRow'; index: number }
  | { type: 'removeRow'; index: number }
  | { type: 'insertColumn'; index: number }
  | { type: 'removeColumn'; index: number }
  | { type: 'captureEnabledSet' }
  | { type: 'renameSet'; index: number; name: string }
  | { type: 'removeSet'; index: number }
  | { type: 'moveSet'; from: number; to: number }
  | { type: 'applySet'; index: number };

export interface ProjectDocumentPatch {
  blueLive?: BlueLivePatch;
}
```

## `@blue/data` Contract Additions

`BlueData` must expose a Blue Live CSD generation entry point that does not depend on Electron.

```ts
export interface BlueLiveCsdResult {
  csdText: string;
  parameters?: Parameter[];
  stringChannels?: StringChannel[];
}

class BlueData {
  toBlueLiveCSD(): BlueLiveCsdResult;
}
```

Requirements for `toBlueLiveCSD()`:

- Generate Java-compatible Blue Live CSD, not ordinary realtime CSD.
- Include `blueAllNotesOff`.
- Return no tempo map for Blue Live.
- Preserve existing `toCSD()` behavior.
- Keep `@blue/data` free of Node/Electron/process imports.

## Engine Bridge Contract

Either extend the existing `EngineBridge` so it can be instantiated for a named session, or create a small `BlueLiveEngineBridge` wrapper with the same lower-level engine-client behavior.

Required operations:

```ts
interface EngineEvaluationTarget {
  isRunning(): boolean;
  stop(): Promise<void>;
  playBlueLiveCSD(result: BlueLiveCsdResult, options: string[]): Promise<boolean>;
  evaluateOrchestra(text: string): Promise<{ ok: boolean; message?: string }>;
  sendScore(text: string): Promise<{ ok: boolean; message?: string }>;
}
```

Validation:

- Blue Live and realtime must use separate ports/shared-memory names.
- Blue Live start/recompile must reject concurrent starts.
- `evaluateOrchestra` and `sendScore` must be safe no-ops with an error result when the target is not running.

## Settings Window Contract

Main process:

- Keep `settingsWindow: BrowserWindow | null`.
- `openSettingsWindow()` creates a modal child of the main window when absent.
- Repeated calls focus the existing settings window.
- Closing the window clears `settingsWindow`.

Renderer settings surface:

- Left sidebar categories: `MIDI`, `OSC`.
- Right editor panel:
  - `MIDI`: placeholder content for future MIDI input/output preferences.
  - `OSC`: placeholder content for future OSC server/client preferences.
- The surface should be usable at the default modal size and should not depend on a loaded project.

## Evaluate Code Enablement Contract

Renderer enablement checks:

- Supported panel is Global Orchestra, Global Score, or Blue Live Live Code.
- Engine status from renderer stores indicates Blue Live running or realtime playback running.
- The command evaluates the selected text when non-empty.
- When no selection exists, the command evaluates the current code context:
  - Global Orchestra and Live Code use the enclosing `instr` or `opcode` block when the cursor is inside one, otherwise the current line.
  - Global Score uses the current line.

Main process routing is authoritative:

1. If Blue Live is running, route to Blue Live.
2. Else if realtime is playing, route to realtime.
3. Else return `{ routedTo: 'none', ok: false }`.

Editor-kind mapping:

- `orc` -> `evaluateOrchestra(text)`
- `sco` -> `sendScore(text)`
