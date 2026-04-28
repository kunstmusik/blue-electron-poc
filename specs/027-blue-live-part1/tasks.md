# Tasks: Blue Live Part 1

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required by FR-027 and the constitution's serialization rule. Write test tasks before the implementation tasks they cover.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently after the foundational phase.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm parity anchors and create focused test entry points before implementation.

- [ ] T001 Review Java Blue Live source anchors in `/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/research.md` and record any discovered implementation deltas there
- [ ] T002 [P] Inventory current TypeScript LiveData and live object stubs in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live-data.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live/live-object.ts`
- [ ] T003 [P] Inventory current Blue Live toolbar behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
- [ ] T004 [P] Inventory current realtime engine lifecycle extension points in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/engine-bridge.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Java-compatible LiveData and a separable engine/session contract. No user story work should begin until this phase is complete.

### Tests

- [ ] T005 [P] Add Java-compatible LiveData XML round-trip tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live-data.test.ts`
- [ ] T006 [P] Add LiveObject XML and deep-copy tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live/live-object.test.ts`
- [ ] T007 [P] Add LiveObjectBins row/column/set-reference tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live/live-object-bins.test.ts`
- [ ] T008 [P] Add Blue Live project snapshot/patch contract tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/blue-live-contract.test.ts`
- [ ] T009 [P] Add injectable engine-session lifecycle tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.test.ts`

### Implementation

- [ ] T010 Implement Java-compatible `LiveData` fields/load/save/deepCopy in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live-data.ts`
- [ ] T011 Implement Java-compatible `LiveObject` uniqueId/triggers/enabled/SoundObject XML in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live/live-object.ts`
- [ ] T012 Implement Java-compatible `LiveObjectBins` grid operations and enabled-set helpers in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live/live-object-bins.ts`
- [ ] T013 Implement Java-compatible `LiveObjectSet` name/ref XML in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live/live-object-set.ts`
- [ ] T014 Implement Java-compatible `LiveObjectSetList` load/save/deepCopy behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live/live-object-set-list.ts`
- [ ] T015 Export updated LiveData/live object APIs from `/Users/stevenyi/work/blue-electron/packages/blue-data/src/index.ts`
- [ ] T016 Extend project snapshot and patch types for Blue Live in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [ ] T017 Implement main-process Blue Live patch application helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [ ] T018 Add Blue Live IPC/preload/global typings in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`
- [ ] T019 Create separable Blue Live engine session helper in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`

**Checkpoint**: LiveData round-trips safely, renderer contracts can represent LiveData, and main process has a testable Blue Live engine-session abstraction.

---

## Phase 3: User Story 1 - Run Blue Live From The Toolbar (Priority: P1) - MVP

**Goal**: Toolbar `Blue Live` toggles a Blue Live-specific engine session without focusing the editor, and that session can run beside realtime playback.

**Independent Test**: Open a project, select another editor, press `Blue Live`, confirm the editor selection does not change, Blue Live starts, and realtime playback remains independently controlled.

### Tests for User Story 1

- [ ] T020 [P] Add Blue Live CSD generation tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-live-csd.test.ts`
- [ ] T021 [P] Add toolbar no-editor-focus/toggle tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/blue-live-toolbar.test.tsx`
- [ ] T022 [P] Add main-process Blue Live/realtime independence tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.test.ts`
- [ ] T023 [P] Add Blue Live status store tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/blue-live-store.test.ts`

### Implementation for User Story 1

- [ ] T024 [US1] Implement `BlueData.toBlueLiveCSD()` entry point in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- [ ] T025 [US1] Add Blue Live CSD generation helpers for long-duration live score, global setup, always-on instruments, mixer support, and no tempo map in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- [ ] T026 [US1] Add Blue Live macro and option handling support in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`
- [ ] T027 [US1] Update engine session startup to use distinct ports/shared-memory/output tab in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`
- [ ] T028 [US1] Wire Blue Live IPC handlers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T029 [US1] Add renderer Blue Live state store in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/blue-live-store.ts`
- [ ] T030 [US1] Wire Blue Live status listeners in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts`
- [ ] T031 [US1] Replace `openPanel('BlueLiveTopComponent')` with runtime toggle behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
- [ ] T032 [US1] Disable or safely reject Blue Live toolbar toggle when no project is loaded in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
- [ ] T033 [US1] Route Blue Live output reset/select/write events to `Csound (Blue Live)` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T034 [US1] Stop Blue Live on project load/switch and quit cleanup in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Recompile And Silence Blue Live (Priority: P1)

**Goal**: `Recompile` restarts Blue Live from current project state and `All Notes Off` sends the Java-compatible event.

**Independent Test**: Start Blue Live, press Recompile, confirm a fresh session replaces the old one, then press All Notes Off and confirm the event is sent.

### Tests for User Story 2

- [ ] T035 [P] Add Recompile lifecycle tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.test.ts`
- [ ] T036 [P] Add All Notes Off CSD instrument tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-live-csd.test.ts`
- [ ] T037 [P] Add toolbar Recompile/All Notes Off enablement tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/blue-live-toolbar.test.tsx`

