# Feature Specification: Java Main Toolbar Parity

**Feature Branch**: `020-main-toolbar-parity`
**Created**: 2026-04-23
**Status**: Draft
**Input**: User description: "Update the main header to be like Java Blue's MainToolBar with transport controls, playhead display, selection display, and blueLive buttons. Find corresponding Lucide icons for transport buttons. Main concern is layout and functionality, but styling should use slightly rounded rectangles as has been used so far in the app. Move the Window button and dropdown to the system menu bar. When a file opens, change the window title to `Blue - [name of project.blue]` instead of showing project info in the top-left header."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Use a Java Blue-style main toolbar (Priority: P1)

As a composer working in the main project view, I need the app header to behave like Java Blue's `MainToolBar` so transport, playhead, selection, and Blue Live controls are available in one stable location.

**Why this priority**: The main toolbar is persistent app chrome and is part of the core Java Blue workflow. Replacing the current generic header is a visible parity gap.

**Independent Test**: Open a project in the Electron app and verify the top toolbar exposes transport controls, playhead display, selection display, and Blue Live controls in a Java Blue-inspired layout without relying on the current header buttons.

**Acceptance Scenarios**:

1. **Given** a project is open in the workbench, **When** the app renders the top toolbar, **Then** it shows transport controls, a playhead display, a selection display, and Blue Live controls in a single horizontal toolbar.
2. **Given** playback is idle, starting, playing, or stopping, **When** the user looks at the toolbar, **Then** the transport controls reflect the current playback state without stale or contradictory affordances.
3. **Given** no project is loaded, **When** the toolbar is shown, **Then** controls that require project data present a disabled or empty state rather than misleading values.
4. **Given** playback is active, **When** the playhead display updates, **Then** it reflects engine-authored transport position closely enough to avoid visible drift while still animating smoothly between updates.

---

### User Story 2 - Use toolbar controls and system menus in the right place (Priority: P1)

As a composer navigating the app, I need header and menu responsibilities to match Java Blue more closely so toolbar actions live in the toolbar and window-management actions live in the system menu bar.

**Why this priority**: The current header mixes file commands, playback controls, and the Window dropdown. The user explicitly wants the Window menu moved to the native app menu and the window title updated on file open.

**Independent Test**: Open a project, inspect the native application menu and window title, and confirm window-management actions are available from the system menu while the BrowserWindow title changes to `Blue - [project.blue]`.

**Acceptance Scenarios**:

1. **Given** the workbench is open, **When** the user opens the native application menu, **Then** window-management actions currently exposed through the in-app Window dropdown are available from a system `Window` menu.
2. **Given** a `.blue` file is opened or saved as a new file, **When** the load or save completes, **Then** the OS window title updates to `Blue - [file name].blue`.
3. **Given** the current renderer header actions are migrated, **When** the user opens the native `File` menu, **Then** `Open`, `Save`, and `Save As` are available there instead of in the renderer toolbar.
4. **Given** the new toolbar is active, **When** the user looks at the top-left app chrome, **Then** redundant in-header project metadata and branding are no longer required to identify the current file.

---

### User Story 3 - Keep the toolbar visually aligned with the current Electron port (Priority: P2)

As a user moving between the Java reference and the Electron port, I need the new toolbar to feel like Java Blue while still matching the rounded-rectangle control style already established in the app.

**Why this priority**: The user explicitly wants parity in layout and functionality first, but also wants the control styling to stay coherent with the current app rather than introducing a new visual language.

**Independent Test**: Compare the toolbar against the current Electron styling and verify the controls use the established rounded-rectangle shape and spacing while preserving the Java Blue grouping.

**Acceptance Scenarios**:

1. **Given** the toolbar is rendered, **When** a user compares it with the rest of the Electron app, **Then** buttons and displays use the same slightly rounded rectangular treatment already used elsewhere in the UI.
2. **Given** the toolbar contains multiple control groups, **When** the layout is rendered at normal desktop widths, **Then** transport, playhead, selection, and Blue Live groups remain visually distinct and readable.

---

### User Story 4 - Resolve current-header leftovers cleanly (Priority: P3)

As an implementer, I need a clear disposition for the current header-only items so the migration to the Java Blue toolbar does not leave duplicated or conflicting app chrome.

**Why this priority**: The current header still contains file buttons, branding, and a playback status indicator that do not map directly to the requested Java toolbar scope. Their disposition affects scope and UX.

**Independent Test**: Review the final toolbar/header composition and verify each current top-header element is either moved, preserved in a defined place, or removed according to the approved spec.

**Acceptance Scenarios**:

1. **Given** the new toolbar replaces the current header, **When** the migration is complete, **Then** each existing header function has a single defined destination or removal decision.
2. **Given** a user previously relied on a current header action, **When** the new toolbar ships, **Then** that action is either still discoverable in its new location or explicitly removed as part of the approved scope.

### Edge Cases

