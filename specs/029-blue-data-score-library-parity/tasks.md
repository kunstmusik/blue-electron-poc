# Tasks: Blue Data Score, Library, and Sound Object Model Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required by FR-012 and the constitution's serialization rule. Add or update round-trip and behavior tests for library-backed projects, nested score graphs, and representative pattern/audio layer structures.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently after the foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm Java model anchors and document the exact TypeScript compatibility deltas before implementation.

- [x] T001 Review Java score/library/source anchors in `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/research.md`
- [x] T002 [P] Inventory current score graph model and loader behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/poly-object.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/sound-layer.ts`
- [x] T003 [P] Inventory current root library and instance behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/instance.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/instrument-library.ts`
- [x] T004 [P] Inventory class-name and object-loader normalization paths in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-registry.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-utilities.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/patterns/pattern-layer.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-layer.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared fixtures and type-normalization coverage that every user story depends on.

**Critical**: No user story implementation should begin until this phase is complete.

### Tests

- [x] T005 [P] Add class-name normalization and registry alias tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-registry.test.ts`
- [x] T006 [P] Add shared score/library fixture parser tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/serialization/xml-reader.test.ts`
- [x] T007 [P] Add baseline score default and deep-copy regression tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score-model-compatibility.test.ts`

### Implementation

- [x] T008 Implement central Java full-class-name normalization helpers in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-utilities.ts`
- [x] T009 Apply normalized class-name resolution in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-registry.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/patterns/pattern-layer.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live-data.ts`
- [x] T010 Add reusable score/library fixture helpers for upcoming tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score-model-compatibility.test.ts`

**Checkpoint**: Class-name normalization and baseline score/library fixtures are in place.

---

## Phase 3: User Story 1 - Load Library-Backed Java Projects Correctly (Priority: P1) MVP

**Goal**: Load Java projects with sound-object libraries, instrument libraries, and library-backed instances without reference loss.

**Independent Test**: Load fixture projects containing `soundObjectLibrary`, `Instance` sound objects, and legacy arrangement instrument ids; verify references resolve and survive save/reopen.

### Tests for User Story 1

- [x] T011 [P] [US1] Add sound-object-library load and `objRefId` tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.test.ts`
- [x] T012 [P] [US1] Add instance library-resolution and unresolved-fallback tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/instance.test.ts`
- [x] T013 [P] [US1] Add legacy instrument-library arrangement-resolution tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/arrangement.test.ts`

### Implementation for User Story 1

- [x] T014 [US1] Implement Java-compatible library object load/save with stable `objRefId` behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.ts`
- [x] T015 [US1] Implement instance-to-library binding and safe unresolved behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/instance.ts`
- [x] T016 [US1] Implement Java-compatible instrument-library tree load and lookup behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/instrument-library.ts`
- [x] T017 [US1] Wire library reference maps through score and arrangement load paths in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/poly-object.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/arrangement.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`

**Checkpoint**: User Story 1 is independently testable and library-backed load semantics are restored.

---

## Phase 4: User Story 2 - Save Score and Sound Object XML That Java Can Reopen (Priority: P1)

**Goal**: Save score/layer/sound-object XML in Java-compatible shape, including `GenericScore`, `PolyObject`, `SoundLayer`, and representative pattern/audio layers.

**Independent Test**: Load and save representative projects and verify Java Blue can reopen the resulting score and sound-object structures.

### Tests for User Story 2

- [x] T018 [P] [US2] Add `GenericScore` score-text field compatibility tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/generic-score.test.ts`
- [x] T019 [P] [US2] Add sound-object base-envelope XML compatibility tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-utilities.test.ts`
- [x] T020 [P] [US2] Add poly-object and sound-layer XML round-trip tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/poly-object.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/sound-layer.test.ts`
- [x] T021 [P] [US2] Add pattern/audio layer XML interop tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/patterns/pattern-layer.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-layer.test.ts`

### Implementation for User Story 2

- [x] T022 [US2] Restore Java-compatible sound-object base XML generation in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-utilities.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/abstract-sound-object.ts`
- [x] T023 [US2] Restore Java-compatible `GenericScore` score-text load/save behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/generic-score.ts`
- [x] T024 [US2] Restore Java-compatible `PolyObject` and `SoundLayer` XML fields and parser behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/poly-object.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/sound-layer.ts`
- [x] T025 [US2] Update pattern/audio layer child-object loading to accept Java full class names in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/patterns/pattern-layer.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-layer.ts`
- [x] T026 [US2] Ensure Java-compatible save paths for representative sound objects across `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/` concrete classes that use base-envelope helpers

**Checkpoint**: User Stories 1 and 2 together provide load/save safety for the 029 score/library model surface.

---

## Phase 5: User Story 3 - Preserve Score and Layer Model Semantics (Priority: P2)

**Goal**: Align score defaults, deep-copy behavior, and layer semantics so downstream parity slices can depend on stable shared models.

**Independent Test**: Build and deep-copy nested score graphs with poly objects, sound layers, pattern layers, and audio layers; verify defaults and copy isolation match Java expectations.

### Tests for User Story 3

- [x] T027 [P] [US3] Add missing-layer-group normalization tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score-model-compatibility.test.ts`
- [x] T028 [P] [US3] Add score-graph deep-copy isolation tests for poly/sound/pattern/audio layers in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score-model-compatibility.test.ts`
- [x] T029 [P] [US3] Add corrupt-library-entry handling tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.test.ts`

