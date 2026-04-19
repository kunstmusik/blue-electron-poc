# Tasks: Collapsed Sidebar Group Research

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/plan.md`, `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/spec.md`, `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md`, `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/quickstart.md`

**Tests**: No automated tests are required for this docs-only research feature. Validation is done by checking the generated research package against the success criteria and independent test criteria in the spec.

**Organization**: Tasks are grouped by user story so the collapsed-sidebar research can be completed incrementally and handed off cleanly.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in every task description

## Phase 1: Setup (Shared Research Scaffolding)

**Purpose**: Ensure the 013 research docs are shaped for the main comparison and recommendation pass.

- [ ] T001 Align the execution scope, artifact list, and doc-only constraints in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/plan.md`
- [ ] T002 [P] Prepare the behavior-baseline and comparison sections in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md`
- [ ] T003 [P] Prepare the auxiliary-group, persistence, and assessment sections in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/data-model.md`
- [ ] T004 [P] Prepare the prototype-order and validation sections in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/quickstart.md`

---

## Phase 2: Foundational (Blocking Research Baseline)

**Purpose**: Build the shared current-state baseline before any user-story-specific conclusions are written.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T005 Audit the current dockview shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx` and record the right-edge and bottom-edge baseline in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md`
- [ ] T006 [P] Audit the panel inventory in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panel-registry.ts` and map candidate auxiliary groups in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/data-model.md`
- [ ] T007 [P] Audit open/focus and persistence touchpoints in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`, then capture current reveal-flow constraints in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/quickstart.md`
- [ ] T008 Capture the Java collapsed-sidebar reference behavior from the supplied screenshots and any supporting Java notes, then define the shared evaluation checklist in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md`

**Checkpoint**: The current `blue-electron` shell baseline and the Java target behavior baseline are both documented and can be used consistently by all user stories.

---

## Phase 3: User Story 1 - Define The Target Sidebar Behavior (Priority: P1) 🎯 MVP

**Goal**: Produce a documented behavior baseline for collapsed properties and output groups.

**Independent Test**: A maintainer can read the generated docs and find explicit reveal, hide, focus, persistence, sizing, and interaction rules for collapsed auxiliary groups without needing to infer them from code.

- [ ] T009 [US1] Document the target right-edge and bottom-edge collapsed-group behaviors in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md`
- [ ] T010 [P] [US1] Map `AuxiliaryGroupDefinition` and `CollapsedHandleState` entries for properties and output groups in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/data-model.md`
- [ ] T011 [P] [US1] Add the reveal, focus, persistence, and edge-conflict validation checklist to `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/quickstart.md`
- [ ] T012 [US1] Reconcile programmatic reveal, grouped navigation, sizing, and limited-edge-space rules back into `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md`

**Checkpoint**: User Story 1 is complete when the behavior baseline is explicit and independently reviewable.

---

## Phase 4: User Story 2 - Compare Viable Approaches For Collapsed Groups (Priority: P1)

**Goal**: Evaluate the dockview-only, paneview-primary, and custom-wrapper directions against one shared rubric.

**Independent Test**: A maintainer can compare the candidate approaches and see direct-support, partial-support, and custom-work-required classifications for each mandatory collapsed-group behavior.

- [ ] T013 [US2] Evaluate the dockview-only grouped-sidebar direction against the shared checklist in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md`
- [ ] T014 [P] [US2] Record `ApproachAssessment` and `CollapsePersistenceSnapshot` implications for the candidate approaches in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/data-model.md`
- [ ] T015 [P] [US2] Update `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/quickstart.md` with candidate-specific validation checkpoints for dockview-only, paneview-primary, and custom-wrapper experiments
- [ ] T016 [US2] Consolidate the final comparison matrix for dockview-only, paneview-primary, and dockview-backed custom-wrapper behavior in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md`

**Checkpoint**: User Story 2 is complete when the approach comparison is decision-grade and uses one consistent rubric.

---

## Phase 5: User Story 3 - Produce A Decision-Ready Recommendation (Priority: P2)

**Goal**: Select a preferred direction, fallback, and bounded prototype slice for the next implementation step.

**Independent Test**: A project lead can read the output and identify one preferred direction, one fallback, accepted compromises, and a small prototype scope with clear validation criteria.

- [ ] T017 [US3] Select the preferred direction, fallback, accepted gaps, and rationale in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md`
- [ ] T018 [P] [US3] Define the bounded prototype slice, files-to-touch, and validation order in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/quickstart.md`
- [ ] T019 [P] [US3] Sync the final recommendation, constraints, and prototype assumptions in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/plan.md`
- [ ] T020 [US3] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with the collapsed-sidebar recommendation and next-step implementation handoff

