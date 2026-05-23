# Implementation Plan: Note Processor Parity

**Branch**: `048-note-processor-parity` | **Date**: 2026-05-23 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/spec.md`

## Summary

Complete Java Blue note-processor parity for the non-Python processor catalog, chain serialization, scoped score application, and editing workflows. PythonProcessor/Jython execution and full editing are deferred to a later feature; this slice preserves PythonProcessor XML and labels it clearly as deferred. The technical approach is to centralize processor catalog metadata in `@blue/data`, make renderer chain snapshots reifiable back to canonical chains, add a reusable chain editor for object/layer/group/root targets, and close the root-score application gap.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: `@blue/data` note processors and score model, Electron main/preload IPC bridge, Zustand 5.x project store, React renderer components, Radix Context Menu, Vitest 4.x  
**Storage**: Main-process in-memory `BlueData` remains canonical; `.blue` XML remains canonical persistence; renderer edits are transient snapshots and explicit project document patches  
**Testing**: Vitest unit, shared-contract, main-process, and renderer tests; final validation with package-level test runs  
**Target Platform**: Electron desktop app plus browser-safe and Node-safe `@blue/data` library code  
**Project Type**: Monorepo desktop application with shared data-model package  
**Performance Goals**: Chain editing should update selected targets without full project reloads; processor execution must remain linear over notes and processors for typical score sizes  
**Constraints**: Java Blue is the parity source; no Node.js built-ins, `require()`, or dynamic `import()` in `@blue/data`; PythonProcessor/Jython runtime execution is explicitly out of scope; unsupported/deferred processors must preserve XML  
**Scale/Scope**: 16 in-scope processor types, preservation-only PythonProcessor handling, named chains, score-object chains, sound-object layer chains, layer-group chains, root score chains, renderer chain editor, and full processing/serialization/UI test coverage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. Processor semantics and XML reification remain in `@blue/data`; renderer owns only snapshots and UI state.
- **Backwards-Compatible Serialization**: PASS. Chain edits mutate canonical `BlueData` and save through existing Java-compatible XML paths.
- **JVM Dependencies Preserved, Not Replaced**: PASS. PythonProcessor/Jython behavior is deferred and preserved instead of being partially reimplemented.
- **Engine as External Process**: PASS. This feature does not alter engine IPC.
- **Test-First for Serialization**: PASS. Processor and chain XML tests are required before implementation tasks.
- **Research Integration**: PASS. Java Blue source anchors and the local audit drive the plan.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/
├── spec.md
├── audit.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── note-processor-chain-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── note-processors/
│   ├── note-processor-chain.ts
│   ├── note-processor-chain-map.ts
│   ├── unsupported-processor.ts
│   ├── [processor implementations]
│   └── [new catalog/snapshot/reification helpers]
├── score/
│   └── score.ts
├── sound-objects/
│   └── [chain-owning sound objects and SoundLayer]
└── [processor parity tests]

/Users/stevenyi/work/blue-electron/packages/blue-app/src/
├── shared/
│   └── project-editor.ts
├── main/
│   └── [project document patch tests]
├── preload/
│   └── preload.ts
└── renderer/
    ├── components/workbench/panels/
    │   ├── ScorePanel.tsx
    │   └── score-object/
    │       ├── ScoreObjectPropertiesForm.tsx
    │       └── note-processors/[new chain editor components]
    ├── stores/project-store.ts
    └── tests/[renderer chain editor tests]
```

**Structure Decision**: Keep processor catalog, serialization, and render semantics in `@blue/data`; keep target resolution and canonical project mutation in shared app contracts; keep interaction UI in renderer components.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/research.md](/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/contracts/note-processor-chain-contract.md](/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/contracts/note-processor-chain-contract.md)
- [/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/048-note-processor-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Design keeps processor behavior and XML in `@blue/data` and UI state in the renderer.
- **Backwards-Compatible Serialization**: PASS. Contracts require Java-compatible chain XML plus deferred PythonProcessor preservation.
- **JVM Dependencies Preserved, Not Replaced**: PASS. PythonProcessor is preservation-only in this slice.
- **Engine as External Process**: PASS. No engine changes are introduced.
- **Test-First for Serialization**: PASS. Tasks require XML tests before processor and UI implementation.
- **Research Integration**: PASS. Research and audit references are explicit inputs to tasks.
