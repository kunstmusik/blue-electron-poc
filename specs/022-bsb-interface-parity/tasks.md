# Tasks: BlueSynthBuilder Interface Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/spec.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/022-bsb-interface-parity/contracts/bsb-interface-parity-surface.md`

**Tests**: Tests are required by FR-012. Add data-layer round-trip/preservation coverage and renderer/store coverage before considering each story complete.

**Organization**: Tasks are grouped by user story to preserve independently testable increments on top of the closed Spec 021 baseline.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the new BSB-only component boundaries and dedicated test entry points before deeper data/UI work begins.

- [x] T001 Create BSB renderer helper component scaffolds in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceCanvas.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBPropertySheet.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBGridSettingsPanel.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBPresetBar.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBOpcodeListEditor.tsx`
- [x] T002 [P] Add dedicated Spec 022 test entry points in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-interface-editor.test.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-udo-panel.test.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Expand the BSB data model, snapshot contract, and optimistic patch flow that every user story depends on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T003 Port BSB preset model classes and XML round-trip coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/preset.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/preset-group.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/preset-group.test.ts`
- [x] T004 Extend BSB graphic-interface and widget helpers for structured grid settings, stable widget identities, and hierarchy-preserving mutations in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-group.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-widget.ts`
- [x] T005 Extend `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.test.ts` for preset-group persistence, richer interface snapshots, edit-enabled/grid-state support, and embedded opcode-list mutation helpers
- [x] T006 Extend the shared BSB snapshot and patch contract in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T007 Extend optimistic BSB interface patch handling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [x] T008 [P] Add shared contract/store coverage for richer BSB snapshots and patches in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/orchestra-contract.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts`

**Checkpoint**: BSB preset/interface/opcode state is serializable, patchable, and safe to drive from renderer UI.

---

## Phase 3: User Story 1 - Edit the BSB interface surface (Priority: P1) 🎯 MVP

**Goal**: Replace the Spec 021 Interface placeholder with a real editable BSB interface surface that supports selection, edit mode, and layout interaction.

**Independent Test**: Open a BSB-heavy project, switch to `Interface`, enable editing, select a widget, move or resize it, save, reopen, and confirm the interface edits persist without losing widget XML.

### Tests for User Story 1

- [x] T009 [P] [US1] Add renderer coverage for the BSB interface canvas, edit-mode toggle, and selection behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-interface-editor.test.tsx`
- [x] T010 [P] [US1] Add BSB interface mutation regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.test.ts`

### Implementation for User Story 1

- [x] T011 [US1] Implement the BSB interface canvas and widget selection surface in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceCanvas.tsx`
- [x] T012 [US1] Replace the Interface placeholder with a split-shell editor, edit-mode toggle, and canvas host in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx`
- [x] T013 [US1] Wire widget selection, move, and resize patch dispatch through `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [x] T014 [US1] Render preserved-only widget warnings and empty-interface states in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceCanvas.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx`

**Checkpoint**: User Story 1 should now deliver an actual editable Interface surface and the minimum viable Spec 022 parity outcome.

---

## Phase 4: User Story 2 - Edit widget properties and grid behavior (Priority: P1)

**Goal**: Add the Java-style property-sheet and grid controls needed for precise BSB interface editing, while keeping code completion synchronized.

**Independent Test**: Select representative widgets, edit their object-name/layout/range properties and grid settings from the Interface tab, save, reopen, and confirm the interface and BSB Code completions reflect the updated state.

### Tests for User Story 2

- [x] T015 [P] [US2] Add renderer coverage for property-sheet editing and grid-settings behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-interface-editor.test.tsx`
- [x] T016 [P] [US2] Add completion-synchronization regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-editor.test.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts`

### Implementation for User Story 2

- [x] T017 [P] [US2] Implement the BSB widget property sheet in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBPropertySheet.tsx`
- [x] T018 [P] [US2] Implement the BSB grid-settings editor in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBGridSettingsPanel.tsx`
- [x] T019 [US2] Compose property-sheet and grid tabs into `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx`
- [x] T020 [US2] Wire property and grid patch application through `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [x] T021 [US2] Refresh BSB object-name completion synchronization in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBCodeEditor.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/bsb-completions.ts`

**Checkpoint**: User Story 2 should now deliver precise widget/grid editing and live Code-tab completion updates.

---

## Phase 5: User Story 3 - Use BSB presets and embedded UDO editing (Priority: P2)

**Goal**: Replace the remaining BSB placeholders with preset application and embedded opcode-list editing.

