# Feature Specification: Tempo Map Parity

**Feature Branch**: `045-tempo-map-parity`
**Created**: 2026-05-20
**Status**: Closed
**Input**: User description: "Fully implement Tempo for parity with Java Blue: tempo ruler bar with all interactions and context menu, line view shown by the arrow toggle, Edit Tempo Map menu entry with modal dialog, Java Blue parity, and tests."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Tempo From The Ruler Bar (Priority: P1)

As a composer working in the Score panel, I need the tempo row to behave like Java Blue's tempo region bar so I can read, add, edit, retime, change curve type, and delete tempo points directly from the timeline.

**Why this priority**: The visible row is the primary score-level tempo editing surface. Without it, tempo maps remain hidden behind data snapshots and users cannot perform the Java Blue workflow.

**Independent Test**: Load a project with multiple tempo points, enable the tempo row, and use the tempo row to add, edit, change curve type, and delete tempo points while confirming the canonical project snapshot and saved `.blue` data update correctly.

**Acceptance Scenarios**:

1. **Given** a project has a tempo map with one point, **When** the Score panel renders with the tempo row visible, **Then** the row shows a 20px tempo region bar whose first region displays the tempo value and disabled/enabled styling follows the Use Tempo state.
2. **Given** tempo is enabled, **When** the user double-clicks an empty region of the tempo row, **Then** a new tempo point is inserted at the clicked beat, snapped when snap is active, with its tempo initialized from the tempo at that beat and curve type `constant`.
3. **Given** a tempo point already exists near the double-clicked beat, **When** the user double-clicks that location, **Then** the existing point edit dialog opens instead of creating a duplicate.
4. **Given** the user right-clicks a tempo region, **When** the context menu opens, **Then** it offers Edit Tempo..., Constant, Linear, and Delete Tempo Point only when the selected point is not the first point.
5. **Given** the user changes a point tempo, beat position, curve type, or deletion from the bar, **When** the project is saved and reloaded, **Then** the tempo map preserves the same points, tempos, curve types, enabled state, and visible line-view state.

---

### User Story 2 - Expand And Edit The Tempo Line View (Priority: P1)

As a composer shaping accelerando and ritardando, I need the arrow toggle in the tempo row header to reveal Java Blue's tempo line editor so I can edit tempo points graphically with snapping, constrained dragging, and curve visualization.

**Why this priority**: The user explicitly called out the arrow-toggle line view. It is the graphical editor for curve shape and detailed point manipulation.

**Independent Test**: Toggle the tempo row arrow open, edit a tempo map in the line view with mouse insertion, dragging, snapping, modifier keys, context menu changes, and deletion, then collapse/reopen and verify the same map and visibility state remain.

**Acceptance Scenarios**:

1. **Given** the tempo row is collapsed, **When** the user activates the arrow toggle, **Then** an 80px line graph appears below the 20px tempo region bar and the row/header heights expand in sync.
2. **Given** the line graph is open, **When** the user activates the arrow toggle again, **Then** the line graph collapses and the tempo map visible state is updated.
3. **Given** the line graph is open and tempo is enabled, **When** the user clicks in empty line space, **Then** a tempo point is inserted at the clicked beat and tempo, clamped to the supported graph range.
4. **Given** a tempo point is selected, **When** the user drags it, **Then** dragging updates beat and tempo continuously, the first point remains fixed at beat 0, neighbors bound horizontal movement, tempo clamps to the graph range, snap applies unless bypassed, and Ctrl constrains to one axis.
5. **Given** the user right-clicks a point or segment, **When** the line view handles the event, **Then** non-first points can be deleted and segment curve type can be changed between Constant and Linear.

---

### User Story 3 - Edit The Complete Tempo Map From The Project Menu (Priority: P1)

As a composer doing bulk tempo-map editing, I need a Project menu entry that opens a modal table editor equivalent to Java Blue's Edit Tempo Map action.

**Why this priority**: Bulk editing is a separate Java workflow and is the most reliable way to review exact tempo point values.

**Independent Test**: Choose Project -> Edit Tempo Map..., add rows, edit beat and tempo values, delete rows, cancel and OK changes, and verify only OK replaces the canonical project tempo map.

**Acceptance Scenarios**:

