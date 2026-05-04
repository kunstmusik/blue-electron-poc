# Tasks: Score Editor Foundation

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required by FR-010 and by the constitution's serialization and snapshot-parity rules. Add score `TimeState` and score-shell contract coverage before or alongside the implementation they validate.

**Organization**: Tasks are grouped by user story so each score-shell milestone can be implemented and validated independently after the foundational score bridge is complete.

## Phase 1: Setup (Shared Context)

**Purpose**: Confirm the Java parity anchors and the exact TypeScript seams before code changes begin.

- [ ] T001 Review the Java score shell and path-controller anchors documented in `/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/research.md`
- [ ] T002 [P] Inventory current TypeScript score and time seams in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-state.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/poly-object.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-layer-group.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/patterns/patterns-layer-group.ts`
- [ ] T003 [P] Inventory current snapshot and optimistic patch seams in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [ ] T004 [P] Inventory current workbench routing and placeholder score behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish canonical score-shell data, score `TimeState` parity, and the shared snapshot/patch contract that every story depends on.

**Critical**: No user story work should begin until this phase is complete.

### Tests

- [ ] T005 [P] Add Java-compatible score `TimeState` round-trip coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-state.test.ts`
- [ ] T006 [P] Add shared score snapshot and `ScorePatch` contract tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-contract.test.ts`
- [ ] T007 [P] Add score panel routing regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

### Implementation

- [ ] T008 Add Java-compatible snap value definitions and exports in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/snap-value.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/index.ts`
- [ ] T009 Expand `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-state.ts` to support snap state, time display, secondary ruler, row visibility, zoom iterations, and Java-compatible XML round-trip
- [ ] T010 Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` with `ScoreTimeStateSnapshot`, marker snapshots, score layer-group snapshots, and `ScorePatch`
- [ ] T011 Implement score snapshot creation helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` from canonical `BlueData.getScore()` and `BlueData.getMarkersList()`
- [ ] T012 Implement `ScorePatch.updateTimeState` application in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [ ] T013 Update empty snapshot creation and empty-patch detection for `score` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [ ] T014 Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts` to store the new `score` snapshot and dispatch `score` patches

**Checkpoint**: Canonical score-shell snapshot data and score `TimeState` updates are ready for the renderer shell.

---

## Phase 3: User Story 1 - View The Real Score Timeline (Priority: P1) 🎯 MVP

**Goal**: Replace the `ScoreTopComponent` placeholder with a real Java-style score shell that renders mixed root layer-group rows.

**Independent Test**: Load a representative project containing `PolyObject`, `AudioLayerGroup`, and `PatternsLayerGroup` content, open `ScoreTopComponent`, and confirm the panel renders real mixed score rows instead of placeholder content.

### Tests for User Story 1

- [ ] T015 [P] [US1] Add score shell rendering tests for mixed root layer groups in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-panel.test.tsx`
- [ ] T016 [P] [US1] Add score panel open or focus regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-store.test.ts`

### Implementation for User Story 1

- [ ] T017 [US1] Route `ScoreTopComponent` to a real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [ ] T018 [US1] Implement the main score shell panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- [ ] T019 [US1] Add score shell snapshot types and selectors in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/types.ts`
- [ ] T020 [US1] Implement the top score-path bar and shell controls in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScorePathBar.tsx`
- [ ] T021 [US1] Implement the mixed layer-group timeline stack in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScoreTimelineShell.tsx`
- [ ] T022 [P] [US1] Implement `PolyObject` timeline and header rendering in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/PolyObjectTimeline.tsx`
- [ ] T023 [P] [US1] Implement audio-layer timeline and header rendering in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/AudioLayerGroupTimeline.tsx`
- [ ] T024 [P] [US1] Implement pattern-layer timeline and header rendering in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/PatternsLayerGroupTimeline.tsx`
- [ ] T025 [US1] Add explicit empty and unsupported score-shell states in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScoreTimelineShell.tsx`
- [ ] T026 [US1] Add score shell styling consistent with the workbench in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles.css`

**Checkpoint**: `ScoreTopComponent` is independently usable as a real shell for mixed root score content.

---

## Phase 4: User Story 2 - Use Rulers And Timeline State (Priority: P1)

**Goal**: Render Java-style ruler and row stacks and persist supported score time-state changes through the canonical document.

**Independent Test**: Open the score panel, change supported row visibility or ruler settings, adjust snap or zoom, reload the project, and confirm the same score-shell state is restored.

### Tests for User Story 2

- [ ] T027 [P] [US2] Add ruler and row-visibility rendering tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-rulers.test.tsx`
- [ ] T028 [P] [US2] Add score time-state patch and reload coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-contract.test.ts`

### Implementation for User Story 2

- [ ] T029 [US2] Implement the ruler and row stack surface in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScoreRulerStack.tsx`
- [ ] T030 [US2] Implement score time formatting helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/score-time-format.ts`
- [ ] T031 [US2] Wire score time-state controls and patch dispatch in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [ ] T032 [US2] Render tempo, meter, and marker rows from canonical transport plus score state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScoreRulerStack.tsx`
- [ ] T033 [US2] Implement primary or secondary ruler display and row-visibility behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScoreRulerStack.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- [ ] T034 [US2] Persist supported score time-state changes through canonical `BlueData` round-trip in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-state.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`

**Checkpoint**: Rulers, row visibility, snap state, and zoom state are independently testable and survive reload.

---

## Phase 5: User Story 3 - Navigate Nested Score Paths (Priority: P2)

**Goal**: Support nested `PolyObject` path traversal with per-path scroll restoration.

**Independent Test**: Enter a nested `PolyObject`, scroll inside it, return to root, re-enter the same nested path, and confirm the prior scroll context is restored safely.

### Tests for User Story 3

- [ ] T035 [P] [US3] Add nested path navigation and scroll-restoration tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-path-navigation.test.tsx`
- [ ] T036 [P] [US3] Add nested score-shell regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-panel.test.tsx`

### Implementation for User Story 3

- [ ] T037 [US3] Implement renderer-local score path session state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/useScorePathState.ts`
- [ ] T038 [US3] Wire `PolyObject` open or back navigation through `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScorePathBar.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScoreTimelineShell.tsx`
- [ ] T039 [US3] Preserve and restore per-path scroll positions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScoreTimelineShell.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/useScorePathState.ts`
- [ ] T040 [US3] Add invalid or removed path fallback behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/useScorePathState.ts`

