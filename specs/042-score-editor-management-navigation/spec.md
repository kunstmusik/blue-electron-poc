# Feature Specification: Score Editor Management and Navigation

**Feature Branch**: `042-score-editor-management-navigation`  
**Created**: 2026-05-07  
**Status**: Complete

**Input**: User description: "Re-review Spec 042 and extend it to cover Java Blue marker parity plus ruler render start or end interactions that should land before marker creation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set Render Range From The Ruler (Priority: P1)

As a composer preparing a section to audition or render, I need the root score ruler to set render start and render end directly so I can define the active render range without leaving the score shell.

**Why this priority**: The underlying project data already stores render start and end, but the score shell still lacks the Java-style ruler interactions and visual feedback. This is the clearest missing prerequisite before adding richer marker editing on the same surface.

**Independent Test**: Open the root score shell, click the ruler to set a start point, drag the ruler to create a range, save the project, reload it, and verify the same render selection is visible and preserved.

**Acceptance Scenarios**:

1. **Given** the root score is open, **When** the user clicks the ruler without dragging, **Then** the render start moves to that location, any prior render end clears, and the shell updates to show the new single-point selection.
2. **Given** the root score is open, **When** the user drags across the ruler, **Then** the shell shows an ordered render range with visible start and end markers even if the drag direction is reversed.
3. **Given** the user saves and reloads a project after changing the render range from the ruler, **When** the score shell reopens, **Then** the same render start and render end values are restored from project data.

---

### User Story 2 - Create And Edit Markers From The Score Shell (Priority: P1)

As a composer navigating long scores, I need Java-style marker creation, movement, renaming, and menu access so I can annotate structural points and reposition them quickly from the score workflow.

**Why this priority**: Marker navigation is not very useful unless the shell also supports marker authoring and editing. The score already renders marker labels, but the interactive parity work is still missing.

**Independent Test**: Use the root score shell to create a marker from the ruler and from the project menu or shortcut, move it, rename it, save the project, and confirm the marker survives reload in its new state.

**Acceptance Scenarios**:

1. **Given** the root score is open, **When** the user uses the supported ruler gesture or menu or shortcut for marker creation, **Then** a new marker appears at the requested time and is immediately visible in the score shell.
2. **Given** an existing marker in the root score shell, **When** the user drags it or renames it, **Then** the updated time and name are reflected immediately in the visible marker row.
3. **Given** the user saves and reloads a project after editing markers, **When** the project reloads, **Then** the created, moved, and renamed markers match the last committed state.

---

### User Story 3 - Manage Score Structure From The Shell (Priority: P2)

As a composer working on large score structures, I need the score shell's `Manage` workflow and related manager dialogs so I can reorganize root and nested score structure without relying on scattered context-menu affordances.

**Why this priority**: The `Manage` affordance is still a visible shell gap, but the ruler render-range and marker authoring work are more concrete parity blockers and should land first.

**Independent Test**: Open the score shell, invoke the `Manage` workflow, perform a supported reorder, rename, add, or remove action on a root or nested group, and verify the visible score updates without reopening the panel.

**Acceptance Scenarios**:

1. **Given** the user invokes the `Manage` affordance from the score shell, **When** a supported score-manager or layer-group-manager flow opens, **Then** the user can inspect and change root or nested structure without leaving the score workflow.
2. **Given** the user applies a supported structure change such as reorder, rename, add, or remove, **When** the dialog commits, **Then** the canonical score graph and visible shell update coherently.

---

### User Story 4 - Navigate And Follow Large Scores Predictably (Priority: P2)

As a composer working in long projects, I need marker-centered navigation, a real marker-related auxiliary workflow, and coherent follow-playback behavior so I can move around the score without losing context.

**Why this priority**: Navigation and follow polish still matter, but they should build on top of working render-range and marker authoring behavior instead of preceding it.

**Independent Test**: Use the supported marker-navigation or marker-list workflow to jump around the score, enable follow playback and follow-on-render-start behavior, and verify the score shell and related panels stay synchronized.

**Acceptance Scenarios**:

