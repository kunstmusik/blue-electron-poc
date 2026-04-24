# Tasks: Orchestra Editor Implementation

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required by FR-020 and the constitution's serialization rule. Data serialization tests come before renderer integration.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, documentation, and package setup needed before feature implementation.

- [X] T001 Add `@tanstack/react-table` dependency to `/Users/stevenyi/work/blue-electron/packages/blue-app/package.json` and `/Users/stevenyi/work/blue-electron/pnpm-lock.yaml`
- [X] T002 [P] Document Java Orchestra source anchors and TanStack Table decision in `/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/research.md`
- [X] T003 [P] Verify `/Users/stevenyi/work/blue-electron/AGENTS.md` includes Spec 021 technology context for TanStack Table and Orchestra editor planning

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data compatibility and shared project document contracts that block all user stories.

**Critical**: No user story implementation should begin until these are complete.

- [X] T004 Add instrument comment support to `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/instrument.ts`
- [X] T005 [P] Add XML round-trip tests for GenericInstrument comments/opcode/global fields in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/generic-instrument.test.ts`
- [X] T006 Add Java-compatible comment XML load/save support to `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/generic-instrument.ts`
- [X] T007 [P] Add JavaScriptInstrument data class and XML tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/javascript-instrument.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/javascript-instrument.test.ts`
- [X] T008 [P] Add PythonInstrument preservation class and XML tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/python-instrument.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/python-instrument.test.ts`
- [X] T009 [P] Add BlueX7 data preservation class and XML tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-x7.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-x7.test.ts`
- [X] T010 Expand instrument registry mappings in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/instrument-registry.ts`
- [X] T011 Export new instrument classes from `/Users/stevenyi/work/blue-electron/packages/blue-data/src/index.ts`
- [X] T012 Add arrangement mutation helpers and XML tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/arrangement.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/arrangement.test.ts`
- [X] T013 Extend project editor shared snapshot/patch types for orchestra data in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [X] T014 Extend main-process project patch handling for orchestra mutations in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [X] T015 Extend preload and renderer global typings for orchestra snapshot/patch flow in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`
- [X] T016 Extend project store state/actions for orchestra snapshots and mutations in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [X] T017 [P] Add shared contract tests for orchestra snapshot/patch behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/orchestra-contract.test.ts`

**Checkpoint**: Data model, IPC contract, and store plumbing are ready.

---

## Phase 3: User Story 1 - Manage Project Arrangement Instruments (Priority: P1) MVP

**Goal**: The Orchestra tab shows project arrangement rows and supports core row mutations.

**Independent Test**: Open a project, select arrangement rows, add/remove/copy/paste/replace/convert supported instruments, save/reopen, and confirm arrangement data persists.

### Tests for User Story 1

- [X] T018 [P] [US1] Add arrangement panel rendering tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/orchestra-arrangement.test.tsx`
- [X] T019 [P] [US1] Add arrangement mutation tests for add/remove/replace/convert in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/orchestra-arrangement-actions.test.tsx`

### Implementation for User Story 1

- [X] T020 [US1] Route `OrchestraTopComponent` to a real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [X] T021 [US1] Create Orchestra panel split layout in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/OrchestraPanel.tsx`
- [X] T022 [US1] Implement TanStack-backed arrangement table in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/ArrangementPanel.tsx`
- [X] T023 [US1] Implement arrangement table columns/actions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/arrangement-table/arrangement-columns.tsx`
- [X] T024 [US1] Add arrangement context menu actions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/ArrangementContextMenu.tsx`
- [X] T025 [US1] Wire arrangement row selection and mutation dispatch in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/ArrangementPanel.tsx`

**Checkpoint**: User Story 1 is independently testable.

---

## Phase 4: User Story 2 - Edit Selected Instrument and Comments (Priority: P1)

**Goal**: Selecting an arrangement instrument opens editor/comments tabs and persists comments.

**Independent Test**: Select an instrument, edit comments, switch selection away/back, save/reopen, and confirm comments persist.

### Tests for User Story 2

- [X] T026 [P] [US2] Add instrument editor routing and comments tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/orchestra-instrument-editor-panel.test.tsx`

### Implementation for User Story 2

- [X] T027 [US2] Implement editor/comments tab shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/InstrumentEditorPanel.tsx`
- [X] T028 [US2] Implement comments editor in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/InstrumentCommentsPanel.tsx`
- [X] T029 [US2] Implement no-selection and unsupported-instrument states in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/InstrumentEditorPanel.tsx`
- [X] T030 [US2] Connect selected arrangement row to editor/comments tabs in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/OrchestraPanel.tsx`

**Checkpoint**: User Story 2 is independently testable.

---

