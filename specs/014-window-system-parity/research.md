# Research Notes: Window System Parity

## Scope

Planning-phase research baseline for feature `014-window-system-parity`. This feature turns the spec 013 recommendation into a parity-first runtime slice for auxiliary workbench groups.

## Inputs

- Spec 014 feature definition in `/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/spec.md`
- The bounded prototype implemented on spec 013 in the renderer workbench shell
- Java Blue reference registrations under `~/work/nbprojects/blue/blue-ui-core/src/main/java`
- Installed `dockview` / `dockview-core` 5.2.0 type definitions under `/Users/stevenyi/work/blue-electron/node_modules/.pnpm`

## Java Baseline

### Prototype Groups Anchored In Real Java Modes

The prototype groups targeted by this slice are not arbitrary:

- `SoundObjectPropertiesTopComponent` and `MidiInputPanelTopComponent` are registered in the Java `properties` mode.
- `ScoreObjectEditorTopComponent` and `MixerTopComponent` are registered in the Java `output` mode.
- Java reveal remains stable-ID based, for example `ScoreObjectSelectionListener` finds `ScoreObjectEditorTopComponent` by ID and opens/focuses the existing component instead of creating an unrelated duplicate.

This makes the parity target clear:

1. the group identity is durable
2. the docked home edge is durable
3. minimize, float, maximize, and restore are alternate presentations of the same logical group

## Current `blue-electron` Baseline

Spec 013 proved a simplified right/bottom auxiliary rail, but it intentionally stopped short of NetBeans parity:

- the current shell has visible edge rails
- stable panel IDs already exist
- layout persistence already wraps dockview JSON in an auxiliary envelope
- the current minimized interaction is not yet a true NetBeans-style minimized group that reopens floating and resizable content
- maximized auxiliary groups do not yet present as top-tab groups aligned with the main editor area

The parity gap is therefore about the presentation-state model, not about panel identity.

## Dockview Capability Findings

### Decision 1: Use dockview for docked, floating, and maximized runtime states

**Decision**: Keep dockview as the canonical runtime host for all non-minimized auxiliary presentations.

**Rationale**:

- `DockviewApi.addFloatingGroup(...)` provides a native floating-group runtime that is already serializable.
- `DockviewApi.maximizeGroup(...)`, `hasMaximizedGroup()`, and `exitMaximizedGroup()` provide native maximized-group behavior.
- `SerializedDockview` already includes `floatingGroups` and maximized-grid state in its layout shape.
- `DockviewGroupPanelApi` and `DockviewPanelApi` expose `moveTo(...)`, `maximize()`, `exitMaximized()`, `location`, and `getWindow()`, which is enough to coordinate transitions without inventing a second group host.

**Alternatives considered**:

- Custom floating DOM overlays outside dockview: rejected because they duplicate group lifecycle and persistence.
- Electron popout windows for the first parity slice: rejected because dockview floating groups already satisfy the user-visible need for floating and resizable tool windows inside the workbench, with less complexity.

### Decision 2: Keep minimized state as app-owned metadata and UI

**Decision**: Model minimized groups with an app-level edge-tab controller rather than trying to express minimized presentation directly in dockview.

**Rationale**:

- Dockview has strong support for docked, floating, and maximized groups, but it does not expose a first-class NetBeans-style persistent minimized side rail.
- The parity requirement is not just "hidden until reopened"; it is "still visible as an ordered edge tab associated with the owning edge."
- Keeping minimized state outside raw dockview JSON lets the renderer preserve durable edge tabs even when the live group is no longer docked.

**Alternatives considered**:

- Keeping the spec 013 rail behavior unchanged: rejected because it is an approximation, not parity.
- Treating minimized as simple close/remove: rejected because it loses discoverability and breaks parity.

### Decision 3: Presentation state belongs to the auxiliary group, not the individual panel

**Decision**: The primary state machine is group-level, with per-panel active-tab selection inside each group.

