# Feature Specification: Window System Parity

**Feature Branch**: `014-window-system-parity`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "Achieve NetBeans RCP window-system parity for the Blue Electron workbench, including minimized groups showing edge tabs that reopen floating and resizable windows, maximized auxiliary groups presenting with top tabs like the main editor area, and correct transitions and persistence between minimized, restored, maximized, and floating states."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Minimize Groups To Edge Tabs (Priority: P1)

As a Blue user working with auxiliary tools, I need docked properties and output groups to minimize into visible edge tabs so I can keep those tools available without permanently consuming workspace area.

**Why this priority**: Edge-tab minimization is the most visible parity gap between the current prototype and the Java window system.

**Independent Test**: Can be fully tested by minimizing the prototype right-edge and bottom-edge groups, verifying that their tabs remain visible on the owning edge, and reopening specific tabs into floating tool windows.

**Acceptance Scenarios**:

1. **Given** a docked prototype auxiliary group on the right or bottom edge, **When** the user minimizes that group, **Then** the group collapses into visible edge tabs while preserving its panel ordering and active-tab identity.
2. **Given** a minimized group with multiple tabs, **When** the user activates one minimized tab, **Then** the corresponding panel is shown in a floating, resizable tool window and the group remains associated with its original edge.

---

### User Story 2 - Maximize And Restore Auxiliary Groups (Priority: P1)

As a Blue user focusing on one auxiliary workflow, I need an auxiliary group to maximize into a top-tab presentation similar to the main editor area so I can work with that group in a larger, familiar layout without losing its identity.

**Why this priority**: NetBeans-style maximize and restore behavior is a separate parity requirement from simple collapse and reveal.

**Independent Test**: Can be fully tested by maximizing a prototype auxiliary group, confirming that it renders as a top-tab group in the main workbench presentation, and restoring it back to its previous docked edge state.

**Acceptance Scenarios**:

1. **Given** a docked prototype auxiliary group, **When** the user maximizes it, **Then** the group is presented with top tabs in the main workbench area while keeping stable panel IDs and the active tab intact.
2. **Given** a maximized auxiliary group, **When** the user restores it, **Then** it returns to its previous docked edge with the same active panel and prior edge-group membership.

---

### User Story 3 - Persist And Reveal The Correct Presentation State (Priority: P2)

As a maintainer and user, I need minimized, floating, maximized, and restored group state to survive layout save/restore and programmatic reveal actions so the workbench behaves predictably across sessions and menu-driven commands.

**Why this priority**: Parity is incomplete if state transitions work only interactively but break during restore or menu-driven reveal.

**Independent Test**: Can be fully tested by saving and restoring a mixed layout state for the prototype groups and confirming that Window-menu or programmatic reveal focuses the existing presentation instead of creating duplicates.

**Acceptance Scenarios**:

1. **Given** a saved layout containing minimized, floating, and maximized prototype groups, **When** the project view is restored, **Then** each group reappears in its saved presentation state with valid bounds, active tab, and edge ownership.
2. **Given** a prototype panel that is minimized, floating, or maximized, **When** the user reveals it from the Window menu or another stable-ID command, **Then** the existing presentation is focused or transitioned correctly without spawning a duplicate panel instance.

### Edge Cases

- What happens when a floating tool window restores with bounds that are partially or fully off-screen?
- How should the system behave when the user requests minimize, maximize, or restore while the target group is already in another transient presentation state?
- What happens if a group contains multiple tabs and the user selects a non-active minimized tab directly from the edge?
- How should the system recover if persisted group metadata and dockview layout JSON disagree about the current owner edge or active panel?
- What happens when right-edge and bottom-edge groups are both minimized, floated, or maximized at the same time?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The workbench MUST model prototype auxiliary groups with explicit presentation states for minimized, docked, floating, and maximized behavior.
- **FR-002**: The workbench MUST allow the prototype right-edge and bottom-edge auxiliary groups to minimize into visible edge tabs while preserving tab ordering and active-panel identity.
- **FR-003**: Activating a minimized tab MUST show the requested panel in a floating, user-resizable tool window without creating a second logical instance of that panel.
- **FR-004**: The floating presentation MUST remember the group’s last active panel together with its most recently used bounds for subsequent reveals and restores.
- **FR-005**: The workbench MUST allow eligible prototype auxiliary groups to maximize into a top-tab presentation that visually aligns with the main editor-area tab model.
- **FR-006**: The workbench MUST allow a maximized, minimized, or floating auxiliary group to restore to its previous docked edge position without losing active-panel identity.
- **FR-007**: Window-menu and other stable-ID reveal paths MUST focus or transition the existing presentation state for a panel rather than creating duplicate docked, floating, or maximized copies.
- **FR-008**: The workbench MUST persist enough layout metadata to restore docked, minimized, floating, and maximized presentation state for the prototype auxiliary groups across application reloads.
- **FR-009**: Persisted floating bounds MUST be validated during restore and corrected when the saved bounds are invalid for the current display space.
- **FR-010**: Right-edge and bottom-edge auxiliary groups MUST manage their presentation state independently.
- **FR-011**: Each stable panel ID MUST remain canonical across all presentation states so one panel cannot be simultaneously open in multiple group presentations.
- **FR-012**: The first implementation slice MAY remain limited to the prototype groups identified in spec 013, but the underlying state model MUST be designed to extend to additional auxiliary groups without redefinition.

### Key Entities *(include if feature involves data)*

- **Auxiliary Group Presentation State**: The user-visible state of one auxiliary group, including whether it is docked, minimized, floating, or maximized.
- **Minimized Edge Tab**: The persisted edge-handle representation of a minimized group tab, including owning edge, order, and target panel identity.
- **Floating Tool Window Session**: The floating presentation state for an auxiliary group or tab, including active panel and remembered bounds.
- **Workbench Layout Snapshot**: The persisted layout record that combines dockview structure with auxiliary-group presentation metadata and restore hints.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The prototype right-edge and bottom-edge groups can each transition through docked, minimized, floating, maximized, and restored flows without duplicating a stable panel ID.
- **SC-002**: A user can reopen a minimized prototype tab into a floating, resizable window in a single direct interaction from the edge tab.
- **SC-003**: Restoring a saved workbench reconstructs valid presentation state, active tab, and floating bounds for the prototype groups without manual correction in the normal case.
- **SC-004**: Window-menu or programmatic reveal for any prototype auxiliary panel focuses the correct existing presentation state rather than opening an extra copy.
- **SC-005**: A parity review against the Java reference behavior for the prototype groups finds no major mismatch in minimize, float, maximize, or restore flows.

## Assumptions

- This feature builds directly on the dockview-based workbench shell and the bounded prototype groups established by specs 011 through 013.
- The first parity slice may remain scoped to the prototype properties and output groups before expanding the same state model to additional auxiliary groups.
- Floating presentation is defined by user-visible behavior and resize capability; the implementation may choose the underlying windowing mechanism during planning.
- Stable panel IDs in the existing panel registry remain the canonical identity layer for reveal, persistence, and parity validation.
