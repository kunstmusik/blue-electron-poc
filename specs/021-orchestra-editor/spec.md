# Feature Specification: Orchestra Editor Implementation

**Feature Branch**: `021-orchestra-editor`
**Created**: 2026-04-23
**Status**: Draft
**Input**: User description: "Implement the Orchestra editor. Defer program-wide orchestra library and use a temporary component. Implement the arrangement panel, instrument editor and comments tabs, all instrument editors including BlueSynthBuilder, evaluate TanStack Table for arrangement tables, and defer Python instrument behind a dummy panel."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage project arrangement instruments (Priority: P1)

As a composer editing a project orchestra, I need the Orchestra window to show and modify the project's arrangement so I can add, select, remove, copy, paste, replace, and convert instruments without leaving the Orchestra editor.

**Why this priority**: The arrangement list is the entry point for instrument editing and mirrors Java Blue's `ArrangementEditPanel`.

**Independent Test**: Open the Orchestra tab with a loaded project, use the arrangement panel to add a supported instrument, select it, edit its instrument id/name fields where allowed, and verify selection drives the instrument editor panel.

**Acceptance Scenarios**:

1. **Given** a project with arrangement entries is loaded, **When** the Orchestra tab opens, **Then** the arrangement panel lists each assignment with enabled state, instrument id, and instrument name/type information.
2. **Given** no project is loaded, **When** the Orchestra tab opens, **Then** the arrangement controls show a disabled or empty state rather than mutating stale project data.
3. **Given** an arrangement row is selected, **When** the user invokes row actions, **Then** remove, cut, copy, paste, replace, import/export placeholders, and GenericInstrument-to-BlueSynthBuilder conversion follow Java Blue semantics where in scope.
4. **Given** the arrangement changes, **When** the project is saved and reopened, **Then** the updated arrangement and edited instruments persist through the existing `.blue` XML path.

---

### User Story 2 - Edit selected instrument and comments (Priority: P1)

As a composer selecting an instrument from the arrangement, I need a Java Blue-style editor area with `Instrument Editor` and `Comments` tabs so instrument settings and notes are edited in one stable location.

**Why this priority**: Java Blue's `InstrumentEditPanel` routes selected instruments to editor plugins and persists comments independently of editor-specific controls.

**Independent Test**: Select an instrument, edit its main fields, switch to the comments tab, edit comments, switch selection away and back, and verify both editor data and comments remain intact.

**Acceptance Scenarios**:

1. **Given** no instrument is selected, **When** the editor panel renders, **Then** it shows a clear no-selection state and disables comment editing.
2. **Given** a supported instrument is selected, **When** the editor panel renders, **Then** the `Instrument Editor` tab shows the editor matching that instrument type and the `Comments` tab shows that instrument's comments.
3. **Given** comments are edited, **When** the project is saved and reopened, **Then** the comments persist on the selected instrument.
4. **Given** an unsupported or deferred instrument type is selected, **When** the editor panel renders, **Then** it shows a clear placeholder without corrupting the instrument data.

---

### User Story 3 - Edit Java Blue instrument types (Priority: P1)

As a composer with existing Java Blue projects, I need the Electron port to edit the instrument types used by Java Blue so existing projects can be opened, adjusted, saved, and rendered without losing instrument data.

**Why this priority**: Orchestra editor parity is only useful if the editors behind arrangement selections cover the Java instrument plugin set.

**Independent Test**: Load or create each supported instrument type, edit representative fields for that type, save/reopen, and verify generated orchestra output and XML data remain compatible with the Java model.

**Acceptance Scenarios**:

1. **Given** a GenericInstrument is selected, **When** the user edits instrument text, embedded UDO data, global orchestra, or global score fields, **Then** those fields update the project model and generated instrument output.
2. **Given** a JavaScriptInstrument is selected, **When** the user edits script text, embedded UDO data, global orchestra, or global score fields, **Then** those fields persist and keep Java Blue-compatible XML.
3. **Given** a BlueX7 instrument is selected, **When** the user edits its primary synthesis/operator settings or generated Csound text fields, **Then** those edits persist without losing Java Blue's BlueX7 data structure.
4. **Given** a BlueSynthBuilder instrument is selected, **When** the user edits its interface, code, always-on code, global orchestra/score, UDO data, object names, and relevant widget/control state, **Then** the BSB instrument persists and produces generated instrument text using BSB replacement semantics.
5. **Given** a PythonInstrument is selected, **When** the user opens its editor, **Then** a dummy/deferred panel is shown and the existing instrument XML is preserved without claiming Python execution support.