**Rationale**:

- Java mode ownership is group-oriented (`properties`, `output`), not a set of unrelated ad hoc windows.
- Dockview floating and maximized operations are naturally group-centric.
- Minimizing a multi-tab group should preserve ordering and active panel, then reopen the requested tab without duplicating the group's logical identity.

**Alternatives considered**:

- Modeling every panel as separately minimized/floating/maximized: rejected because it weakens the group concept and complicates restore semantics.

### Decision 4: Minimized-tab activation should reopen floating, not merely redock

**Decision**: Clicking a minimized tab should show the requested content in a floating, resizable tool window.

**Rationale**:

- This is the user-stated parity requirement for the next slice.
- Dockview floating groups support direct bounds and resizing, making this behavior implementable without leaving the main workbench runtime.
- Floating-on-click is a stronger parity target than the 013 simplification of "reveal in the edge region."

**Alternatives considered**:

- Reopening minimized groups directly back into the docked edge: rejected for this parity slice because it does not match the requested behavior.

### Decision 5: Maximized presentation should promote the auxiliary group into top-tab mode

**Decision**: Maximized auxiliary groups should use dockview maximization plus a header-position swap to a top-tab presentation, then restore the original edge-specific presentation on exit.

**Rationale**:

- The parity target is not just "bigger"; it is "looks like a normal top-tab group in the main area."
- Dockview groups already support header positions, and group/panel maximize APIs already exist.
- Treating maximize as a presentation-state transition keeps the same group and same stable panels intact.

**Alternatives considered**:

- Creating a second duplicate editor-area group when maximizing: rejected because it breaks canonical identity and complicates restore.

### Decision 6: Persist dockview JSON as the base truth and supplement it with minimized/home-edge metadata

**Decision**: Persist dockview's serialized layout as-is for docked, floating, and maximized state, and add only the metadata dockview does not know about: minimized state, home edge, tab order, restore target, and validated floating bounds.

**Rationale**:

- This keeps the persistence model small and aligned with the actual runtime host.
- Dockview already serializes floating groups and maximized layout state.
- App-level metadata is still required for parity because minimized edge tabs are external to the dockview layout.

**Alternatives considered**:

- Replacing dockview persistence with a fully custom envelope: rejected as unnecessary duplication.

## Recommended Architecture

Use a hybrid model with clear ownership:

- **Dockview owns**:
  - live docked groups
  - floating groups
  - maximized group state
  - panel/group lifecycle
  - serialized dockview layout
- **The app owns**:
  - auxiliary group definitions
  - minimized edge-tab UI and ordering
  - home-edge restore targets
  - last requested panel within a group
  - validation/clamping of restored floating bounds
  - reveal routing from Window-menu and other stable-ID commands

## First Slice Boundaries

The parity slice stays bounded to the same prototype panels used in spec 013:

- Right edge / `properties`
  - `SoundObjectPropertiesTopComponent`
  - `MidiInputPanelTopComponent`
- Bottom edge / `output`
  - `ScoreObjectEditorTopComponent`
  - `MixerTopComponent`

Success for this slice means:

1. minimize turns the group into visible edge tabs
2. clicking a minimized tab opens the group floating and resizable
3. maximize promotes the group into a top-tab presentation
4. restore returns the group to its home edge
5. Window-menu reveal focuses or transitions the existing presentation without duplication

## Deferred Follow-On Work

- Drag reorder for minimized tabs
- Multi-window/popout behavior beyond dockview's in-window floating groups
- Expanding the state model to more `properties` and `output` groups after the prototype pairs prove out
- Moving workbench layout persistence from localStorage to a more durable Electron-side storage location

## Risks

- Dockview maximization may need header-position coordination to match the top-tab parity target cleanly.
- Minimized edge tabs require a source of truth that stays synchronized when groups move between docked, floating, and maximized states.
- Restoring stale floating bounds may still need app-level correction even though dockview supports bounded floating behavior.