## Phase 5: User Story 3 - Edit Java Blue Instrument Types (Priority: P1)

**Goal**: Provide usable editors for GenericInstrument, JavaScriptInstrument, BlueX7, BlueSynthBuilder, and a dummy PythonInstrument panel.

**Independent Test**: Create or load each instrument type, edit representative fields, save/reopen, and verify data and generated output remain compatible.

### Tests for User Story 3

- [X] T031 [P] [US3] Add GenericInstrument and JavaScriptInstrument editor tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/orchestra-code-instrument-editors.test.tsx`
- [X] T032 [P] [US3] Add BlueX7 editor preservation tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/blue-x7-editor.test.tsx`
- [X] T033 [P] [US3] Add BlueSynthBuilder editor/generation tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-editor.test.tsx`
- [X] T034 [P] [US3] Add Python dummy panel tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/python-instrument-dummy.test.tsx`

### Implementation for User Story 3

- [X] T035 [US3] Implement GenericInstrument editor in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/GenericInstrumentEditor.tsx`
- [X] T036 [US3] Implement JavaScriptInstrument editor in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/JavaScriptInstrumentEditor.tsx`
- [X] T037 [US3] Implement Python dummy panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/PythonInstrumentDummyPanel.tsx`
- [X] T038 [US3] Implement BlueX7 editor baseline in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/BlueX7Editor.tsx`
- [X] T039 [US3] Expand BSB data load/save and object-name helpers in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts`
- [X] T040 [US3] Implement BSB code editor tabs in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBCodeEditor.tsx`
- [X] T041 [US3] Implement BSB interface editor shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx`
- [X] T042 [US3] Implement BSB widget editors for currently ported widgets in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBWidgetEditor.tsx`
- [X] T043 [US3] Implement BlueSynthBuilder editor composition in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/BlueSynthBuilderEditor.tsx`
- [X] T044 [US3] Add BSB object-name completion source in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/bsb-completions.ts`
- [X] T045 [US3] Register all instrument editors in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/InstrumentEditorPanel.tsx`

**Checkpoint**: User Story 3 is independently testable.

---

## Phase 6: User Story 4 - Temporary Library Area (Priority: P2)

**Goal**: Preserve the Java layout insertion point while clearly deferring program-wide orchestra library parity.

**Independent Test**: Open Orchestra and confirm the temporary library area is visible, labeled, and non-blocking.

- [X] T046 [P] [US4] Add temporary library panel test in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/temporary-instrument-library.test.tsx`
- [X] T047 [US4] Implement temporary library panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/TemporaryInstrumentLibraryPanel.tsx`
- [X] T048 [US4] Integrate temporary library panel into left split in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/OrchestraPanel.tsx`

---

## Phase 7: User Story 5 - Arrangement Table Foundation Decision (Priority: P2)

**Goal**: Keep the table decision traceable and verify the chosen table foundation supports required behavior.

**Independent Test**: Review planning docs and arrangement table implementation to confirm TanStack Table is documented and used only as a headless behavior layer.

- [X] T049 [US5] Update `/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/research.md` after implementation if TanStack Table findings changed
- [X] T050 [US5] Add implementation note for arrangement table behavior in `/Users/stevenyi/work/blue-electron/specs/021-orchestra-editor/quickstart.md`

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validation, cleanup, and documentation updates after the feature stories.

- [X] T051 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with Spec 021 progress and any deferrals
- [X] T052 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [X] T053 Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [X] T054 Run `pnpm --filter @blue/app build` from `/Users/stevenyi/work/blue-electron`
- [X] T055 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational.
- **Polish**: Depends on the implemented story scope.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; provides selected arrangement rows.
- **US2 (P1)**: Starts after Foundational; integrates with US1 selection but can be tested with mocked snapshots.
- **US3 (P1)**: Starts after Foundational and US2 editor shell.
- **US4 (P2)**: Starts after OrchestraPanel exists.
- **US5 (P2)**: Starts during setup/planning and completes after arrangement table implementation.

### Parallel Opportunities

- Setup documentation tasks T002-T003 can run in parallel.
- Data model classes T007-T009 can run in parallel after T004.
- Renderer tests T018-T019, T026, T031-T034 can be written in parallel once contracts are stable.
- Instrument editor components T035-T038 can be developed in parallel after T027.
- BSB component subtasks T040-T042 can be parallelized after T039.

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete US1 arrangement panel and mutations.
3. Validate opening Orchestra, selecting rows, and saving arrangement changes.

### Incremental Delivery

1. Add editor/comments shell (US2).
2. Add code-based instrument editors and Python dummy panel.
3. Add BlueX7 and BlueSynthBuilder in staged slices.
4. Add temporary library panel and final documentation polish.
