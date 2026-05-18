# Quickstart: UUID And Deep Copy Safety

## Preconditions

1. Work from `/Users/stevenyi/work/blue-electron`.
2. Keep `.specify/feature.json` pointed at `specs/043-uuid-deepcopy-safety`.
3. Use Java Blue sources under `/Users/stevenyi/work/nbprojects/blue` as the copy-constructor reference when TypeScript behavior is unclear.
4. Keep implementation inside `@blue/data` unless a task explicitly calls out renderer verification.

## Recommended Implementation Order

1. Add failing data-layer tests for BSB load/create identity safety.
2. Add the shared UUID helper and route BSB widget creation through it.
3. Normalize loaded BSB widget uniqueIds, preserving unique explicit uniqueIds and repairing missing/duplicate uniqueIds.
4. Add programmatic duplicate-copy helpers for BSB graphic interface, groups, widgets, presets, and opcode/preset aggregates.
5. Add duplicate rekey helpers for BSB widget uniqueIds and automation parameter uniqueIds.
6. Route `BlueSynthBuilder` and `Sound` user-visible duplication through the rekey path.
7. Validate ordinary load/save preservation and sibling-isolation patching.

## Validation Commands

```bash
pnpm --filter @blue/data exec vitest run src/utilities/uuid.test.ts src/instruments/blue-synth-builder/bsb-identity.test.ts src/instruments/blue-synth-builder/bsb-graphic-interface.test.ts src/instruments/blue-synth-builder/bsb-group.test.ts src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts src/automation/parameter.test.ts src/instruments/blue-synth-builder/preset-group.test.ts src/sound-objects/sound.test.ts src/copy-buffer.test.ts
pnpm --filter @blue/data test
pnpm --filter @blue/data build
pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/sound-editor-contract.test.ts --browser.enabled=false
pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/score-object-editor-panel-sound-patch.test.ts --browser.enabled=false
pnpm --filter @blue/app build
./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks
git diff --check
```

## Manual Compatibility Checks

1. Load a BSB XML fragment containing `uniqueId="w1"`, add a widget, and confirm the new widget uniqueId is not `w1`.
2. Load a legacy BSB XML fragment containing `<id>w1</id>`, save it, and confirm it writes `uniqueId="w1"`.
3. Load a legacy BSB XML fragment with no widget uniqueIds and confirm every widget is editable through a uniqueId.
4. Load a BSB XML fragment with duplicate widget uniqueIds and confirm only later colliding widgets are rekeyed before editing.
5. Save and reload BSB data with explicit uniqueIds and confirm those uniqueIds survive unchanged.
6. Duplicate a BSB instrument with automation parameters and confirm widget uniqueIds and parameter uniqueIds differ between original and duplicate.
7. Duplicate a Sound object containing embedded BSB XML and confirm patching one duplicate by widget uniqueId leaves the sibling duplicate unchanged.
8. Confirm preset uniqueIds and dropdown item uniqueIds are preserved during load/save, regenerated during duplication, and have dependent references rewritten.

## Completion Criteria

- All implementation and automated validation tasks in `tasks.md` are complete.
- `spec.md` remains in `Closed` status with no unresolved clarification markers.
- `STATUS.md` records validation results and any deferred scope.
- The duplicate BSB widget uniqueId P1 regression is covered by a named test.
- Manual quickstart scenarios are recorded in `status.md`.
- `UUID_AND_DEEPCOPY.md` is no longer needed as active planning input after the implementation starts from these spec docs.
