# Tasks: Java Main Toolbar Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/plan.md`, `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/spec.md`, `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/research.md`, `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/contracts/main-toolbar-parity-surface.md`

**Tests**: Add focused Vitest coverage for toolbar rendering, authoritative playhead state, native menu command handling, and removal of old header affordances.

**Organization**: Tasks are grouped by user story to preserve independently testable increments.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish reusable shared types and component scaffolding for the toolbar/menu migration.

- [X] T001 Create shared toolbar transport snapshot and playback clock types in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [X] T002 [P] Create shared native window-menu descriptor and command definitions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- [X] T003 [P] Scaffold Java-style toolbar component files in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/MainToolbar.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarTransport.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarDisplays.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/toolbar-formatters.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire the core renderer/main-process transport and menu bridges that every story depends on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Extend the main/preload IPC bridge for playback clock snapshots and native window-menu commands in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts`
- [X] T005 Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/engine-bridge.ts` to publish authoritative playback clock snapshots derived from engine state without introducing per-frame IPC
- [X] T006 Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/playback-store.ts` to cache fixed-per-performance clock metadata, accept authoritative snapshots, and support interpolated playhead display state

**Checkpoint**: Main/preload/renderer clock and menu-command plumbing exists, so user stories can build on stable shared foundations.

---

## Phase 3: User Story 1 - Use a Java Blue-style main toolbar (Priority: P1) 🎯 MVP

**Goal**: Replace the old header with a Java Blue-style toolbar that exposes transport, playhead, selection, and Blue Live groups using authoritative engine timing.

**Independent Test**: Open a project, start playback, and verify the toolbar groups render in the correct positions while the playhead advances smoothly from engine-authored timing and selection placeholders behave like Java Blue.

### Tests for User Story 1

- [X] T007 [P] [US1] Add toolbar rendering and playhead-state coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts`
- [X] T008 [P] [US1] Add playback-store authoritative clock and interpolation coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/playback-store.test.ts`

### Implementation for User Story 1

- [X] T009 [US1] Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts` to include render-range and tempo-map data in the shared project snapshot
- [X] T010 [US1] Implement beat/time formatting and selection placeholder logic in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/toolbar-formatters.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [X] T011 [P] [US1] Implement transport, playhead, selection, and Blue Live toolbar group components in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarTransport.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarDisplays.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
- [X] T012 [US1] Compose the Java-style toolbar shell and replace the existing header wiring in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/MainToolbar.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/MenuBar.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/App.tsx`
- [X] T013 [US1] Wire toolbar actions and authoritative playhead display state into `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/playback-store.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts`

**Checkpoint**: User Story 1 should now deliver a Java-style toolbar with authoritative playhead and selection behavior, independently of native menu ownership changes.

---

## Phase 4: User Story 2 - Use toolbar controls and system menus in the right place (Priority: P1)

**Goal**: Move file/window ownership into the native Electron menus and update the BrowserWindow title to match Java Blue.

**Independent Test**: Open a project, verify `Open`/`Save`/`Save As` live in the native `File` menu, verify window-management actions live in a native `Window` menu, and confirm the title updates to `Blue - [file].blue`.

### Tests for User Story 2

- [X] T014 [P] [US2] Add native window-menu command coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-store.test.ts`
- [X] T015 [P] [US2] Add app-shell/title regression coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts`

### Implementation for User Story 2

- [X] T016 [US2] Move renderer panel metadata onto the shared menu descriptor contract in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panel-registry.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [X] T017 [US2] Replace renderer-owned File/Window menu ownership with native menu handling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`
- [X] T018 [US2] Dispatch native window-menu commands into the renderer workbench in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [X] T019 [US2] Update project open/save flows and BrowserWindow title handling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`

**Checkpoint**: User Story 2 should now deliver correct native File/Window ownership and Java-style window-title behavior.

---

## Phase 5: User Story 3 - Keep the toolbar visually aligned with the current Electron port (Priority: P2)

**Goal**: Make the new toolbar feel like Java Blue without breaking the rounded-rectangle visual language already established in the Electron port.

**Independent Test**: Compare the toolbar against the rest of the app and confirm the control groups, black display panels, and slightly rounded rectangle buttons match the intended parity/styling balance.

### Tests for User Story 3

- [X] T020 [P] [US3] Add visual/state regression coverage for toolbar grouping and rounded-rectangle affordances in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts`

