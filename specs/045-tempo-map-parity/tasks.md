# Tasks: Tempo Map Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tempo-map-surface.md, quickstart.md  
**Tests**: Required by FR-020. Add or update tests before implementing the behavior they validate.

**Organization**: Tasks are grouped by user story so the tempo region bar, expanded line view, modal editor, and canonical patch contract can be implemented and validated independently after the shared foundation is complete.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on an incomplete task.
- **[Story]**: User-story label from the feature spec.
- Every task includes an exact file path.

---

## Phase 1: Setup (Shared Context)

**Purpose**: Confirm Java parity anchors and current TypeScript seams before code changes.

- [x] T001 Review Java tempo parity anchors in `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/tempo/TempoRegionBar.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/tempo/TempoEditor.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/tempo/TempoEditorPanel.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/tempo/TempoEditorControl.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/time/TempoMapEditorPanel.java`, and `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/EditTempoMapAction.java`
- [x] T002 [P] Inventory current tempo snapshot and patch code in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [x] T003 [P] Inventory current score header and row control code in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`
- [x] T004 [P] Inventory current native Project menu placeholders in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts` and native menu command listeners in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts`
- [x] T005 [P] Inventory existing `@blue/data` tempo map listener, visible flag, XML, and point mutation behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish canonical snapshot and patch support required by every tempo UI surface.

**Critical**: No user story work should begin until this phase is complete.

### Tests

- [x] T006 [P] Add `TempoMap.visible` listener and XML round-trip coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.test.ts`
- [x] T007 [P] Add shared tempo snapshot coverage for enabled, visible, beat, tempo, curve type, and optional position metadata in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-map-contract.test.ts`
- [x] T008 [P] Add shared tempo patch validation tests for add, update, curve type, remove, replace, and invalid operation rejection in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-map-contract.test.ts`
- [x] T009 [P] Add project-store optimistic tempo patch merge tests in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-map-contract.test.ts`

### Implementation

- [x] T010 Update `TempoMap.setVisible()` to notify listeners when visibility changes in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.ts`
- [x] T011 Extend `TempoPointSnapshot` and `TempoMapSnapshot` with visible and optional position metadata in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T012 Implement tempo-map snapshot creation from canonical `TempoMap.isVisible()` and point data in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T013 Add typed tempo map patch variants to `ProjectDocumentPatch` or `ScorePatch` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T014 Implement tempo patch validation helpers for first-point, duplicate-beat, neighbor-boundary, tempo, and curve-type rules in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T015 Implement canonical tempo patch application against `BlueData.getScore().getTimeContext().getTempoMap()` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T016 Update empty-patch detection and empty transport snapshot defaults for tempo visibility in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T017 Update renderer project-store optimistic patch merge for tempo enabled, visible, point operations, and replace-map behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`

**Checkpoint**: Canonical tempo state can be fully edited through typed patches and round-trips through snapshots.

---

## Phase 3: User Story 1 - Edit Tempo From The Ruler Bar (Priority: P1) MVP

**Goal**: The Score panel renders a Java-style tempo region bar and supports region-bar editing/context menu workflows.

**Independent Test**: Use the tempo row to add, edit, change curve type, and delete tempo points while confirming canonical patches and save/reload behavior.

### Tests for User Story 1

- [x] T018 [P] [US1] Add tempo region derivation tests for point-to-region bounds and labels in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-row-parity.test.tsx`
- [x] T019 [P] [US1] Add tempo row rendering tests for enabled/disabled, hover tooltip text, selected state, and curve indicators in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-row-parity.test.tsx`
- [x] T020 [P] [US1] Add tempo region bar interaction tests for double-click add/edit and right-click menu actions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-row-parity.test.tsx`
- [x] T021 [P] [US1] Add tempo point dialog validation tests for first-point fixed, neighbor bounds, positive tempo, OK, and Cancel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-row-parity.test.tsx`

### Implementation for User Story 1

- [x] T022 [US1] Add pure tempo region derivation and snap helper functions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/tempo-map-utils.ts`
- [x] T023 [US1] Implement `TempoRegionBar` rendering, hover state, tooltip, selected state, region labels, disabled styling, and curve indicators in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoRegionBar.tsx`
- [x] T024 [US1] Implement `TempoRegionBar` double-click add/edit behavior with snap support in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoRegionBar.tsx`
- [x] T025 [US1] Implement `TempoRegionBar` Radix context menu for Edit Tempo..., Constant, Linear, and Delete Tempo Point in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoRegionBar.tsx`
- [x] T026 [US1] Implement `TempoPointDialog` for point position and tempo editing in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoPointDialog.tsx`
- [x] T027 [US1] Replace the static tempo text row in `ColumnHeader` with `TempoRegionBar` and point-dialog wiring in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`

**Checkpoint**: User Story 1 is complete when collapsed tempo-row authoring works without the expanded line graph or modal.

---

## Phase 4: User Story 2 - Expand And Edit The Tempo Line View (Priority: P1)

**Goal**: The tempo arrow toggle expands a Java-style line graph editor below the region bar.

**Independent Test**: Toggle the line view open/closed and edit points by inserting, dragging, snapping, constraining, deleting, and changing segment curve types.

### Tests for User Story 2

- [x] T028 [P] [US2] Add row-height and visible-state tests for arrow expand/collapse in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-line-view.test.tsx`
- [x] T029 [P] [US2] Add line graph curve rendering tests for constant steps, linear slopes, points, selected point, and snap grid in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-line-view.test.tsx`
- [x] T030 [P] [US2] Add line graph pointer tests for insert, drag, first-point fixed, neighbor bounds, tempo clamp, Shift snap bypass, and Ctrl axis constraint in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-line-view.test.tsx`
- [x] T031 [P] [US2] Add line graph context-menu tests for segment Constant/Linear and selected non-first point deletion in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-line-view.test.tsx`

### Implementation for User Story 2

- [x] T032 [US2] Wire tempo header arrow state and Use Tempo checkbox to canonical tempo patches in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- [x] T033 [US2] Update left row header and timeline header height synchronization for collapsed 20px and expanded 100px tempo rows in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`
- [x] T034 [US2] Implement tempo line graph drawing helpers for x/y conversion, 30-240 BPM clamp, constant segments, linear segments, and snap grid in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/tempo-map-utils.ts`
- [x] T035 [US2] Implement `TempoLineView` graph rendering, selected point highlighting, and tooltips in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoLineView.tsx`
- [x] T036 [US2] Implement `TempoLineView` point insertion and drag state, including auto-scroll at visible edges if needed, in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoLineView.tsx`
- [x] T037 [US2] Implement `TempoLineView` snap, Shift bypass, Ctrl constrained drag, first-point fixed, neighbor bounds, and tempo clamp behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoLineView.tsx`
- [x] T038 [US2] Implement `TempoLineView` context menu for selected-point deletion and segment curve type changes in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoLineView.tsx`
- [x] T039 [US2] Render `TempoLineView` below `TempoRegionBar` when `tempoMap.visible` is true in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`

