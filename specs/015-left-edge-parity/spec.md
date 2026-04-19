# Feature Specification: Left Edge Parity

**Feature Branch**: `015-left-edge-parity`  
**Created**: 2026-04-19  
**Status**: Draft  
**Input**: User description: "Support the same auxiliary window behavior on the left edge so users can move tool windows to the left edge and collapse them there, while keeping the default seeded layout unchanged and not placing any tools on the left by default."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Move Tools To The Left Edge (Priority: P1)

As a Blue user customizing my workspace, I need to move an auxiliary tool or group to the left edge and collapse it there so I can use the left side when it suits my workflow without changing the default layout for everyone.

**Why this priority**: This is the core user-facing gap. Left-edge support is not complete until users can intentionally place tools there and get the same minimized behavior they already have on other edges.

**Independent Test**: Can be fully tested by starting from the default layout, moving an eligible auxiliary tool or group to the left edge, minimizing it, and reopening a tool from the left-edge tabs.

**Acceptance Scenarios**:

1. **Given** an auxiliary tool or group is docked on the right or bottom edge, **When** the user moves it to the left edge, **Then** it docks on the left edge while preserving its tab order, active tool, and logical identity.
2. **Given** a tool or group is docked on the left edge, **When** the user minimizes it, **Then** visible left-edge tabs remain available for the minimized items.
3. **Given** a minimized left-edge tab, **When** the user activates that tab, **Then** that specific tool opens in a left-attached slide-out and no second tool window is created for the same item.

---

### User Story 2 - Keep Defaults Unchanged While Restoring Custom Left Layouts (Priority: P1)

As a Blue user who expects the Java defaults, I need fresh and reset layouts to keep the current default tool placement while still restoring my own saved left-edge customizations when they exist.

**Why this priority**: Left-edge capability should not silently redefine the default workspace. The feature is only correct if it adds user choice without changing the baseline layout.

**Independent Test**: Can be fully tested by verifying that a fresh or reset layout contains no seeded left-edge tools, then saving a custom layout with left-edge placements and confirming those placements restore correctly.

**Acceptance Scenarios**:

1. **Given** a fresh workspace or a reset to the default layout, **When** the workbench loads, **Then** no auxiliary tool is placed on the left edge by default.
2. **Given** a user-saved layout contains one or more tools moved to the left edge, **When** that layout is restored, **Then** those tools reopen on the left edge in their saved docked or minimized presentation.

---

### User Story 3 - Use Left-Edge Actions Consistently (Priority: P2)

As a Blue user managing left-edge tools, I need dock, restore, maximize, hide, and reveal actions to behave the same on the left edge as on the right and bottom so I do not have to learn a special case.

**Why this priority**: Consistent behavior across all supported edges is required for parity and for predictable workspace customization.

**Independent Test**: Can be fully tested by minimizing a left-edge group, opening a slide-out, docking only the selected tool, restoring the whole group from the rail, maximizing a left-edge group, and revealing a left-edge tool from the Window menu.

**Acceptance Scenarios**:

1. **Given** a minimized group on the left edge, **When** the user activates the currently open left-edge tab again or clicks outside the slide-out, **Then** the slide-out hides and the minimized left-edge tabs remain visible.
2. **Given** a minimized group on the left edge, **When** the user docks a tool from its slide-out, **Then** only that selected tool returns to a docked position and the remaining group members stay minimized.
3. **Given** a minimized group on the left edge, **When** the user uses the rail restore action, **Then** the whole group returns to its docked left-edge position.
4. **Given** a left-edge tool or group is already open in a docked, minimized, slide-out, or maximized state, **When** the user reveals it from the Window menu, **Then** the existing presentation is focused or transitioned instead of opening a duplicate.

### Edge Cases

- What happens when a user moves only one tool out of a multi-tool group to the left edge and leaves the remaining tools on their original edge?
- How does the workbench behave if a user minimizes a left-edge group and then immediately moves focus to another edge that already has a slide-out open?
- What happens when a saved layout contains custom left-edge placements but the user chooses to reset to the default layout?
- How should the system recover if a saved left-edge placement references a tool that is not available in the current workspace or project state?
- What happens when left, right, and bottom edges all contain minimized groups at the same time?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The workbench MUST allow eligible auxiliary tools and groups to be moved to the left edge through user-driven workspace rearrangement.
- **FR-002**: Moving a tool or group to the left edge MUST preserve its logical identity, tab order, active tool, and group membership unless the user explicitly separates a tool from its original group.
- **FR-003**: A tool or group docked on the left edge MUST support minimize behavior equivalent to other supported edges, leaving visible left-edge tabs after collapse.
- **FR-004**: The left edge MUST allow only one slide-out window to be visible at a time.
- **FR-005**: Activating a minimized left-edge tab MUST open that specific tool in a left-attached slide-out, and activating the same tab again or clicking outside the slide-out MUST hide it.
- **FR-006**: A left-edge slide-out MUST support hiding the current tool and docking the selected tool without restoring the entire minimized group.
- **FR-007**: The left-edge rail MUST provide a restore action that returns an entire minimized group to its docked left-edge position.
- **FR-008**: A fresh layout and a reset to the default layout MUST seed zero auxiliary tools on the left edge by default.
- **FR-009**: User-customized left-edge placements and their current presentation states MUST persist across layout save and restore.
- **FR-010**: Reveal actions initiated from the Window menu or other stable commands MUST reuse the existing left-edge presentation rather than opening duplicate tool windows.
- **FR-011**: Tools and groups placed on the left edge MUST support maximize and restore flows consistent with the existing auxiliary-edge behavior.
- **FR-012**: Left, right, and bottom edge presentations MUST operate independently so that minimizing, sliding out, restoring, or maximizing content on one edge does not corrupt the state of another edge.

### Key Entities *(include if feature involves data)*

- **Auxiliary Edge Assignment**: The user-selected home edge for an auxiliary tool or group, including whether it belongs on the left, right, or bottom edge.
- **Auxiliary Presentation State**: The current user-visible state of an auxiliary tool or group, such as docked, minimized, slide-out, or maximized.
- **Minimized Edge Tab**: The collapsed edge-tab representation of a minimized tool or group, including its owning edge, order, and target tool identity.
- **Workbench Layout Preference**: The saved workspace configuration that combines default-layout behavior with any user-customized edge placements and presentation states.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a fresh workspace and after a default-layout reset, zero auxiliary tools appear on the left edge unless the user explicitly moves them there.
- **SC-002**: A user can move an eligible auxiliary tool or group from the right or bottom edge to the left edge and complete a docked -> minimized -> slide-out -> docked flow without creating a duplicate tool window.
- **SC-003**: A saved workspace with custom left-edge placements restores those placements, active tools, and minimized states without manual repositioning in the normal case.
- **SC-004**: Dock, hide, restore-group, maximize, and Window-menu reveal actions for left-edge tools behave the same as the corresponding actions on the right and bottom edges during manual parity review.

## Assumptions

- The existing default workspace layout remains the Java-aligned baseline until Java evidence shows that a default left-edge assignment should exist.
- This slice adds left-edge capability for user-driven rearrangement; it does not introduce any new default left-edge tools.
- The auxiliary tools already participating in the right-edge and bottom-edge parity work remain eligible to be moved to the left edge by the user.
- The current right-edge and bottom-edge parity behavior remains the reference behavior that left-edge support should match.
