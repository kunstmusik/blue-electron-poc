# Data Model: Left Edge Parity

## Overview

This feature replaces the current fixed two-group auxiliary session model with an instance-based layout model. The new model keeps seeded default groups as the reset baseline while allowing user-created current placements, including left-edge moves and singleton split-outs, to persist across reloads.

## Entity: AuxiliarySeedDefinition

- **Purpose**: Declares the Java-aligned default auxiliary groups used for fresh and reset layouts.
- **Fields**:
  - `seedGroupId`: stable seeded group ID such as `properties-main` or `output-main`
  - `modeId`: Java-aligned owner mode such as `properties` or `output`
  - `defaultEdge`: `right` or `bottom`
  - `panelIds`: ordered stable panel IDs that belong to the seeded group
  - `defaultActivePanelId`: initial active panel
  - `defaultDockedSize`: initial width or height for docked presentation
  - `defaultSlideoutSize`: initial width or height for slide-out presentation
- **Validation**:
  - `panelIds` must be non-empty
  - every `panelId` must resolve through the panel registry
  - every `panelId` belongs to exactly one `AuxiliarySeedDefinition`

### Seeded Prototype Definitions

- `properties-main`
  - `defaultEdge`: `right`
  - `panelIds`: `SoundObjectPropertiesTopComponent`, `MidiInputPanelTopComponent`
- `output-main`
  - `defaultEdge`: `bottom`
  - `panelIds`: `ScoreObjectEditorTopComponent`, `MixerTopComponent`

## Entity: AuxiliaryGroupInstance

- **Purpose**: Represents one current docked/minimized/slide-out/maximized auxiliary group visible to the user.
- **Fields**:
  - `groupInstanceId`: durable runtime/persisted group instance ID
  - `seedGroupId`: owning `AuxiliarySeedDefinition`
  - `kind`: `seeded` or `derived-singleton`
  - `edge`: `left`, `right`, or `bottom`
  - `panelIds`: ordered stable panel IDs currently in this group instance
  - `dockedPanelIds`: ordered subset of `panelIds` currently docked
  - `activePanelId`: active panel within this group instance
  - `dockedSize`: current docked width or height
  - `slideoutSize`: current slide-out width or height
  - `isMaximized`: whether the group is currently maximized
  - `displayOrder`: ordering relative to sibling group instances on the same edge
- **Validation**:
  - `panelIds` must be non-empty
  - `activePanelId` must belong to `panelIds`
  - `dockedPanelIds` must be a subset of `panelIds`
  - `kind = derived-singleton` implies `panelIds.length = 1`

## Entity: AuxiliaryPresentationState

- **Purpose**: Describes the current presentation of a group instance.
- **Values**:
  - `docked`
  - `minimized`
  - `slideout`
  - `maximized`
- **Derivation**:
  - `maximized` when `isMaximized = true`
  - `docked` when `dockedPanelIds.length > 0` and the active edge has no open slide-out for the group’s active tool
  - `slideout` when the edge slide-out points at one of the group’s undocked panels
  - `minimized` otherwise

## Entity: AuxiliaryEdgeSlideoutState

- **Purpose**: Tracks the single visible slide-out for one edge.
- **Fields**:
  - `edge`: `left`, `right`, or `bottom`
  - `openPanelId`: optional stable panel ID currently visible in a slide-out on that edge
- **Validation**:
  - each edge may expose at most one `openPanelId`
  - `openPanelId` must belong to a group instance currently assigned to that edge

## Entity: EdgeMoveIntent

- **Purpose**: Captures a user request to reassign either a whole group or one selected panel to another edge.
- **Fields**:
  - `targetEdge`: `left`, `right`, or `bottom`
  - `scope`: `group` or `panel`
  - `sourceGroupInstanceId`
  - `panelId`: optional, required when `scope = panel`
  - `mergePolicy`: `merge-when-compatible` or `force-derived-singleton`
