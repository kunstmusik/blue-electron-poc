# Implementation Plan: Tempo Map Parity

**Branch**: `045-tempo-map-parity` | **Date**: 2026-05-20 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/spec.md`

## Summary

Implement Java Blue tempo map parity in the Electron Score panel. Replace the static tempo summary with a 20px tempo region bar, wire Use Tempo and arrow-toggle expanded line graph behavior, support direct region and line-view editing interactions, add a Project -> Edit Tempo Map... modal table editor, and extend shared project snapshots/patches so every edit mutates canonical `BlueData` and persists through `.blue` save/load.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages  
**Primary Dependencies**: Existing `@blue/data` `TempoMap`/`TempoPoint`/`CurveType`/`TimePosition`/`TimeContext`, shared `ProjectEditorSnapshot`/`ProjectDocumentPatch`, Zustand project store, Radix Context Menu, existing Score panel/ruler components, Electron native application menu command dispatch, Vitest 4.x, React Testing Library/jsdom where used by existing renderer tests  
**Storage**: Canonical main-process in-memory `BlueData` tempo map; renderer consumes serializable tempo snapshots and sends typed patches; `.blue` XML remains the persistence format through existing `@blue/data` serialization  
**Testing**: Vitest shared/main/renderer tests, focused score-ruler/tempo tests, application-menu tests, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, `pnpm --filter @blue/data test` if tempo model behavior is changed, `git diff --check`  
**Target Platform**: Electron desktop Score panel on macOS first, with cross-platform React/Electron behavior  
**Project Type**: Desktop application renderer/main integration plus pure data-model patch helpers  
**Performance Goals**: Tempo row renders and drags smoothly for typical tempo maps; pointer dragging should update only the affected point and avoid full app rerenders beyond existing project-store patch flow; modal editing remains immediate for small fixed-size maps  
**Constraints**: Keep `@blue/data` browser-safe and Node-free; no `require()` or dynamic `import()` in `@blue/data`; preserve Java-compatible `.blue` XML; keep score timeline root/nested behavior coherent; do not implement meter-map editing in this spec  
**Scale/Scope**: One tempo row header, one tempo region bar, one optional line graph, one point dialog, one Project menu modal, shared patch/snapshot extensions, tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. Canonical tempo state remains in `@blue/data`; renderer components edit snapshots through typed patches.
- **Backwards-Compatible Serialization**: PASS. Existing `TempoMap` XML remains the persistence boundary; any model changes must be round-trip tested.
- **JVM Dependencies Preserved, Not Replaced**: PASS. No JVM-only generation workflow is replaced by this UI work.
- **Engine as External Process**: PASS. Tempo edits may affect playback timing data but do not change the engine architecture.
- **Test-First for Serialization**: PASS. Tasks include tempo-map save/load and patch tests before or alongside implementation.
- **Research Integration**: PASS. Java Blue class anchors and TypeScript gaps are recorded in `research.md`.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── tempo-map-surface.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/
├── tempo-map.ts
├── tempo-point.ts
└── tempo-map.test.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
└── project-editor.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/
├── application-menu.ts
├── application-menu.test.ts
└── main.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/
└── project-store.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/
├── ScorePanel.tsx
└── score/
    ├── ColumnHeader.tsx
    ├── TempoRegionBar.tsx
    ├── TempoLineView.tsx
    ├── TempoPointDialog.tsx
    ├── TempoMapEditorDialog.tsx
    ├── tempo-map-utils.ts
    └── types.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
├── tempo-map-contract.test.ts
├── tempo-row-parity.test.tsx
├── tempo-line-view.test.tsx
└── tempo-map-modal.test.tsx
```

**Structure Decision**: Keep tempo rendering in `score/` components next to `ColumnHeader.tsx`, with pure utility functions extracted to `tempo-map-utils.ts` for tests. Extend `project-editor.ts` as the shared snapshot/patch boundary because tempo is already part of the transport snapshot consumed by rulers and playback.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/research.md](/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/contracts/tempo-map-surface.md](/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/contracts/tempo-map-surface.md)
- [/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Data model identifies canonical `TempoMap` and renderer draft state separately.
- **Backwards-Compatible Serialization**: PASS. Contract requires existing XML round-trip for enabled, visible, tempo points, and curve types.
- **JVM Dependencies Preserved, Not Replaced**: PASS. No JVM dependency touched.
- **Engine as External Process**: PASS. Playback remains an external process consumer of updated tempo snapshots.
- **Test-First for Serialization**: PASS. Tasks require shared and `@blue/data` tests before UI completion.
- **Research Integration**: PASS. Implementation tasks reference the Java classes and current TypeScript gaps from research.
