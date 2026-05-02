# Feature Specification: Mixer Editor Core

**Feature Branch**: `034-mixer-editor-core`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "The next big feature to implement is the Mixer. There's a lot to build so I'd like you to do research to figure out how best to plan out specs using spec-kit (i.e., number of specs and scope). Review the Java Blue implementation in ~/work/nbprojects/blue for Mixer data and UI. Some things I think we'll need: EffectsLibrary loading from ~/.blue without saving, Mixer UI, non-modal effect editor BrowserWindows, menu-opened effects library modal, effect editor reuse of UDO and BSB interface surfaces, and reliable UI synchronization when instruments are added or removed. Go ahead and use spec-kit to branch, plan out spec 034 and 035, then update status.md for handoff."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Mixer Strips In The Workbench (Priority: P1)

As a composer editing a project arrangement, I need a real Mixer panel with instrument channels, subchannels, and master so I can inspect and edit routing without leaving the current workbench.

**Why this priority**: The mixer is not usable until the placeholder panel is replaced and the UI stays synchronized with arrangement changes. This is the minimum usable mixer slice even before deeper effect editing polish lands.

**Independent Test**: Load a project, open `MixerTopComponent`, add, remove, rename, and replace arrangement instruments, and confirm the mixer panel updates the visible channel strips correctly while preserving subchannels and master.

**Acceptance Scenarios**:

1. **Given** a project with an arrangement and mixer data, **When** the user opens `MixerTopComponent`, **Then** the panel renders instrument channels, subchannels, and master using the current workbench visual language instead of a placeholder.
2. **Given** the Mixer panel is open, **When** arrangement instruments are added, removed, duplicated, renamed, or replaced, **Then** the visible mixer strips update to match Java Blue-style channel association behavior without requiring the panel to be reopened.
3. **Given** the user edits supported channel settings such as mute, solo, level, pan, routing, or subchannel membership, **When** the change is applied, **Then** the project snapshot and canonical `BlueData` mixer update through the existing patch bridge.

---

### User Story 2 - Build Effect Chains From The User Library (Priority: P1)

As a composer shaping mixer channels, I need to browse my existing effects library, add effects or sends to a channel, and manage the chain from the mixer UI so I can build practical mixer routings without leaving the app.

**Why this priority**: The mixer surface is incomplete without effect-chain authoring. Loading the user's real library from `~/.blue` is the safest way to unblock development while deferring durable library storage work.

**Independent Test**: Load a project, open the effects library modal from the menu, browse the library loaded from disk, add an effect to a channel, reorder or remove entries, and verify the project changes while `~/.blue` remains unchanged.

**Acceptance Scenarios**:

1. **Given** the user has an effects library XML file in `~/.blue`, **When** the app loads the library, **Then** it presents a mutable in-memory session copy of that library without writing changes back to disk.
2. **Given** the Mixer panel is open, **When** the user adds an effect from the library or inserts a send into a channel chain, **Then** the corresponding chain entry appears immediately and updates the project mixer snapshot.
3. **Given** a channel already has effect or send entries, **When** the user enables, disables, reorders, retargets, or removes them, **Then** the chain updates in the UI and the canonical project document remains in sync.

---

### User Story 3 - Open Dedicated Effect Editing Surfaces (Priority: P2)

As a composer refining mixer effects, I need dedicated effect editors and a library-management surface that behave like Java Blue so I can adjust effect code, interface widgets, and embedded UDOs without blocking the rest of the workbench.

**Why this priority**: Core mixer and chain authoring provide the MVP, but effect-instance editing is still required for realistic parity and informs how reusable the current BSB/UDO surfaces really are.

**Independent Test**: Open an effect editor from a channel or the effects library, verify it opens in a non-modal `BrowserWindow`, reopen the same effect and confirm the existing window is focused, edit interface/code/UDO content, and confirm the mutation flows back to the channel or library session.

**Acceptance Scenarios**:

1. **Given** an effect exists in a mixer chain or the in-memory library session, **When** the user opens its editor, **Then** the app opens a non-modal `BrowserWindow` that reuses the effect's existing window if it is already open.
2. **Given** the effect editor is open, **When** the user edits effect interface, ORC code, or embedded UDO content, **Then** the change reuses existing BSB/UDO editor surfaces and updates the correct backing effect model.
3. **Given** the user opens effects-library management from the menu, **When** they review categories and effects, **Then** the app presents a modal management surface separate from the non-modal effect editor windows.

### Edge Cases

