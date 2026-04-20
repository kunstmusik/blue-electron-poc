# Tasks: Left Edge Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/spec.md`, `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/quickstart.md`, `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/contracts/auxiliary-edge-behavior.md`

**Tests**: Include targeted Vitest coverage and final renderer verification because `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/plan.md` explicitly calls for migration coverage, move/split/merge validation, `pnpm --filter @blue/app test`, and `pnpm --filter @blue/app build`.

**Organization**: Tasks are grouped by user story so left-edge parity can be implemented and validated incrementally.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in every task description

## Phase 1: Setup (Shared Left-Edge Scaffolding)

**Purpose**: Prepare the existing auxiliary parity slice for the left-edge follow-on work.

- [x] T001 Align spec 015 layout versioning, feature constants, and instance-model scaffolding in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [x] T002 [P] Extend shared fixture builders for seeded and derived auxiliary groups in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-store.test.ts`
- [x] T003 [P] Prepare shared left-edge move-control and reset-layout UI hooks in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryHeaderActions.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Replace the fixed-group auxiliary model with the instance-based model that all user stories depend on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T004 Replace fixed auxiliary sessions with seeded and derived group instances plus version 5 layout parsing in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [x] T005 Implement version 4 to version 5 layout migration, group-instance normalization, and canonical panel ownership invariants in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [x] T006 Refactor the auxiliary store to manage group-instance IDs, move intents, and reset-layout actions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [x] T007 Rework `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx` to render rails and slide-outs from instance-based auxiliary state while preserving one visible slide-out per edge
- [x] T008 [P] Extend prototype panel metadata and left-edge eligibility helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panel-registry.ts`
- [x] T009 [P] Add migration and canonical-ownership regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-store.test.ts`

**Checkpoint**: The workbench can persist seeded and derived auxiliary group instances without snapping custom edges back to the default seeded layout.

---

## Phase 3: User Story 1 - Move Tools To The Left Edge (Priority: P1) 🎯 MVP

**Goal**: Let users move whole auxiliary groups or individual prototype tools to the left edge and minimize them there without duplicating stable panel IDs.

**Independent Test**: Start from the default layout, move a whole prototype group to the left edge, then move one tool out of a multi-tool seeded group to the left edge and verify left-edge minimize and slide-out behavior works in both cases.

- [x] T010 [US1] Implement whole-group edge reassignment and singleton split creation for left-edge moves in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [x] T011 [US1] Add store actions for move-group and move-panel edge transitions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [x] T012 [P] [US1] Add explicit move-to-left, move-to-right, and move-to-bottom actions for docked auxiliary groups in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryHeaderActions.tsx`
- [x] T013 [P] [US1] Add move-to-edge controls for slid-out tools in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx`
- [x] T014 [P] [US1] Add left-edge move-control and singleton-group styling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`
- [x] T015 [US1] Wire `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx` to pass move actions into auxiliary header and slide-out controls
- [x] T016 [US1] Add left-edge whole-group and single-tool split regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts`

**Checkpoint**: User Story 1 is complete when users can move whole prototype groups or single prototype tools to the left edge and use normal left-edge minimize and slide-out behavior there.

---

## Phase 4: User Story 2 - Keep Defaults Unchanged While Restoring Custom Left Layouts (Priority: P1)

**Goal**: Preserve zero seeded left-edge tools in fresh/reset layouts while restoring saved custom left-edge placements when they exist.

**Independent Test**: Verify that a fresh or reset layout seeds no left-edge tools, then save a layout with custom left-edge placements and confirm those placements restore after reload.

- [x] T017 [US2] Implement reset-to-default seeding and custom-left-layout restore helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [x] T018 [US2] Persist custom left-edge group instances and add reset-layout handling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [x] T019 [P] [US2] Expose reset-layout and custom-placement-aware presentation actions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`
- [x] T020 [P] [US2] Wire `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx` to clear saved custom left-edge placements during reset and reseed the default layout cleanly
- [x] T021 [US2] Add fresh/reset default-layout and saved-left-layout restore coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-store.test.ts`
- [x] T022 [US2] Add persisted custom-left-layout restore coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts`

**Checkpoint**: User Story 2 is complete when fresh/reset layouts seed no left-edge tools and saved custom left-edge placements restore correctly.

---

## Phase 5: User Story 3 - Use Left-Edge Actions Consistently (Priority: P2)

