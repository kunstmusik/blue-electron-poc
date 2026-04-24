# Research: Orchestra Editor Implementation

## Decision: Model the Electron Orchestra panel after Java `OrchestraTopComponent`

**Rationale**: Java Blue's `OrchestraTopComponent` is structurally simple and important for parity: a horizontal split with `ArrangementEditPanel` and `UserInstrumentLibrary` stacked on the left, and `InstrumentEditPanel` on the right. Selection is mutually exclusive between arrangement and library, and arrangement selection routes to the instrument editor.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/orchestra/OrchestraTopComponent.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/orchestra/ArrangementEditPanel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/orchestra/InstrumentEditPanel.java`

**Alternatives considered**:

- A single full-width table with editor below: rejected because it diverges from Java Blue layout and makes future library integration more disruptive.
- Full program-wide library now: rejected because the user explicitly deferred it.

## Decision: Use a temporary left-side library component and defer program-wide orchestra library

**Rationale**: The Java component includes `UserInstrumentLibrary`, but the feature scope explicitly defers program-wide orchestra library parity. A temporary component preserves the split layout and makes the future insertion point clear without implementing library persistence, categories, library selection, or drag/drop from the program library.

**Alternatives considered**:

- Hide the library area entirely: rejected because it would make the Orchestra layout less representative of Java Blue and would require a later layout churn.
- Implement a full user library now: rejected by scope and risk.

## Decision: Use TanStack Table for the arrangement table

**Rationale**: TanStack Table is a headless table/datagrid library that keeps rendering and styling under application control while providing table state, row models, selection, and extensibility. Official docs show controlled row selection and editable-data patterns, both of which map directly to Java Blue's single-row arrangement selection and editable instrument id/enabled fields. It also keeps the door open for future table reuse across other Java Blue panels without importing a styled component system.

Official docs used:

- [TanStack Table overview](https://tanstack.com/table/docs/)
- [TanStack Table row selection guide](https://tanstack.com/table/latest/docs/guide/row-selection)
- [TanStack Table editable data example](https://tanstack.com/table/latest/docs/framework/react/examples/editable-data)
- [TanStack Table row DnD example](https://tanstack.com/table/latest/docs/framework/react/examples/row-dnd)

**Implications**:

- Add `@tanstack/react-table` to `@blue/app`; `@tanstack/react-virtual` is already present and can remain optional unless large arrangements require virtualization.
- Render semantic table markup and app-specific classes; TanStack should not dictate visual style.
- Keep row selection controlled by arrangement assignment id, not row index, so selection remains stable across insert/remove/sort operations.

**Implementation result**:

- `@tanstack/react-table` is installed in `@blue/app` and is used only as the headless row/column model for `ArrangementPanel`.
- The rendered surface remains a semantic app-styled table with controlled selection by assignment id.
- Enabled state is edited through an inline checkbox; arrangement id is edited inline with blank/duplicate protection in `@blue/data`.
- Context-menu actions cover add, remove, cut, copy, paste, replace, and Generic-to-BlueSynthBuilder conversion. Import/export and program-library drag/drop remain follow-on work.

**Alternatives considered**:

- Regular HTML table with hand-written selection/editing: simpler initially, but likely duplicates behavior needed for future tables and creates more custom state handling.
- A styled data grid component: rejected because it would fight Java Blue visual parity and current app styling.

## Decision: Extend existing project snapshot/patch flow for orchestra data

**Rationale**: The app already uses `createProjectEditorSnapshot`, `ProjectDocumentPatch`, preload IPC, and `project-store` for Global Orchestra, Global Score, Project Properties, and toolbar transport. Orchestra editing should extend this path so the main process remains the canonical owner of `BlueData`, while the renderer works with serializable snapshots and patch intents.

**Alternatives considered**:

- Directly instantiate and mutate `@blue/data` objects in the renderer: rejected because it risks object identity divergence from the main process canonical document and complicates save semantics.
- Add separate IPC handlers for every arrangement operation immediately: deferred unless patch payloads become too large or difficult to validate.

## Decision: Port or complete missing instrument data classes before editor UI

**Rationale**: The current `@blue/data` registry only registers BlueSynthBuilder, and `Instrument` lacks comment handling. Java Blue's relevant plugin set is GenericInstrument, PythonInstrument, JavaScriptInstrument, BlueX7, and BlueSynthBuilder. The editor UI cannot safely preserve existing projects until these models can load/save and deep-copy reliably.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/GenericInstrument.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/PythonInstrument.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/JavaScriptInstrument.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/BlueX7.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/BlueSynthBuilder.java`

**Alternatives considered**:

- Implement renderer-only placeholder snapshots for missing types: rejected because it would violate data-first serialization requirements and risk dropping XML.

## Decision: Treat BlueSynthBuilder as a large in-scope feature with staged implementation tasks

**Rationale**: Java `BlueSynthBuilderEditor` delegates to `BSBInterfaceEditor`, `BSBCodeEditor`, and `EmbeddedOpcodeListPanel`. The Java BSB UI/model surface is large: 50+ Java UI classes and many BSB object classes. The spec requires BSB implementation, so the plan must decompose it rather than defer it.

**Staging recommendation**:

1. Ensure BSB XML load/save covers existing graphic interface, parameters, presets where currently ported or required for preservation.
2. Implement BSB code editor tabs for instrument text, always-on instrument text, global orchestra, global score, and UDO placeholder/editor.
3. Implement an interface editor that can render and edit currently ported BSB widget types.
4. Add BSB object-name completion to BSB Csound editor fields by reading object names from the selected BSB interface.
5. Add targeted tests for object-name replacement and widget value persistence.

**Implementation result**:

- The current slice implements BSB code tabs, baseline interface shell, object-name completion input for BSB Csound editors, numeric widget-value editing for currently loaded/ported widgets, and XML preservation tests for loaded `graphicInterface` data.
- Full Java `BSBInterfaceEditor` layout editing, rich widget-specific controls, presets, and the embedded opcode-list UI remain follow-on parity work.

**Alternatives considered**:

- Only implement BSB code text and defer interface editing: rejected because the user explicitly called out BlueSynthBuilder as a large in-scope task.
- Attempt full Java BSB parity in one task: rejected as too risky; task generation should split this into data, code editor, interface editor, widget editors, and tests.

## Decision: PythonInstrument is data-preserved but dummy-rendered

**Rationale**: Java PythonInstrument depends on Python/Jython-style processing. The project constitution requires preserving JVM-backed data rather than replacing it casually. This spec should load/save PythonInstrument data and show an explicit dummy/deferred panel, but it should not claim execution or full editor parity.

**Alternatives considered**:

- Implement Python editing with text fields but no execution: rejected for this slice because it can mislead users into believing Python instrument support is functional.
- Drop PythonInstrument from arrangement actions: rejected because existing projects must preserve data.

## Decision: Arrangement actions should be Java-compatible but scoped

**Rationale**: Java `ArrangementEditPanel` supports add, remove, cut/copy/paste, replace, import/export, drag-in from library, and GenericInstrument-to-BSB conversion. This slice should implement the core project-mutating row actions and keep import/export/library drag-in as placeholders or follow-on work unless implementation remains small.

**Alternatives considered**:

- Implement all Java popup actions immediately: rejected because import/export and program library drag/drop cross into broader file/library behavior.
- Only render read-only arrangement rows: rejected because the editor needs to be useful and the user requested arrangement panel implementation.
