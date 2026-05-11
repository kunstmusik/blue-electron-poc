# Data Model: PianoRoll Score Object Editor Parity

## Entity: PianoRollEditorSnapshot

- **Purpose**: Typed auxiliary-editor payload for a selected `PianoRoll` score object.
- **Fields**:
  - `editorFamily: 'PianoRoll'`
  - `noteCanvas: PianoRollCanvasSnapshot`
  - `properties: PianoRollPropertiesSnapshot`
  - `capabilities: {
      fieldEditor: boolean;
      clipboard: boolean;
      undo: boolean;
      noteTemplateOverride: boolean;
    }`
  - `deferredCapabilities: string[]`

## Entity: PianoRollCanvasSnapshot

- **Purpose**: Renderer-facing view model for the note canvas.
- **Fields**:
  - `notes: PianoRollNoteSnapshot[]`
  - `selectedNoteIds: string[]`
  - `pixelsPerBeat: number`
  - `noteRowHeight: number`
  - `visibleStartBeats: number`
  - `visibleEndBeats: number`
  - `canPaste: boolean`
  - `undoAvailable: boolean`
  - `redoAvailable: boolean`

## Entity: PianoRollNoteSnapshot

- **Purpose**: One note rendered in the auxiliary canvas.
- **Fields**:
  - `noteId: string`
  - `startBeats: number`
  - `durationBeats: number`
  - `pitchValue: number`
  - `pitchDisplay: string`
  - `fieldValues: Record<string, number>`
  - `selected: boolean`

## Entity: PianoRollPropertiesSnapshot

- **Purpose**: Renderer-facing view of editable `PianoRoll` metadata.
- **Fields**:
  - `instrumentId: string`
  - `noteTemplate: string`
  - `pchGenerationMethod: number`
  - `transposition: number`
  - `fieldDefinitions: Array<{ fieldName: string; minValue: number; maxValue: number }>`
  - `scaleSummary: string`
  - `rulerConfigSummary: string`

## Entity: PianoRollInteractionBatch

- **Purpose**: Canonical mutation payload for one committed note-edit interaction.
- **Fields**:
  - `kind: 'add' | 'move' | 'resize' | 'delete' | 'paste' | 'field-edit'`
  - `noteIds: string[]`
  - `payload: Record<string, unknown>`

## State Flows

### Note Edit Flow

1. Main/shared helpers build `PianoRollEditorSnapshot` from the selected canonical object.
2. Renderer updates local interaction state while the user drags, resizes, or selects notes.
3. On commit boundaries such as mouse-up or explicit commands, renderer emits one `PianoRollInteractionBatch`.
4. Shared helpers mutate canonical note data and rebuild the editor document.

### Field Edit Flow

1. Renderer derives the selected field view from `PianoRollCanvasSnapshot` and `PianoRollPropertiesSnapshot`.
2. User edits a supported field for the current selection.
3. Renderer emits a batch field-edit patch.
4. Canonical note data updates and the canvas plus properties refresh.

### Property Update Flow

1. Renderer edits supported `PianoRoll` properties such as note template or pitch-generation method.
2. Shared helpers apply canonical property mutations.
3. The auxiliary editor refreshes against the updated object and preserves the current viewport when possible.
