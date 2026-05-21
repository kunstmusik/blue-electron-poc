# Tasks: Meter Map Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/046-meter-map-parity/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/meter-map-surface.md, quickstart.md  
**Tests**: Required by FR-017. Add or update tests before implementing the behavior they validate.

**Organization**: Tasks are grouped by user story so the meter region bar, boundary math, Project menu modal, and canonical patch contract can be implemented and validated independently after the shared foundation is complete.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on an incomplete task.
- **[Story]**: User-story label from the feature spec.
- Every task includes an exact file path.

---

## Phase 1: Setup (Shared Context)

**Purpose**: Confirm Java parity anchors and current TypeScript meter seams before code changes.

- [x] T001 Review Java meter parity anchors in `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/meter/MeterRegionBar.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/time/MeterMapEditorPanel.java`, `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/EditMeterMapAction.java`, `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/time/MeterMap.java`, `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/time/MeasureMeterPair.java`, and `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/time/Meter.java`
- [x] T002 [P] Inventory current meter snapshot and project patch code in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [x] T003 [P] Inventory current meter row rendering and score header placement in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MeterRegionBar.tsx` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`
- [x] T004 [P] Inventory current native Project menu placeholders and completed Spec 045 native command path in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [x] T005 [P] Inventory existing `@blue/data` meter map conversion, XML, and mutation behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/meter-map.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/meter-map.test.ts`
- [x] T006 [P] Review completed Spec 045 tempo implementation patterns in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoRegionBar.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoPointDialog.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoMapEditorDialog.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/tempo-map-utils.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish canonical snapshot, patch, and optimistic merge support required by every meter UI surface.

**Critical**: No user story work should begin until this phase is complete.

### Tests

- [x] T007 [P] Add `@blue/data` meter XML and mixed-meter conversion regression tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/meter-map.test.ts`
- [x] T008 [P] Add shared meter snapshot tests for ordered entries and accumulated `startBeat` values in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-map-contract.test.ts`
- [x] T009 [P] Add shared meter patch validation tests for set, update, remove, replace, first-entry protection, duplicate measures, neighbor bounds, and invalid denominator values in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-map-contract.test.ts`
- [x] T010 [P] Add project-store optimistic meter patch merge tests mirroring the Spec 045 tempo merge coverage in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/app.test.ts`

### Implementation

- [x] T011 Extend `MeterSnapshot` and `MeterMapSnapshot` with derived `startBeat` data in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T012 Implement meter snapshot creation that derives accumulated `startBeat` values from ordered canonical entries in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T013 Add `MeterMapPatch` variants to the existing transport patch surface, matching the `TempoMapPatch` style, in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T014 Implement meter patch validation helpers for first-entry, duplicate-measure, neighbor-boundary, positive-integer, and denominator rules in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T015 Implement canonical meter patch application with `Meter`, `MeasureMeterPair`, and `BlueData.getScore().getTimeContext().getMeterMap()` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T016 Update empty-patch detection and empty transport snapshot defaults for meter map `startBeat` data in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T017 Add renderer optimistic meter patch merge helper, matching `applyTempoMapPatchToSnapshot`, in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [x] T018 Add pure validation, parsing, region derivation, and hit-test helpers for `N/D` meter signatures in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/meter-map-utils.ts`

**Checkpoint**: Canonical meter state can be fully edited through typed patches and round-trips through snapshots.

---

## Phase 3: User Story 1 - Edit Time Signatures From The Ruler Bar (Priority: P1) MVP

**Goal**: The Score panel renders a Java-style meter region bar and supports direct row editing/context menu workflows.

**Independent Test**: Use the meter row to add, edit, and delete meter entries while confirming canonical patches and save/reload behavior.

### Tests for User Story 1

- [x] T019 [P] [US1] Add meter row rendering tests for 20px height, labels, hover state, and tooltip text in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-row-parity.test.tsx`
- [x] T020 [P] [US1] Add meter row interaction tests for double-click add/edit behavior in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-row-parity.test.tsx`
- [x] T021 [P] [US1] Add meter row context menu tests for Edit Time Signature... and Delete Time Signature Change visibility rules in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-row-parity.test.tsx`
- [x] T022 [P] [US1] Add `MeterEntryDialog` validation tests for first-entry fixed measure, neighbor bounds, signature parsing, OK, and Cancel in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-row-parity.test.tsx`

### Implementation for User Story 1

