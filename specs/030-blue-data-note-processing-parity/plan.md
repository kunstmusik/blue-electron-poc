# Implementation Plan: Blue Data Note Parsing and Note Processor Parity

**Branch**: `030-blue-data-note-processing-parity` | **Date**: 2026-04-29 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/spec.md`

## Summary

Bring score text parsing, note timing helpers, note processor XML, named chains, and processor execution semantics into line with Java Blue. This slice targets the parser and processor differences that currently produce incorrect musical output or destroy processor data on round-trip save.

## Technical Context

**Language/Version**: TypeScript 5.8.x, strict mode  
**Primary Dependencies**: existing `@blue/data` note, score utility, and note processor classes; Vitest; pure XML parsing helpers  
**Storage**: In-memory note lists and `.blue` XML round-trip through `@blue/data`  
**Testing**: Vitest unit tests plus Java-vs-TypeScript parser and processor fixtures  
**Target Platform**: Browser-safe and Node-safe `@blue/data` library code  
**Project Type**: Shared data-model library  
**Performance Goals**: Parser and processor execution remain fast for typical score lengths; parity work must not introduce pathological repeated parsing  
**Constraints**: No UI or Electron dependencies; Java musical behavior is the source of truth; unsupported processor execution may be deferred only if XML preservation remains lossless  
**Scale/Scope**: parser semantics, note timing helpers, note processor XML, named chain preservation, and the incompatible processors identified in the report

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. The slice remains entirely inside `@blue/data`.
- **Backwards-Compatible Serialization**: PASS only if processor XML and named chains round-trip correctly.
- **JVM Dependencies Preserved, Not Replaced**: PASS with caution. Unsupported processor execution may be deferred only if XML is preserved.
- **Engine as External Process**: PASS. Not in scope.
- **Test-First for Serialization**: PASS. Parser and processor fixture tests are mandatory.
- **Research Integration**: PASS. Java parser and processor classes are documented as source anchors.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── note-processing-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── utilities/
│   └── score.ts
├── sound-objects/
│   ├── note.ts
│   └── generic-score.ts
├── note-processors/
│   └── [processor implementations and XML helpers]
└── [tests added near parser and processor models]
```

**Structure Decision**: Keep the slice in `@blue/data`, centered on parser and processor behavior that downstream score and render features depend on.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/research.md](/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/contracts/note-processing-contract.md](/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/contracts/note-processing-contract.md)
- [/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. No renderer or Electron dependency is introduced.
- **Backwards-Compatible Serialization**: PASS. The plan explicitly restores Java-compatible note processor XML and named-chain preservation.
- **JVM Dependencies Preserved, Not Replaced**: PASS with explicit preservation fallback where execution support is deferred.
- **Engine as External Process**: PASS. Not in scope.
- **Test-First for Serialization**: PASS. Java-vs-TypeScript parser and processor fixtures are required.
- **Research Integration**: PASS. Java note parser and processor classes are referenced directly in research.
