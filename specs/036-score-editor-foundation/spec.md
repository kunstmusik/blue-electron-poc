# Feature Specification: Score Editor Foundation

**Feature Branch**: `036-score-editor-foundation`  
**Created**: 2026-05-03  
**Status**: Draft  
**Input**: User description: "The next major feature I'd like to work on is implementing the Score editor. This editor is a big feature with many parts. Requirements include: 1. Must use Java Blue as reference for general component breakdown and UI layout. Parity with Java Blue is the goal. 2. Need to implement ScoreObject Editors for all ScoreObjects (i.e., SoundObjects, AudioClips). 3. Should support score rulers and time system. 4. ScoreObject Properties panel should be implemented as part of this work. Review Java Blue score data and UI. Evaluate and create plan to organize work into one or many specs."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View The Real Score Timeline (Priority: P1)

As a composer opening a project in blue-electron, I need `ScoreTopComponent` to show a real Java Blue-style score timeline instead of a placeholder so I can inspect score structure, layer-group ordering, and object placement in one workbench surface.

**Why this priority**: The score feature is unusable until the main panel renders actual score content. This is the first visible parity milestone and the prerequisite for every later score workflow.

**Independent Test**: Load representative projects containing `PolyObject`, `AudioLayerGroup`, and `PatternsLayerGroup` content, open `ScoreTopComponent`, and verify the panel renders the real score shell and mixed layer-group rows without placeholder content.

**Acceptance Scenarios**:

1. **Given** a project contains mixed score layer groups, **When** the user opens `ScoreTopComponent`, **Then** the panel renders a Java Blue-style score shell with left headers, timeline rows, and top score-path controls.
2. **Given** the root score contains `PolyObject`, `AudioLayerGroup`, and `PatternsLayerGroup` entries, **When** the score panel loads, **Then** each layer group appears in project order using the correct row/header surface for its type.

---

### User Story 2 - Use Rulers And Timeline State (Priority: P1)

As a composer aligning material in time, I need the score panel to honor Java Blue's ruler rows, zoom, snap, and time-display state so the timeline is readable and behaves like the reference app.

**Why this priority**: Rulers and timeline state are part of the score editor's basic usability, not optional polish. Without them, object placement and later editing flows are difficult to verify.

**Independent Test**: Open the score panel, change row visibility and ruler settings, adjust zoom or snap, reload the project, and confirm the score shell reconstructs the same timeline state from project data.

**Acceptance Scenarios**:

1. **Given** the score has tempo, meter, marker, and ruler rows enabled, **When** the panel renders, **Then** the visible row stack and ruler displays match the current score time state.
2. **Given** the user changes supported score timeline settings such as snap, zoom, row visibility, or primary/secondary ruler display, **When** the panel refreshes or the project reloads, **Then** those settings persist through the canonical score document state.

---

### User Story 3 - Navigate Nested Score Paths (Priority: P2)

As a composer working inside nested `PolyObject` structures, I need the score panel to navigate between the root score and nested layer groups while preserving per-path scroll context so deep score editing remains manageable.

**Why this priority**: Nested score-path navigation is a defining part of Java Blue's score workflow and should be established before auxiliary editor work depends on it.

**Independent Test**: Open a nested `PolyObject`, navigate into it from the score shell, scroll within the nested view, return to the root score, and confirm both path changes and stored scroll positions behave predictably.

**Acceptance Scenarios**:

1. **Given** a visible `PolyObject` can be opened as a nested score path, **When** the user enters that object from the score shell, **Then** the panel switches to the nested layer-group view and updates the score-path bar.
2. **Given** the user navigates between root and nested score paths, **When** they revisit a path, **Then** the panel restores that path's previous scroll context instead of always resetting to the origin.

### Edge Cases

- What happens when no project is loaded and the user opens `ScoreTopComponent`?
- What happens when a project uses a layer-group type that the current renderer does not yet know how to display?
- What happens when older project XML omits newer score time-state fields such as row visibility or secondary ruler settings?
- What happens when the currently open nested score path becomes invalid because the backing layer group or sound object is removed?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review the Java Blue score shell anchors before coding begins, including `ScoreTopComponent`, `ScoreController`, `ScorePath`, `ScoreObjectBar`, `TimeBar`, `MarkersBar`, `MeterRegionBar`, `TempoEditorControl`, `TempoEditorPanel`, `LayerGroupUIProviderManager`, `PolyObjectUIProvider`, `AudioLayerGroupUIProvider`, `PatternsLayerGroupUIProvider`, and `TimeState`.
- **FR-002**: `@blue/data` MUST close the remaining score `TimeState` parity needed by the score shell, including snap state, zoom/pixel-second behavior, primary and secondary ruler display, row visibility, and persisted SMPTE-related fields.
- **FR-003**: The shared project document contract MUST grow a typed score snapshot and score patch surface instead of exposing only toolbar transport data for tempo, meter, and render bounds.
- **FR-004**: The renderer MUST replace the current `ScoreTopComponent` placeholder with a dedicated Java Blue-style score shell that includes the score-path bar, left-side row headers, scrollable timeline area, and top-level score controls.
- **FR-005**: The score shell MUST render root score layer groups for `PolyObject`, `AudioLayerGroup`, and `PatternsLayerGroup` using provider-style composition so later specs can extend surfaces by layer-group type.
- **FR-006**: The score shell MUST support nested `PolyObject` path navigation and preserve per-path scroll state in a Java-compatible way.
- **FR-007**: The score shell MUST render the supported timeline rows and rulers from canonical score state, including tempo, meter, markers, primary ruler, and optional secondary ruler.
- **FR-008**: Timeline scale, snap, and time-display behavior MUST use canonical score time context and time state rather than renderer-only derived defaults.
- **FR-009**: The score shell MUST present clear empty or unsupported states when no project is loaded or when a score or layer-group type is not yet renderable.
- **FR-010**: The implementation MUST add tests covering score snapshot and patch behavior, `TimeState` XML round-trip compatibility, score-shell rendering for mixed layer-group types, ruler and row-visibility behavior, and nested score-path navigation.

### Key Entities *(include if feature involves data)*

- **Score Graph Snapshot**: Renderer-facing view of the root score and nested layer groups, including the layer-group tree and the score objects needed to render timeline rows.
- **Score Time State Snapshot**: Canonical score-editor state for snap, zoom, ruler display, row visibility, and related timeline preferences.
- **Score Path Session**: The current root-or-nested layer-group context plus scroll restoration data needed to move between score views.
- **Layer Group Panel Binding**: The pairing of a layer-group snapshot with its timeline-row surface and left-header surface.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can open `ScoreTopComponent` on a representative project and see real `PolyObject`, audio-layer, and pattern-layer timeline rows instead of placeholder content.
- **SC-002**: A reviewer can change supported score timeline state and observe the shell reconstruct the same ruler and row configuration after reload.
- **SC-003**: A reviewer can enter and exit nested `PolyObject` score paths while preserving per-path scroll context.
- **SC-004**: Automated tests cover the typed score bridge, `TimeState` persistence, score-shell rendering, and nested score-path behavior.

## Assumptions

- This foundation slice delivers the canonical score document bridge and the main score shell; the auxiliary ScoreObject editor and ScoreObject properties surfaces are planned in later score specs.
- Direct manipulation parity such as drag-drop, clipboard commands, and nudge or align shortcuts can be deferred if they do not block the shell, rulers, and path-navigation milestone.
- The currently modeled TypeScript layer-group types are sufficient for the first visible score shell; unsupported Java-only layer-group variants can surface clear fallback states until later work lands.
