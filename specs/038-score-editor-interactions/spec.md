# Feature Specification: Score Editor Interactions

**Feature Branch**: `038-score-editor-interactions`  
**Created**: 2026-05-03  
**Status**: Draft  
**Input**: User description: "Plan the score follow-up slice after the score shell and auxiliary editor surfaces, focusing on deeper Java Blue interaction parity."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manipulate Score Objects Directly In The Timeline (Priority: P1)

As a composer arranging material in the score, I need direct selection, movement, resizing, clipboard, and snap-aware manipulation in the timeline so the score behaves like Java Blue during everyday editing.

**Why this priority**: Once the shell and auxiliary editors exist, direct manipulation becomes the main gap between a visible score panel and a practical score editor.

**Independent Test**: Select score objects and audio clips in the timeline, move or resize them with mouse and keyboard actions, copy and paste them, and verify the timeline and canonical score state stay synchronized.

**Acceptance Scenarios**:

1. **Given** one or more score objects are selected, **When** the user moves, resizes, nudges, or deletes them through supported timeline actions, **Then** the score updates in a snap-aware, time-context-aware way.
2. **Given** score objects are copied or cut from the timeline, **When** the user pastes them into a compatible destination, **Then** the score reconstructs the copied content without corrupting layer membership or timing.

---

### User Story 2 - Manage And Navigate Complex Scores (Priority: P1)

As a composer working on large projects, I need score-management and navigation tools such as the score manager, layer-group manager, marker navigation, and the score navigator so I can keep complex score structures organized.

**Why this priority**: Java Blue's score workflow relies on more than direct object manipulation. The score-management and navigation tools are how larger projects stay usable.

**Independent Test**: Open the score manager and layer-group manager flows, add or reorder supported groups or layers, use supported marker and navigator tools, and verify the shell updates without reopening.

**Acceptance Scenarios**:

1. **Given** the user wants to change root or nested score structure, **When** they use supported manager flows, **Then** the visible score updates and the canonical score graph remains valid.
2. **Given** the project includes markers or a large score range, **When** the user invokes navigation controls such as marker navigation or the score navigator, **Then** the timeline view moves predictably to the requested region.

---

### User Story 3 - Close Remaining Score Parity Gaps (Priority: P2)

As a composer expecting Java Blue score parity, I need the remaining score follow-up behaviors such as drag-and-drop affordances, context-menu actions, playback-follow polish, and any editor or model gaps surfaced by the earlier score specs to be resolved intentionally rather than left implicit.

**Why this priority**: These remaining gaps are important, but they should land only after the shell and auxiliary editors are stable enough to support them safely.

**Independent Test**: Exercise the follow-up interaction set on representative projects and verify the remaining unsupported score workflows are either implemented or explicitly surfaced as deferred work.

**Acceptance Scenarios**:

1. **Given** the user invokes Java-style score context or menu actions that depend on the score shell, **When** the interaction is supported in this slice, **Then** the visible score and canonical state stay coherent.
2. **Given** an interaction or editor parity gap still depends on missing TypeScript model work, **When** the user reaches that path, **Then** the app shows a clear unsupported state or the work is explicitly captured as a follow-on gap instead of failing silently.

### Edge Cases

- What happens when the user drags or pastes score objects into a layer or layer-group type that cannot accept them?
- What happens when the score manager or navigator is open while the underlying project changes or reloads?
- What happens when marker or playback-follow navigation targets a region outside the currently materialized timeline size?
- What happens when Java-only score-object types or legacy clipboard content appear in a workflow that the earlier score specs did not cover?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review the Java Blue score interaction anchors before coding begins, including `ScoreMouseListener`, `ScoreObjectSelectionListener`, `ScoreTimelineDropTargetListener`, audio-layer drag targets, score object action classes, `ScoreManagerDialog`, `LayerGroupManagerDialog`, `ScoreNavigatorDialog`, and related score navigation actions.
- **FR-002**: The score editor MUST support direct manipulation flows for compatible score objects and audio clips, including selection, marquee or multi-selection where applicable, move, resize, delete, and supported clipboard operations.
- **FR-003**: Timeline manipulation MUST respect the canonical score time state for snap, zoom, and time-display behavior rather than introducing disconnected renderer-only timing rules.
- **FR-004**: The score editor MUST support the key Java-style score actions needed for practical editing, including supported nudge, align, copy, cut, paste, and object navigation behaviors.
- **FR-005**: The score workflow MUST provide management and navigation tools for supported root and nested score structures, including score-manager or layer-group-manager equivalents and score navigator support.
- **FR-006**: The score workflow MUST update cleanly when direct-manipulation and management actions mutate the score graph so the main shell, auxiliary panels, and canonical project data remain synchronized.
- **FR-007**: The implementation MUST resolve or explicitly surface the remaining score parity gaps discovered after Specs 036 and 037, including Java-only object or editor gaps that still block the stated score-editor goal.
- **FR-008**: The implementation MUST add tests covering direct manipulation, clipboard behavior, supported manager flows, score navigation tools, and remaining follow-up parity cases claimed by the slice.

### Key Entities *(include if feature involves data)*

- **Timeline Interaction State**: The selection, marquee, drag, resize, and clipboard context used while directly manipulating score objects.
- **Score Management Operation**: A canonical mutation to supported root or nested score structure initiated from manager or navigator flows.
- **Score Navigation Session**: The state used to move among markers, zoom regions, playback-follow positions, and navigator selections.
- **Outstanding Parity Gap List**: The intentionally tracked set of score behaviors that still depend on later model or editor work after the first two score specs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can directly move, resize, copy, paste, and delete supported score objects or audio clips from the timeline without desynchronizing the score document.
- **SC-002**: A reviewer can use supported score-management and navigation tools to reorganize and navigate larger scores without reopening the panel.
- **SC-003**: A reviewer can exercise the supported Java-style score interaction set and either complete the workflow or receive a clear unsupported state for any explicitly deferred gap.
- **SC-004**: Automated tests cover direct-manipulation flows, clipboard behavior, supported manager and navigator workflows, and any parity claims this follow-up slice makes.

## Assumptions

- `036-score-editor-foundation` and `037-score-object-editor-parity` have already delivered the shell, selection, properties, and type-specific editor surfaces that this slice builds on.
- This follow-up slice is the correct place for deeper interaction parity, not for recreating the foundational score bridge or the initial auxiliary editor registry.
- Some Java-only score-object or editor gaps may still require dedicated `@blue/data` parity work if they remain unported after the earlier score specs.
