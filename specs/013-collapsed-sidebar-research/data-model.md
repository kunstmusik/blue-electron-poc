# Data Model: Collapsed Sidebar Group Research

## Overview

This feature produces a planning and decision package, not runtime code. The entities below define the shape of the future collapsed-sidebar implementation so the next prototype can stay consistent with the Java baseline and the existing dockview shell.

## Entity: AuxiliaryGroupDefinition

- **Purpose**: Represents one durable auxiliary group that can appear on the right or bottom edge of the workbench.
- **Fields**:
  - `id`: stable application-level identifier for the auxiliary group
  - `edge`: `right` or `bottom`
  - `label`: user-visible handle label
  - `panelIds`: dockview panel IDs associated with the group
  - `defaultExpanded`: whether the group starts expanded in the baseline state
  - `orientation`: vertical or horizontal collapsed-handle orientation
  - `preferredOrder`: order of handles on the same edge
  - `defaultSize`: target expanded size for first reveal
  - `javaReferenceState`: note describing the matching Java screenshot or behavior reference
- **Validation**:
  - Must map to at least one stable dockview panel ID
  - Must declare a single owning edge

## Entity: CollapsedHandleState

- **Purpose**: Captures the user-visible state of one collapsed or expanded auxiliary handle on an edge.
- **Fields**:
  - `groupId`
  - `edge`
  - `label`
  - `order`
  - `isCollapsed`
  - `isActive`
  - `lastKnownSize`
  - `lastActivePanelId`
- **Validation**:
  - Each handle state must reference an existing `AuxiliaryGroupDefinition`
  - Only one handle per edge may be `isActive` at a time in the baseline prototype

## Entity: RevealRequest

- **Purpose**: Describes a programmatic or user-triggered request to reveal a collapsed auxiliary group.
- **Fields**:
  - `source`: menu, keyboard, selection-sync, or direct-handle click
  - `targetGroupId`
  - `targetPanelId`: optional panel within the group to focus
  - `focusContent`: boolean
  - `preserveEdgeSelection`: whether the current edge ordering is preserved
  - `timestamp`
- **Validation**:
  - Must identify a target group
  - If `targetPanelId` is present, it must belong to the target group

## Entity: CollapsePersistenceSnapshot

- **Purpose**: Stores the state needed to restore collapsed auxiliary groups along with the dockview layout.
- **Fields**:
  - `dockviewLayoutJson`
  - `edgeStates`: list of `CollapsedHandleState`
  - `lastExpandedGroupByEdge`
  - `lastActivePanelByGroup`
  - `version`
- **Validation**:
  - Must keep dockview layout data and collapsed-edge metadata in sync
  - Every stored group reference must resolve to a known `AuxiliaryGroupDefinition`

## Entity: ApproachAssessment

- **Purpose**: Scores a candidate approach against the collapsed-sidebar behavior baseline.
- **Fields**:
  - `approachId`: `dockview-wrapper`, `dockview-only`, or `paneview-primary`
  - `unifiedModel`: strong, partial, or weak
  - `javaBehaviorFit`: strong, partial, or weak
  - `revealSupport`: direct, partial, or custom-work-required
  - `persistenceBurden`: low, medium, or high
  - `customWorkAreas`
  - `notes`
- **Validation**:
  - Every assessed approach must include a persistence rating
  - Any non-direct reveal support must explain the missing behavior

## Entity: PrototypeSlice

- **Purpose**: Defines the smallest implementation experiment that can validate the chosen direction.
- **Fields**:
  - `id`
  - `edgesCovered`
  - `groupsIncluded`
  - `successChecks`
  - `deferredBehaviors`
  - `blockingRisks`
- **Validation**:
  - Must cover at least one right-edge case and one bottom-edge case
  - Must name explicit success checks tied to reveal, focus, and restore behavior

## Relationships

- `AuxiliaryGroupDefinition` owns one or more `CollapsedHandleState` records across sessions.
- `RevealRequest` targets an `AuxiliaryGroupDefinition` and updates `CollapsedHandleState`.
- `CollapsePersistenceSnapshot` stores the durable state for all `AuxiliaryGroupDefinition` records together with dockview layout data.
- `ApproachAssessment` scores how well each candidate can implement the `AuxiliaryGroupDefinition` and `RevealRequest` behaviors.
- `PrototypeSlice` validates the preferred `ApproachAssessment` against a bounded subset of `AuxiliaryGroupDefinition` records.
