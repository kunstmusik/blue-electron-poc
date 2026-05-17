# Tasks: Score Editor Management and Navigation

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/042-score-editor-management-navigation/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  

**Tests**: Tests are required by FR-014. Add render-range, marker, manage, and follow-playback coverage before or alongside the implementation it protects.

**Organization**: Tasks are grouped by user story so the render-range foundation, marker authoring parity, manage workflow, and follow or navigation polish can be validated independently.

## Phase 1: Setup (Shared Review)

**Purpose**: Reconfirm parity anchors and the existing TypeScript entry points before implementation starts.

- [x] T001 Review the Java parity notes in `specs/042-score-editor-management-navigation/research.md`
- [x] T002 [P] Inventory the current root-ruler and marker-row entry points in `packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx` and `packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`
- [x] T003 [P] Inventory the current menu, native-command, and placeholder panel entry points in `packages/blue-app/src/main/application-menu.ts`, `packages/blue-app/src/shared/workbench-menu.ts`, and `packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared persistence and command plumbing that all later user stories depend on.

**⚠️ CRITICAL**: No user-story work should start until this phase is complete.

- [x] T004 [P] Add canonical marker and render-range persistence coverage in `packages/blue-data/src/markers-list.test.ts` and `packages/blue-data/src/blue-data-root-compatibility.test.ts`
- [x] T005 [P] Add shared renderer or contract coverage for score-shell patch synchronization in `packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`
- [x] T006 Extend score patch support for marker add, update, and remove operations in `packages/blue-app/src/shared/project-editor.ts`
- [x] T007 Extend native menu command support for add-marker and follow-on-render-start actions in `packages/blue-app/src/shared/workbench-menu.ts` and `packages/blue-app/src/renderer/stores/workbench-store.ts`

**Checkpoint**: Shared persistence and command plumbing are ready for story work.

---

## Phase 3: User Story 1 - Set Render Range From The Ruler (Priority: P1) 🎯 MVP

**Goal**: Let the root score ruler define and display render start or end selections with canonical persistence.

**Independent Test**: Click the root ruler to set render start, drag to create a range, save, reload, and verify the same selection remains visible.

### Tests for User Story 1

- [x] T008 [P] [US1] Add root-ruler interaction coverage in `packages/blue-app/src/renderer/tests/score-panel-render-range.test.tsx`
- [x] T009 [P] [US1] Add toolbar display coverage for point versus range render selections in `packages/blue-app/src/renderer/tests/toolbar-performance-render.test.tsx`

### Implementation for User Story 1

- [x] T010 [US1] Create root-ruler selection helpers in `packages/blue-app/src/renderer/components/workbench/panels/score/useScoreRulerSelection.ts`
- [x] T011 [US1] Render start, render end, and range highlights in `packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`
- [x] T012 [US1] Wire root-ruler click and drag commits through `packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`

**Checkpoint**: The root ruler can define and display canonical render selections independently of later marker work.

---

## Phase 4: User Story 2 - Create And Edit Markers From The Score Shell (Priority: P1)

**Goal**: Deliver Java-style marker authoring from the shell, including ruler creation, menu or shortcut creation, move, and rename.

**Independent Test**: Create markers from the ruler and project menu or shortcut, move and rename them, save, reload, and verify the edited markers persist.

### Tests for User Story 2

- [x] T013 [P] [US2] Add marker interaction coverage for create, move, rename, and remove flows in `packages/blue-app/src/renderer/tests/score-panel-marker-interactions.test.tsx`
- [x] T014 [P] [US2] Add native menu command coverage for marker creation in `packages/blue-app/src/renderer/tests/workbench-native-menu-commands.test.ts`

### Implementation for User Story 2

- [x] T015 [US2] Implement ruler-based marker creation and drag-to-move behavior in `packages/blue-app/src/renderer/components/workbench/panels/score/MarkersBar.tsx`
- [x] T016 [US2] Implement marker rename and context actions in `packages/blue-app/src/renderer/components/workbench/panels/score/MarkersBar.tsx`
- [x] T017 [US2] Implement `Project > Add Marker` and `CmdOrCtrl+M` routing in `packages/blue-app/src/main/application-menu.ts` and `packages/blue-app/src/renderer/stores/workbench-store.ts`

**Checkpoint**: Marker authoring parity works from both the ruler and the project menu or shortcut.

---

## Phase 5: User Story 3 - Manage Score Structure From The Shell (Priority: P2)

**Goal**: Replace the shell's `Manage` stub with supported manager dialogs that mutate canonical score structure.

**Independent Test**: Open `Manage`, perform a supported structure edit, and verify the score shell updates without reopening the panel.

### Tests for User Story 3

- [x] T018 [P] [US3] Add manage workflow dialog coverage in `packages/blue-app/src/renderer/tests/score-panel-manage-workflow.test.tsx`
- [x] T019 [P] [US3] Add score-structure regression coverage for supported manager operations in `packages/blue-app/src/renderer/tests/score-multigroup-identity.test.ts`

### Implementation for User Story 3

- [x] T020 [US3] Implement the score-shell `Manage` entrypoint in `packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- [x] T021 [US3] Create supported manager surfaces in `packages/blue-app/src/renderer/components/workbench/panels/score/ScoreManagerDialog.tsx` and `packages/blue-app/src/renderer/components/workbench/panels/score/LayerGroupManagerDialog.tsx`
- [x] T022 [US3] Connect manager commits to canonical patch flows in `packages/blue-app/src/shared/project-editor.ts` and `packages/blue-app/src/renderer/stores/project-store.ts`

