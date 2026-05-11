# Tasks: Sound Score Object Editor Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/039-sound-score-object-editor/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  

**Tests**: Tests are required by FR-009. Add contract, renderer, and preview-flow coverage before or alongside the implementation it protects.

## Phase 1: Setup

- [ ] T001 Review the Java Blue `SoundEditor` tab order, toolbar actions, and child panels documented in `research.md`
- [ ] T002 [P] Inventory reusable BSB interface seams from Specs 022 and 023
- [ ] T003 [P] Inventory the current `SoundObjectEditor.tsx` placeholder, existing preview-test IPC seams, and the `@blue/data` automation model

## Phase 2: Foundational Contract Work

- [ ] T004 [P] Add shared contract tests for `SoundEditorSnapshot`, automation payloads, and supported patch shapes
- [ ] T005 Extend the score-object editor document union in `packages/blue-app/src/shared/project-editor.ts` with dedicated `Sound` snapshot types
- [ ] T006 Build `Sound` editor-document helpers that map Java Interface, Automation, and Comments tabs to renderer-facing subdocuments
- [ ] T007 Extend canonical `updateTypeSpecificEditor` handling for `Sound` comment, BSB, and automation mutations
- [ ] T008 Add removed-target fallback coverage for the new `Sound` payload in renderer and main-process tests

## Phase 3: User Story 1 - Interface And Comments (P1)

- [ ] T009 [P] [US1] Add renderer tests for tab-shell routing and comment editing
- [ ] T010 [P] [US1] Add renderer tests proving the existing BSB surface can be embedded inside the score-object editor shell
- [ ] T011 [US1] Document which Java `SoundEditor` tab state stays renderer-local versus canonical before implementing the new shell
- [ ] T012 [US1] Implement the tab strip, per-tab empty states, and shell-level tab restoration for `Sound`
- [ ] T013 [US1] Reuse the BSB interface canvas, property, and preset surfaces for the `Sound` Interface tab
- [ ] T014 [US1] Replace the current comment-only `SoundObjectEditor.tsx` flow with the new Interface and Comments workflow

## Phase 4: User Story 2 - Automation (P1)

- [ ] T015 [P] [US2] Add renderer tests for automation parameter selection and line-editing behavior
- [ ] T016 [P] [US2] Add mutation tests for automation enablement and supported line updates
- [ ] T017 [US2] Map Java `AutomationPanel`, `TimeBar`, and line-selector behavior into the TypeScript document shape and UI plan
- [ ] T018 [US2] Implement the automation parameter selector plus supported line-editing surface, with explicit deferred-state boundaries where needed
- [ ] T019 [US2] Wire automation edits through canonical score patches and refresh the active editor document coherently

## Phase 5: User Story 3 - Test Preview (P2)

- [ ] T020 [P] [US3] Add renderer and main-process tests for the `Sound` test-preview flow
- [ ] T021 [US3] Implement the `Sound` editor test action and result modal using the existing `External` preview pattern as the base seam
- [ ] T022 [US3] Surface explicit deferred or unsupported messaging for any `Sound` subfeatures not implemented in this slice

## Phase 6: Polish & Validation

- [ ] T023 [P] Update `quickstart.md` with any implementation-specific notes
- [ ] T024 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with the planning or implementation handoff state for Spec 039
- [ ] T025 Run `pnpm --filter @blue/app test`
- [ ] T026 Run `pnpm --filter @blue/app build:renderer`
- [ ] T027 Run `git diff --check`
- [ ] T028 Perform the manual `Sound` validation scenarios from `quickstart.md`

## Handoff Notes

- Reuse the earlier BSB infrastructure instead of creating a second widget system inside the score-object editor shell.
- Keep automation in this spec; it is part of Java `SoundEditor`, not part of the later shell-management slice.
- Keep unsupported `Sound` subfeatures explicit so the parity claim stays honest.
