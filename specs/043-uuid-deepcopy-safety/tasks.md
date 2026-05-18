# Tasks: UUID And Deep Copy Safety

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/identity-copy-contract.md

**Tests**: Tests are required by FR-013 and the constitution's serialization/test-first rules. Add failing regression coverage before implementation for every identity policy change.

**Organization**: Tasks are grouped by user story so load/create identity safety, duplicate clone safety, load/save preservation, and explicit deep-copy semantics can be validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks in the same phase when files and prerequisites do not overlap.
- **[Story]**: Which user story the task serves.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Context)

**Purpose**: Confirm the handoff, Java parity anchors, and current TypeScript identity hot spots before implementation starts.

- [x] T001 Review active planning docs in `/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/spec.md`, `/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/research.md`, and `/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/contracts/identity-copy-contract.md`
- [x] T002 [P] Review historical handoff notes in `/Users/stevenyi/work/blue-electron/UUID_AND_DEEPCOPY.md` and confirm no active requirement is missing from `/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/spec.md`
- [x] T003 [P] Review Java BSB copy-constructor anchors under `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/BlueSynthBuilder.java`, `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/blueSynthBuilder/BSBGraphicInterface.java`, and `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/blueSynthBuilder/BSBGroup.java`
- [x] T004 [P] Inventory current TypeScript widget uniqueId generation and load assignment in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-group.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-widget.ts`
- [x] T005 [P] Inventory current automation id generation and copy behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-list.ts`
- [x] T006 [P] Inventory current whole-object duplicate paths in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/copy-buffer.ts`
- [x] T007 [P] Inventory renderer BSB paste and patch assumptions in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceCanvas.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-editor-panel-sound-patch.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared identity infrastructure and fixture helpers required by all user stories.

**Critical**: No user story implementation should begin until this phase is complete.

### Tests

- [x] T008 [P] Add UUID utility coverage for native `randomUUID`, fallback formatting, uniqueness smoke behavior, and browser-safe globals in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/uuid.test.ts`
- [x] T009 [P] Add BSB identity traversal fixture coverage for nested groups and slider-bank child sliders in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-identity.test.ts`
- [x] T010 [P] Add shared clone-safety fixture builders for BSB XML with explicit uniqueIds, missing uniqueIds, duplicate uniqueIds, parameters, presets, and dropdown items in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`

### Implementation

- [x] T011 Implement shared UUID-style id generation in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/uuid.ts`
- [x] T012 Export the UUID helper through `/Users/stevenyi/work/blue-electron/packages/blue-data/src/index.ts` only if public consumers need it; otherwise keep it internal and document the decision in `/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/status.md`
- [x] T013 Implement BSB widget-tree traversal, id collection, uniqueness checks, and deterministic repair result types in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-identity.ts`
- [x] T014 Wire the shared BSB identity helper into imports without dynamic imports in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.ts`
- [x] T015 Add test fixture helper exports or local builders needed by later tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`

**Checkpoint**: Shared UUID generation, BSB tree traversal, and reusable fixtures are ready for user-story work.

---

## Phase 3: User Story 1 - Create Widgets Safely After Loading Existing BSB Data (Priority: P1) MVP

**Goal**: Loading existing BSB data and then creating or editing widgets never produces duplicate edit handles.

**Independent Test**: Load explicit-id, missing-id, and duplicate-id BSB XML fixtures; add or patch widgets; verify all widget uniqueIds are unique and widget-targeted operations affect exactly one widget.

### Tests for User Story 1

- [x] T016 [P] [US1] Add regression test for loading explicit legacy `<id>w1</id>` then creating a new widget with a non-colliding uniqueId in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`
- [x] T017 [P] [US1] Add regression test for loading legacy BSB XML without uniqueIds and assigning unique editable uniqueIds in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`
- [x] T018 [P] [US1] Add regression test for loading duplicate widget uniqueIds and repairing later colliding widgets before editing in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`
- [x] T019 [P] [US1] Add nested group and slider-bank id normalization coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-identity.test.ts`
- [x] T020 [P] [US1] Add widget-targeted mutation isolation coverage for update/remove by id after load repair in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`

### Implementation for User Story 1

- [x] T021 [US1] Replace module-level `_nextWidgetId` generation with UUID-backed generation in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.ts`
- [x] T022 [US1] Normalize missing and duplicate loaded widget uniqueIds after XML load in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.ts`
- [x] T023 [US1] Ensure `createWidgetByType()` checks the full BSB tree for collisions before returning a new widget in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.ts`
- [x] T024 [US1] Extend BSB group traversal support for nested groups and slider-bank child sliders in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-group.ts`
- [x] T025 [US1] Verify `findWidgetById()` and `removeWidget()` continue to resolve exactly one widget after id repair in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.ts`
- [x] T026 [US1] Run `pnpm --filter @blue/data exec vitest run src/instruments/blue-synth-builder/bsb-identity.test.ts src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts` from `/Users/stevenyi/work/blue-electron`

