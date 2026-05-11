# Contract: Score Editor Management and Navigation Surfaces

## Scope

This contract covers the shell-level management and navigation workflows that remain after the score foundation and score-object editor slices.

## Score Management Surface

Extend the shared score contract in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` with any additional structure-management operations this slice needs.

Representative shapes:

```ts
type ScorePatch =
  | { type: 'moveLayerGroup'; groupId: string; targetIndex: number }
  | { type: 'renameLayerGroup'; groupId: string; name: string }
  | { type: 'reorderLayer'; groupId: string; layerId: string; targetIndex: number }
  | { type: 'removeLayerGroup'; groupId: string };
```

Requirements:

- Reuse existing score patch infrastructure rather than inventing separate dialog-only mutation paths.
- Management dialogs must operate on canonical score structure and refresh the visible shell in place.

## Navigation Surface

Expected shell-level surfaces may include:

- `ScoreManagerDialog` equivalent
- `LayerGroupManagerDialog` equivalent
- score navigator or overview surface
- marker-navigation workflow and any related `MarkersTopComponent` follow-up

Requirements:

- Marker and navigator actions should reposition the score shell predictably.
- Score-adjacent panels included in this slice must render a real supported workflow or an explicit deferred state.

## Follow Playback Surface

Requirements:

- Follow playback should stay coordinated with the score shell viewport and any visible time pointer.
- The implementation should prefer shell-local follow state over excessive shared-store churn.

## Tests

Add or extend coverage for:

- score manager and layer-group-manager operations
- marker-navigation and score navigator behavior
- playback-follow or pointer behavior in the score shell
- score-adjacent panel routing or placeholder replacement claimed by this slice