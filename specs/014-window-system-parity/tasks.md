# Tasks: Window System Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/spec.md`, `/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/quickstart.md`

**Tests**: Include targeted Vitest coverage and final renderer verification because `/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/plan.md` explicitly calls for `pnpm --filter @blue/app test`, focused auxiliary-layout coverage, and `pnpm --filter @blue/app build`.

**Organization**: Tasks are grouped by user story so the parity slice can be implemented and validated incrementally.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in every task description

## Phase 1: Setup (Shared Parity Scaffolding)

**Purpose**: Prepare the existing workbench prototype for the 014 parity slice.

- [X] T001 Align the 014 prototype group IDs, layout version, and parity constants in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [X] T002 [P] Extend prototype panel metadata for the parity slice in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panel-registry.ts`
- [X] T003 [P] Add shared parity fixtures and helper scaffolding in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared state model and shell integration that every user story depends on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Replace the simplified auxiliary layout types with `AuxiliaryGroupSession`, `MinimizedTabState`, and `WorkbenchParityLayout` support in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [X] T005 Refactor the parity-aware auxiliary session store and reveal intent handling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [X] T006 Update dockview lifecycle wiring, saved-layout loading, and parity-session synchronization in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
- [X] T007 [P] Add shared session parsing, bounds-clamping, and canonical-panel invariant coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts`
- [X] T008 [P] Add shared parity shell tokens and edge-presentation scaffolding in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`

**Checkpoint**: The workbench has a parity-aware state model, dockview wiring, and shared validation scaffolding.

---

## Phase 3: User Story 1 - Minimize Groups To Edge Tabs (Priority: P1) 🎯 MVP

**Goal**: Allow prototype auxiliary groups to minimize into visible edge tabs and reopen directly into floating, resizable tool windows.

**Independent Test**: Minimize the right-edge and bottom-edge prototype groups, confirm ordered edge tabs remain visible, then activate a minimized tab and confirm the correct panel opens floating and resizable without duplication.

- [X] T009 [US1] Implement docked-to-minimized transitions, remembered active-tab ordering, and minimized tab records in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [X] T010 [US1] Implement minimize actions and minimized-tab activation flows in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [X] T011 [P] [US1] Rework minimized edge-tab rendering and edge-specific interaction controls in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx`
- [X] T012 [P] [US1] Add minimized edge-tab and floating-entry styling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`
- [X] T013 [US1] Wire `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx` to remove docked groups on minimize and reopen minimized tabs as dockview floating groups
- [X] T014 [US1] Add minimize-to-floating regression coverage for the prototype right and bottom groups in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts`

**Checkpoint**: User Story 1 is complete when minimized prototype groups remain visible as edge tabs and reopen correctly as floating, resizable tool windows.

---

## Phase 4: User Story 2 - Maximize And Restore Auxiliary Groups (Priority: P1)

**Goal**: Allow prototype auxiliary groups to maximize into a top-tab presentation and restore back to their home edge without losing identity.

**Independent Test**: Maximize a prototype auxiliary group, confirm it presents with top tabs like the main editor area, then restore it back to its prior docked edge with the same active tab and no duplicate panel instances.

- [X] T015 [US2] Implement maximized presentation helpers, header-position swaps, and docked restore metadata in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [X] T016 [US2] Implement maximize and restore actions that preserve prior edge placement in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [X] T017 [P] [US2] Expose maximize and restore controls for auxiliary groups in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [X] T018 [P] [US2] Add top-tab maximized auxiliary presentation styling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`
- [X] T019 [US2] Wire dockview maximize and exit-maximized flows with edge restore behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
- [X] T020 [US2] Add maximize-and-restore regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts`

**Checkpoint**: User Story 2 is complete when prototype auxiliary groups maximize into a top-tab presentation and restore cleanly to their home edge.

---

## Phase 5: User Story 3 - Persist And Reveal The Correct Presentation State (Priority: P2)

