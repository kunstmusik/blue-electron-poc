# Tasks: MIDI Input Panel And Virtual Keyboard Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required by FR-013 and the constitution's serialization/test-first rules. Write MIDI processor and note-routing tests before or alongside the implementation they cover.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently once the foundational snapshot and note-routing contracts are in place.

## Phase 1: Setup (Shared Context)

**Purpose**: Confirm the Java parity anchors and the exact TypeScript extension points before code changes begin.

- [ ] T001 Review Java MIDI UI/runtime anchors in `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/research.md`
- [ ] T002 [P] Inventory current TypeScript MIDI processor and scale helpers in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-key-mapping.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-velocity-mapping.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/piano-roll/scale.ts`
- [ ] T003 [P] Inventory current workbench and toolbar seams in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
- [ ] T004 [P] Inventory current project snapshot/patch and Blue Live IPC seams in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the project-data and runtime-trigger contracts that every story depends on.

**Critical**: No user story work should begin until this phase is complete.

### Tests

- [ ] T005 [P] Add typed scale round-trip coverage for MIDI input processor state in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.test.ts`
- [ ] T006 [P] Add pure MIDI trigger-mapping tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-trigger-routing.test.ts`
- [ ] T007 [P] Add project snapshot and patch contract tests for MIDI input state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/midi-input-contract.test.ts`
- [ ] T008 [P] Add main-process Blue Live note-trigger IPC tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-midi-routing.test.ts`

### Implementation

- [ ] T009 Add typed scale accessors or adapters to `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.ts`
- [ ] T010 Add pure Java-compatible MIDI trigger mapping helpers in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-trigger-routing.ts` and export them from `/Users/stevenyi/work/blue-electron/packages/blue-data/src/index.ts`
- [ ] T011 Extend project snapshot and patch types with `midiInput` state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [ ] T012 Add snapshot creation and patch application helpers for MIDI input state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [ ] T013 Add renderer store helpers for MIDI input patches in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [ ] T014 Add Blue Live note-trigger preload/global API in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`
- [ ] T015 Add Blue Live note-trigger handling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`

**Checkpoint**: Canonical project MIDI state and Blue Live note-trigger routing are ready for panel work.

---

## Phase 3: User Story 1 - Configure MIDI Input Processing Like Java Blue (Priority: P1) MVP

**Goal**: Replace the placeholder MIDI Input panel with a project-backed editor for Java-compatible MIDI processor settings.

**Independent Test**: Load a project, open MIDI Input, change key mapping, scale, pitch constant, velocity mapping, and amp constant, save/reopen the project, and confirm the same values are restored.

### Tests for User Story 1

- [ ] T016 [P] [US1] Add MIDI Input panel rendering and edit tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/midi-input-panel.test.tsx`
- [ ] T017 [P] [US1] Add toolbar MIDI Input open/focus tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/blue-live-toolbar.test.tsx`
- [ ] T018 [P] [US1] Add MIDI input save/reopen contract coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/midi-input-contract.test.ts`

### Implementation for User Story 1

- [ ] T019 [US1] Route `MidiInputPanelTopComponent` to a real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [ ] T020 [US1] Implement the panel shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/MidiInputPanel.tsx`
- [ ] T021 [US1] Implement Java-style key mapping, velocity mapping, pitch constant, and amp constant controls in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/midi-input/MidiInputRealtimeTab.tsx`
- [ ] T022 [US1] Implement scale viewing and editing using the typed scale snapshot in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/midi-input/MidiScaleEditor.tsx`
- [ ] T023 [US1] Wire MIDI Input panel edits through the project-store patch path in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [ ] T024 [US1] Replace the deferred toolbar `MIDI Input` behavior with open/focus logic in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`

**Checkpoint**: User Story 1 is independently testable and MIDI processor edits persist through save/reopen.

---

## Phase 4: User Story 2 - Trigger Blue Live Instruments From The Virtual Keyboard (Priority: P1)

**Goal**: Replace the placeholder Virtual Keyboard with a Java-compatible live trigger surface for Blue Live.

**Independent Test**: Load a project, start Blue Live, open Virtual Keyboard, play notes with mouse and computer keyboard, change channel/octave/velocity settings, and confirm note-on, note-off, and All Notes Off behave correctly.

### Tests for User Story 2

- [ ] T025 [P] [US2] Add Virtual Keyboard mouse and computer-key interaction tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/virtual-keyboard-panel.test.tsx`
- [ ] T026 [P] [US2] Add Blue Live note-on, note-off, and All Notes Off routing tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-midi-routing.test.ts`
- [ ] T027 [P] [US2] Add Virtual Keyboard disabled-state tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/virtual-keyboard-panel.test.tsx`

### Implementation for User Story 2

- [ ] T028 [US2] Route `VirtualKeyboardTopComponent` to a real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [ ] T029 [US2] Implement the panel shell and controls in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/VirtualKeyboardPanel.tsx`
- [ ] T030 [US2] Implement Java-compatible computer-key mapping and transient pressed-note state helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/virtual-keyboard/keyboard-mapping.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/virtual-keyboard/useVirtualKeyboardState.ts`
- [ ] T031 [US2] Wire mouse and computer-key note-on/note-off events to Blue Live note-trigger IPC in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/VirtualKeyboardPanel.tsx`
- [ ] T032 [US2] Apply `MidiInputProcessor`-based trigger mapping before score submission in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-trigger-routing.ts`
- [ ] T033 [US2] Reuse the existing Blue Live All Notes Off path from the Virtual Keyboard and clear local pressed-note state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/VirtualKeyboardPanel.tsx`
- [ ] T034 [US2] Add safe no-project and Blue Live stopped behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/VirtualKeyboardPanel.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`

