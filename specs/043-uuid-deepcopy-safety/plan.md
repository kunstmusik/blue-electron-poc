# Implementation Plan: UUID And Deep Copy Safety

**Branch**: `043-uuid-deepcopy-safety` | **Date**: 2026-05-18 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/spec.md](/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/spec.md`

## Summary

Close the BSB identity and clone-safety gap by replacing counter/random identity generation with a shared browser-safe UUID path, normalizing BSB widget uniqueIds on load so new widgets cannot collide with loaded uniqueIds, introducing duplicate-safe programmatic copying for BSB aggregates, and routing whole-object duplication for `BlueSynthBuilder` and `Sound` through clone-safe identity regeneration. Ordinary load/save must preserve explicit project identities, while user-visible duplication must regenerate BSB widget uniqueIds, automation parameter uniqueIds, preset uniqueIds, and dropdown item uniqueIds without losing musical content.

## Technical Context

**Language/Version**: TypeScript 5.8.x, strict mode  
**Primary Dependencies**: `@blue/data` BSB models, automation `Parameter`/`ParameterList`, `Sound`, `CopyBuffer`, pure XML helpers, Vitest 4.x  
**Storage**: In-memory `@blue/data` model plus `.blue` XML round-trip through `BlueData.loadFromString()` and `saveToString()`; `Sound` now owns a structured embedded `BlueSynthBuilder` and preserves Java-compatible embedded BSB XML on save  
**Testing**: Vitest unit and integration coverage under `packages/blue-data`, plus focused renderer/shared tests only if snapshot patch isolation requires them  
**Target Platform**: Browser-safe and Node-safe `@blue/data`; Electron renderer consumes the resulting IDs but does not own canonical identity policy  
**Project Type**: Shared data-model library feature with limited app integration verification  
**Performance Goals**: BSB identity normalization and rekeying should be linear in widget/parameter count and safe for large BSB interfaces without XML round-trip copying on normal duplicate paths  
**Constraints**: No Node.js built-ins in `@blue/data`; no `require()` or dynamic `import()` in `@blue/data`; preserve Java-compatible `.blue` XML; preserve explicit uniqueIds during ordinary load/save; use Java Blue copy-constructor behavior as the parity anchor where TypeScript copy behavior is ambiguous  
**Scale/Scope**: BSB widget uniqueIds, automation parameter uniqueIds, BSB aggregate duplicate copying, Sound embedded BSB duplication, copy-buffer/duplicate integration points, and regression coverage for load/create, duplicate, and load/save preservation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. Canonical identity generation and duplication policy live in `@blue/data`; renderer code only consumes snapshots or delegates to data-layer behavior.
- **Backwards-Compatible Serialization**: PASS. Ordinary load/save must preserve explicit BSB widget uniqueIds, automation parameter uniqueIds, preset uniqueIds, and dropdown item uniqueIds; only legacy missing or duplicate loaded widget uniqueIds receive repair before editing.
- **JVM Dependencies Preserved, Not Replaced**: PASS. No JVM-dependent sound object behavior is changed.
- **Engine as External Process**: PASS. No engine protocol or rendering process behavior changes.
- **Test-First for Serialization**: PASS. Tasks require failing/passing coverage for ordinary load/save identity preservation, legacy missing-id repair, duplicate-id repair, and clone-safe duplication.
- **Research Integration**: PASS. Java Blue `BlueSynthBuilder`, `BSBGraphicInterface`, `BSBGroup`, `PresetGroup`, and `ParameterList` copy behavior remain the source anchors.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/
├── checklists/
│   └── requirements.md
├── contracts/
│   └── identity-copy-contract.md
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── utilities/
│   └── uuid.ts                         # new shared browser-safe UUID helper
├── automation/
│   ├── parameter.ts
│   └── parameter-list.ts
├── instruments/
│   ├── blue-synth-builder.ts
│   └── blue-synth-builder/
│       ├── bsb-graphic-interface.ts
│       ├── bsb-group.ts
│       ├── bsb-widget.ts
│       ├── preset.ts
│       ├── preset-group.ts
│       └── bsb-identity.ts             # new BSB traversal, normalization, and rekey helpers
├── sound-objects/
│   └── sound.ts
├── copy-buffer.ts
└── [tests near touched model files]
```

```text
/Users/stevenyi/work/blue-electron/packages/blue-app/src/
├── renderer/stores/project-store.ts
└── renderer/tests/
```

**Structure Decision**: Keep all canonical identity generation and duplicate rekeying in `@blue/data`. Use renderer/store tests only to verify that existing BSB patching and paste surfaces remain isolated after data-layer IDs become UUID-backed.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/research.md](/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/data-model.md](/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/contracts/identity-copy-contract.md](/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/contracts/identity-copy-contract.md)
- [/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/quickstart.md](/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. The design keeps reusable ID and clone policy in `@blue/data`; renderer snapshots remain consumers.
- **Backwards-Compatible Serialization**: PASS. The data model and contract require preservation for ordinary load/save and bounded repair only for missing or duplicate widget uniqueIds.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Sound duplication changes only embedded BSB identity, not JVM-backed score object semantics.
- **Engine as External Process**: PASS. Not in scope.
- **Test-First for Serialization**: PASS. `tasks.md` puts load/save and duplicate regression tests before implementation tasks in each story.
- **Research Integration**: PASS. Research decisions document the Java copy-constructor parity anchor and the chosen deep-copy/duplicate split.

## Delivery Note

This feature is closed. Implementation completed the P1 load/create identity regression, the data-layer UUID utility, duplicate rekeying for `BlueSynthBuilder` and `Sound`, the structured `Sound` BSB storage cleanup, and the `uniqueId` attribute migration for BSB widget identity. Keep `UUID_AND_DEEPCOPY.md` as historical handoff context only; `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/identity-copy-contract.md`, `quickstart.md`, and `tasks.md` are now the source of truth for implementation.
