# Tasks: Tables, UDO, and CSD Generation Editors

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required by FR-020 and the constitution's serialization rule. Data serialization tests come before renderer integration.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm Java anchors and create feature boundaries before implementation.

- [ ] T001 Verify Java source behavior for Tables, UDO, and CSD generation against `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/research.md`
- [ ] T002 [P] Confirm existing BSB UDO components eligible for reuse in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBUDOPanel.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/UDOTable.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/UDOEditor.tsx`
- [ ] T003 [P] Create shared UDO component directory in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/udo/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data compatibility, snapshots, patch contracts, and IPC/menu plumbing required by all user stories.

**Critical**: No user story implementation should begin until these are complete.

- [ ] T004 [P] Add Tables XML/text compatibility tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/tables.test.ts`
- [ ] T005 Update Tables text load/save API in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/tables.ts`
- [ ] T006 [P] Add root OpcodeList and OpcodeDefinition mutation/conversion tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/opcodes/opcode-list.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/opcodes/opcode-definition.test.ts`
- [ ] T007 Update root OpcodeList helpers for add/remove/reorder/deep-copy/import-ready behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/opcodes/opcode-list.ts`
- [ ] T008 Update OpcodeDefinition style conversion and generated-code helpers in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/opcodes/opcode-definition.ts` and related UDO utility files
- [ ] T009 Extend project editor snapshot and patch contracts for tables, project UDOs, and generated CSD receipts in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [ ] T010 Extend main-process project patch handling for tables and root UDO mutations in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T011 Extend preload and renderer global typings for tables, root UDOs, and generated CSD IPC in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`
- [ ] T012 Extend project store state/actions for tables and root UDO snapshots in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [ ] T013 [P] Add shared project-editor contract tests for tables and UDO snapshots/patches in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tables-udo-contract.test.ts`

**Checkpoint**: Data model, IPC contracts, and store plumbing are ready.

---

## Phase 3: User Story 1 - Edit Project Tables (Priority: P1) MVP

**Goal**: The Tables tab shows and edits project F-table text with Csound editor context menu parity.

**Independent Test**: Load a project, edit Tables text, use the right-click menu, save/reopen, and verify generated CSD includes the edited table text.

### Tests for User Story 1

- [ ] T014 [P] [US1] Add Tables panel render/no-project tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tables-panel.test.tsx`
- [ ] T015 [P] [US1] Add Tables editor context menu tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tables-context-menu.test.tsx`

### Implementation for User Story 1

- [ ] T016 [US1] Route `TablesTopComponent` to a real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [ ] T017 [US1] Implement project-backed Tables editor in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/TablesPanel.tsx`
- [ ] T018 [US1] Configure Tables editor to use score/table Csound context menu behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-menu.ts`
- [ ] T019 [US1] Wire Tables editor patches through project store in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`

**Checkpoint**: User Story 1 is independently testable.

---

## Phase 4: User Story 2 - Manage Project UDOs (Priority: P1)

**Goal**: The UDO tab lists project UDOs and edits selected UDO fields/code/comments with Java Blue-style actions.

**Independent Test**: Add/edit/reorder/copy/paste a UDO, preview generated code, save/reopen, and verify generated CSD includes the project UDO.

### Tests for User Story 2

- [ ] T020 [P] [US2] Add UDO panel render/list-selection tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/udo-panel.test.tsx`
- [ ] T021 [P] [US2] Add UDO editor field/code/comments tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/udo-editor.test.tsx`
- [ ] T022 [P] [US2] Add UDO list action tests for add/remove/reorder/cut/copy/paste in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/udo-actions.test.tsx`
- [ ] T023 [P] [US2] Add UDO import/export behavior tests or explicit deferral tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/udo-import-export.test.tsx`

### Implementation for User Story 2

- [ ] T024 [US2] Factor reusable UDO table component from BSB into `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/udo/UdoTable.tsx`
- [ ] T025 [US2] Factor reusable UDO editor component from BSB into `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/udo/UdoEditor.tsx`
- [ ] T026 [US2] Update BSB UDO panel to use shared components in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBUDOPanel.tsx`
- [ ] T027 [US2] Implement project-level UDO panel composition in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/UserDefinedOpcodePanel.tsx`
- [ ] T028 [US2] Route `UserDefinedOpcodeTopComponent` to the real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [ ] T029 [US2] Implement UDO add/remove/reorder/update patch dispatch in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/UserDefinedOpcodePanel.tsx`
- [ ] T030 [US2] Implement UDO generated-code preview modal or dialog in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/udo/UdoPreviewDialog.tsx`
- [ ] T031 [US2] Implement or explicitly defer Blue UDO and Csound UDO import/export UI in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/udo/UdoTable.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`