**Checkpoint**: User Story 2 is complete when the arrow-toggle line view is independently usable and persists expanded state.

---

## Phase 5: User Story 3 - Edit The Complete Tempo Map From The Project Menu (Priority: P1)

**Goal**: The Project menu opens a real bulk tempo-map editor dialog with OK/Cancel copy semantics.

**Independent Test**: Use Project -> Edit Tempo Map... to add, edit, delete, cancel, and OK changes.

### Tests for User Story 3

- [x] T040 [P] [US3] Add application menu tests proving `Edit Tempo Map...` is enabled only with a loaded project and sends an edit command in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.test.ts`
- [x] T041 [P] [US3] Add native menu command listener tests for opening the tempo map editor in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-map-modal.test.tsx`
- [x] T042 [P] [US3] Add tempo map modal tests for Add, Delete disabled when one row remains, invalid values, Cancel no-op, and OK replace-map patch in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-map-modal.test.tsx`

### Implementation for User Story 3

- [x] T043 [US3] Replace the Project menu `Edit Tempo Map...` placeholder with a real callback and command send in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [x] T044 [US3] Extend native menu command typing and renderer listener dispatch for `edit-tempo-map` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts`
- [x] T045 [US3] Implement `TempoMapEditorDialog` table UI with Beat, Tempo (BPM), Delete, Add, OK, and Cancel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoMapEditorDialog.tsx`
- [x] T046 [US3] Wire `TempoMapEditorDialog` open/close state and replace-map patch dispatch from the Score panel root in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`

**Checkpoint**: User Story 3 is complete when bulk editing works from the native Project menu and respects OK/Cancel copy semantics.

---

## Phase 6: User Story 4 - Keep Tempo State Canonical Across Renderer, Main, And XML (Priority: P2)

