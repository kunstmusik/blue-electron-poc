# Research: Blue Data CSD Render Pipeline Parity

## Java Blue Source Anchors

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/render/CSDRender.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/render/CompileData.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/Arrangement.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/mixer/`

## Current TypeScript Source Anchors

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/compile-data.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/arrangement/`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/`

## Decision: Treat Java CSDRender As The Pipeline Source Of Truth

Current TypeScript `toCSD()` is materially simpler than Java and omits multiple compile-time stages.

**Decision**: Use Java `CSDRender` structure, not the current TypeScript flow, as the design source of truth for this slice.

**Rationale**: Incremental patching of the current simplified renderer would keep missing compile-time steps hidden and hard to test.

## Decision: Complete CompileData Before Adding More Renderer Features

The report identified missing source ids, table numbering, string channels, and original-parameter handling.

**Decision**: Bring `CompileData` to parity as part of this slice rather than treating it as an incidental helper.

**Rationale**: Render correctness depends on complete compile-time bookkeeping, not only final string assembly.

## Decision: Use Fixture-Based CSD Comparisons

Text generation parity is hard to validate from unit assertions against isolated helper functions.

**Decision**: Build representative project fixtures and compare Java-generated and TypeScript-generated CSD after agreed normalization of non-semantic formatting.

**Rationale**: This provides confidence at the same abstraction level users care about.

## Decision: Audio And Always-On Scheduling Stay In Render Scope

Audio-layer instrument ids and always-on instrument scheduling currently fail because compile-time numbering is incomplete.

**Decision**: Keep those fixes in the render pipeline slice instead of scattering them into unrelated model specs.

**Rationale**: They depend on compile-time source-id and scheduling behavior rather than pure XML structure.