**Checkpoint**: User Story 2 is independently testable.

---

## Phase 5: User Story 3 - Generate CSD from Project Menu (Priority: P1)

**Goal**: A native Project menu before Window provides CSD generation and existing playback/render actions.

**Independent Test**: Use Project -> Generate CSD to Screen and Project -> Generate CSD to Disk; verify modal/file output and menu placement.

### Tests for User Story 3

- [ ] T032 [P] [US3] Add native menu structure tests for Project menu order and moved playback actions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main-menu.test.ts`
- [ ] T033 [P] [US3] Add CSD generation IPC tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/generated-csd.test.ts`
- [ ] T034 [P] [US3] Add generated CSD modal render tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/generated-csd-modal.test.tsx`
- [ ] T035 [P] [US3] Add disk generation save-path behavior tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/generated-csd-disk.test.ts`

### Implementation for User Story 3

- [ ] T036 [US3] Refactor native menu construction to add Project before Window in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T037 [US3] Move existing Playback menu Play/Stop behavior into Project menu in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T038 [US3] Implement main-process Generate CSD to Screen command in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T039 [US3] Implement renderer generated CSD modal listener/state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [ ] T040 [US3] Implement read-only generated CSD modal editor in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GeneratedCsdModal.tsx`
- [ ] T041 [US3] Render generated CSD modal from app shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/App.tsx`
- [ ] T042 [US3] Implement main-process Generate CSD to Disk command with `.csd` extension enforcement in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T043 [US3] Add success/error user feedback for generated CSD commands in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`

**Checkpoint**: User Story 3 is independently testable.

---

## Phase 6: User Story 4 - Defer User UDO Library Without Losing Project UDO Parity (Priority: P2)

**Goal**: Project UDO editing is complete while user/global UDO library behavior is explicitly out of scope.

**Independent Test**: Open UDO and verify project editing works and user library support is absent or clearly marked deferred.

- [ ] T044 [P] [US4] Add User UDO library deferral test in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/udo-library-deferral.test.tsx`
- [ ] T045 [US4] Add deferred User UDO library messaging if a library area is shown in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/UserDefinedOpcodePanel.tsx`
- [ ] T046 [US4] Update deferral notes in `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/research.md` if implementation scope changes

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validation, cleanup, and handoff documentation after the feature stories.

- [ ] T047 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with Spec 026 implementation status and deferrals
- [ ] T048 [P] Update `/Users/stevenyi/work/blue-electron/specs/026-tables-udo-csd/quickstart.md` with any final manual verification deltas
- [ ] T049 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [ ] T050 Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [ ] T051 Run `pnpm --filter @blue/app build` from `/Users/stevenyi/work/blue-electron`
- [ ] T052 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks user stories.
- **User Stories (Phase 3+)**: Depend on Foundational.
- **Polish**: Depends on the implemented story scope.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; can ship as MVP for Tables and CSD table inclusion.
- **US2 (P1)**: Starts after Foundational; can be developed in parallel with US1 after shared snapshot/patch contracts stabilize.
- **US3 (P1)**: Starts after Foundational; screen/disk generation depends on current data model and generated CSD path.
- **US4 (P2)**: Starts after US2 panel shape exists.

### Parallel Opportunities

- T002 and T003 can run in parallel.
- T004 and T006 can run in parallel.
- T014 and T015 can run in parallel.
- T020, T021, T022, and T023 can run in parallel after foundational contracts are stable.
- T032, T033, T034, and T035 can run in parallel.
- US1 and US2 can be developed in parallel after T009-T012 are complete.

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete US1 Tables editor.
3. Validate table text edit/save/reopen and generated CSD inclusion.

### Incremental Delivery

1. Add project UDO list/editor reuse and mutations.
2. Add Project menu and Generate CSD to Screen.
3. Add Generate CSD to Disk.
4. Finalize User UDO library deferral and validation.

### Handoff Notes

- Preserve `blue-data` as the compatibility layer; do not solve renderer bugs by storing Tables/UDO-only state outside `BlueData`.
- Reuse existing `SelectedCodeEditor` and editor context menu styles so context-menu regressions from prior specs do not reappear.
- Keep BSB embedded UDO and root project UDO patch paths separate even if they share UI components.
