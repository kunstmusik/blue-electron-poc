# Data Model: Score Object Editor Tier 2 Parity

## Entity: SoundEditorSnapshot

- **Purpose**: Typed auxiliary-editor payload for `Sound` score objects.
- **Fields**:
  - `kind: 'sound'`
  - `targetId: string`
  - `activeTab: 'interface' | 'automation' | 'comment'`
  - `widgetTreeRef?: string`
  - `automationSummary?: Record<string, unknown>`
  - `commentText: string`

## Entity: PianoRollNoteSnapshot

- **Purpose**: One note displayed in the `PianoRoll` auxiliary canvas.
- **Fields**:
  - `noteId: string`
  - `startBeats: number`
  - `durationBeats: number`
  - `pitch: number`
  - `velocity?: number`

## Entity: PianoRollEditorSnapshot

- **Purpose**: Typed auxiliary payload for `PianoRoll`.
- **Fields**:
  - `kind: 'pianoRoll'`
  - `targetId: string`
  - `notes: PianoRollNoteSnapshot[]`
  - `snapValue: string`
  - `scaleSummary?: string`
  - `viewport: { startBeats: number; endBeats: number; lowestPitch: number; highestPitch: number }`

## Entity: JMaskGeneratorSnapshot

- **Purpose**: One renderer-facing generator or parameter section for `JMask`.
- **Fields**:
  - `generatorId: string`
  - `generatorType: string`
  - `label: string`
  - `supported: boolean`
  - `visible: boolean`
  - `parameters: Array<{ parameterId: string; label: string; valueSummary: string; supported: boolean }>;

## Entity: JMaskEditorSnapshot

- **Purpose**: Typed auxiliary payload for `JMask`.
- **Fields**:
  - `kind: 'jMask'`
  - `targetId: string`
  - `seedEnabled: boolean`
  - `seedValue: number | null`
  - `generators: JMaskGeneratorSnapshot[]`

## State Flows

### Sound Edit Flow

1. Main resolves the selected `Sound` object into interface, automation, and comment-tab payloads.
2. Renderer edits supported tab content.
3. Renderer dispatches canonical type-specific patch updates.
4. Main refreshes the active `Sound` editor document.

### PianoRoll Edit Flow

1. Main resolves `PianoRoll` note and viewport payloads.
2. Renderer edits notes and view controls through a dedicated auxiliary canvas.
3. Renderer dispatches canonical type-specific patch updates.
4. Main refreshes the active `PianoRoll` editor document.

### JMask Edit Flow

1. Main resolves `JMask` generators and parameter summaries.
2. Renderer edits supported generator controls while preserving unsupported cases explicitly.
3. Renderer dispatches canonical type-specific patch updates.
4. Main refreshes the active `JMask` editor document.