### Implementation for User Story 2

- [ ] T038 [US2] Generate `blueAllNotesOff` instrument in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- [ ] T039 [US2] Implement `recompileBlueLive` stop/regenerate/start behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`
- [ ] T040 [US2] Implement All Notes Off score submission in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`
- [ ] T041 [US2] Wire Recompile and All Notes Off IPC handlers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T042 [US2] Wire Recompile and All Notes Off buttons to IPC in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
- [ ] T043 [US2] Keep `MIDI Input` visibly deferred or disabled in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
- [ ] T044 [US2] Surface Recompile/All Notes Off errors through Blue Live status state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/blue-live-store.ts`

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Edit Live Space, Live Code, And Options (Priority: P2)

**Goal**: Blue Live editor renders Live Space, Live Code, and Options tabs with project-backed persistence.

**Independent Test**: Open Blue Live editor, edit LiveData values, save/reopen, and confirm values persist while SCO Pad and SoundObject editor opening remain deferred.

### Tests for User Story 3

- [ ] T045 [P] Add Blue Live panel tab render tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/blue-live-panel.test.tsx`
- [ ] T046 [P] Add Live Space grid action tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/blue-live-live-space.test.tsx`
- [ ] T047 [P] Add Live Code editor persistence tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/blue-live-live-code.test.tsx`
- [ ] T048 [P] Add Options tab patch tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/blue-live-options.test.tsx`
- [ ] T049 [P] Add Blue Live trigger routing tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.test.ts`

### Implementation for User Story 3

- [ ] T050 [US3] Route `BlueLiveTopComponent` to a real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [ ] T051 [US3] Implement Blue Live tab shell in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/BlueLivePanel.tsx`
- [ ] T052 [US3] Implement Live Space toolbar controls for tempo/repeat/trigger in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/blue-live/LiveSpaceTab.tsx`
- [ ] T053 [US3] Implement Live Space grid rendering and enabled toggle behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/blue-live/LiveSpaceGrid.tsx`
- [ ] T054 [US3] Implement Live Space row/column insert/remove actions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/blue-live/LiveSpaceGrid.tsx`
- [ ] T055 [US3] Implement saved-set list add/remove/rename/reorder/apply behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/blue-live/LiveObjectSetList.tsx`
- [ ] T056 [US3] Implement Live Space trigger request from enabled live objects in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`
- [ ] T057 [US3] Implement renderer trigger button wiring in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/blue-live/LiveSpaceTab.tsx`
- [ ] T058 [US3] Implement Live Code tab using `SelectedCodeEditor` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/blue-live/LiveCodeTab.tsx`
- [ ] T059 [US3] Implement Options tab fields and patches in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/blue-live/OptionsTab.tsx`
- [ ] T060 [US3] Wire Blue Live project patches through the project store in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [ ] T061 [US3] Ensure SCO Pad is absent, disabled, or explicitly deferred in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/BlueLivePanel.tsx`
- [ ] T062 [US3] Ensure nested SoundObject opening is not invoked from Live Space in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/blue-live/LiveSpaceGrid.tsx`
- [ ] T063 [US3] Add Blue Live panel styling consistent with existing workbench panels in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles.css`

**Checkpoint**: Blue Live project authoring shell is usable and persists covered LiveData.

---

## Phase 6: User Story 4 - Open Native Settings (Priority: P2)

**Goal**: macOS-style app menu includes `Settings...` and opens a modal Settings window with MIDI and OSC placeholders.

**Independent Test**: Use Cmd-, to open Settings, switch MIDI/OSC categories, and confirm repeated opens focus the same modal window.

### Tests for User Story 4

- [ ] T064 [P] Add native app menu template tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.test.ts`
- [ ] T065 [P] Add Settings window lifecycle tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/settings-window.test.ts`
- [ ] T066 [P] Add Settings renderer tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/settings-window.test.tsx`

### Implementation for User Story 4

- [ ] T067 [US4] Extract or update native menu construction for a macOS-style Blue app menu in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T068 [US4] Add `Settings...` with Cmd-, and deferred `About Blue` menu item in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T069 [US4] Implement modal Settings BrowserWindow lifecycle in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/settings-window.ts`
- [ ] T070 [US4] Wire settings IPC handler in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T071 [US4] Add settings preload/global API in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`
- [ ] T072 [US4] Implement Settings renderer surface with MIDI/OSC sidebar categories in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/settings/SettingsWindow.tsx`
- [ ] T073 [US4] Add Settings window styling modeled on the provided dark split layout in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles.css`

**Checkpoint**: Native Settings shell is present and isolated from project-level Blue Live options.

---

## Phase 7: User Story 5 - Evaluate Selected Code Into The Active Engine (Priority: P3)

**Goal**: Global orchestra/score editors expose `Evaluate Code` and route selected text to Blue Live first, realtime second.

**Independent Test**: With Blue Live running, evaluate selected global orchestra and score text; with only realtime running, repeat and confirm realtime routing; with no engine or no selection, confirm disabled/no-op.

### Tests for User Story 5

- [ ] T074 [P] Add Evaluate Code routing tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/evaluate-code.test.ts`
- [ ] T075 [P] Add editor context menu enablement tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/evaluate-code-context-menu.test.tsx`
- [ ] T076 [P] Add Cmd-Return shortcut tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/evaluate-code-shortcut.test.tsx`