### Implementation for User Story 3

- [X] T021 [US3] Apply final Java-inspired layout, spacing, and rounded-rectangle styling in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/MainToolbar.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarTransport.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarDisplays.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
- [X] T022 [US3] Finalize the transport icon mapping and follow-playback toggle presentation in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarTransport.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/toolbar-formatters.ts`

**Checkpoint**: User Story 3 should now deliver the intended Java/Electron visual blend without changing the already-agreed functionality.

---

## Phase 6: User Story 4 - Resolve current-header leftovers cleanly (Priority: P3)

**Goal**: Remove duplicated header leftovers so every former header responsibility has a single final home or explicit removal.

**Independent Test**: Review the finished app chrome and confirm there is no duplicate `Blue` branding, no toolbar file buttons, no renderer `Window` dropdown, and no playback status pill.

### Tests for User Story 4

- [X] T023 [P] [US4] Add regression coverage for removed legacy header affordances in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts`

### Implementation for User Story 4

- [X] T024 [US4] Remove obsolete renderer header ownership and dead UI paths from `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/MenuBar.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/App.tsx`
- [X] T025 [US4] Remove stale playback-status presentation logic while preserving engine-control behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/playback-store.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts`

**Checkpoint**: All former header responsibilities should now have a single final destination with no duplicate UI ownership.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation refresh across the slice.

- [X] T026 [P] Refresh feature handoff docs in `/Users/stevenyi/work/blue-electron/STATUS.md` and `/Users/stevenyi/work/blue-electron/AGENTS.md`
- [X] T027 Run validation commands `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check` from `/Users/stevenyi/work/blue-electron`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phases 3-6)**: Depend on Foundational completion
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational - establishes the toolbar shell and authoritative playhead behavior
- **User Story 2 (P1)**: Starts after Foundational - can proceed alongside US1, but integrates with the toolbar shell once it exists
- **User Story 3 (P2)**: Depends on US1 because it refines the implemented toolbar presentation
- **User Story 4 (P3)**: Depends on US1 and US2 because it removes leftover header affordances after the new toolbar/native-menu destinations exist

### Within Each User Story

- Tests should be added before or alongside implementation for the touched story files
- Shared snapshot and store changes must land before toolbar component wiring that depends on them
- Native menu data must be shared before duplicate renderer menu ownership is removed

### Parallel Opportunities

- T002 and T003 can run in parallel after T001
- T007 and T008 can run in parallel once Foundational is complete
- T011 can run in parallel with T010 after the shared snapshot shape exists
- T014 and T015 can run in parallel once Foundational is complete
- T020 can run in parallel with T021/T022 while styling is refined
- T023 can run in parallel with T024/T025 after the new toolbar/menu behavior is in place

---

## Parallel Example: User Story 1

```bash
# Add US1 coverage in parallel:
Task: "Add toolbar rendering and playhead-state coverage in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts"
Task: "Add playback-store authoritative clock and interpolation coverage in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/playback-store.test.ts"

# Build US1 UI pieces in parallel after the shared snapshot shape lands:
Task: "Implement beat/time formatting and selection placeholder logic in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/toolbar-formatters.ts and /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts"
Task: "Implement transport, playhead, selection, and Blue Live toolbar group components in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarTransport.tsx, /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarDisplays.tsx, and /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate toolbar grouping, authoritative playhead behavior, and selection placeholders

### Incremental Delivery

1. Add User Story 2 for native File/Window ownership and BrowserWindow title parity
2. Add User Story 3 for final visual alignment and icon/toggle polish
3. Add User Story 4 to remove leftover header affordances cleanly
4. Finish with Phase 7 validation and handoff docs
