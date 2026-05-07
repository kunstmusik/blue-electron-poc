# Tasks: Score Object Editor Tier 2 Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  

**Tests**: Tests are required by FR-008. Add contract and renderer coverage before or alongside the implementation it protects.

## Phase 1: Setup

- [ ] T001 Review the Java Blue `Sound`, `PianoRoll`, and `JMask` editor anchors documented in `research.md`
- [ ] T002 [P] Inventory reusable BSB and automation seams from Specs 022 and 023
- [ ] T003 [P] Inventory the current Spec 037 editor registry and document-loading seams

## Phase 2: Foundational Contract Work

- [ ] T004 [P] Add shared contract tests for the Tier 2 editor-document payloads
- [ ] T005 [ ] Extend the score-object editor document union in `packages/blue-app/src/shared/project-editor.ts`
- [ ] T006 [ ] Extend main-process editor-document builders for `Sound`, `PianoRoll`, and `JMask`
- [ ] T007 [ ] Extend canonical type-specific patch validation for Tier 2 payloads

## Phase 3: User Story 1 - Sound Editor (P1)

- [ ] T008 [P] [US1] Add renderer tests for `Sound` tab routing and supported edit flows
- [ ] T009 [P] [US1] Add mutation tests covering interface, automation, and comment updates
- [ ] T010 [US1] Implement `SoundScoreObjectEditor.tsx`
- [ ] T011 [US1] Integrate existing BSB and automation UI helpers into the score-object editor shell

## Phase 4: User Story 2 - PianoRoll Editor (P1)

- [ ] T012 [P] [US2] Add renderer tests for `PianoRoll` note canvas and view controls
- [ ] T013 [P] [US2] Add mutation tests for note-entry updates and removed-target fallback
- [ ] T014 [US2] Implement `PianoRollScoreObjectEditor.tsx`
- [ ] T015 [US2] Build `PianoRoll` editor-document payload helpers and canonical patch handling

## Phase 5: User Story 3 - JMask Editor (P2)

- [ ] T016 [P] [US3] Add renderer tests for generator and parameter rendering
- [ ] T017 [P] [US3] Add mutation tests for supported generator updates and unsupported preservation behavior
- [ ] T018 [US3] Implement `JMaskScoreObjectEditor.tsx`
- [ ] T019 [US3] Build `JMask` payload and canonical patch helpers

## Phase 6: Polish & Validation

- [ ] T020 [P] Update `quickstart.md` with any implementation-specific notes
- [ ] T021 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with the planning or implementation handoff state for Spec 039
- [ ] T022 Run `pnpm --filter @blue/app test`
- [ ] T023 Run `pnpm --filter @blue/app build:renderer`
- [ ] T024 Run `git diff --check`
- [ ] T025 Perform the manual Tier 2 validation scenarios from `quickstart.md`

## Handoff Notes

- Keep broader score-management/navigation out of this slice; that work belongs to the later score-management/navigation spec.
- Reuse earlier BSB infrastructure for `Sound` instead of creating a second widget/automation system.
- Keep unsupported Tier 2 subfeatures explicit so the parity claim stays honest.