**Goal**: Persist minimized, floating, and maximized state across reloads and route stable-ID reveal to the correct existing presentation.

**Independent Test**: Save a mixed minimized/floating/maximized layout, reload the workbench, and confirm `WindowMenu` reveal focuses or transitions the existing presentation instead of creating duplicates.

- [X] T021 [US3] Extend the persisted layout envelope with minimized metadata, floating bounds, and restore versioning in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [X] T022 [US3] Reconcile `fromJSON()` results, clamp restored floating bounds, and route stable-ID reveal to existing presentations in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [X] T023 [P] [US3] Update parity-aware reveal routing for prototype auxiliary panels in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`
- [X] T024 [US3] Rebuild minimized tabs, floating groups, and maximized state after layout restore in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
- [X] T025 [US3] Add persistence-and-reveal regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts`

**Checkpoint**: User Story 3 is complete when saved layouts restore valid presentation state and stable-ID reveal always reuses the current logical group.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish validation, cleanup, and implementation handoff for the parity slice.

- [X] T026 [P] Clean up parity-specific edge rendering and dead prototype-only branches in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`
- [X] T027 [P] Record completed 014 validation flows and remaining follow-on gaps in `/Users/stevenyi/work/blue-electron/specs/014-window-system-parity/quickstart.md` and `/Users/stevenyi/work/blue-electron/STATUS.md`
- [X] T028 Run parity verification through `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/package.json` using `pnpm --filter @blue/app test` and `pnpm --filter @blue/app build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion
- **User Story 3 (Phase 5)**: Depends on User Stories 1 and 2 because persistence and reveal must cover minimized, floating, and maximized states
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; defines minimize-to-floating parity behavior
- **User Story 2 (P1)**: Starts after Foundational; defines maximize-and-restore parity behavior
- **User Story 3 (P2)**: Starts after US1 and US2; depends on the full presentation-state model

### Parallel Opportunities

- Phase 1: `T002` and `T003` can run in parallel after `T001`
- Phase 2: `T007` and `T008` can run in parallel after `T006`
- User Story 1: `T011` and `T012` can run in parallel after `T010`
- User Story 2: `T017` and `T018` can run in parallel after `T016`
- User Story 3: `T023` can run in parallel with `T024` after `T022`
- Phase 6: `T026` and `T027` can run in parallel before `T028`

---

## Parallel Example: User Story 1

```bash
Task: "Rework minimized edge-tab rendering and edge-specific interaction controls in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx"
Task: "Add minimized edge-tab and floating-entry styling in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css"
```

## Parallel Example: User Story 2

```bash
Task: "Expose maximize and restore controls for auxiliary groups in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx"
Task: "Add top-tab maximized auxiliary presentation styling in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css"
```

## Parallel Example: User Story 3

```bash
Task: "Update parity-aware reveal routing for prototype auxiliary panels in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx"
Task: "Rebuild minimized tabs, floating groups, and maximized state after layout restore in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational parity state model
3. Complete Phase 3: User Story 1
4. Stop and validate the minimize-to-floating parity flow before layering maximize/restore and persistence

### Incremental Delivery

1. Finish Setup + Foundational to establish the parity-aware state model
2. Add User Story 1 and validate minimized edge tabs plus floating reopen
3. Add User Story 2 and validate maximized top-tab restore flows
4. Add User Story 3 and validate persistence plus stable-ID reveal
5. Finish Polish and final renderer verification

### Recommended Execution Order For This Feature

1. Build the parity-aware group session model and shell wiring
2. Deliver minimized edge tabs and floating reopen
3. Deliver maximize and restore into top-tab presentation
4. Deliver persistence and reveal correctness across all states
5. Run parity verification and update the status handoff

---

## Notes

- `[P]` tasks are limited to different files with no dependency on incomplete work
- The recommended MVP is User Story 1 because it closes the most visible NetBeans parity gap first
- User Stories 1 and 2 are both P1 and can be staffed separately after Foundational, but both rely on the same core state model and should merge carefully
