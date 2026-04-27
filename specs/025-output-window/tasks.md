# Tasks: Output Window

**Input**: Design documents from `/specs/025-output-window/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No explicit test requirement in spec, but unit tests for the output store are included as a best practice.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define shared types and interfaces that all phases depend on.

- [ ] T001 Create IOProvider type definitions in `packages/blue-app/src/shared/io-provider.ts` — define `OutputType`, `OutputWriter`, `InputOutput`, `IOProvider`, `OutputLine`, `OutputTab`, `EngineOutputPayload` interfaces per contracts/io-provider-api.md
- [ ] T002 Add `onEngineOutput` and `onEngineOutputSelect` listener type declarations in `packages/blue-app/src/renderer/types/global.d.ts` — extend `BlueAPI` with `(callback: (payload: EngineOutputPayload) => void) => () => void` and select variant

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented — the Zustand output store and the IPC bridge.

- [ ] T003 Create output Zustand store in `packages/blue-app/src/renderer/stores/output-store.ts` — implement `OutputWindowState` with `tabs`, `tabOrder`, `activeTabId` and actions: `getOrCreateTab`, `closeTab`, `appendToTab` (splits on `\n`), `resetTab`, `selectTab`, `setTabColor`
- [ ] T004 Add `onEngineOutput` and `onEngineOutputSelect` IPC listeners in `packages/blue-app/src/preload/preload.ts` — expose `onEngineOutput(callback)` and `onEngineOutputSelect(callback)` via `contextBridge.exposeInMainWorld`
- [ ] T005 Wire IPC events to output store in `packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts` — add handlers for `engine-output` (calls `appendToTab`) and `engine-output-select` (calls `selectTab`)

**Checkpoint**: Foundation ready — output store exists, IPC bridge wired, user story implementation can begin.

---

## Phase 3: User Story 1 — View Csound Output During Playback (Priority: P1) MVP

**Goal**: Display Csound engine stdout/stderr in real time in a dockable Output panel.

**Independent Test**: Start playback on any project and verify Csound messages appear in the Output panel in real time.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Create OutputPanel component in `packages/blue-app/src/renderer/components/workbench/panels/output/OutputPanel.tsx` — tabbed output panel with virtualized text rendering using `@tanstack/react-virtual`, reads from output store, renders tabs and lines, auto-scrolls to bottom, colors stderr distinctly (e.g., red-ish tint), toolbar with Clear button
- [ ] T007 [P] [US1] Register OutputTopComponent in `packages/blue-app/src/shared/workbench-menu.ts` — add to `WORKBENCH_PANEL_REGISTRY` with `{ id: 'OutputTopComponent', title: 'Output', mode: 'output', auxiliaryGroupId: 'output-main', openAtStartup: true }`
- [ ] T008 [P] [US1] Add OutputTopComponent render branch in `packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx` — map `'OutputTopComponent'` → `<OutputPanel />`
- [ ] T009 [US1] Add "Output" entry to Window menu in `packages/blue-app/src/main/main.ts` `buildNativeWindowMenu()` — add menu item that sends `native-menu-command` `{ type: 'focus-panel', panelId: 'OutputTopComponent' }`
- [ ] T010 [US1] Extend EngineBridge with output callbacks in `packages/blue-app/src/main/engine-bridge.ts` — add `onOutput` and `onError` callback hooks to the child process stdout/stderr handlers (currently lines 311-319 that only console.log), invoke callbacks with the text and tab name
- [ ] T011 [US1] Wire main.ts to forward engine output via IPC in `packages/blue-app/src/main/main.ts` — subscribe to `engineBridge.onOutput` / `onError` callbacks, batch output, and send via `mainWindow.webContents.send('engine-output', { tabName: 'Csound', text, type })`; on playback start, send `engine-output-select` with tabName 'Csound'

**Checkpoint**: At this point, starting playback should show Csound output in the Output panel. The panel is accessible via Window menu. Output persists after playback stops.

---

## Phase 4: User Story 2 — Multiple Output Tabs (Priority: P2)

**Goal**: Support separate "Csound" and "Csound (Disk)" tabs for realtime vs. disk rendering.

**Independent Test**: Start a disk render and verify a separate "Csound (Disk)" tab appears; start realtime playback and verify it uses the "Csound" tab independently.

### Implementation for User Story 2

- [ ] T012 [US2] Add disk-render tab support in `packages/blue-app/src/main/main.ts` — when disk rendering starts, send `engine-output-select` with `tabName: 'Csound (Disk)'` and forward disk render output to that tab name
- [ ] T013 [US2] Ensure OutputPanel tab switching works in `packages/blue-app/src/renderer/components/workbench/panels/output/OutputPanel.tsx` — verify tabs render correctly when multiple exist, clicking a tab switches content, active tab is highlighted

**Checkpoint**: Both "Csound" and "Csound (Disk)" tabs work independently. Switching between tabs shows correct content.

---

## Phase 5: User Story 3 — Clear and Select Programmatically (Priority: P3)

**Goal**: Auto-clear and auto-select the output tab when rendering starts; user can manually clear.

**Independent Test**: Start playback twice — verify the tab is cleared and focused each time.

### Implementation for User Story 3

- [ ] T014 [US3] Add clear-before-render logic in `packages/blue-app/src/main/main.ts` — before starting playback, send `engine-output` reset signal (or add a dedicated `engine-output-reset` IPC event) that triggers `resetTab('Csound')` in the store
- [ ] T015 [US3] Add render command header in `packages/blue-app/src/main/main.ts` — after clearing, write a header line like `Render Command (args...)` to the output tab before Csound output begins
- [ ] T016 [US3] Add clear button to OutputPanel toolbar in `packages/blue-app/src/renderer/components/workbench/panels/output/OutputPanel.tsx` — button that calls `resetTab(activeTabId)` on the output store

**Checkpoint**: Starting playback clears and focuses the output tab with a fresh header. Manual clear button works.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tests, cleanup, and edge case handling.

- [ ] T017 [P] Create output store unit tests in `packages/blue-app/src/renderer/tests/output-store.test.ts` — test `getOrCreateTab`, `appendToTab` (line splitting), `resetTab`, `selectTab`, `setTabColor`, multi-tab isolation
- [ ] T018 [P] Verify `@tanstack/react-virtual` is listed as dependency in `packages/blue-app/package.json` — add if missing
- [ ] T019 Run lint and typecheck to verify all new code passes `npm test && npm run lint`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 (Phase 3) must complete before US2/US3 (needs working panel first)
  - US2 (Phase 4) depends on US1 panel being functional
  - US3 (Phase 5) depends on US1 panel + US2 multi-tab support
- **Polish (Phase 6)**: Can run after US1, ideally after all stories

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only — the core panel + engine output forwarding
- **US2 (P2)**: Depends on US1 — needs the panel to exist before adding multi-tab
- **US3 (P3)**: Depends on US1 + US2 — needs multi-tab before adding clear/select

### Within Each User Story

- Types and interfaces before store
- Store before UI component
- UI component before integration
- Integration before polish

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003, T004, T005 can run in parallel (different files)
- T006, T007, T008 can run in parallel (different files)
- T012 and T013 can run in parallel (different concerns)
- T014, T015, T016 can run in parallel (different files)
- T017, T018 can run in parallel (different files)

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# These can run in parallel (different files):
T006: "Create OutputPanel component"
T007: "Register OutputTopComponent in workbench-menu"
T008: "Add OutputTopComponent render branch in DockviewPanel"

# Then sequentially:
T009: "Add Output to Window menu" (after T007)
T010: "Extend EngineBridge with output callbacks" (independent file)
T011: "Wire main.ts to forward engine output" (after T010)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T005)
3. Complete Phase 3: User Story 1 (T006-T011)
4. **STOP and VALIDATE**: Start playback, verify output appears in panel
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Real-time Csound output visible → **MVP!**
3. Add US2 → Multiple tabs for disk/realtime
4. Add US3 → Auto-clear and auto-select polish
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- The OutputPanel uses `@tanstack/react-virtual` for performance with large output
- The IPC batching strategy in main.ts should accumulate lines for ~50ms before sending to avoid flooding the renderer
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
