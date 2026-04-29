# Feature Specification: Blue Live Part 1

**Feature Branch**: `027-blue-live-part1`  
**Created**: 2026-04-28  
**Status**: Complete
**Input**: User description: "Plan Blue Live Part 1: fix the toolbar Blue Live button so it toggles BlueLive instead of selecting the editor; implement BlueLive rendering in a parallel blue-engine; make Recompile restart BlueLive; implement All Notes Off; defer MIDI Input; implement the BlueLive editor Live Space UI, LiveCode tab, and Options tab while deferring SoundObject editor opening and SCO pad; add macOS Settings menu/window; add Evaluate Code context action with Cmd-Return for global orchestra and score editors, using current-context fallback when no selection exists."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run Blue Live From The Toolbar (Priority: P1)

As a composer, I need the top toolbar Blue Live button to start and stop Blue Live playback instead of focusing the Blue Live editor, so I can launch live performance mode directly from the main transport area.

**Why this priority**: Blue Live is not useful until the toolbar controls an actual Blue Live engine lifecycle. This is also the fix for the current incorrect toolbar behavior.

**Independent Test**: Open a project, press the Blue Live toolbar button, confirm Blue Live starts without changing the selected workbench editor, then press it again and confirm Blue Live stops.

**Acceptance Scenarios**:

1. **Given** a project is loaded and Blue Live is stopped, **When** the user clicks `Blue Live` in the top toolbar, **Then** the system compiles the project for Blue Live and starts a Blue Live engine session.
2. **Given** a project is loaded and Blue Live is stopped, **When** the user clicks `Blue Live`, **Then** the selected workbench editor remains unchanged.
3. **Given** Blue Live is running, **When** the user clicks `Blue Live` again, **Then** the Blue Live engine session stops and the toolbar button returns to inactive state.
4. **Given** realtime project playback is already running, **When** the user starts Blue Live, **Then** Blue Live runs through a separate engine session without stopping realtime playback.
5. **Given** Blue Live is already running, **When** the user starts or stops realtime playback, **Then** the Blue Live session remains independently controlled unless the user stops Blue Live or quits the app.

---

### User Story 2 - Recompile And Silence Blue Live (Priority: P1)

As a live performer, I need `Recompile` and `All Notes Off` controls to recover quickly from project edits or stuck notes without manually stopping and rebuilding the full performance context.

**Why this priority**: These controls are part of the visible Blue Live toolbar and are operationally important during live use.

**Independent Test**: Start Blue Live, invoke Recompile, confirm a fresh Blue Live compile/session starts, then trigger All Notes Off and confirm the generated all-notes-off event is sent to the running Blue Live engine.

**Acceptance Scenarios**:

1. **Given** Blue Live is running, **When** the user clicks `Recompile`, **Then** the current Blue Live engine session stops, the current project state is compiled for Blue Live, and a new Blue Live session starts.
2. **Given** Blue Live is stopped and a project is loaded, **When** the user clicks `Recompile`, **Then** the project is compiled for Blue Live and Blue Live starts.
3. **Given** Blue Live is running, **When** the user clicks `All Notes Off`, **Then** the system sends the Java-compatible `blueAllNotesOff` score event to the Blue Live engine.
4. **Given** no project is loaded, **When** the user views the Blue Live toolbar controls, **Then** project-dependent Blue Live actions are disabled or safely rejected with no engine side effects.

---

### User Story 3 - Edit Live Space, Live Code, And Options (Priority: P2)

As a composer preparing a live set, I need the Blue Live editor to expose the Java Blue Live Space, Live Code, and Options tabs so I can configure live objects, live-code text, repeat behavior, tempo, and Blue Live command-line options in the project.

**Why this priority**: Blue Live rendering can run without the editor, but meaningful project authoring requires the core Blue Live project data to load, edit, and save.

**Independent Test**: Open the Blue Live editor, edit Live Space grid state, saved sets, Live Code text, and Options values, save/reopen the project, and confirm the same data is restored.

**Acceptance Scenarios**:

