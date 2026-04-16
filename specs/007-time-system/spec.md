# Feature Specification: Blue Time System

**Feature Branch**: `007-time-system`
**Created**: 2026-04-14
**Status**: Draft
**Input**: The TypeScript blue-data time system is a shallow stub that does not handle the XML serialization format used by Java Blue. Sound object start times and durations load as 0, causing all notes to play simultaneously from time 0. The Java `SoundObjectUtilities.initBasicFromXML` correctly deserializes `<startTime type="BEATS"><csoundBeats>8.0</csoundBeats></startTime>` but the TypeScript code reads only the direct text of `<startTime>` (which is empty).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Sound Object Start Times Load Correctly (Priority: P1)

When the user opens a `.blue` project with sound objects positioned at different start times, the generated CSD plays them at the correct times — not all at once from time 0.

**Why this priority**: Without correct start times, all notes collapse to time 0 and the music is unrecognizable. This is a blocking correctness issue.

**Independent Test**: Load `demo2022.blue`, generate CSD, and verify that the PianoRoll "Synth : B" starting at beat 8 produces notes with p2 values in the 8.0+ range.

**Acceptance Scenarios**:

1. **Given** a sound object with `<startTime type='BEATS'><csoundBeats>8.0</csoundBeats></startTime>`, **When** loaded from XML, **Then** `getStartTime().toBeats(context)` returns `8.0`
2. **Given** a sound object with `<subjectiveDuration type='BEATS'><csoundBeats>8.0</csoundBeats></subjectiveDuration>`, **When** loaded from XML, **Then** `getSubjectiveDuration().toBeats(context)` returns `8.0`
3. **Given** `demo2022.blue` with PianoRoll objects at beats 0, 8, 16, 24, etc., **When** CSD is generated, **Then** the score section contains notes with start times matching the reference CSD
4. **Given** the generated CSD, **When** played in the blue-electron app, **Then** notes play at their correct times over the full duration of the piece

---

### User Story 2 — TimePosition/TimeDuration Deserialize from All XML Formats (Priority: P1)

When the loader encounters a `<startTime>` or `<subjectiveDuration>` element, it correctly parses the nested `<csoundBeats>` child element format, the legacy `type` attribute format, and falls back to plain double values.

**Why this priority**: The XML format uses `<startTime type='BEATS'><csoundBeats>N</csoundBeats></startTime>`. The current `getTextString('startTime')` returns empty string because the value is in a child element.

**Independent Test**: Unit test loading `<startTime type='BEATS'><csoundBeats>8.0</csoundBeats></startTime>` and verifying the result is `TimePosition.beats(8.0)`.

**Acceptance Scenarios**:

1. **Given** `<startTime type='BEATS'><csoundBeats>8.0</csoundBeats></startTime>`, **When** loaded, **Then** `TimePosition.loadFromXML` returns `BeatTime` with value `8.0`
2. **Given** `<subjectiveDuration type='BEATS'><csoundBeats>4.0</csoundBeats></subjectiveDuration>`, **When** loaded, **Then** `TimeDuration.loadFromXML` returns duration with value `4.0`
3. **Given** legacy `<startTime type='BEATS'>8.0</startTime>` (text directly in element), **When** loaded, **Then** it falls back to `TimePosition.beats(8.0)`

---

### User Story 3 — PolyObject Offsets Notes by Its Start Time (Priority: P1)

When a PolyObject generates notes from its child sound objects, it adds its own `startTime` offset to all generated notes so they are positioned correctly in the timeline.

**Why this priority**: The Java `PolyObject.processNotes` calls `ScoreUtilities.setScoreStart(nl, startTime)` to shift all notes by the PolyObject's start time. The TypeScript version skips this entirely.

**Independent Test**: Load `demo2022.blue`, check that the second PolyObject (LayerGroup 1, starting at beat 0 but containing PianoRolls at beats 0,8,16,...) generates notes with correct absolute start times.

**Acceptance Scenarios**:

