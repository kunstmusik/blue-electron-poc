# Data Model: JMask Score Object Editor Parity

## Entity: JMaskEditorPayload

- **Purpose**: Typed auxiliary-editor payload for a selected `JMask` score object.
- **Fields**:
  - `seedUsed: boolean`
  - `seed: number`
  - `visibilityMenu: JMaskVisibilityItemSnapshot[]`
  - `parameters: JMaskParameterSnapshot[]`
  - `previewSupport: { available: boolean; shortcut: 'Mod+T'; deferredReason?: string }`
  - `capabilities: {
      parameterMenus: boolean;
      rowRename: boolean;
      visibilityPopup: boolean;
      reorder: boolean;
      probabilityEditors: boolean;
      tableEditors: boolean;
      testAvailable: boolean;
    }`
  - `deferredCapabilities: string[]`

## Entity: JMaskVisibilityItemSnapshot

- **Purpose**: Renderer-facing item for the Java-style top-bar popup that shows or hides parameter rows.
- **Fields**:
  - `parameterIndex: number`
  - `label: string`
  - `visible: boolean`

## Entity: JMaskParameterSnapshot

- **Purpose**: Renderer-facing view of one parameter row inside the scrollable editor stack.
- **Fields**:
  - `parameterIndex: number`
  - `label: string`
  - `fieldName: string`
  - `visible: boolean`
  - `protectedParameter: boolean`
  - `generator: JMaskGeneratorSnapshot`
  - `availableSections: {
      mask: boolean;
      quantizer: boolean;
      accumulator: boolean;
    }`
  - `mask?: JMaskMaskSnapshot`
  - `quantizer?: JMaskSectionSnapshot`
  - `accumulator?: JMaskSectionSnapshot`
  - `unsupportedSections: Array<{ section: string; reason: string }>`

## Entity: JMaskGeneratorSnapshot

- **Purpose**: Discriminated union describing the generator editor currently rendered for a parameter.
- **Fields**:
  - `generatorType: 'Constant' | 'ItemList' | 'Segment' | 'Random' | 'Probability' | 'Oscillator'`
  - `summary: string`
  - `deferredReason?: string`

### ConstantGeneratorSnapshot

- **Fields**:
  - `generatorType: 'Constant'`
  - `value: number`

### RandomGeneratorSnapshot

- **Fields**:
  - `generatorType: 'Random'`
  - `minimum: number`
  - `maximum: number`

### ItemListGeneratorSnapshot

- **Fields**:
  - `generatorType: 'ItemList'`
  - `listMode: string`
  - `items: number[]`

### SegmentGeneratorSnapshot

- **Fields**:
  - `generatorType: 'Segment'`
  - `table: JMaskTableSnapshot`

### OscillatorGeneratorSnapshot

- **Fields**:
  - `generatorType: 'Oscillator'`
  - `oscillatorType: string`
  - `phaseInit: number`
  - `exponent: number`
  - `frequencyMode: 'constant' | 'table'`
  - `frequency?: number`
  - `frequencyTable?: JMaskTableSnapshot`

### ProbabilityGeneratorSnapshot

- **Fields**:
  - `generatorType: 'Probability'`
  - `selectedType: 'Uniform' | 'Triangle' | 'Linear' | 'Exponential' | 'Gaussian' | 'Cauchy' | 'Beta' | 'Weibull'`
  - `availableTypes: Array<'Uniform' | 'Triangle' | 'Linear' | 'Exponential' | 'Gaussian' | 'Cauchy' | 'Beta' | 'Weibull'>`
  - `selectedEditor: JMaskProbabilitySubtypeSnapshot | null`

## Entity: JMaskProbabilitySubtypeSnapshot

- **Purpose**: Renderer-facing payload for the selected probability subtype editor.
- **Fields**:
  - `probabilityType: 'Uniform' | 'Triangle' | 'Linear' | 'Exponential' | 'Gaussian' | 'Cauchy' | 'Beta' | 'Weibull'`
  - `settings: Array<{ name: string; value: number | boolean }>`
  - `tables?: JMaskTableSnapshot[]`

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

## Entity: JMaskSectionSnapshot

- **Purpose**: Generic renderer-facing payload for quantizer and accumulator sections when they are supported.
- **Fields**:
  - `enabled: boolean`
  - `settings: Array<{ name: string; value: number | boolean }>`
  - `tables?: JMaskTableSnapshot[]`
  - `deferredReason?: string`

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
  - `kind: 'add-before' | 'add-after' | 'remove' | 'push-up' | 'push-down' | 'change-type' | 'rename' | 'set-visible' | 'toggle-section' | 'update-generator' | 'update-probability' | 'update-table'`
  - `parameterIndex?: number`
  - `payload: Record<string, unknown>`

## State Flows

### Top Bar Flow

1. Main and shared helpers build `JMaskEditorPayload` from the canonical `JMask` object, including the visibility popup items and preview capability state.
2. Renderer keeps the active menu, focused row, and pending rename prompt locally.
3. User toggles seed usage, edits the seed value, hides a row, or triggers preview.
4. Canonical `JMask` state updates through shared patches, while preview remains read-only with respect to document state.

### Parameter Stack Flow

1. Main and shared helpers build `JMaskEditorPayload` from the selected canonical `JMask` object.
2. Renderer shows the scrollable parameter stack with renderer-local expansion, focus, and context-menu state.
3. User adds, removes, renames, hides, reorders, or retargets a supported parameter.
4. Renderer emits one `JMaskParameterMutation` or a grouped list mutation patch and shared helpers rebuild the editor document.

### Generator And Optional Section Flow

1. Renderer routes the selected parameter to the generator editor in Java registry order and reveals optional sections only when the current generator supports them.
2. User edits supported nested controls, probability subtype settings, or section toggles.
3. Renderer emits a nested generator, section, or probability patch.
4. Canonical `JMask` data updates and unsupported sections remain explicitly declared.

### Table Or Preview Flow

1. Renderer opens a supported table surface for the active parameter or target and keeps hover or drag state locally.
2. User inserts, drags, or removes supported points, or triggers the preview flow.
3. Renderer emits canonical table patches for committed table edits and shows the resulting visualization or preview state.
4. The editor shell stays synchronized with the selected `JMask` target, and duration changes propagate into any duration-sensitive tables.
