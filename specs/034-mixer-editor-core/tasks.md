# Tasks: Mixer Editor Core

**Input**: Design documents from `/specs/034-mixer-editor-core/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/  

**Tests**: Tests are required by FR-012. Write contract and window-lifecycle coverage before or alongside the implementation they protect.

**Organization**: Tasks are grouped by user story so the Mixer panel, library-driven chain editing, and dedicated effect editors can each be delivered and validated incrementally.

## Phase 1: Setup (Shared Context)

**Purpose**: Confirm the Java anchors and current TypeScript extension points before code changes begin.

- [x] T001 Review Java mixer, effects-library, and effect-editor anchors listed in `/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/research.md`
- [x] T002 [P] Inventory current TypeScript mixer classes in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/`
- [x] T003 [P] Inventory current project snapshot, store, and preload seams in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`
- [x] T004 [P] Inventory current window, menu, and workbench seams in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/settings-window.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [x] T005 [P] Inventory existing reusable BSB, UDO, and CodeMirror editor surfaces in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/udo/`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish typed mixer document contracts, main-process effects-library ownership, and effect-window lifecycle management before panel work begins.

**Critical**: No user story work should begin until this phase is complete.

### Tests

- [x] T006 [P] Add mixer snapshot and patch contract tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/mixer-contract.test.ts`
- [x] T007 [P] Add effects-library load and in-memory mutation tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/mixer-effects-library.test.ts`
- [x] T008 [P] Add effect-editor window reuse tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/effect-editor-window-manager.test.ts`
- [x] T009 [P] Add arrangement-to-mixer reconciliation tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/mixer-arrangement-sync.test.tsx`

### Implementation

- [x] T010 Extend `ProjectEditorSnapshot` and `ProjectDocumentPatch` with typed mixer state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T011 Add mixer snapshot creation and mixer patch application helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T012 Add optimistic mixer patch application in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [x] T013 Implement arrangement-driven mixer reconciliation helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T014 Add the effects-library session service in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/mixer-effects-library.ts`
- [x] T015 Add preload and renderer typing for effects-library and effect-editor APIs in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`
- [x] T016 Add main-process IPC handlers and window-manager plumbing in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [x] T017 Add a native menu command for the effects-library dialog in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts` and any menu-template plumbing that consumes it

**Checkpoint**: Canonical mixer snapshots, effects-library session ownership, and effect-editor window reuse are ready for UI work.

---

## Phase 3: User Story 1 - Edit Mixer Strips In The Workbench (Priority: P1) MVP

**Goal**: Replace the Mixer placeholder with a real workbench panel that stays synchronized with arrangement changes.

**Independent Test**: Load a project, open the Mixer panel, add/remove/rename/replace arrangement instruments, and confirm the visible strips stay correct without reopening the panel.

### Tests for User Story 1

- [x] T018 [P] [US1] Add Mixer panel rendering tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/mixer-panel.test.tsx`
- [x] T019 [P] [US1] Add channel, subchannel, and master synchronization tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/mixer-arrangement-sync.test.tsx`
- [x] T020 [P] [US1] Add workbench open/focus tests for `MixerTopComponent` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-mixer-panel.test.tsx`

### Implementation for User Story 1

- [x] T021 [US1] Route `MixerTopComponent` to a real Mixer panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [x] T022 [US1] Implement the panel shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/MixerPanel.tsx`
- [x] T023 [US1] Implement strip-layout components in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/mixer/`
- [x] T024 [US1] Wire channel property edits through mixer patches in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [x] T025 [US1] Add empty, disabled, and selection states in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/MixerPanel.tsx`
- [x] T026 [US1] Update workbench store or panel-opening helpers as needed for Mixer focus behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`

**Checkpoint**: The app has a usable Mixer panel even before deeper effect editing lands.

---

## Phase 4: User Story 2 - Build Effect Chains From The User Library (Priority: P1)

**Goal**: Load the user's effects library safely, expose a modal management surface, and support chain authoring from the Mixer panel.

**Independent Test**: Open the effects library modal from the menu, add effects and sends to a channel, reorder or remove entries, and confirm `~/.blue` is not modified.

### Tests for User Story 2

