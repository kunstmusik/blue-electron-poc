# Tasks: Csound Editor Java Blue Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/spec.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/quickstart.md`, `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/contracts/csound-editor-parity-surface.md`

**Tests**: Include automated coverage because the spec explicitly requires clipboard shortcut gating, menu insertion behavior, and completion-source behavior where practical.

**Organization**: Tasks are grouped by user story so clipboard reliability can ship first, context-menu insertions can be validated independently, completion/hint parity can layer on the existing spec 018 adapter, and reuse cleanup can be isolated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Include exact file paths in every task description

## Phase 1: Setup (Research And Test Scaffolding)

**Purpose**: Lock the Java source anchors and create a small test boundary before implementation.

- [ ] T001 Record final Java source anchors and scoped parity decisions in `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/research.md`
- [ ] T002 [P] Add editor parity test scaffolding in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/csound-editor-parity.test.ts`
- [ ] T003 [P] Add reusable test helpers for CodeMirror editor rendering or command invocation in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

---

## Phase 2: Foundational (Reusable Editor Command Model)

**Purpose**: Build shared command/menu primitives that all stories use.

**CRITICAL**: No story implementation should hardcode editor command behavior directly in `GlobalOrchestraPanel`.

- [ ] T004 [P] Define `CsoundEditorCommand`, insertion item, and menu item typings in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/editor-adapter-types.ts`
- [ ] T005 [P] Implement selection-aware text insertion helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-actions.ts`
- [ ] T006 [P] Implement Java Blue menu data builders for Blue Variables, Blue Opcodes, and deferred categories in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-menu.ts`
- [ ] T007 Add unit coverage for insertion and menu data helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/csound-editor-parity.test.ts`

**Checkpoint**: Reusable editor command and menu metadata exist and are tested without rendering the full workbench.

---

## Phase 3: User Story 1 - Reliable Clipboard Editing (Priority: P1) MVP

**Goal**: Cut, Copy, and Paste work from keyboard and context menu in the CodeMirror-backed Global Orchestra editor without triggering playback/global shortcuts.

**Independent Test**: Select text in Global Orchestra, invoke Cut/Copy/Paste from keyboard and context menu, and confirm editor content/clipboard behavior is correct while playback does not start.

### Tests for User Story 1

- [ ] T008 [P] [US1] Add shortcut-gating regression tests for CodeMirror clipboard and playback conflicts in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts`
- [ ] T009 [P] [US1] Add clipboard command behavior tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/csound-editor-parity.test.ts`

### Implementation for User Story 1

- [ ] T010 [US1] Implement Cut, Copy, and Paste editor commands in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-actions.ts`
- [ ] T011 [US1] Review and update Electron standard Edit menu roles for focused editor clipboard behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T012 [US1] Preserve text-editor shortcut precedence for CodeMirror, context-menu focus, and completion popup focus in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-keyboard-shortcuts.ts`

**Checkpoint**: User Story 1 is complete when editor clipboard actions work and no playback shortcut regression is present.

---

## Phase 4: User Story 2 - Java Blue Context Menu Insertions (Priority: P1)

**Goal**: Right-clicking Global Orchestra opens a Java Blue-style editor context menu with required insertion categories and clipboard actions.

**Independent Test**: Right-click Global Orchestra, select required Blue Variables and Blue Opcodes entries, and confirm text is inserted or replaces selection.

### Tests for User Story 2

- [ ] T013 [P] [US2] Add context-menu shape and required item tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/csound-editor-parity.test.ts`
- [ ] T014 [P] [US2] Add Global Orchestra editor context-menu rendering/insertion coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

### Implementation for User Story 2

- [ ] T015 [US2] Implement a Radix-backed `CsoundEditorContextMenu` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/CsoundEditorContextMenu.tsx`
- [ ] T016 [US2] Wire `CsoundEditorContextMenu` into `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx`
- [ ] T017 [US2] Implement Blue Variables insertion items in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-menu.ts`
- [ ] T018 [US2] Implement Blue Opcodes insertion items in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-menu.ts`
- [ ] T019 [US2] Add deferred or data-backed Opcodes, Custom, and Add to Code Repository states in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-menu.ts`
- [ ] T020 [US2] Add context-menu styling consistent with Java Blue/Dockview menus in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`

**Checkpoint**: User Story 2 is complete when the Java Blue context menu opens in Global Orchestra and the required high-confidence insertions work.

---

## Phase 5: User Story 3 - Completion And Hint Parity Baseline (Priority: P2)

**Goal**: Add the first Java Blue-derived completion/hint providers while preserving the CodeMirror Csound package baseline.

**Independent Test**: Trigger completion in Global Orchestra and confirm document-local Csound variables plus selected Java Blue-derived entries are available without duplicate noise.

### Tests for User Story 3

- [ ] T021 [P] [US3] Add document-local Csound variable completion tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/csound-editor-parity.test.ts`
- [ ] T022 [P] [US3] Add Blue opcode or project-UDO completion tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