**Goal**: Harden canonical state, save/load, and conversion consumers after all tempo surfaces exist.

**Independent Test**: Mutate tempo through every surface and verify canonical snapshots, save/load, ruler conversion, and playback conversion remain aligned.

### Tests for User Story 4

- [x] T047 [P] [US4] Add integration test that edits tempo through multiple patch variants and verifies `createToolbarProjectTransportSnapshot()` reflects canonical state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-map-contract.test.ts`
- [x] T048 [P] [US4] Add regression tests that ruler mark conversion and elapsed playback conversion use updated tempo points and curve types in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-map-contract.test.ts`
- [x] T049 [P] [US4] Add save/reload test for enabled, visible, constant, linear, and multi-point tempo maps in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.test.ts`

### Implementation for User Story 4

- [x] T050 [US4] Extract or reuse tempo conversion utilities so `ColumnHeader` and playback display consume updated tempo snapshots without stale cache issues in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- [x] T051 [US4] Ensure score timeline root/nested mode disables or scopes tempo editing consistently with existing marker/render-start root-timeline rules in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- [x] T052 [US4] Update any affected shared declarations or generated `.d.ts` expectations for tempo snapshot and patch additions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`

**Checkpoint**: User Story 4 is complete when no tempo edit path can diverge from canonical project state.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validate the full feature and update handoff notes.

- [x] T053 [P] Update quickstart validation notes in `/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/quickstart.md`
- [x] T054 [P] Update project handoff state in `/Users/stevenyi/work/blue-electron/STATUS.md`
- [x] T055 Run focused tempo renderer and shared tests from `/Users/stevenyi/work/blue-electron`
- [x] T056 Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [x] T057 Run `pnpm --filter @blue/app build` from `/Users/stevenyi/work/blue-electron`
- [x] T058 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron` if `@blue/data` tempo behavior changed
- [x] T059 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`
- [ ] T060 Perform manual scenarios from `/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **US1 Region Bar (Phase 3)**: Depends on Foundation and is the MVP.
- **US2 Line View (Phase 4)**: Depends on Foundation and US1 component placement.
- **US3 Modal/Menu (Phase 5)**: Depends on Foundation; can run partly in parallel with US1/US2 after patch support exists.
- **US4 Canonical Hardening (Phase 6)**: Depends on all edit surfaces.
- **Polish**: Depends on selected stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundation.
- **US2 (P1)**: Requires US1 row integration so the graph can mount below the region bar.
- **US3 (P1)**: Independent after Foundation, except final Score panel open-state wiring must coordinate with US1/US2 component state.
- **US4 (P2)**: Depends on all P1 edit paths.

### Parallel Opportunities

- T002 through T005 can run in parallel.
- T006 through T009 can run in parallel.
- T018 through T021 can run in parallel after Foundation.
- T028 through T031 can run in parallel after row integration is known.
- T040 through T042 can run in parallel after Foundation.
- T047 through T049 can run in parallel after all P1 behaviors exist.
- T053 and T054 can run in parallel during polish.

## Parallel Example: Foundation

```text
Task: "T006 Add TempoMap.visible listener and XML round-trip coverage in /Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.test.ts"
Task: "T007 Add shared tempo snapshot coverage in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-map-contract.test.ts"
Task: "T008 Add shared tempo patch validation tests in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/tempo-map-contract.test.ts"
```

## Parallel Example: Region Bar

```text
Task: "T022 Add pure tempo region derivation and snap helper functions in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/tempo-map-utils.ts"
Task: "T023 Implement TempoRegionBar rendering in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoRegionBar.tsx"
Task: "T026 Implement TempoPointDialog in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoPointDialog.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundation.
2. Complete User Story 1 only.
3. Validate collapsed tempo region bar authoring and save/reload.
4. Stop for review before line graph and modal if needed.

### Incremental Delivery

1. Land canonical tempo patch/snapshot support.
2. Land collapsed region bar editing.
3. Land expanded line graph editing.
4. Land Project menu modal editing.
5. Harden conversion/save/load and run full validation.

### Handoff Notes

- Keep Spec 046 meter editing out of this branch unless the implementer explicitly switches to that spec.
- Keep `.specify/feature.json` aligned to `/Users/stevenyi/work/blue-electron/specs/045-tempo-map-parity` while implementing this branch.
- If implementation discovers that `ProjectDocumentPatch.transport.tempoMap` becomes too broad, move structural operations under `ScorePatch` but keep the renderer contract equivalent.
