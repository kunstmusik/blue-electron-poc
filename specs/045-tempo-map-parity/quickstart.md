# Quickstart: Tempo Map Parity

## Automated Validation

Rebuild `@blue/data` before app-side validation if the tempo model or snapshot code changed:

```bash
pnpm --filter @blue/data build
```

Run the focused contract tests added by this spec:

```bash
pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/tempo-map-contract.test.ts --browser.enabled=false
```

Run the application menu tests:

```bash
pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/main/application-menu.test.ts --browser.enabled=false
```

Run the focused renderer and menu suite added by this spec:

```bash
pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/main/application-menu.test.ts src/renderer/tests/tempo-map-contract.test.ts src/renderer/tests/tempo-row-parity.test.tsx src/renderer/tests/tempo-line-view.test.tsx src/renderer/tests/tempo-map-modal.test.tsx --browser.enabled=false
```

Run the full app test suite:

```bash
pnpm --filter @blue/app test
```

Run the app build:

```bash
pnpm --filter @blue/app build
```

Run data tests for tempo-map behavior:

```bash
pnpm --filter @blue/data test -- src/time/tempo-map.test.ts
```

Run final whitespace validation:

```bash
git diff --check
```

## Validation Results (2026-05-20)

- `pnpm --filter @blue/data build` — pass
- `pnpm --filter @blue/data test -- --maxWorkers=1` — 94 files, 907 passed
- `pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/main/application-menu.test.ts src/renderer/tests/tempo-map-contract.test.ts src/renderer/tests/tempo-row-parity.test.tsx src/renderer/tests/tempo-line-view.test.tsx src/renderer/tests/tempo-map-modal.test.tsx --browser.enabled=false` — 5 files, 32 passed
- `pnpm --filter @blue/app exec vitest run --config vitest.config.ts --browser.enabled=false` — 98 files, 1022 passed, 2 skipped
- `pnpm --filter @blue/app build` — pass
- `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` — pass
- `git diff --check` — pass

## Manual Scenario 1: Tempo Region Bar

1. Open a project with the Score panel visible.
2. Ensure the tempo row is visible from the row context menu.
3. Toggle Use Tempo on and off; verify the row changes enabled/disabled styling and the project remains saveable.
4. Double-click the tempo row around beat 4; verify a new tempo point is added at the snapped beat when snap is enabled.
5. Right-click the new region; verify Edit Tempo..., Constant, Linear, and Delete Tempo Point appear.
6. Change the segment to Linear; verify a ramp indicator appears.
7. Delete the non-first tempo point; verify the first point remains.

## Manual Scenario 2: Tempo Point Dialog

1. Double-click the first tempo point region.
2. Verify the point edit dialog opens and the position is fixed at beat 0.
3. Change tempo and confirm; verify the bar updates.
4. Add a second point and edit it.
5. Try to move it before the first point; verify the value is clamped or rejected.
6. Save, reload, and verify the edited map persists.

## Manual Scenario 3: Expanded Tempo Line View

1. Click the arrow in the tempo row header.
2. Verify the line graph opens below the tempo bar and row/header height becomes 100px.
3. Click in empty graph space; verify a new point appears at the clicked beat/tempo.
4. Drag a point vertically; verify tempo changes and clamps to the graph range.
5. Drag a non-first point horizontally; verify it cannot pass neighbors and snap applies.
6. Hold Shift while dragging; verify snap is bypassed.
7. Hold Ctrl while dragging; verify movement is constrained to one axis.
8. Right-click a segment; verify Constant/Linear context menu changes the curve.
9. Click the arrow again; verify the line graph collapses.
10. Save, reload, and verify expanded/collapsed state matches the tempo map visible flag.

## Manual Scenario 4: Project Menu Modal

1. With a project loaded, open the Project menu.
2. Choose Edit Tempo Map....
3. Verify the modal shows Beat, Tempo (BPM), and Delete columns.
4. Add a row; verify it appears at last beat + 4.0 with the previous tempo.
5. Delete a row when more than one exists; verify delete is disabled for the final row.
6. Change values and press Cancel; verify the score tempo row does not change.
7. Reopen, change values, press OK; verify the tempo row updates.
8. Save and reload; verify the confirmed modal changes persist.

## Manual Scenario 5: Regression Checks

1. Open a project with markers, meter changes, and the score ruler visible.
2. Edit tempo points from both the region bar and modal.
3. Verify marker dragging, render-start selection, primary/secondary rulers, and playback playhead still align with updated tempo conversion.
4. Verify Spec 046 meter rows still render unchanged before meter work starts.
