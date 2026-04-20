# Tasks: Global And Project Editors

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/`
**Prerequisites**: `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/plan.md`, `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/spec.md`, `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/research.md`, `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/data-model.md`, `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/quickstart.md`, `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/contracts/project-editor-ipc.md`

**Tests**: Include targeted `@blue/data` serialization coverage plus `@blue/app` store and renderer verification because the plan activates the constitution gate for backward-compatible serialization and names `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, and `pnpm --filter @blue/app build` as required validation.

**Organization**: Tasks are grouped by user story so the Global Orchestra, Global Score, and Project Properties panels can be implemented and validated incrementally.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in every task description

## Phase 1: Setup (Shared Project-Editor Scaffolding)

**Purpose**: Prepare the workbench panel and project-state paths for the three placeholder replacements.

- [X] T001 Add project-editor snapshot typings to `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`
- [X] T002 [P] Create shared panel scaffolding for project-bound editor tabs in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ProjectTextEditorPanel.tsx`
- [X] T003 [P] Prepare project editor panel routing scaffolding in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the canonical project-editor snapshot and patch bridge that all three user stories depend on.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [X] T004 Extend the main-process project-loaded payload and add project-editor snapshot helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [X] T005 Extend the preload bridge with project-document read and patch methods in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`
- [X] T006 Expand `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts` to hydrate and mutate the renderer-side project-editor snapshot
- [X] T007 Wire `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts` to hydrate the expanded project snapshot from the updated load event
- [X] T008 [P] Add project-editor bridge and store hydration coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts`

**Checkpoint**: The renderer can hydrate and patch the current project document through the main/preload bridge without any panel-specific placeholder logic.

---

## Phase 3: User Story 1 - Edit Global Orchestra Text (Priority: P1) 🎯 MVP

**Goal**: Replace the Global Orchestra placeholder with a real project-bound text editor that loads, edits, and persists `globalOrc`.

**Independent Test**: Open a project with existing global orchestra text, edit it in `GlobalOrchestraTopComponent`, save, reopen, and confirm the updated text persists while the panel shows a disabled empty state when no project is loaded.

- [X] T009 [P] [US1] Add `globalOrc` read and update actions to `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [X] T010 [P] [US1] Implement `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalOrchestraPanel.tsx` using `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ProjectTextEditorPanel.tsx`
- [X] T011 [US1] Route `GlobalOrchestraTopComponent` to the real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [X] T012 [US1] Add Global Orchestra load/edit/empty-state coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

**Checkpoint**: User Story 1 is complete when `GlobalOrchestraTopComponent` is no longer a placeholder and persists edits through the existing save flow.

---

## Phase 4: User Story 2 - Edit Global Score Text (Priority: P1)

**Goal**: Replace the Global Score placeholder with a real project-bound text editor that loads, edits, and persists `globalSco`.

**Independent Test**: Open a project with existing global score text, edit it in `GlobalScoreTopComponent`, save, reopen, and confirm the updated text persists while the panel refreshes correctly when the current project changes.

- [X] T013 [P] [US2] Add `globalSco` read and update actions to `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [X] T014 [P] [US2] Implement `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalScorePanel.tsx` using `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ProjectTextEditorPanel.tsx`
- [X] T015 [US2] Route `GlobalScoreTopComponent` to the real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [X] T016 [US2] Add Global Score load/edit/project-switch coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

**Checkpoint**: User Story 2 is complete when `GlobalScoreTopComponent` is no longer a placeholder and refreshes correctly across load, edit, save, reopen, and project-switch flows.

---

## Phase 5: User Story 3 - Edit Basic Project Properties (Priority: P2)

**Goal**: Replace the Project Properties placeholder with a bounded built-in tabbed settings surface backed by Java-compatible `ProjectProperties` fields.

**Independent Test**: Open a project, edit supported fields across the built-in Project Properties tabs, save, reopen, and confirm the values persist while the panel shows a non-editable empty state when no project is loaded.

- [X] T017 [P] [US3] Add Java-compatible built-in `ProjectProperties` fields and serialization coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/project-properties.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/project-properties-roundtrip.test.ts`
- [X] T018 [US3] Extend project-editor snapshot mapping for built-in project-properties fields in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/types/global.d.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [X] T019 [P] [US3] Implement the tabbed Project Information section in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/project-properties/ProjectInformationTab.tsx`
- [X] T020 [P] [US3] Implement the tabbed Realtime Render section in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/project-properties/RealtimeRenderTab.tsx`
- [X] T021 [P] [US3] Implement the tabbed Disk Render section in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/project-properties/DiskRenderTab.tsx`
- [X] T022 [P] [US3] Implement the tabbed Media section in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/project-properties/MediaTab.tsx`
- [X] T023 [US3] Compose the tabbed Project Properties surface in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ProjectPropertiesPanel.tsx`
- [X] T024 [US3] Route `ProjectPropertiesTopComponent` to the real panel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- [X] T025 [US3] Add Project Properties hydration, edit, empty-state, and persistence coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/project-editor-panels.test.ts`