**Checkpoint**: User Story 1 fixes the reviewed P1 duplicate widget uniqueId class and is independently testable.

---

## Phase 4: User Story 2 - Duplicate BSB And Sound Objects Without Shared Identity (Priority: P1)

**Goal**: User-visible duplication of BSB instruments and Sound objects preserves musical content but regenerates clone-sensitive identities.

**Independent Test**: Duplicate a BSB instrument and a Sound with embedded BSB XML, compare original and duplicate widget uniqueIds/parameter uniqueIds, and patch each duplicate independently.

### Tests for User Story 2

- [x] T027 [P] [US2] Add BlueSynthBuilder duplicate test proving widget uniqueIds differ and objectName/bounds/values match in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`
- [x] T028 [P] [US2] Add BlueSynthBuilder duplicate test proving automation parameter uniqueIds differ and names/ranges/points match in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`
- [x] T029 [P] [US2] Add Sound duplicate test proving embedded BSB widget uniqueIds and automation parameter uniqueIds are rekeyed in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound.test.ts`
- [x] T030 [P] [US2] Add CopyBuffer paste test proving BSB instrument copies are clone-safe in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/copy-buffer.test.ts`
- [x] T031 [P] [US2] Add duplicate sibling-isolation test proving patching one duplicated widget by id cannot affect its sibling duplicate in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`
- [x] T032 [P] [US2] Add renderer optimistic patch smoke coverage for UUID-style BSB uniqueIds in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/score-object-editor-panel-sound-patch.test.ts`

### Implementation for User Story 2

- [x] T033 [US2] Implement BSB duplicate rekey operation and old-to-new uniqueId maps in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-identity.ts`
- [x] T034 [US2] Add automation parameter rekey support that preserves automation content in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter.ts`
- [x] T035 [US2] Add ParameterList-level rekey/copy helper for duplicate flows in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-list.ts`
- [x] T036 [US2] Route `BlueSynthBuilder.deepCopy()` through duplicate-safe programmatic copy and identity rekeying in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts`
- [x] T037 [US2] Preserve objectName, widget bounds, values, line data, and opcode data while rekeying duplicate BSB widget uniqueIds in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts`
- [x] T038 [US2] Store embedded Sound BSB data structurally, duplicate/rekey it through `BlueSynthBuilder.deepCopy()`, and serialize only at XML/API adapter boundaries in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound.ts`
- [x] T039 [US2] Ensure legacy plain-text or empty Sound BSB content still follows existing fallback behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound.ts`
- [x] T040 [US2] Confirm `CopyBuffer.getCopy()` returns clone-safe duplicated objects for BSB and Sound entries in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/copy-buffer.ts`
- [x] T041 [US2] Update BSB snapshot patch assumptions only if UUID-style uniqueIds require test fixture changes in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- [x] T042 [US2] Run `pnpm --filter @blue/data exec vitest run src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts src/sound-objects/sound.test.ts src/copy-buffer.test.ts` from `/Users/stevenyi/work/blue-electron`

**Checkpoint**: BSB and Sound duplicates are independent editable objects with fresh clone-sensitive identities.

---

## Phase 5: User Story 3 - Preserve Existing Project Identity Across Ordinary Load And Save (Priority: P2)

**Goal**: Ordinary project load/save preserves explicit identities and avoids unnecessary XML churn.

**Independent Test**: Load and save BSB data with explicit widget uniqueIds, automation parameter uniqueIds, preset ids, and dropdown item ids; verify all explicit identities survive unchanged when no duplication occurs.

### Tests for User Story 3

