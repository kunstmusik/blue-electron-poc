# Implementation Plan: Csound Editor Tooling

**Branch**: `018-csound-editor-tooling` | **Date**: 2026-04-22 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/spec.md](/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/spec.md`

## Summary

Reopen the editor choice for `GlobalOrchestraTopComponent` before implementation. Evaluate CodeMirror plus the user-supplied `@kunstmusik/codemirror-lang-csound` package against Monaco plus optional grammar/language-support work, with dynamic completions as a first-class decision criterion. After the evaluation gate selects a preferred editor, replace the spec 017 textarea-based Global Orchestra surface with that editor while preserving the existing project-store load/update/save path. `tree-sitter-csound` remains relevant as a possible Monaco grammar path or later language-tooling input, but it is no longer the only path for Csound language support.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: `@blue/data`, React 19, Zustand 5.x, `dockview` 5.2.0, Vitest 4.x, selected editor dependency from CodeMirror or Monaco evaluation, optional `@kunstmusik/codemirror-lang-csound`, optional `tree-sitter-csound` research input  
**Storage**: Main-process in-memory current project document plus existing `.blue` XML serialization through `@blue/data`; renderer edits flow through the existing project snapshot/store bridge  
**Testing**: `pnpm --filter @blue/app test`, targeted renderer/component tests for the selected editor panel behavior, `pnpm --filter @blue/app build`; no new `@blue/data` serialization suite is expected unless the slice adds persisted editor metadata  
**Target Platform**: Electron desktop application (`@blue/app`)  
**Project Type**: Desktop application UI feature spanning renderer editor integration, build configuration, and bounded language-tooling research  
**Performance Goals**: Global Orchestra typing and cursor movement should remain responsive for ordinary project orchestra sizes; editor mount and project-switch behavior should feel immediate during normal workbench use  
**Constraints**: Editor choice must be justified before implementation; `GlobalOrchestraTopComponent` is the only editor surface in scope; preserve the current project-store/main-process patch flow; avoid CDN or network-dependent editor loading; keep dynamic completion extensibility explicit; do not require native addons or a new language server process in this slice  
**Scale/Scope**: One selected rich-editor workbench panel, one local editor wrapper/adapter, one CodeMirror vs Monaco decision matrix, one dynamic-completion strategy, and one follow-on roadmap for editor reuse and deeper language tooling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Data-First, UI-Separated**: PASS. Editor integration stays in the renderer; project content continues to flow through the existing store and `@blue/data` document ownership model.
- **II. Backwards-Compatible Serialization**: PASS. The slice does not require new `.blue` schema fields; any optional editor preferences added later must remain separate from project serialization.
- **III. JVM Dependencies Preserved, Not Replaced**: PASS. The slice upgrades only the editing surface for `globalOrc`; JVM-dependent score-generation behavior is unchanged.
- **IV. Engine as External Process**: PASS. No engine or playback transport changes are required.
- **V. Test-First for Serialization**: PASS. No shared serialization expansion is planned; renderer/editor tests and build validation are the primary gates.

**Gate Result**: PASS. The feature is renderer/build/editor focused and does not alter the current `.blue` data-model contract.

## Project Structure

### Documentation (this feature)

```text
specs/018-csound-editor-tooling/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── global-orchestra-editor-surface.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/blue-app/
├── package.json
├── vite.config.ts
├── src/renderer/components/workbench/
│   ├── DockviewPanel.tsx
│   └── panels/
│       ├── GlobalOrchestraPanel.tsx
│       ├── ProjectTextEditorPanel.tsx
│       └── editors/
├── src/renderer/stores/
│   └── project-store.ts
├── src/renderer/tests/
└── src/shared/
```

**Structure Decision**: Keep planning artifacts under `specs/018-csound-editor-tooling/`. Runtime work remains isolated to `@blue/app`: package dependencies, optional build configuration for the selected editor, a local editor wrapper under the renderer workbench panel tree, the existing `GlobalOrchestraPanel`, and the current renderer tests/store.

## Phase 0 Research Decisions

1. Add an explicit editor-selection gate before implementation:
   - CodeMirror and Monaco must be compared before adding the runtime dependency.
   - Dynamic completion support is a core decision criterion, not an afterthought.
2. Treat CodeMirror as a serious first-class candidate:
   - `@kunstmusik/codemirror-lang-csound` already exposes CSD/ORC/SCO support, autocomplete, hover, semantic highlighting, folding, indentation, and Csound metadata.
   - CodeMirror completion sources can be dynamic and asynchronous, so project/runtime completion data appears viable.
3. Treat Monaco as a capable but higher-effort candidate for Csound:
   - Monaco has a completion provider API and strong editor UX.
   - It lacks an existing project-specific Csound package in this repo, so language support would need custom work, tree-sitter integration, or a simpler fallback.
4. Keep a local editor adapter boundary regardless of the chosen editor:
   - `GlobalOrchestraPanel` should not become tightly coupled to editor internals.
   - The adapter should accept value/read-only state and expose a documented dynamic completion extension point.
5. Keep the existing project-store patch flow as the only persistence path:
   - editor edits update `globalOrc` through `updateGlobalOrc`.
   - the editor never becomes a second source of truth for project content.

## Phase 1 Design Artifacts

- `research.md`: CodeMirror vs Monaco comparison, dynamic completion analysis, language package evaluation, tree-sitter role, selected path criteria, and follow-on roadmap
- `data-model.md`: renderer-side editor state, editor candidate evaluation, selected editor mode, completion provider boundary, and state transitions for load/edit/save/project-switch flows
- `contracts/global-orchestra-editor-surface.md`: boundary between `GlobalOrchestraPanel`, the selected editor adapter, and the project store
- `quickstart.md`: implementation order plus manual validation for the selected editor and dynamic completion extensibility

## Post-Design Constitution Check

- **I. Data-First, UI-Separated**: PASS
- **II. Backwards-Compatible Serialization**: PASS
- **III. JVM Dependencies Preserved, Not Replaced**: PASS
- **IV. Engine as External Process**: PASS
- **V. Test-First for Serialization**: PASS

**Post-Design Gate Result**: PASS. The slice remains bounded to renderer/build/editor work and does not require data-model exceptions.

## Complexity Tracking

No constitution exception is required. The main complexity is the editor-selection gate plus one selected editor adapter. That complexity is justified because choosing the wrong editor now could make dynamic completions and Csound language support harder in later slices.
