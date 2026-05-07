# Feature Specification: Score Editor Management and Navigation

**Feature Branch**: `040-score-editor-management-navigation`  
**Created**: 2026-05-07  
**Status**: Draft  
**Input**: User description: "Push the old interaction follow-up behind the remaining score-object editor specs and rewrite it around the score-management/navigation work that is still actually missing."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Score Structure From The Shell (Priority: P1)

As a composer working on large score structures, I need the score shell's `Manage` workflow and related manager dialogs so I can reorganize root and nested score structure without relying on ad hoc context menus.

**Why this priority**: The most obvious remaining shell-level gap is that the `Manage` affordance exists visually but does not yet open the Java-style score-management flows.

**Independent Test**: Open the score shell, invoke the `Manage` workflow, add or reorder supported layer groups or layers, and verify the visible score updates without reopening the panel.

**Acceptance Scenarios**:

1. **Given** the user invokes the `Manage` affordance from the score shell, **When** a supported score-manager or layer-group-manager flow opens, **Then** the user can inspect and change root or nested structure without leaving the score workflow.
2. **Given** the user applies a supported structure change such as reorder, rename, add, or remove, **When** the dialog commits, **Then** the canonical score graph and visible shell update coherently.

---

### User Story 2 - Navigate By Markers And Overview Tools (Priority: P1)

As a composer working on long or dense projects, I need marker-driven navigation, a real markers workflow, and a score navigator or overview tool so I can move around the score predictably.

**Why this priority**: The current shell renders markers and ruler state, but it still lacks the broader navigation tooling that makes large scores manageable.

**Independent Test**: Use the supported marker and navigator workflows to jump across the score, and verify the timeline view and related panels update without reopening the shell.

**Acceptance Scenarios**:

1. **Given** the project includes markers, **When** the user invokes supported marker-navigation workflows, **Then** the score view moves to the requested region predictably.
2. **Given** the project spans a large time range, **When** the user invokes the supported score navigator or overview workflow, **Then** the timeline view recenters or scrolls predictably without desynchronizing the shell.

---

### User Story 3 - Polish Follow Playback And Remaining Score-Adjacent Panels (Priority: P2)

As a composer expecting Java Blue score parity, I need playback-follow, time-pointer polish, and the remaining placeholder score-adjacent surfaces to be resolved intentionally rather than left implicit.

**Why this priority**: These are meaningful shell-level gaps, but they should land only after the remaining score-object editors are planned first.

**Independent Test**: Turn playback-follow on, exercise the supported time-pointer or follow-scroll workflow, open any score-adjacent panels included in the slice, and verify the score UI updates coherently.

**Acceptance Scenarios**:

1. **Given** follow playback is enabled, **When** playback advances, **Then** the score shell updates the visible region or pointer state predictably.
2. **Given** a score-adjacent panel such as markers remains part of this slice, **When** the user opens it, **Then** the app shows a real supported workflow or an explicit deferred state instead of a silent placeholder.

### Edge Cases

- What happens when the score manager or navigator is open while the underlying project changes or reloads?
- What happens when marker or playback-follow navigation targets a region outside the currently materialized timeline size?
- What happens when score-adjacent panels included in this slice are opened with no project loaded?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review the Java Blue management and navigation anchors before coding begins, including `ScoreManagerDialog`, `LayerGroupManagerDialog`, `ScoreNavigatorDialog`, markers workflows, playback-follow behavior, and related score navigation actions.
- **FR-002**: The score shell MUST provide a real `Manage` workflow for supported root and nested score-structure operations instead of a non-functional button shell.
- **FR-003**: Supported management operations MUST continue to use canonical score state and score patch plumbing so the shell, auxiliary panels, and project data remain synchronized.
- **FR-004**: The score workflow MUST provide supported marker-navigation and score-navigator behavior for larger projects.
- **FR-005**: The score workflow MUST polish playback-follow and time-pointer behavior in the shell rather than limiting follow playback to a global toggle only.
- **FR-006**: The slice MUST resolve or explicitly surface the remaining score-adjacent placeholder gaps it claims, such as a markers workflow or other score-related auxiliary panels.
- **FR-007**: Direct manipulation already delivered in Spec 036 MUST be treated as existing scope; this slice should only fix interaction regressions there if they block the management/navigation workflows.
- **FR-008**: The implementation MUST add tests covering supported manager flows, score navigation tools, playback-follow or pointer behavior, and any score-adjacent parity claims this slice makes.

### Key Entities *(include if feature involves data)*

- **Score Management Operation**: A canonical mutation to supported root or nested score structure initiated from manager or navigator flows.
- **Score Navigation Session**: The state used to move among markers, zoom regions, playback-follow positions, and navigator selections.
- **Score Follow State**: The shell-local state used to keep the visible timeline aligned with playback and any visible time pointer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can use the shell's `Manage` workflow to perform supported structure-management tasks without reopening the score panel.
- **SC-002**: A reviewer can use supported marker-navigation and score-navigator workflows to move around a larger score predictably.
- **SC-003**: A reviewer can enable playback-follow and observe coherent score-shell follow or pointer behavior.
- **SC-004**: Automated tests cover the supported manager flows, navigation tools, playback-follow or pointer behavior, and any score-adjacent parity claims this slice makes.

## Assumptions

- Specs `038-score-object-editor-tier1-parity` and `039-score-object-editor-tier2-parity` have already planned the remaining score-object editor follow-up work so this slice can stay focused on shell-level management and navigation.
- Spec `036-score-editor-foundation` already delivered most of the direct timeline manipulation that the original interaction draft assumed was still missing.
- Some score-adjacent or Java-only workflow gaps may still require later dedicated slices if they remain out of scope after this management/navigation pass.