---

### User Story 4 - Use a temporary library area without program-wide library scope (Priority: P2)

As a composer working in the Orchestra window, I need the layout to retain the Java Blue left-side library/arrangement structure while this slice avoids implementing the full program-wide orchestra library.

**Why this priority**: The Java `OrchestraTopComponent` includes `UserInstrumentLibrary`, but the user explicitly wants program-wide library support deferred.

**Independent Test**: Open the Orchestra tab and verify the left split contains the arrangement panel plus a clearly temporary library area that does not pretend to be the full Java-wide instrument library.

**Acceptance Scenarios**:

1. **Given** the Orchestra tab opens, **When** the user inspects the left-side secondary area, **Then** it is labeled as temporary/deferred library functionality.
2. **Given** the temporary library area is present, **When** the user edits arrangement instruments, **Then** it does not block arrangement editing or instrument editor routing.
3. **Given** future library work starts, **When** implementers inspect this spec, **Then** the deferral of the program-wide orchestra library is explicitly recorded.

---

### User Story 5 - Choose the arrangement table foundation deliberately (Priority: P2)

As an implementer, I need a documented decision on TanStack Table versus regular HTML tables for the arrangement panel so table behavior is maintainable across this and future Java Blue parity work.

**Why this priority**: The arrangement panel needs selectable/editable rows, context actions, keyboard behavior, and likely drag/drop; this decision affects more than one future table.

**Independent Test**: Review the planning artifact and confirm it compares TanStack Table and regular tables against the arrangement panel's requirements before implementation commits to either approach.

**Acceptance Scenarios**:

1. **Given** planning is complete, **When** a reviewer reads the research/plan artifact, **Then** it states whether TanStack Table is used for the arrangement panel and why.
2. **Given** the chosen table approach is implemented, **When** a reviewer tests row selection, editing, actions, and keyboard navigation, **Then** the behavior meets Java Blue arrangement-panel parity needs without unnecessary framework overhead.

### Edge Cases

- What should happen when a `.blue` file contains an unknown instrument type or a Java instrument type not yet represented in TypeScript?
- How should selection behave when an arrangement row is removed while its editor is open?
- How should copy/paste and replace behave when the buffered instrument is a BlueSynthBuilder with generated parameters or widget state?
- How should arrangement edits reconcile with mixer channels and existing instrument ids?
- How should invalid or duplicate instrument ids be handled during inline editing?
- What happens when BSB XML contains widget types or parameters that the Electron port cannot fully edit yet?
- How should comments behave for dummy/deferred Python instruments?
- What should arrangement controls do when there is no project or the project snapshot is temporarily unavailable?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The slice MUST inspect Java Blue `OrchestraTopComponent`, `ArrangementEditPanel`, `InstrumentEditPanel`, and instrument editor plugins before implementation decisions are finalized.
- **FR-002**: The Electron `Orchestra` workbench panel MUST replace the current placeholder with a three-region layout matching Java Blue's arrangement/library-left and instrument-editor-right structure.
- **FR-003**: The left arrangement region MUST show project arrangement assignments with enabled state, instrument id, and instrument name/type details.
- **FR-004**: The arrangement panel MUST support selecting an instrument assignment and routing that selection to the instrument editor region.
- **FR-005**: The arrangement panel MUST support adding at least the Java Blue instrument plugin types in the supported scope: GenericInstrument, JavaScriptInstrument, BlueX7, and BlueSynthBuilder.
- **FR-006**: The arrangement panel MUST preserve PythonInstrument entries but expose Python creation/editing only through a dummy/deferred panel in this slice.
- **FR-007**: The arrangement panel MUST support row actions equivalent to Java Blue where feasible in this slice: remove, cut, copy, paste, replace, convert GenericInstrument to BlueSynthBuilder, and save/load-compatible project mutation.
- **FR-008**: The arrangement panel MUST keep instrument ids, arrangement order, enabled state, and instrument references compatible with existing `.blue` serialization and compilation paths.
- **FR-009**: The full program-wide orchestra library MUST be deferred and documented as out of scope; a temporary component MAY occupy the Java library area for layout continuity and future integration.
- **FR-010**: The instrument editor region MUST provide `Instrument Editor` and `Comments` tabs matching Java Blue's core workflow.
- **FR-011**: The comments tab MUST persist per-instrument comments through project save/reopen flows.
- **FR-012**: GenericInstrument editing MUST include instrument text, embedded UDO surface or documented placeholder, global orchestra, and global score fields.
- **FR-013**: JavaScriptInstrument editing MUST include script text, embedded UDO surface or documented placeholder, global orchestra, and global score fields.
- **FR-014**: BlueX7 editing MUST provide a functional editor for the Java Blue BlueX7 model fields needed to preserve and modify existing BlueX7 instruments.
- **FR-015**: BlueSynthBuilder editing MUST be implemented in this spec and decomposed into manageable tasks covering BSB interface editing, code editing, always-on code, global orchestra/score, UDO data, widget/object-name state, and generated instrument replacement semantics.
- **FR-016**: PythonInstrument editing MUST be explicitly deferred behind a dummy panel that prevents accidental data loss and communicates the deferred state.
- **FR-017**: The data/model layer MUST load and save the instrument types required by this spec without dropping unknown XML fields needed for Java Blue compatibility.
- **FR-018**: Planning MUST evaluate TanStack Table against regular HTML table implementation for the arrangement panel before table implementation begins.
- **FR-019**: The final arrangement table choice MUST support keyboard navigation, row selection, inline editing where needed, context actions, and future drag/drop or reorder work.
- **FR-020**: The implementation MUST include tests for arrangement rendering/mutation, editor routing by instrument type, comment persistence, XML round-trip preservation, and BSB baseline editing/generation.

