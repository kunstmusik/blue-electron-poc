# Research: BlueSynthBuilder Performance and Live Interaction

**Branch**: `024-bsb-performance` | **Date**: 2026-04-27
**Sources**: Current renderer/store/main-process code under `/Users/stevenyi/work/blue-electron/packages/blue-app/src/`

---

## 1. Current Behavior Summary

### 1.1 The renderer performs whole-orchestra cloning for ordinary BSB edits

The optimistic reducer in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts` still routes ordinary orchestra patches through `cloneOrchestraSnapshot()` and `cloneInstrumentSnapshot()`. That path currently uses full deep cloning rather than path-copying the changed instrument and widget branch.

Practical result:

- every optimistic widget edit produces fresh references for the whole orchestra snapshot
- the selected instrument reference changes even for tiny value edits
- unchanged widget subtrees lose identity, which makes render isolation much harder

### 1.2 The top-level Orchestra panel subscribes too broadly

`/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/OrchestraPanel.tsx` subscribes to `state.orchestra` directly. That means a single BSB widget patch can invalidate the full panel tree, including the arrangement surface and selected-instrument routing.

### 1.3 The canonical success path triggers a second full update

The main-process handler in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts` returns a fresh full project snapshot from `update-project-document`, and the renderer flush path in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts` feeds that snapshot into `setProjectInfo()`.

Practical result:

- one user edit causes an optimistic render cascade
- the successful IPC round trip then causes a second full-state replacement
- the renderer pays for both the optimistic update and the canonical echo

### 1.4 High-frequency BSB edits are delayed behind a trailing debounce

The current `scheduleFlush()` logic clears and resets a 100 ms timer for each pending project patch. During a continuous drag, the queued patches keep extending the timer. That means the main process and engine sync do not receive updates during the gesture; they receive them only after interaction pauses long enough for the timer to fire.

This point matters because several external analyses assumed that each mousemove immediately produced an engine `setChannel()` call. That is not the current behavior.

### 1.5 Widget-tree bookkeeping runs too often

`applyBsbInterfacePatchToSnapshot()` currently performs helper work such as object-name collection and widget-list synchronization through generic widget-property update paths, even when the patch is just a value, position, or selection-related edit. Those operations should be limited to structure-changing or name-changing patches.

### 1.6 `React.memo` is not the root fix by itself

`/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/widgets/WidgetWrapper.tsx` is not memoized, but the more important issue is that the current component chain passes broad unstable props such as selection collections and action callbacks. As long as the store recreates the whole instrument tree and the panel subscriptions stay broad, memoization alone only hides symptoms.

---

## 2. Evaluation of the External Analyses

### 2.1 What they got right

- Several analyses correctly identified the whole-orchestra optimistic cloning problem.
- Several analyses correctly identified the broad `OrchestraPanel` selector as a rerender source.
- Several analyses correctly observed that widget memoization is currently absent.

### 2.2 What they overstated or missed

- The idea that unchanged widget props keep the same object identity is incorrect under the current deep-clone reducer.
- The idea that a slider drag immediately sends one `setChannel()` call per mousemove is incomplete; the current trailing debounce delays main-process and engine work until the interaction pauses.
- Focusing only on `React.memo` treats a symptom. The real problem is the combination of deep cloning, broad selectors, unstable props, and canonical snapshot echo.

---

## 3. Root-Cause Diagnosis

The performance problem is a pipeline issue with four linked costs:

1. The optimistic reducer deep-clones too much state.
2. The panel subscriptions observe too much of that cloned state.
3. The success path rehydrates a fresh canonical snapshot and repeats the invalidation.
4. High-frequency interactions share the same trailing flush policy as low-frequency document edits.

Fixing only one of those layers will not produce the best result.

---

## 4. Recommended Architecture Direction

### 4.1 Structural sharing first

Replace full-orchestra cloning with path-copying helpers that only recreate:

- the orchestra container when necessary
- the changed assignment or instrument
- the changed widget branch inside the BSB tree

Untouched assignments, instruments, and widget nodes should keep identity.

### 4.2 Narrow subscriptions second

After structural sharing exists, split renderer subscriptions so:

- the arrangement panel reads only arrangement data
- selected instrument views read only the selected assignment or instrument
- widget components observe only the data they actually render

### 4.3 Separate live control from document persistence

High-frequency value-bearing BSB edits need a different transport policy from ordinary document edits.

Recommended split:

- live-control updates: immediate or frame-coalesced dispatch to the main process and engine, no full snapshot echo
- document commits: batched IPC commit of queued project patches, no full snapshot echo on success
- full snapshot sync: reserved for load/open and explicit recovery

### 4.4 Remove canonical success echo

The canonical owner can stay in the main process without returning a fresh full snapshot on every successful local edit. The better contract is an acknowledgement or revision receipt on success, followed by explicit resync only on failure or external reload.

### 4.5 Make widget metadata updates conditional

Object-name indexes and widget summary lists should update only for:

- add/remove widget operations
- group reparenting or structure changes
- object-name edits
- operations that change lookup-relevant metadata

They should not rerun for ordinary value drags.

### 4.6 Use memoization only after prop stability exists

Once the reducer and selectors preserve identity, memoization becomes worthwhile. At that point the widget layer should avoid broad unstable props and pass explicit booleans or stable callbacks instead.

---

## 5. Non-Goals for This Slice

- New BSB widget features beyond the Spec 023 baseline
- Major visual redesign of the BSB editor
- Multi-window concurrency support
- Preset-application micro-optimization beyond preserving correctness

---

## 6. Proposed Validation Strategy

- Store identity tests for unchanged instruments and widget subtrees
- Renderer render-count tests for arrangement isolation and widget isolation
- Transport tests proving live-control edits bypass the trailing document debounce
- Manual React Profiler pass on a BSB-heavy project to confirm the canonical-echo cascade is gone