- [x] T043 [P] [US3] Add ordinary BSB load/save preservation test for explicit widget uniqueIds in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.test.ts`
- [x] T044 [P] [US3] Add ordinary load/save preservation test for automation parameter uniqueIds in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter.test.ts`
- [x] T045 [P] [US3] Add ordinary load/save preservation test for preset uniqueIds and current preset identity in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/preset-group.test.ts`
- [x] T046 [P] [US3] Add ordinary load/save preservation test for dropdown item uniqueIds and `id:<uniqueId>` preset values in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.test.ts`
- [x] T047 [P] [US3] Add Sound ordinary load/save preservation test for embedded BSB identities in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound.test.ts`

### Implementation for User Story 3

- [x] T048 [US3] Preserve explicit widget uniqueIds through BSB save/load after identity normalization in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-group.ts`
- [x] T049 [US3] Ensure automation `Parameter.loadFromXML()` and `saveAsXML()` continue to preserve explicit uniqueIds in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter.ts`
- [x] T050 [US3] Add programmatic duplicate helpers for presets that preserve load/save uniqueIds but rekey duplicate uniqueIds in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/preset.ts`
- [x] T051 [US3] Add programmatic duplicate helpers for preset group trees that rewrite current preset ids in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/preset-group.ts`
- [x] T052 [US3] Verify dropdown item identity preservation during ordinary load/save and rekeying during duplicate operations in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-dropdown.ts`
- [x] T053 [US3] Run `pnpm --filter @blue/data exec vitest run src/instruments/blue-synth-builder.test.ts src/automation/parameter.test.ts src/instruments/blue-synth-builder/preset-group.test.ts src/sound-objects/sound.test.ts` from `/Users/stevenyi/work/blue-electron`

**Checkpoint**: Ordinary load/save preserves explicit project identities while repaired legacy/malformed widget uniqueIds remain safe for editing.

---

## Phase 6: User Story 4 - Make Deep Copy Behavior Explicit And Predictable (Priority: P2)

**Goal**: Programmatic duplicate copy replaces XML round-trip copying for BSB aggregates, and duplicate rekeying is built into the copy path.

**Independent Test**: Exercise user-visible duplicate flows; copies are independent and content-equivalent while rekeying local identities.

### Tests for User Story 4

