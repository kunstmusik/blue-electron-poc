# Contract: BlueSynthBuilder Performance Surface

## Goal

Define the transport and state-synchronization surface needed to implement Spec 024 without changing `.blue` serialization semantics.

## Shared Renderer/Main Contracts

### 1. Batch document commit

Current problem:

- the renderer flushes queued patches through repeated `updateProjectDocument()` calls
- each successful call returns a full project snapshot
- the renderer then rehydrates that snapshot with `setProjectInfo()`

Proposed contract:

```ts
commitProjectDocumentPatches(
  patches: ProjectDocumentPatch[],
): Promise<ProjectDocumentCommitReceipt>
```

Behavior:

- applies patches in order to the canonical project document
- returns a revision receipt on success
- does not return a full project snapshot on ordinary local success
- may throw, allowing the renderer to perform explicit recovery

### 2. Realtime BSB control transport

Proposed contract:

```ts
sendBsbRealtimeControlUpdate(
  update: BsbRealtimeControlUpdate,
): Promise<void>
```

Behavior:

- applies the value-bearing BSB update to canonical state as needed
- forwards the targeted channel update to the engine when playback is active
- avoids the generic trailing document debounce path used for ordinary patch batching

Notes:

- the renderer may still enqueue the underlying document patch for save correctness when needed
- the main process should avoid returning snapshots on this path

### 3. Explicit recovery sync

Existing contract retained:

```ts
getProjectDocument(): Promise<ProjectEditorSnapshot | null>
```

Use cases:

- initial project load
- explicit recovery after a failed batch commit
- future revision mismatch handling

## Renderer Store Contract Expectations

### `setProjectInfo()` usage

`setProjectInfo()` should be reserved for:

- project load and open
- explicit recovery sync
- future non-local canonical updates

It should not be the ordinary success path for local edits.

### Patch scheduling

The renderer should schedule patches by policy:

- `realtime`: immediate or frame-coalesced send to main and engine
- `batch`: trailing or short-window grouped document commit

### Failure handling

If `commitProjectDocumentPatches()` fails:

1. surface the error
2. fetch a fresh canonical snapshot through `getProjectDocument()`
3. reconcile the renderer snapshot and revision state explicitly

## Testable Contract Expectations

- a successful local batch commit does not return a full snapshot
- a successful realtime control update does not trigger `setProjectInfo()`
- a failed batch commit triggers explicit recovery
- batch commits preserve patch order
- realtime control updates target only the relevant engine channel set