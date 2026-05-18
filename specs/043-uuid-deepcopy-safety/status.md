# Status: UUID And Deep Copy Safety

**Date**: 2026-05-18  
**Branch**: `043-uuid-deepcopy-safety`  
**State**: Closed, validated

## Handoff Summary

Spec 043 is closed. The slice delivered a shared internal UUID helper, load-time BSB widget uniqueId normalization, clone-safe duplicate rekeying for `BlueSynthBuilder` and `Sound`, programmatic duplicate behavior for BSB aggregates, structured embedded BSB state for `Sound`, and regression coverage for both data and renderer patch flows.

The reviewed P1 issue is covered directly by User Story 1: loading BSB data with explicit widget uniqueIds or legacy child `<id>` values and then adding a widget no longer generates a colliding uniqueId. The broader duplicate identity issue is covered by User Story 2: BSB and Sound duplicates now preserve musical content while rekeying local BSB widget, automation parameter, preset, and dropdown item identities.

## Artifact Inventory

- `spec.md`: Closed feature spec with the delivered identity policy and no open clarification markers.
- `plan.md`: Implementation plan used to drive the slice.
- `research.md`: Design decisions for UUID helper, load normalization, duplicate rekeying, structured Sound BSB handling, and preset/dropdown reference rewriting.
- `data-model.md`: Entities for widget uniqueId, graphic interface state, automation parameter identity, lookup identities, programmatic duplicates, and Sound embedded BSB state.
- `contracts/identity-copy-contract.md`: Operation contract for ordinary load/save, new widget creation, user-visible duplicate, and widget-targeted mutation.
- `quickstart.md`: Updated validation commands and manual compatibility checks.
- `tasks.md`: Implementation checklist updated to reflect delivered work; all 74 tasks are checked off.

## Delivered Scope

- Added `packages/blue-data/src/utilities/uuid.ts` as the shared browser-safe UUID generator and kept it internal rather than exporting it from the package root.
- Added `packages/blue-data/src/instruments/blue-synth-builder/bsb-identity.ts` for widget traversal, load repair, collision-safe creation, and duplicate rekey mapping across nested groups and slider-bank child sliders.
- Removed the preserved-ID structural clone split across `BSBWidget`, `BSBGraphicInterface`, `BSBGroup`, `Preset`, `PresetGroup`, `Parameter`, `ParameterList`, and `BlueSynthBuilder`.
- Updated `BlueSynthBuilder.loadFromXML()` to persist repaired widget uniqueIds by invalidating the cached raw graphic-interface XML when repairs or legacy child `<id>` migration occur.
- Removed `Sound._bsbInstrumentText`; `Sound` now stores a structured embedded `BlueSynthBuilder` and keeps text adapter methods for compatibility.
- Routed `BlueSynthBuilder.deepCopy()`, `Sound` duplication, and `CopyBuffer` duplicate flows through the clone-safe rekey path.
- Rekeyed preset uniqueIds and dropdown item uniqueIds during duplication while preserving and rewriting dependent preset references.

## Key Policy Decisions

- BSB widget uniqueIds are clone-sensitive edit handles and must be unique within one BSB interface.
- Automation parameter uniqueIds are clone-sensitive and must be rekeyed during user-visible duplication.
- Preset uniqueIds and dropdown item uniqueIds are preserved for ordinary load/save, regenerated for duplication, and kept coherent by rewriting dependent references.
- Ordinary load/save preserves explicit uniqueIds and only repairs missing or duplicate widget uniqueIds before editing; when repairs or legacy child `<id>` migration occur, the canonical save path emits the repaired identity as a `uniqueId` attribute instead of stale raw XML.
- Preserved-ID cloning is not a supported public behavior; `deepCopy()` has duplicate semantics.

## Validation State

Automated validation completed:

- `pnpm --filter @blue/data test` — pass (`94` files, `891` tests)
- `pnpm --filter @blue/data build` — pass
- `pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/sound-editor-contract.test.ts --browser.enabled=false` — pass (`1` file, `14` tests)
- `pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/score-object-editor-panel-sound-patch.test.ts --browser.enabled=false` — pass (`1` file, `6` tests)
- `pnpm --filter @blue/app build` — pass
- `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` — pass
- Manual quickstart scenarios 1-8 from `quickstart.md` — pass via executable Node validation
- `git diff --check` — pass

## Notes

- The internal UUID helper was intentionally not exported from `packages/blue-data/src/index.ts`; current callers are all internal to `@blue/data`.
- `UUID_AND_DEEPCOPY.md` was not present in the workspace during implementation review. The generated Spec Kit documents remained the active source of truth.
- `Sound` now owns structured BSB state; `getBSBInstrumentText()` and `setBSBInstrumentText()` remain as compatibility adapters for existing app code.
- Repairing malformed loaded widget uniqueIds is an intentional bounded integrity fix and now persists on the next save.

## Next Action

Spec 043 can be treated as closed. The remaining useful follow-up is a normal commit/PR pass.
