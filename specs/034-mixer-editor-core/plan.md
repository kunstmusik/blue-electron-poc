# Implementation Plan: Mixer Editor Core

**Branch**: `034-mixer-editor-core` | **Date**: 2026-05-01 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/spec.md](/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/spec.md`

## Summary

Deliver the first usable mixer app layer on top of the existing `@blue/data` mixer models. Extend the project snapshot and patch bridge with typed mixer state, replace the Mixer placeholder with a real workbench panel that stays synchronized with arrangement changes, load the user's effects library from `~/.blue` into a mutable session copy without saving, and add non-modal effect editor windows that reuse the current BSB, UDO, and CodeMirror editor surfaces.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: existing `@blue/data` mixer classes (`Mixer`, `Channel`, `EffectsChain`, `Effect`, `Send`, `EffectManager`), Electron `BrowserWindow` and menu IPC, Zustand 5.x project/workbench stores, Dockview 5.2.0 workbench shell, existing BSB and UDO editor surfaces, CodeMirror 6 editor stack, Vitest 4.x  
**Storage**: main-process in-memory `BlueData` remains canonical; renderer uses serializable mixer snapshots and explicit patches; effects library uses an in-memory session copy loaded from `~/.blue/effectsLibrary.xml`; no disk writes to the library are allowed in this slice  
**Testing**: Vitest main-process and renderer tests, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, `pnpm --filter @blue/data test` if model gaps are discovered, `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks`, `git diff --check`  
**Target Platform**: Electron desktop on macOS first, preserving the current workbench architecture  
**Project Type**: desktop application feature spanning shared snapshot code, Electron main/preload, and React renderer panels  
**Performance Goals**: Mixer panel updates should remain immediate when arrangement or chain state changes; effect-editor reuse should avoid duplicate window churn; effects library loading should feel fast enough for normal Blue library sizes  
**Constraints**: preserve Java `.blue` compatibility, keep `@blue/data` UI-free and Node-free, avoid introducing a mixer-only state silo, do not save to `~/.blue`, and explicitly defer SQLite or other durable library-storage redesigns  
**Scale/Scope**: one core mixer workbench panel, one effects-library session service plus modal management surface, one non-modal effect editor window flow, one snapshot/patch extension for mixer data, and the required tests for synchronization and window behavior

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. The slice keeps project and library state in shared/main-process data structures and has the renderer consume serializable snapshots plus explicit patch intents.
- **Backwards-Compatible Serialization**: PASS. The canonical project document stays in `BlueData`, existing mixer XML is reused, and unsupported effects-library content must be preserved in-memory even where editing remains partial.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue mixer and library classes are the parity source; the plan does not replace JVM-dependent runtime behavior with unrelated abstractions.
- **Engine as External Process**: PASS. The scope is editor- and document-focused; playback architecture remains unchanged.
- **Test-First for Serialization**: PASS. Mixer snapshot/patch and library-loading behavior are explicitly covered before full UI parity is considered complete.
- **Research Integration**: PASS. Java mixer, library, and effect-editor classes are direct inputs to this plan.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── mixer-editor-surfaces.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/
├── mixer.ts
├── mixer-node.ts
├── channel.ts
├── channel-list.ts
├── effects-chain.ts
├── effect.ts
├── effect-manager.ts
└── send.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
└── project-editor.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/
├── main.ts
├── settings-window.ts
└── [new] mixer-effects-library.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/
└── preload.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/
├── stores/
│   ├── project-store.ts
│   └── workbench-store.ts
├── components/workbench/
│   └── DockviewPanel.tsx
├── components/workbench/panels/
│   ├── [new] MixerPanel.tsx
│   ├── [new] EffectLibraryModal.tsx
│   ├── [new] effect-editor/
│   └── [new] mixer/
├── components/workbench/panels/orchestra/
│   ├── BlueSynthBuilderEditor.tsx
│   └── bsb/
│       ├── BSBInterfaceEditor.tsx
│       └── BSBUDOPanel.tsx
├── components/workbench/panels/udo/
│   └── UdoEditor.tsx
└── tests/
    └── [new mixer panel, library, and effect-editor tests]
```

**Structure Decision**: Keep canonical mixer state and library session ownership in shared and main-process code; keep workbench routing and optimistic snapshot updates in existing renderer stores; reuse the current BSB and UDO editor surfaces instead of introducing a separate mixer-editor technology stack.

## Complexity Tracking

No constitution exceptions are required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/research.md](/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/data-model.md](/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/contracts/mixer-editor-surfaces.md](/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/contracts/mixer-editor-surfaces.md)
- [/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/quickstart.md](/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Mixer, library, and effect-editor state are carried through shared snapshots and main-process session models instead of direct renderer mutation of class instances.
- **Backwards-Compatible Serialization**: PASS. Project changes still round-trip through canonical `BlueData`, and the effects-library session is intentionally non-persistent for safety.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue remains the parity source for strip association, library behavior, and window-management decisions.
- **Engine as External Process**: PASS. No playback or engine-protocol changes are required for this slice.
- **Test-First for Serialization**: PASS. Snapshot, library loading, and window-lifecycle behavior all require coverage before the slice is considered ready.
- **Research Integration**: PASS. The design is explicitly anchored to current TypeScript seams plus the Java mixer, effects library, and effect-editor implementations.