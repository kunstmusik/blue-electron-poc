# Implementation Plan: JMask Score Object Editor Parity

**Branch**: `041-jmask-score-object-editor` | **Date**: 2026-05-11 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/spec.md](/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/spec.md`

## Summary

Replace the current seed-only `JMask` auxiliary editor with a Java Blue-style parameter-editor stack that covers generator selection, optional mask and probability workflows, and any table or test surfaces this slice can support honestly. The implementation should stay anchored to canonical `JMask` mutations and make unsupported generator data explicit rather than silently flattening it.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: Spec 037 score-object editor infrastructure, Spec 038 closeout baseline, `@blue/data` `JMask` and generator models, reusable renderer form and canvas primitives, Dockview 5.2.0, Zustand 5.x, Vitest 4.x  
**Storage**: canonical `JMask` state remains in main-process `BlueData`; expanded panels, scroll position, and other editor-shell state remain renderer-local  
**Testing**: Vitest renderer, shared-contract, and main-process coverage plus `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build:renderer`, and `git diff --check`  
**Target Platform**: Electron desktop on macOS first  
**Project Type**: app-layer parity feature extending the existing score-object auxiliary editor infrastructure  
**Performance Goals**: large parameter stacks must remain scrollable and responsive; nested editor changes should commit at deliberate boundaries rather than thrashing the patch pipeline  
**Constraints**: preserve Java `.blue` compatibility, keep unsupported data explicit and reload-safe, and avoid claiming more generator or probability parity than the current TypeScript model can support honestly  
**Scale/Scope**: one heavyweight form and canvas driven score-object editor plus its document contract, mutation helpers, and validation coverage

## Constitution Check

- **Data-First, UI-Separated**: PASS. Canonical `JMask` mutations stay in shared patch helpers while expanded-row and scroll state stay renderer-local.
- **Backwards-Compatible Serialization**: PASS. All edits continue to flow through `@blue/data` and existing XML-backed models.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue `JMask` editor classes remain the parity source for layout and generator workflows.
- **Engine as External Process**: PASS. This slice is editor interaction and model mutation only.
- **Test-First for Serialization**: PASS. The plan adds payload, nested-mutation, and unsupported-data coverage before parity is claimed.
- **Research Integration**: PASS. The design explicitly breaks out the Java generator hierarchy instead of hiding it behind a shallow placeholder task.

## Project Structure

### Documentation

```text
/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── jmask-score-object-editor-surfaces.md
└── tasks.md
```

### Source Code

```text
/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/JMaskEditor.tsx
/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
```

**Structure Decision**: Keep the Spec 037 score-object editor shell, replace the current `JMaskEditor.tsx` seed form with a scrollable parameter-stack editor, and add explicit nested patch helpers so generator edits remain canonical and reload-safe.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/research.md](/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/data-model.md](/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/contracts/jmask-score-object-editor-surfaces.md](/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/contracts/jmask-score-object-editor-surfaces.md)
- [/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/quickstart.md](/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Canonical `JMask` edits remain patch-driven and renderer-local panel state stays isolated.
- **Backwards-Compatible Serialization**: PASS. No renderer-owned persistence is introduced.
- **JVM Dependencies Preserved, Not Replaced**: PASS. The plan is anchored to Java `JMask` editor classes and generator workflows.
- **Engine as External Process**: PASS. No transport or render-engine behavior changes are required.
- **Test-First for Serialization**: PASS. Contract, renderer, and nested-mutation tests are required before parity is claimed.
- **Research Integration**: PASS. The plan turns the Java generator hierarchy into explicit design and task work instead of a single placeholder implementation step.
