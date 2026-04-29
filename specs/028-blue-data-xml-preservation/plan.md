# Implementation Plan: Blue Data XML Preservation and Root Compatibility

**Branch**: `028-blue-data-xml-preservation` | **Date**: 2026-04-29 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/spec.md](/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/spec.md`

## Summary

Make root `BlueData` load, save, copy, and legacy migration behavior safe before deeper parity work proceeds. This slice restores Java-compatible root section handling, preservation-only sections, project property defaults and aliases, mixer absence semantics, and complete `deepCopy()` behavior for the top-level project document.

## Technical Context

**Language/Version**: TypeScript 5.8.x, strict mode  
**Primary Dependencies**: `@rgrove/parse-xml`, existing `Element` wrapper utilities, Vitest, pure `@blue/data` classes  
**Storage**: In-memory project model plus `.blue` XML round-trip through `BlueData.loadFromString()` and `saveToString()`  
**Testing**: Vitest unit and fixture-based round-trip tests under `packages/blue-data`  
**Target Platform**: Browser-safe and Node-safe `@blue/data` library code  
**Project Type**: Shared data-model library  
**Performance Goals**: Root document load/save remains fast for normal project sizes; no additional pass should make project load noticeably slower during editor startup  
**Constraints**: No UI or Node dependencies in `@blue/data`; Java XML compatibility is the primary gate; preserve unknown/deferred root data instead of dropping it  
**Scale/Scope**: `BlueData`, root helper models, preservation stubs, project properties, copy behavior, and root migration coverage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. This slice is entirely inside `@blue/data`.
- **Backwards-Compatible Serialization**: PASS only if load/save round-trip coverage is added for all touched root sections.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Preservation-only root sections may remain non-executable as long as XML survives.
- **Engine as External Process**: PASS. No engine protocol changes are required.
- **Test-First for Serialization**: PASS. Fixture-based root XML tests are mandatory.
- **Research Integration**: PASS. Java `BlueData` and related root classes are the reference anchors.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── root-xml-compatibility.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── blue-data.ts
├── project-properties.ts
├── scratch-pad-data.ts
├── markers-list.ts
├── midi/
│   └── midi-input-processor.ts
├── mixer/
│   └── mixer.ts
└── [tests added near touched root models]
```

**Structure Decision**: Keep the entire slice inside `@blue/data`, focused on root XML semantics and preservation behavior before any renderer-facing work.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/research.md](/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/data-model.md](/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/contracts/root-xml-compatibility.md](/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/contracts/root-xml-compatibility.md)
- [/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/quickstart.md](/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. No renderer or Electron dependency is introduced.
- **Backwards-Compatible Serialization**: PASS. The design is explicitly about root XML preservation and Java-compatible save behavior.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Deferred runtime behavior is allowed only where XML preservation remains lossless.
- **Engine as External Process**: PASS. Not in scope.
- **Test-First for Serialization**: PASS. Root fixture tests are a required deliverable.
- **Research Integration**: PASS. Java Blue root source anchors and compatibility cases are documented in research.