- [x] T027 [P] [US2] Add effects-library modal and loading tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/effects-library-modal.test.tsx`
- [x] T028 [P] [US2] Add mixer chain interaction tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/mixer-chain-editing.test.tsx`
- [x] T029 [P] [US2] Add no-save library safety tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/mixer-effects-library.test.ts`

### Implementation for User Story 2

- [x] T030 [US2] Implement the modal library-management surface in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/EffectLibraryModal.tsx`
- [x] T031 [US2] Implement effects-library tree components in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/mixer/library/`
- [x] T032 [US2] Wire menu-command handling for the library modal in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx` or the current native-command listener seam
- [x] T033 [US2] Implement add-effect, add-send, remove, enable/disable, and reorder actions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/mixer/`
- [x] T034 [US2] Implement mixer patch handlers for effect and send operations in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T035 [US2] Implement send target and level editing UI in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/mixer/`
- [x] T036 [US2] Add library reload support in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/mixer-effects-library.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/EffectLibraryModal.tsx`

**Checkpoint**: The Mixer panel can build and manage practical effect chains from the user's session-loaded library.

---

## Phase 5: User Story 3 - Open Dedicated Effect Editing Surfaces (Priority: P2)

**Goal**: Add reusable non-modal effect editor windows and connect them to project or library-owned effect models.

**Independent Test**: Open an effect editor twice for the same effect, verify focus reuse, edit interface/code/UDO content, and confirm the backing model updates.

### Tests for User Story 3

- [x] T037 [P] [US3] Add effect-editor renderer tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/effect-editor-window.test.tsx`
- [x] T038 [P] [US3] Add project-effect mutation round-trip tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/mixer-effect-editor-contract.test.ts`
- [x] T039 [P] [US3] Add library-effect mutation tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/mixer-effects-library.test.ts`

### Implementation for User Story 3

- [x] T040 [US3] Implement effect-editor window creation and reuse in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/effect-editor-window-manager.ts`
- [x] T041 [US3] Add the effect-editor renderer shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/effect-editor.tsx`
- [x] T042 [US3] Compose interface, code, and UDO tabs using existing surfaces in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/effect-editor/`
- [x] T043 [US3] Adapt `SelectedCodeEditor` to effect ORC usage and required context-menu affordances in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx` and related menu helpers
- [x] T044 [US3] Wire project-owned effect edits back through mixer patches in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/effect-editor/`
- [x] T045 [US3] Wire library-owned effect edits back through the effects-library session service in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/effect-editor/` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/mixer-effects-library.ts`
- [x] T046 [US3] Close or reconcile orphaned effect-editor windows when their backing effect is removed in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/effect-editor-window-manager.ts`

**Checkpoint**: The core Mixer workflow is complete: panel, library-driven chain editing, and dedicated effect editing all function together.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and handoff preparation.

- [x] T047 [P] Update `/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/quickstart.md` with any implementation-specific validation notes discovered during development
- [x] T048 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with Spec 034 implementation progress, validation results, and the planned boundary with Spec 035
- [x] T049 Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [x] T050 Run `pnpm --filter @blue/app build` from `/Users/stevenyi/work/blue-electron`
- [x] T051 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron` if the mixer-model audit changed `@blue/data`
- [x] T052 Run `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` from `/Users/stevenyi/work/blue-electron`
- [x] T053 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`
- [x] T054 Perform the manual Mixer, library, and effect-editor scenarios from `/Users/stevenyi/work/blue-electron/specs/034-mixer-editor-core/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP for this slice.
- **User Story 2 (Phase 4)**: Depends on Foundational and builds directly on the Mixer panel from US1.
- **User Story 3 (Phase 5)**: Depends on Foundational and benefits from US2 because effect editors need the same project/library contracts.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundational.
- **US2 (P1)**: Depends on Foundational and the Mixer panel route from US1.
- **US3 (P2)**: Depends on Foundational and is most efficient after US2 establishes project vs. library effect ownership.

### Parallel Opportunities

- Setup inventory tasks T002-T005 can run in parallel.
- Foundational tests T006-T009 can run in parallel.
- US1 tests T018-T020 can run in parallel.
- US2 tests T027-T029 can run in parallel.
- US3 tests T037-T039 can run in parallel.
- Polish documentation tasks T047-T048 can run in parallel.

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Validate arrangement-driven mixer synchronization.
4. Stop and review before expanding into library and effect-editor workflows.

### Incremental Delivery

1. Land mixer snapshot and patch support plus arrangement reconciliation.
2. Land the Mixer panel.
3. Land session-owned effects library loading and chain authoring.
4. Land reusable effect-editor windows.
5. Finish validation and handoff notes.

### Handoff Notes

- Keep library writes out of scope; this slice is intentionally read-from-disk and mutate-in-memory only.
- If the initial audit discovers missing `@blue/data` effect fields needed for comments or editor reuse, add them narrowly and cover them with tests rather than widening the spec.
- Deeper metering, import/export polish, and advanced routing validation are reserved for Spec 035.
