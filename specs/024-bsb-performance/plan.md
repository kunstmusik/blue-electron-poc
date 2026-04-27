# Implementation Plan: BlueSynthBuilder Performance and Live Interaction

**Branch**: `024-bsb-performance` | **Date**: 2026-04-27 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/spec.md](/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/spec.md`

## Summary

Refactor the BlueSynthBuilder update pipeline so that local widget edits use structural sharing, renderer subscriptions observe only the affected surfaces, high-frequency live-control updates no longer wait behind the generic trailing document debounce, and successful canonical commits stop echoing a full project snapshot back into the renderer. Memoization is a supporting tool in this plan, not the core fix.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data`
**Primary Dependencies**: `@blue/data`, Zustand 5.x project store, existing Orchestra/BSB editor surfaces from Specs 021-023, Electron IPC bridge, Vitest 4.x
**Storage**: Main-process in-memory `BlueData` remains canonical; renderer keeps an optimistic structurally shared snapshot and commits patch batches through IPC; `.blue` XML remains the persistence format
**Testing**: Vitest store and renderer tests, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, `pnpm --filter @blue/data test`, `git diff --check`, manual React Profiler pass
**Target Platform**: Electron desktop renderer on macOS first, preserving existing workbench/orchestra architecture
**Project Type**: Renderer/store/main-process performance refactor with no intended feature-surface expansion
**Performance Goals**: Single-widget edits should preserve identity for untouched state, avoid whole-panel rerenders, and provide live playback feedback without the current trailing debounce delay
**Constraints**: Preserve Spec 023 behavior and `.blue` compatibility; keep `@blue/data` UI-free; preserve main-process canonical ownership; avoid speculative optimization that obscures correctness
**Scale/Scope**: `project-store.ts`, `project-editor.ts`, `main.ts`, preload/global typings, Orchestra panel selectors, BSB editor/canvas/widget boundaries, tests and profiling docs

## Constitution Check

- **Data-First, UI-Separated**: PASS. The plan keeps project semantics in shared/main/store layers while renderer changes focus on subscription and prop boundaries.
- **Backwards-Compatible Serialization**: PASS. No XML format changes are required; BSB snapshot/patch behavior remains compatible.
- **JVM Dependencies Preserved, Not Replaced**: PASS. No Java-backed feature is being replaced; this is a renderer and transport performance refactor.
- **Engine as External Process**: PASS. Engine integration remains external; the plan only changes when and how widget updates are forwarded.
- **Test-First for Serialization**: PASS. Serialization remains covered by existing suites; new work adds render and transport regression coverage.
- **Research Integration**: PASS. The plan follows the findings documented in `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/research.md`.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/
├── spec.md
├── research.md
├── plan.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── bsb-performance-surface.md
└── tasks.md
```

### Source Code (primary change areas)

```text
/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
└── project-editor.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/
└── main.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/
└── preload.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/
└── project-store.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/
└── OrchestraPanel.tsx

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/
├── InstrumentEditorPanel.tsx
├── BlueSynthBuilderEditor.tsx
└── bsb/
    ├── BSBInterfaceEditor.tsx
    ├── BSBInterfaceCanvas.tsx
    └── widgets/
        └── WidgetWrapper.tsx

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
├── [new] bsb-performance-store.test.ts
├── [new] bsb-performance-render.test.tsx
└── [new] bsb-performance-transport.test.ts
```

## Complexity Tracking

No constitution violations are required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/research.md](/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/data-model.md](/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/contracts/bsb-performance-surface.md](/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/contracts/bsb-performance-surface.md)
- [/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/quickstart.md](/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Transport metadata is kept distinct from project document semantics.
- **Backwards-Compatible Serialization**: PASS. The design changes runtime update flow, not persisted XML structure.
- **JVM Dependencies Preserved, Not Replaced**: PASS. No Java or engine domain behavior is removed.
- **Engine as External Process**: PASS. The engine remains external; only update timing and batching change.
- **Test-First for Serialization**: PASS. Existing serialization guarantees remain, while new tests cover performance-sensitive reducer and transport behavior.
- **Research Integration**: PASS. Design choices directly answer the measured problems from the current code.

## Implementation Strategy

### Phase 2 - Transport and reducer foundation

1. Add explicit transport metadata for batched document commits and realtime BSB control updates.
2. Replace snapshot-returning local commit flow with acknowledgement and explicit recovery.
3. Rework the optimistic reducer for structural sharing rather than full deep cloning.

### Phase 3 - Renderer boundary isolation

1. Split top-level selectors in `OrchestraPanel.tsx`.
2. Stabilize callback and selection boundaries through the BSB editor stack.
3. Add memo boundaries only where state identity and props are now stable.

### Phase 4 - Live interaction path

1. Route high-frequency value-bearing edits through the realtime transport.
2. Keep general document edits on the batch commit path.
3. Ensure failure recovery can explicitly resync without reintroducing success-path snapshot echo.

### Phase 5 - Validation and close-out

1. Add identity, render-count, and transport tests.
2. Run manual React Profiler validation with a BSB-heavy project.
3. Run full app/data test and build suite, then update status docs.

## Key Technical Decisions

### 1. Structural sharing is the primary optimization

The central reducer fix is to stop recreating the entire orchestra for small widget edits. This gives selectors and memoization something useful to work with.

### 2. Canonical success echo is removed, not diffed around

The plan does not recommend keeping the full-snapshot response and trying to deep-compare or ignore it afterward. That still pays the snapshot creation and transfer cost. The better contract is not to send the snapshot on success.

### 3. Live-control transport is explicit

High-frequency value-bearing edits are not treated as ordinary document edits with a different timeout. They get an explicit path, so the latency policy is visible in code and tests.

### 4. Memoization is deliberately late in the sequence

Applying `React.memo` before fixing reducer identity and prop stability would produce limited gains and increase maintenance cost. The plan delays memo work until the state graph is stable enough to benefit.