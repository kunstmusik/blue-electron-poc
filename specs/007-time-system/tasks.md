# Tasks: Blue Time System

**Input**: Design documents from `/specs/007-time-system/`
**Prerequisites**: plan.md (required), spec.md (required), research.md

**Tests**: Tests are explicitly requested per spec User Story 5, FR-012 through FR-017, SC-007 through SC-009. 205 unit tests across 8 test files matching Java JUnit tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Expand the foundational types that all user stories depend on.

- [x] T001 Expand TimeBase enum to 8 values (BEATS, BBT, BBST, BBF, TIME, SMPTE, SECONDS, FRAME) with `isBeatBased()` helper in `packages/blue-data/src/time/time-base.ts`
- [x] T002 Create CurveType enum (CONSTANT, LINEAR) with `fromString()` fallback in `packages/blue-data/src/time/curve-type.ts`
- [x] T003 Create Meter value object (numBeats, beatLength, getBeatsPerMeasure, XML save/load) in `packages/blue-data/src/time/meter.ts`
- [x] T004 Create MeasureMeterPair class (measure number, meter, XML save/load) in `packages/blue-data/src/time/measure-meter-pair.ts`
- [x] T005 Create MeterMap class with barBeatToBeats/beatsToBBT/beatsToBBST/beatsToBBF, updateMeasureStartBeats, XML serialization in `packages/blue-data/src/time/meter-map.ts`
- [x] T006 Create TempoPoint class (position, tempo, curveType, enabled, visible, cached beat/accumulatedTime, XML save/load) in `packages/blue-data/src/time/tempo-point.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core time type infrastructure that MUST be complete before any user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Rewrite TimePosition with subtype fields (csoundBeats, bar/beat/ticks/sixteenth/fraction, hours/minutes/seconds/ms, totalSeconds, frameNumber), factory methods for all 7 types, toBeats/toSeconds/toFrames dispatching, fixed loadFromXML reading nested child elements, saveAsXML writing nested format, in `packages/blue-data/src/time/time-position.ts`
- [x] T008 Rewrite TimeDuration with subtype fields (same as TimePosition but 0-based bar/beat semantics using meter[0] for DurationBBT/BBST/BBF), factory methods for all 7 types, toBeats/toSeconds/toFrames dispatching, fixed loadFromXML, saveAsXML, in `packages/blue-data/src/time/time-duration.ts`
- [x] T009 Rewrite TempoMap with multi-point support: TempoPoint list, enabled/disabled toggle, CONSTANT/LINEAR curve types, beatsToSeconds (accumulated time across segments), secondsToBeats (quadratic formula for LINEAR), getTempoAt, createTempoMap legacy parser, XML serialization, in `packages/blue-data/src/time/tempo-map.ts`
- [x] T010 Update TimeContext to add MeterMap field (default 4/4), sampleRate field (default 44100), getters/setters, update loadFromXML to deserialize meterMap, update saveAsXML in `packages/blue-data/src/time/time-context.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 & 2 — Start Times Load Correctly + XML Deserialization (Priority: P1) 🎯 MVP

**Goal**: Sound object start times and durations load correctly from all 3 XML formats. The generated CSD has notes at correct positions (not all at time 0).

**Independent Test**: Load `demo2022.blue`, generate CSD, verify PianoRoll notes have start times matching reference CSD.

### Implementation for User Story 1 & 2

