# Tasks: Blue Data XML Preservation and Root Compatibility

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required by FR-012 and the constitution's serialization rule. Root XML round-trip coverage and copy/migration regressions must be written before or alongside implementation in the touched data-model files.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently after the foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm Java parity anchors and pin down the exact TypeScript root-loss surface before implementation starts.

- [x] T001 Verify Java root load/save/copy/upgrade behavior against `/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/research.md`
- [x] T002 [P] Inventory current root section load/save ordering and plugin data handling in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- [x] T003 [P] Inventory current preservation stubs in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/scratch-pad-data.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/markers-list.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish fixture coverage, preservation helpers, and canonical root defaults before any story-specific work begins.

**Critical**: No user story implementation should begin until these tasks are complete.

### Tests

- [x] T004 [P] Add root load/save/deep-copy fixture coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data-root-compatibility.test.ts`
- [x] T005 [P] Add ProjectProperties default and legacy-alias tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/project-properties.test.ts`
- [x] T006 [P] Add preservation-section round-trip tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/scratch-pad-data.test.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/markers-list.test.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.test.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.test.ts`
- [x] T007 [P] Add omitted-mixer default and root mixer-absence tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.test.ts`

### Implementation

- [x] T008 Implement Java-compatible ProjectProperties defaults and legacy-load normalization in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/project-properties.ts`
- [x] T009 Implement preservation-capable load/save/deepCopy behavior for scratch, markers, MIDI input, and named note-processor chains in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/scratch-pad-data.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/markers-list.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.ts`
- [x] T010 Add root plugin-data preservation helpers and root load-order scaffolding in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- [x] T011 Add Java-compatible omitted-mixer root handling in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.ts`

**Checkpoint**: Root fixtures exist, preservation stubs no longer drop data by construction, and root defaults/omitted-mixer semantics are ready for story work.

---

## Phase 3: User Story 1 - Load Existing Java Projects Without Root Data Loss (Priority: P1) MVP

**Goal**: `BlueData.loadFromString()` loads or losslessly preserves the root sections that Java projects depend on, including legacy root sections and missing-mixer behavior.

**Independent Test**: Load representative Java `.blue` fixtures with library sections, legacy root `udo`, legacy root `timeContext`, plugin data, markers, scratch data, MIDI input state, and omitted mixer sections; verify the resulting `BlueData` object retains that root information without loss.

### Tests for User Story 1

- [x] T012 [US1] Add root load tests for `soundObjectLibrary`, `instrumentLibrary`, legacy root `udo`, legacy root `timeContext`, and plugin data in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data-root-compatibility.test.ts`
- [x] T013 [P] [US1] Add missing-mixer and root load-order regression tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.test.ts`

### Implementation for User Story 1

- [x] T014 [US1] Restore Java-compatible root element load order in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- [x] T015 [US1] Wire preservation-first root handling for `soundObjectLibrary` and `instrumentLibrary` in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/instrument-library.ts`
- [x] T016 [US1] Migrate legacy root `udo` and root `timeContext` into canonical state during load in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/opcodes/udo-utilities.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-context.ts`
- [x] T017 [US1] Preserve pluginData children and wire loaded project properties into time-related root state in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-context.ts`

**Checkpoint**: User Story 1 is independently testable and root project load no longer drops the known Java sections in this slice.

---

## Phase 4: User Story 2 - Save Java-Compatible Root XML (Priority: P1)

**Goal**: TypeScript root XML save output is Java-compatible for the in-scope root sections and does not reintroduce loss after a successful load.

**Independent Test**: Load representative Java root fixtures, save them from TypeScript, and confirm the resulting XML reopens in Java Blue with root sections, canonical property values, and omitted-mixer behavior intact.

### Tests for User Story 2

- [x] T018 [US2] Add Java-compatible root save-structure tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data-root-compatibility.test.ts`
- [x] T019 [P] [US2] Add canonical ProjectProperties save-output tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/project-properties.test.ts`
- [x] T020 [P] [US2] Add preservation-section save tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/scratch-pad-data.test.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/markers-list.test.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.test.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.test.ts`

### Implementation for User Story 2

- [x] T021 [US2] Emit Java-compatible root section ordering and canonical field names in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- [x] T022 [US2] Save canonical ProjectProperties tags and legacy-normalized values in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/project-properties.ts`
- [x] T023 [US2] Save Java-compatible scratch, marker, MIDI input, and named note-processor-chain sections in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/scratch-pad-data.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/markers-list.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.ts`
- [x] T024 [US2] Save preservation-safe pluginData and root library sections in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/instrument-library.ts`