1. **Given** a project is loaded, **When** the Project menu opens, **Then** Edit Tempo Map... is enabled and no longer calls the placeholder action.
2. **Given** no project is loaded, **When** the Project menu opens, **Then** Edit Tempo Map... is disabled.
3. **Given** the modal opens, **When** it displays tempo points, **Then** it shows a table with Beat, Tempo (BPM), and Delete columns plus an Add action.
4. **Given** the user edits the modal and cancels, **When** the dialog closes, **Then** the project tempo map is unchanged.
5. **Given** the user edits the modal and confirms, **When** the dialog closes, **Then** the modal's copied map replaces the canonical tempo map atomically and all score/ruler views update from the new snapshot.

---

### User Story 4 - Keep Tempo State Canonical Across Renderer, Main, And XML (Priority: P2)

As a maintainer, I need tempo edits to flow through typed project patches and existing `@blue/data` tempo models without renderer-only divergence.

**Why this priority**: Tempo affects playback timing, ruler conversion, CSD generation, and save/load. UI-only edits would corrupt parity.

**Independent Test**: Run shared/main/renderer tests that mutate every supported tempo-map operation and verify snapshots, patches, save/load, and playback/ruler conversions agree.

**Acceptance Scenarios**:

1. **Given** the renderer dispatches a tempo-map operation, **When** the main process applies it, **Then** the canonical `BlueData.getScore().getTimeContext().getTempoMap()` mutates through validated typed helpers.
2. **Given** tempo map visibility changes, **When** the project snapshot refreshes, **Then** the renderer receives the updated visibility and uses it to render the expanded/collapsed state.
3. **Given** invalid tempo data is supplied through the UI or patch boundary, **When** validation runs, **Then** the operation is rejected or clamped consistently with Java Blue behavior and the project remains valid.
4. **Given** the score ruler or playback clock needs beat/time conversion, **When** tempo is enabled with constant or linear points, **Then** conversion uses the same map data the edit surfaces display.

### Edge Cases

- First tempo point must remain at beat 0 and must not be deleted.
- Duplicate or nearly duplicate beat positions must edit the existing point or be bounded away from neighbors instead of producing ambiguous order.
- Tempo values must remain positive; the line graph clamps interactive tempo editing to the Java view range of 30 to 240 BPM while the point/dialog editor accepts Java's point-edit range of 1 to 999 BPM.
- Disabled tempo maps still render the row and points in disabled styling but do not permit direct point edits from Java-style interactive surfaces.
- Collapsed line-view state must survive project save/reload through the tempo map visible flag.
- Snap must apply during insertion/dragging when enabled and must honor the existing score snap value and modifier-key bypass rules.
- Modal edits must operate on a copy and must not leak partial changes while the dialog is open.
- Projects with old or malformed tempo-map XML must still load through existing `@blue/data` fallback behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST use Java Blue's `TempoRegionBar`, `TempoEditor`, `TempoEditorPanel`, `TempoEditorControl`, `TempoMapEditorPanel`, and `EditTempoMapAction` as the parity source before coding.
- **FR-002**: The shared project snapshot MUST include tempo map enabled state, visible line-view state, and ordered tempo points with beat, tempo, curve type, and enough position data to preserve non-beat time bases where the existing `@blue/data` model supports them.
- **FR-003**: The shared patch surface MUST support validated tempo operations: set enabled, set visible, add point, update point, set curve type, remove point, and replace map.
- **FR-004**: The Score panel MUST replace the current static tempo summary row with a Java-style 20px tempo region bar rendered from canonical tempo-map data.
- **FR-005**: The tempo region bar MUST draw one region per tempo point, show tempo labels when the region is wide enough, visually distinguish selected/hovered/disabled state, and show Constant/Linear curve indicators equivalent to Java Blue.
- **FR-006**: The tempo region bar MUST show tooltips with beat, tempo, and curve type for the hovered region.
- **FR-007**: Double-clicking the tempo region bar when tempo is enabled MUST add a point at the clicked beat, snapped when snap is active, unless a point exists within the Java tolerance, in which case it opens the point edit dialog.
- **FR-008**: Right-clicking a tempo region MUST open a context menu with Edit Tempo..., Constant, Linear, and Delete Tempo Point, with Constant/Linear disabled for the current curve type and Delete unavailable for the first point.
- **FR-009**: The point edit dialog opened from the region bar MUST allow editing position and tempo, keep the first point fixed at beat 0, bound positions between neighboring points, and commit only valid updates.
- **FR-010**: The left tempo row header MUST include a Use Tempo checkbox wired to canonical tempo-map enabled state and an arrow button wired to canonical tempo-map visible state.
- **FR-011**: Activating the arrow button MUST expand/collapse a line graph below the tempo region bar, changing the tempo row/header height from 20px collapsed to 100px expanded.
- **FR-012**: The expanded line graph MUST draw the tempo curve using constant step segments or linear segments, point handles, selected-point highlighting, a bottom border, and a snap grid when snap is enabled.
- **FR-013**: The expanded line graph MUST support point insertion, point dragging, selected-point deletion, segment curve context menu, snap behavior, Shift snap bypass, Ctrl axis-constrained drag, first-point fixed behavior, neighbor horizontal bounds, and tempo-range clamping.
- **FR-014**: Project -> Edit Tempo Map... MUST be implemented as a real menu command enabled only when a project is loaded.
- **FR-015**: The Edit Tempo Map modal MUST edit a copy of the map in a table with Beat, Tempo (BPM), Delete, Add, OK, and Cancel behaviors matching Java Blue's table workflow.
- **FR-016**: The Edit Tempo Map modal Add action MUST add a point at last beat + 4.0 with the previous tempo and Constant curve type; Delete MUST be disabled when only one point remains.
- **FR-017**: OK in the Edit Tempo Map modal MUST atomically replace the canonical tempo map and Cancel MUST leave it unchanged.
- **FR-018**: All tempo changes MUST update renderer state through existing project snapshot refresh/optimistic patch patterns and MUST be persisted by existing `.blue` XML save/load.
- **FR-019**: The implementation MUST repair any existing `@blue/data` listener or snapshot gaps that prevent `TempoMap.visible` changes from reaching the renderer.
- **FR-020**: Automated tests MUST cover shared patch validation, snapshot creation, save/load of enabled/visible/point data, region-bar interactions, line-view interactions, Project menu wiring, and modal OK/Cancel behavior.

