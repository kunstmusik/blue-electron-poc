# Quickstart: Score Editor Foundation

## Goal

Manually validate that Spec 036 replaces the `ScoreTopComponent` placeholder with a real Java-style score shell, persists score time-state behavior through the canonical project document, and supports nested `PolyObject` path navigation.

## Preconditions

1. Build and run the Electron app from `/Users/stevenyi/work/blue-electron`.
2. Prepare at least one representative project containing:
   - a root `PolyObject`
   - an `AudioLayerGroup`
   - a `PatternsLayerGroup`
   - at least one nested `PolyObject`
   - markers plus non-trivial tempo or meter data

## Validation Steps

1. Launch the app with no project loaded.
2. Open `ScoreTopComponent`.
3. Confirm the panel shows a deliberate empty state and not a placeholder shell.
4. Load the representative mixed-score project.
5. Reopen or focus `ScoreTopComponent`.
6. Confirm the panel renders a Java-style shell with:
   - a score-path bar or top score controls
   - left-side row headers
   - timeline rows for root `PolyObject`, audio, and pattern layer groups
   - ruler or header rows aligned with the timeline
7. Confirm the root layer-group order matches the canonical project score order.
8. Verify markers render in the score shell and line up with the current time axis.
9. Change supported score time-state settings such as:
   - row visibility
   - primary or secondary ruler display
   - snap enablement or snap value
   - zoom level
10. Save the project, close it, and reopen it.
11. Confirm the same score time-state configuration is restored.
12. Enter a nested `PolyObject` from the shell.
13. Scroll horizontally or vertically inside the nested view.
14. Return to the root score.
15. Re-enter the same nested `PolyObject`.
16. Confirm the nested path restores its prior scroll position instead of always resetting.
17. Remove or invalidate the currently open nested target, then confirm the panel falls back safely to root instead of crashing.

## Expected Results

- `ScoreTopComponent` is no longer a placeholder.
- Mixed root layer-group rows render correctly for the three in-scope group families.
- Score time-state changes persist through the canonical project document.
- Nested `PolyObject` path traversal works and restores per-path scroll context.
- Unsupported or invalid score-shell situations surface deliberate fallback states.

## Suggested Automated Coverage

- `packages/blue-data/src/time/time-state.test.ts`
- `packages/blue-app/src/renderer/tests/score-contract.test.ts`
- `packages/blue-app/src/renderer/tests/score-panel.test.tsx`
- `packages/blue-app/src/renderer/tests/score-rulers.test.tsx`
- `packages/blue-app/src/renderer/tests/score-path-navigation.test.tsx`