### Implementation for User Story 5

- [ ] T077 [US5] Add runtime evaluation methods to realtime engine bridge in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/engine-bridge.ts`
- [ ] T078 [US5] Add runtime evaluation methods to Blue Live engine helper in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`
- [ ] T079 [US5] Add main-process evaluate-code router in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [ ] T080 [US5] Expose evaluate-code preload/global API in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`
- [ ] T081 [US5] Extend editor adapter types with selected-text/evaluate metadata in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/editor-adapter-types.ts`
- [ ] T082 [US5] Add `Evaluate Code` menu item to Csound context menu helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-menu.ts`
- [ ] T083 [US5] Wire Evaluate Code rendering and disabled state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/CsoundEditorContextMenu.tsx`
- [ ] T084 [US5] Add Cmd-Return handling to `SelectedCodeEditor` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx`
- [ ] T085 [US5] Enable Evaluate Code only for Global Orchestra, Global Score, and Live Code editor usages in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalOrchestraPanel.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalScorePanel.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/blue-live/LiveCodeTab.tsx`

**Checkpoint**: Evaluate Code works with the requested routing and disabled states.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, documentation, and manual verification.

- [ ] T086 [P] Update `/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/quickstart.md` with any implementation-specific validation changes discovered during development
- [ ] T087 [P] Add or update AGENTS context if implementation changes technologies in `/Users/stevenyi/work/blue-electron/AGENTS.md`
- [ ] T088 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [ ] T089 Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [ ] T090 Run `pnpm --filter @blue/app build` from `/Users/stevenyi/work/blue-electron`
- [ ] T091 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`
- [ ] T092 Perform the manual Blue Live toolbar, parallel engine, Recompile/All Notes Off, editor, Settings, and Evaluate Code scenarios from `/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. This is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational and can be implemented after or alongside US1 once Blue Live engine startup is available.
- **User Story 3 (Phase 5)**: Depends on Foundational. It can proceed in parallel with US2 after snapshot/patch contracts land.
- **User Story 4 (Phase 6)**: Depends on Foundational only for shared preload/menu conventions, but is otherwise independent.
- **User Story 5 (Phase 7)**: Depends on engine state from US1 and editor context menu support.
- **Polish (Phase 8)**: Depends on selected stories being complete.

### User Story Dependencies

- **US1**: No dependency on other user stories after Foundational.
- **US2**: Depends on US1 engine startup helpers for the cleanest implementation.
- **US3**: Can start after Foundational, but trigger/evaluation behavior benefits from US1.
- **US4**: Independent after Foundational.
- **US5**: Depends on US1 for Blue Live routing and existing realtime bridge behavior.

### Parallel Opportunities

- Setup inventory tasks T002-T004 can run in parallel.
- Foundational tests T005-T009 can run in parallel.
- Data model implementation T010-T015 should be sequenced by dependencies, but app contract work T016-T019 can proceed once types are agreed.
- UI tests for each user story can run in parallel with main/data tests when they touch different files.
- US4 Settings work can proceed in parallel with US2/US3 once preload/menu conventions are established.

---

## Parallel Example: Foundational Phase

```text
Task: "Add Java-compatible LiveData XML round-trip tests in packages/blue-data/src/live-data.test.ts"
Task: "Add LiveObject XML and deep-copy tests in packages/blue-data/src/live/live-object.test.ts"
Task: "Add injectable engine-session lifecycle tests in packages/blue-app/src/main/blue-live-engine.test.ts"
```

## Parallel Example: Settings Story

```text
Task: "Add Settings renderer tests in packages/blue-app/src/renderer/tests/settings-window.test.tsx"
Task: "Implement modal Settings BrowserWindow lifecycle in packages/blue-app/src/main/settings-window.ts"
Task: "Implement Settings renderer surface in packages/blue-app/src/renderer/components/settings/SettingsWindow.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Validate that Blue Live toggles from the toolbar, does not focus the editor, and can run beside realtime playback.
4. Stop and demo before adding Recompile, editor, Settings, and Evaluate Code.

### Incremental Delivery

1. Add US1 runtime toggle.
2. Add US2 recovery controls.
3. Add US3 project-backed editor.
4. Add US4 Settings shell.
5. Add US5 Evaluate Code routing.

### Handoff Notes

- Do not implement MIDI Input runtime behavior in this spec.
- Do not implement SCO Pad in this spec.
- Do not open nested SoundObject editors from Live Space in this spec.
- Do not implement a full About Blue dialog in this spec.
- Keep Java Blue source comparison close at hand for LiveData XML and Blue Live CSD behavior.
