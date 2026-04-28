# Feature Specification: Tables, UDO, and CSD Generation Editors

**Feature Branch**: `026-tables-udo-csd`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "Implement the Tables and UDO editors, as well as add Generate CSD to Screen and Generate CSD to Disk menu options to a Project Menu. Tables should check Java text editor context menu behavior. UDO should reuse BSB UDO work where appropriate, review Java implementation, seek editor/context menu parity, and defer User UDO library. Move existing Playback menu options to Project. Project comes before Window. Display-to-screen uses a syntax-highlighted, line-numbered CSD editor modal. Use Spec Kit to branch, create plan, commit, create tasks, and commit."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Project Tables (Priority: P1)

As a composer, I need the Tables workbench tab to edit project F-table score text so generated CSD includes the same table definitions I would edit in Java Blue.

**Why this priority**: Tables are a startup editor surface in Java Blue and feed directly into CSD score generation.

**Independent Test**: Load a project, open Tables, edit F-table text, save/reopen, and verify the text persists and appears in generated CSD output.

**Acceptance Scenarios**:

1. **Given** a project is loaded, **When** the user opens Tables, **Then** the editor shows the project's current F-table text and is editable.
2. **Given** no project is loaded, **When** the user opens Tables, **Then** the editor shows an empty non-editable state rather than stale project text.
3. **Given** the user edits table text, **When** the project is saved and reopened, **Then** the edited table text is preserved.
4. **Given** the user right-clicks in the Tables editor, **When** the context menu opens, **Then** Java Blue-style Csound editor insertion and cut/copy/paste actions are available where applicable.

---

### User Story 2 - Manage Project UDOs (Priority: P1)

As a composer, I need the UDO workbench tab to list, create, reorder, edit, copy, paste, import, export, and preview project-level user-defined opcodes so project UDOs can be maintained without relying on the Java application.

**Why this priority**: Project-level UDOs are part of Java Blue's core project model and generated orchestra output.

**Independent Test**: Load a project with project UDOs, open UDO, add a new UDO, edit classic/modern signature fields and code/comments, reorder it, copy/paste it, save/reopen, and verify the list and generated CSD remain compatible.

**Acceptance Scenarios**:

1. **Given** a project with UDOs is loaded, **When** the UDO tab opens, **Then** the project UDO list is visible and selecting one routes it to the editor.
2. **Given** a UDO is selected, **When** the user edits its name, style, signature fields, code, or comments, **Then** the project model updates and remains save-compatible.
3. **Given** a selected UDO uses classic style, **When** the user switches to modern style or vice versa, **Then** the system preserves equivalent semantics using Java-compatible conversion rules where supported.
4. **Given** the user invokes list actions, **When** add, remove, push up/down, cut, copy, paste, import, or export is selected, **Then** behavior follows Java Blue project UDO semantics for in-scope actions.
5. **Given** a UDO is selected, **When** the user chooses test/preview opcode, **Then** a generated opcode text preview is shown without mutating project data.

---

### User Story 3 - Generate CSD from Project Menu (Priority: P1)

As a composer, I need Java Blue-style Project menu actions for generated CSD so I can inspect or save exactly what the current project would render.

**Why this priority**: CSD inspection is essential for validating the data-model port and is already available in Java Blue's Project menu.

**Independent Test**: Open a project, choose Generate CSD to Screen, verify a read-only line-numbered CSD modal appears, then choose Generate CSD to Disk and verify a `.csd` file is written from the current project.

**Acceptance Scenarios**:

1. **Given** the app menu is visible, **When** the menu bar is inspected, **Then** a Project menu appears before Window and the previous Playback menu actions are no longer isolated under a separate Playback menu.
2. **Given** a project is loaded, **When** the user chooses Generate CSD to Screen, **Then** the app generates the current project CSD and shows it in a modal editor with syntax highlighting, line numbers, copy/select support, and clear close behavior.
3. **Given** a project is loaded, **When** the user chooses Generate CSD to Disk, **Then** the app prompts for a `.csd` path and writes the generated CSD to disk, appending `.csd` if the user omitted it.
4. **Given** no project is loaded, **When** the user opens the Project menu, **Then** project-dependent CSD and render actions are disabled or produce a clear no-project state.
5. **Given** generation fails, **When** the action completes, **Then** the user sees an actionable error and no partial screen modal is shown as successful output.

---

### User Story 4 - Defer User UDO Library Without Losing Project UDO Parity (Priority: P2)

As a composer, I need project UDO editing now while the separate user/global UDO library remains clearly deferred so the UI does not imply incomplete library behavior.

**Why this priority**: Java Blue's UDO top component includes a left user UDO library, but the requested scope explicitly defers it.

**Independent Test**: Open UDO and confirm project UDO editing is available while the User UDO library area is absent or clearly marked deferred and does not block project UDO workflows.

**Acceptance Scenarios**:

1. **Given** the UDO tab opens, **When** the user inspects library-related UI, **Then** the User UDO library is either omitted or explicitly labeled as deferred.
2. **Given** a project UDO is edited, **When** the user saves/reopens the project, **Then** the deferred User UDO library state has no effect on project UDO persistence.
3. **Given** future library work starts, **When** implementers inspect this spec, **Then** the deferral of the User UDO library is explicit and separated from project-level UDO support.

### Edge Cases

