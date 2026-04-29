# Research: Blue Data Runtime Model Parity for Instruments, BSB, Mixer, Automation, and Time

## Java Blue Source Anchors

- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/BlueSynthBuilder.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/GenericInstrument.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/JavaScriptInstrument.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/PythonInstrument.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/BlueX7.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/automation/`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/time/`

## Current TypeScript Source Anchors

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/`

## Decision: Group Remaining Runtime-Oriented Models In One Tail Slice

After XML, score, parser, and render-pipeline work, the remaining high-risk compatibility gaps cluster around instruments, BSB, mixer, automation, and time behavior.

**Decision**: Capture those remaining models in one final parity slice so later planning can execute them after the foundational specs.

**Rationale**: These areas share dependencies on generated text, automation semantics, and time calculations, but they are not prerequisites for the earlier XML and parser slices.

## Decision: Preserve Constitution Rules For JVM-Dependent Models

Some instrument types cannot be treated as ordinary native TypeScript models.

**Decision**: Keep the constitution's preservation-first rule for JVM-dependent models and require either compatible execution or documented, lossless preservation behavior.

**Rationale**: Data loss is not acceptable merely because runtime execution is harder.

## Decision: Treat Mixer As Both XML And Runtime Data

Mixer compatibility issues affect saved XML, generated text, and dependency ordering.

**Decision**: Keep mixer compatibility inside this slice rather than splitting XML and runtime behavior apart.

**Rationale**: Separating them would still leave routing and generated-output parity incomplete.

## Decision: Restore Java Time Math Exactly

The report identified concrete bugs in BBST conversion, tempo sorting, reset behavior, and default SMPTE values.

**Decision**: Use Java time and automation math as the exact reference for this slice rather than approximating behavior from current TypeScript implementations.

**Rationale**: Small time math differences create wide parity drift across editing and rendering.
