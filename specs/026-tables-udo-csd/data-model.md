# Data Model: Tables, UDO, and CSD Generation Editors

## Entity: ProjectEditorSnapshot Extension

- **Purpose**: Renderer-visible project editor state for Tables and project UDOs.
- **New/Expanded Fields**:
  - `tablesText: string`
  - `projectUdos: ProjectUdoSnapshot[]`
  - optional `generatedCsd?: GeneratedCsdSnapshot` only if the modal state is stored centrally
- **Validation**:
  - Empty `tablesText` is valid.
  - `projectUdos` order must match root project opcode list order.
  - Snapshot must be replaced on project load/switch.

## Entity: ProjectDocumentPatch Extension

- **Purpose**: Explicit mutation contract for main-process canonical `BlueData`.
- **New/Expanded Mutations**:
  - `tablesText?: string`
  - `projectUdo?: ProjectUdoPatch`
- **Validation**:
  - Empty patches remain invalid.
  - UDO index mutations must be bounds-checked.
  - UDO replacement/update must not silently create duplicate blank names without explicit behavior.

## Entity: TablesText

- **Purpose**: Freeform Csound score/F-table text edited by `TablesTopComponent`.
- **Fields**:
  - `text: string`
- **Relationships**:
  - Mirrors `BlueData.getTableSet()` and contributes to generated CSD score section.
- **State Transitions**:
  1. Project loaded -> snapshot receives table text.
  2. Editor changed -> renderer dispatches tables patch.
  3. Main applies patch to canonical `BlueData`.
  4. Project saved/generated -> table text is serialized/emitted.

## Entity: ProjectUdoSnapshot

- **Purpose**: Serializable representation of one root project UDO.
- **Fields**:
  - `name: string`
  - `style: 'CLASSIC' | 'MODERN'`
  - `outTypes: string`
  - `inTypes: string`
  - `inputArguments: string`
  - `code: string`
  - `comments: string`
- **Validation**:
  - `name` should be non-empty for generated output.
  - `style` determines whether `inTypes` or `inputArguments` is user-facing.
  - `outTypes` uses Java-compatible normalization for modern display/save.
- **Relationships**:
  - One `ProjectUdoSnapshot` maps to one `OpcodeDefinition` in root `BlueData.opcodeList`.

## Entity: ProjectUdoPatch

- **Purpose**: Project-level UDO mutation action.
- **Variants**:
  - `add` with optional definition and optional index.
  - `remove` by index.
  - `update` by index and partial definition.
  - `reorder` from/to index.
  - `cut` and `copy` may remain renderer clipboard actions, with `paste` represented as `add` from copied definition.
  - `importBlueUdo`/`importCsoundUdo` if implemented through main-process file selection.
  - `exportBlueUdo`/`exportCsoundUdo` by selected index if implemented through main-process file selection.
- **Validation**:
  - Bounds-check all index operations.
  - Deep-copy inserted UDO definitions.
  - Reject unsafe style conversion or keep original data if conversion cannot be completed.

## Entity: GeneratedCsdResult

- **Purpose**: Result of generating current project CSD for screen or disk.
- **Fields**:
  - `csdText: string`
  - `generatedAtRevision: number`
  - `mode: 'standard' | 'realtime'` if realtime display is implemented
  - `targetPath?: string` for disk generation receipts
- **Validation**:
  - Requires current project.
  - Generation failures surface as error results and must not be treated as successful modal content.

## Entity: ProjectMenuCommand

- **Purpose**: Native menu command routed to main/renderer behavior.
- **Commands**:
  - `generateCsdToScreen`
  - `generateCsdToDisk`
  - `renderOrStopProject` or existing play/stop equivalents
- **Validation**:
  - Project-dependent commands disabled or safely rejected when no project is loaded.
  - Disk generation enforces `.csd` extension.

## State Flows

### Tables Edit Flow

1. Main process creates project snapshot with `tablesText`.
2. Renderer `TablesPanel` displays text through the shared Csound editor.
3. User edits text.
4. Renderer dispatches `ProjectDocumentPatch.tablesText`.
5. Main process applies to `BlueData.tableSet`.
6. Save/generate uses updated canonical data.

### UDO Edit Flow

1. Main process creates `projectUdos` from root `BlueData.opcodeList`.
2. Renderer `UserDefinedOpcodePanel` lists UDOs and tracks selected index.
3. User changes list or selected UDO fields.
4. Renderer dispatches `ProjectUdoPatch`.
5. Main process mutates root `OpcodeList`.
6. Snapshot refresh preserves selected row where possible.

### Generate CSD to Screen Flow

1. User invokes Project -> Generate CSD to Screen.
2. Main process validates current project and generates CSD from canonical `BlueData`.
3. Renderer receives CSD text.
4. Renderer opens read-only generated CSD modal with Csound highlighting and line numbers.

### Generate CSD to Disk Flow

1. User invokes Project -> Generate CSD to Disk.
2. Main process validates current project and prompts for a path.
3. Main process appends `.csd` if needed.
4. Main process writes generated CSD.
5. User receives success or error feedback.
