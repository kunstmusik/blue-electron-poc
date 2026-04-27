# Data Model: BlueSynthBuilder Performance and Live Interaction

## Overview

This slice does not change `.blue` serialization. It introduces runtime-side concepts that separate live BSB interaction from canonical document commit flow and preserve reference identity in the renderer snapshot.

## Proposed Runtime Concepts

### Project Revision

A monotonically increasing revision number attached to the canonical main-process project document.

Purpose:

- let the renderer know which canonical state its optimistic snapshot corresponds to
- support explicit recovery after commit failures
- leave room for future non-local change detection without requiring this slice to implement multi-window editing

### Queued Project Patch

A renderer-side wrapper around an existing `ProjectDocumentPatch` with transport metadata.

Suggested shape:

```ts
type PatchDispatchPolicy = 'batch' | 'realtime';

interface QueuedProjectPatch {
  patch: ProjectDocumentPatch;
  policy: PatchDispatchPolicy;
  interactionKey?: string;
}
```

Notes:

- the domain patch remains `ProjectDocumentPatch`
- transport metadata stays outside the persisted document model
- `interactionKey` allows coalescing or lifecycle grouping when needed

### Document Commit Receipt

The main-process acknowledgement returned after a successful document batch commit.

Suggested shape:

```ts
interface ProjectDocumentCommitReceipt {
  revision: number;
}
```

Purpose:

- confirms canonical success without returning a full project snapshot
- updates renderer-side revision tracking

### Realtime BSB Control Update

A normalized transport payload for high-frequency value-bearing widget interactions.

Suggested shape:

```ts
type BsbRealtimeControlKind =
  | 'value'
  | 'selected'
  | 'selectedIndex'
  | 'xy'
  | 'sliderBank';

interface BsbRealtimeControlUpdate {
  assignmentId: string;
  widgetId: string;
  kind: BsbRealtimeControlKind;
  payload: Record<string, number | boolean>;
}
```

Purpose:

- reach the main process and engine without the generic trailing document debounce
- keep the transport intent explicit instead of inferring it from general project patch batching

## Structural Sharing Targets

For a single ordinary BSB widget edit, the desired identity behavior is:

- new root store object: yes
- new orchestra container: only if the orchestra actually changed
- new arrangement row objects: only if the edit changes arrangement data
- new selected instrument snapshot: yes, if that instrument changed
- new unrelated instrument snapshots: no
- new changed widget branch: yes
- new unrelated widget branches: no

## Derived Metadata Boundaries

The following derived data should update only when their inputs change:

- object-name list: add/remove widget, rename object name, structural group change
- widget summary list: add/remove/reparent widget, type-changing operations if any are introduced later
- selected-widget projection: only when selection ids or the relevant widget identity changes

The following operations should not trigger full metadata recomputation by default:

- slider value drag
- knob value drag
- XY value drag
- position-only move
- size-only resize

## Renderer-Only State

Selection state, group navigation state, and transient drag state remain renderer-owned and should not be folded into the canonical project document.

Performance implication:

- renderer-only state should not invalidate unrelated widget props
- widgets should receive narrow selection booleans or selector-based state rather than a whole shared selection collection when possible