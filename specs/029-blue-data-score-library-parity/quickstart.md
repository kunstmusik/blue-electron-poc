# Quickstart: Blue Data Score, Library, and Sound Object Model Parity

## Preconditions

1. Work from `/Users/stevenyi/work/blue-electron`.
2. Keep Java source references available in `/Users/stevenyi/work/nbprojects/blue`.
3. Prepare representative `.blue` fixtures covering libraries, legacy arrangement ids, nested score graphs, pattern layers, and audio layers.

## Validation Commands

```bash
pnpm --filter @blue/data test
git diff --check
```

## Manual Compatibility Checks

1. Load a project containing `soundObjectLibrary` entries and `Instance` sound objects.
2. Save and reopen the result in Java Blue and confirm library-backed references still point at the intended sound objects.
3. Load a project with legacy arrangement instrument ids and verify instrument bindings survive load/save.
4. Save a project containing `GenericScore`, `PolyObject`, pattern layers, and audio layers; reopen it in Java Blue and confirm the structure still loads.
5. Deep-copy a nested score graph and verify mutations on the copy do not affect the source tree.

## Closeout Validation

The completed slice was validated with:

- `pnpm --filter @blue/data test`
- `pnpm --filter @blue/app test`
- `git diff --check`
