# Implementation Plan: Blue Time System

**Branch**: `007-time-system` | **Date**: 2026-04-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-time-system/spec.md`

## Summary

Sound object start times in `.blue` files load as 0 because `data.getTextString('startTime')` returns empty for the nested `<startTime type='BEATS'><csoundBeats>8.0</csoundBeats></startTime>` format. The fix requires: (1) implementing `TimePosition.loadFromXML` with child element parsing, (2) creating `SoundObjectUtilities.initBasicFromXML` for the 3-format fallback pattern, (3) updating all 16 sound objects, (4) adding `setScoreStart` offset in PolyObject, and (5) building out the full time type system (7 subtypes for both TimePosition and TimeDuration), MeterMap, multi-point TempoMap, TimeUnitMath, and 205 unit tests matching Java JUnit tests.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode
**Primary Dependencies**: `@rgrove/parse-xml` (XML parsing), `vitest` (testing), `esbuild` (bundling for Electron)
**Storage**: `.blue` XML files (electric.xml-compatible format)
**Testing**: vitest — `pnpm test` in `packages/blue-data`
**Target Platform**: Electron (macOS/Windows/Linux), Node.js 18+
**Project Type**: Library (`blue-data` package) consumed by Electron app (`blue-app`)
**Performance Goals**: CSD generation for `demo2022.blue` (<100ms), note start time accuracy to match Java output
**Constraints**: No `require()` or dynamic imports (esbuild bundle). No Node.js built-ins in blue-data. Static ES imports only.
**Scale/Scope**: 16 sound object types to update, 7+7 time subtypes, 205 unit tests, 6 new source files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Data-First, UI-Separated | PASS | All changes in `packages/blue-data/src/`, zero UI dependencies |
| II. Backwards-Compatible Serialization | PASS | New `loadFromXML` handles 3 formats (new nested, legacy tag, old plain text). `saveAsXML` writes new nested format. Round-trip tests required. |
| III. JVM Dependencies Preserved | N/A | No JVM-dependent sound objects affected |
| IV. Engine as External Process | N/A | No engine changes |
| V. Test-First for Serialization | PASS | 205 unit tests matching Java JUnit tests required by spec (FR-012 through FR-017) |

**Post-Design Re-check**: All time types have XML round-trip tests. MeterMap and TempoMap have serialization tests. SoundObjectUtilities tested via integration test loading `demo2022.blue`.

## Project Structure

### Documentation (this feature)

```text
specs/007-time-system/
├── plan.md              # This file
├── research.md          # Root cause analysis and Java reference
├── spec.md              # Feature specification with user stories
└── tasks.md             # Task breakdown (/speckit.tasks output)
```

### Source Code (repository root)

```text
packages/blue-data/
├── src/
│   ├── time/
│   │   ├── time-base.ts           # EXPAND: 8 enum values + isBeatBased()
│   │   ├── time-position.ts       # REWRITE: 7 subtypes, fix loadFromXML
│   │   ├── time-duration.ts       # REWRITE: 7 subtypes, fix loadFromXML
│   │   ├── tempo-map.ts           # REWRITE: multi-point with LINEAR/CONSTANT
│   │   ├── time-context.ts        # EXPAND: add MeterMap, sampleRate
│   │   ├── time-utilities.ts      # REWRITE: full conversion functions
│   │   ├── meter.ts               # NEW: Meter value object
│   │   ├── measure-meter-pair.ts  # NEW: measure + meter pairing
│   │   ├── meter-map.ts           # NEW: bar/beat ↔ beats conversion
│   │   ├── curve-type.ts          # NEW: CONSTANT, LINEAR enum
│   │   ├── tempo-point.ts         # NEW: single tempo entry
│   │   ├── time-unit-math.ts      # NEW: position/duration arithmetic
│   │   ├── time-state.ts          # EXISTING: no changes
│   │   └── smpte-frame-rate.ts    # EXISTING: no changes
│   ├── sound-objects/
│   │   ├── sound-object-utilities.ts  # NEW: initBasicFromXML helper
│   │   ├── poly-object.ts         # FIX: add setScoreStart offset
│   │   ├── sound-layer.ts         # EXPAND: add generateForCSD
│   │   ├── generic-score.ts       # FIX: line 107 bug + use initBasicFromXML
│   │   └── [14 more sound objects] # UPDATE: use initBasicFromXML
│   └── utilities/
│       └── score.ts               # EXISTING: setScoreStart already here
├── tests/
│   ├── time/
│   │   ├── helpers.ts             # NEW: test context factories
│   │   ├── time-base.test.ts      # NEW: 3 tests
│   │   ├── meter-map.test.ts      # NEW: 14 tests
│   │   ├── tempo-map.test.ts      # NEW: 26 tests
│   │   ├── time-position.test.ts  # NEW: 30 tests
│   │   ├── time-duration.test.ts  # NEW: 57 tests
│   │   ├── time-context.test.ts   # NEW: 22 tests
│   │   ├── time-utilities.test.ts # NEW: 23 tests
│   │   └── time-unit-math.test.ts # NEW: 30 tests
│   └── integration/               # EXISTING: must not break
```

**Structure Decision**: All source changes in `packages/blue-data/src/`. New files in `time/` for MeterMap/TempeMap infrastructure and `sound-objects/` for SoundObjectUtilities. Test files in `tests/time/` matching vitest config (`tests/**/*.test.ts`).

## Implementation Phases

### Phase 1: Fix Core Bug — Start Times Load as 0 (P1 Critical)

**Goal**: After this phase, `demo2022.blue` loads PianoRolls at correct beat positions and the CSD has notes at correct start times.

**Step 1.1** — Expand `TimeBase` enum to 8 values + `isBeatBased()` helper
  - File: `src/time/time-base.ts`
  - Add: `BBT`, `BBST`, `BBF`, `TIME`, `FRAME`

**Step 1.2** — Fix `TimePosition` with subtype fields and `loadFromXML`
  - File: `src/time/time-position.ts`
  - Add typed fields: `csoundBeats`, `bar`/`beat`/`ticks`/`sixteenth`/`fraction`, `hours`/`minutes`/`seconds`/`milliseconds`, `totalSeconds`, `frameNumber`
  - Fix `loadFromXML`: read `type` attr → read type-specific child element (`getTextString('csoundBeats')` for BEATS)
  - Fix `saveAsXML`: write nested format `<csoundBeats>N</csoundBeats>`
  - Add factory methods: `bbt()`, `bbst()`, `bbf()`, `timeValue()`, `frames()`
  - `toBeats(context)` dispatches on type

**Step 1.3** — Fix `TimeDuration` with subtype fields and `loadFromXML`
  - File: `src/time/time-duration.ts`
  - Same pattern as TimePosition but 0-based bar/beat semantics

**Step 1.4** — Create `SoundObjectUtilities.initBasicFromXML`
  - New file: `src/sound-objects/sound-object-utilities.ts`
  - Handles 3 XML formats for startTime and subjectiveDuration:
    1. New: `<startTime type='BEATS'><csoundBeats>N</csoundBeats></startTime>`
    2. Legacy tag: `<startTimePosition type='...'>`
    3. Old plain: `<startTime>N</startTime>` (no type attr)
  - Also loads: name, timeBehavior, backgroundColor, repeatPoint, noteProcessorChain

**Step 1.5** — Fix GenericScore bug (line 107) and update all sound objects
  - Fix: `setSubjectiveDuration` → `setStartTime`
  - Replace manual loading in all 16 sound objects with `initBasicFromXML`

**Step 1.6** — Fix PolyObject note offset
  - File: `src/sound-objects/poly-object.ts`
  - After merging notes: `setScoreStart(noteList, this._startTime.toBeats(context))`

**Step 1.7** — Verify: load `demo2022.blue`, generate CSD, run `test-csd.js`

### Phase 2: MeterMap + TempoMap Infrastructure

**Step 2.1** — Create `Meter`, `MeasureMeterPair`, `MeterMap`
  - New files: `src/time/meter.ts`, `src/time/measure-meter-pair.ts`, `src/time/meter-map.ts`
  - MeterMap: `barBeatToBeats(bar, beat)`, `beatsToBBT(beats, ppq)`, XML serialization

**Step 2.2** — Create `CurveType`, `TempoPoint`
  - New files: `src/time/curve-type.ts`, `src/time/tempo-point.ts`

**Step 2.3** — Expand `TempoMap` to multi-point
  - File: `src/time/tempo-map.ts`
  - List of TempoPoint entries, CONSTANT/LINEAR curves, `beatsToSeconds`/`secondsToBeats`

**Step 2.4** — Update `TimeContext`
  - File: `src/time/time-context.ts`
  - Add MeterMap, sampleRate, equality methods

### Phase 3: TimeUtilities + TimeUnitMath

**Step 3.1** — Create `TimeUnitMath`
  - New file: `src/time/time-unit-math.ts`
  - add, subtract, distance, convert, beatsToDuration, fromTimePosition

**Step 3.2** — Rewrite `TimeUtilities`
  - File: `src/time/time-utilities.ts`
  - Full conversion functions matching Java TimeUtilities

### Phase 4: SoundLayer Relative Times

**Step 4.1** — Add `generateForCSD` to `SoundLayer`
  - File: `src/sound-objects/sound-layer.ts`
  - Compute adjusted times per sound object

**Step 4.2** — Update `PolyObject.generateForCSD` to delegate to SoundLayer

### Phase 5: Unit Tests (205 tests)

- `tests/time/helpers.ts` — context factories
- `tests/time/time-base.test.ts` — 3 tests
- `tests/time/meter-map.test.ts` — 14 tests
- `tests/time/tempo-map.test.ts` — 26 tests
- `tests/time/time-position.test.ts` — 30 tests
- `tests/time/time-duration.test.ts` — 57 tests
- `tests/time/time-context.test.ts` — 22 tests
- `tests/time/time-utilities.test.ts` — 23 tests
- `tests/time/time-unit-math.test.ts` — 30 tests

## Key Files Reference

| File | Role | Action |
|------|------|--------|
| `src/time/time-position.ts` | Core time position class | REWRITE |
| `src/time/time-duration.ts` | Core time duration class | REWRITE |
| `src/time/tempo-map.ts` | Tempo management | REWRITE |
| `src/time/time-context.ts` | Time conversion context | EXPAND |
| `src/time/time-utilities.ts` | Conversion utilities | REWRITE |
| `src/sound-objects/sound-object-utilities.ts` | Sound object loading helper | NEW |
| `src/sound-objects/poly-object.ts` | Note offset fix | FIX |
| `src/sound-objects/generic-score.ts` | Line 107 bug fix | FIX |
| `src/time/meter-map.ts` | Meter/beat conversion | NEW |
| `src/time/time-unit-math.ts` | Position/duration math | NEW |

## Reuse Map

| Existing Code | Location | Reuse For |
|----------------|----------|-----------|
| `setScoreStart(nl, offset)` | `src/utilities/score.ts` | PolyObject note offset (Phase 1.6) |
| `Element.getTextString()` | `src/serialization/xml-reader.ts` | Reading child element text |
| `Element.getElement()` | `src/serialization/xml-reader.ts` | Getting nested elements |
| `Element.getAttribute()` | `src/serialization/xml-reader.ts` | Reading type attributes |
| `NoteList.merge()` | `src/sound-objects/note-list.ts` | Merging note lists in PolyObject |
| `Note.setStartTime()` | `src/sound-objects/note.ts` | Adjusting note start times |

## Complexity Tracking

No constitution violations. All changes conform to the data-first, backwards-compatible serialization, and test-first principles.
