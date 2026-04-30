# Tasks: Blue Data Note Parsing and Note Processor Parity

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required by FR-012 and the constitution's serialization rule. Add parser and processor parity fixtures that validate Java-compatible semantics.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently after the foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story the task serves
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm Java parser and note-processor anchors plus the exact TypeScript deltas before implementation starts.

- [x] T001 Review Java note/parser/processor anchors in `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/research.md`
- [x] T002 [P] Inventory current parser and timing behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/score.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/note.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/generic-score.ts`
- [x] T003 [P] Inventory note processor XML and chain behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.ts`
- [x] T004 [P] Inventory incompatible processor implementations in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared parser and processor fixture coverage plus XML normalization scaffolding used by all user stories.

**Critical**: No user story implementation should begin until this phase is complete.

### Tests

- [x] T005 [P] Add parser fixture harness and baseline expectations in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/score.parser-parity.test.ts`
- [x] T006 [P] Add note timing/objective-duration baseline tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/note.test.ts`
- [x] T007 [P] Expand chain-map load/save/copy baseline tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.test.ts`

### Implementation

- [x] T008 Add shared parser and processor fixture helpers in `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/note-processing-fixtures.ts`
- [x] T009 Implement Java full-class-name processor normalization in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/code.ts`
- [x] T010 Wire normalized processor type handling into chain parsing and serialization in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.ts`
- [x] T011 Add unsupported-processor preservation scaffolding (including `PythonProcessor`) in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor.ts`

**Checkpoint**: Shared fixture infrastructure and processor XML normalization are in place.

---

## Phase 3: User Story 1 - Parse Java Score Text the Same Way (Priority: P1) MVP

**Goal**: Match Java parser semantics for carries, shorthand, timing expansion, ties, ramps, comments, continuation lines, and bracketed expressions.

**Independent Test**: Run representative parser fixtures through Java and TypeScript and confirm equivalent note pfields and timing.

### Tests for User Story 1

- [x] T012 [P] [US1] Add carry (`.`) and shorthand fixture tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/score.parser-parity.test.ts`
- [x] T013 [P] [US1] Add `+` start-time expansion and continuation-line fixture tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/score.parser-parity.test.ts`
- [x] T014 [P] [US1] Add ramp and bracketed-expression fixture tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/score.parser-parity.test.ts`
- [x] T015 [P] [US1] Add comment and tied-note parser fixture tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/score.parser-parity.test.ts`

### Implementation for User Story 1

- [x] T016 [US1] Restore Java-compatible parser semantics for carry, shorthand, comments, and continuation lines in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/score.ts`
- [x] T017 [US1] Restore Java-compatible tie and objective-duration behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/note.ts`
- [x] T018 [US1] Ensure `GenericScore` uses shared parser semantics without divergence in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/generic-score.ts`
- [x] T019 [US1] Align score utility time helpers with Java behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/utilities/score.ts`

**Checkpoint**: User Story 1 is independently testable and parser output matches Java fixtures.

---

## Phase 4: User Story 2 - Load and Save Java Note Processor Chains (Priority: P1)

**Goal**: Preserve Java-compatible note processor XML identities, named chains, and unsupported processor payloads through load/save/copy.

**Independent Test**: Load Java projects with inline and named chains, save from TypeScript, and confirm Java reopens the same chains and parameters.

### Tests for User Story 2

- [x] T020 [P] [US2] Add Java full-class-name processor load tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor.test.ts`
- [x] T021 [P] [US2] Add processor XML save-shape and type-identity tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain.test.ts`
- [x] T022 [P] [US2] Add named chain round-trip and deep-copy tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.test.ts`
- [x] T023 [P] [US2] Add unsupported `PythonProcessor` preservation tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor.test.ts`

### Implementation for User Story 2

