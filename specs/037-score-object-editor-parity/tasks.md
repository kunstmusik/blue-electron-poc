# Tasks: Score Object Editor Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  

**Tests**: Tests are required by FR-009. Add data-layer identity coverage, shared score-editor contract coverage, and auxiliary panel routing tests before or alongside the implementation they protect.

**Organization**: Tasks are grouped by user story so the shared properties surface, type-specific editor routing, and fallback behavior can be implemented and validated incrementally after the editor-target foundation is in place.

## Phase 1: Setup (Shared Context)

**Purpose**: Confirm the Java parity anchors, current score shell selection seams, and reusable renderer surfaces before code changes begin.

- [x] T001 Review the Java auxiliary score-editor anchors documented in `/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/research.md`
- [x] T002 [P] Inventory current score snapshot, selection, and score-shell object-id seams in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/score-selection-store.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/`
- [x] T003 [P] Inventory current auxiliary panel routing and placeholder behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`
- [x] T004 [P] Inventory `@blue/data` score-object, library, and note-processor seams plus reusable renderer editor surfaces in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-clip.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish canonical score-object target identity, library-backed resolution, on-demand editor documents, and canonical score patch variants before panel work begins.

**Critical**: No user story work should begin until this phase is complete.

### Tests

- [x] T005 [P] Add stable library-id and lookup coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.test.ts`
- [x] T006 [P] Add shared score-object editor target and document contract tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-editor-contract.test.ts`
- [x] T007 [P] Add auxiliary score-object panel routing regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`
- [x] T008 [P] Add score-object editor read-IPC contract coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/score-object-editor-document.test.ts`

### Implementation

- [x] T009 Extend `SoundObjectLibrary` with stable entry identity, reverse lookup, and containment helpers in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/index.ts`
- [x] T010 Extend score row snapshots with stable `ScoreObjectEditorTargetSnapshot` metadata in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T011 Implement canonical score-object target resolution and on-demand `ScoreObjectEditorDocumentSnapshot` creation helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T012 Extend `ScorePatch` with shared properties, sound-object behavior, note-processor-chain, and type-specific editor mutations in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T013 Implement canonical score-object patch application for timeline and library-backed targets in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T014 Expose `getScoreObjectEditorDocument` through `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`
- [x] T015 Update score selection and score-shell object-id plumbing to use stable target-aware ids in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/score-selection-store.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/`

**Checkpoint**: Canonical score-object identity, library routing, and editor-document loading are ready for the auxiliary surfaces.

---

## Phase 3: User Story 1 - Edit Shared ScoreObject Properties (Priority: P1) MVP

**Goal**: Replace the properties placeholder with a real shared ScoreObject properties surface that updates canonical score data.

**Independent Test**: Select one supported score object or `AudioClip`, edit shared fields in the properties panel, and confirm the score shell and canonical project data refresh coherently.

### Tests for User Story 1

- [x] T016 [P] [US1] Add no-selection and single-selection properties panel tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-properties-panel.test.tsx`
- [x] T017 [P] [US1] Add shared-property mutation and score-shell synchronization tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-properties-panel.test.tsx`
- [x] T018 [P] [US1] Add time-behavior, repeat-point, and note-processor-chain tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-properties-panel.test.tsx`

### Implementation for User Story 1

- [x] T019 [US1] Route `SoundObjectPropertiesTopComponent` to a real panel and update user-facing label copy where appropriate in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- [x] T020 [US1] Implement the top-level properties surface in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectPropertiesPanel.tsx`
- [x] T021 [US1] Build shared property form controls for name, start time, duration, end-time display, and color in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/ScoreObjectPropertiesForm.tsx`
- [x] T022 [US1] Wire SoundObject-only time-behavior and repeat-point controls in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/`
- [x] T023 [US1] Add note-processor-chain summary and editing affordances using typed chain snapshots in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/`
- [x] T024 [US1] Dispatch shared property mutations through canonical score patches and keep the score shell synchronized in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts` and the score-object panel helpers

**Checkpoint**: The shared properties panel is independently usable for supported single-selection scenarios.

---

## Phase 4: User Story 2 - Open The Correct Type-Specific Editor (Priority: P1)

**Goal**: Replace the score-object editor placeholder with a registry-driven surface that loads the correct editor family for supported object types plus `AudioClip`.

**Independent Test**: Select supported score-object types and `AudioClip`, confirm the correct editor family loads, edit content, and verify the backing object updates without losing selection context.

### Tests for User Story 2