**Checkpoint**: User Stories 1 and 2 together provide Java-compatible root load/save behavior for the in-scope sections.

---

## Phase 5: User Story 3 - Copy And Migrate Projects Safely (Priority: P2)

**Goal**: `BlueData.deepCopy()` and root migration paths preserve the same compatibility-relevant root document state that Java expects.

**Independent Test**: Deep-copy representative root documents and load legacy Java XML variants; verify the copied and migrated results preserve root sections, normalized defaults, and non-shared mutable state.

### Tests for User Story 3

- [x] T025 [US3] Add `BlueData.deepCopy()` parity tests for full root documents in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data-root-compatibility.test.ts`
- [x] T026 [P] [US3] Add legacy root migration regression tests for `controlRate`, command-line aliases, and media-copy aliases in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/migration/upgrade-manager.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/project-properties.test.ts`

### Implementation for User Story 3

- [x] T027 [US3] Complete `BlueData.deepCopy()` parity for all in-scope root sections in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- [x] T028 [US3] Preserve deep-copy behavior for root preservation helpers in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/scratch-pad-data.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/markers-list.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.ts`
- [x] T029 [US3] Update root migration handling for older Java files in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/migration/upgrade-manager.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/migration/upgrades/upgrade-2.1.10.ts`

**Checkpoint**: Root copy and migration behavior is safe enough for later render and editor work to build on.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, handoff notes, and quickstart alignment after implementation.

- [x] T030 [P] Update `/Users/stevenyi/work/blue-electron/specs/028-blue-data-xml-preservation/quickstart.md` with any fixture-specific validation notes discovered during implementation
- [x] T031 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with 028 implementation progress, deferrals, and handoff notes
- [x] T032 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [x] T033 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. This is the MVP for the slice.
- **User Story 2 (Phase 4)**: Depends on Foundational and should follow US1 because save behavior relies on the restored load/preservation path.
- **User Story 3 (Phase 5)**: Depends on Foundational and is safest after US1 and US2 because copy/migration parity should reflect the completed root document model.
- **Polish (Phase 6)**: Depends on the desired story scope being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundational.
- **US2 (P1)**: Depends on US1's root preservation hooks for the cleanest implementation.
- **US3 (P2)**: Depends on the same in-scope root sections implemented for US1 and US2.

### Parallel Opportunities

- Setup inventory tasks T002 and T003 can run in parallel.
- Foundational test tasks T004-T007 can run in parallel because they target different files.
- ProjectProperties work T005/T008 and preservation-section work T006/T009 can run in parallel once fixture shape is agreed.
- US2 save tests T019 and T020 can run in parallel.
- Polish documentation updates T030 and T031 can run in parallel.

## Parallel Example: Foundational Phase

```text
Task: "Add ProjectProperties default and legacy-alias tests in packages/blue-data/src/project-properties.test.ts"
Task: "Add preservation-section round-trip tests in packages/blue-data/src/scratch-pad-data.test.ts, packages/blue-data/src/markers-list.test.ts, packages/blue-data/src/midi/midi-input-processor.test.ts, and packages/blue-data/src/note-processors/note-processor-chain-map.test.ts"
Task: "Add omitted-mixer default and root mixer-absence tests in packages/blue-data/src/mixer/mixer.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "Add canonical ProjectProperties save-output tests in packages/blue-data/src/project-properties.test.ts"
Task: "Add preservation-section save tests in packages/blue-data/src/scratch-pad-data.test.ts, packages/blue-data/src/markers-list.test.ts, packages/blue-data/src/midi/midi-input-processor.test.ts, and packages/blue-data/src/note-processors/note-processor-chain-map.test.ts"
```

## Parallel Example: Polish Phase

```text
Task: "Update specs/028-blue-data-xml-preservation/quickstart.md with any fixture-specific validation notes discovered during implementation"
Task: "Update STATUS.md with 028 implementation progress, deferrals, and handoff notes"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Validate that representative Java root fixtures load without dropping the in-scope sections.
4. Stop and review before moving on to save and deep-copy parity.

### Incremental Delivery

1. Restore root preservation and load order first.
2. Add Java-compatible save behavior for the same in-scope sections.
3. Finish deep-copy and legacy migration parity.
4. Close with fixture validation and handoff updates.

### Handoff Notes

- Keep this slice focused on root-document fidelity and preservation-first behavior; do not absorb the deeper score/library semantics planned under Spec 029 except where root hookup requires it.
- Treat `noteProcessorChainMap` as a root preservation concern in this slice, but leave processor execution semantics to Spec 030.
- Preserve unknown or deferred plugin/root payloads even if full runtime behavior is still future work.