- [x] T023 [US1] Implement meter tooltip formatting, default-entry selection, and nearest-entry edit helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/meter-map-utils.ts`
- [x] T024 [US1] Update `MeterRegionBar` rendering, hover state, tooltip behavior, and label clipping using the completed `TempoRegionBar` interaction style in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MeterRegionBar.tsx`
- [x] T025 [US1] Implement `MeterRegionBar` double-click add/edit behavior using accumulated beat-to-measure conversion in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MeterRegionBar.tsx`
- [x] T026 [US1] Implement `MeterRegionBar` Radix context menu for Edit Time Signature... and Delete Time Signature Change, mirroring `TempoRegionBar` menu structure, in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MeterRegionBar.tsx`
- [x] T027 [US1] Implement `MeterEntryDialog` for single-entry measure and time-signature editing, adapting `TempoPointDialog` validation and modal styling, in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MeterEntryDialog.tsx`
- [x] T028 [US1] Wire meter row edit/dialog patch dispatch from `ColumnHeader`, matching the existing `onTempoPatch` flow, in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`

**Checkpoint**: User Story 1 is complete when collapsed meter-row authoring works without the Project menu modal.

---

## Phase 4: User Story 2 - Use Correct Measure-To-Beat Region Math (Priority: P1)

**Goal**: Mixed-meter rendering, hit testing, and ruler conversions use accumulated meter-map boundaries.

**Independent Test**: Load 4/4, 3/4, and 7/8 changes and verify row regions, tooltips, double-click targeting, and ruler labels align.

### Tests for User Story 2

- [x] T029 [P] [US2] Add mixed-meter region-boundary tests for 4/4, 3/4, and 7/8 entries in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-map-contract.test.ts`
- [x] T030 [P] [US2] Add beat-to-measure hit-test tests for clicks before, on, and after meter-change boundaries in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-row-parity.test.tsx`
- [x] T031 [P] [US2] Add BBT, BBST, and BBF ruler conversion regression tests for mixed meter maps in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-map-contract.test.ts`

### Implementation for User Story 2

- [x] T032 [US2] Replace fixed `(measure - 1) * numBeats` calculations with accumulated meter-map region data in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MeterRegionBar.tsx`
- [x] T033 [US2] Expose or reuse accumulated beat-to-measure helpers for renderer hit testing in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/meter-map-utils.ts`
- [x] T034 [US2] Ensure `ColumnHeader` passes canonical meter snapshot data to meter row and ruler consumers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`
- [x] T035 [US2] Audit score ruler mark generation for BBT, BBST, and BBF displays and route it through canonical meter data in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`
- [x] T036 [US2] Update toolbar display meter adapter tests and implementation if the `MeterSnapshot` `startBeat` addition changes assumptions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/toolbar-formatters.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/toolbar-formatters.test.ts`
- [x] T037 [US2] Add regression comments or helper names that make accumulated meter math explicit in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/meter-map-utils.ts`

**Checkpoint**: User Story 2 is complete when mixed-meter row and ruler behavior cannot regress to fixed-measure shortcuts.

---

## Phase 5: User Story 3 - Edit The Complete Meter Map From The Project Menu (Priority: P1)

**Goal**: The Project menu opens a real bulk meter-map editor dialog with Java-style table behavior and OK/Cancel copy semantics.

**Independent Test**: Use Project -> Edit Time Signature Map... to add, edit, delete, cancel, and OK changes.

### Tests for User Story 3

- [x] T038 [P] [US3] Add application menu tests proving `Edit Time Signature Map...` is enabled only with a loaded project and sends an edit command in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.test.ts`
- [x] T039 [P] [US3] Add `WorkbenchMenuCommand` and workbench-store tests for `edit-meter-map` dispatching `blue-edit-meter-map` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-store.test.ts`
- [x] T040 [P] [US3] Add meter map modal tests for table rendering, Add at last measure + 8, Delete disabled when one row remains, invalid values, Cancel no-op, and OK replace-map patch in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-map-modal.test.tsx`

### Implementation for User Story 3

- [x] T041 [US3] Replace the Project menu `Edit Time Signature Map...` placeholder with a real callback and command send in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- [x] T042 [US3] Extend `WorkbenchMenuCommand` typing with `edit-meter-map` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- [x] T043 [US3] Extend `workbench-store` native menu handling to dispatch `blue-edit-meter-map`, mirroring `blue-edit-tempo-map`, in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- [x] T044 [US3] Implement `MeterMapEditorDialog` table UI with Measure, Time Signature, Delete, Add, OK, and Cancel, adapting `TempoMapEditorDialog`, in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MeterMapEditorDialog.tsx`
- [x] T045 [US3] Wire `MeterMapEditorDialog` open/close state and replace-map patch dispatch from the Score panel root, mirroring the tempo modal flow, in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`

**Checkpoint**: User Story 3 is complete when bulk editing works from the native Project menu and respects OK/Cancel copy semantics.

---

## Phase 6: User Story 4 - Keep Meter State Canonical Across Renderer, Main, And XML (Priority: P2)

