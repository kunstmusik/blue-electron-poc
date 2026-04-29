# Implementation Plan: Blue Data CSD Render Pipeline Parity

**Branch**: `031-blue-data-csd-render-parity` | **Date**: 2026-04-29 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/spec.md`

## Summary

Replace the current simplified `BlueData.toCSD()` path with a Java-compatible render pipeline built around copied project state, complete `CompileData`, UDO merge and rename behavior, global score/orchestra preprocessing, render-boundary handling, and automation-aware score generation.

## Technical Context

**Language/Version**: TypeScript 5.8.x, strict mode  
**Primary Dependencies**: existing `@blue/data` render classes, arrangement models, mixer models, Vitest, pure XML/model helpers  
**Storage**: In-memory project model and generated CSD text from `@blue/data`  
**Testing**: Vitest unit tests plus Java-vs-TypeScript CSD fixture comparisons  
**Target Platform**: Browser-safe and Node-safe `@blue/data` library code  
**Project Type**: Shared data-model library  
**Performance Goals**: CSD generation remains responsive for typical project sizes while preserving deterministic compile-time ordering and numbering  
**Constraints**: No renderer or Electron dependency; Java render behavior is the source of truth; formatting-only differences are acceptable only when semantic output matches  
**Scale/Scope**: `BlueData.toCSD()`, `CompileData`, arrangement/global score preprocessing, automation output, scheduling behavior, and representative mixer/audio integration points

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. The slice remains inside `@blue/data`.
- **Backwards-Compatible Serialization**: PASS with dependency. This slice assumes earlier specs make inputs structurally safe.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Render generation concerns XML/model data and generated text, not UI runtime substitution.
- **Engine as External Process**: PASS. Generated CSD remains a data-layer responsibility.
- **Test-First for Serialization**: PASS. Fixture-based output comparisons are mandatory.
- **Research Integration**: PASS. Java `CSDRender` and `CompileData` are documented as source anchors.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── csd-render-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── blue-data.ts
├── compile-data.ts
├── arrangement/
│   └── [render helpers and score/orchestra generation]
├── mixer/
│   └── [render integration points]
└── [tests added near touched render models]
```

**Structure Decision**: Keep the slice in `@blue/data`, centered on render-generation pipeline behavior and compile-time context rather than UI or engine-process concerns.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/research.md](/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/contracts/csd-render-contract.md](/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/contracts/csd-render-contract.md)
- [/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/031-blue-data-csd-render-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. No renderer or Electron dependency is introduced.
- **Backwards-Compatible Serialization**: PASS. The plan preserves render-generation compatibility by depending on earlier structural XML fixes and restoring Java render semantics.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Render output remains data-layer work.
- **Engine as External Process**: PASS. Engine protocol is out of scope.
- **Test-First for Serialization**: PASS. Java-vs-TypeScript CSD fixture comparisons are required.
- **Research Integration**: PASS. Java render pipeline sources are referenced directly in research.
