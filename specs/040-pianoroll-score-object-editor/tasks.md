# Tasks: PianoRoll Score Object Editor Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/040-pianoroll-score-object-editor/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  

**Tests**: Tests are required by FR-008. Add contract, renderer, and mutation coverage before or alongside the implementation it protects.

## Phase 1: Setup

- [x] T001 Review the Java Blue `PianoRoll` editor, canvas, field-editor, and properties anchors documented in `research.md`
- [x] T002 [P] Inventory the current `PianoRollEditor.tsx` placeholder, Spec 036 score-canvas helpers, and existing shortcut infrastructure
- [x] T003 [P] Inventory the `@blue/data` `PianoRoll` note, field, and XML seams that the new editor must mutate

## Phase 2: Foundational Contract Work

- [x] T004 [P] Add shared contract tests for `PianoRollEditorSnapshot`, note-batch payloads, and property patch shapes
- [x] T005 Extend the score-object editor document union in `packages/blue-app/src/shared/project-editor.ts` with dedicated `PianoRoll` snapshot types
- [x] T006 Define canonical mutation helpers for note batches, field edits, and supported property updates
- [x] T007 Add removed-target fallback and reload coverage for the new `PianoRoll` payload in renderer and main-process tests

## Phase 3: User Story 1 - Note Canvas (P1)

- [x] T008 [P] [US1] Add renderer tests for ruler, pitch-header, and note-canvas rendering
- [x] T009 [P] [US1] Add renderer tests for add, move, resize, and marquee-selection interactions
- [x] T010 [US1] Map Java `NoteCanvasMouseListener` drag states and snapping rules into a TypeScript interaction plan before implementation
- [x] T011 [US1] Implement the `PianoRoll` canvas shell with ruler, pitch context, scrolling, and empty states
- [x] T012 [US1] Implement note rendering, selected-note highlighting, and marquee feedback
- [x] T013 [US1] Implement add, move, resize, and selection commits through batched canonical patches

## Phase 4: User Story 2 - Field Editor And Properties (P1)

- [x] T014 [P] [US2] Add renderer tests for the field editor, properties workflow, and note-template controls
- [x] T015 [P] [US2] Add mutation tests for field-value changes and supported property updates
- [x] T016 [US2] Map Java `FieldEditor` and `FieldEditorMouseListener` behavior into supported TypeScript edit boundaries
- [x] T017 [US2] Implement the field-editor surface and selected-note field editing workflow
- [x] T018 [US2] Implement the properties surface for scale settings, pitch-generation method, note template, and ruler config
- [x] T019 [US2] Wire property and field edits through canonical `PianoRoll` mutation helpers

## Phase 5: User Story 3 - Clipboard And Undo Expectations (P2)

- [x] T020 [P] [US3] Add renderer tests for copy, paste, delete, and any undo or redo behavior claimed by this slice
- [x] T021 [US3] Document Java `NoteCopyBuffer`, popup-menu, and undo expectations before finalizing the supported subset
- [x] T022 [US3] Implement the supported clipboard and shortcut flows, plus explicit deferred states for anything excluded from this slice

## Phase 6: Polish & Validation

- [x] T023 [P] Update `quickstart.md` with any implementation-specific notes
- [x] T024 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with the planning or implementation handoff state for Spec 040
- [x] T025 Run `pnpm --filter @blue/app test`
- [x] T026 Run `pnpm --filter @blue/app build:renderer`
- [x] T027 Run `git diff --check`
- [x] T028 Perform the manual `PianoRoll` validation scenarios from `quickstart.md`

## Handoff Notes

- Manual `PianoRoll` quickstart validation was signed off on 2026-05-14.
- Full non-browser validation also ran via `pnpm --filter @blue/app exec vitest run --config vitest.config.ts --browser.enabled=false` to cover the renderer and main-process suites that the package script does not exercise.
- Reuse score-shell interaction lessons from Spec 036 selectively, but do not treat the `PianoRoll` canvas as the same surface as the main score shell.
- Keep canonical writes batch-oriented so pointer-heavy note edits do not flood IPC.
- Keep unsupported `PianoRoll` subfeatures explicit so the parity claim stays honest.
