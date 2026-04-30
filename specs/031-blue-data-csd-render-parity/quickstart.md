# Quickstart: Blue Data CSD Render Pipeline Parity

## Preconditions

1. Work from `/Users/stevenyi/work/blue-electron`.
2. Keep Java render sources available under `/Users/stevenyi/work/nbprojects/blue`.
3. Prepare representative project fixtures for arrangement, UDO, automation, tempo-map, audio-layer, and render-boundary cases.

## Validation Commands

```bash
pnpm --filter @blue/data test
pnpm --filter @blue/data build
git diff --check
```

## Manual Compatibility Checks

1. Generate CSD for the representative fixture set in Java Blue and in TypeScript.
2. Compare orchestra and score output after normalizing non-semantic formatting.
3. Verify projects using UDO collisions, automation, tempo maps, audio layers, and render macros produce Java-compatible output.
4. Confirm render generation does not mutate the source `BlueData` instance during repeated test runs.
5. Use `packages/blue-data/src/test-support/csd-render-fixtures.ts` and `packages/blue-data/src/test-support/csd-comparison.ts` for shared fixture extraction and comparison helpers.