- **Validation**:
  - `panelId` must be present when `scope = panel`
  - `panelId` must belong to `sourceGroupInstanceId`

## Entity: MinimizedEdgeTab

- **Purpose**: Derived UI state for one collapsed tab visible on an edge.
- **Fields**:
  - `groupInstanceId`
  - `panelId`
  - `edge`
  - `order`
  - `isActivePanel`
- **Validation**:
  - derived only from undocked panels in a group instance assigned to the same edge

## Entity: WorkbenchAuxiliaryLayoutV5

- **Purpose**: Versioned persisted layout envelope for the left-edge parity slice.
- **Fields**:
  - `version`: `5`
  - `dockview`: serialized dockview JSON
  - `groups`: ordered list of `AuxiliaryGroupInstance`
  - `slideouts`: record of `AuxiliaryEdgeSlideoutState` for `left`, `right`, and `bottom`
- **Validation**:
  - every persisted panel ID must exist in exactly one `AuxiliaryGroupInstance`
  - every `seeded` group instance must map to one known `AuxiliarySeedDefinition`
  - no `derived-singleton` instance may survive reset-to-default

## Migrations

### Version 4 -> Version 5

- Convert the current fixed `properties-main` and `output-main` sessions into `seeded` `AuxiliaryGroupInstance` records.
- Preserve docked/minimized/slide-out/maximized state for those seeded groups.
- Initialize `edge` from the current version 4 session edge when valid, otherwise from the seeded default edge.
- Do not create any derived singleton instances during migration; those are created only by new move operations after version 5 is live.

## State Transitions

### Seeded Group -> Move Whole Group To Left Edge

- keep `groupInstanceId`
- update `edge` to `left`
- preserve `panelIds`, `activePanelId`, docked order, and current presentation state

### Seeded Group -> Move Single Panel To Left Edge

- remove the panel from the source `seeded` group instance
- create a new `derived-singleton` group instance on the left edge for that panel
- preserve the panel’s stable ID and active state
- keep the remaining seeded sibling group on its original edge

### Derived Singleton -> Move Back To Compatible Seeded Edge

- if the target edge already hosts the compatible seeded sibling group, merge the panel back into that seeded group in seeded definition order
- remove the derived singleton instance

### Any Group Instance -> Minimized

- clear `dockedPanelIds`
- preserve `panelIds`, `activePanelId`, `edge`, and size metadata
- clear any open slide-out for that group’s edge if it targets one of the group’s panels

### Minimized -> Slideout

- set the edge’s `openPanelId` to the selected undocked panel
- keep the group instance on the same edge

### Slideout -> Dock Selected Tool

- add the selected panel back to `dockedPanelIds`
- clear the edge’s `openPanelId` if it references that panel
- leave any remaining undocked siblings minimized

### Minimized -> Restore Group

- set `dockedPanelIds = panelIds`
- clear the edge’s `openPanelId` for that group

### Any Group Instance -> Reset Layout

- discard all `derived-singleton` group instances
- reseed only the `seeded` group instances at their `defaultEdge`
- clear all left-edge occupancy

## Invariants

- A stable `panelId` may exist in only one `AuxiliaryGroupInstance` at a time.
- Fresh and reset layouts contain zero left-edge group instances.
- Each edge may display at most one visible slide-out.
- `seeded` group instances define the reset baseline; `derived-singleton` instances exist only because of user customization.
- Merge-back must preserve seeded panel ordering.

## Relationships

- One `AuxiliarySeedDefinition` can own one `seeded` group instance plus zero or more temporary `derived-singleton` group instances over time.
- One `AuxiliaryGroupInstance` can yield many `MinimizedEdgeTab` records when minimized.
- One `AuxiliaryEdgeSlideoutState` references at most one panel from one current group instance on its edge.
- `WorkbenchAuxiliaryLayoutV5` persists all current group instances and all per-edge slide-out states together with dockview JSON.
