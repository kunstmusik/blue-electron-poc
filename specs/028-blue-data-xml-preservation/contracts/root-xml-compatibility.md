# Contract: Root XML Compatibility

## Scope

This contract defines what `BlueData.loadFromString()`, `saveToString()`, and `deepCopy()` must preserve at the root document level for Java compatibility.

## Required Root Sections

The following sections must be loaded and resaved without loss when present in input XML:

- `soundObjectLibrary`
- `instrumentLibrary`
- `projectProperties`
- `mixer`
- `tables`
- `globalOrcSco`
- `opcodeList`
- legacy root `udo`
- `pluginData`
- `markersList`
- `scratchPadData`
- `midiInputProcessor`
- `liveData`
- legacy root `timeContext`

## Load Ordering Rules

- Library-backed and reference-backed sections must load before any root section that depends on them.
- Legacy root `udo` and `timeContext` content must be migrated into the canonical TypeScript root model before later save or render work uses the document.

## Save Rules

- Saved root XML must use Java-compatible section names and field names.
- Sections omitted in input because they were truly absent must not be invented unless Java itself would emit them by default.
- Legacy aliases are accepted on load, but save uses the canonical Java output form.

## Deep Copy Rules

- `deepCopy()` must preserve the same compatibility-relevant root sections as the source object.
- Preservation-only root sections must survive copying even if TypeScript does not yet execute their runtime behavior.
