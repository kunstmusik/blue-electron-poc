# Status: Tempo Map Parity

**Date**: 2026-05-20  
**Branch**: `045-tempo-map-parity`  
**State**: Closed, validated

## Handoff Summary

Spec 045 is closed. The slice delivered Java Blue tempo-map parity in the Score panel with a collapsed tempo region bar, expanded line editor, Project menu modal editor, canonical shared patch and snapshot support, and automated regression coverage across renderer, main, and `@blue/data` boundaries.

During closeout review, the remaining gaps were fixed instead of documented away: the line view now honors Ctrl axis-constrained dragging, the line-view point deletion flow uses an explicit context menu instead of immediate deletion on right-click, the collapsed region bar treats clicks near an existing point as point edits instead of creating duplicates, and the spec's previously claimed UI/menu tests were added for the real renderer surfaces.

## Artifact Inventory

- `spec.md`: Closed feature spec for tempo-map parity.
- `plan.md`: Implementation plan for the tempo region bar, line editor, modal editor, and canonical patch work.
- `research.md`: Java parity anchors and TypeScript seam audit.
- `data-model.md`: Tempo map, point, modal draft, and patch entities.
- `contracts/tempo-map-surface.md`: Shared snapshot and patch contract for tempo editing.
- `quickstart.md`: Updated validation commands and manual smoke scenarios.
- `tasks.md`: Implementation checklist reflecting delivered work; automated implementation and validation tasks are complete, and the manual quickstart task remains available if a fresh smoke pass is desired.
- `status.md`: This handoff summary.

## Delivered Scope

- Added `TempoMap.visible` listener propagation in `@blue/data` and kept enabled/visible/point XML round-trip coverage intact.
- Extended shared tempo snapshots with visibility and optional position metadata, and added typed tempo patch variants for enabled, visible, add, update, curve-type, remove, and replace-map operations.
- Implemented canonical main-process tempo patch application and optimistic renderer tempo patch merging.
- Replaced the static score tempo row with `TempoRegionBar`, `TempoLineView`, and `TempoPointDialog` surfaces wired to canonical patches.
- Wired the left score header Use Tempo checkbox and arrow toggle to canonical tempo enabled and visible state.
- Implemented `TempoMapEditorDialog` and connected Project → Edit Tempo Map... through native menu IPC into the renderer.
- Added renderer regression coverage for the region bar, line view, modal editor, and Project menu wiring.

## Key Policy Decisions

- Direct tempo-point authoring from the ruler surfaces remains root-timeline-only; nested score views continue to display the shared project tempo map without local nested tempo state.
- The Project menu modal remains a copied draft until OK dispatches a single `replaceTempoMap` patch.
- Save/load compatibility stays anchored to existing `@blue/data` tempo XML rather than renderer-local state.

## Validation State

Automated validation completed:

- `pnpm --filter @blue/data build` — pass
- `pnpm --filter @blue/data test -- --maxWorkers=1` — pass (`94` files, `907` tests)
- `pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/main/application-menu.test.ts src/renderer/tests/tempo-map-contract.test.ts src/renderer/tests/tempo-row-parity.test.tsx src/renderer/tests/tempo-line-view.test.tsx src/renderer/tests/tempo-map-modal.test.tsx --browser.enabled=false` — pass (`5` files, `32` tests)
- `pnpm --filter @blue/app exec vitest run --config vitest.config.ts --browser.enabled=false` — pass (`98` files, `1022` passed, `2` skipped)
- `pnpm --filter @blue/app build` — pass
- `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` — pass
- `git diff --check` — pass

## Notes

- The full `@blue/app` Vitest suite still emits pre-existing React `act(...)` warnings from `settings-window.test.tsx` and jsdom `HTMLCanvasElement.getContext()` warnings from unrelated renderer tests, but the suite exits cleanly and no Spec 045 regressions remain.
- Manual quickstart scenarios from `quickstart.md` were not rerun during this documentation closeout step; `tasks.md` still preserves that optional smoke-validation task for a future interactive pass.

## Next Action

Spec 045 can be treated as closed. The natural follow-up is Spec 046 meter-map parity.