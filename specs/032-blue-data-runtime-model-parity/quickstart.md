# Quickstart: Blue Data Runtime Model Parity for Instruments, BSB, Mixer, Automation, and Time

## Preconditions

1. Work from `/Users/stevenyi/work/blue-electron`.
2. Keep Java Blue sources for orchestra, mixer, automation, and time models available under `/Users/stevenyi/work/nbprojects/blue`.
3. Prepare representative fixtures for BSB, generic instruments, mixer-heavy projects, automation, and time conversions.

## Validation Commands

```bash
pnpm --filter @blue/data test
git diff --check
```

## Manual Compatibility Checks

1. Compare Java and TypeScript instrument-related generated text for representative BSB and generic instrument fixtures.
2. Load and resave a mixer-heavy Java project and reopen it in Java Blue to confirm mixer structure survives.
3. Compare Java and TypeScript behavior for representative tempo-map, SMPTE, and BBST conversion cases.
4. Verify preservation-sensitive instrument types retain their data even where full execution remains deferred.