1. **Given** a project contains Blue Live data, **When** the Blue Live editor opens, **Then** it displays the Live Space tab with tempo, repeat, trigger control, a live-object grid, and a saved-set list modeled after Java Blue.
2. **Given** the user changes tempo, repeat count, repeat enabled state, live-object enabled state, grid dimensions, or saved-set order/name, **When** the project is saved and reopened, **Then** those values are preserved in Java-compatible `.blue` XML.
3. **Given** the user opens the Live Code tab, **When** they edit text, **Then** the text is stored in the project's Blue Live data and restored on reopen.
4. **Given** the user opens the Options tab, **When** they edit advanced flags, command line, or complete override state, **Then** the values are stored in the project's Blue Live data and influence the next Blue Live compile according to Java Blue behavior.
5. **Given** a live object cell is double-clicked, **When** the cell contains a live object, **Then** only enabled/disabled state toggles in this part; opening a SoundObject editor is deferred.
6. **Given** the user presses `Trigger`, **When** the action runs in this part, **Then** it shows a `not yet implemented` alert and does not yet route live note text; the actual trigger-note routing is deferred to the later Score implementation.

---

### User Story 4 - Open Native Settings (Priority: P2)

As a macOS user, I need the app menu to follow standard macOS conventions and expose `Settings...` with Cmd-, so global MIDI and OSC settings have a predictable home.

**Why this priority**: The Settings entry is required before MIDI/OSC configuration work can land, and it changes the native menu surface shared by the rest of the app.

**Independent Test**: On macOS, open the application menu, confirm `About Blue` and `Settings...` appear in the expected positions, invoke `Settings...` with Cmd-,, and confirm a modal settings window opens with MIDI and OSC categories.

**Acceptance Scenarios**:

1. **Given** the app runs on macOS, **When** the user opens the first application menu, **Then** it is labeled `Blue` and contains standard macOS-style items including `About Blue`, `Settings...`, Services, Hide/Show, and Quit entries.
2. **Given** `About Blue` is visible, **When** the user invokes it in this part, **Then** the feature is explicitly deferred and does not need a complete About window.
3. **Given** the user chooses `Settings...` or presses Cmd-,, **When** the settings command runs, **Then** a modal BrowserWindow opens.
4. **Given** the Settings window opens, **When** it renders, **Then** it uses a dark split layout modeled on the provided reference, with categories on the left and the selected category editor on the right.
5. **Given** the Settings window is open, **When** the user selects `MIDI` or `OSC`, **Then** the right-side editor shows a clear placeholder for that category.

---

### User Story 5 - Evaluate Selected Code Into The Active Engine (Priority: P3)

As a composer editing global orchestra or score text, I need an `Evaluate Code` context action and Cmd-Return shortcut so selected Csound code or the current code context can be sent to the active live/realtime engine without restarting playback.

**Why this priority**: This is useful once Blue Live and realtime engine sessions exist, but it depends on the engine lifecycle and editor selection plumbing.

**Independent Test**: Start Blue Live, select code in the Global Orchestra or Global Score editor, invoke Evaluate Code from the context menu or Cmd-Return, and confirm the selected text is routed to Blue Live; repeat with the cursor inside an instrument/opcode in Global Orchestra or on a score line in Global Score and confirm the enclosing context or current line is routed correctly; repeat with only realtime playback running and confirm it routes to realtime playback.

**Acceptance Scenarios**:

1. **Given** Blue Live is running and text is selected in the Global Orchestra editor, **When** the user chooses `Evaluate Code`, **Then** the selected orchestra text is evaluated by the Blue Live engine.
2. **Given** Blue Live is running and text is selected in the Global Score editor, **When** the user chooses `Evaluate Code`, **Then** the selected score text is sent to the Blue Live engine.
3. **Given** Blue Live is stopped, realtime playback is running, and text is selected in a supported global editor, **When** the user chooses `Evaluate Code`, **Then** the selected text is sent to the realtime engine.
4. **Given** both Blue Live and realtime playback are running, **When** the user chooses `Evaluate Code`, **Then** Blue Live receives the selected text because Blue Live has priority for this command.
5. **Given** no supported engine is running, **When** the context menu opens, **Then** `Evaluate Code` is disabled; **Given** a supported engine is running but the current code context is empty, **When** the user invokes Cmd-Return, **Then** it is a no-op.

