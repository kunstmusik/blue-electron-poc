# Research: Blue Data Score, Library, and Sound Object Model Parity

## Java Blue Source Anchors

- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/SoundObjectLibrary.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/InstrumentLibrary.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/score/Score.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/PolyObject.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/SoundLayer.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/GenericScore.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-core`
- `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-patterns-core`

## Current TypeScript Source Anchors

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/instrument-library.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/poly-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/sound-layer.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/generic-score.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score-layers/`

## Decision: Library And Score Graph Parity Belong In One Slice

Library-backed references, legacy arrangement resolution, and score graph defaults are tightly connected. Fixing them independently would still leave projects structurally unsafe.

**Decision**: Group `SoundObjectLibrary`, `InstrumentLibrary`, `Score`, `PolyObject`, `SoundLayer`, and common sound object XML compatibility into a single model-parity slice.

**Rationale**: These structures share load ordering, reference binding, copy behavior, and XML contracts.

## Decision: Normalize Java Class Names Centrally

TypeScript currently loads some sound object types only when short names are used or when local loaders happen to strip prefixes.

**Decision**: Centralize Java full-class-name normalization at the registry and loader boundaries rather than relying on one-off fixes in individual classes.

**Rationale**: This avoids repeating fragile type-name normalization logic across score, live data, pattern layers, and other consumers.

## Decision: Pattern And Audio Layers Are First-Class Compatibility Targets

Some external reports treated pattern and audio layers as absent from Java because they live outside `blue-core`.

**Decision**: Treat the Java audio and pattern layer modules as required compatibility sources for this slice.

**Rationale**: Their XML appears inside projects and therefore affects round-trip safety even when their implementation lives in separate Java modules.

## Decision: Fix Java Basic Sound Object XML Before Render Work

TypeScript currently saves multiple sound objects with TypeScript-specific tags or base fields.

**Decision**: Restore Java base sound object XML contracts in this slice and leave later render semantics to downstream specs.

**Rationale**: Save compatibility must be safe before any deeper render parity can be trusted.
