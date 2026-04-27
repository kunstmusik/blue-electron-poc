# Tasks: BlueSynthBuilder Performance and Live Interaction

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/plan.md`, `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/spec.md`, `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/research.md`, `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/contracts/bsb-performance-surface.md`

**Tests**: Required. This slice is only complete when store identity, renderer isolation, transport behavior, and failure-recovery tests are in place.

**Organization**: Tasks are grouped by foundation first, then by user story and validation phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves
- Include exact file paths in descriptions

---

## Phase 1: Baseline and Instrumentation

**Purpose**: Capture the current behavior explicitly and add the test harnesses needed to verify the refactor.

- [ ] T001 [Shared] Record current baseline findings and external-analysis comparison in `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/research.md` if implementation discoveries change the initial review
- [ ] T002 [P] [US2] Add store identity regression tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-performance-store.test.ts` covering single-widget value edits, structural widget edits, and untouched instrument identity preservation
- [ ] T003 [P] [US2] Add renderer render-isolation tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-performance-render.test.tsx` covering arrangement isolation, unrelated-widget isolation, and selection-only rerenders
- [ ] T004 [P] [US1] Add transport behavior tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-performance-transport.test.ts` covering trailing-batch commits, realtime updates, and failure recovery

**Checkpoint**: The repository can prove the current problem and detect regressions.

---

## Phase 2: Transport and Commit Foundation

**Purpose**: Introduce the explicit transport surfaces needed to remove canonical snapshot echo and support realtime control updates.

**Critical**: No renderer boundary tuning should begin until the new transport contract exists.

- [ ] T005 [US3] Extend shared contracts in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` with commit receipts, revision tracking, and realtime BSB control update types
- [ ] T006 [P] [US3] Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts` with batch-commit and realtime-update APIs
- [ ] T007 [US3] Replace the sequential snapshot-returning `update-project-document` flush path in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts` with a batch commit handler that returns only a commit receipt on success
- [ ] T008 [P] [US3] Add explicit recovery-sync handling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts` so commit failures trigger `getProjectDocument()` rather than leaving renderer state stale

**Checkpoint**: Successful local commits no longer depend on full canonical snapshot echo.

---

## Phase 3: Structural Sharing in the Project Store

**Purpose**: Make small BSB edits preserve identity for unaffected orchestra state.

- [ ] T009 [US2] Replace full-orchestra clone helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts` with structural-sharing update helpers for arrangement and selected instrument mutations
- [ ] T010 [P] [US2] Refactor BSB widget-tree patch application in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts` so only the changed widget branch is recreated for value/property edits
- [ ] T011 [P] [US2] Make object-name collection and widget summary synchronization conditional in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`, running only for structure-changing or name-changing patches
- [ ] T012 [US2] Preserve untouched arrangement row and instrument references across single-widget edits in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`, updating tests from T002 accordingly

**Checkpoint**: Single-widget edits stop invalidating the whole orchestra snapshot.

---

## Phase 4: Renderer Boundary Isolation

**Purpose**: Narrow subscriptions and stabilize props so render work follows actual data changes.

- [ ] T013 [US2] Split broad `state.orchestra` subscriptions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/OrchestraPanel.tsx` into narrower selectors for arrangement data, selected assignment state, and selected instrument snapshots
- [ ] T014 [P] [US2] Stabilize the BSB dispatch chain in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/InstrumentEditorPanel.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/BlueSynthBuilderEditor.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx`
- [ ] T015 [P] [US2] Refactor `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceCanvas.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/widgets/WidgetWrapper.tsx` so widgets receive narrow stable props instead of whole shared selection collections and unstable callbacks
- [ ] T016 [US2] Add memo boundaries where they now become effective in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/widgets/` and validate them with the tests from T003

**Checkpoint**: Unrelated widgets and arrangement surfaces stop re-rendering for ordinary widget value changes.

---

## Phase 5: Live-Control Interaction Path

**Purpose**: Make value-bearing BSB interactions reach the engine during playback without reintroducing full-state work.

- [ ] T017 [US1] Add realtime BSB control dispatch scheduling to `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`, keeping ordinary document patches on the batch path
- [ ] T018 [P] [US1] Handle realtime BSB control updates in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts` so only targeted channels update for slider, knob, checkbox, dropdown, XY, and slider-bank interactions
- [ ] T019 [P] [US1] Route value-bearing widget interactions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/` through the realtime path while preserving ordinary structural/property edits on the document batch path
- [ ] T020 [US1] Ensure save correctness by reconciling realtime edits with the canonical document commit flow in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`

**Checkpoint**: Playback responds during live widget gestures, and document correctness is preserved.

---

## Final Phase: Validation and Close-Out

**Purpose**: Validate the finished architecture and document the outcome.

- [ ] T021 [US4] Run the manual quickstart in `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/quickstart.md` and record any final notes in `/Users/stevenyi/work/blue-electron/specs/024-bsb-performance/research.md`
- [ ] T022 [P] [US4] Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [ ] T023 [P] [US4] Run `pnpm --filter @blue/app build` from `/Users/stevenyi/work/blue-electron`
- [ ] T024 [P] [US4] Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [ ] T025 [P] [US4] Run `git diff --check` from `/Users/stevenyi/work/blue-electron`
- [ ] T026 [US4] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with Spec 024 progress and the resolved performance findings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies.
- **Phase 2**: Depends on Phase 1 test harness setup.
- **Phase 3**: Depends on the Phase 2 transport contract.
- **Phase 4**: Depends on Phase 3 structural sharing.
- **Phase 5**: Depends on Phase 2 transport foundation and should be validated against Phase 3-4 isolation work.
- **Final Phase**: Depends on the intended implementation scope being complete.

### User Story Dependencies

- **US1** depends on the transport foundation and store scheduling work.
- **US2** depends on structural sharing before memoization can pay off.
- **US3** is foundational for the whole feature.
- **US4** depends on all implementation work.

### Parallel Opportunities

- T002-T004 can be prepared in parallel.
- T006 and T008 can run in parallel after T005.
- T010 and T011 can run in parallel once the structural-sharing direction is implemented.
- T014 and T015 can run in parallel after T013.
- T018 and T019 can run in parallel once realtime transport types exist.

## Implementation Strategy

### MVP First

1. Land the transport foundation that removes success-path snapshot echo.
2. Land structural sharing for single-widget edits.
3. Verify render isolation before touching memoization.

### Incremental Delivery

1. Add realtime transport for value-bearing widgets.
2. Stabilize widget props and memo boundaries.
3. Finish with profiling and failure-recovery validation.