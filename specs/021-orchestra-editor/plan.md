# Implementation Plan: Orchestra Editor Implementation

**Branch**: `021-orchestra-editor` | **Date**: 2026-04-23 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/spec.md](/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/spec.md`

## Summary

Replace the Orchestra placeholder with a Java Blue-inspired editor: an arrangement table and temporary library area on the left, selected instrument editor/comments tabs on the right, and type-specific editors for GenericInstrument, JavaScriptInstrument, BlueX7, and BlueSynthBuilder. The plan keeps the main process `BlueData` document canonical, extends renderer snapshots/patches for orchestra data, defers the program-wide orchestra library and Python execution/editor parity, and selects TanStack Table for the arrangement table because the UI needs controlled selection, editable cells, row actions, and future table reuse while preserving custom styling.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data`
**Primary Dependencies**: `@blue/data`, Zustand 5.x project store, Dockview 5.2.0 workbench panel registry, CodeMirror 6 editor surface from specs 018/019, Radix Context Menu, proposed `@tanstack/react-table` for arrangement table behavior, existing `@tanstack/react-virtual` if large table virtualization becomes necessary
**Storage**: Main-process in-memory `BlueData` remains canonical; renderer consumes serializable project/orchestra snapshots and sends explicit patch intents through the existing project document IPC bridge; `.blue` XML remains the persistence format
**Testing**: Vitest unit/renderer tests, `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, XML round-trip fixtures, `git diff --check`
**Target Platform**: Electron desktop renderer on macOS first, with cross-platform table keyboard/focus behavior
**Project Type**: Desktop application renderer + shared data-model feature
**Performance Goals**: Orchestra tab should open interactively for typical project arrangements; arrangement row selection/editor routing should update without full app reloads; BSB editor should avoid expensive full-interface regeneration on every keystroke where practical
**Constraints**: Preserve Java Blue `.blue` compatibility, keep `blue-data` UI-free and Node-free, defer program-wide orchestra library, preserve PythonInstrument data without implementing Python runtime/editor behavior, keep BSB implementation data-first despite UI complexity
**Scale/Scope**: One workbench panel (`OrchestraTopComponent`), arrangement table, temporary library placeholder, editor/comments tabs, four active instrument editors, one deferred Python dummy panel, model/IPC expansion to support these surfaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. Instrument loading, XML serialization, BSB replacement/generation, and arrangement mutations belong in `@blue/data` or shared project patch helpers; React components render snapshots and dispatch patch intents.
- **Backwards-Compatible Serialization**: PASS. Missing instrument types and comments must be ported with round-trip tests before UI work depends on them.
- **JVM Dependencies Preserved, Not Replaced**: PASS. PythonInstrument execution/editor parity is deferred and data-preserving; no Jython replacement is introduced.
- **Engine as External Process**: PASS. Playback engine integration is not changed.
- **Test-First for Serialization**: PASS. New/expanded instrument data classes require XML round-trip tests before renderer editing is considered complete.
- **Research Integration**: PASS. Java Orchestra sources and TanStack Table evaluation are captured in `research.md`.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── orchestra-editor-surface.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── arrangement.ts
├── instruments/
│   ├── instrument.ts
│   ├── generic-instrument.ts
│   ├── javascript-instrument.ts
│   ├── python-instrument.ts
│   ├── blue-x7.ts
│   ├── blue-synth-builder.ts
│   ├── instrument-assignment.ts
│   ├── instrument-registry.ts
│   └── blue-synth-builder/
│       └── [existing BSB widget model files expanded as needed]
└── tests/
    └── [instrument and arrangement XML round-trip tests]

/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
└── project-editor.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/
└── main.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/
└── preload.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/
└── project-store.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/
├── DockviewPanel.tsx
└── panels/
    ├── OrchestraPanel.tsx
    ├── orchestra/
    │   ├── ArrangementPanel.tsx
    │   ├── TemporaryInstrumentLibraryPanel.tsx
    │   ├── InstrumentEditorPanel.tsx
    │   ├── InstrumentCommentsPanel.tsx
    │   ├── GenericInstrumentEditor.tsx
    │   ├── JavaScriptInstrumentEditor.tsx
    │   ├── BlueX7Editor.tsx
    │   ├── BlueSynthBuilderEditor.tsx
    │   ├── PythonInstrumentDummyPanel.tsx
    │   ├── bsb/
    │   │   └── [BSB interface/code/widget editor components]
    │   └── arrangement-table/
    │       └── [TanStack Table adapter/components]
    └── editors/
        └── [reuse existing CodeMirror Csound editor helpers]

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
├── orchestra-panel.test.tsx
├── orchestra-arrangement.test.tsx
├── orchestra-instrument-editors.test.tsx
└── bsb-editor.test.tsx
```

**Structure Decision**: Keep data compatibility and generation behavior in `@blue/data`; keep renderer-only table, tab, and editor composition under a new `panels/orchestra/` boundary; extend the existing `project-editor.ts` IPC contract rather than introducing a parallel orchestra-specific IPC API unless implementation proves patch payloads need isolation.

## Complexity Tracking

No constitution violations are required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/research.md](/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/data-model.md](/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/contracts/orchestra-editor-surface.md](/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/contracts/orchestra-editor-surface.md)
- [/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/quickstart.md](/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. The design separates serializable snapshots/patches from React presentation and keeps instrument semantics in data classes.
- **Backwards-Compatible Serialization**: PASS. Data-model design requires comments, missing instrument classes, Python preservation, BSB widgets, and unknown instrument handling to round-trip before UI completion.
- **JVM Dependencies Preserved, Not Replaced**: PASS. PythonInstrument is preserved and explicitly dummy-rendered without native execution.
- **Engine as External Process**: PASS. No engine protocol changes are planned.
- **Test-First for Serialization**: PASS. The quickstart and tasks should require `@blue/data` XML tests ahead of renderer integration.
- **Research Integration**: PASS. Research records Java file anchors, TanStack Table decision, and deferrals.
