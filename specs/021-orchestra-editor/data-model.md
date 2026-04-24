# Data Model: Orchestra Editor Implementation

## Existing Entities To Extend

### BlueData

**Role**: Canonical project document in the main process.

**New/Expanded responsibilities**:

- Expose arrangement snapshots through `createProjectEditorSnapshot`.
- Apply orchestra/arrangement patches through `applyProjectDocumentPatch`.
- Preserve Java-compatible arrangement, instrument assignment, instrument comment, and instrument-specific XML.

### Instrument

**Role**: Abstract base for project orchestra instruments.

**Fields**:

- `name: string`
- `enabled: boolean`
- `comment: string`

**Validation**:

- Name may be empty only if Java Blue allows the corresponding instrument to be unnamed.
- Comments are plain text and must round-trip unchanged.

**Notes**:

- TypeScript `Instrument` currently lacks comment support; this spec requires adding it because Java `InstrumentEditPanel` edits `instr.getComment()` / `instr.setComment()`.

### Arrangement

**Role**: Ordered project-level list of instrument assignments.

**Fields**:

- `assignments: InstrumentAssignment[]`

**Operations**:

- Add instrument, optionally near selected arrangement id.
- Remove instrument by assignment id or row.
- Replace instrument at assignment id.
- Convert GenericInstrument to BlueSynthBuilder.
- Return a serializable snapshot for renderer use.

**Validation**:

- Arrangement ids must stay compatible with Java Blue's numeric/string instrument id semantics.
- Duplicate ids should be rejected or normalized using Java-compatible behavior.
- Mutations must keep mixer channel reconciliation requirements visible to implementation tasks.

### InstrumentAssignment

**Role**: One row in the arrangement table.

**Fields**:

- `arrangementId: string`
- `enabled: boolean`
- `instr: Instrument`

**Validation**:

- `arrangementId` cannot be blank.
- `instr` may be unresolved only when preserving unknown/deferred data; UI must surface this safely.

## Instrument Type Entities

### GenericInstrument

**Fields**:

- `name`
- `enabled`
- `comment`
- `text`
- `globalOrc`
- `globalSco`
- `opcodeList`

**Editor tabs/surfaces**:

- Instrument Text
- UDO
- Global Orc
- Global Sco

### JavaScriptInstrument

**Fields**:

- `name`
- `enabled`
- `comment`
- `instrumentText`
- `globalOrc`
- `globalSco`
- `opcodeList`

**Editor tabs/surfaces**:

- Instrument Text
- UDO
- Global Orc
- Global Sco

**Execution note**:

- Native JavaScript instrument generation may be implemented or preserved according to existing `@blue/data` JavaScript runtime patterns, but editor UI must not move script semantics into React.

### PythonInstrument

**Fields**:

- `name`
- `enabled`
- `comment`
- `instrumentText`
- `globalOrc`
- `globalSco`
- `opcodeList`
- `rawXml` or equivalent preservation data if full execution support is absent

**Editor behavior**:

- Dummy/deferred panel only.
- Existing data must round-trip unchanged.

### BlueX7

**Fields**:

- `name`
- `enabled`
- `comment`
- Java-compatible BlueX7 common settings
- LFO settings
- six operator settings
- pitch envelope generator settings
- generated Csound/code settings

**Editor surfaces**:

- Main BlueX7 instrument editor
- Operator tabs `Op 1` through `Op 6`
- `PEG`
- `Csound`

**Validation**:

- Numeric fields must preserve Java range assumptions.
- Unsupported import-from-sysex may be deferred unless implementation tasks identify a low-risk path.

### BlueSynthBuilder

**Fields**:

- `name`
- `enabled`
- `comment`
- `instrumentText`
- `alwaysOnInstrumentText`
- `globalOrc`
- `globalSco`
- `graphicInterface`
- `presetGroup`
- `parameters`
- `opcodeList`
- `editEnabled`

**Editor surfaces**:

- Interface
- Code
- UDO

**Validation**:

- BSB object names must be unique where Java requires uniqueness.
- Code editor object-name completions must derive from current BSB graphic interface state.
- Generated instrument text must replace `<objectName>` tokens with current widget/control values.
- Unknown BSB widget XML should be preserved or explicitly reported without dropping project data.

### BSBWidget

**Role**: Base snapshot/model for BSB interface objects.

**Common fields**:

- `id`
- `type`
- `objectName`
- `x`
- `y`
- `width`
- `height`
- `comment`
- Type-specific value/range/label fields

**Known widget types from current TypeScript model**:

- CheckBox
- Dropdown
- FileSelector
- Group
- HSlider
- HSliderBank
- Knob
- Label
- LineObject
- SubChannelDropdown
- TextField
- Value
- VSlider
- VSliderBank
- XYController

## New Snapshot/Patch Entities

### OrchestraSnapshot

**Fields**:

- `loaded: boolean`
- `arrangement: ArrangementSnapshot`
- `selectedAssignmentId?: string`
- `temporaryLibrary: TemporaryInstrumentLibrarySnapshot`

### ArrangementSnapshot

**Fields**:

- `rows: ArrangementRowSnapshot[]`

### ArrangementRowSnapshot

**Fields**:

- `assignmentId: string`
- `enabled: boolean`
- `instrumentName: string`
- `instrumentType: string`
- `instrumentSummary?: string`
- `editable: boolean`

### InstrumentSnapshot

**Role**: Discriminated union consumed by instrument editor routing.

**Common fields**:

- `assignmentId: string`
- `type: 'generic' | 'javascript' | 'python' | 'blueX7' | 'blueSynthBuilder' | 'unknown'`
- `name: string`
- `enabled: boolean`
- `comment: string`
- Type-specific editor payload

### OrchestraPatch

**Role**: Renderer-to-main intent for project orchestra changes.

**Variants**:

- `selectAssignment`
- `addInstrument`
- `removeAssignment`
- `updateAssignment`
- `replaceInstrument`
- `copyInstrument`
- `pasteInstrument`
- `convertGenericToBsb`
- `updateInstrument`
- `updateInstrumentComment`

**Validation**:

- Patches must include stable assignment ids, not row indexes, except where inserting relative to a row is explicitly required.
- Invalid patches must fail without partially mutating `BlueData`.

### TemporaryInstrumentLibrarySnapshot

**Fields**:

- `status: 'deferred'`
- `message: string`

**Behavior**:

- Non-authoritative placeholder for future program-wide library integration.

## State Transitions

1. Project load creates `ProjectEditorSnapshot` with `orchestra`.
2. Selecting an arrangement row updates renderer selection and requests or derives the corresponding `InstrumentSnapshot`.
3. Editing a field dispatches an `OrchestraPatch`.
4. Main process validates and applies the patch to canonical `BlueData`.
5. Main process returns a refreshed snapshot; renderer marks project dirty and re-renders selected editor.
6. Save serializes canonical `BlueData` to `.blue`.

## Serialization Rules

- All new/expanded instrument classes require load/save round-trip tests against Java-shaped XML.
- Unknown or unsupported instrument XML must be preserved or surfaced as unsupported without silent data loss.
- PythonInstrument must round-trip despite dummy editor behavior.
- BSB graphic interface and widget XML must preserve unsupported widget metadata where practical.
