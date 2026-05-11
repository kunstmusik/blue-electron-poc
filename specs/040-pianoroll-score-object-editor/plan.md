# Implementation Plan: PianoRoll Score Object Editor Parity

**Branch**: `040-pianoroll-score-object-editor` | **Date**: 2026-05-11 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/spec.md](/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/spec.md`

## Summary

Replace the current metadata-only `PianoRoll` auxiliary editor with a real note-editing canvas, field-editor, and properties workflow derived from Java Blue. The implementation should reuse the score-shell interaction lessons from Spec 036 where practical, while introducing a dedicated `PianoRoll` document and canonical note-batch patch model.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: Spec 037 score-object editor infrastructure, Spec 038 closeout baseline, Spec 036 score-canvas interaction work, `@blue/data` `PianoRoll` model and XML helpers, existing renderer shortcut infrastructure, Dockview 5.2.0, Zustand 5.x, Vitest 4.x  
**Storage**: canonical `PianoRoll` state remains in main-process `BlueData`; viewport, selection, and transient clipboard or undo state remain renderer-local unless claimed otherwise  
**Testing**: Vitest renderer, shared-contract, and main-process coverage plus `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build:renderer`, and `git diff --check`  
**Target Platform**: Electron desktop on macOS first  
**Project Type**: app-layer parity feature extending the existing score-object auxiliary editor infrastructure  
**Performance Goals**: note interactions must feel immediate for the active selection and avoid flooding IPC with per-mousemove canonical writes; large note sets must remain usable inside the auxiliary viewport  
**Constraints**: preserve Java `.blue` compatibility, keep note edits canonical and batch-oriented, reuse existing score-canvas behavior where it helps, and surface unsupported `PianoRoll` subfeatures explicitly  
**Scale/Scope**: one heavyweight canvas-driven score-object editor plus its document contract, mutation helpers, and validation coverage

## Constitution Check

- **Data-First, UI-Separated**: PASS. Canonical note and property mutations stay in shared patch helpers; viewport and selection state stay renderer-local.
- **Backwards-Compatible Serialization**: PASS. All edits continue to flow through `@blue/data` and existing XML-backed models.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue `PianoRoll` classes remain the parity source for layout and interaction decisions.
- **Engine as External Process**: PASS. This slice is editor interaction and model mutation only.
- **Test-First for Serialization**: PASS. The plan adds payload, note-batch, and property-mutation coverage before parity is claimed.
- **Research Integration**: PASS. The design reuses Spec 036 interaction lessons without treating the `PianoRoll` canvas as the same surface as the score shell.

## Project Structure

### Documentation

```text
/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── pianoroll-score-object-editor-surfaces.md
└── tasks.md
```

### Source Code

```text
/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/PianoRollEditor.tsx
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/ScoreTimeCanvas.tsx
/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
```

**Structure Decision**: Keep the Spec 037 score-object editor shell, replace the current `PianoRollEditor.tsx` form with a dedicated canvas plus properties workflow, and introduce canonical note-batch mutation helpers rather than ad hoc field writes.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/research.md](/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/data-model.md](/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/contracts/pianoroll-score-object-editor-surfaces.md](/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/contracts/pianoroll-score-object-editor-surfaces.md)
- [/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/quickstart.md](/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Canonical note and property edits remain patch-driven and renderer-local interaction state stays isolated.
- **Backwards-Compatible Serialization**: PASS. No renderer-owned persistence is introduced.
- **JVM Dependencies Preserved, Not Replaced**: PASS. The plan is anchored to Java `PianoRoll` interaction classes and layout.
- **Engine as External Process**: PASS. No transport or render-engine behavior changes are required.
- **Test-First for Serialization**: PASS. Contract, renderer, and mutation tests are required before parity is claimed.
- **Research Integration**: PASS. The plan draws from both the Java editor hierarchy and the existing TypeScript score-canvas work.