- [x] T025 [P] [US2] Add editor-registry routing tests for supported families in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-editor-routing.test.tsx`
- [x] T026 [P] [US2] Add code-backed and `AudioClip` editor tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-editor-panel.test.tsx`
- [x] T027 [P] [US2] Add `Instance` and library-backed routing tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-library-routing.test.tsx`

### Implementation for User Story 2

- [x] T028 [US2] Route `ScoreObjectEditorTopComponent` to a real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [x] T029 [US2] Implement the top-level editor surface in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectEditorPanel.tsx`
- [x] T030 [US2] Implement the static registry and family-selection logic in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/editor-registry.tsx`
- [x] T031 [US2] Implement the code-backed editor family for `GenericScore`, `PythonObject`, `JavaScriptObject`, `Comment`, and `External` using `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx`
- [x] T032 [US2] Implement file, clip, and reference editor families for `AudioClip`, `AudioFile`, `FrozenSoundObject`, `Sound`, and `Instance` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/`
- [x] T033 [US2] Implement structured or container editor families for `PolyObject`, `PatternObject`, `PianoRoll`, `TrackerObject`, `NotationObject`, `LineObject`, `ZakLineObject`, and `JMask` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/`
- [x] T034 [US2] Wire type-specific editor mutations to canonical score patch handlers and refresh logic in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/useScoreObjectEditorDocument.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`

**Checkpoint**: The registry-driven score-object editor is independently usable for the supported editor families.

---

## Phase 5: User Story 3 - Handle Library-Backed And Unsupported Objects Safely (Priority: P2)

**Goal**: Make the auxiliary panels robust for library-backed, `Instance`, unsupported, multi-selection, and removed-target cases.

**Independent Test**: Select an `Instance`, a library-backed object, multiple score objects, an unsupported object, and a removed target; confirm the panels either reroute correctly or show deliberate fallback states.

### Tests for User Story 3

- [x] T035 [P] [US3] Add unsupported, ambiguous, and removed-target fallback tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-editor-fallbacks.test.tsx`
- [x] T036 [P] [US3] Add library-context labeling and stale-selection refresh tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-library-routing.test.tsx`

### Implementation for User Story 3

- [x] T037 [US3] Add explicit fallback editor documents for no-selection, multi-selection, unsupported, and removed-target cases in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T038 [US3] Surface library-editing context badges and messaging in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectPropertiesPanel.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectEditorPanel.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/ScoreObjectContextBadge.tsx`
- [x] T039 [US3] Add registry fallbacks and explicit deferral messaging for Java-only or still-thin types such as `ObjectBuilder` and `CSDSoundObject` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/editor-registry.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/editors/UnsupportedScoreObjectEditor.tsx`
- [x] T040 [US3] Ensure auxiliary panels clear stale documents when selection changes outside `ScoreTopComponent` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectPropertiesPanel.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScoreObjectEditorPanel.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score-object/useScoreObjectEditorDocument.ts`

**Checkpoint**: Fallback behavior is explicit and safe across the high-risk selection states.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and handoff preparation after implementation.

- [x] T041 [P] Update `/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/quickstart.md` with any implementation-specific validation notes discovered during development
- [x] T042 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with Spec 037 implementation progress, validation results, and any remaining deferrals
- [x] T043 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [x] T044 Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [x] T045 Run `pnpm --filter @blue/app build:main` from `/Users/stevenyi/work/blue-electron`
- [x] T046 Run `pnpm --filter @blue/app build:preload` from `/Users/stevenyi/work/blue-electron`
- [x] T047 Run `pnpm --filter @blue/app build:renderer` from `/Users/stevenyi/work/blue-electron`
- [x] T048 Run `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` from `/Users/stevenyi/work/blue-electron`
- [x] T049 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`
- [x] T050 Perform the manual auxiliary score-object scenarios from `/Users/stevenyi/work/blue-electron/specs/037-score-object-editor-parity/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP for this slice.
- **User Story 2 (Phase 4)**: Depends on Foundational and on the stable shared target-loading behavior established in US1.
- **User Story 3 (Phase 5)**: Depends on Foundational and benefits from US1 and US2 because fallback behavior must integrate with the finished panels.
- **Polish (Phase 6)**: Depends on the selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundational.
- **US2 (P1)**: Depends on Foundational and should follow US1 so the shared properties surface and editor panel agree on the same target-resolution model.
- **US3 (P2)**: Depends on Foundational and should follow US1 plus US2 so fallback states cover the real auxiliary surfaces, not placeholders.

### Parallel Opportunities

- Setup inventory tasks T002-T004 can run in parallel.
- Foundational tests T005-T008 can run in parallel.
- US1 tests T016-T018 can run in parallel.
- US2 tests T025-T027 can run in parallel.
- US3 tests T035-T036 can run in parallel.
- Polish documentation tasks T041-T042 can run in parallel.

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Validate the shared properties panel on supported single-selection scenarios.
4. Stop and review before expanding into the full type-specific editor registry.

### Incremental Delivery

1. Land canonical score-object target identity and on-demand editor-document loading.
2. Land the shared properties surface.
3. Land the registry-driven type-specific editor panel.
4. Land explicit library, unsupported, and removed-target fallback behavior.

### Handoff Notes

- Keep later score-object follow-up work plus shell-level score management/navigation out of this slice; they belong to Specs 038, 039, and 040.
- Use the Java auxiliary score editor classes listed in `research.md` as the parity source whenever panel behavior is unclear.
- Keep score-object writes flowing through canonical score patches so the score shell and auxiliary panels stay synchronized.
- Prefer family-based React editor components when the TypeScript models share clear field shapes; reserve per-type bespoke editors for the truly specialized objects.
