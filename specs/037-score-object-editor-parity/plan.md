# Implementation Plan: Score Object Editor Parity

**Branch**: `037-score-object-editor-parity` | **Date**: 2026-05-04 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/spec.md`

## Summary

Deliver the two auxiliary score editing surfaces that sit beside the score shell: a real `SoundObjectPropertiesTopComponent` with Java Blue-style shared ScoreObject fields, and a real `ScoreObjectEditorTopComponent` that routes the active selection to the correct type-specific editor. The slice extends the score shell snapshot with stable editor-target descriptors, adds on-demand editor-document loading for the active selection, preserves canonical ownership in main through `BlueData` and `ProjectDocumentPatch`, and handles `Instance`, library-backed, empty, multi-selection, and unsupported-object cases deliberately instead of falling back to placeholders.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: existing `@blue/data` score and sound-object classes (`Score`, `PolyObject`, `AudioClip`, `SoundObjectLibrary`, `NoteProcessorChain`, `TimePosition`, `TimeDuration`, `TimeBehavior`), shared `ProjectEditorSnapshot` and `ProjectDocumentPatch`, Zustand 5.x renderer stores, Dockview 5.2.0 auxiliary workbench layout, existing CodeMirror `SelectedCodeEditor`, Vitest 4.x  
**Storage**: main-process in-memory `BlueData` remains canonical; renderer reads score object editor documents on demand for the active selection and writes canonical mutations through shared score patches  
**Testing**: Vitest data, shared-contract, renderer, preload, and main-process tests; `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build:main`, `pnpm --filter @blue/app build:preload`, `pnpm --filter @blue/app build:renderer`, `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks`, `git diff --check`  
**Target Platform**: Electron desktop on macOS first, preserving the existing workbench shell and IPC bridge  
**Project Type**: desktop application feature spanning `@blue/data`, shared snapshot and patch contracts, Electron preload or main IPC, and React renderer panels  
**Performance Goals**: auxiliary panel refresh after selection changes should feel immediate for single-object selection, avoid stale-editor flashes, and avoid serializing full editor payloads for every visible score object on every project snapshot  
**Constraints**: preserve Java `.blue` compatibility, keep `@blue/data` UI-free and Node-free, keep auxiliary panel labels and new surface names ScoreObject-oriented where Java legacy IDs are not required, reuse existing editor surfaces where practical, explicitly surface unsupported Java-only object types instead of implying parity, and keep later score-object follow-up and score-management/navigation workflows out of this slice
**Scale/Scope**: two auxiliary workbench panels, one stable score-object target contract, one on-demand score-object editor document surface, shared properties support for the TypeScript-ported score object families plus `AudioClip`, a static registry for type-specific editors, and the tests needed to validate fallback behavior

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. Canonical score-object data and note-processor chains remain in `@blue/data`; renderer panels consume typed snapshots and dispatch canonical patches.
- **Backwards-Compatible Serialization**: PASS. Score-object edits continue to mutate canonical `BlueData`, `SoundObjectLibrary`, and XML-backed `NoteProcessorChain` structures instead of inventing renderer-owned persistence.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue remains the parity source for editor routing, shared properties behavior, and unsupported-object handling; Java-only editor targets such as `ObjectBuilder` remain explicit fallbacks.
- **Engine as External Process**: PASS. This slice is editor-state work only and does not change playback or engine transport.
- **Test-First for Serialization**: PASS. The plan calls for `SoundObjectLibrary` identity tests, shared score-editor target tests, and renderer contract tests before the auxiliary surfaces are considered complete.
- **Research Integration**: PASS. The design is anchored to the Java `SoundObjectPropertiesTopComponent`, `ScoreObjectEditorTopComponent`, plugin editors, the current TypeScript score shell snapshot, and the existing effect-editor IPC pattern.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── score-object-editor-surfaces.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── blue-data.ts
├── index.ts
├── sound-objects/
│   ├── abstract-sound-object.ts
│   ├── instance.ts
│   ├── sound-object-library.ts
│   └── [existing score-object models reused by the registry]
└── note-processors/
    └── note-processor-chain.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
└── project-editor.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/
└── main.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/
└── preload.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/
├── types/
│   └── global.d.ts
├── stores/
│   ├── project-store.ts
│   └── score-selection-store.ts
├── components/workbench/
│   ├── DockviewPanel.tsx
│   └── panels/
│       ├── [new] ScoreObjectPropertiesPanel.tsx
│       ├── [new] ScoreObjectEditorPanel.tsx
│       └── score-object/
│           ├── [new] useScoreObjectEditorDocument.ts
│           ├── [new] ScoreObjectContextBadge.tsx
│           ├── [new] ScoreObjectPropertiesForm.tsx
│           ├── [new] editor-registry.tsx
│           └── editors/
│               ├── [new] CodeBackedScoreObjectEditor.tsx
│               ├── [new] AudioClipScoreObjectEditor.tsx
│               ├── [new] FileBackedScoreObjectEditor.tsx
│               ├── [new] StructuredScoreObjectEditor.tsx
│               └── [new] UnsupportedScoreObjectEditor.tsx
└── tests/
    └── [new score object properties, routing, contract, and fallback tests]
```

**Structure Decision**: Keep stable score-object identity, library routing, and canonical mutation logic in `@blue/data` plus shared project-editor helpers; keep heavy type-specific editor payloads off the always-on project snapshot by loading an editor document on demand for the active selection; keep the renderer focused on auxiliary panel state, registry-based component selection, and reusable editor-family surfaces.

## Complexity Tracking

No constitution exceptions are required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/research.md](/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/contracts/score-object-editor-surfaces.md](/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/contracts/score-object-editor-surfaces.md)
- [/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Auxiliary panels consume typed shared snapshots and on-demand editor documents; canonical data stays in `BlueData` and shared patch helpers.
- **Backwards-Compatible Serialization**: PASS. Shared properties, library routing, and note-processor changes all mutate canonical score objects and continue to save through existing XML paths.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java editor classes and plugin registration remain the parity source; unported Java-only objects stay explicit fallbacks.
- **Engine as External Process**: PASS. No engine lifecycle or transport changes are introduced.
- **Test-First for Serialization**: PASS. `SoundObjectLibrary` identity helpers, score-object target resolution, and auxiliary panel contract behavior are covered before full editor parity is claimed.
- **Research Integration**: PASS. The design explicitly reuses the Java auxiliary score editor findings, the current score shell snapshot constraints, and the existing effect-editor IPC approach.
