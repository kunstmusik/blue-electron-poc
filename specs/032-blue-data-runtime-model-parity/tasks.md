# Tasks: Blue Data Runtime Model Parity for Instruments, BSB, Mixer, Automation, and Time

**Input**: Design documents from `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are required by FR-011 and the constitution's serialization/test-first rules. Add Java-vs-TypeScript fixture comparisons for BSB/instrument generation, mixer behavior, automation, and time calculations.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after foundational runtime-model scaffolding is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story the task serves
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Context)

**Purpose**: Confirm the Java runtime-model anchors and the exact TypeScript deltas before implementation starts.

- [x] T001 Review Java runtime-model anchors in `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/research.md`
- [x] T002 [P] Inventory current BSB and instrument generation/preservation paths in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/generic-instrument.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/javascript-instrument.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/python-instrument.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-x7.ts`
- [x] T003 [P] Inventory current mixer XML/render paths in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/channel.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/effect.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/effects-chain.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/effect-manager.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/send.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/channel-list.ts`
- [x] T004 [P] Inventory current automation/time gaps in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-helper.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-list.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-time-manager.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-context.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-state.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared fixture harnesses, comparison helpers, and baseline regression coverage used by all user stories.

**Critical**: No user story implementation should begin until this phase is complete.

### Tests

- [x] T005 [P] Add shared runtime-model fixture harness in `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/runtime-model-fixtures.ts`
- [x] T006 [P] Add baseline runtime XML round-trip coverage for deferred instruments and mixer-heavy projects in `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/runtime-model-roundtrip.test.ts`
- [x] T007 [P] Add baseline automation/time calculation coverage in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter.test.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.test.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-context.test.ts`

### Implementation

- [x] T008 Add shared runtime-model comparison helpers in `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/runtime-model-comparison.ts`
- [x] T009 Add reusable fixture loaders and normalization helpers for BSB, mixer, automation, and time cases in `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/runtime-model-fixtures.ts`
- [x] T010 Wire foundational runtime fixture helpers into new parity test entrypoints in `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/runtime-model-roundtrip.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/mixer-runtime-parity.test.ts`

**Checkpoint**: Shared runtime-model fixtures and parity helpers are ready for focused implementation work.

---

## Phase 3: User Story 1 - Generate Instrument Text the Same Way Java Blue Does (Priority: P1) MVP

**Goal**: Restore Java-compatible BSB generation, GenericInstrument UDO behavior, and preservation-safe behavior for deferred runtime instrument variants.

**Independent Test**: Compare representative BSB, generic, JavaScript, Python, and BlueX7 fixtures between Java and TypeScript and confirm generated text or preserved XML payloads remain compatible.

### Tests for User Story 1

- [x] T011 [P] [US1] Add BSB value replacement, preset/grid default, always-on, and ftable fixture tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-compilation-replacements.test.ts`
- [x] T012 [P] [US1] Add GenericInstrument UDO replacement and global-orchestra/global-score parity tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/generic-instrument.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/runtime-instrument-roundtrip.test.ts`
- [x] T013 [P] [US1] Add lossless preservation tests for JavaScriptInstrument, PythonInstrument, and BlueX7 in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/javascript-instrument.test.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/python-instrument.test.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-x7.test.ts`

### Implementation for User Story 1

- [x] T014 [US1] Restore Java-compatible BSB parameter-list loading and preset/grid default normalization in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-graphic-interface.ts`
- [x] T015 [US1] Restore BSB value replacement semantics for generated instrument, global orchestra, and global score text in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-compilation-unit.ts`
- [x] T016 [US1] Restore Java-compatible BSB always-on scheduling and ftable generation behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-synth-builder/bsb-compilation-unit.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/tables.ts`
- [x] T017 [US1] Restore GenericInstrument UDO reference replacement and generated-text parity in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/generic-instrument.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/opcodes/udo-utilities.ts`
- [x] T018 [US1] Preserve JVM-dependent instrument payloads without silent loss in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/javascript-instrument.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/python-instrument.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/blue-x7.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/instruments/instrument-registry.ts`
- [x] T019 [US1] Align instrument-generation integration points with Java ordering in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/arrangement.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/global-orc-sco.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`

**Checkpoint**: User Story 1 is independently testable and representative instrument output matches Java-compatible behavior.

---

## Phase 4: User Story 2 - Preserve Mixer and Effect Behavior Across Save and Render (Priority: P1)

**Goal**: Restore Java-compatible mixer XML defaults, channel/effect/send structure, dependency ordering, and generated routing behavior.

**Independent Test**: Load and resave mixer-heavy fixtures, reopen them in Java Blue, and compare generated mixer-related output against TypeScript.

### Tests for User Story 2

- [x] T020 [P] [US2] Add mixer XML default and master-channel round-trip tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/runtime-model-roundtrip.test.ts`
- [x] T021 [P] [US2] Add channel, subchannel, send, and effect dependency fixture tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/mixer-runtime-parity.test.ts`
- [x] T022 [P] [US2] Add extra-render-time and mixer-generated orchestra parity tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/mixer-runtime-parity.test.ts`

### Implementation for User Story 2

- [x] T023 [US2] Restore mixer load/save defaults and master-channel/channel-list compatibility in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/channel-list.ts`
- [x] T024 [US2] Restore channel, subchannel, send, and effect serialization parity in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/channel.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/send.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/effect.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/effects-chain.ts`
- [x] T025 [US2] Restore mixer dependency ordering and effect-manager behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/effect-manager.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer-node.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.ts`
- [x] T026 [US2] Align mixer-generated routing/orchestra text and extra-render-time handling in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/mixer/mixer.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`