**Checkpoint**: User Story 3 is complete when `ProjectPropertiesTopComponent` exposes the bounded built-in tabs and persists supported values through the normal save/reopen flow.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish validation and handoff for the 017 slice.

- [X] T026 [P] Record 017 implementation validation and note the deferred Monaco/tree-sitter follow-on in `/Users/stevenyi/work/blue-electron/specs/017-global-project-editors/quickstart.md` and `/Users/stevenyi/work/blue-electron/STATUS.md`
- [X] T027 Run end-to-end validation with `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, and `pnpm --filter @blue/app build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and can proceed independently of US1 once the shared project-editor bridge exists
- **User Story 3 (Phase 5)**: Depends on Foundational completion and the `@blue/data` schema expansion task within US3
- **Polish (Phase 6)**: Depends on all targeted user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: First MVP path for one real project-bound code editor
- **User Story 2 (P1)**: Parallel-value companion to US1 for the second project-bound code editor
- **User Story 3 (P2)**: Builds the broader tabbed settings surface and carries the shared-data serialization expansion

### Parallel Opportunities

- Phase 1: `T002` and `T003` can run in parallel after `T001`
- Phase 2: `T008` can run after the bridge/store shape is defined by `T004`-`T007`
- User Story 1: `T009` and `T010` can run in parallel before `T011`
- User Story 2: `T013` and `T014` can run in parallel before `T015`
- User Story 3: `T019`, `T020`, `T021`, and `T022` can run in parallel after `T018`
- Phase 6: `T026` can run before `T027`

---

## Parallel Example: User Story 1

```bash
Task: "Add `globalOrc` read and update actions to /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts"
Task: "Implement /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalOrchestraPanel.tsx using /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ProjectTextEditorPanel.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Add `globalSco` read and update actions to /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts"
Task: "Implement /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/GlobalScorePanel.tsx using /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ProjectTextEditorPanel.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Implement the tabbed Project Information section in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/project-properties/ProjectInformationTab.tsx"
Task: "Implement the tabbed Realtime Render section in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/project-properties/RealtimeRenderTab.tsx"
Task: "Implement the tabbed Disk Render section in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/project-properties/DiskRenderTab.tsx"
Task: "Implement the tabbed Media section in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/project-properties/MediaTab.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational project-editor bridge
3. Complete Phase 3: User Story 1
4. Stop and validate `GlobalOrchestraTopComponent` load/edit/save/reopen behavior before moving on

### Incremental Delivery

1. Build the project-editor bridge and store hydration path
2. Deliver Global Orchestra as the first real project editor tab
3. Deliver Global Score as the second real project editor tab
4. Extend `ProjectProperties` and deliver the bounded tabbed settings surface
5. Finish validation and handoff, then move to the deferred editor-tooling spec

### Recommended Execution Order For This Feature

1. Establish main/preload/renderer project-editor snapshot and patch flow
2. Replace the Global Orchestra placeholder
3. Replace the Global Score placeholder
4. Extend `ProjectProperties` and replace the Project Properties placeholder
5. Run validation and update handoff docs

---

## Notes

- `[P]` tasks are limited to different files with no dependency on incomplete work
- User Stories 1 and 2 are both P1 because they provide immediate value with minimal additional data-model risk
- User Story 3 carries the shared serialization work and is therefore the heaviest slice in the feature
- Monaco and tree-sitter remain explicitly out of scope for this task list and belong to the next spec