**Checkpoint**: User Stories 1 and 2 together deliver the requested manual Blue Live trigger workflow.

---

## Phase 5: User Story 3 - Integrate Both Panels Into The Existing Workbench Design (Priority: P2)

**Goal**: Make the two panels feel native to the current Electron workbench while preserving Java labels and placement.

**Independent Test**: Open both panels through the current workbench flows, confirm neither renders placeholder content, and confirm panel focus/docking behavior remains stable.

### Tests for User Story 3

- [ ] T035 [P] [US3] Add non-placeholder rendering tests for both panels in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/midi-workbench-panels.test.tsx`
- [ ] T036 [P] [US3] Add auxiliary and output placement regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-store.test.ts`

### Implementation for User Story 3

- [ ] T037 [US3] Ensure `MidiInputPanelTopComponent` opens and focuses through the current auxiliary panel flows in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [ ] T038 [US3] Ensure `VirtualKeyboardTopComponent` participates in the current output panel flows in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [ ] T039 [US3] Add MIDI Input panel styling consistent with existing properties-side surfaces in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles.css`
- [ ] T040 [US3] Add Virtual Keyboard styling and responsive layout consistent with the current output panel design in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles.css`
- [ ] T041 [US3] Verify the final panel labels, grouping, and rail behavior against the registered workbench descriptors in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`

**Checkpoint**: Both panels are integrated into the workbench and no longer present as deferred placeholders.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and handoff preparation after implementation.

- [ ] T042 [P] Update `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/quickstart.md` with any implementation-specific validation notes discovered during development
- [ ] T043 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with Spec 033 implementation progress, validation results, and any remaining deferrals
- [ ] T044 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [ ] T045 Run `pnpm --filter @blue/data build` from `/Users/stevenyi/work/blue-electron`
- [ ] T046 Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [ ] T047 Run `pnpm --filter @blue/app build` from `/Users/stevenyi/work/blue-electron`
- [ ] T048 Run `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` from `/Users/stevenyi/work/blue-electron`
- [ ] T049 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`
- [ ] T050 Perform the manual MIDI Input, Virtual Keyboard, workbench integration, and disabled-state scenarios from `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP for this slice.
- **User Story 2 (Phase 4)**: Depends on Foundational and should follow or land alongside US1 because it consumes the new project MIDI state.
- **User Story 3 (Phase 5)**: Depends on the panel implementations from US1 and US2.
- **Polish (Phase 6)**: Depends on the selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundational.
- **US2 (P1)**: Depends on the Foundational note-trigger contract and benefits from US1 because the manual workflow edits MIDI Input settings before live triggering.
- **US3 (P2)**: Depends on US1 and US2 because it integrates the completed panels into the workbench.

### Parallel Opportunities

- Setup inventory tasks T002-T004 can run in parallel.
- Foundational tests T005-T008 can run in parallel.
- US1 tests T016-T018 can run in parallel.
- US2 tests T025-T027 can run in parallel.
- US3 tests T035-T036 can run in parallel.
- Polish documentation tasks T042 and T043 can run in parallel.

## Parallel Example: Foundational Phase

```text
Task: "Add typed scale round-trip coverage for MIDI input processor state in packages/blue-data/src/midi/midi-input-processor.test.ts"
Task: "Add pure MIDI trigger-mapping tests in packages/blue-data/src/midi/midi-trigger-routing.test.ts"
Task: "Add main-process Blue Live note-trigger IPC tests in packages/blue-app/src/main/blue-live-midi-routing.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "Add Virtual Keyboard mouse and computer-key interaction tests in packages/blue-app/src/renderer/tests/virtual-keyboard-panel.test.tsx"
Task: "Implement computer-key mapping and transient pressed-note state helpers in packages/blue-app/src/renderer/components/workbench/panels/virtual-keyboard/keyboard-mapping.ts and useVirtualKeyboardState.ts"
Task: "Apply MidiInputProcessor-based trigger mapping before score submission in packages/blue-app/src/main/blue-live-engine.ts and packages/blue-data/src/midi/midi-trigger-routing.ts"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Validate MIDI Input snapshot, patch, and save/reopen behavior.
4. Stop and review before expanding into live note triggering.

### Incremental Delivery

1. Land canonical MIDI input snapshot and patch support.
2. Land the MIDI Input panel.
3. Land the Virtual Keyboard Blue Live trigger path.
4. Finish workbench integration and final validation.

### Handoff Notes

- Keep external MIDI device enumeration and background hardware input out of this slice.
- Use the Java MIDI UI/runtime files listed in `research.md` as the parity source when behavior is unclear.
- Keep pitch and velocity mapping logic in a pure helper rather than in renderer code.
- Keep `.specify/feature.json` aligned to `specs/033-midi-input-virtual-keyboard-parity` while this branch is active so spec-kit scripts resolve the correct directory.