- [x] T054 [P] [US4] Add BSBGraphicInterface duplicate independence test in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.test.ts`
- [x] T055 [P] [US4] Add BSBGroup and BSBWidget duplicate independence tests for nested child arrays and widget-specific mutable fields in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-group.test.ts`
- [x] T056 [P] [US4] Add PresetGroup and Preset duplicate independence tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/preset-group.test.ts`
- [x] T057 [P] [US4] Add BlueSynthBuilder duplicate test proving opcode list, graphic interface, parameter list, and preset group are copied without XML round-trip coupling in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`
- [x] T058 [P] [US4] Add regression test that mutating a duplicated widget tree, preset map, opcode list, or parameters does not mutate the source in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts`

### Implementation for User Story 4

- [x] T059 [US4] Add duplicate-safe copy behavior to BSBWidget subclasses in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-widget.ts`
- [x] T060 [US4] Add programmatic deep copy for BSBGroup children and group style fields in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-group.ts`
- [x] T061 [US4] Add programmatic deep copy for BSBGraphicInterface root group and grid settings in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.ts`
- [x] T062 [US4] Add programmatic deep copy for Preset and PresetGroup trees in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/preset.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/preset-group.ts`
- [x] T063 [US4] Replace `BlueSynthBuilder` constructor XML round-trip copies for opcode list, graphic interface, and preset group with programmatic copy calls in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts`
- [x] T064 [US4] Document the ordinary load/save versus duplicate-rekey split in code comments or exported method names in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-identity.ts`
- [x] T065 [US4] Run `pnpm --filter @blue/data exec vitest run src/instruments/blue-synth-builder/bsb-graphic-interface.test.ts src/instruments/blue-synth-builder/bsb-group.test.ts src/instruments/blue-synth-builder/preset-group.test.ts src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts` from `/Users/stevenyi/work/blue-electron`

**Checkpoint**: Duplicate copy no longer depends on XML persistence semantics for BSB aggregates, and duplicate behavior is an explicit rekey operation.

---

## Phase 7: Polish & Cross-Cutting Validation

**Purpose**: Final validation, documentation, and handoff after selected user stories are implemented.

- [x] T066 [P] Update `/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/quickstart.md` with any implementation-specific validation commands discovered during the work
- [x] T067 [P] Update `/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/status.md` with implementation progress, validation results, and deferrals
- [x] T068 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with Spec 043 implementation status and validation results
- [x] T069 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [x] T070 Run `pnpm --filter @blue/data build` from `/Users/stevenyi/work/blue-electron`
- [x] T071 Run `pnpm --filter @blue/app exec vitest run --config vitest.config.ts src/renderer/tests/score-object-editor-panel-sound-patch.test.ts --browser.enabled=false` from `/Users/stevenyi/work/blue-electron`
- [x] T072 Run `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` from `/Users/stevenyi/work/blue-electron`
- [x] T073 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`
- [x] T074 Perform the manual validation scenarios from `/Users/stevenyi/work/blue-electron/specs/043-uuid-deepcopy-safety/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP because it fixes the reviewed P1 loaded-id/new-widget collision.
- **User Story 2 (Phase 4)**: Depends on Foundational and should follow US1 because duplicate rekeying uses the same BSB identity helper.
- **User Story 3 (Phase 5)**: Depends on Foundational; it can proceed after US1 if staffed separately, but final validation should run after US2 because duplicate policy and preservation policy interact.
- **User Story 4 (Phase 6)**: Depends on Foundational and should run after or alongside US2 because duplicate copy and duplicate rekey behavior share the same entrypoints.
- **Polish (Phase 7)**: Depends on all selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories after Foundational.
- **US2 (P1)**: Depends on the BSB identity helper from Foundational and benefits from US1 normalization behavior.
- **US3 (P2)**: No hard dependency on US2 for ordinary load/save, but final verification should run after duplicate rekeying is in place.
- **US4 (P2)**: Shares code with US2 and should be coordinated to avoid conflicting copy method semantics.

### Parallel Opportunities

- Setup inventory tasks T002-T007 can run in parallel.
- Foundational tests T008-T010 can run in parallel before implementation.
- US1 tests T016-T020 can run in parallel.
- US2 tests T027-T032 can run in parallel.
- US3 tests T043-T047 can run in parallel.
- US4 tests T054-T058 can run in parallel.
- Polish documentation tasks T066-T068 can run in parallel.

## Parallel Example: User Story 1

```text
Task: "Add regression test for loading explicit legacy <id>w1</id> then creating a new widget with a non-colliding uniqueId in packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts"
Task: "Add regression test for loading legacy BSB XML without uniqueIds and assigning unique editable uniqueIds in packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts"
Task: "Add regression test for loading duplicate widget uniqueIds and repairing later colliding widgets before editing in packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "Add BlueSynthBuilder duplicate test proving widget uniqueIds differ and objectName/bounds/values match in packages/blue-data/src/instruments/blue-synth-builder/blue-synth-builder-clone-safety.test.ts"
Task: "Add Sound duplicate test proving embedded BSB widget uniqueIds and automation parameter uniqueIds are rekeyed in packages/blue-data/src/sound-objects/sound.test.ts"
Task: "Add CopyBuffer paste test proving BSB instrument copies are clone-safe in packages/blue-data/src/copy-buffer.test.ts"
```

## Parallel Example: User Story 4

```text
Task: "Add BSBGraphicInterface duplicate independence test in packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.test.ts"
Task: "Add BSBGroup and BSBWidget duplicate independence tests in packages/blue-data/src/instruments/blue-synth-builder/bsb-group.test.ts"
Task: "Add PresetGroup and Preset duplicate independence tests in packages/blue-data/src/instruments/blue-synth-builder/preset-group.test.ts"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1.
3. Validate the explicit-id/new-widget collision regression and legacy missing-id behavior.
4. Stop and review before broad duplicate rekeying.

### Incremental Delivery

1. Deliver US1 to fix loaded-id/new-widget collision.
2. Deliver US2 to make BSB and Sound duplication clone-safe.
3. Deliver US3 to lock down ordinary load/save preservation.
4. Deliver US4 to replace XML-based copy semantics with programmatic duplicate copy.
5. Run the full validation and update handoff docs.

### Handoff Notes

- Keep `@blue/data` free of Node.js built-ins, dynamic imports, and renderer dependencies.
- Use Java Blue programmatic copy constructors as the reference for content-equivalent copying, but keep TypeScript `deepCopy()` duplicate-facing.
- Preserve objectName and musical content during duplication; local identities are rekeyed and dependent references are rewritten.
- Do not rekey preset uniqueIds or dropdown item uniqueIds in this slice unless a failing test proves the policy is unsafe.
- The historical `/Users/stevenyi/work/blue-electron/UUID_AND_DEEPCOPY.md` file should not override this task list after implementation begins.
