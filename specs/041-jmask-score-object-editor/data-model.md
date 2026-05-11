# Data Model: JMask Score Object Editor Parity

## Entity: JMaskEditorSnapshot

- **Purpose**: Typed auxiliary-editor payload for a selected `JMask` score object.
- **Fields**:
  - `editorFamily: 'JMask'`
  - `seedUsed: boolean`
  - `seed: number`
  - `parameters: JMaskParameterSnapshot[]`
  - `capabilities: {
      reorder: boolean;
      probabilityEditors: boolean;
      tableEditors: boolean;
      testAvailable: boolean;
    }`
  - `deferredCapabilities: string[]`

## Entity: JMaskParameterSnapshot

- **Purpose**: Renderer-facing view of one parameter row inside the scrollable editor stack.
- **Fields**:
  - `parameterId: string`
  - `label: string`
  - `orderIndex: number`
  - `generator: JMaskGeneratorSnapshot`
  - `maskEnabled: boolean`
  - `quantizerEnabled: boolean`
  - `accumulatorEnabled: boolean`
  - `probabilityEnabled: boolean`
  - `unsupportedSections: string[]`

## Entity: JMaskGeneratorSnapshot

- **Purpose**: Discriminated union describing the supported generator editor currently rendered for a parameter.
- **Fields**:
  - `generatorType: string`
  - `summary: string`
  - `editableFields: Array<{ fieldName: string; value: string | number | boolean }>`
  - `tableData?: Array<{ x: number; y: number }>`
  - `deferredReason?: string`

## Entity: JMaskParameterMutation

- **Purpose**: Canonical mutation payload for one committed parameter-stack change.
- **Fields**:
  - `kind: 'add-parameter' | 'remove-parameter' | 'reorder-parameter' | 'update-generator' | 'toggle-section' | 'update-probability' | 'update-table'`
  - `parameterId?: string`
  - `payload: Record<string, unknown>`

## State Flows

### Parameter Stack Flow

1. Main/shared helpers build `JMaskEditorSnapshot` from the selected canonical `JMask` object.
2. Renderer shows the scrollable parameter stack and local expanded-row state.
3. User adds, removes, reorders, or edits a supported parameter.
4. Renderer emits one `JMaskParameterMutation` and shared helpers rebuild the editor document.

### Optional Section Flow

1. Renderer opens a mask, quantizer, accumulator, or probability section for one parameter.
2. User edits supported nested controls.
3. Renderer emits a nested `JMaskParameterMutation`.
4. Canonical `JMask` data updates and unsupported sections remain explicitly declared.

### Table Or Test Flow

1. Renderer opens a supported table or test surface for the active parameter or target.
2. User edits supported points or triggers the preview flow.
3. Renderer shows the resulting visualization or preview state.
4. The editor shell stays synchronized with the selected `JMask` target.
