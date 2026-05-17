# Contract: Score Editor Management and Navigation Surfaces

## Scope

This contract covers the shell-level management and navigation workflows that remain after the score foundation and score-object editor slices, with explicit emphasis on root-ruler render-range parity and marker authoring parity.

## Root Ruler And Transport Surface

Reuse the existing transport patch path in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` for render start or end updates.

Representative shape:

```ts
type ProjectDocumentPatch = {
  transport?: {
    renderStartTime?: number;
    renderEndTime?: number;
    loopRendering?: boolean;
  };
};
```

Requirements:

- Root-ruler click commits a single-point render selection by setting `renderStartTime` and clearing `renderEndTime`.
- Root-ruler drag commits an ordered render range by setting both transport values.
- The shell redraws render start, render end, and the highlighted selection from canonical transport state rather than renderer-only caches.

## Marker Surface

Extend the shared score contract in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` with marker mutation operations.

Representative shapes:

```ts
type ScorePatch =
  | { type: 'addMarker'; timeBeats: number; name?: string }
  | { type: 'updateMarker'; sourceIndex: number; patch: { name?: string; timeBeats?: number } }
  | { type: 'removeMarker'; sourceIndex: number }
  | { type: 'moveLayerGroup'; groupId: string; targetIndex: number }
  | { type: 'renameLayerGroup'; groupId: string; name: string }
  | { type: 'removeLayerGroup'; groupId: string }
  | { type: 'addLayer'; groupId: string; layerIndex: number }
  | { type: 'removeLayer'; groupId: string; layerIndex: number }
  | { type: 'moveLayer'; groupId: string; layerIndex: number; targetIndex: number }
  | { type: 'renameLayer'; groupId: string; layerIndex: number; name: string };
```

Requirements:

- Ruler-created markers, menu-created markers, moved markers, and renamed markers must all flow through canonical score patch infrastructure.
- Marker mutation results must refresh both the score-shell marker row and any marker-related auxiliary workflow from the same snapshot source.
- Root-timeline-only authoring semantics should be preserved.
- Supported score-manager layer and layer-group edits must also flow through canonical score patches so shell updates survive save or reload.

## Native Menu And Shortcut Surface

Extend the shared native menu command contract in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts` for the marker and follow-playback commands that are currently placeholders.

Representative shapes:

```ts
type NativeMenuCommand =
  | { type: 'add-marker' }
  | { type: 'toggle-follow-playback-on-render-start' }
  | { type: 'toggle-follow-playback' }
  | { type: 'toggle-loop-rendering' }
  | { type: 'focus-panel'; panelId: string };
```

Requirements:

- `Project > Add Marker` and `CmdOrCtrl+M` should route through the same shared command path used by the renderer.
- When playback is active, `Project > Add Marker` should create the marker at the current Java-style playhead/render time; when idle, it should create at render start.
- The follow-playback-on-render-start menu item should stop being a silent placeholder and must share state with the score shell's follow behavior.

## Navigation And Panel Surface

Expected shell-level surfaces may include:

- `ScoreManagerDialog` equivalent
- `LayerGroupManagerDialog` equivalent
- marker list or marker navigation surface replacing the current `MarkersTopComponent` placeholder
- score navigator or overview workflow if needed by the marker-centered navigation story

Requirements:

- Marker and navigator actions should reposition the score shell predictably.
- The marker-related auxiliary panel should expose at least one real navigation or set-render-start workflow.
- Score-adjacent panels included in this slice must render a real supported workflow or an explicit deferred state.

## Follow Playback Surface

Requirements:

- Follow playback should stay coordinated with the score shell viewport, render-range state, and any visible time pointer.
- The implementation should prefer shell-local follow state over excessive shared-store churn.

## Tests

Add or extend coverage for:

- root-ruler click or drag render-range behavior and save or reload persistence
- marker creation from the ruler and menu or shortcut paths
- marker move, rename, and any supported context actions
- score manager and layer-group-manager operations
- marker-list or marker-navigation behavior
- follow-playback or pointer behavior in the score shell
- score-adjacent panel routing or placeholder replacement claimed by this slice