**Checkpoint**: User Stories 1 and 2 together provide Java-compatible instrument and mixer generation behavior for representative fixtures.

---

## Phase 5: User Story 3 - Restore Java Time and Automation Model Semantics (Priority: P2)

**Goal**: Restore Java-compatible automation serialization/behavior and exact time-system defaults and conversions.

**Independent Test**: Compare Java and TypeScript behavior for representative automation, tempo-map, SMPTE, BBST, and measure-meter fixtures.

### Tests for User Story 3

- [x] T027 [P] [US3] Add parameter serialization and line-behavior parity tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-helper.test.ts`
- [x] T028 [P] [US3] Add tempo-map default, sort, and reset parity tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-context.test.ts`
- [x] T029 [P] [US3] Add BBST, SMPTE, and measure-meter conversion fixture tests in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-state.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-data/tests/integration/runtime-model-roundtrip.test.ts`

### Implementation for User Story 3

- [x] T030 [US3] Restore Java-compatible parameter and line-model serialization/behavior in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-helper.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-list.ts`
- [x] T031 [US3] Restore parameter runtime, name, id, and time-manager semantics in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-runtime.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-name-manager.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-id-list.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/automation/parameter-time-manager.ts`
- [x] T032 [US3] Restore tempo sorting, reset behavior, and SMPTE defaults in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-context.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-state.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/smpte-frame-rate.ts`
- [x] T033 [US3] Align measure-meter and time-unit conversion helpers with Java semantics in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/measure-meter-pair.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/meter-map.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-base.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-position.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-duration.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-unit-math.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-utilities.ts`
- [x] T034 [US3] Wire corrected time and automation semantics through project serialization and render entrypoints in `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/arrangement.ts`, and `/Users/stevenyi/work/blue-electron/packages/blue-data/src/global-orc-sco.ts`

**Checkpoint**: The time-system and automation model behavior is independently testable against Java fixtures.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and handoff updates after implementation.

- [x] T035 [P] Update `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/quickstart.md` with fixture-specific validation notes discovered during implementation
- [x] T036 [P] Update `/Users/stevenyi/work/blue-electron/STATUS.md` with Spec 032 implementation progress, validation results, and remaining deferrals
- [x] T037 Run `./.specify/scripts/bash/check-prerequisites.sh --json --include-tasks --require-tasks` from `/Users/stevenyi/work/blue-electron`
- [x] T038 Run `git diff --check` from `/Users/stevenyi/work/blue-electron`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP for this slice.
- **User Story 2 (Phase 4)**: Depends on Foundational; it can proceed in parallel with US1 after scaffolding is ready, but final integration should be verified after US1 lands because both feed generated orchestra output.
- **User Story 3 (Phase 5)**: Depends on Foundational and should follow US1/US2 for final integration because automation and time semantics affect both serialization and generated output.
- **Polish (Phase 6)**: Depends on selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after Foundational.
- **US2 (P1)**: No hard dependency on US1 after Foundational, but final parity verification should run after US1.
- **US3 (P2)**: Depends on the finalized US1/US2 model behavior for full render and serialization validation.

### Parallel Opportunities

- Setup inventory tasks T002-T004 can run in parallel.
- Foundational tests T005-T007 can run in parallel.
- US1 tests T011-T013 can run in parallel.
- US2 tests T020-T022 can run in parallel.
- US3 tests T027-T029 can run in parallel.
- Polish documentation tasks T035 and T036 can run in parallel.

## Parallel Example: User Story 1

```text
Task: "Add BSB value replacement/default/always-on fixture tests in packages/blue-data/src/instruments/blue-synth-builder.test.ts"
Task: "Add GenericInstrument UDO replacement parity tests in packages/blue-data/src/instruments/generic-instrument.test.ts"
Task: "Add deferred instrument preservation tests in packages/blue-data/src/instruments/javascript-instrument.test.ts, python-instrument.test.ts, and blue-x7.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "Add mixer XML default/master-channel round-trip tests in packages/blue-data/src/mixer/mixer.test.ts"
Task: "Add mixer dependency fixture tests in packages/blue-data/tests/integration/mixer-runtime-parity.test.ts"
Task: "Add mixer extra-render-time parity tests in packages/blue-data/tests/integration/mixer-runtime-parity.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "Add parameter serialization and line-behavior parity tests in packages/blue-data/src/automation/parameter.test.ts"
Task: "Add tempo-map default/sort/reset parity tests in packages/blue-data/src/time/tempo-map.test.ts"
Task: "Add BBST/SMPTE conversion fixture tests in packages/blue-data/src/time/time-state.test.ts"
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational phases.
2. Complete User Story 1 only.
3. Validate BSB/instrument generation and preservation fixtures against Java-compatible expectations.
4. Stop and review before expanding to mixer and time/automation behavior.

### Incremental Delivery

1. Restore BSB and instrument generation/preservation parity.
2. Restore mixer XML and generated-output parity.
3. Restore automation and time-model parity.
4. Re-run `@blue/data` validation and publish updated handoff notes.

### Handoff Notes

- Keep this slice focused on `@blue/data`; renderer and Electron work remain out of scope.
- Use the Java sources listed in `/Users/stevenyi/work/blue-electron/specs/032-blue-data-runtime-model-parity/research.md` as the source of truth when TypeScript behavior differs.
- Begin with failing fixture/tests before modifying model code.
- Keep `.specify/feature.json` aligned to `specs/032-blue-data-runtime-model-parity` while this branch is active so spec-kit scripts resolve the correct feature directory.