- [x] T011 Create SoundObjectUtilities with `initBasicFromXML(sObj, data)` handling 3 XML formats for startTime (nested type attr, legacy startTimePosition tag, plain text), 3 formats for subjectiveDuration, plus name/timeBehavior/backgroundColor/repeatPoint/noteProcessorChain, in `packages/blue-data/src/sound-objects/sound-object-utilities.ts`
- [x] T012 Fix GenericScore.loadFromXML bug (line 107: setSubjectiveDuration→setStartTime) and replace manual loading with initBasicFromXML in `packages/blue-data/src/sound-objects/generic-score.ts`
- [ ] T013 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/piano-roll.ts`
- [ ] T014 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/audio-file.ts`
- [ ] T015 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/sound.ts`
- [ ] T016 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/comment.ts`
- [ ] T017 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/instance.ts`
- [ ] T018 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/external.ts`
- [ ] T019 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/line-object.ts`
- [ ] T020 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/zak-line-object.ts`
- [ ] T021 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/j-mask.ts`
- [ ] T022 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/tracker-object.ts`
- [ ] T023 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/notation-object.ts`
- [ ] T024 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/pattern-object.ts`
- [ ] T025 [P] Replace manual startTime/subjectiveDuration loading with initBasicFromXML in `packages/blue-data/src/sound-objects/frozen-sound-object.ts`
- [ ] T026 Fix JavaScriptObject.loadFromXML (missing startTime loading) with initBasicFromXML in `packages/blue-data/src/sound-objects/javascript-object.ts`
- [ ] T027 Fix PythonObject.loadFromXML (missing startTime loading) with initBasicFromXML in `packages/blue-data/src/sound-objects/python-object.ts`
- [ ] T028 Fix CSDSoundObject.loadFromXML (missing startTime loading) with initBasicFromXML in `packages/blue-data/src/sound-objects/csd-sound-object.ts`

**Checkpoint**: All sound objects load startTime/subjectiveDuration correctly from nested XML format. Load `demo2022.blue` and verify PianoRoll startTime values.

---

## Phase 4: User Story 3 — PolyObject Offsets Notes (Priority: P1)

**Goal**: PolyObject offsets all generated notes by its own startTime so notes are positioned correctly in the timeline.

**Independent Test**: Load `demo2022.blue`, check that PolyObject's generateForCSD produces notes with absolute start times.

### Implementation for User Story 3

- [x] T029 Add setScoreStart offset after merging child notes in PolyObject.generateForCSD in `packages/blue-data/src/sound-objects/poly-object.ts`
- [x] T030 Add generateForCSD to SoundLayer (sort by start time, compute adjusted start/end per sound object, setScoreStart per object) in `packages/blue-data/src/sound-objects/sound-layer.ts`
- [x] T031 Update PolyObject.generateForCSD to delegate to SoundLayer.generateForCSD instead of inline iteration in `packages/blue-data/src/sound-objects/poly-object.ts`

**Checkpoint**: Load `demo2022.blue`, generate CSD, run `test-csd.js` — note start times should match reference CSD.

---

## Phase 5: User Story 4 — TempoMap Converts Beats to Seconds (Priority: P2)

**Goal**: TempoMap with multi-point support enables correct tempo changes in CSD score.

**Independent Test**: Set tempo to 120 BPM, verify beat 8 = 4 seconds. Multi-point map with LINEAR interpolation.

### Implementation for User Story 4

- [ ] T032 Verify TempoMap beatsToSeconds/secondsToBeats produce correct results for CONSTANT and LINEAR curves (implemented in T009) by testing with `demo2022.blue` tempo (95.333 BPM) in `packages/blue-data/src/time/tempo-map.ts`
- [ ] T033 Verify BlueData.toCSD generates correct tempo statement from TempoMap for multi-point maps in `packages/blue-data/src/blue-data.ts`

**Checkpoint**: TempoMap with 95.333 BPM produces correct timing. CSD `t 0 95.333` statement generated.

---

## Phase 6: User Story 5 — Unit Tests Match Java JUnit Tests (Priority: P1)

**Goal**: 205 unit tests across 8 test files matching Java JUnit tests. All tests pass.

**Independent Test**: `pnpm test` in `packages/blue-data` passes all time-related tests.

### Tests for User Story 5

