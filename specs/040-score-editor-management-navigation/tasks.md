# Tasks: Score Editor Management and Navigation

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  

**Tests**: Tests are required by FR-008. Add manager/navigation and playback-follow coverage before or alongside the implementation it protects.

## Phase 1: Setup

- [ ] T001 Review the Java Blue score manager, layer-group manager, navigator, markers, and playback-follow anchors documented in `research.md`
- [ ] T002 [P] Inventory the current score shell affordances in `packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- [ ] T003 [P] Inventory current score-related workbench panel routing and placeholder behavior

## Phase 2: Foundational Contract Work

- [ ] T004 [P] Add shared contract tests for any new score-management patch variants
- [ ] T005 [ ] Extend shared score patch helpers for supported manager operations
- [ ] T006 [ ] Define shell-local navigation/follow-state helpers where needed

## Phase 3: User Story 1 - Manage Workflow (P1)

- [ ] T007 [P] [US1] Add renderer tests for opening and using the `Manage` workflow
- [ ] T008 [P] [US1] Add canonical mutation tests for supported score-manager operations
- [ ] T009 [US1] Implement the shell `Manage` workflow entrypoint
- [ ] T010 [US1] Implement supported score-manager or layer-group-manager surfaces

## Phase 4: User Story 2 - Navigation Workflows (P1)

- [ ] T011 [P] [US2] Add renderer tests for marker-navigation behavior
- [ ] T012 [P] [US2] Add renderer tests for score navigator or overview behavior
- [ ] T013 [US2] Implement supported marker-navigation workflows
- [ ] T014 [US2] Implement a score navigator or overview surface and any required score-adjacent panel follow-up

## Phase 5: User Story 3 - Follow Playback & Polish (P2)

- [ ] T015 [P] [US3] Add renderer tests for follow-playback and pointer behavior
- [ ] T016 [P] [US3] Add score-adjacent panel routing tests for any placeholder replacements claimed by this slice
- [ ] T017 [US3] Implement score-shell follow-playback or pointer polish
- [ ] T018 [US3] Resolve or explicitly surface the remaining score-adjacent placeholder gaps in scope

## Phase 6: Polish & Validation

- [ ] T019 [P] Update `quickstart.md` with any implementation-specific notes
- [ ] T020 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with the planning or implementation handoff state for Spec 040
- [ ] T021 Run `pnpm --filter @blue/app test`
- [ ] T022 Run `pnpm --filter @blue/app build:renderer`
- [ ] T023 Run `git diff --check`
- [ ] T024 Perform the manual management/navigation validation scenarios from `quickstart.md`

## Handoff Notes

- Do not re-open already-landed direct manipulation behavior except for blocking regressions.
- Keep score-object editor work in Specs 038 and 039; this slice is for shell-level management/navigation only.
- Keep playback-follow logic local to the score shell when possible to avoid unnecessary shared-store churn.