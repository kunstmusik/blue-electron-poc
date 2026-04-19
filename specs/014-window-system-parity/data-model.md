# Data Model: Window System Parity

## Overview

This feature introduces a full presentation-state model for auxiliary workbench groups. The model is group-first, panel-identity-safe, and designed to preserve one canonical logical instance of each stable panel ID while allowing that group to appear docked, minimized, floating, or maximized.

## Entity: AuxiliaryGroupDefinition

- **Purpose**: Declares one durable auxiliary group rooted in the Java mode structure.
- **Fields**:
  - `id`: stable app-level group ID such as `properties-main` or `output-main`
  - `modeId`: Java-aligned owner mode, such as `properties` or `output`
  - `homeEdge`: `right` or `bottom`
  - `panelIds`: ordered stable panel IDs owned by the group
  - `defaultActivePanelId`: initial active panel
  - `defaultDockedSize`: initial docked width or height
  - `defaultFloatingBounds`: default floating bounds for first reveal
  - `collapsedLabelStrategy`: how the minimized tabs are labeled
- **Validation**:
  - `panelIds` must be non-empty
  - every `panelId` must resolve through the panel registry
  - one `panelId` may belong to only one `AuxiliaryGroupDefinition`

### Initial Prototype Instances

- `properties-main`
  - `modeId`: `properties`
  - `homeEdge`: `right`
  - `panelIds`: `SoundObjectPropertiesTopComponent`, `MidiInputPanelTopComponent`
- `output-main`
  - `modeId`: `output`
  - `homeEdge`: `bottom`
  - `panelIds`: `ScoreObjectEditorTopComponent`, `MixerTopComponent`

## Entity: AuxiliaryPresentationState

- **Purpose**: Represents the current user-visible presentation of an auxiliary group.
- **Values**:
  - `docked`
  - `minimized`
  - `floating`
  - `maximized`
- **Validation**:
  - exactly one presentation state is active per auxiliary group

## Entity: DockedPlacement

- **Purpose**: Captures the docked restore target for a group.
- **Fields**:
  - `edge`: `right` or `bottom`
  - `referencePanelId`: stable panel ID used to reconstruct placement when necessary
  - `headerPosition`: `right`, `bottom`, or parity-specific header setting while docked
  - `size`: width or height to restore
  - `order`: group ordering relative to sibling groups on the same edge
- **Validation**:
  - `edge` must match the group's `homeEdge` unless an intentional future migration is added
  - `referencePanelId` must remain a valid stable panel ID

## Entity: FloatingBounds

- **Purpose**: Stores the most recent floating geometry for a group.
- **Fields**:
  - `x`
  - `y`
  - `width`
  - `height`
  - `anchor`: optional dockview anchor position hint
  - `lastValidatedAt`: timestamp or version marker for restore hygiene
- **Validation**:
  - width and height must be positive and above a configured minimum
  - bounds must be clamped before reuse if they fall outside the current viewport

## Entity: AuxiliaryGroupSession

- **Purpose**: Runtime and persisted state for one auxiliary group.
- **Fields**:
  - `groupId`
  - `presentation`: `AuxiliaryPresentationState`
  - `dockviewGroupId`: current live dockview group ID if one exists
  - `lastActivePanelId`
  - `lastDockedPlacement`: `DockedPlacement`
  - `lastFloatingBounds`: `FloatingBounds`
  - `lastNonMinimizedPresentation`: `docked` or `floating` or `maximized`
  - `minimizedTabOrder`: ordered list of panel IDs for the visible edge tabs
  - `isVisible`: whether a live presentation is currently rendered
- **Validation**:
  - `lastActivePanelId` must belong to the owning group
  - `presentation = minimized` implies `minimizedTabOrder` is populated
  - `dockviewGroupId` may be absent only when the group is minimized and no floating/docked/maximized instance exists

## Entity: MinimizedTabState

- **Purpose**: Defines one tab shown on the edge when a group is minimized.
- **Fields**:
  - `groupId`
  - `panelId`
  - `edge`
  - `order`
  - `isActivePanel`
  - `orientation`: `vertical` or `horizontal`
- **Validation**:
  - `panelId` must belong to the owning group
  - `edge` must match the group's current minimized edge ownership

## Entity: RevealIntent

- **Purpose**: Describes a request to show or focus an existing panel/group presentation.
- **Fields**:
  - `source`: `window-menu`, `selection-sync`, `direct-tab-click`, or `restore`
  - `targetPanelId`
  - `targetGroupId`
  - `preferredPresentation`: optional desired state such as `floating`
  - `focusContent`: boolean
- **Validation**:
  - `targetPanelId` must belong to `targetGroupId`
  - reveal must never create a second logical copy of the target panel

## Entity: WorkbenchParityLayout

- **Purpose**: The persisted layout envelope for the parity slice.
- **Fields**:
  - `version`
  - `dockview`: serialized dockview layout JSON
  - `auxiliaryGroups`: list of `AuxiliaryGroupSession`
  - `minimizedTabs`: list of `MinimizedTabState`
  - `activeGroupId`: optional currently focused auxiliary group
- **Validation**:
  - every persisted group must resolve to a known `AuxiliaryGroupDefinition`
  - floating/maximized state in `auxiliaryGroups` must not conflict with serialized dockview group presence
  - minimized tabs must be reconstructible even if dockview has no live docked group for that auxiliary group

## State Transitions

### Docked -> Minimized

- Preserve `lastActivePanelId`
- Preserve docked ordering and size in `lastDockedPlacement`
- Remove or hide the live dockview docked presentation
- Emit `MinimizedTabState` records on the owning edge

### Minimized -> Floating

- Use `lastActivePanelId` unless the user clicked a different minimized tab
- Create or focus a dockview floating group with remembered bounds
- Keep the group's `homeEdge` and minimized ordering metadata for later restore

### Floating -> Docked

- Remove the floating presentation
- Recreate or move the group back to `lastDockedPlacement`
- Restore edge-specific header position and size

### Docked -> Maximized

- Preserve group identity and active panel
- Switch the live group to maximized presentation
- Use top-tab header presentation while maximized

### Maximized -> Docked

- Exit maximized mode
- Restore edge-specific header position and prior docked placement

### Any Visible State -> Reveal By Stable ID

- Resolve `panelId -> groupId`
- If already visible, focus the existing group/panel
- If minimized, transition according to the parity rule for minimized reveal
- Never create a second logical copy of the target panel

## Invariants

- A stable `panelId` is canonical across all presentations.
- An auxiliary group may have at most one live dockview group instance at a time.
- Minimized is a presentation state, not a second copy of a group.
- Floating and maximized preserve the same `panelIds` and `lastActivePanelId`.
- Restore always returns to the group's remembered docked edge unless the model is intentionally migrated in a later slice.

## Relationships

- `AuxiliaryGroupDefinition` owns one `AuxiliaryGroupSession`.
- `AuxiliaryGroupSession` can emit many `MinimizedTabState` records when minimized.
- `RevealIntent` targets one `AuxiliaryGroupSession`.
- `WorkbenchParityLayout` persists all `AuxiliaryGroupSession` and `MinimizedTabState` records together with dockview JSON.
