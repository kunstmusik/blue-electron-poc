# Implementation Plan: Blue Data Runtime Model Parity for Instruments, BSB, Mixer, Automation, and Time

**Branch**: `032-blue-data-runtime-model-parity` | **Date**: 2026-04-29 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/spec.md`

## Summary

Close the remaining runtime-oriented `@blue/data` compatibility gaps after XML, score, parser, and render-pipeline work. This slice covers BSB generation and defaults, remaining instrument-model behavior, mixer XML and dependency semantics, automation line behavior, and time-system defaults and conversions.

## Technical Context

**Language/Version**: TypeScript 5.8.x, strict mode  
**Primary Dependencies**: existing `@blue/data` instrument, mixer, automation, and time classes; Vitest; pure XML/model helpers  
**Storage**: In-memory project model, generated orchestra fragments, and `.blue` XML round-trip through `@blue/data`  
**Testing**: Vitest unit and fixture-based round-trip/behavior tests under `packages/blue-data`  
**Target Platform**: Browser-safe and Node-safe `@blue/data` library code  
**Project Type**: Shared data-model library  
**Performance Goals**: Runtime-model calculations and generation remain deterministic and responsive for typical project sizes  
**Constraints**: No renderer or Electron dependency; constitution rules for JVM-dependent models still apply; data loss is never acceptable even where execution remains deferred  
**Scale/Scope**: instruments, BSB generation, mixer/effect/channel/send behavior, automation line semantics, and time/tempo conversion models

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. The slice stays inside `@blue/data`.
- **Backwards-Compatible Serialization**: PASS. XML and generated-text behavior are explicit goals of the slice.
- **JVM Dependencies Preserved, Not Replaced**: PASS with required preservation fallback for deferred execution models.
- **Engine as External Process**: PASS. No engine-protocol change is required.
- **Test-First for Serialization**: PASS. Fixture-based round-trip and behavior tests are mandatory.
- **Research Integration**: PASS. Java orchestra, mixer, automation, and time classes are documented as source anchors.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── runtime-model-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── instruments/
│   └── [BSB and instrument models]
├── mixer/
│   └── [mixer, effect, channel, send models]
├── automation/
│   └── [parameter and line models]
├── time/
│   └── [tempo-map, time-context, conversions, time-state]
└── [tests added near touched runtime models]
```

**Structure Decision**: Keep the slice in `@blue/data`, focused on the remaining runtime-oriented compatibility models that feed later editor and render behavior.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/research.md](/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/contracts/runtime-model-contract.md](/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/contracts/runtime-model-contract.md)
- [/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. No renderer or Electron dependency is introduced.
- **Backwards-Compatible Serialization**: PASS. XML and generation behavior are explicit deliverables for this slice.
- **JVM Dependencies Preserved, Not Replaced**: PASS. The design keeps preservation-first behavior for execution-sensitive models.
- **Engine as External Process**: PASS. Not in scope.
- **Test-First for Serialization**: PASS. BSB, mixer, automation, and time fixtures are required deliverables.
- **Research Integration**: PASS. Java runtime-oriented data models are referenced directly in research.

## Delivery Note

Implementation for Spec 032 has been completed on branch `032-blue-data-runtime-model-parity`. The final delivered slice includes the BSB parameter-list and replacement fixes, mixer XML and dependency parity updates, tempo/time semantic fixes, and the associated runtime-model regression coverage.
