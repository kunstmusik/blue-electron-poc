# Implementation Plan: Blue Data Score, Library, and Sound Object Model Parity

**Branch**: `029-blue-data-score-library-parity` | **Date**: 2026-04-29 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/spec.md`

## Summary

Restore Java-compatible score graph structure and library-backed model behavior. This slice covers `SoundObjectLibrary`, `InstrumentLibrary`, `Score`, `PolyObject`, `SoundLayer`, common sound object XML, `GenericScore` score text compatibility, and representative pattern/audio layer load-save behavior.

## Technical Context

**Language/Version**: TypeScript 5.8.x, strict mode  
**Primary Dependencies**: existing `@blue/data` score, sound object, library, and XML utility classes; Vitest; pure XML parsing helpers  
**Storage**: In-memory score graph and `.blue` XML round-trip through `@blue/data`  
**Testing**: Vitest unit and fixture-based round-trip tests under `packages/blue-data`  
**Target Platform**: Browser-safe and Node-safe `@blue/data` library code  
**Project Type**: Shared data-model library  
**Performance Goals**: Score graph load/save remains responsive for normal project sizes; library resolution should not introduce pathological rescans  
**Constraints**: No UI or Electron dependencies; Java XML compatibility is the gate; later render semantics may build on this model but do not replace the XML contract work  
**Scale/Scope**: score graph structures, common sound object XML, library-backed references, and representative audio/pattern layer models

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. The slice stays entirely in `@blue/data`.
- **Backwards-Compatible Serialization**: PASS only if score, library, and sound object round-trip coverage is expanded.
- **JVM Dependencies Preserved, Not Replaced**: PASS. This slice concerns structural preservation, not execution of JVM-backed sound objects.
- **Engine as External Process**: PASS. Not in scope.
- **Test-First for Serialization**: PASS. Library and score XML tests are mandatory.
- **Research Integration**: PASS. Java score, library, and score-layer modules are recorded as source anchors.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── score-library-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── instruments/
│   └── instrument-library.ts
├── score/
│   ├── score.ts
│   ├── poly-object.ts
│   └── sound-layer.ts
├── sound-objects/
│   ├── sound-object-library.ts
│   ├── generic-score.ts
│   ├── instance.ts
│   └── [common sound object XML helpers]
├── score-layers/
│   └── [pattern and audio layer models]
└── [tests added near touched score models]
```

**Structure Decision**: Keep all work inside `@blue/data`, focused on score graph structure and XML interoperability rather than UI/editor concerns.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/research.md](/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/contracts/score-library-contract.md](/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/contracts/score-library-contract.md)
- [/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. The design remains entirely inside `@blue/data`.
- **Backwards-Compatible Serialization**: PASS. The plan explicitly restores Java-compatible sound object, score, and library XML behavior.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Execution behavior for JVM-backed objects is deferred where needed, but structural preservation is mandatory.
- **Engine as External Process**: PASS. Not in scope.
- **Test-First for Serialization**: PASS. Fixture tests for library and score XML are required deliverables.
- **Research Integration**: PASS. Java `blue-core`, audio-layer, and pattern-layer modules are referenced directly in research.
