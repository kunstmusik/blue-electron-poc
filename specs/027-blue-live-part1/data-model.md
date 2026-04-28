# Data Model: Blue Live Part 1

## Entity: BlueLiveEngineSession

- **Purpose**: Main-process runtime state for the separate Blue Live blue-engine instance.
- **Fields**:
  - `status: 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error'`
  - `message: string`
  - `projectRevision: number | null`
  - `sessionId: number`
  - `outputTabName: 'Csound (Blue Live)'`
- **Relationships**:
  - Owns or references one independent engine bridge/client/process.
  - Reads canonical `BlueData` when starting or recompiling.
- **Validation**:
  - At most one Blue Live session can be starting/running at a time.
  - Must not reuse realtime playback ports, shared-memory names, or lifecycle state.
- **State Transitions**:
  1. `idle` -> `starting` when toolbar toggle or Recompile requests start.
  2. `starting` -> `running` after CSD/options compile and engine start succeeds.
  3. `running` -> `stopping` when toggle stop, recompile, project switch, or quit requests stop.
  4. `stopping` -> `stopped` after engine cleanup.
  5. Any active state -> `error` on generation, spawn, connect, compile, or start failure.

## Entity: LiveData

- **Purpose**: Project-owned Blue Live configuration matching Java Blue XML.
- **Fields**:
  - `commandLine: string`
  - `commandLineEnabled: boolean`
  - `commandLineOverride: boolean`
  - `tempo: number`
  - `repeat: number`
  - `repeatEnabled: boolean`
  - `liveCodeText: string`
  - `liveObjectBins: LiveObjectBins`
  - `liveObjectSets: LiveObjectSetList`
- **Relationships**:
  - Stored on `BlueData`.
  - `liveObjectSets` references live objects contained in `liveObjectBins` by `uniqueId`.
- **Validation**:
  - `tempo` must be positive.
  - `repeat` must be positive.
  - Missing command-line text normalizes to an empty string.
  - Old Java XML with direct `soundObject` or `liveObject` children must upgrade into bins.

## Entity: LiveObjectBins

- **Purpose**: Java-compatible two-dimensional Live Space grid.
- **Fields**:
  - `columns: number`
  - `rows: number`
  - `cells: Array<Array<LiveObject | null>>`
- **Relationships**:
  - Each cell may reference one `LiveObject`.
  - Saved sets refer to objects inside this grid by `uniqueId`.
- **Validation**:
  - `columns >= 1`
  - `rows >= 1`
  - Row/column insert/remove operations preserve existing cells in Java order.
  - Removing a row/column may orphan saved-set references; load/save and UI must ignore missing references safely.

## Entity: LiveObject

- **Purpose**: One live-cell object wrapping a preserved project SoundObject and trigger metadata.
- **Fields**:
  - `uniqueId: string`
  - `enabled: boolean`
  - `keyTrigger: number`
  - `midiTrigger: number`
  - `soundObject: SoundObject | null`
  - renderer snapshot fields: `displayName`, `soundObjectType`, `hasSoundObject`
- **Relationships**:
  - Owned by exactly one LiveObjectBins cell.
  - May be referenced by one or more LiveObjectSets.
- **Validation**:
  - `uniqueId` must be stable across save/reopen.
  - `keyTrigger` and `midiTrigger` default to `-1` when unset.
  - SoundObject XML must be preserved through existing SoundObject load/save rules.

## Entity: LiveObjectSet

- **Purpose**: Named saved enabled-state collection for Live Space.
- **Fields**:
  - `name: string`
  - `liveObjectIds: string[]`
- **Relationships**:
  - References LiveObjects in LiveObjectBins by stable `uniqueId`.
- **Validation**:
  - Missing live object references are ignored on load/apply.
  - Newly captured sets receive Java-compatible default names such as `Set N`.

## Entity: BlueLiveSnapshot

- **Purpose**: Renderer-visible project Blue Live state.
- **Fields**:
  - `liveData: LiveDataSnapshot`
  - `engine: BlueLiveEngineSessionSnapshot`
  - `deferred: { midiInput: true; scoPad: true; soundObjectEditors: true }`
- **Relationships**:
  - Included in or fetched alongside the existing `ProjectEditorSnapshot`.
- **Validation**:
  - Snapshot must reset when no project is loaded.
  - Snapshot must be replaced on project switch.

## Entity: BlueLivePatch

