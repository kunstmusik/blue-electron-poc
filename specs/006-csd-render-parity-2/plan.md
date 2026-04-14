# Implementation Plan: CSD Render Parity — Phase 2

**Branch**: `006-csd-render-parity-2` | **Date**: 2026-04-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-csd-render-parity-2/spec.md`

## Summary

Bring the TypeScript CSD generation to structural parity with the Java CSDRender output. The generated CSD already compiles with Csound but uses hardcoded widget values instead of automation parameters, lacks mixer effects/BlueMixer, and is missing tempo and always-on instrument scheduling. The technical approach is to enhance the existing `CompileData` to manage parameter name assignments, add mixer effect chain rendering, and wire the tempo map into the score section — all test-driven via `test-csd.js` against the Java reference CSD.

## Technical Context

**Language/Version**: TypeScript 5.8+, Node.js 22
**Primary Dependencies**: `@rgrove/parse-xml`, `zeromq` (engine client only), Electron (app only)
**Storage**: `.blue` XML files (existing)
**Testing**: `test-csd.js` (CSD comparison + Csound compilation), Vitest (unit tests)
**Target Platform**: macOS desktop (Electron), Csound command-line for testing
**Project Type**: Desktop app (CSD code generation)
**Performance Goals**: CSD generation < 100ms for typical projects
**Constraints**: Generated CSD must be byte-for-byte comparable to Java reference output
**Scale/Scope**: 1 reference project (demo2022.blue), 114 parameters, 6 instruments

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Data-First, UI-Separated | PASS | All CSD generation logic stays in `blue-data` package |
| II. Backwards-Compatible Serialization | PASS | No serialization format changes — only generation logic |
| III. JVM Dependencies Preserved | PASS | No JVM-dependent changes |
| IV. Engine as External Process | PASS | No engine protocol changes |
| V. Test-First for Serialization | PASS | Test-first approach with `test-csd.js` + Vitest |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/006-csd-render-parity-2/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Java CSDRender analysis
├── quickstart.md        # Phase 1: Testing guide
└── tasks.md             # Phase 2: Task breakdown
```

### Source Code (repository root)

```text
packages/blue-data/src/
├── compile-data.ts                    # Enhanced: parameter/string channel name management
├── blue-data.ts                       # Modified: toCSD() orchestration
├── arrangement.ts                     # Modified: generateOrchestra with compileData
├── instruments/
│   ├── blue-synth-builder.ts          # Modified: generateInstrument uses compileData
│   └── blue-synth-builder/
│       ├── bsb-compilation-unit.ts    # Modified: parameter-aware replacement
│       └── bsb-widget.ts              # Interface: parameterName access
├── mixer/
│   ├── mixer.ts                       # Modified: effect chains, sub-channels, BlueMixer
│   ├── mixer-channel.ts              # Existing: channel routing
│   └── effect-chain.ts               # New: effect chain to UDO/instrument
├── automation/
│   └── parameter.ts                   # Existing: parameter with compilation name
└── score/
    └── score.ts                       # Modified: tempo statement, totalDur

packages/blue-data/tests/integration/
└── csd-parity.test.ts                 # New: CSD parity tests

test-csd.js                             # Enhanced: detailed comparison report
```

**Structure Decision**: All changes are within the existing monorepo structure. The `blue-data` package owns all CSD generation logic. No new packages or directories needed.

## Implementation Phases

### Phase A: Parameter-Aware BSB Compilation (P1 — User Story 1)

**Goal**: Replace hardcoded widget values with `gk_blue_autoN` parameter references.

Key changes:
1. Enhance `CompileData` to hold a `ParameterNameManager` that assigns `gk_blue_autoN` names
2. Each BSB widget with a `parameterName` looks up its compilation variable from `CompileData`
3. `BSBCompilationUnit` checks if a widget has a parameter — if so, uses the variable name; otherwise uses the raw value
4. `BlueData.toCSD()` collects all parameters from arrangement instruments + mixer, assigns names, and generates init statements + chnexport

### Phase B: Mixer Effects & BlueMixer (P2 — User Story 2)

**Goal**: Generate effect UDOs, always-on instruments, and BlueMixer.

Key changes:
1. Load mixer effect chains from XML (`<effectChain>` elements within `<channel>`)
2. Generate `blueEffectN` UDOs from each effect chain's instrument text
3. Generate always-on instruments (one per effect send)
4. Generate the BlueMixer instrument that routes audio through levels and sends
5. Add Reverb sub-channel inits to mixer init statements

### Phase C: Score Tempo & Always-On Scheduling (P3 — User Story 3)

**Goal**: Add tempo statement and schedule always-on instruments in the score.

Key changes:
1. Load TempoMap from Score's timeState
2. Generate `t` statement in `<CsScore>`
3. Compute `totalDur` from generated note list
4. Schedule always-on instruments (`i<id> 0 <totalDur>`) and BlueMixer in score
5. Remove `<CsOptions>` for realtime CSD output

### Phase D: UDO Deduplication & Structural Polish (P4 — User Story 4)

**Goal**: Match reference structure exactly.

Key changes:
1. Deduplicate UDOs across instruments (collect unique set by name)
2. Verify section ordering matches reference
3. Ensure parameter count matches (114 for demo2022.blue — includes mixer parameters)
4. Final comparison pass with `test-csd.js`
