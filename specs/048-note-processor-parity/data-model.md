# Data Model: Note Processor Parity

## Entity: NoteProcessorDefinition

**Purpose**: Describes one addable in-scope processor type.

**Fields**:

- `type`: stable Java-compatible processor type identifier
- `displayName`: user-facing processor name
- `position`: Java plugin order for add menus
- `parameters`: ordered editable parameter definitions
- `createDefault`: constructor behavior for new processors

**Validation Rules**:

- Must exist for all 16 in-scope non-Python processors.
- Must not include Java helper objects such as `Code` or `ValueTimeMapper`.
- Must not include PythonProcessor as addable in this slice.

## Entity: NoteProcessorParameterDefinition

**Purpose**: Describes one editable field on a processor.

**Fields**:

- `name`: canonical field key
- `label`: user-facing label
- `valueType`: string, number, integer, boolean, multiline text, scale, or deferred/readonly
- `defaultValue`: default used for newly created processors
- `validation`: bounds or parse requirements matching processor behavior

**Validation Rules**:

- Parameter keys must map to load/save and processor setter behavior.
- Invalid values must be surfaced before or during processing with Java-compatible failure behavior.

## Entity: NoteProcessorSnapshot

**Purpose**: Renderer-facing representation of one processor in a chain.

**Fields**:

- `id`: renderer-stable row identifier for edit sessions
- `processorType`: Java-compatible processor type or preserved original type
- `displayName`: user-facing processor name
- `supported`: true for in-scope editable processors
- `deferred`: true for PythonProcessor preservation-only entries
- `summary`: compact chain summary text
- `parameters`: editable values for supported processors
- `serializedXml`: preserved XML for unsupported or deferred processors

**Validation Rules**:

- Supported processors must round-trip through snapshots without changing type, order, or parameter values.
- Deferred and unsupported processors must preserve XML unless deliberately removed.

## Entity: NoteProcessorChainSnapshot

**Purpose**: Renderer-facing ordered chain for one target.

**Fields**:

- `processors`: ordered `NoteProcessorSnapshot[]`
- `hasUnsupportedProcessors`: true when unknown legacy processors are present
- `hasDeferredProcessors`: true when PythonProcessor or other deferred processors are present
- `sourceName`: optional named-chain source label for imported chains

**Validation Rules**:

- Processor order is significant and must be preserved.
- Empty chains are valid.

## Entity: NoteProcessorChainTarget

**Purpose**: Identifies the canonical owner of a chain.

**Variants**:

- Score object target using existing score-object editor target information
- Sound-object layer target using root group, nested container path, and layer index
- Layer-group target using root group or nested group location
- Root score target

**Validation Rules**:

- Targets must resolve against current canonical `BlueData` before mutation.
- Removed or stale targets must fail safely and refresh UI state.
- Audio-only groups remain non-editable unless later parity research changes the scope.

## Entity: NoteProcessorChainEdit

**Purpose**: Atomic user edit or full replacement for one chain.

**Fields**:

- `target`: `NoteProcessorChainTarget`
- `chain`: complete replacement snapshot, or operation list if implementation chooses operation-based patches
- `namedChainAction`: optional import or save-as-name action

**Validation Rules**:

- Non-null replacement chains must be reified to canonical processors before commit.
- Unsupported/deferred entries must retain preserved XML unless removed.

## Entity: NamedNoteProcessorChain

**Purpose**: Reusable project-level chain entry.

**Fields**:

- `name`: unique project-local chain name
- `chain`: `NoteProcessorChainSnapshot`

**Validation Rules**:

- Saving a named chain requires a non-empty name and non-empty chain.
- Importing a named chain copies processors into the active chain without aliasing canonical objects.
