# Research: UUID And Deep Copy Safety

## Decision: Use a shared browser-safe UUID helper for new clone-sensitive identities

**Decision**: Add one `@blue/data` utility for UUID-style identity generation and route new BSB widget uniqueIds plus new automation parameter uniqueIds through it.

**Rationale**: BSB widget uniqueIds and automation parameter uniqueIds are generated in `@blue/data`, which must remain browser-safe and Node-safe. The helper can use `globalThis.crypto.randomUUID()` where available and a deterministic-format fallback based on `getRandomValues()` or `Math.random()` where it is not. Centralizing this keeps future identity changes out of widget and parameter model code.

**Alternatives considered**:

- Keep `_nextWidgetId` and random integer generation. Rejected because counter reset already caused the P1 collision, and random integer strings do not provide a clear clone-safety policy.
- Use a Node UUID package. Rejected because `@blue/data` cannot depend on Node built-ins or Node-only packages.
- Generate IDs only in the renderer. Rejected because canonical model duplication and load normalization happen in `@blue/data`.

## Decision: Normalize BSB widget uniqueIds on load, preserving valid explicit uniqueIds where possible

**Decision**: Ordinary BSB load must preserve explicit unique widget uniqueIds, migrate legacy child `<id>` values, assign uniqueIds to missing legacy widgets, and repair duplicate loaded uniqueIds by preserving the first occurrence and rekeying later colliding occurrences.

**Rationale**: Ordinary load/save preservation matters for XML compatibility, but exposing a loaded interface with duplicate uniqueIds makes all identity-targeted editing unsafe. Repairing duplicates at load is a bounded integrity fix, not a broad migration. It directly addresses the reviewed P1 scenario where loaded explicit identities and new generated identities can collide.

**Alternatives considered**:

- Preserve duplicate uniqueIds exactly on load. Rejected because update/remove/move operations would target ambiguous widgets.
- Regenerate every widget uniqueId on load. Rejected because it would churn saved project data and break identity continuity.
- Track only the maximum old sequential id. Rejected because future uniqueIds should be UUID-style and because existing files may contain arbitrary or hand-edited identities.

## Decision: Make `deepCopy()` mean user-visible duplication

**Decision**: Programmatic copy should preserve content semantics without relying on XML save/reload, and the exposed `deepCopy()` behavior should mint fresh local identities for user-visible duplicate/paste flows.

**Rationale**: Java Blue uses programmatic copy constructors for BSB aggregates, but the reviewed application flows do not require a separate preserved-ID clone for independently editable duplicates. The TypeScript port still avoids XML round-trip copying for ordinary BSB aggregate substructures, but it no longer exposes a preserved-ID clone policy as a distinct API.

**Alternatives considered**:

- Keep a separate preserved-ID structural clone API. Rejected because no concrete Java Blue or Electron product flow requires it, and tests were the only active consumer.
- Keep XML round-trip copying and add post-processing. Rejected because XML serialization should be persistence behavior, not copy semantics.
- Only fix the counter collision. Rejected because whole-object duplication would still share widget uniqueIds and parameter uniqueIds.

## Decision: Treat BSB widget uniqueIds and automation parameter uniqueIds as clone-sensitive

**Decision**: Rekey BSB widget uniqueIds and automation parameter uniqueIds during user-visible duplication of BSB instruments, embedded Sound BSB data, and copy-buffer paste flows that expose independent objects.

**Rationale**: Widget uniqueIds are edit handles for update/move/resize/group/remove operations. Automation parameter uniqueIds are parameter identities for automation data. Sharing either between original and duplicate creates hidden coupling and ambiguous patch targets.

**Alternatives considered**:

- Rekey widget uniqueIds only. Rejected because automation parameter identities can still collide between duplicates.
- Rekey parameter ids only when names change. Rejected because duplicate object identity should not depend on visible objectName changes.
- Treat objectName as identity. Rejected because objectName is musical/user-facing content and should be preserved across duplicate operations.

## Decision: Rekey preset and dropdown item uniqueIds during duplication

**Decision**: Preset uniqueIds and dropdown item uniqueIds remain local lookup keys that are preserved during ordinary load/save, but user-visible duplication regenerates them and rewrites dependent references.

**Rationale**: Preset values and dropdown selections use these ids as local lookup values inside one BSB data set. Since the duplicate path now removes preserved-ID cloning entirely, these local lookup identities should be fresh in the duplicate as long as `currentPresetUniqueId` and dropdown preset values such as `id:<uniqueId>` are rewritten consistently.

**Alternatives considered**:

- Preserve preset and dropdown ids during duplication. Rejected because it keeps a special preserved-ID clone carveout that is not needed once reference rewriting is available.
- Ignore preset/dropdown ids in tests. Rejected because the preservation policy should be explicit and covered.

## Decision: Make Sound duplication parse and reserialize embedded BSB only at the boundary

**Decision**: Store a structured embedded `BlueSynthBuilder` inside `Sound`, while preserving embedded BSB XML as the save/API boundary. User-visible Sound duplication deep-copies the structured BSB, applies the duplicate policy, and serializes only when XML is requested.

**Rationale**: The copy/paste investigation showed the XML-text shortcut was the source of mismatched behavior. Moving `Sound` to structured BSB state matches Java Blue more closely, removes `_bsbInstrumentText`, makes duplication clone-safe, and still preserves Java-compatible save output.

**Alternatives considered**:

- Keep Sound as raw BSB XML text and parse only during duplication. Rejected because it preserved TS-only storage behavior and kept copy/paste/editor paths dependent on text adapters.
- Keep copying Sound BSB XML verbatim. Rejected because it preserves widget uniqueIds and automation parameter ids across duplicates.

## Decision: Add tests at the data layer first, then app integration only where snapshot behavior could regress

**Decision**: Primary regression coverage belongs in `packages/blue-data`; renderer/store tests are limited to existing BSB patch and paste surfaces if data-layer UUID IDs affect assumptions.

**Rationale**: Identity generation, load normalization, and duplicate rekeying are data-model behavior. Renderer snapshots should not become the source of truth for canonical identity policy.

**Alternatives considered**:

- Test only through the renderer. Rejected because it would miss model-level duplication paths such as `CopyBuffer` and `Sound.deepCopy()`.
- Test only helper functions. Rejected because end-to-end load/create/duplicate/save flows are the regression risk.
