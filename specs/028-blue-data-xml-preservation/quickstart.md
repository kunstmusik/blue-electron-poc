# Quickstart: Blue Data XML Preservation and Root Compatibility

## Preconditions

1. Work from `/Users/stevenyi/work/blue-electron`.
2. Keep Java Blue sources available under `/Users/stevenyi/work/nbprojects/blue`.
3. Prepare representative `.blue` fixtures that exercise root sections and legacy tags.

## Validation Commands

```bash
pnpm --filter @blue/data test
git diff --check
```

## Manual Compatibility Checks

1. Load a Java `.blue` file containing `soundObjectLibrary`, `instrumentLibrary`, plugin data, markers, scratch data, and MIDI input processor data.
2. Save the project back to XML from TypeScript.
3. Reopen the saved XML in Java Blue and verify those root sections remain present and loadable.
4. Load a project with no `<mixer>` section and verify the resulting TypeScript object reflects Java-compatible disabled mixer behavior.
5. Deep-copy a populated `BlueData` instance, mutate the copy, and verify the source object remains unchanged while retained root sections match.