### Key Entities *(include if feature involves data)*

- **Orchestra TopComponent**: The workbench panel that owns the arrangement/library area and selected instrument editor.
- **Arrangement**: The project-level ordered list of instrument assignments used for CSD generation and mixer reconciliation.
- **Instrument Assignment**: A row linking an arrangement id, enabled state, and an instrument object.
- **Instrument**: A project orchestra object such as GenericInstrument, JavaScriptInstrument, BlueX7, BlueSynthBuilder, or PythonInstrument.
- **Instrument Editor**: The editor component selected by instrument type and shown in the `Instrument Editor` tab.
- **Instrument Comments**: Per-instrument notes edited in the `Comments` tab.
- **Temporary Library Component**: A placeholder area for deferred program-wide orchestra library functionality.
- **BlueSynthBuilder Interface**: The BSB instrument interface/code/widget model used for object-name replacements and generated instrument text.
- **Arrangement Table**: The selectable/editable table surface used to inspect and mutate arrangement assignments.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can open the Orchestra tab and see an arrangement/library-left and instrument-editor-right layout instead of the placeholder panel.
- **SC-002**: A reviewer can add, select, remove, copy, paste, replace, and save supported arrangement instruments without corrupting the project XML.
- **SC-003**: A reviewer can select a GenericInstrument, JavaScriptInstrument, BlueX7, and BlueSynthBuilder and see a type-appropriate editor in the `Instrument Editor` tab.
- **SC-004**: A reviewer can edit instrument comments, save/reopen the project, and see those comments preserved.
- **SC-005**: A reviewer can open a PythonInstrument and see an explicit dummy/deferred panel while the underlying instrument data remains preserved.
- **SC-006**: A reviewer can inspect planning artifacts and find the TanStack Table versus regular table decision for the arrangement panel.
- **SC-007**: A reviewer can edit a BlueSynthBuilder instrument enough to preserve interface/code/widget state and verify generated instrument text still performs BSB object-name replacement.
- **SC-008**: A reviewer can inspect the spec/plan and see that program-wide orchestra library implementation is deferred while a temporary component is used for this slice.

## Assumptions

- This spec targets project-level Orchestra editing inside the existing Electron workbench and does not introduce a new window-management model.
- Program-wide orchestra library parity is intentionally deferred to a later spec, even though the Java `OrchestraTopComponent` includes `UserInstrumentLibrary`.
- Embedded UDO editing should be preserved where feasible, but project-wide UDO repository management remains outside this slice unless planning identifies a safe reuse path.
- PythonInstrument execution/editor parity is deferred; this slice only preserves existing Python instrument data and shows a dummy panel.
- BlueSynthBuilder is in scope despite being large; implementation planning should split it into smaller tasks rather than defer it wholesale.
- The implementation should reuse existing editor and menu conventions where appropriate, but the specification does not require a particular table library until the TanStack Table evaluation is complete.
