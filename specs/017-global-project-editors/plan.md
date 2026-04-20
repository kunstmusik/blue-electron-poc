# Implementation Plan: Global And Project Editors

**Branch**: `017-global-project-editors` | **Date**: 2026-04-20 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/spec.md](/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/spec.md`

## Summary

Replace the current placeholder implementations for `GlobalOrchestraTopComponent`, `GlobalScoreTopComponent`, and `ProjectPropertiesTopComponent` with basic working editor-area surfaces backed by the current project document. The core implementation path is to keep `currentData` in the Electron main process as the canonical mutable project model, expose a narrow preload IPC surface for loading and patching global-orchestra/global-score/project-properties data, extend the TypeScript `ProjectProperties` model where Java-backed built-in tabs require missing fields, and render a bounded first-pass UI in the existing Dockview workbench without bringing in Monaco or grammar-aware tooling yet.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: `@blue/data`, React 19, Zustand 5.x, `dockview` 5.2.0, Vitest 4.x, existing Electron preload/main IPC bridge  
**Storage**: Main-process in-memory `currentData` plus `.blue` XML serialization through `@blue/data`; renderer mirrors an editable snapshot for the active project  
**Testing**: `pnpm --filter @blue/data test`, targeted `@blue/data` round-trip tests for any `ProjectProperties` schema additions, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`  
**Target Platform**: Electron desktop application (`@blue/app`)  
**Project Type**: Desktop application UI feature spanning renderer, preload, main process, and shared data model  
**Performance Goals**: Editor typing and form changes should feel immediate for normal project sizes; switching between projects should refresh all three panels during normal workbench use without restart or manual reload  
**Constraints**: Preserve `.blue` compatibility; keep `currentData` as the canonical project source; do not introduce Monaco or tree-sitter in this slice; keep plugin-provided `ProjectProperties` tabs deferred unless they add no material scope; preserve the existing workbench tab model and window-menu routing  
**Scale/Scope**: Three editor-area panels, one current project document, one preload IPC expansion, one renderer project-editing state path, bounded built-in `ProjectProperties` tabs only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Data-First, UI-Separated**: PASS. Any added project fields belong in `@blue/data`; renderer and Electron code must consume that data layer rather than embedding ad hoc project schemas.
- **II. Backwards-Compatible Serialization**: ACTIVE GATE. `ProjectProperties` changes must preserve `.blue` load/save compatibility and require round-trip coverage for any newly added XML fields.
- **III. JVM Dependencies Preserved, Not Replaced**: PASS. The slice implements Java-backed editor surfaces but does not alter JVM-dependent score-generation behavior.
- **IV. Engine as External Process**: PASS. No engine-transport changes are required; project-property edits may affect render options only through existing data-model serialization and CSD generation.
- **V. Test-First for Serialization**: ACTIVE GATE. Any `@blue/data` changes require serialization-focused tests, not renderer-only validation.

**Gate Result**: PASS with required `@blue/data` serialization coverage for any schema expansion.

## Project Structure

### Documentation (this feature)

```text
specs/017-global-project-editors/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── project-editor-ipc.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/blue-data/
├── src/
│   ├── global-orc-sco.ts
│   ├── project-properties.ts
│   └── blue-data.ts
└── tests/
    └── integration/

packages/blue-app/
├── src/main/
│   └── main.ts
├── src/preload/
│   └── preload.ts
├── src/renderer/components/workbench/
│   ├── DockviewPanel.tsx
│   └── panels/
├── src/renderer/hooks/
│   └── use-ipc-listeners.ts
├── src/renderer/stores/
│   └── project-store.ts
├── src/renderer/types/
│   └── global.d.ts
└── src/renderer/tests/
```

**Structure Decision**: Keep the planning artifacts under `specs/017-global-project-editors/`. Implement the runtime slice across `@blue/data` for schema parity, Electron main/preload for the project-editor IPC boundary, and the existing renderer workbench/panel/store paths for the visible editor tabs.

## Phase 0 Research Decisions

1. Keep the main process as the canonical owner of the mutable current project document:
   - `currentData` in `packages/blue-app/src/main/main.ts` remains the save source for `.blue` output
   - renderer panels work against a mirrored snapshot and send explicit update patches back through preload IPC
2. Use a narrow project-editor IPC surface instead of direct renderer access to `@blue/data` objects:
   - load/hydrate via a project-editor snapshot
   - patch updates for `globalOrc`, `globalSco`, and built-in `projectProperties` fields
   - preserve the existing safe preload boundary
3. Implement `GlobalOrchestraTopComponent` and `GlobalScoreTopComponent` with a basic multiline editor control in this slice:
   - no Monaco
   - no language-aware parsing
   - no tree-sitter-backed highlighting or diagnostics
4. Treat `ProjectPropertiesTopComponent` as a bounded built-in tab surface:
   - include the built-in Java tabs that can be supported cleanly by the TypeScript data model
   - plugin-provided `ProjectPluginEditor` tabs remain deferred
5. Expand the TypeScript `ProjectProperties` model where necessary to cover the chosen built-in tabs:
   - schema additions belong in `@blue/data`
   - any new fields must round-trip against Java-compatible XML names
6. Reuse the existing renderer project store rather than introducing a second current-project store:
   - extend the current store from summary metadata to a broader editable snapshot for these panels
   - keep the renderer snapshot subordinate to the main-process canonical document

## Phase 1 Design Artifacts

- `research.md`: decisions on main-process ownership, IPC shape, basic editor control choice, `ProjectProperties` tab scope, and testing strategy
- `data-model.md`: current project editor snapshot, project-property field groups, IPC patch payloads, and state transitions for load/edit/save/project-switch flows
- `contracts/project-editor-ipc.md`: preload/main contract for loading and patching the project-editor data exposed to renderer panels
- `quickstart.md`: implementation order and manual validation flows for global orchestra, global score, and project properties

## Post-Design Constitution Check

- **I. Data-First, UI-Separated**: PASS
- **II. Backwards-Compatible Serialization**: PASS, provided the slice adds round-trip tests for any newly ported `ProjectProperties` XML fields
- **III. JVM Dependencies Preserved, Not Replaced**: PASS
- **IV. Engine as External Process**: PASS
- **V. Test-First for Serialization**: PASS, with explicit `@blue/data` coverage planned before or alongside UI wiring

**Post-Design Gate Result**: PASS.

## Complexity Tracking

No constitution exception is required. The deliberate complexity in this slice is the new main/preload/renderer project-editor bridge plus the likely `ProjectProperties` schema expansion in `@blue/data`. That complexity is justified because the current workbench placeholders cannot become real editor surfaces without a stable path for reading and mutating the canonical current project document.