- What should the playhead and selection displays show when no score timing data or selection data is available yet?
- What happens to toolbar state when a file is opened, saved as a new name, or closed?
- How should toolbar buttons behave while playback is starting or stopping?
- How should the playhead display handle playback start, stop, loop, or locate discontinuities without visibly smoothing across jumps that should snap?
- How should the playhead display recover if authoritative engine updates arrive sparsely or briefly stall?
- What happens if the native `Window` menu and workbench state get out of sync?
- How should Blue Live controls behave when their backing functionality is unavailable or incomplete in the current Electron port?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The slice MUST inspect Java Blue `MainToolBar`, `TransportControls`, `PlayheadDisplayPanel`, `SelectionDisplayPanel`, and `BlueLiveToolBar` behavior before changing the Electron header.
- **FR-002**: The top app chrome for the project view MUST be reorganized around a Java Blue-style main toolbar rather than the current generic header layout.
- **FR-003**: The toolbar MUST expose transport controls corresponding to Java Blue's previous marker, next marker, rewind, play, stop, follow-playback toggle, and loop toggle semantics.
- **FR-004**: The toolbar MUST expose a playhead display area that communicates the current playhead position and empty-state behavior when no project data is available.
- **FR-005**: The toolbar MUST expose a selection display area that communicates selection start, selection end, and selection duration, or a clear placeholder state when no selection is active.
- **FR-006**: The toolbar MUST expose Blue Live controls corresponding to Java Blue's `blueLive`, `Recompile`, `All Notes Off`, and `MIDI Input` controls.
- **FR-007**: The current in-app Window button/dropdown MUST be removed from the renderer header and replaced by a native application `Window` menu entry point.
- **FR-008**: Opening a `.blue` file and saving it under a new file name MUST update the OS window title to `Blue - [file name].blue`.
- **FR-009**: The current top-header `Open`, `Save`, and `Save As` actions MUST move fully into the native `File` menu, matching Java Blue's menu-bar ownership rather than remaining in renderer chrome.
- **FR-010**: The current top-header `Blue` wordmark MUST be removed from the project header once the native shell/menu bar and BrowserWindow title provide application and file identity.
- **FR-011**: The current playback status pill (`Stopped` / `Playing via blue-engine`) MUST be removed from the top app chrome; playback state MUST instead be conveyed through transport button state and the realtime playhead display, with any bottom status-bar parity deferred to a later slice.
- **FR-012**: The toolbar styling MUST stay consistent with the Electron app's existing slightly rounded rectangular control treatment.
- **FR-013**: The spec and plan MUST record the transport-to-icon mapping used for the Electron implementation so the icon choices are traceable to the Java reference.
- **FR-014**: This slice MUST treat broader Java `File` menu parity as out of scope, except for relocating the currently implemented `Open`, `Save`, and `Save As` actions into the native `File` menu.
- **FR-015**: While playback is active, the playhead display MUST use engine-authored playback position as its authoritative source; renderer-side interpolation or smoothing MAY be used between engine updates as long as it does not obscure real transport discontinuities.
- **FR-016**: The playhead path MUST avoid per-frame renderer IPC from the main process; precision MUST come from authoritative engine timing plus local display interpolation rather than a pure renderer wall-clock estimate.

### Key Entities *(include if feature involves data)*

- **Main Toolbar Group**: A persistent toolbar section such as transport, playhead display, selection display, or Blue Live controls.
- **Transport Action**: A top-level playback or navigation control matching Java Blue semantics, including marker navigation, rewind, play, stop, follow playback, and loop.
- **Display Panel State**: The visible value set for the playhead or selection display, including loaded, empty, or disabled states.
- **Window Menu Entry**: A native application menu action used to surface workbench window-management functions instead of a renderer-owned dropdown.
- **Window Title State**: The current BrowserWindow title derived from the loaded `.blue` file name.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can open a project and see transport controls, playhead display, selection display, and Blue Live controls in the top toolbar without needing the current header button layout.
- **SC-002**: A reviewer can open the native application menu and access a `Window` menu instead of relying on the current in-app Window dropdown.
- **SC-003**: A reviewer can open `example.blue` and observe the window title change to `Blue - example.blue`.
- **SC-004**: A reviewer can compare the toolbar with the rest of the Electron app and confirm the controls use the existing rounded-rectangle styling rather than a conflicting control shape.
- **SC-005**: A reviewer can inspect the planning artifacts and identify the chosen icon mapping for the transport controls.
- **SC-006**: A reviewer can start and stop playback repeatedly and observe that the playhead display advances smoothly while playing, then snaps cleanly back to the correct anchor state when playback stops or relocates.

## Assumptions

- The current Electron app will keep using the existing renderer, main-process menu, and workbench architecture rather than introducing a new shell framework for this slice.
- The Java BSB widget info button shown in `MainToolBar` is not part of the requested scope unless it becomes necessary during planning.
- The toolbar work will target the desktop workbench layout; mobile or narrow-width responsive behavior is not a primary requirement for this slice.
- Wider Java `File` menu commands such as `New Project`, `Import MIDI File`, `Render to Disk`, and `Recent Projects` remain follow-on work unless separately specified.
