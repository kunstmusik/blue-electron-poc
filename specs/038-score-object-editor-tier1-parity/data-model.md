# Data Model: Score Object Editor Tier 1 Parity

## Entity: ExternalEditorSnapshot

- **Purpose**: Typed auxiliary-editor payload for `External` score objects.
- **Fields**:
  - `kind: 'external'`
  - `targetId: string`
  - `scoreText: string`
  - `commandLine: string`
  - `syntaxType: string`
  - `canTest: boolean`
  - `testMessage?: string`
- **Relationships**:
  - Extends the Spec 037 type-specific editor document model.
  - Writes back through `ScorePatch.updateTypeSpecificEditor`.

## Entity: PolyObjectChildRowSnapshot

- **Purpose**: One child-object row shown in the `PolyObject` auxiliary inspector.
- **Fields**:
  - `objectId: string`
  - `name: string`
  - `objectType: string`
  - `startBeats: number`
  - `durationBeats: number`
  - `layerLabel: string`

## Entity: PolyObjectEditorSnapshot

- **Purpose**: Inspector-style auxiliary payload for `PolyObject`.
- **Fields**:
  - `kind: 'polyObject'`
  - `targetId: string`
  - `children: PolyObjectChildRowSnapshot[]`
  - `generatedScoreText: string`
  - `canOpenInScore: boolean`
  - `canTest: boolean`
- **Relationships**:
  - Consumes existing nested score-path support from Spec 036.

## Entity: TrackerTrackHeaderSnapshot

- **Purpose**: Renderer-facing metadata for one tracker track header.
- **Fields**:
  - `trackId: string`
  - `trackName: string`
  - `instrumentName?: string`
  - `columnCount: number`

## Entity: TrackerEditorSnapshot

- **Purpose**: Typed auxiliary payload for `TrackerObject`.
- **Fields**:
  - `kind: 'tracker'`
  - `targetId: string`
  - `showNoteNames: boolean`
  - `octave: number`
  - `tracks: TrackerTrackHeaderSnapshot[]`
  - `rows: Array<Record<string, string | number | null>>`
  - `canTest: boolean`
- **Relationships**:
  - Updates canonical tracker content through the existing score patch flow.

## State Flows

### External Edit Flow

1. Main resolves the selected `External` object and builds `ExternalEditorSnapshot`.
2. Renderer edits score text, command line, or syntax type.
3. Renderer dispatches `ScorePatch.updateTypeSpecificEditor`.
4. Main mutates the canonical object and refreshes the active editor document.

### PolyObject Inspector Flow

1. Main resolves the selected `PolyObject` and builds child rows plus generated-score preview text.
2. Renderer shows the child browser and preview side by side.
3. Supported open/test actions route back through existing score-shell or canonical preview hooks.

### Tracker Edit Flow

1. Main resolves the selected `TrackerObject` into toolbar and grid payloads.
2. Renderer edits toolbar state or cells.
3. Renderer dispatches canonical type-specific patch updates.
4. Main refreshes the tracker document against canonical state.