- [x] T024 [US2] Restore Java-compatible processor XML load/save identities in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor.ts`
- [x] T025 [US2] Restore chain XML load/save behavior for inline processors in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain.ts`
- [x] T026 [US2] Restore named chain map load/save/copy behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.ts`
- [x] T027 [US2] Preserve unsupported processor payloads without data loss in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain.ts`
- [x] T028 [US2] Wire note processor chain map persistence through project model load/save paths in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/generic-score.ts`

**Checkpoint**: User Stories 1 and 2 together provide parser parity plus safe Java note-processor XML round-trip.

---

## Phase 5: User Story 3 - Execute Processors with Java Semantics (Priority: P2)

**Goal**: Match Java processor execution semantics for the known incompatible high-risk processors and reject invalid configurations when Java rejects them.

**Independent Test**: Execute representative chains in Java and TypeScript for high-risk processors and compare resulting notes/errors.

### Tests for User Story 3

- [x] T029 [P] [US3] Add parity tests for equals/rotate/sublist and ordering-sensitive processors in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/processor-parity.test.ts`
- [x] T030 [P] [US3] Add parity tests for line add/multiply and value-time mapping processors in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/processor-parity.test.ts`
- [x] T031 [P] [US3] Add parity tests for add/multiply/random add/random multiply processors in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/processor-parity.test.ts`
- [x] T032 [P] [US3] Add parity tests for pch add/pch inversion/tuning/time warp processors plus invalid-input failures in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/processor-parity.test.ts`

### Implementation for User Story 3

- [x] T033 [US3] Restore Java-compatible equals/rotate/sublist processor behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/equals-processor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/rotate-processor.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/sublist-processor.ts`
- [x] T034 [US3] Restore Java-compatible line add/multiply behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/line-add-processor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/line-multiply-processor.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/value-time-mapper.ts`
- [x] T035 [US3] Restore Java-compatible add/multiply/random add/random multiply behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/add-processor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/multiply-processor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/random-add-processor.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/random-multiply-processor.ts`
- [x] T036 [US3] Restore Java-compatible pch add/pch inversion/tuning/time warp behavior and failure semantics in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/pch-add-processor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/pch-inversion-processor.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/tuning-processor.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/time-warp-processor.ts`

**Checkpoint**: High-risk processor execution matches Java behavior for the in-scope parity set.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and handoff updates after implementation.

- [x] T037 [P] Update `/Users/stevenyi/work/blue-electron/specs/030-blue-data-note-processing-parity/quickstart.md` with any fixture-specific validation notes discovered during implementation
- [x] T038 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with 030 implementation progress, validation, and deferrals
- [x] T039 Run `pnpm --filter @blue/data test` from `/Users/stevenyi/work/blue-electron`
- [x] T040 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational. This is the MVP for this slice.
- **User Story 2 (Phase 4)**: Depends on Foundational and should follow US1 because stable parser semantics are required for chain behavior verification.
- **User Story 3 (Phase 5)**: Depends on Foundational and should follow US1/US2 so execution parity runs against finalized parser and XML contracts.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundational.
- **US2 (P1)**: Depends on US1 parser/time baseline for robust round-trip validation.
- **US3 (P2)**: Depends on US1 and US2 so processor execution parity is validated on finalized parser and serialization behavior.

### Parallel Opportunities

- Setup inventory tasks T002-T004 can run in parallel.
- Foundational tests T005-T007 can run in parallel.
- US1 tests T012-T015 can run in parallel.
- US2 tests T020-T023 can run in parallel.
- US3 tests T029-T032 can run in parallel.
- Polish documentation tasks T037 and T038 can run in parallel.

## Parallel Example: User Story 1

```text
Task: "Add carry and shorthand fixture tests in packages/blue-data/src/utilities/score.parser-parity.test.ts"
Task: "Add start-time expansion and continuation-line fixture tests in packages/blue-data/src/utilities/score.parser-parity.test.ts"
Task: "Add tied-note parser fixture tests in packages/blue-data/src/utilities/score.parser-parity.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "Add Java full-class-name processor load tests in packages/blue-data/src/note-processors/note-processor.test.ts"
Task: "Add processor XML save-shape and type-identity tests in packages/blue-data/src/note-processors/note-processor-chain.test.ts"
Task: "Add unsupported PythonProcessor preservation tests in packages/blue-data/src/note-processors/note-processor.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "Add parity tests for equals/rotate/sublist processors in packages/blue-data/src/note-processors/processor-parity.test.ts"
Task: "Add parity tests for random and arithmetic processors in packages/blue-data/src/note-processors/processor-parity.test.ts"
Task: "Add invalid-input failure parity tests in packages/blue-data/src/note-processors/processor-parity.test.ts"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Validate parser fixtures against Java-equivalent expectations.
4. Stop and review before expanding to chain XML and processor execution parity.

### Incremental Delivery

1. Restore shared parser and note timing behavior.
2. Restore Java-compatible note-processor XML and named-chain persistence.
3. Restore high-risk processor execution semantics and failure behavior.
4. Re-run full `@blue/data` validation and publish handoff notes.

### Handoff Notes

- Keep this slice focused on note parser and note processor behavior; full render pipeline parity belongs to Spec 031.
- Preserve unsupported processors losslessly if execution support must remain deferred.
- Use centralized Java class-name normalization for processors to avoid one-off loader logic.
