# Implementation Plan: Score Object Editor Tier 1 Parity

**Branch**: `038-score-object-editor-tier1-parity` | **Date**: 2026-05-07 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/spec.md`

## Summary

Complete the first grouped follow-up for the remaining score-object editors by replacing the thin or placeholder auxiliary surfaces for `External`, `PolyObject`, and `TrackerObject`. The slice extends the Spec 037 editor-document contract with dedicated Tier 1 payloads, reuses the existing auxiliary panel shell and canonical score patch flow, and focuses on practical Java parity for the moderate-gap editors before starting the much heavier Tier 2 work.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: existing Spec 036 score shell and nested score-path state, existing Spec 037 score-object editor registry and on-demand editor documents, `@blue/data` `External`, `PolyObject`, and `TrackerObject` models, Zustand 5.x renderer stores, Dockview 5.2.0, existing CodeMirror `SelectedCodeEditor`, Vitest 4.x  
**Storage**: canonical score state remains in main-process `BlueData`; renderer reads dedicated Tier 1 editor documents on demand and writes through existing score patch flows  
**Testing**: Vitest renderer, shared-contract, and main-process coverage plus `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build:renderer`, and `git diff --check`  
**Target Platform**: Electron desktop on macOS first, preserving existing workbench and IPC architecture  
**Project Type**: app-layer parity feature extending the existing score-object auxiliary editor infrastructure  
**Performance Goals**: Tier 1 editor panels should refresh immediately when selection changes, and large `PolyObject` or `TrackerObject` payloads should remain scoped to the active selection only  
**Constraints**: preserve Java `.blue` compatibility, reuse the Spec 037 panel shell and patch plumbing, avoid new model-port work unless strictly necessary, and keep score-management/navigation work out of this slice  
**Scale/Scope**: three editor families, one shared editor-document contract extension, and the tests needed to validate their routing and canonical mutation behavior

## Constitution Check

- **Data-First, UI-Separated**: PASS. Canonical score data remains in `@blue/data` and shared patch helpers; renderer panels consume typed editor documents.
- **Backwards-Compatible Serialization**: PASS. All edits continue to write through canonical score patches and existing XML-backed models.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue remains the parity source for the Tier 1 editor layouts and affordances.
- **Engine as External Process**: PASS. This slice is auxiliary editor work only.
- **Test-First for Serialization**: PASS. The plan adds editor-document and mutation coverage for all three Tier 1 editors.
- **Research Integration**: PASS. The design explicitly extends Spec 037 rather than inventing a new editor stack.

## Project Structure

### Documentation

```text
/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── score-object-editor-tier1-surfaces.md
└── tasks.md
```

### Source Code

```text
/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts
/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectEditorPanel.tsx
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
```

**Structure Decision**: Build this slice entirely on top of the Spec 037 auxiliary editor infrastructure. The only new shared-surface work is the Tier 1 editor-document payloads and the renderer/editor helpers needed to render them cleanly.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/research.md](/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/contracts/score-object-editor-tier1-surfaces.md](/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/contracts/score-object-editor-tier1-surfaces.md)
- [/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Tier 1 editors consume typed document payloads and write through existing score patches.
- **Backwards-Compatible Serialization**: PASS. No renderer-owned persistence is introduced.
- **JVM Dependencies Preserved, Not Replaced**: PASS. The spec uses Java Blue as the layout and behavior source for all three editors.
- **Engine as External Process**: PASS. Any preview/test affordance stays optional and isolated from transport changes.
- **Test-First for Serialization**: PASS. The plan requires contract and renderer tests before parity is claimed.
- **Research Integration**: PASS. The design remains aligned with Spec 037’s auxiliary panel architecture and Spec 036’s nested score-path support.