### Key Entities *(include if feature involves data)*

- **Tempo Map**: Canonical score time context object containing enabled state, visible line-view state, and ordered tempo points.
- **Tempo Point**: A point with beat position, tempo BPM, curve type, and original time position metadata where available.
- **Tempo Region Bar**: Collapsed timeline row that displays one horizontal region per tempo point and supports direct point edits.
- **Tempo Line View**: Expanded graph editor that shows and edits the tempo curve.
- **Tempo Map Modal Draft**: A copied tempo-map table state used by the modal until OK replaces the canonical map.
- **Tempo Patch**: Typed project-document mutation that updates canonical `BlueData` tempo state from renderer or menu commands.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can perform the Java Blue tempo row workflow: toggle Use Tempo, add a point by double-click, edit a point, change Constant/Linear curve, and delete a non-first point.
- **SC-002**: A reviewer can toggle the arrow and see the tempo row/header height change between collapsed 20px and expanded 100px, with the expanded state surviving save/reload.
- **SC-003**: A reviewer can edit points in the expanded line graph with snapping, Shift bypass, Ctrl constrained drag, and right-click curve changes.
- **SC-004**: A reviewer can use Project -> Edit Tempo Map... to add, edit, delete, cancel, and OK a complete map, with cancel leaving the project unchanged.
- **SC-005**: Automated tests cover every functional requirement that mutates tempo-map state and fail if tempo edits stop reaching the canonical project document.
- **SC-006**: Existing tempo-map CSD/render/playback conversion tests continue to pass after UI and patch work.

## Assumptions

- The renderer may use React/Radix-native equivalents of Java Swing menus and dialogs, but user-visible behavior and state transitions should match Java Blue.
- Java Blue's exact colors are a reference, not a byte-perfect requirement; visual parity means row heights, state, labels, curve indicators, and interaction feedback match the Java intent within the existing Electron theme.
- Undo/redo is not required unless an app-wide undo stack already exists for project-document patches; this spec requires atomic patching and safe cancel behavior.
- Nested score paths continue to show the shared project tempo map; score-object-local tempo maps are out of scope for this slice.
- Meter-map editing is intentionally split into Spec 046.