**Checkpoint**: The score shell exposes a real manage workflow independent of marker or playback polish.

---

## Phase 6: User Story 4 - Navigate And Follow Large Scores Predictably (Priority: P2)

**Goal**: Replace the marker-related placeholder path with a real navigation workflow and finish the follow-playback or time-pointer shell polish.

**Independent Test**: Use the marker-related auxiliary workflow to jump or set render start, then enable follow playback and confirm the score shell stays synchronized during playback.

### Tests for User Story 4

- [x] T023 [P] [US4] Add marker-related auxiliary panel routing coverage in `packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`
- [x] T024 [P] [US4] Add follow-playback and time-pointer coverage in `packages/blue-app/src/renderer/tests/score-panel-follow-playback.test.tsx`

### Implementation for User Story 4

- [x] T025 [US4] Replace the marker placeholder surface with a supported workflow in `packages/blue-app/src/renderer/components/workbench/panels/MarkersPanel.tsx`, `packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`, and `packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx`
- [x] T026 [US4] Implement marker-centered navigation or set-render-start actions in `packages/blue-app/src/renderer/components/workbench/panels/MarkersPanel.tsx`
- [x] T027 [US4] Implement follow-playback-on-render-start and time-pointer polish in `packages/blue-app/src/main/application-menu.ts`, `packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`, and `packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`

**Checkpoint**: Marker-centered navigation and playback-follow polish are visible in real shell workflows rather than placeholders.

---

## Phase 7: Polish & Cross-Cutting Validation

**Purpose**: Final documentation and validation for the completed slice.

- [x] T028 [P] Update implementation notes and manual steps in `specs/042-score-editor-management-navigation/quickstart.md`
- [x] T029 [P] Update handoff notes in `STATUS.md`
- [x] T030 Run `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks`
- [x] T031 Run `pnpm --filter @blue/app exec vitest run --config vitest.config.ts --browser.enabled=false`
- [x] T032 Run `pnpm --filter @blue/app build:renderer`
- [x] T033 Run `git diff --check`
- [x] T034 Perform the manual validation scenarios from `specs/042-score-editor-management-navigation/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user-story work.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP foundation.
- **User Story 2 (Phase 4)**: Depends on Foundational and User Story 1 because marker authoring shares the same root-ruler interaction surface.
- **User Story 3 (Phase 5)**: Depends on Foundational but is otherwise independent of the marker work.
- **User Story 4 (Phase 6)**: Depends on Foundational plus User Stories 1 and 2, and may optionally consume User Story 3's manage-state work.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- `T002` and `T003` can run in parallel during setup.
- `T004` and `T005` can run in parallel during foundational work.
- `T008` and `T009` can run in parallel for User Story 1.
- `T013` and `T014` can run in parallel for User Story 2.
- `T018` and `T019` can run in parallel for User Story 3.
- `T023` and `T024` can run in parallel for User Story 4.

---

## Parallel Example: User Story 2

```bash
# Launch both marker-focused test tasks together:
Task: "Add marker interaction coverage for create, move, rename, and remove flows in packages/blue-app/src/renderer/tests/score-panel-marker-interactions.test.tsx"
Task: "Add native menu command coverage for marker creation in packages/blue-app/src/renderer/tests/workbench-native-menu-commands.test.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational work.
2. Complete User Story 1.
3. Validate render-range interaction and persistence before starting marker authoring.
4. Complete User Story 2.
5. Stop and validate the ruler and marker parity slice before moving on.

### Incremental Delivery

1. Deliver User Story 1 for canonical render-range parity.
2. Layer User Story 2 for Java-style marker authoring parity.
3. Add User Story 3 for the `Manage` workflow.
4. Finish with User Story 4 for marker-related panel navigation and follow-playback polish.

## Notes

- Do not reopen already-landed direct manipulation behavior except for blocking regressions.
- Keep score-object editor work in Specs 039, 040, and 041; this slice is for shell-level management or navigation only.
- Keep follow-playback logic local to the score shell when possible to avoid unnecessary shared-store churn.