- What happens when a `.blue` file contains no `<tables>` section, an empty `<tables>` section, or legacy table text that is not currently represented as individual `fTable` nodes?
- How should Tables editing behave when the user has unsaved editor text and switches projects?
- What happens when UDO names are blank or duplicate existing project UDO names?
- What happens when classic/modern UDO conversion cannot infer safe argument names or output signatures?
- How should import/export behave if the selected file extension is omitted or the imported file contains multiple UDOs?
- How should generated CSD to screen handle large generated output without freezing the renderer?
- How should Generate CSD to Disk handle overwrite, cancellation, and write failures?
- What should the Project menu display when playback/rendering is already active?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST inspect Java Blue `TablesTopComponent`, `UserDefinedOpcodeTopComponent`, `OpcodeListEditPanel`, `UDOEditor`, `GenerateCsdToScreenAction`, `GenerateRealtimeCsdToScreenAction`, and `GenerateCsdAction` before coding starts.
- **FR-002**: The `Tables` workbench panel MUST replace the placeholder with a project-backed text editor for project F-table score text.
- **FR-003**: Tables editor changes MUST update the canonical current project document and persist through save/reopen flows.
- **FR-004**: The Tables editor MUST provide Java Blue-style Csound editor context menu actions for insertion helpers plus cut, copy, and paste where applicable.
- **FR-005**: The `UDO` workbench panel MUST replace the placeholder with a project-level UDO list and selected UDO editor.
- **FR-006**: The UDO list MUST support add, remove, push up, push down, cut, copy, paste, and selection routing to the editor.
- **FR-007**: The UDO list SHOULD support Blue UDO and Csound UDO import/export in this slice; if file import/export cannot be completed safely, the tasks MUST isolate the deferral and leave project editing complete.
- **FR-008**: The UDO editor MUST support name, style, out-types, classic in-types, modern input arguments, code, and comments fields.
- **FR-009**: The UDO editor MUST support Code and Comments tabs, with the Code tab using the same Csound editor behavior and context menu conventions already used by other Csound editors.
- **FR-010**: The UDO editor MUST expose generated opcode preview/test behavior without mutating project state.
- **FR-011**: UDO style changes MUST use Java-compatible classic/modern conversion behavior where supported and MUST avoid silent data loss when conversion is ambiguous.
- **FR-012**: Project UDO data MUST remain compatible with existing `.blue` XML load/save and CSD generation paths.
- **FR-013**: User/global UDO library implementation MUST be deferred and documented separately from project-level UDO editing.
- **FR-014**: The system MUST add a native Project menu before Window.
- **FR-015**: Existing Playback menu actions MUST move into Project menu behavior, matching Java Blue's Project menu grouping as closely as the current app supports.
- **FR-016**: The Project menu MUST include Generate CSD to Screen and Generate CSD to Disk actions.
- **FR-017**: Generate CSD to Screen MUST show generated CSD in a modal editor with syntax highlighting, line numbers, selectable/copyable text, and read-only behavior.
- **FR-018**: Generate CSD to Disk MUST use a save dialog, append `.csd` when needed, write the generated CSD, and report success or failure clearly.
- **FR-019**: Project menu items that require a current project MUST be disabled or safely rejected when no project is loaded.
- **FR-020**: The implementation MUST include tests for Tables snapshot/patch persistence, UDO snapshot/patch persistence, UDO XML round-trip behavior, CSD generation menu IPC, generated CSD modal rendering, and menu placement.

### Key Entities *(include if feature involves data)*

- **Tables Text**: Project F-table score text edited in the Tables tab and inserted into generated CSD score output.
- **Project UDO List**: Ordered project-level collection of UDO definitions saved in the project XML and emitted into generated orchestra output.
- **UDO Definition**: A single classic or modern user-defined opcode with name, style, signature fields, code body, and comments.
- **UDO Editor State**: Current selected UDO plus active code/comments tab and validation state.
- **Generated CSD Result**: Read-only generated CSD text produced from the current project for screen display or disk output.
- **Project Menu**: Native app menu grouping CSD generation and render/playback project actions before Window.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can open Tables, edit table text, save/reopen, and see the same text preserved and included in generated CSD.
- **SC-002**: A reviewer can open UDO, add/edit/reorder/copy/paste a project UDO, save/reopen, and see the same ordered UDO list preserved.
- **SC-003**: A reviewer can edit both classic and modern UDO signature fields and see generated opcode preview text reflect the selected style.
- **SC-004**: A reviewer can right-click Tables and UDO code editors and access the same Java Blue-style Csound insertion/cut/copy/paste behavior used by existing Csound editor surfaces.
- **SC-005**: A reviewer can open the native menu and confirm Project appears before Window, contains CSD generation actions, and contains the existing playback/render actions formerly under Playback.
- **SC-006**: A reviewer can choose Generate CSD to Screen and inspect generated CSD in a read-only syntax-highlighted modal with line numbers.
- **SC-007**: A reviewer can choose Generate CSD to Disk, save a `.csd`, and verify the file content matches the generated screen output for the same project state.
- **SC-008**: A reviewer can inspect the spec/plan/tasks and see User UDO library implementation explicitly deferred.

## Assumptions

- This spec targets project-level Tables and UDO editor parity; application-wide/user UDO library management is intentionally out of scope.
- Existing Csound editor behavior from prior specs is expected to be reused where it preserves Java Blue-style context menus, syntax highlighting, line numbers, and selection/copy behavior.
- Existing `@blue/data` CSD generation remains the authoritative source for generated CSD text in this slice.
- The current native menu implementation is the right location for Project menu changes; no custom renderer menu bar is introduced.
- Realtime CSD-to-screen may be planned alongside Java Blue parity if the current CSD generation API can support it safely, but the explicit exit criteria are Generate CSD to Screen and Generate CSD to Disk.
