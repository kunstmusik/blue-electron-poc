# Contract: Score, Library, and Sound Object Compatibility

## Scope

This contract defines the compatibility surface for score graph structure, library-backed references, and common sound object XML.

## Required Behaviors

- `SoundObjectLibrary` preserves ordered library entries and stable object reference ids.
- `Instance` sound objects resolve through library ids rather than TypeScript-only local shortcuts.
- `InstrumentLibrary` preserves Java-compatible hierarchy and legacy arrangement lookup semantics.
- `Score` normalizes missing legacy structure the same way Java does.
- Common sound object XML uses Java full class names and Java base fields.
- `GenericScore` score text uses the Java score text field contract.
- Pattern and audio layer loaders accept Java-origin XML from their Java modules.

## Copy Rules

- Score graph deep copies must preserve nested layer groups, layers, sound objects, and compatibility-relevant fields.
- Library-backed references must remain valid in copied score trees.

## Test Matrix

- Library-backed `Instance` project
- Legacy arrangement instrument-library project
- `GenericScore` round-trip
- Nested `PolyObject` and `SoundLayer` round-trip
- Pattern and audio layer representative fixtures