### Implementation for User Story 3

- [ ] T023 [US3] Implement Java Blue-style document-local variable completion provider in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-java-blue-completions.ts`
- [ ] T024 [US3] Implement Blue Variables and Blue Opcodes completion entries in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-java-blue-completions.ts`
- [ ] T025 [US3] Add project-UDO completion extraction if available from the active project snapshot in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-java-blue-completions.ts`
- [ ] T026 [US3] Merge Java Blue-derived providers into selected editor language setup in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-language.ts`
- [ ] T027 [US3] Document implemented and deferred completion/hint parity in `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/research.md`

**Checkpoint**: User Story 3 is complete when at least one concrete Java Blue-derived completion category works and deferred hint/completion gaps are documented.

---

## Phase 6: User Story 4 - Reusable Csound Editor Parity Surface (Priority: P3)

**Goal**: Ensure the implementation can be reused by future Global Score and other Csound text editor surfaces.

**Independent Test**: Review the editor adapter and confirm menu/completion/action behavior is consumed via reusable props/helpers rather than one-off Global Orchestra code.

### Implementation for User Story 4

- [ ] T028 [P] [US4] Update the reusable editor contract documentation in `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/contracts/csound-editor-parity-surface.md`
- [ ] T029 [US4] Refactor `SelectedCodeEditor` props for reusable menu and completion source injection in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx`
- [ ] T030 [US4] Keep `GlobalOrchestraPanel` as a thin consumer of reusable editor behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalOrchestraPanel.tsx`
- [ ] T031 [US4] Add Global Orchestra save/reopen persistence regression coverage after editor parity actions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`
- [ ] T032 [US4] Add reuse handoff notes for Global Score and future Csound editors in `/Users/stevenyi/work/blue-electron/specs/019-csound-editor-parity/quickstart.md`

**Checkpoint**: User Story 4 is complete when the parity behavior is reusable and the follow-on path for Global Score is explicit.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and handoff.

- [ ] T033 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with spec 019 scope, validation status, and any parity gaps deferred
- [ ] T034 [P] Update `/Users/stevenyi/work/blue-electron/AGENTS.md` if implementation changes the active technology/context notes generated during planning
- [ ] T035 Run `pnpm --filter @blue/app test`
- [ ] T036 Run `pnpm --filter @blue/app build`
- [ ] T037 Run `git diff --check`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup; blocks user stories
- **US1 Clipboard (Phase 3)**: Depends on Foundational; MVP path
- **US2 Context Menu (Phase 4)**: Depends on Foundational and shares commands with US1
- **US3 Completion/Hints (Phase 5)**: Depends on Foundational and may reuse menu insertion data
- **US4 Reuse (Phase 6)**: Depends on US1, US2, and US3 design being stable
- **Polish (Phase 7)**: Depends on selected user stories being complete

### User Story Dependencies

- **US1**: MVP; can ship after Foundational
- **US2**: Can start after Foundational; integrates with US1 clipboard commands
- **US3**: Can start after Foundational; best after menu data exists to reuse Blue Variables/Blue Opcodes
- **US4**: Final cleanup after concrete editor parity behavior exists

### Parallel Opportunities

- T002 and T003 can run in parallel
- T004, T005, and T006 can run in parallel
- T008 and T009 can run in parallel
- T013 and T014 can run in parallel
- T021 and T022 can run in parallel
- T033 and T034 can run in parallel after implementation stabilizes

---

## Parallel Example: Context Menu Story

```bash
Task: "Add context-menu shape and required item tests in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/csound-editor-parity.test.ts"
Task: "Add Global Orchestra editor context-menu rendering/insertion coverage in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts"
```

## Parallel Example: Completion Story

```bash
Task: "Add document-local Csound variable completion tests in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/csound-editor-parity.test.ts"
Task: "Add Blue opcode or project-UDO completion tests in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 clipboard reliability.
3. Validate Cut/Copy/Paste and shortcut gating before adding menu complexity.

### Incremental Delivery

1. Add reusable editor commands and menu data.
2. Ship clipboard reliability.
3. Add Java Blue context menu insertion parity.
4. Add Java Blue-derived completion/hint baseline.
5. Refactor for reuse and document remaining parity gaps.

### Validation

1. Run targeted Vitest coverage after each story.
2. Run full `pnpm --filter @blue/app test` and `pnpm --filter @blue/app build` before closeout.
3. Manually validate the quickstart clipboard and context-menu flows in the running app.