**Goal**: Harden canonical state, save/load, and conversion consumers after all meter surfaces exist.

**Independent Test**: Mutate meter through every surface and verify canonical snapshots, save/load, and ruler conversions remain aligned.

### Tests for User Story 4

- [x] T046 [P] [US4] Add integration test that edits meter through multiple patch variants and verifies refreshed project snapshots reflect canonical state in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-map-contract.test.ts`
- [x] T047 [P] [US4] Add save/reload test for ordered multi-entry meter maps in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/meter-map.test.ts`
- [x] T048 [P] [US4] Add regression test that modal replace-map and row-level edits produce the same canonical snapshot shape in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-map-modal.test.tsx`

### Implementation for User Story 4

- [x] T049 [US4] Ensure meter edits in root and nested score contexts follow existing score timeline authoring rules in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- [x] T050 [US4] Update affected shared declarations or generated type expectations for meter snapshot and patch additions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- [x] T051 [US4] Verify canonical meter-map save/load is unchanged except for intentional snapshot additions in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/meter-map.ts`

**Checkpoint**: User Story 4 is complete when no meter edit path can diverge from canonical project state.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validate the full feature and update handoff notes.

- [x] T052 [P] Update quickstart validation notes in `/Users/stevenyi/work/blue-electron/specs/046-meter-map-parity/quickstart.md`
- [x] T053 [P] Update project handoff state in `/Users/stevenyi/work/blue-electron/STATUS.md`
- [x] T054 Run focused meter renderer and shared tests from `/Users/stevenyi/work/blue-electron`
- [x] T055 Run `pnpm --filter @blue/app test` from `/Users/stevenyi/work/blue-electron`
- [x] T056 Run `pnpm --filter @blue/app build` from `/Users/stevenyi/work/blue-electron`
- [x] T057 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron` if `@blue/data` meter behavior changed
- [x] T058 Run `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` from `/Users/stevenyi/work/blue-electron`
- [x] T059 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`
- [x] T060 Perform manual scenarios from `/Users/stevenyi/work/blue-electron/specs/046-meter-map-parity/quickstart.md`
- [x] T061 Update closeout notes in `/Users/stevenyi/work/blue-electron/specs/046-meter-map-parity/status.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **US1 Region Bar (Phase 3)**: Depends on Foundation and is the MVP.
- **US2 Boundary Math (Phase 4)**: Depends on Foundation and should be implemented before considering US1 complete for mixed meters.
- **US3 Modal/Menu (Phase 5)**: Depends on Foundation; can run partly in parallel with US1/US2 after patch support exists.
- **US4 Canonical Hardening (Phase 6)**: Depends on all edit surfaces.
- **Polish**: Depends on selected stories being complete.

### User Story Dependencies

- **US1 (P1)**: Requires Foundation.
- **US2 (P1)**: Requires Foundation and directly affects US1 correctness.
- **US3 (P1)**: Independent after Foundation, except final Score panel dialog state wiring must coordinate with row components.
- **US4 (P2)**: Depends on all P1 edit paths.

### Parallel Opportunities

- T002 through T006 can run in parallel.
- T007 through T010 can run in parallel.
- T019 through T022 can run in parallel after Foundation.
- T029 through T031 can run in parallel after Foundation.
- T038 through T040 can run in parallel after Foundation.
- T046 through T048 can run in parallel after all P1 behaviors exist.
- T052 and T053 can run in parallel during polish.

## Parallel Example: Foundation

```text
Task: "T007 Add @blue/data meter XML and mixed-meter conversion regression tests in /Users/stevenyi/work/blue-electron/packages/blue-data/src/time/meter-map.test.ts"
Task: "T008 Add shared meter snapshot tests in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-map-contract.test.ts"
Task: "T009 Add shared meter patch validation tests in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/meter-map-contract.test.ts"
```

## Parallel Example: Region Bar

```text
Task: "T023 Implement meter tooltip formatting, default-entry selection, and nearest-entry edit helpers in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/meter-map-utils.ts"
Task: "T024 Update MeterRegionBar rendering in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MeterRegionBar.tsx"
Task: "T027 Implement MeterEntryDialog in /Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MeterEntryDialog.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundation.
2. Implement accumulated meter math utilities.
3. Implement meter row rendering and row-level add/edit/delete.
4. Validate mixed-meter rendering and hit testing.

### Then Modal

1. Replace the Project menu placeholder.
2. Add command listener.
3. Implement the modal table and copy semantics.
4. Validate OK/Cancel and save/reload.

### Final Hardening

1. Run focused and broad tests.
2. Complete manual quickstart scenarios.
3. Update status documentation with completed validation.