**Checkpoint**: Nested score-path navigation behaves independently and does not require the later auxiliary score-editor specs.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and handoff preparation after implementation.

- [ ] T041 [P] Update `/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/quickstart.md` with any implementation-specific validation notes discovered during development
- [ ] T042 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with Spec 036 implementation progress, validation results, and any remaining deferrals
- [ ] T043 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [ ] T044 Run `pnpm --filter @blue/data build` from `/Users/stevenyi/work/blue-electron`
- [ ] T045 Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [ ] T046 Run `pnpm --filter @blue/app build:main` from `/Users/stevenyi/work/blue-electron`
- [ ] T047 Run `pnpm --filter @blue/app build:preload` from `/Users/stevenyi/work/blue-electron`
- [ ] T048 Run `pnpm --filter @blue/app build:renderer` from `/Users/stevenyi/work/blue-electron`
- [ ] T049 Run `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` from `/Users/stevenyi/work/blue-electron`
- [ ] T050 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`
- [ ] T051 Perform the manual score shell, ruler, and nested path scenarios from `/Users/stevenyi/work/blue-electron/specs/036-score-editor-foundation/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP for this slice.
- **User Story 2 (Phase 4)**: Depends on Foundational and builds on the real score shell from US1.
- **User Story 3 (Phase 5)**: Depends on US1 because nested path navigation requires the score shell, and benefits from US2 because path transitions must preserve the current ruler stack cleanly.
- **Polish (Phase 6)**: Depends on the selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundational.
- **US2 (P1)**: Depends on the foundational score bridge and on the real shell from US1.
- **US3 (P2)**: Depends on US1 and should follow US2 so nested navigation uses the finished shell and ruler stack.

### Parallel Opportunities

- Setup inventory tasks T002-T004 can run in parallel.
- Foundational tests T005-T007 can run in parallel.
- US1 renderer row components T022-T024 can run in parallel after the shell types exist.
- US2 tests T027-T028 can run in parallel.
- US3 tests T035-T036 can run in parallel.
- Polish documentation tasks T041-T042 can run in parallel.

## Parallel Example: Foundational Phase

```text
Task: "Add Java-compatible score TimeState round-trip coverage in packages/blue-data/src/time/time-state.test.ts"
Task: "Add shared score snapshot and ScorePatch contract tests in packages/blue-app/src/renderer/tests/score-contract.test.ts"
Task: "Add score panel routing regression coverage in packages/blue-app/src/renderer/tests/project-editor-panels.test.ts"
```

## Parallel Example: User Story 1

```text
Task: "Implement PolyObject timeline and header rendering in packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/PolyObjectTimeline.tsx"
Task: "Implement audio-layer timeline and header rendering in packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/AudioLayerGroupTimeline.tsx"
Task: "Implement pattern-layer timeline and header rendering in packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/PatternsLayerGroupTimeline.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Validate that `ScoreTopComponent` is no longer a placeholder and that mixed root score rows render correctly.
4. Stop and review before extending into full ruler-state parity and nested navigation.

### Incremental Delivery

1. Land canonical score snapshot and score `TimeState` support.
2. Land the real score shell for mixed root score content.
3. Land ruler and row-visibility parity.
4. Land nested score-path navigation and final validation.

### Handoff Notes

- Keep auxiliary score-editor surfaces and direct manipulation out of this slice; they belong to Specs 037 and 038.
- Use the Java score shell and `TimeState` classes listed in `research.md` as the parity source whenever behavior is unclear.
- Keep nested score-path session state local to the renderer; do not persist it in the project document.
- Keep `.specify/feature.json` aligned to `specs/036-score-editor-foundation` while this branch is active so spec-kit scripts resolve the correct directory.
