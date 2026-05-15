# Data Model: PianoRoll Score Object Editor Parity

## Entity: PianoRollPayload

- **Purpose**: Typed auxiliary-editor payload for a selected `PianoRoll` score object.
- **Fields**:
  - `instrumentId: string`
  - `noteTemplate: string`
  - `pchGenerationMethod: number`
  - `transposition: number`
  - `pixelSecond: number`
  - `noteHeight: number`
  - `snapEnabled: boolean`
  - `snapValue: SnapValueName`
  - `useGlobalRuler: boolean`
  - `primaryTimeDisplay: string`
  - `secondaryTimeDisplay: string`
  - `secondaryRulerEnabled: boolean`
  - `scale: { scaleName: string; baseFrequency: number; octave: number; ratios: number[] }`
  - `fieldDefinitions: PianoRollFieldDefinitionSnapshot[]`
  - `notes: PianoRollNoteSnapshot[]`
  - `capabilities: {
      fieldEditor: boolean;
      clipboard: boolean;
      undo: boolean;
      noteTemplateOverride: boolean;
    }`
  - `deferredCapabilities: string[]`

## Entity: PianoRollFieldDefinitionSnapshot

- **Purpose**: Renderer-facing definition for one editable extra note field.
- **Fields**:
  - `fieldName: string`
  - `fieldType: 'CONTINUOUS' | 'DISCRETE'`
  - `minValue: number`
  - `maxValue: number`
  - `defaultValue: number`

## Entity: PianoRollNoteSnapshot

- **Purpose**: One note rendered in the auxiliary canvas and field lane.
- **Fields**:
  - `octave: number`
  - `scaleDegree: number`
  - `start: number`
  - `duration: number`
  - `fieldValues: number[]`
  - `noteTemplate?: string | null`

## Entity: PianoRollNoteBatch

- **Purpose**: Canonical mutation payload for committed note-set edits.
- **Fields**:
  - `operations: Array<{
      kind: 'add' | 'addMany' | 'remove' | 'move' | 'resize' | 'update' | 'replace';
      noteIndex?: number;
      noteIndices?: number[];
      note?: PianoRollNoteSnapshot;
      notes?: PianoRollNoteSnapshot[];
      deltaStart?: number;
      deltaDuration?: number;
      deltaOctave?: number;
      deltaScaleDegree?: number;
    }>`

## State Flows

### Canvas Edit Flow

1. Main/shared helpers build a flat `PianoRollPayload` from the selected canonical object.
2. Renderer keeps selection, scroll position, paste target, and in-progress drag previews locally.
3. On commit boundaries such as mouse-up or explicit commands, renderer emits one `pianoRollNoteBatch` patch.
4. Shared helpers mutate canonical `PianoRoll` note data and rebuild the editor document.

### Field And Property Flow

1. Renderer edits note-template overrides, field definitions, scale settings, and ruler or snap properties from the same payload.
2. Shared helpers apply canonical property mutations, including field-definition rebuilds that preserve note values by field name when possible.
3. The active document refreshes coherently and stays reload-safe.

### Clipboard And Undo Flow

1. Clipboard state remains renderer-local and stores copied note batches plus a paste anchor.
2. Undo/redo state remains renderer-local and records full payload restore snapshots for the claimed shortcut subset.
3. Selection and viewport state stay local even when canonical note data is restored.