1. **Given** a PolyObject with `startTime = 0` containing a PianoRoll at `startTime = 8`, **When** `generateForCSD` is called, **Then** the PianoRoll's notes are offset by 8 beats
2. **Given** a PolyObject with `startTime = 4` containing a GenericScore at `startTime = 0`, **When** `generateForCSD` is called, **Then** the notes are offset by 4 beats (the PolyObject's start time)
3. **Given** the reference CSD for `demo2022.blue`, **When** the generated CSD's score events are compared, **Then** note start times match the reference within the set of implemented sound object types

---

### User Story 4 — TempoMap Converts Beats to Seconds for CSD Score (Priority: P2)

When the TempoMap defines a non-60 BPM tempo, beat-based start times in the score are correctly interpreted so Csound plays at the right speed.

**Why this priority**: Tempo conversion affects playback speed but not note ordering. Once start times are correct, tempo ensures correct wall-clock timing.

**Independent Test**: Set tempo to 120 BPM, verify that beat 8 corresponds to 4 seconds.

**Acceptance Scenarios**:

1. **Given** a TempoMap with tempo `95.333` BPM, **When** `beatsToSeconds(8)` is called, **Then** the result is approximately `5.034` seconds
2. **Given** the tempo statement `t 0 95.333` in the CSD score, **When** Csound processes the CSD, **Then** beat-based p2 values are correctly scaled to wall-clock time

---

### User Story 5 — Unit Tests Match Java JUnit Tests (Priority: P1)

The TypeScript time system has comprehensive unit tests that mirror the Java JUnit tests, ensuring behavioral parity across all time types, conversions, serialization, and math operations.

**Why this priority**: The time system is foundational — every note's timing depends on it. Matching the Java test suite ensures no subtle conversion bugs.

**Independent Test**: Run `pnpm test` in `packages/blue-data` and verify all time-related tests pass.

**Test Suite Structure** (files in `packages/blue-data/tests/`):

#### 5A. `time/time-position.test.ts` — mirrors `TimePositionTest.java` (30 tests)

**BeatTime** (6 tests):
- `testBeatTimeGetTimeBase` — returns `TimeBase.BEATS`
- `testBeatTimeImmutability` — value (5.5) stored correctly
- `testBeatTimeCopyConstructor` — copy preserves value (7.5)
- `testBeatTimeConversions` — BeatTime(4.0): 4 beats, 4 seconds @60BPM, 176400 frames @44100Hz
- `testBeatTimeComparison` — lt/gt/lte/gte between 4.0 and 6.0
- `testBeatTimeEqualsAndHashCode` — equal values produce equal objects + hashCodes

**BBSTTime** (7 tests):
- `testBBSTTimeGetTimeBase` — returns `TimeBase.BBST`
- `testBBSTTimeImmutability` — all fields (bar, beat, sixteenth, ticks) preserved
- `testBBSTTimeCopyConstructor` — copy preserves all four fields
- `testBBSTTimeConversions` — (1,1,1,0)=0 beats; (2,1,1,0)=4 beats; (1,3,1,0)=2 beats=2s @60BPM
- `testBBSTTimeInvalidBar` — bar 0 throws
- `testBBSTTimeInvalidBeat` — beat 0 throws
- `testBBSTTimeInvalidSixteenth` — sixteenth 5 throws (1-4 valid)

**BBTTime** (3 tests):
- `testBBTTimeGetTimeBase` — returns `TimeBase.BBT`
- `testBBTTimeConversions` — (1,1,0)=0 beats; (1,1,480)=0.5 beats @PPQ=960
- `testBBTToBBSTConversion` — BBT(1,2,480) converts to BBST(1,2,3,0)

**BBFTime** (3 tests):
- `testBBFTimeGetTimeBase` — returns `TimeBase.BBF`
- `testBBFTimeConversions` — (1,1,0)=0 beats; (1,1,50)=0.5 beats
- `testBBFTimeInvalidFraction` — fraction 100 throws (0-99 valid)

**TimeValue** (8 tests):
- `testTimeValueGetTimeBase` — returns `TimeBase.TIME`
- `testTimeValueImmutability` — all fields (h,m,s,ms) preserved
- `testTimeValueToTotalSeconds` — 1:30:45.500 = 5445.5s; 0:01:00 = 60.0s
- `testTimeValueConversions` — 2s @60BPM = 2 beats; 2s * 44100 = 88200 frames
- `testTimeValueInvalidHours` — hours -1 throws
- `testTimeValueInvalidMinutes` — minutes 60 throws
- `testTimeValueInvalidSeconds` — seconds 60 throws
- `testTimeValueInvalidMilliseconds` — ms 1000 throws

**SecondsValue** (5 tests):
- `testSecondsValueGetTimeBase` — returns `TimeBase.SECONDS`
- `testSecondsValueConversions` — 2.5s = 2.5 beats @60BPM; 2.5s * 44100 = 110250 frames
- `testSecondsValueNegativeRejected` — negative throws
- `testSecondsValueNonFiniteRejected` — NaN/Infinity throws
- `testSecondsValueXMLRoundTrip` — save/load preserves value and type

**FrameValue** (6 tests):
- `testFrameValueGetTimeBase` — returns `TimeBase.FRAME`
- `testFrameValueImmutability` — 88200 preserved
- `testFrameValueToTotalSeconds` — 44100 frames @44100Hz = 1.0s; 88200 = 2.0s
- `testFrameValueConversions` — 88200 frames = 2.0s = 2.0 beats @60BPM
- `testFrameValueInvalidFrameNumber` — negative throws
- `testFrameValueToTotalSecondsInvalidSampleRate` — sampleRate 0 throws

#### 5B. `time/time-duration.test.ts` — mirrors `TimeDurationTest.java` (57 tests)

**DurationBeats** (5 tests):
- `testDurationBeatsGetTimeBase` — returns `TimeBase.BEATS`
- `testDurationBeatsZero` — ZERO has 0.0 csound beats
- `testDurationBeatsConversions` — 4 beats = 4s @60BPM = 176400 frames
- `testDurationBeatsEquality` — equal values equal with same hashCode
- `testDurationBeatsNegative` — negative throws

**DurationBBT** (10 tests):
- `testDurationBBTGetTimeBase` — returns `TimeBase.BBT`
- `testDurationBBTZero` — all zero fields, converts to 0 beats
- `testDurationBBTOneMeasureIn44` — 1 bar in 4/4 = 4 beats
- `testDurationBBTOneBarTwoBeatsIn44` — 1 bar + 2 beats in 4/4 = 6 beats
- `testDurationBBTWithTicks` — 480 ticks @PPQ 960 = 0.5 beats
- `testDurationBBTSecondsAndFrames` — 1 bar in 4/4 = 4s @60BPM = 176400 frames
- `testDurationBBTEquality` — equal BBT durations equal
- `testDurationBBTNegativeBars` — negative bars throws
- `testDurationBBTNegativeBeats` — negative beats throws
- `testDurationBBTNegativeTicks` — negative ticks throws

**DurationBBST** (8 tests):
- `testDurationBBSTGetTimeBase` — returns `TimeBase.BBST`
- `testDurationBBSTZero` — all zero fields, converts to 0 beats
- `testDurationBBSTOneMeasureIn44` — 1 bar in 4/4 = 4 beats
- `testDurationBBSTWithSixteenth` — 2 sixteenths = 0.5 beats
- `testDurationBBSTTotalTicks` — 2 sixteenths + 60 ticks @PPQ 960 = 540 total ticks
- `testDurationBBSTEquality` — equal BBST durations equal
- `testDurationBBSTNegativeBars` — negative bars throws
- `testDurationBBSTInvalidSixteenth` — sixteenth 4 throws (0-3 valid)

**DurationBBF** (8 tests):
- `testDurationBBFGetTimeBase` — returns `TimeBase.BBF`
- `testDurationBBFZero` — all zero fields, converts to 0 beats
- `testDurationBBFOneMeasureIn44` — 1 bar in 4/4 = 4 beats
- `testDurationBBFWithFraction` — fraction 50 = 0.5 beats
- `testDurationBBFOneBarTwoBeats` — 1 bar + 2 beats in 4/4 = 6 beats
- `testDurationBBFEquality` — equal BBF durations equal
- `testDurationBBFNegativeBars` — negative bars throws
- `testDurationBBFInvalidFraction` — fraction 100 throws

**DurationTime** (9 tests):
- `testDurationTimeGetTimeBase` — returns `TimeBase.TIME`
- `testDurationTimeZero` — ZERO = 0 total seconds
- `testDurationTimeConversions` — 2s = 2 beats @60BPM = 88200 frames
- `testDurationTimeTotalSeconds` — 1:30:45.500 = 5445.5 total seconds
- `testDurationTimeEquality` — equal values equal; 1ms difference not equal
- `testDurationTimeNegativeHours` — hours -1 throws
- `testDurationTimeInvalidMinutes` — minutes 60 throws
- `testDurationTimeInvalidSeconds` — seconds 60 throws
- `testDurationTimeInvalidMilliseconds` — ms 1000 throws

**DurationSeconds** (4 tests):
- `testDurationSecondsGetTimeBase` — returns `TimeBase.SECONDS`
- `testDurationSecondsConversions` — 2.5s = 2.5 beats @60BPM = 110250 frames
- `testDurationSecondsNegativeRejected` — negative throws
- `testDurationSecondsNonFiniteRejected` — NaN/Infinity throws

**DurationFrames** (6 tests):
- `testDurationFramesGetTimeBase` — returns `TimeBase.FRAME`
- `testDurationFramesConversions` — 88200 frames = 2.0s = 2.0 beats @60BPM
- `testDurationFramesTotalSeconds` — 44100 frames @44100Hz = 1.0s
- `testDurationFramesEquality` — equal frame counts equal
- `testDurationFramesNegative` — negative throws
- `testDurationFramesInvalidSampleRate` — sampleRate 0 throws

**XML Round-Trip** (9 tests):
- `testDurationBeatsXMLRoundTrip` — 4.5 survives save/load
- `testDurationBBTXMLRoundTrip` — (2,3,120) survives save/load
- `testDurationBBSTXMLRoundTrip` — (1,2,3,60) survives save/load
- `testDurationBBFXMLRoundTrip` — (3,2,75) survives save/load
- `testDurationTimeXMLRoundTrip` — 1:30:45.500 survives save/load
- `testDurationSecondsXMLRoundTrip` — 12.345678 survives save/load with correct type
- `testDurationFramesXMLRoundTrip` — 88200 survives save/load
- `testLoadFromXMLMissingType` — missing "type" attribute throws
- `testLoadFromXMLUnknownType` — unknown type value throws

**Position vs Duration BBT** (2 tests):
- `testDurationBBTVsPositionBBT` — Position BBT(1,1,0)=0 beats (1-based); Duration BBT(0,0,0)=0 beats (0-based); Duration BBT(1,0,0)=4 beats = Position BBT(2,1,0)
- `testDurationBBFVsPositionBBF` — same 0-based vs 1-based distinction for BBF

**Non-4/4 Meter** (2 tests):
- `testDurationBBTIn34` — in 3/4: 1 bar = 3 beats, 2 bars = 6 beats, 1 bar + 2 beats = 5 beats
- `testDurationBBFIn68` — in 6/8: 1 bar = 3 beats (6 * 4/8); 1 eighth = 0.5 quarter-note beats

**fromSeconds factory** (6 tests):
- `testFromSecondsZero` — fromSeconds(0) produces DurationTime with all zeros
- `testFromSecondsSimple` — fromSeconds(3.5) = 0h 0m 3s 500ms
- `testFromSecondsMinutes` — fromSeconds(90.25) = 0h 1m 30s 250ms
- `testFromSecondsHours` — fromSeconds(3661.123) = 1h 1m 1s 123ms
- `testFromSecondsNegativeClampsToZero` — fromSeconds(-5) clamps to 0
- `testFromSecondsToBeatsAt60BPM` — 5s @60BPM = 5.0 beats

#### 5C. `time/tempo-map.test.ts` — mirrors `TempoMapTest.java` (26 tests)

**Basic Construction** (2 tests):
- `testDefaultConstruction` — 1 point at beat 0 with 60 BPM, CONSTANT curve, disabled, not visible
- `testCopyConstruction` — copy preserves size, enabled, visible, and curve types

**Enabled/Disabled** (2 tests):
- `testDisabledUsesConstantTempo` — disabled: always 60 BPM regardless of points (4 beats = 4s)
- `testEnabledUsesTempoMap` — enabled at 120 BPM: 1 beat = 0.5s, 4 beats = 2s

**LINEAR** (3 tests):
- `testLinearInterpolation` — midpoint (beat 2) between 60 and 120 = 90 BPM
- `testLinearBeatsToSeconds` — 4 beats with 60-120 ramp < 4s (faster than constant 60)
- `testLinearSecondsToBeats` — round-trip: beats -> seconds -> beats returns original

**CONSTANT** (3 tests):
- `testConstantCurve` — tempo stays 60 until beat 4, then jumps to 120; getTempoAt(3.99) = 60
- `testConstantBeatsToSeconds` — first 4 beats @60BPM = 4s; next 4 @120BPM = 2s (total 6s)
- `testConstantSecondsToBeats` — 2s = beat 2 (60BPM); 5s = beat 6 (4@60 + 2@120)

**createTempoMap Legacy** (5 tests):
- `testCreateTempoMapSimple` — "0 60" creates 1-point map, enabled
- `testCreateTempoMapMultiplePoints` — "0 60 4 120 8 90" creates 3-point map
- `testCreateTempoMapInvalidOddTokens` — "0 60 4" returns null
- `testCreateTempoMapInvalidNegativeBeat` — "-1 60" returns null
- `testCreateTempoMapInvalidZeroTempo` — "0 0" returns null

**XML Serialization** (2 tests):
- `testSaveAndLoadXML` — round-trip preserves size, enabled, visible, tempos, curve types
- `testLoadLegacyXML` — legacy `<beatTempoPair>` format loads with LINEAR default curve

**Listeners** (2 tests):
- `testTempoMapListener` — add/set/remove each fire listener once (total 3)
- `testPropertyChangeListener` — setEnabled fires "enabled" then "data"; setVisible only fires "visible"

**BBST Position** (5 tests):
- `testTempoPointWithBBSTTime` — TempoPoint with BBST position stores correctly
- `testRecalculateBeatPositions` — BBST bar 2 beat 1 recalculates to beat 4 in 4/4
- `testSetTempoPointWithBarBasedPositionUsesContext` — BBT(2,1,0) resolves to beat 4
- `testSetTempoPointWithContextPreservesBarBasedPositionType` — BBT position retained
- `testCopiedMapEditCanRetainBarBasedPosition` — copied map can edit while keeping BBT type

**Edge Cases** (2 tests):
- `testBeyondLastPoint` — beyond last point, tempo stays constant (120BPM at beat 100 = 50s)
- `testCannotRemoveLastPoint` — removing the only point throws

#### 5D. `time/meter-map.test.ts` — mirrors `MeterMapTest.java` (14 tests)

- `testListenerNotifications` — add() and set() each fire listener (count = 2)
- `testUpdateMeasureStartBeats` — default 4/4 (8 measures) + 7/8 at measure 9 + 3/4 at measure 17: start beats = [0.0, 32.0, 60.0]
- `testBarBeatToBeats` — 4/4 with 3/4 at measure 9: (1,1)=0, (2,1)=4, (2,3)=6, (9,1)=32, (10,1)=35
- `testBeatsToBBT` — in 4/4: beat 0 = 1.1.0, beat 4 = 2.1.0, beat 6.5 = 2.3.480ticks (PPQ=960)
- `testBeatsToBBTWithMeterChanges` — with 3/4 at measure 9: beat 32 = 9.1.0, beat 35 = 10.1.0, beat 36.5 = 10.2.480
- `testRoundTripConversion` — BBT -> beats -> BBT round-trips for (1,1), (5,3), (10,2) across meter changes
- `testBarBeatToBeatsEmptyMeterMap` — empty MeterMap throws
- `testBarBeatToBeatsBarBeforeFirstEntry` — bar 0 throws
- `testBarBeatToBeatsBeatExceedsMeter` — beat 5 in 4/4 throws
- `testBeatsToBBTEmptyMeterMap` — empty MeterMap throws
- `testBeatsToBBTNegativeBeats` — negative beats throws
- `testReplaceAllCopiesEntries` — replaceAll merges source entries
- `testReplaceAllFiresListener` — replaceAll fires listener once
- `testReplaceAllPreservesListeners` — two replaceAll calls both fire listener (count = 2)

#### 5E. `time/time-base.test.ts` — mirrors `TimeBaseTest.java` (3 tests)

- `testBeatBasedTimeBases` — BEATS, BBT, BBST, BBF return true for `isBeatBased()`
- `testNonBeatBasedTimeBases` — TIME, SECONDS, SMPTE, FRAME return false
- `testUiOrderingForClockBasedTimeBases` — TIME < SMPTE < SECONDS in enum ordering

#### 5F. `time/time-context.test.ts` — mirrors `TimeContextEqualityTest.java` + `TimeContextSerializationTest.java` (22 tests)

**Equality** (13 tests from TimeContextEqualityTest):
- `shouldConsiderDefaultMeterMapsEqual` — two defaults equal + same hashCode
- `shouldConsiderMeterMapsWithSameEntriesEqual` — same entries = equal
- `shouldConsiderMeterMapsWithDifferentEntriesNotEqual` — empty vs non-empty not equal
- `shouldConsiderDefaultTempoMapsEqual` — two defaults equal + same hashCode
- `shouldConsiderTempoMapsWithDifferentEnabledNotEqual` — enabled diff detected
- `shouldConsiderTempoMapsWithDifferentPointsNotEqual` — different points detected
- `shouldConsiderCopiedTempoMapEqual` — copy-constructed equal + same hashCode
- `shouldDetectSameMusicalContext` — two defaults same context
- `shouldDetectSameMusicalContextForCopy` — copy has same context even with non-default tempo/meter
- `shouldDetectDifferentMusicalContextWhenTempoMapDiffers` — different enabled states
- `shouldDetectDifferentMusicalContextWhenMeterMapDiffers` — different meter entries
- `shouldReturnFalseForNullContext` — null returns false
- `shouldReturnTrueForSelf` — self-comparison returns true
- `shouldCopySampleRateAsDetachedSnapshot` — copy captures sampleRate; source mutation doesn't affect copy

**Serialization** (9 tests from TimeContextSerializationTest):
- `testMeterSerialization` — meter save/load preserves numBeats and beatLength
- `testMeasureMeterPairSerialization` — MeasureMeterPair save/load round-trips
- `testMeterMapSerialization` — MeterMap with 3 entries (4/4, 3/4, 6/8) round-trips
- `testTempoMapSerialization` — TempoMap "0 60 4 120 8 90" round-trips; beatsToSeconds/secondsToBeats match at multiple points
- `testTimeContextSerialization` — full context with custom meter, tempo, 48000Hz round-trips; sampleRate NOT stored in XML
- `testLegacyXmlWithSampleRateIsIgnored` — legacy `<sampleRate>` element silently ignored; defaults to 44100
- `testTimeContextDefaultSerialization` — default context round-trips
- `testTimeContextSerializationRehydratesBarBasedTempoPoints` — BBT-based TempoPoints preserved; beat position recalculates (3/4: BBT(3,1,0) = beat 6)
- `testMeterMapChangesRecalculateTempoBeatPositions` — 4/4 to 3/4 causes BBT-based point to recalculate from beat 8 to beat 6

#### 5G. `time/time-utilities.test.ts` — mirrors `TimeUtilitiesTest.java` (23 tests)

**timePositionToBeats** (7 tests):
- `testTimeUnitToBeatsWithBeatTime` — BeatTime(10.5) = 10.5 beats
- `testTimeUnitToBeatsWithBBSTTime` — BBST(2,3,1,0) in 4/4 = 6.0 beats
- `testTimeUnitToBeatsWithTimeValue` — TimeValue(0:00:10.000) @60BPM = 10.0 beats
- `testTimeUnitToBeatsWithSecondsValue` — Seconds(3.25) = 3.25 beats @60BPM
- `testTimeUnitToBeatsWithFrameValue` — 44100 frames @44100Hz / 60BPM = 1.0 beat
- `testTimeUnitToBeatsNullTimePosition` — null throws
- `testTimeUnitToBeatsNullContext` — null context throws

**beatsToTimePosition** (5 tests):
- `testBeatsToTimeUnitBeatTime` — 10.5 beats -> BeatTime(10.5)
- `testBeatsToTimeUnitBBSTTime` — 6.0 beats in 4/4 -> BBST(2,3)
- `testBeatsToTimeUnitTimeValue` — 10 beats @60BPM -> TimeValue(0:00:10.000)
- `testBeatsToTimeUnitSecondsValue` — 10 beats -> SecondsValue(10.0)
- `testBeatsToTimeUnitFrameValue` — 1 beat @60BPM / 44100Hz -> FrameValue(44100)

**convertTimePosition** (5 tests):
- `testConvertTimeUnitSameTimeBase` — BeatTime to BEATS returns same object
- `testConvertTimeUnitBeatTimeToBBST` — 8 beats in 4/4 -> BBST(3,1)
- `testConvertTimeUnitBBSTToTime` — BBST(3,2,1,0) = 9 beats @60BPM = 9s
- `testConvertTimeUnitSecondsToTime` — 9.5s -> TimeValue with 9.5 total seconds
- `testConvertTimeUnitTimeToSeconds` — TimeValue(0:00:09.500) -> SecondsValue(9.5)

**Round-trip** (3 tests):
- `testRoundTripBeatTimeToBBST` — BeatTime(12) -> BBST -> BeatTime = 12.0
- `testRoundTripBBSTToTime` — BBST(5,3,1,0) -> TimeValue -> BBST = same bar/beat
- `testRoundTripTimeToFrames` — TimeValue(0:01:30) -> Frames -> TimeValue (within 0.1s tolerance)

**Helpers** (7 tests):
- `testSecondsToTimePosition` — 10s @60BPM = 10 beats as BeatTime
- `testTimeUnitToSeconds` — 5 beats @60BPM = 5.0s
- `testFramesToTimePosition` — 88200 frames @44100Hz / 60BPM = 2 beats
- `testTimeUnitToFrames` — 2 beats @60BPM / 44100Hz = 88200 frames
- `testFramesToTimePositionNormalizesMillisecondCarry` — 44099 frames @44100Hz rounds to 1.0s
- `testDefaultContextSampleRateIs44100` — no ProjectProperties defaults to 44100
- `testDefaultContextSampleRateUsedForFrameConversion` — frame conversion uses default 44100

**Meter change** (1 test):
- `testConversionWithMeterChanges` — BBST(6,2,1,0) in 3/4 starting at measure 5 round-trips

#### 5H. `time/time-unit-math.test.ts` — mirrors `TimeUnitMathTest.java` (30 tests)

**Position + Duration** (7 tests):
- `testAddDurationToPosition_Beats` — Beat(4) + Duration(2) = Beat(6)
- `testAddDurationToPosition_BBF` — BBF(1,1,0) + Duration(4 beats) = BBF(2,1,0) (preserves BBF)
- `testFromTimePosition_WithTargetSecondsTimeBase` — TimeValue(0:00:04.500) -> DurationSeconds(4.5)
- `testAddDurationToPosition_BBT` — BBT(1,1,0) + Duration(2.5 beats) = BBT(2.5 beats)
- `testAddDurationToPosition_ZeroDuration` — Beat(10) + Duration(0) = Beat(10)
- `testAddDurationToPosition_SecondsPreservesTimeBase` — Seconds(2) + Duration(1.5 beats) = Seconds(3.5)
- `testAddDurationBBTToPositionBBF` — BBF(2,1,0) + DurationBBT(1,2,0) = BBF(10 beats)

**Position - Position** (6 tests):
- `testDistance_Basic` — Beat(6) - Beat(2) = Duration(4)
- `testDistance_Reversed` — Beat(2) - Beat(6) = Duration(4) (absolute)
- `testDistance_SamePosition` — Beat(5) - Beat(5) = Duration(0)
- `testDistance_MixedTypes` — Beat(4) - BBF(1,1,0) = Duration(4)
- `testForwardDistance_Normal` — Beat(6) - Beat(2) forward = Duration(4)
- `testForwardDistance_Reversed_ClampedToZero` — Beat(2) - Beat(6) forward = Duration(0)

**Duration + Duration** (3 tests):
- `testAddDurations` — Duration(3) + Duration(2) = Duration(5)
- `testAddDurations_MixedTypes` — Duration(4) + DurationBBT(0,2,0) = Duration(6)
- `testAddDurations_Zero` — Duration(4) + Duration(0) = Duration(4)

**Duration - Duration** (2 tests):
- `testSubtractDurations` — Duration(5) - Duration(2) = Duration(3)
- `testSubtractDurations_ClampedToZero` — Duration(2) - Duration(5) = Duration(0)

**Position - Duration** (3 tests):
- `testSubtractDurationFromPosition` — Beat(6) - Duration(2) = Beat(4)
- `testSubtractDurationFromPosition_ClampedToZero` — Beat(2) - Duration(5) = Beat(0)
- `testSubtractDurationFromPosition_PreservesTimeBase` — BBF(3,1,0) - Duration(4) = BBF(4 beats)

**convertDuration** (7 tests):
- `testConvertDuration_BeatsToBBF` — 4 beats -> DurationBBF(1,0,0)
- `testConvertDuration_BeatsToBBT` — 6 beats -> DurationBBT(1,2,0)
- `testConvertDuration_BeatsToBBST` — 4.5 beats -> DurationBBST(1,0,2,0)
- `testConvertDuration_BeatsToTime` — 2 beats @60BPM -> DurationTime(0:00:02.000)
- `testConvertDuration_BeatsToSeconds` — 2.5 beats -> DurationSeconds(2.5)
- `testConvertDuration_BeatsToFrames` — 1 beat @60BPM/44100Hz -> DurationFrames(44100)
- `testConvertDuration_SameTimeBase_ReturnsSame` — beats to BEATS returns same object

**beatsToDuration** (4 tests):
- `testBeatsToDuration_Zero` — 0 beats -> DurationBBF(0,0,0)
- `testBeatsToDuration_NegativeClamped` — -5 beats clamps to 0
- `testBeatsToDuration_BBF_FourBeats` — 4 beats in 4/4 -> DurationBBF(1,0,0)
- `testBeatsToDuration_BBF_FiveAndHalfBeats` — 5.5 beats in 4/4 -> DurationBBF(1,1,50)

**fromTimePosition** (3 tests):
- `testFromTimePosition_BeatTime` — BeatTime(4) -> Duration(4 beats)
- `testFromTimePosition_BBFPosition` — BBF(2,1,0) = 4 beats as duration
- `testFromTimePosition_WithTargetTimeBase` — BeatTime(4) -> DurationBBF(1,0,0)

**Non-4/4 Meter** (2 tests):
- `testConvertDuration_BBF_In34` — 3 beats in 3/4 -> DurationBBF(1,0,0)
- `testAddPositionDuration_In34` — Beat(0) + DurationBBT(1,0,0) in 3/4 = 3.0 beats

**Acceptance Scenarios**:

1. **Given** all 8 test files in `packages/blue-data/tests/time/`, **When** `pnpm test` is run, **Then** all tests pass
2. **Given** the test names in each TypeScript file, **When** compared to the corresponding Java JUnit test file, **Then** each Java test method has a matching TypeScript test
3. **Given** a BeatTime(4.0), **When** converted to seconds at 60 BPM, **Then** the result is 4.0 seconds
4. **Given** a BBSTTime(2,1,1,0) in 4/4, **When** converted to beats, **Then** the result is 4.0 beats
5. **Given** DurationBBT(1,0,0) in 4/4, **When** converted to beats, **Then** the result is 4.0 beats
6. **Given** a TempoMap with 60 BPM enabled, **When** `beatsToSeconds(4)` is called, **Then** the result is 4.0 seconds
7. **Given** a TempoMap with LINEAR curve from 60 to 120 BPM over 4 beats, **When** `getTempoAt(2)` is called, **Then** the result is approximately 90 BPM
8. **Given** all time types, **When** saved to XML and loaded back, **Then** values are preserved exactly

---

### Edge Cases

- What happens when a sound object has no `<startTime>` element? It should default to `TimePosition.beats(0)`.
- What happens when a PolyObject has `timeBehavior = REPEAT`? Notes should be duplicated across the duration (currently not implemented, acceptable to defer).
- What happens when `<startTime>` has an unknown `type` attribute (e.g., `BBT`)? It should fall back to `BEATS` with a warning.
- What happens with a null/empty `TimeContext`? Default to 60 BPM, 44100 sample rate.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `TimePosition.loadFromXML` MUST parse the `<csoundBeats>` child element of `<startTime type='BEATS'>` instead of reading direct text content
- **FR-002**: `TimeDuration.loadFromXML` MUST parse the `<csoundBeats>` child element of `<subjectiveDuration type='BEATS'>` instead of reading direct text content
- **FR-003**: `TimePosition` MUST support the `BEATS` time base with a `csoundBeats` value, converting to beats and seconds via `TimeContext`
- **FR-004**: `TimeDuration` MUST support the `BEATS` time base with a `csoundBeats` value, converting to beats and seconds via `TimeContext`
- **FR-005**: Each sound object's `loadFromXML` MUST use `TimePosition.loadFromXML(data.getElement('startTime'))` for the new format, falling back to `parseFloat(data.getTextString('startTime'))` for legacy format
- **FR-006**: Each sound object's `loadFromXML` MUST use `TimeDuration.loadFromXML(data.getElement('subjectiveDuration'))` for the new format, falling back to `parseFloat(data.getTextString('subjectiveDuration'))` for legacy format
- **FR-007**: `PolyObject.generateForCSD` MUST offset all generated notes by its own `startTime` via `toBeats(context)` after merging child notes
- **FR-008**: `SoundLayer`-level note generation (within PolyObject) MUST pass adjusted start/end times to child sound objects relative to each sound object's start time
- **FR-009**: `TempoMap` MUST support multi-point tempo maps with `beatsToSeconds` and `secondsToBeats` conversion
- **FR-010**: `TimeContext` MUST provide `getTempoMap()`, `getMeterMap()`, `getSampleRate()`, and `getSmpteFramesPerSecond()` for time conversions
- **FR-011**: All time-related XML serialization MUST round-trip correctly (load → save → load produces identical values)
- **FR-012**: Unit tests MUST be created in `packages/blue-data/tests/time/` matching the structure and coverage of the Java JUnit tests
- **FR-013**: Each test file MUST correspond to one Java JUnit test class with 1:1 test method mapping
- **FR-014**: All time type subtypes (BeatTime, BBTTime, BBSTTime, BBFTime, TimeValue, SecondsValue, FrameValue) MUST be implemented for both TimePosition and TimeDuration
- **FR-015**: TimeUnitMath operations (add, subtract, convert, distance) MUST be implemented with clamped-to-zero semantics for negative results
- **FR-016**: TimeUtilities helper functions (timePositionToBeats, beatsToTimePosition, convertTimePosition, secondsToTimePosition, framesToTimePosition) MUST be implemented
- **FR-017**: MeterMap MUST support bar/beat to absolute beat conversion with meter changes, and the reverse (beats to BBT)

### Key Entities

- **TimePosition**: Immutable value object representing a point in time. Subtypes: `BeatTime` (csoundBeats), `BBTTime` (bar/beat/ticks), `BBSTTime` (bar/beat/sixteenth/ticks), `BBFTime` (bar/beat/fraction), `TimeValue` (h/m/s/ms), `SecondsValue`, `FrameValue`. Each subtype converts to beats/seconds/frames via a `TimeContext`.
- **TimeDuration**: Immutable value object representing a span of time. Same subtypes as `TimePosition`. Used for sound object durations and repeat points.
- **TimeContext**: Provides tempo map, meter map, sample rate, and SMPTE frame rate for time conversions.
- **TempoMap**: Ordered list of `TempoPoint` entries. Converts beats to seconds and vice versa. Supports LINEAR and CONSTANT curve types.
- **MeterMap**: Ordered list of `MeasureMeterPair` entries. Maps bar/beat positions to absolute beat positions. Used by BBT/BBST/BBF time bases.
- **TimeBase**: Enum — `BEATS`, `BBT`, `BBST`, `BBF`, `TIME`, `SMPTE`, `SECONDS`, `FRAME`.
- **TimeUnitMath**: Static utility for position + duration, position - position, duration + duration, duration - duration, and type conversion operations.
- **TimeUtilities**: Static utility for converting between time positions and beats/seconds/frames.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Loading `demo2022.blue` produces PianoRoll sound objects with `startTime` values matching their XML positions (0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120)
- **SC-002**: The generated CSD score section contains notes with start times spanning the full duration of the piece (not all starting at 0)
- **SC-003**: The `test-csd.js` comparison shows the generated note start times align with the reference CSD
- **SC-004**: `TimePosition.loadFromXML` and `TimeDuration.loadFromXML` unit tests pass for all supported formats
- **SC-005**: Playing `demo2022.blue` in the blue-electron app produces audio that sounds musically correct — notes play in sequence over time
- **SC-006**: All existing tests continue to pass (no regressions)
- **SC-007**: All 8 time system test files in `packages/blue-data/tests/time/` pass with `pnpm test`
- **SC-008**: Test count is approximately 208 tests across the 8 test files (matching the 208 blue-core Java JUnit tests: 30+57+26+14+3+13+9+23+30)
- **SC-009**: Each Java JUnit test method has a corresponding TypeScript test with equivalent assertions

## Test Coverage Summary

| # | Test File | Java Source | Tests |
|---|-----------|-------------|-------|
| 5A | `time/time-position.test.ts` | `TimePositionTest.java` | 30 |
| 5B | `time/time-duration.test.ts` | `TimeDurationTest.java` | 57 |
| 5C | `time/tempo-map.test.ts` | `TempoMapTest.java` | 26 |
| 5D | `time/meter-map.test.ts` | `MeterMapTest.java` | 14 |
| 5E | `time/time-base.test.ts` | `TimeBaseTest.java` | 3 |
| 5F | `time/time-context.test.ts` | `TimeContextEqualityTest.java` + `TimeContextSerializationTest.java` | 22 |
| 5G | `time/time-utilities.test.ts` | `TimeUtilitiesTest.java` | 23 |
| 5H | `time/time-unit-math.test.ts` | `TimeUnitMathTest.java` | 30 |
| | **Total** | | **205** |

## Assumptions

- The Java `TimePosition` and `TimeDuration` classes (with nested subtypes) are the authoritative design
- The `BEATS` time base is the primary format used by existing `.blue` files
- `BBT`, `BBST`, `BBF`, `TIME`, `SECONDS`, `FRAME` time bases should load without error but full conversion support can be phased
- `demo2022.blue` uses `<startTime type='BEATS'><csoundBeats>N</csoundBeats></startTime>` format exclusively
- `SoundObjectUtilities.initBasicFromXML` pattern from Java should be replicated in TypeScript
- `TempoMap.beatsToSeconds` for single-tempo maps is `beats * (60.0 / tempo)`
- `PolyObject.processNotes` in Java does: apply note processors → apply time behavior → offset by startTime → clip to render range
- UI-related test files (TimeDisplayFormatTest, TimeUnitTextFieldTest, SoundObjectTimePanelTest, TimeStateTest, PianoRollTimeDisplayTest) are excluded as they test Swing/JavaFX UI components not applicable to the Electron app
- Listener/event tests in TempoMap and MeterMap may use a simplified event system (not full Java PropertyChangeSupport)