**Goal**: Make dock, restore, maximize, hide, merge-back, and reveal behavior consistent on the left edge with the accepted right/bottom parity flows.

**Independent Test**: Use a left-edge group and a left-edge singleton tool to verify hide-on-repeat-click, dock-single-tool, restore-group, merge-back to the seeded sibling edge, maximize, and Window-menu reveal all reuse the existing presentation without duplication.

- [x] T023 [US3] Implement merge-back, left-edge restore-group, and reveal invariants for seeded and derived groups in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- [x] T024 [US3] Route dock-single-tool, restore-group, maximize, and stable-ID reveal flows for left-edge group instances in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [x] T025 [P] [US3] Update left-edge group restore controls for mixed seeded and derived groups in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx`
- [x] T026 [P] [US3] Update left-edge presentation badges and reveal affordances in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`
- [x] T027 [US3] Add left-edge dock, restore, merge-back, maximize, and reveal regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts`

**Checkpoint**: User Story 3 is complete when left-edge groups and singleton tools behave consistently with the accepted right-edge and bottom-edge parity rules.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish validation and handoff for the left-edge parity slice.

- [x] T028 [P] Record completed 015 validation flows and remaining follow-on gaps in `/Users/stevenyi/work/blue-electron/specs/015-left-edge-parity/quickstart.md` and `/Users/stevenyi/work/blue-electron/STATUS.md`
- [x] T029 Run renderer verification through `/Users/stevenyi/work/blue-electron/packages/blue-app/package.json` using `pnpm --filter @blue/app test` and `pnpm --filter @blue/app build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 because restored custom left-edge layouts require completed move-to-left behavior
- **User Story 3 (Phase 5)**: Depends on User Story 1 and can proceed once left-edge groups and singleton moves exist
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: First deliverable; establishes left-edge group moves and single-tool splits
- **User Story 2 (P1)**: Builds on US1 to preserve defaults while restoring custom left-edge placements
- **User Story 3 (P2)**: Builds on US1 to finalize dock/restore/maximize/reveal consistency for left-edge groups

### Parallel Opportunities

- Phase 1: `T002` and `T003` can run in parallel after `T001`
- Phase 2: `T008` and `T009` can run in parallel after `T007`
- User Story 1: `T012`, `T013`, and `T014` can run in parallel after `T011`
- User Story 2: `T019` and `T020` can run in parallel after `T018`
- User Story 3: `T025` and `T026` can run in parallel after `T024`
- Phase 6: `T028` can run before `T029`

---

## Parallel Example: User Story 1

```bash
Task: "Add explicit move-to-left, move-to-right, and move-to-bottom actions for docked auxiliary groups in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryHeaderActions.tsx"
Task: "Add move-to-edge controls for slid-out tools in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx"
Task: "Add left-edge move-control and singleton-group styling in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css"
```

## Parallel Example: User Story 2

```bash
Task: "Expose reset-layout and custom-placement-aware presentation actions in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx"
Task: "Wire /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx to clear saved custom left-edge placements during reset and reseed the default layout cleanly"
```

## Parallel Example: User Story 3

```bash
Task: "Update left-edge group restore controls for mixed seeded and derived groups in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx"
Task: "Update left-edge presentation badges and reveal affordances in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational instance-model migration
3. Complete Phase 3: User Story 1
4. Stop and validate whole-group left-edge moves and single-tool left-edge splits before layering persistence and consistency work

### Incremental Delivery

1. Build the version 5 instance-based auxiliary model and shell wiring
2. Deliver left-edge moves and singleton splits in User Story 1
3. Deliver reset/default preservation and restore behavior in User Story 2
4. Deliver left-edge consistency for dock/restore/maximize/reveal in User Story 3
5. Finish handoff docs and renderer verification in Polish

### Recommended Execution Order For This Feature

1. Replace the fixed auxiliary model with the version 5 instance model
2. Add explicit move-to-edge controls and left-edge group/singleton moves
3. Add reset/default preservation and saved custom-left restore behavior
4. Add merge-back and full left-edge parity for dock/restore/maximize/reveal
5. Run verification and update the handoff docs

---

## Notes

- `[P]` tasks are limited to different files with no dependency on incomplete work
- The recommended MVP is User Story 1 because it delivers the visible left-edge capability without waiting on persistence and reset work
- User Story 2 intentionally preserves the existing default seeded layout while adding restore support for saved custom left-edge placements