- **Purpose**: Explicit mutation contract for LiveData edits from the renderer.
- **Variants**:
  - `updateOptions` with command-line fields.
  - `updateTempoRepeat` with tempo, repeat, and repeat-enabled fields.
  - `updateLiveCodeText` with text.
  - `toggleLiveObjectEnabled` by column/row or unique id.
  - `setLiveObjectEnabled` by column/row or unique id.
  - `insertLiveObjectRow`, `removeLiveObjectRow`, `insertLiveObjectColumn`, `removeLiveObjectColumn`.
  - `captureEnabledSet`, `renameSet`, `removeSet`, `moveSet`, `applySet`.
  - Future/deferred variants for add/edit SoundObject, MIDI trigger capture, and SCO Pad are not part of this spec.
- **Validation**:
  - Empty patches are invalid.
  - Bounds-check row/column indices.
  - `applySet` must update enabled state only for objects currently present in bins.

## Entity: BlueLiveCsdGenerationResult

- **Purpose**: Generated CSD and runtime options needed to start Blue Live.
- **Fields**:
  - `csdText: string`
  - `options: string[]`
  - `macros: ['BLUE_LIVE']`
  - `parameters?: Parameter[]`
  - `stringChannels?: StringChannel[]`
  - `tempoMap: null`
- **Relationships**:
  - Generated from canonical `BlueData` and `LiveData`.
  - Consumed by the BlueLiveEngineSession.
- **Validation**:
  - Must include the `blueAllNotesOff` instrument.
  - Must not include ordinary score timeline output from non-live rendering.
  - Must honor command-line enabled/override behavior as closely as blue-engine option handling allows.

## Entity: EvaluateCodeRequest

- **Purpose**: Main-process command to route selected editor text to the active engine.
- **Fields**:
  - `editorKind: 'orc' | 'sco'`
  - `text: string`
  - `sourcePanelId: 'GlobalOrchestraTopComponent' | 'GlobalScoreTopComponent' | 'BlueLiveTopComponent'`
- **Relationships**:
  - Reads Blue Live and realtime engine status in the main process.
- **Validation**:
  - Trimmed text must be non-empty.
  - Route to Blue Live when running; otherwise route to realtime when playing; otherwise return no-op/disabled result.

## Entity: SettingsWindowState

- **Purpose**: Runtime state for the modal Settings BrowserWindow.
- **Fields**:
  - `isOpen: boolean`
  - `selectedCategory: 'MIDI' | 'OSC'`
  - `categories: ['MIDI', 'OSC']`
- **Relationships**:
  - Owned by Electron main process window management.
  - Renders a dedicated settings surface in the renderer bundle.
- **Validation**:
  - Repeated Settings commands focus the existing settings window instead of creating duplicates.
  - Closing the Settings window clears the main-process reference.

## State Flows

### Blue Live Toggle Flow

1. Renderer toolbar requests `toggleBlueLive`.
2. Main process validates a loaded project and current Blue Live state.
3. If running, main stops the Blue Live engine session.
4. If stopped, main generates Blue Live CSD from canonical `BlueData`, starts the separate engine session, compiles, starts, and emits status/output events.
5. Renderer updates toolbar state from Blue Live status events.

### Recompile Flow

1. Renderer requests `recompileBlueLive`.
2. Main process stops any running Blue Live session.
3. Main regenerates Blue Live CSD from the current project revision.
4. Main starts a fresh Blue Live engine session and reports success/error.

### Live Space Patch Flow

1. Renderer receives LiveDataSnapshot from the project store.
2. User changes grid, enabled state, saved set, tempo, repeat, Live Code, or Options values.
3. Renderer dispatches `ProjectDocumentPatch.blueLive`.
4. Main process applies the patch to canonical `BlueData.liveData`.
5. Renderer updates local optimistic state or refreshes from the next project snapshot.

### All Notes Off Flow

1. Blue Live CSD generation includes `blueAllNotesOff`.
2. User presses `All Notes Off`.
3. Main process validates Blue Live is running.
4. Main process sends `i "blueAllNotesOff" 0 1` as score text to the Blue Live engine.

### Evaluate Code Flow

1. Supported editor determines selected text and editor kind.
2. Context menu and Cmd-Return are enabled only when selection and engine state allow evaluation.
3. Renderer sends `EvaluateCodeRequest`.
4. Main routes to Blue Live if running, else realtime if playing.
5. Main returns the route result for tests/status handling.

### Settings Flow

1. User chooses `Blue -> Settings...` or presses Cmd-,.
2. Main process creates or focuses a modal child BrowserWindow.
3. Settings renderer shows MIDI/OSC categories and placeholder editor content.
4. User closes Settings; main clears the settings window reference.
