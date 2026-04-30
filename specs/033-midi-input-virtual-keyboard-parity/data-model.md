# Data Model: MIDI Input Panel And Virtual Keyboard Parity

## Entity: MidiInputProcessorSnapshot

- **Purpose**: Renderer-facing serializable representation of the project's MIDI input processor settings.
- **Fields**:
  - `keyMapping: string`
  - `velocityMapping: string`
  - `pitchConstant: string`
  - `ampConstant: string`
  - `scale: MidiScaleSnapshot | null`
- **Relationships**:
  - Stored on the canonical `BlueData` document through `MidiInputProcessor`.
  - Included in `ProjectEditorSnapshot` for renderer editing.
- **Validation**:
  - Unknown mapping strings must round-trip without loss.
  - Empty constants are valid and must remain empty rather than being normalized away.
  - Missing scale data is allowed and should degrade to `null` or the Java default presentation.

## Entity: MidiScaleSnapshot

- **Purpose**: Structured scale data suitable for renderer editing and safe `.blue` round-trip.
- **Fields**:
  - `scaleName: string`
  - `baseFrequency: number`
  - `octave: number`
  - `ratios: number[]`
- **Relationships**:
  - Derived from the existing `Scale` model in `@blue/data`.
  - Embedded in `MidiInputProcessorSnapshot`.
- **Validation**:
  - `ratios.length >= 1`
  - `baseFrequency > 0`
  - `octave > 0`
  - Save/reopen must preserve the same scale structure.

## Entity: MidiInputPatch

- **Purpose**: Explicit mutation contract for renderer edits to project MIDI input settings.
- **Variants**:
  - `updateKeyMapping` with `value: string`
  - `updateVelocityMapping` with `value: string`
  - `updatePitchConstant` with `value: string`
  - `updateAmpConstant` with `value: string`
  - `updateScale` with `scale: MidiScaleSnapshot | null`
- **Relationships**:
  - Routed through `ProjectDocumentPatch` and applied to canonical `BlueData` in the main process.
- **Validation**:
  - Empty patches are invalid.
  - Unknown mapping values must be preserved if already present in the project.

## Entity: VirtualKeyboardSessionState

- **Purpose**: Renderer-local runtime state for the Virtual Keyboard panel.
- **Fields**:
  - `channel: number`
  - `octaveOffset: number`
  - `velocity: number`
  - `velocityOverrideEnabled: boolean`
  - `pressedNotes: Array<{ midiNote: number; channel: number; source: 'mouse' | 'computer' }>`
  - `isFocused: boolean`
- **Relationships**:
  - Read by `VirtualKeyboardPanel` and related hooks/components.
  - Drives outgoing `BlueLiveNoteTriggerRequest` messages.
- **Validation**:
  - `channel` must stay in the Java-compatible range.
  - `velocity` must stay within MIDI `0-127`.
  - `pressedNotes` must be cleared on blur, Blue Live stop, or All Notes Off.
- **Persistence**:
  - This state is transient and is not saved into the project document.

## Entity: BlueLiveNoteTriggerRequest

- **Purpose**: Renderer-to-main request for one Virtual Keyboard note action.
- **Fields**:
  - `type: 'noteOn' | 'noteOff'`
  - `midiNote: number`
  - `velocity: number`
  - `channel: number`
  - `source: 'mouse' | 'computer'`
- **Relationships**:
  - Sent from the Virtual Keyboard panel to Electron main.
  - Consumed by the Blue Live note-trigger routing path.
- **Validation**:
  - `0 <= midiNote <= 127`
  - `0 <= velocity <= 127`
  - Requests must be rejected safely when no project is loaded or Blue Live is not running.

## Entity: MidiTriggerMappingResult

- **Purpose**: Pure derived output produced from `MidiInputProcessor` settings and an incoming note event before engine submission.
- **Fields**:
  - `originalMidiNote: number`
  - `originalVelocity: number`
  - `channel: number`
  - `mappedPitchValue: string`
  - `mappedAmplitudeValue: string`
- **Relationships**:
  - Produced by a pure helper in `@blue/data`.
  - Consumed by `blue-live-engine.ts` to format Java-compatible score events.
- **Validation**:
  - Must reflect the active project's `keyMapping`, `velocityMapping`, constants, and scale.
  - Must clamp or reject out-of-range note inputs safely.

## Entity: BlueLiveNoteTriggerResult

- **Purpose**: Main-process response for one note trigger request.
- **Fields**:
  - `ok: boolean`
  - `message?: string`
  - `submittedScoreText?: string`
- **Relationships**:
  - Returned to the renderer for error handling and tests.
- **Validation**:
  - Must not report success if Blue Live rejected the score submission.

## Entity: MidiWorkbenchPanels

- **Purpose**: The renderer surfaces for `MidiInputPanelTopComponent` and `VirtualKeyboardTopComponent` inside the existing workbench.
- **Fields**:
  - `midiInputPanelId: 'MidiInputPanelTopComponent'`
  - `virtualKeyboardPanelId: 'VirtualKeyboardTopComponent'`
  - `presentation: 'properties' | 'output'`
- **Relationships**:
  - Registered already in `workbench-menu.ts`.
  - Routed from `DockviewPanel.tsx` to real panel components by this feature.
- **Validation**:
  - Neither panel may fall through to `PlaceholderPanel` after implementation.

## State Flows

### Project Snapshot Flow

1. Main process loads or updates canonical `BlueData`.
2. `createProjectEditorSnapshot(...)` serializes `MidiInputProcessor` into `MidiInputProcessorSnapshot`.
3. Renderer project store receives the snapshot and makes it available to the MIDI Input panel.

### MIDI Input Edit Flow

1. User changes a MIDI Input control.
2. Renderer dispatches `ProjectDocumentPatch.midiInput`.
3. Main process applies the patch to canonical `BlueData.getMidiInputProcessor()`.
4. Renderer updates optimistically and later reconciles with the refreshed snapshot.

### Virtual Keyboard Note Flow

1. User clicks a key or presses a mapped computer key while the Virtual Keyboard panel is active.
2. Renderer updates `VirtualKeyboardSessionState` and sends `BlueLiveNoteTriggerRequest`.
3. Main reads the canonical project MIDI input settings.
4. A pure `@blue/data` helper derives Java-compatible pitch and velocity values.
5. Blue Live engine formats and submits the resulting score event.
6. Renderer clears the matching pressed note when the note-off path completes or on local release.

### All Notes Off Flow

1. User presses `All Notes Off` in the Virtual Keyboard or toolbar.
2. Renderer clears local `pressedNotes`.
3. Main sends the existing Blue Live all-notes-off score event.

### Save And Reopen Flow

1. User edits MIDI Input settings.
2. Project save serializes the updated `MidiInputProcessor` into `.blue` XML.
3. Reloading the same project reconstructs the same `MidiInputProcessorSnapshot` values.