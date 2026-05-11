# Tasks: JMask Score Object Editor Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/041-jmask-score-object-editor/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  

**Tests**: Tests are required by FR-008. Add contract, renderer, and nested-mutation coverage before or alongside the implementation it protects.

## Phase 1: Setup

- [ ] T001 Review the Java Blue `JMask` editor, parameter-stack, generator-factory, and optional-section anchors documented in `research.md`
- [ ] T002 [P] Inventory the current `JMaskEditor.tsx` placeholder, the `@blue/data` `JMask` model, and reusable renderer form or canvas components
- [ ] T003 [P] Catalog the generator, probability, and table-driven editor types that appear in the Java workflow and current fixtures

## Phase 2: Foundational Contract Work

- [ ] T004 [P] Add shared contract tests for `JMaskEditorSnapshot`, parameter-list payloads, and nested patch shapes
- [ ] T005 Extend the score-object editor document union in `packages/blue-app/src/shared/project-editor.ts` with dedicated `JMask` snapshot types
- [ ] T006 Define canonical mutation helpers for parameter-list operations, generator updates, and supported optional-section edits
- [ ] T007 Add removed-target fallback and unsupported-data preservation coverage for the new `JMask` payload in renderer and main-process tests

## Phase 3: User Story 1 - Parameter Stack (P1)

- [ ] T008 [P] [US1] Add renderer tests for the parameter-stack shell, add or remove controls, reorder workflow, and generator selector
- [ ] T009 [P] [US1] Add mutation tests for parameter-list operations and common generator edits
- [ ] T010 [US1] Map Java `EditorListPanel` and `JMaskEditorLayout` behavior into the React shell plan before implementation
- [ ] T011 [US1] Implement the top bar with seed controls, options, and any test entry point claimed by this slice
- [ ] T012 [US1] Implement the scrollable parameter stack, reorder controls, and expanded-row behavior
- [ ] T013 [US1] Implement generator selector routing and the common generator-editor factory surface

## Phase 4: User Story 2 - Optional Sections (P1)

- [ ] T014 [P] [US2] Add renderer tests for mask, quantizer, accumulator, and probability sub-editors
- [ ] T015 [P] [US2] Add mutation tests for optional-section toggles and nested edits
- [ ] T016 [US2] Implement mask, quantizer, and accumulator sub-editors with explicit deferred boundaries where needed
- [ ] T017 [US2] Implement probability editor routing and the supported distribution forms for this slice
- [ ] T018 [US2] Implement table-based visualization or explicit deferred messaging for table-driven editors claimed by this slice

## Phase 5: User Story 3 - Preview And Unsupported Data (P2)

- [ ] T019 [P] [US3] Add renderer and main-process tests for the `JMask` preview or test flow plus unsupported-data messaging
- [ ] T020 [US3] Implement the preview or test flow claimed by this slice for the selected `JMask` target
- [ ] T021 [US3] Implement explicit unsupported-data surfacing and preservation messaging in the editor shell

## Phase 6: Polish & Validation

- [ ] T022 [P] Update `quickstart.md` with any implementation-specific notes
- [ ] T023 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with the planning or implementation handoff state for Spec 041
- [ ] T024 Run `pnpm --filter @blue/app test`
- [ ] T025 Run `pnpm --filter @blue/app build:renderer`
- [ ] T026 Run `git diff --check`
- [ ] T027 Perform the manual `JMask` validation scenarios from `quickstart.md`

## Handoff Notes

- Keep unsupported `JMask` nested data explicit and reload-safe rather than flattening it into a shallow form.
- Do not claim generator or probability parity until the supported subset is documented concretely.
- Keep any preview behavior scoped to the selected `JMask` target and aligned with existing editor-side modal patterns.
