# Data Model: JMask Score Object Editor Parity

## Entity: JMaskEditorPayload

- **Purpose**: Typed auxiliary-editor payload for a selected `JMask` score object.
- **Fields**:
  - `seedUsed: boolean`
  - `seed: number`
  - `field: JMaskFieldSnapshot`

The final implementation derives the visibility menu, row labels, generator editors, modifier sections, probability editors, table editors, and generated-score preview state from `field`. This keeps the renderer payload aligned with the canonical `@blue/data` `Field` tree and avoids a second normalized representation that could drop unsupported nested data.

## Entity: JMaskFieldSnapshot

- **Purpose**: Reload-safe snapshot of the canonical `@blue/data` `Field` object.
- **Fields**:
  - `kind: 'Field'`
  - `parameters: JMaskParameterSnapshot[]`

## Entity: JMaskVisibilityItemSnapshot

- **Purpose**: Renderer-facing item for the Java-style top-bar popup that shows or hides parameter rows.
- **Fields**:
  - `parameterIndex: number`
  - `label: string`
  - `visible: boolean`

## Entity: JMaskParameterSnapshot

- **Purpose**: Renderer-facing view of one parameter row inside the scrollable editor stack.
- **Fields**:
  - `kind: 'Parameter'`
  - `name: string`
  - `visible: boolean`
  - `generator: JMaskGeneratorSnapshot`
  - `mask: JMaskMaskSnapshot | null`
  - `quantizer: JMaskQuantizerSnapshot | null`
  - `accumulator: JMaskAccumulatorSnapshot | null`

`protectedParameter` is derived by renderer row index: the first three rows remain protected from removal, matching Java Blue. Section availability is derived from the generator kind.

## Entity: JMaskGeneratorSnapshot

- **Purpose**: Discriminated union describing the generator editor currently rendered for a parameter.
- **Fields**:
  - `kind: 'Constant' | 'ItemList' | 'Segment' | 'Random' | 'Probability' | 'Oscillator'`
  - generator-specific Java-backed fields such as `value`, `min`, `max`, `table`, `frequency`, `freqTable`, `selectedIndex`, and `generators`

### ConstantGeneratorSnapshot

- **Fields**:
  - `kind: 'Constant'`
  - `value: number`

### RandomGeneratorSnapshot

- **Fields**:
  - `kind: 'Random'`
  - `minimum: number`
  - `maximum: number`

### ItemListGeneratorSnapshot

- **Fields**:
  - `kind: 'ItemList'`
  - `listType: number`
  - `listItems: number[]`

### SegmentGeneratorSnapshot

- **Fields**:
  - `kind: 'Segment'`
  - `table: JMaskTableSnapshot`

### OscillatorGeneratorSnapshot

- **Fields**:
  - `kind: 'Oscillator'`
  - `oscillatorType: string`
  - `phaseInit: number`
  - `exponent: number`
  - `frequency: number`
  - `freqTableEnabled: boolean`
  - `freqTable: JMaskTableSnapshot`

### ProbabilityGeneratorSnapshot

- **Fields**:
  - `kind: 'Probability'`
  - `selectedIndex: number`
  - `generators: JMaskProbabilitySubtypeSnapshot[]`

## Entity: JMaskProbabilitySubtypeSnapshot

- **Purpose**: Renderer-facing payload for the selected probability subtype editor.
- **Fields**:
  - `kind: 'Uniform' | 'Linear' | 'Triangle' | 'Exponential' | 'Gaussian' | 'Cauchy' | 'Beta' | 'Weibull'`
  - subtype-specific Java-backed fields and optional tables

## Entity: JMaskMaskSnapshot

- **Purpose**: Renderer-facing payload for the Java `MaskEditor` section.
- **Fields**:
  - `enabled: boolean`
  - `high: number`
  - `low: number`
  - `mapValue: number`
  - `highTableEnabled: boolean`
  - `lowTableEnabled: boolean`
  - `highTable: JMaskTableSnapshot`
  - `lowTable: JMaskTableSnapshot`

## Entity: JMaskQuantizerSnapshot

- **Purpose**: Renderer-facing payload for the Java `Quantizer` section.
- **Fields**:
  - `kind: 'Quantizer'`
  - `gridSize: number`
  - `strength: number`
  - `offset: number`
  - `gridSizeTableEnabled: boolean`
  - `strengthTableEnabled: boolean`
  - `offsetTableEnabled: boolean`
  - `gridSizeTable: JMaskTableSnapshot`
  - `strengthTable: JMaskTableSnapshot`
  - `offsetTable: JMaskTableSnapshot`
  - `enabled: boolean`

## Entity: JMaskAccumulatorSnapshot

- **Purpose**: Renderer-facing payload for the Java `Accumulator` section.
- **Fields**:
  - `kind: 'Accumulator'`
  - `mode: number`
  - `low: number`
  - `high: number`
  - `initialValue: number`
  - `highTableEnabled: boolean`
  - `lowTableEnabled: boolean`
  - `highTable: JMaskTableSnapshot`
  - `lowTable: JMaskTableSnapshot`
  - `enabled: boolean`

## Entity: JMaskTableSnapshot

- **Purpose**: Renderer-facing table or breakpoint payload shared by segment, oscillator, mask, quantizer, accumulator, and probability editors.
- **Fields**:
  - `minimum: number`
  - `maximum: number`
  - `interpolationType: string`
  - `interpolation: number`
  - `locked: boolean`
  - `points: Array<{ time: number; value: number }>`

## Entity: JMaskParameterMutation

- **Purpose**: Canonical mutation payload for one committed parameter-stack change.
- **Fields**:
  - `seedUsed?: boolean`
  - `seed?: number`
  - `field?: Partial<JMaskFieldSnapshot>`

Renderer interactions currently commit the smallest practical field snapshot for the changed path. `applyJMaskPatchToPayload()` handles optimistic renderer updates, and canonical application rebuilds a live `Field` with `loadFieldFromSnapshot()`.

## State Flows

### Top Bar Flow

1. Main and shared helpers build `JMaskEditorPayload` from the canonical `JMask` object, including a full `field` snapshot.
2. Renderer keeps the active menu, focused row, and pending rename prompt locally.
3. User toggles seed usage, edits the seed value, hides a row, or triggers preview.
4. Canonical `JMask` state updates through shared patches, while preview remains read-only with respect to document state.

### Parameter Stack Flow

1. Main and shared helpers build `JMaskEditorPayload` from the selected canonical `JMask` object.
2. Renderer shows the scrollable parameter stack with renderer-local expansion, focus, and context-menu state.
3. User adds, removes, renames, hides, reorders, or retargets a supported parameter.
4. Renderer emits a `field` patch and shared helpers rebuild the editor document.

### Generator And Optional Section Flow

1. Renderer routes the selected parameter to the generator editor in Java registry order and reveals optional sections only when the current generator supports them.
2. User edits supported nested controls, probability subtype settings, or section toggles.
3. Renderer emits a nested generator, section, or probability patch.
4. Canonical `JMask` data updates and unsupported sections remain preserved in the field snapshot.

### Table Or Preview Flow

1. Renderer opens a supported table surface for the active parameter or target and keeps hover or drag state locally.
2. User inserts, drags, or removes supported points, or triggers the preview flow.
3. Renderer emits canonical field patches for committed table edits and shows the resulting visualization or preview state.
4. The editor shell stays synchronized with the selected `JMask` target, and duration changes propagate into any duration-sensitive tables.