**Checkpoint**: User Story 3 is complete when the recommendation package is ready to hand off into implementation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency and requirements validation across the finished research package.

- [ ] T021 Validate `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md` against the acceptance scenarios and success criteria in `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/spec.md`
- [ ] T022 [P] Refresh `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/checklists/requirements.md` if wording or scope changed during the completed research pass
- [ ] T023 Perform a cross-artifact consistency pass across `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/plan.md`, `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/research.md`, `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/data-model.md`, and `/Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/quickstart.md`
- [ ] T024 Ensure `/Users/stevenyi/work/blue-electron/STATUS.md` contains only the final 013 recommendation and next prototype handoff, with stale exploratory notes removed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user-story work
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 because the comparison consumes the documented behavior baseline
- **User Story 3 (Phase 5)**: Depends on User Story 2 because the recommendation consumes the completed comparison
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; defines the behavior baseline
- **User Story 2 (P1)**: Starts after User Story 1; compares approaches against the approved baseline
- **User Story 3 (P2)**: Starts after User Story 2; converts the comparison into a decision-ready recommendation and prototype slice

### Parallel Opportunities

- Phase 1: `T002`, `T003`, and `T004` can run in parallel
- Phase 2: `T006` and `T007` can run in parallel after `T005`
- User Story 1: `T010` and `T011` can run in parallel after `T009`
- User Story 2: `T014` and `T015` can run in parallel after `T013`
- User Story 3: `T018` and `T019` can run in parallel after `T017`
- Phase 6: `T022` can run in parallel with `T023`

---

## Parallel Example: User Story 1

```bash
Task: "Map AuxiliaryGroupDefinition and CollapsedHandleState entries in /Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/data-model.md"
Task: "Add the reveal, focus, persistence, and edge-conflict validation checklist to /Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/quickstart.md"
```

## Parallel Example: User Story 2

```bash
Task: "Record ApproachAssessment and CollapsePersistenceSnapshot implications in /Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/data-model.md"
Task: "Update /Users/stevenyi/work/blue-electron/specs/013-collapsed-sidebar-research/quickstart.md with candidate-specific validation checkpoints"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational baseline
3. Complete Phase 3: User Story 1
4. Stop and validate that the target collapsed-sidebar behavior is fully documented before evaluating approaches

### Incremental Delivery

1. Finish Setup + Foundational to establish the current-state and Java-side baselines
2. Complete User Story 1 to lock the target behavior
3. Complete User Story 2 to compare the candidate approaches against that behavior
4. Complete User Story 3 to choose the preferred direction and define the prototype slice
5. Finish Phase 6 to validate the docs package and hand it off cleanly

### Recommended Execution Order For This Feature

1. Baseline the existing shell and the Java screenshots
2. Define the expected collapsed-group behavior
3. Compare dockview-only, paneview-primary, and custom-wrapper directions
4. Choose the preferred path and bounded prototype
5. Validate the finished research package against the spec

---

## Notes

- `[P]` tasks are limited to work that targets different output files and can proceed without conflicting edits
- This feature is intentionally docs-first; the tasks stop at a recommendation and prototype handoff rather than implementing the sidebar behavior itself
- The recommended MVP is User Story 1 because the comparison and recommendation are only meaningful after the behavior baseline is explicit
