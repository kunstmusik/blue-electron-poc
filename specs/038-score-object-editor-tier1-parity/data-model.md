# Data Model: Score Object Editor Tier 1 Parity

## Entity: ExternalEditorSnapshot

- **Purpose**: Typed auxiliary-editor payload for `External` score objects.
- **Fields**:
  - `kind: 'external'`
  - `target: ScoreObjectEditorTargetSnapshot`
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
  - `target: ScoreObjectEditorTargetSnapshot`
  - `children: PolyObjectChildRowSnapshot[]`
  - `generatedScoreText: string`
  - `canOpenInScore: boolean`
  - `canTest: boolean`
- **Relationships**:
  - Consumes existing nested score-path support from Spec 036.
  - Preview rendering is conditional on `generatedScoreText` being non-empty.

## Entity: TrackerColumnSnapshot

- **Purpose**: Renderer-facing metadata for one tracker data column.
- **Fields**:
  - `name: string`
  - `type: number`
  - `restrictedToInteger: boolean`
  - `usingRange: boolean`
  - `rangeMin: number`
  - `rangeMax: number`
  - `outputFrequency: boolean`
  - `scale: MidiScaleSnapshot | null`
  - `sourceIndex?: number | null`

## Entity: TrackerTrackSnapshot

- **Purpose**: Renderer-facing metadata for one tracker track header.
- **Fields**:
  - `trackId: string`
  - `trackName: string`
  - `instrumentId: string`
  - `noteTemplate: string`
  - `columns: TrackerColumnSnapshot[]`

## Entity: TrackerEditorSnapshot

- **Purpose**: Typed auxiliary payload for `TrackerObject`.
- **Fields**:
  - `kind: 'tracker'`
  - `target: ScoreObjectEditorTargetSnapshot`
  - `steps: number`
  - `stepsPerBeat: number`
  - `showNoteNames: boolean`
  - `octave: number`
  - `tracks: TrackerTrackSnapshot[]`
  - `rows: Array<Record<string, string | number | null>>`
  - `canTest: boolean`
- **Relationships**:
  - Updates canonical tracker content through the existing score patch flow.
  - Row entries use `step`, `track-{n}-status`, and `track-{n}-col-{m}` keys so the renderer can model status cells separately from data columns.

## State Flows

### External Edit Flow

1. Main resolves the selected `External` object and builds `ExternalEditorSnapshot`.
2. Renderer edits score text, command line, or syntax type and can invoke `window.blueAPI.testExternalSoundObject(...)` for score generation.
3. Renderer dispatches `ScorePatch.updateTypeSpecificEditor` for canonical field changes.
4. Main mutates the canonical object and refreshes the active editor document.

### PolyObject Inspector Flow

1. Main resolves the selected `PolyObject` and builds child rows plus a preview-capable `generatedScoreText` field.
2. Renderer shows the child browser and conditionally renders the preview pane when preview text is available.
3. Supported open actions route back through existing score-shell and nested score-path hooks.

### Tracker Edit Flow

1. Main resolves the selected `TrackerObject` into toolbar state, track metadata, column definitions, and keyed row payloads.
2. Renderer applies optimistic edits for toolbar state, track properties, column configuration, and note actions.
3. Renderer dispatches canonical `updateTypeSpecificEditor` patches, including track mutations and tracker actions.
4. Main mutates the canonical tracker state and refreshes the tracker document against canonical data.