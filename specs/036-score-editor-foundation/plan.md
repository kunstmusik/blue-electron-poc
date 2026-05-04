# Implementation Plan: Score Editor Foundation

**Branch**: `036-score-editor-foundation` | **Date**: 2026-05-03 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/spec.md](/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/spec.md`

## Summary

Deliver the first usable score app layer on top of the existing `@blue/data` score models. Extend the shared project snapshot and patch bridge with a typed score shell snapshot, complete the `TimeState` parity needed by the score UI, replace the `ScoreTopComponent` placeholder with a Java Blue-style score shell, render mixed `PolyObject`, audio-layer, and pattern-layer rows, and support nested score-path navigation plus ruler and row-visibility behavior. Direct manipulation and the auxiliary score-editor surfaces remain intentionally out of scope for this first score slice.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: existing `@blue/data` score and time classes (`Score`, `PolyObject`, `AudioLayerGroup`, `PatternsLayerGroup`, `TimeContext`, `TimeState`, `MeterMap`, `TempoMap`, `MarkersList`), shared `ProjectEditorSnapshot`/`ProjectDocumentPatch`, Zustand 5.x renderer stores, Dockview 5.2.0 workbench shell, existing workbench panel routing, Vitest 4.x  
**Storage**: main-process in-memory `BlueData` remains canonical; renderer consumes serializable score shell snapshots and dispatches explicit `score` patches for canonical time-state updates; nested score-path session state remains renderer-local and is not persisted into the project document  
**Testing**: Vitest data and renderer tests, `pnpm --filter @blue/data test`, `pnpm --filter @blue/data build`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build:main`, `pnpm --filter @blue/app build:preload`, `pnpm --filter @blue/app build:renderer`, `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks`, `git diff --check`  
**Target Platform**: Electron desktop on macOS first, preserving the current workbench architecture  
**Project Type**: desktop application feature spanning `@blue/data`, shared snapshot code, and React renderer panels  
**Performance Goals**: score shell open, path-switch, and zoom or ruler updates should feel immediate on representative mixed-score projects; no placeholder churn or full-panel remounting should be required when switching score paths or row visibility  
**Constraints**: preserve Java `.blue` compatibility, keep `@blue/data` UI-free and Node-free, reuse the canonical project patch flow rather than renderer-owned score models, keep nested score-path state transient, and explicitly defer direct manipulation plus auxiliary score-editor surfaces to later specs  
**Scale/Scope**: one score workbench panel, three renderable layer-group families (`PolyObject`, audio, patterns), one typed score shell snapshot, one score time-state patch path, one nested score-path session hook, and the tests required to validate shell parity for this slice

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. Canonical score data stays in `@blue/data` and shared snapshots; the renderer consumes serializable score shell snapshots instead of mutating `@blue/data` instances directly.
- **Backwards-Compatible Serialization**: PASS. `TimeState`, markers, and score-layer structures remain owned by `BlueData` and must round-trip through existing XML paths.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue score UI and data classes remain the parity source; JVM-dependent score-object content is not re-scoped in this slice.
- **Engine as External Process**: PASS. The score shell is editor-state work and does not change engine architecture.
- **Test-First for Serialization**: PASS. `TimeState` parity and score snapshot behavior are explicitly tested as part of the plan.
- **Research Integration**: PASS. The plan is directly anchored to the Java score shell, layer-group providers, and the current TypeScript snapshot gaps documented in `research.md`.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── score-editor-surfaces.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── time/
│   ├── time-state.ts
│   ├── time-base.ts
│   ├── time-context.ts
│   └── [new] snap-value.ts
├── score/
│   ├── score.ts
│   ├── audio/
│   │   ├── audio-layer-group.ts
│   │   └── audio-layer.ts
│   └── patterns/
│       ├── patterns-layer-group.ts
│       └── pattern-layer.ts
├── sound-objects/
│   ├── poly-object.ts
│   └── sound-layer.ts
└── markers-list.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
└── project-editor.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/
├── stores/
│   └── project-store.ts
├── components/workbench/
│   ├── DockviewPanel.tsx
│   └── panels/
│       ├── [new] ScorePanel.tsx
│       └── score/
│           ├── [new] types.ts
│           ├── [new] ScorePathBar.tsx
│           ├── [new] ScoreTimelineShell.tsx
│           ├── [new] ScoreRulerStack.tsx
│           ├── [new] useScorePathState.ts
│           └── layer-groups/
│               ├── [new] PolyObjectTimeline.tsx
│               ├── [new] AudioLayerGroupTimeline.tsx
│               └── [new] PatternsLayerGroupTimeline.tsx
└── tests/
    └── [new score contract, shell, ruler, and path tests]
```

**Structure Decision**: Keep canonical score content and time-state ownership in `@blue/data` plus shared snapshot helpers, keep optimistic score time-state updates in the existing renderer project store, and keep nested score-path session state in renderer-local score-panel helpers rather than persisting it into the project document.

## Complexity Tracking

No constitution exceptions are required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/research.md](/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/data-model.md](/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/contracts/score-editor-surfaces.md](/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/contracts/score-editor-surfaces.md)
- [/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/quickstart.md](/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. The score shell consumes typed snapshots and dispatches explicit score patches; no renderer-owned canonical score model is introduced.
- **Backwards-Compatible Serialization**: PASS. `TimeState` parity, score-layer ordering, and markers remain rooted in canonical `BlueData` save or load behavior.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue remains the parity reference for shell layout, provider decomposition, and time-state behavior.
- **Engine as External Process**: PASS. Playback architecture is untouched; the score shell reads existing transport metadata only.
- **Test-First for Serialization**: PASS. `TimeState` XML parity and score snapshot behavior are both called out for test coverage before the slice is considered complete.
- **Research Integration**: PASS. The design explicitly reuses the Java shell, provider, and path-controller findings while targeting the current TypeScript score gaps.
