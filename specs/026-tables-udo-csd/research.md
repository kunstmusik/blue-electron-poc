# Research: Tables, UDO, and CSD Generation Editors

## Java Blue Source Anchors

- Tables panel: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/tables/TablesTopComponent.java`
- UDO top component: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/udo/UserDefinedOpcodeTopComponent.java`
- UDO list actions/context menu/import/export/drag-drop: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/udo/OpcodeListEditPanel.java`
- UDO field editor and style conversion flow: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/udo/UDOEditor.java`
- UDO model/parser/conversion tests: `/Users/stevenyi/work/nbprojects/blue/blue-core/src/test/java/blue/utility/UDOUtilitiesTest.java`
- Generated CSD to screen: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/GenerateCsdToScreenAction.java`
- Generated realtime CSD to screen: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/GenerateRealtimeCsdToScreenAction.java`
- Generated CSD to file: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/GenerateCsdAction.java`

## Decision: Tables Is a Single Project-Backed Csound Score Editor

Java `TablesTopComponent` creates a `MimeTypeEditorComponent("text/x-csound-sco")`, binds it directly to `project.getData().getTableSet().getTables()`, disables editing when no project is loaded, and updates `Tables.setTables()` on document changes.

**Decision**: Implement `TablesTopComponent` as a full-height editor using the existing CodeMirror Csound editor shell, configured for score/table text and existing Java Blue-style context menu actions.

**Rationale**: The Java surface is intentionally simple. A structured table UI would be a divergence. The existing editor already provides line numbers, Csound highlighting/completions, context menu insertion helpers, and cut/copy/paste fixes from prior specs.

**Alternatives considered**:

- Structured F-table table: rejected because Java Blue stores and edits freeform table text.
- Plain textarea: rejected because it would regress context menu and Csound editor parity already implemented for other panels.

## Decision: Fix/Normalize `Tables` Text Model Before UI Work If Needed

Current `@blue/data` `Tables` stores a map of named `fTable` elements and `getAllTables()` joins values. Java `TablesTopComponent` exposes `getTables()`/`setTables()` as one text blob.

**Decision**: Implementation must inspect and, if necessary, adapt `@blue/data` `Tables` so the project editor can load/save the Java-compatible freeform table text without losing existing XML compatibility.

**Rationale**: A text editor cannot safely target a map-only model unless the XML format is definitely map-based for all supported projects. This is a data-first compatibility issue and belongs in `@blue/data` tests before renderer work.

**Alternatives considered**:

- Keep map-only model and synthesize unnamed rows: rejected until Java XML compatibility is confirmed by fixtures.
- Renderer-only text cache: rejected because it would diverge from canonical project data.

## Decision: Reuse and Factor BSB UDO UI for Project UDOs

Spec 021 introduced `BSBUDOPanel`, `UDOTable`, and `UDOEditor` under `panels/orchestra/bsb/`. Java project UDO editing uses similar operations: table list, add/import/remove/push up/down, context menu cut/copy/paste/export, editor fields for style/out/in/input args/code/comments, and generated opcode preview.

**Decision**: Factor the BSB UDO table/editor into reusable UDO components and compose a project-level `UserDefinedOpcodePanel` from them. Keep BSB-specific patch plumbing separate from root project UDO patch plumbing.

**Rationale**: This avoids duplicating UDO field/editor behavior and keeps classic/modern style fixes consistent. Project UDO support should be a first-class root editor, while BSB embedded UDO support remains an embedded instrument editor concern.

**Alternatives considered**:

- Duplicate BSB UDO components for project UDOs: rejected due to drift risk.
- Build only a raw UDO text editor: rejected because Java Blue exposes structured UDO list/editor semantics and the data model already has `OpcodeDefinition`.

## Decision: Defer User UDO Library

Java `UserDefinedOpcodeTopComponent` has a left `UDOLibraryPanel`, a project `OpcodeListEditPanel`, and a selected `UDOEditor`. The user explicitly requested User UDO library deferral.

**Decision**: Omit the user library or show a clear deferred placeholder. Do not implement user/global repository browsing, category drag/drop, or persistence in this spec.

**Rationale**: Project-level UDOs are required for `.blue` compatibility and CSD generation. User library workflows are separate application preferences/library state and would expand scope beyond project editor parity.

**Alternatives considered**:

- Partial user library placeholder with fake data: rejected because it implies unsupported behavior.
- Full library port: deferred by explicit user scope.

## Decision: UDO Import/Export Is Planned, But Isolatable

Java project UDO list supports:

- toolbar import menu: "Import Blue UDO", "Import Csound UDO"
- context menu: Cut, Copy, Paste, Export > Blue UDO, Csound UDO
- Blue UDO import/export uses XML for one `udo`
- Csound UDO import parses one or more UDO declarations
- Csound UDO export writes generated opcode text

**Decision**: Include import/export tasks. If parser or file-format support proves incomplete, isolate the deferral to import/export while keeping add/edit/reorder/copy/paste project UDO editing complete.

**Rationale**: The user requested parity and Java behavior review. Import/export is visible in Java, but project-level editing is the core dependency for `.blue` compatibility.

**Alternatives considered**:

- Defer all import/export now: rejected because the plan should let implementation decide based on existing `@blue/data` parser capability.

## Decision: Project Menu Owns CSD Generation and Playback/Render Actions

Java Project menu includes Generate CSD to Screen, Generate Realtime CSD to Screen, Generate CSD to File, Render/Stop Project, follow-playback toggles, Blue Live submenu, tempo/time signature/marker actions, and loop rendering. Current Electron menu has File, Edit, Window, Playback with Play/Stop.

**Decision**: Add a native Project menu before Window. Move existing Playback menu Play/Stop behavior into Project as render/playback actions. Add Generate CSD to Screen and Generate CSD to Disk. Keep unsupported Java Project menu items deferred or disabled only if already represented by current app state.

**Rationale**: This matches the user's requested menu order and avoids maintaining a separate Playback menu that Java Blue does not use.

**Alternatives considered**:

- Keep Playback menu and add Project next to it: rejected by user request to move existing Playback options.
- Implement all Java Project menu items now: rejected as too broad for Tables/UDO/CSD generation scope.

## Decision: Generated CSD to Screen Uses a Read-Only CodeMirror Modal

Java uses `InfoDialog.showInformationDialog(..., csd, ..., "text/x-csound-orc")` for screen display. The user requested a CodeMirror editor with syntax highlighting and line numbers.

**Decision**: Generate CSD in the main process from current `BlueData.toCSD()` and send the text to the renderer for a read-only modal using the existing CodeMirror editor infrastructure. The modal should support selection/copy, line numbers, Csound highlighting, and close behavior.

**Rationale**: Main owns canonical current project data and file-system generation. Renderer owns modal/editor presentation. Reusing CodeMirror avoids another editor stack.

**Alternatives considered**:

- Native Electron dialog with plain text: rejected because it lacks line numbers/highlighting and cannot handle large text well.
- New OS window: deferred; current request says modal window and Java's InfoDialog behavior is modal-like.

## Decision: Generated CSD to Disk Is Main-Process Save Flow

Java `GenerateCsdAction` prompts for a file, appends `.csd` if omitted, writes `CSDRenderService.generateCSD(...)`, and reports status.

**Decision**: Implement disk generation as main-process IPC/menu flow using Electron save dialog, `.csd` extension enforcement, and `BlueData.toCSD()` output.

**Rationale**: File dialogs and writes belong in the main process. The renderer should not need direct file-system access.

**Alternatives considered**:

- Renderer download-like save: rejected for Electron desktop parity.

## Deferrals

- User/global UDO library browsing, category management, and drag/drop.
- Full Java Project menu parity beyond requested generation and moved playback/render controls.
- Realtime CSD-to-screen if current `@blue/data` generation cannot distinguish realtime settings safely in this spec.
- Rich status bar feedback beyond existing notification/status mechanisms.