- What happens when no project is loaded and the user opens the Mixer panel, effects library, or an effect editor?
- What happens when `~/.blue/effectsLibrary.xml` is missing, malformed, or uses unsupported XML content?
- What happens when arrangement edits would leave a mixer channel pointing at a removed or renamed instrument association?
- What happens when an effect editor window is open for an effect that is removed from the chain or library?
- How does the app prevent feedback-prone send routing or invalid self-targeted subchannel routing within the scope of this core slice?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review the Java Blue mixer data and UI anchors before coding begins, including `Mixer`, `Channel`, `ChannelList`, `EffectsChain`, `Effect`, `Send`, `MixerTopComponent`, `ChannelPanel`, `EffectsLibrary`, `EffectsLibraryDialog`, `EffectEditor`, and `EffectEditorManager`.
- **FR-002**: The system MUST audit the existing TypeScript mixer models in `@blue/data` before adding new mixer-specific data structures, and MUST reuse existing mixer classes where they are already sufficient.
- **FR-003**: The shared project document contract MUST grow a typed mixer snapshot and mixer patch surface so mixer edits flow through the same main-process canonical document path used by other project editors.
- **FR-004**: The renderer MUST replace the current `MixerTopComponent` placeholder with a dedicated Mixer panel that renders instrument channels, subchannels, and master.
- **FR-005**: The mixer UI MUST stay synchronized with arrangement-driven instrument changes, including add, remove, duplicate, rename, and replace operations.
- **FR-006**: The app MUST load the user's effects library from the real `~/.blue` XML path into an in-memory mutable session copy and MUST NOT save library mutations back to disk in this spec.
- **FR-007**: The Mixer panel MUST support effect-chain usage flows for adding effects from the library, adding sends, enabling or disabling entries, reordering entries, removing entries, and editing send targets or levels.
- **FR-008**: The app MUST expose an effects-library management command through the native menu flow and MUST open that management surface as a modal dialog.
- **FR-009**: Effect usage editors MUST open in non-modal `BrowserWindow` instances and MUST focus the existing window when the same effect is reopened.
- **FR-010**: The effect editor MUST reuse the current BSB interface editor, embedded UDO editing surfaces, and CodeMirror-based code editor with ORC-appropriate configuration and Java Blue-style context-menu affordances.
- **FR-011**: Mixer, library, and effect-editor interactions MUST surface clear disabled or empty states when no project is loaded or no library data is available.
- **FR-012**: The implementation MUST add tests covering mixer snapshot and patch behavior, arrangement-driven strip synchronization, effects-library loading without saving, modal library invocation, non-modal effect-editor reuse, and effect-editor mutation flow.
- **FR-013**: SQLite or any other durable library-storage redesign MUST remain out of scope for this spec.

### Key Entities *(include if feature involves data)*

- **Mixer Snapshot**: Serialized renderer-facing view of the project mixer, including instrument channels, subchannels, master, and per-strip chain entries.
- **Mixer Patch**: Explicit mutation intent for channel, subchannel, routing, and effect-chain operations that the main process applies to canonical `BlueData`.
- **Effects Library Session**: The in-memory copy of the user's library loaded from `~/.blue`, including categories and effects, which can be mutated during a session without disk writes.
- **Effect Editor Session**: The main-process tracked relationship between an effect instance or library effect and its dedicated non-modal editor window.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can load a project, open the Mixer panel, perform arrangement add/remove/rename operations, and observe channel/subchannel/master UI staying synchronized without reopening the panel.
- **SC-002**: A reviewer can load the effects library from the real user path, mutate the in-memory library session, and confirm the source XML on disk is unchanged.
- **SC-003**: A reviewer can add an effect or send to a channel, reorder or remove entries, and observe those changes in both the UI and the canonical project snapshot.
- **SC-004**: A reviewer can open an effect editor twice for the same effect and see the original non-modal window focused instead of a duplicate window being created.
- **SC-005**: Automated tests cover the new mixer snapshot contract, core mixer panel synchronization, read-only-on-disk library loading, and effect-editor window reuse.

## Assumptions

- The existing `@blue/data` mixer classes remain the starting point; any missing parity should be filled surgically rather than by replacing the model wholesale.
- The current project snapshot/patch bridge remains the canonical renderer-to-main mutation path for mixer edits.
- Effects library persistence is intentionally deferred; this spec only needs safe session-local mutation of data loaded from disk.
- The effect editor can reuse existing BSB/UDO/CodeMirror surfaces with targeted adjustments rather than requiring a wholly new editor stack.