### Edge Cases

- Starting Blue Live while a previous Blue Live start/recompile is still in progress must not spawn duplicate Blue Live engines.
- Recompile failure must leave the toolbar in a stopped/error state and must not report Blue Live as running.
- Quitting the app must stop both realtime and Blue Live engine sessions.
- Loading a different project while Blue Live is running must stop the previous project's Blue Live session before the new project becomes active for live actions.
- Blue Live output must be distinguishable from realtime and disk-render output.
- Live Space must handle empty projects, empty grids, null cells, one-row/one-column grids, and saved sets that reference missing live objects.
- Java-compatible live data must preserve existing XML even where this part defers editing of a nested SoundObject.
- Settings must avoid opening multiple duplicate modal windows from repeated Cmd-, commands.
- Evaluate Code must not send whitespace-only selections.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST inspect Java Blue `BlueLiveToolBar`, `BlueLiveTopComponent`, `LiveData`, `LiveObject`, `LiveObjectBins`, `LiveObjectSet`, `LiveObjectSetList`, `RealtimeRenderManager.renderForBlueLive`, `CSDRender.generateCSDForBlueLiveImpl`, `CommandlineRunner.renderForBlueLive`, `BlueLiveBinding`, and `CSDRender.createAllNotesOffInstrument` before coding starts.
- **FR-002**: The toolbar `Blue Live` button MUST toggle Blue Live engine state and MUST NOT open, focus, or select `BlueLiveTopComponent`.
- **FR-003**: The Blue Live toolbar button MUST expose active, disabled, starting, stopping, and error states that reflect the Blue Live engine lifecycle.
- **FR-004**: Blue Live MUST compile the current project through a Blue Live-specific CSD generation path rather than standard realtime or disk-render generation.
- **FR-005**: Blue Live CSD generation MUST include Java-compatible Blue Live behavior: long-running live score context, global orchestra/score setup, always-on instruments, mixer support, `blueAllNotesOff`, Blue Live command-line handling, and `BLUE_LIVE` orchestra/score macros.
- **FR-006**: Blue Live MUST run through a separate blue-engine session from realtime playback so both may run concurrently.
- **FR-007**: Blue Live engine output MUST be routed to a distinct output context from realtime and disk rendering.
- **FR-008**: `Recompile` MUST stop any running Blue Live session, compile the current project state for Blue Live, and start a fresh Blue Live session.
- **FR-009**: `All Notes Off` MUST send the Java-compatible event `i "blueAllNotesOff" 0 1` to the running Blue Live engine.
- **FR-010**: `MIDI Input` toolbar behavior MUST remain deferred in this part; the control may remain disabled or visibly placeholder-only.
- **FR-011**: The TypeScript data model MUST load, save, deep-copy, and preserve Java-compatible `liveData`, `liveObjectBins`, `liveObjectSetList`, `liveObject`, command-line, repeat, tempo, repeat-enabled, and live-code XML.
- **FR-012**: The project snapshot and patch contract MUST expose editable Blue Live data to the renderer while keeping main-process `BlueData` as the canonical document.
- **FR-013**: The Blue Live editor MUST include tabs for `Live Space`, `Live Code`, and `Options`.
- **FR-014**: The Blue Live editor MUST explicitly defer the `SCO Pad` tab for this part.
- **FR-015**: Live Space MUST display a grid of live-object cells with Java-compatible columns/rows, enabled-state toggling, row/column insert/remove actions, and saved-set list operations.
- **FR-016**: Live Space MUST defer opening or editing nested SoundObjects beyond the LiveObject cell-level operations planned in this part.
- **FR-017**: Live Space trigger behavior MUST visibly defer note generation/routing in this part by showing a `not yet implemented` alert; the actual enabled live-object trigger-note routing is deferred to the later Score implementation.
- **FR-018**: Live Code MUST store project live-code text and provide a selection-or-context evaluation path to the active Blue Live engine when Blue Live is running.
- **FR-019**: Options MUST edit Blue Live advanced flags, command line, and complete-override values and these values MUST affect subsequent Blue Live compiles.
- **FR-020**: The native macOS application menu MUST be reworked to include a standard `Blue` application menu with `About Blue`, `Settings...`, Services, Hide/Show, and Quit items.
- **FR-021**: `Settings...` MUST use Cmd-, on macOS and open a modal BrowserWindow.
- **FR-022**: The Settings window MUST render a left category sidebar and right category editor area, with `MIDI` and `OSC` categories and placeholder editors in this part.
- **FR-023**: The `About Blue` behavior MUST be deferred while still allowing the menu item to exist.
- **FR-024**: Global Orchestra and Global Score editors MUST include an `Evaluate Code` context menu item and Cmd-Return shortcut.
- **FR-025**: `Evaluate Code` MUST evaluate the current selection when non-empty, otherwise the current editor context, using the enclosing instrument or opcode for Global Orchestra and the current line for Global Score, when Blue Live or realtime playback is running.
- **FR-026**: `Evaluate Code` MUST route to Blue Live when Blue Live is running, otherwise to realtime playback if realtime playback is running.
- **FR-027**: The implementation MUST include tests for Java-compatible Blue Live XML preservation, Blue Live CSD generation, Blue Live/realtime engine independence, toolbar behavior, Recompile, All Notes Off, Blue Live editor snapshot/patch behavior, Settings menu/window IPC, and Evaluate Code enablement/routing.

