# Tasks: Csound Editor Tooling

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/plan.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/spec.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/quickstart.md`, `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/contracts/global-orchestra-editor-surface.md`

**Tests**: Include renderer/component coverage plus build validation because the slice changes the Global Orchestra editor shell and adds a selected rich-editor dependency. Add candidate-spike validation before final dependency choice.

**Organization**: Tasks are grouped by user story so editor evaluation completes before implementation, the selected Global Orchestra editor can ship independently, and dynamic completion follow-on work is documented cleanly.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in every task description

## Phase 1: Setup (Editor Evaluation Scaffolding)

**Purpose**: Prepare the candidate comparison and local adapter boundary before adding a production editor dependency.

- [X] T001 Create the CodeMirror vs Monaco evaluation matrix section in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md`
- [X] T002 [P] Create selected-editor shared typings in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/editor-adapter-types.ts`
- [X] T003 [P] Prepare rich-editor test scaffolding and editor mocks in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

---

## Phase 2: Foundational (Blocking Editor Decision)

**Purpose**: Evaluate candidates and choose the editor path before implementation begins.

**⚠️ CRITICAL**: No selected editor implementation should begin until this phase is complete.

- [X] T004 [P] [US1] Verify `@kunstmusik/codemirror-lang-csound` package install/build compatibility and record findings in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md`
- [X] T005 [P] [US1] Verify Monaco install/build and completion-provider implications and record findings in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md`
- [X] T006 [US1] Compare dynamic completion paths for CodeMirror and Monaco in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md`
- [X] T007 [US1] Select the preferred 018 editor path and fallback in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md` and `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/quickstart.md`

**Checkpoint**: The slice has one selected editor path, one fallback, and a documented dynamic completion strategy.

---

## Phase 3: User Story 2 - Implement Selected Global Orchestra Editor (Priority: P1) 🎯 MVP

**Goal**: Replace the current Global Orchestra textarea with the selected rich editor while preserving load, edit, save, reopen, and empty-state behavior.

**Independent Test**: Open a project with existing global orchestra content, edit it in `GlobalOrchestraTopComponent`, save, reopen, and confirm the updated text persists while the panel is non-editable when no project is loaded.

- [X] T008 [US2] Add the selected editor dependency for `@blue/app` in `/Users/stevenyi/work/blue-electron/packages/blue-app/package.json` and `/Users/stevenyi/work/blue-electron/pnpm-lock.yaml`
- [X] T009 [P] [US2] Implement the selected editor wrapper in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx`
- [X] T010 [P] [US2] Implement selected Csound language configuration in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-language.ts`
- [X] T011 [US2] Replace the `ProjectTextEditorPanel` usage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalOrchestraPanel.tsx` with `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx`
- [X] T012 [US2] Keep `GlobalOrchestraTopComponent` routed to the upgraded panel and remove obsolete textarea-specific assumptions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [X] T013 [US2] Ensure selected editor edits continue to flow through the existing store patch path in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [X] T014 [US2] Add Global Orchestra selected-editor load/edit/empty-state/project-switch coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts`

**Checkpoint**: User Story 2 is complete when `GlobalOrchestraTopComponent` is backed by the selected rich editor and preserves the current project-document behavior.

---

## Phase 4: User Story 3 - Bound Dynamic Completion And Follow-On Tooling (Priority: P2)

**Goal**: Finish the slice with a concrete dynamic completion extension point and recommendation for editor-tooling or reuse work after Global Orchestra.

**Independent Test**: Review the handoff docs and confirm they name the dynamic completion source strategy, preferred next slice, deferred items, and how the same editor stack could extend later to Global Score or deeper Csound tooling.

- [X] T015 [P] [US3] Implement or document the selected editor dynamic completion adapter in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-completions.ts`
- [X] T016 [US3] Record whether CodeMirror language support, Monaco language support, or tree-sitter remains deferred in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md`
- [X] T017 [P] [US3] Update the implementation/handoff guidance for the next slice in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/quickstart.md`
- [X] T018 [US3] Refresh `/Users/stevenyi/work/blue-electron/STATUS.md` with the final 018 outcome and the named follow-on slice for Global Score reuse or deeper dynamic completion work

**Checkpoint**: User Story 3 is complete when the next editor-tooling slice is named clearly enough that it can start without reopening the CodeMirror-vs-Monaco decision.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Finish validation and slice closeout for 018.

- [X] T019 [P] Record the final selected-editor outcome and deferred language/completion work in `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/tasks.md` and `/Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/quickstart.md`
- [X] T020 Run end-to-end validation with `pnpm --filter @blue/app test` and `pnpm --filter @blue/app build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks selected editor implementation
- **User Story 2 (Phase 3)**: Depends on the editor decision in Phase 2
- **User Story 3 (Phase 4)**: Depends on the selected editor implementation and completion decision
- **Polish (Phase 5)**: Depends on the targeted user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Editor evaluation and decision gate; must complete before implementation
- **User Story 2 (P1)**: Required implementation outcome using the selected editor
- **User Story 3 (P2)**: Depends on the selected editor and documents what completion/language work remains

### Parallel Opportunities

- Phase 1: `T002` and `T003` can run in parallel after `T001`
- Phase 2: `T004` and `T005` can run in parallel before `T006`
- User Story 2: `T009` and `T010` can run in parallel after `T008`
- User Story 3: `T015` and `T017` can run in parallel after selected editor wiring is stable
- Phase 5: `T019` can run before `T020`

---

## Parallel Example: Evaluation

```bash
Task: "Verify @kunstmusik/codemirror-lang-csound package install/build compatibility and record findings in /Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md"
Task: "Verify Monaco install/build and completion-provider implications and record findings in /Users/stevenyi/work/blue-electron/specs/018-csound-editor-tooling/research.md"
```

## Parallel Example: Selected Editor Implementation

```bash
Task: "Implement the selected editor wrapper in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx"
Task: "Implement selected Csound language configuration in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-language.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Editor evaluation and decision
3. Complete Phase 3: Selected editor implementation
4. Stop and validate Global Orchestra before deeper completion work

### Incremental Delivery

1. Decide CodeMirror vs Monaco with dynamic completions as a key criterion
2. Land the selected editor as the required Global Orchestra upgrade
3. Document or implement the selected dynamic completion extension point
4. Record the follow-on roadmap for Global Score reuse or deeper language tooling

### Recommended Execution Order For This Feature

1. Complete the editor decision matrix
2. Add only the selected editor dependency
3. Build the local selected-editor wrapper
4. Upgrade `GlobalOrchestraPanel`
5. Document dynamic completion and follow-on language tooling
6. Run validation and close out the handoff docs

---

## Notes

- `[P]` tasks are limited to different files with no dependency on incomplete work
- Monaco is no longer assumed mandatory
- CodeMirror is currently the stronger preliminary candidate because `@kunstmusik/codemirror-lang-csound` already provides Csound language support and completions
- Tree-sitter remains a possible follow-on input, especially if Monaco is selected or if CodeMirror language support proves insufficient