- [x] T034 [P] [US5] Create test helpers (makeDefaultContext, makeContext, assertRoundTrip) in `packages/blue-data/tests/time/helpers.ts`
- [x] T035 [P] [US5] Write time-base tests (3 tests: isBeatBased, non-beat-based, UI ordering) in `packages/blue-data/tests/time/time-base.test.ts`
- [x] T036 [P] [US5] Write meter-map tests (14 tests: listenerNotifications, updateMeasureStartBeats, barBeatToBeats, beatsToBBT, roundTrip, edge cases) in `packages/blue-data/tests/time/meter-map.test.ts`
- [x] T037 [P] [US5] Write tempo-map tests (26 tests: construction, enabled/disabled, LINEAR, CONSTANT, createTempoMap, XML, listeners, BBST positions, edge cases) in `packages/blue-data/tests/time/tempo-map.test.ts`
- [x] T038 [US5] Write time-position tests (30 tests: BeatTime, BBSTTime, BBTTime, BBFTime, TimeValue, SecondsValue, FrameValue — conversions, immutability, equality, invalid args, XML round-trip) in `packages/blue-data/tests/time/time-position.test.ts`
- [x] T039 [US5] Write time-duration tests (57 tests: DurationBeats through DurationFrames, XML round-trips, position vs duration BBT, non-4/4 meters, fromSeconds factory) in `packages/blue-data/tests/time/time-duration.test.ts`
- [x] T040 [US5] Write time-context tests (22 tests: MeterMap/TempoMap equality, hasSameMusicalContext, serialization round-trips, legacy XML, sampleRate snapshot) in `packages/blue-data/tests/time/time-context.test.ts`
- [x] T041 [US5] Write time-utilities tests (23 tests: timePositionToBeats, beatsToTimePosition, convertTimePosition, round-trips, helpers, meter changes) in `packages/blue-data/tests/time/time-utilities.test.ts`

### Implementation for User Story 5

- [x] T042 Create TimeUnitMath with add, subtract, distance, convertDuration, beatsToDuration, fromTimePosition in `packages/blue-data/src/time/time-unit-math.ts`
- [x] T043 Rewrite TimeUtilities with full conversion functions (timePositionToBeats, beatsToTimePosition, convertTimePosition, seconds/frames helpers) in `packages/blue-data/src/time/time-utilities.ts`
- [x] T044 [US5] Write time-unit-math tests (30 tests: position+dur, position-position, dur+dur, dur-dur, position-dur, convertDuration, beatsToDuration, fromTimePosition, non-4/4 meter) in `packages/blue-data/tests/time/time-unit-math.test.ts`

**Checkpoint**: All 205 tests pass with `pnpm test`. Each Java JUnit test has a matching TypeScript test.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [x] T045 Run `pnpm build` in `packages/blue-data` — no TypeScript errors
- [x] T046 Run `pnpm test` — all new + existing tests pass (no regressions)
- [ ] T047 Run `test-csd.js` — generated CSD note start times match reference
- [ ] T048 Run `pnpm dev` — play `demo2022.blue` in app, verify notes play over time

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories 1&2 (Phase 3)**: Depends on Phase 2 (TimePosition/TimeDuration rewrite)
- **User Story 3 (Phase 4)**: Depends on Phase 3 (sound objects must load times correctly first)
- **User Story 4 (Phase 5)**: Depends on Phase 2 (TempoMap rewrite)
- **User Story 5 (Phase 6)**: Depends on Phases 1-2 (needs all types implemented). Tests for time-position/time-duration depend on MeterMap/TempoMap.
- **Polish (Phase 7)**: Depends on all phases complete

### Parallel Opportunities

Phase 3 tasks T013-T025 are all `[P]` — different sound object files, no dependencies. Can all run in parallel.
Phase 6 tests T035-T037 can run in parallel (test MeterMap, TempoMap, TimeBase independently).
Phase 5 (User Story 4) can run in parallel with Phase 4 (User Story 3) — different files.

### Implementation Strategy

**MVP First**: Complete Phases 1-4 → the core bug is fixed, notes play at correct times. This unblocks app testing.
**Then Tests**: Phase 6 adds the 205 unit tests matching Java JUnit tests.
**Then Polish**: Phase 7 verifies end-to-end.

---

## Notes

- [P] tasks = different files, no dependencies
- [US#] label maps task to specific user story for traceability
- Verify `pnpm build` passes after each phase
- Commit after each completed task or logical group
- All imports must be static ES imports (no `require()`, no dynamic `import()`)