### Key Entities *(include if feature involves data)*

- **BlueLiveEngineSession**: Runtime state for the separate Blue Live blue-engine instance, including lifecycle status, output routing, and selected project revision.
- **LiveData**: Project-owned Blue Live configuration including command line settings, tempo/repeat values, live object bins, saved live object sets, and live-code text.
- **LiveObjectGrid**: Two-dimensional Live Space grid of nullable live-object cells, with column/row dimensions and cell enablement.
- **LiveObjectSetList**: Ordered list of named saved sets referencing live objects by stable unique id.
- **LiveCodeText**: Csound orchestra text stored with the project and optionally evaluated into the running Blue Live engine.
- **SettingsWindow**: Modal app-level window with category navigation and placeholder MIDI/OSC editors.
- **EvaluateCodeCommand**: Editor command that validates selected or contextual code and routes it to Blue Live or realtime playback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In manual verification, pressing the toolbar `Blue Live` button starts/stops Blue Live without changing the selected workbench editor in 100% of attempts.
- **SC-002**: A reviewer can run Blue Live and realtime playback concurrently for the same loaded project without one session stopping the other.
- **SC-003**: Recompile restarts Blue Live from the current project state within one user action and leaves no duplicate Blue Live engine process running.
- **SC-004**: Existing `.blue` fixtures containing Java Blue Live data can load and save without losing LiveData XML fields covered by this part.
- **SC-005**: The Blue Live editor restores Live Space, Live Code, and Options values after save/reopen in a manual scenario.
- **SC-006**: The macOS application menu exposes `Settings...` with Cmd-, and opens exactly one modal settings window with MIDI and OSC categories.
- **SC-007**: `Evaluate Code` is disabled when no engine is active, no-ops when the current code context is empty, and routes to the expected engine in all Blue Live/realtime state combinations.
- **SC-008**: Automated tests for the data, renderer, main-process IPC/menu, and engine-bridge contracts pass before implementation handoff is considered complete.

## Assumptions

- Blue Live Part 1 targets Electron desktop on macOS first while keeping menu code reasonable for Windows/Linux.
- `blue-engine` can support live score/orchestra submission through the existing or planned TypeScript client protocol commands; if a missing protocol capability is found, the task must add or document the smallest required bridge change.
- Main-process `BlueData` remains the canonical project document, and renderer edits flow through project snapshot/patch IPC.
- Nested SoundObject editing from Live Space, SCO Pad, MIDI Input runtime behavior, OSC implementation beyond Settings placeholders, and About Blue are out of scope for this part.
- Live Space trigger-note routing is deferred to the later Score implementation; in this part the Trigger control only surfaces a `not yet implemented` alert.
- The Settings window is app-level preference UI, not project-level settings persistence, for this part.