1. **Given** the project includes markers, **When** the user invokes the supported marker-navigation or marker-list workflow, **Then** the score view moves to the requested region predictably.
2. **Given** follow playback is enabled, **When** playback starts or advances, **Then** the score shell updates the visible region or pointer state predictably instead of leaving the follow setting as a menu-only placeholder.
3. **Given** a score-adjacent panel such as markers remains part of this slice, **When** the user opens it, **Then** the app shows a real supported workflow or an explicit deferred state instead of a silent placeholder.

### Edge Cases

- What happens when ruler render-range or marker-authoring gestures are invoked while the user is editing a nested score path instead of the root timeline?
- What happens when a ruler drag is shorter than the drag threshold or ends before the original anchor, causing the selection direction to reverse?
- What happens when marker creation, marker navigation, or follow-playback commands are invoked with no project loaded or with an empty marker list?
- What happens when a project already contains saved render start or end values or markers and the user changes ruler display settings before continuing to edit them?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The root score ruler MUST allow users to set render start with a click and define a render start or render end range with a drag gesture.
- **FR-002**: The score shell MUST visibly render the current render start point, render end point when present, and the selected render range.
- **FR-003**: Ruler-driven render start or render end edits MUST update canonical project data and survive save or reload.
- **FR-004**: Ruler-driven render selection MUST honor the score's current snap behavior when snapping is enabled, with a supported way to bypass snap during direct manipulation.
- **FR-005**: The root score workflow MUST allow users to create markers from the ruler and from a project menu or shortcut entry.
- **FR-006**: Users MUST be able to move and rename existing markers directly from the root score shell.
- **FR-007**: Marker edits MUST update canonical project marker data and survive save or reload.
- **FR-008**: The score workflow MUST provide at least one supported marker-centered navigation workflow beyond static ruler labels, such as marker navigation commands or a marker list surface.
- **FR-009**: The score shell MUST provide a real `Manage` workflow for supported root and nested score-structure operations instead of a non-functional button shell.
- **FR-010**: Supported management and navigation operations MUST keep the score shell, auxiliary panels, and canonical project data synchronized.
- **FR-011**: Playback-follow and time-pointer behavior in the score shell MUST remain coherent with the ruler and navigation state when enabled.
- **FR-012**: Score-adjacent panels included in this slice MUST render supported workflows or explicit deferred messaging instead of silent placeholders.
- **FR-013**: Direct manipulation already delivered in Spec 036 MUST be treated as existing scope; this slice should only change that behavior when required to support the management or navigation workflows above.
- **FR-014**: Automated tests MUST cover render-range ruler interactions, marker authoring or navigation, supported manage flows, and any follow-playback or pointer behavior claimed by this slice.

### Key Entities *(include if feature involves data)*

- **Render Range Selection**: The root-timeline render start anchor and optional render end boundary currently stored in project data and visualized in the score shell.
- **Marker Authoring Target**: A visible root-timeline marker that can be created, moved, renamed, and used as a navigation destination.
- **Score Management Operation**: A canonical mutation to supported root or nested score structure initiated from manager flows.
- **Score Navigation Session**: The shell state used to move among render anchors, markers, manager selections, and follow-playback destinations.
- **Score Follow State**: The shell-local state used to keep the visible timeline aligned with playback and any visible time pointer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can set render start from the ruler, drag a render range, and reopen the project with the same saved range still visible.
- **SC-002**: A reviewer can create a marker from the ruler and from the project menu or shortcut, then move and rename it without reopening the score shell.
- **SC-003**: A reviewer can use the shell's `Manage` workflow to perform supported structure-management tasks without leaving or reopening the score panel.
- **SC-004**: A reviewer can use supported marker-navigation or marker-list workflows and observe predictable viewport updates in a larger score.
- **SC-005**: Automated tests cover the supported render-range, marker, manage, and follow-playback behaviors claimed by this slice.

## Assumptions

- Specs `039-sound-score-object-editor`, `040-pianoroll-score-object-editor`, and `041-jmask-score-object-editor` are complete, so this slice can stay focused on shell-level score management and navigation.
- Root-timeline ruler interactions remain the only place where render-range editing and marker authoring occur in this slice, matching the Java score-shell behavior.
- The current project data already persists render start, render end, and marker values; this slice adds missing shell interactions and canonical mutation paths rather than a new persistence system.
- A broader score navigator or richer marker table workflow may still require a later follow-up if the bounded marker-list surface in this slice is not sufficient.
