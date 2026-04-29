# Contract: CSD Render Pipeline Compatibility

## Scope

This contract defines the `@blue/data` render-generation behavior later UI and engine features may rely on.

## Required Pipeline Behaviors

- Render starts from compatibility-safe project copies.
- Compile-time bookkeeping matches Java for source ids, tables, channels, parameters, and automation.
- UDO merging and collision handling matches Java.
- Global orchestra and global score preprocessing matches Java.
- Tempo-map output and render-boundary handling match Java.
- Audio-layer and always-on instrument scheduling use real compile-time ids.

## Output Rules

- Generated CSD may differ in incidental formatting, but semantic orchestra/score content must match Java behavior.
- Macro substitutions and generated instrument ids must be deterministic for parity fixtures.

## Test Matrix

- arrangement plus global orchestra/score fixture
- UDO collision fixture
- tempo-map and render-boundary fixture
- parameter automation fixture
- audio-layer and always-on scheduling fixture