**Independent Test**: Open a BSB instrument that contains presets and local UDOs, apply a preset, edit the embedded opcode list, save, reopen, and confirm both preset metadata and opcode-list contents persist.

### Tests for User Story 3

- [x] T022 [P] [US3] Add preset-application and opcode-list persistence coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-udo-panel.test.tsx`
- [x] T023 [P] [US3] Add preset-bar and empty-state renderer coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-interface-editor.test.tsx`

### Implementation for User Story 3

- [x] T024 [P] [US3] Implement preset browsing and preset-application UI in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBPresetBar.tsx`
- [x] T025 [US3] Compose preset controls into `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx`
- [x] T026 [P] [US3] Implement the embedded opcode-list editor surface in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBOpcodeListEditor.tsx`
- [x] T027 [US3] Replace the Spec 021 UDO placeholder with the embedded opcode-list editor in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBUDOPanel.tsx`
- [x] T028 [US3] Wire preset application and embedded opcode-list patches through `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts`

**Checkpoint**: User Story 3 should now deliver real preset use and BSB-local UDO editing with Java-style split-view table/editor workflow.

---

## Phase 6: User Story 4 - Preserve unsupported BSB data safely (Priority: P2)

**Goal**: Ensure supported edits remain non-destructive for unsupported or partially ported widget and preset structures.

**Independent Test**: Load a BSB-heavy project containing unsupported widget or preset structures, perform supported interface edits, save, reopen, and confirm the unsupported data still round-trips.

### Tests for User Story 4

- [x] T029 [P] [US4] Add unsupported widget and preset preservation coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-interface-editor.test.tsx`

### Implementation for User Story 4

- [x] T030 [US4] Preserve unsupported widget and preset structures in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts`
- [x] T031 [US4] Render preserved-only widget limitation states in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceCanvas.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBPropertySheet.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBPresetBar.tsx`
- [x] T032 [US4] Add non-destructive warning and empty-state handling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBUDOPanel.tsx`

**Checkpoint**: All user stories should now be independently functional without silent BSB data loss.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and handoff updates after the BSB parity stories land.

- [x] T033 [P] Refresh implementation handoff docs in `/Users/stevenyi/work/blue-electron/STATUS.md`, `/Users/stevenyi/work/blue-electron/AGENTS.md`, `/Users/stevenyi/work/blue-electron/CLAUDE.md`, and `/Users/stevenyi/work/blue-electron/.github/copilot-instructions.md`
- [x] T034 Run validation commands `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check` from `/Users/stevenyi/work/blue-electron`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks every user story.
- **User Stories (Phases 3-6)**: Depend on Foundational.
- **Polish (Phase 7)**: Depends on the completed story scope.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational and delivers the MVP Interface surface.
- **US2 (P1)**: Starts after Foundational and builds on the US1 canvas/selection shell for precise property and grid editing.
- **US3 (P2)**: Starts after Foundational and integrates most cleanly after US1 establishes the interface shell.
- **US4 (P2)**: Starts after Foundational but should be completed after the major editing paths are in place so preservation is validated against real supported edits.

### Within Each User Story

- Data-layer and renderer tests should be added before or alongside implementation for the touched story files.
- Shared contract/store changes must land before renderer composition that depends on the new BSB patch variants.
- Renderer surfaces should extend the Spec 021 BSB baseline rather than replacing the stable code-tab behavior.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T003, T004, and T008 can run in parallel after the file scaffolds exist.
- Within US1, T009 and T010 can run in parallel before UI work begins.
- Within US2, T017 and T018 can run in parallel.
- Within US3, T024 and T026 can run in parallel.
- US4 test coverage can be prepared in parallel with late US2/US3 implementation once the shared patch shape is stable.

---

## Parallel Example: User Story 2

```bash
# Add User Story 2 coverage in parallel:
Task: "Add renderer coverage for property-sheet editing and grid-settings behavior in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-interface-editor.test.tsx"
Task: "Add completion-synchronization regression coverage in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/bsb-editor.test.tsx and /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts"

# Build User Story 2 UI pieces in parallel:
Task: "Implement the BSB widget property sheet in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBPropertySheet.tsx"
Task: "Implement the BSB grid-settings editor in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBGridSettingsPanel.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate that the Interface tab is now a real editable BSB surface before expanding into property sheets, presets, and UDO work.

### Incremental Delivery

1. Land the Interface canvas and edit-mode shell (US1).
2. Add precise property/grid editing and code-completion synchronization (US2).
3. Replace the remaining BSB placeholders with preset application and embedded opcode editing (US3).
4. Finish with unsupported-data hardening and final validation (US4 + Phase 7).