### Implementation for User Story 3

- [x] T030 [US3] Restore Java-compatible score default root behavior and legacy structure normalization in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/layers/layer-group-provider-manager.ts`
- [x] T031 [US3] Implement deep-copy parity for poly objects and sound layers in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/poly-object.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/sound-layer.ts`
- [x] T032 [US3] Align library corruption/unresolved reference handling with Java-compatible safe behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/instance.ts`
- [x] T033 [US3] Preserve copy/load invariants for pattern and audio layer groups in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/patterns/patterns-layer-group.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-layer-group.ts`

**Checkpoint**: Score graph model semantics are stable enough for later note-processing and CSD-render parity slices.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and handoff updates after implementation.

- [x] T034 [P] Update `/Users/stevenyi/work/blue-electron/specs/029-blue-data-score-library-parity/quickstart.md` with any fixture-specific validation notes discovered during implementation
- [x] T035 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with 029 implementation progress, validation, and deferrals
- [x] T036 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [x] T037 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. This is the MVP for this slice.
- **User Story 2 (Phase 4)**: Depends on Foundational and should follow US1 because save behavior needs the restored load/reference model.
- **User Story 3 (Phase 5)**: Depends on Foundational and should follow US1/US2 so copy semantics reflect completed XML and reference behavior.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundational.
- **US2 (P1)**: Depends on US1 library and loader parity for robust save behavior.
- **US3 (P2)**: Depends on US1 and US2 because deep-copy/normalization should operate on the finalized model contracts.

### Parallel Opportunities

- Setup inventory tasks T002-T004 can run in parallel.
- Foundational tests T005-T007 can run in parallel.
- US1 tests T011-T013 can run in parallel.
- US2 tests T018-T021 can run in parallel.
- US3 tests T027-T029 can run in parallel.
- Polish documentation tasks T034 and T035 can run in parallel.

## Parallel Example: User Story 1

```text
Task: "Add sound-object-library load and objRefId tests in packages/blue-data/src/sound-objects/sound-object-library.test.ts"
Task: "Add instance library-resolution and unresolved-fallback tests in packages/blue-data/src/sound-objects/instance.test.ts"
Task: "Add legacy instrument-library arrangement-resolution tests in packages/blue-data/src/arrangement.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "Add GenericScore score-text field compatibility tests in packages/blue-data/src/sound-objects/generic-score.test.ts"
Task: "Add sound-object base-envelope XML compatibility tests in packages/blue-data/src/sound-objects/sound-object-utilities.test.ts"
Task: "Add pattern/audio layer XML interop tests in packages/blue-data/src/score/patterns/pattern-layer.test.ts and packages/blue-data/src/score/audio/audio-layer.test.ts"
```

## Parallel Example: Polish Phase

```text
Task: "Update specs/029-blue-data-score-library-parity/quickstart.md with any fixture-specific validation notes discovered during implementation"
Task: "Update STATUS.md with 029 implementation progress, validation, and deferrals"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Validate that library-backed projects load with resolved references and no structural loss.
4. Stop and review before taking on save-shape and deep-copy semantics.

### Incremental Delivery

1. Restore library-backed loading and reference binding.
2. Restore Java-compatible score/sound-object XML saving.
3. Finish score defaults and deep-copy semantics.
4. Validate fixtures and publish handoff notes.

### Handoff Notes

- Keep this slice focused on score/library/sound-object model compatibility; note-processor semantics belong to Spec 030 and full CSD-render pipeline parity belongs to Spec 031.
- Pattern/audio layer XML compatibility is in scope even though the Java implementations live outside `blue-core`.
- Use centralized Java full-class-name normalization to avoid one-off loader fixes across modules.
