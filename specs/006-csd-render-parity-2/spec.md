# Feature Specification: CSD Render Parity — Phase 2

**Feature Branch**: `006-csd-render-parity-2`
**Created**: 2026-04-14
**Status**: Draft
**Input**: Generated CSD compiles with Csound but differs structurally from Java blue CSDRender output. Reference file: `demo2022_rt.csd` from Java export. All work is test-driven via `test-csd.js` Node script, with final acceptance by in-app playback.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Parameter Automation Renders Correctly (Priority: P1)

When the user opens a `.blue` project with BSB instruments that have automation parameters and generates CSD, the instrument bodies use `gk_blue_autoN` parameter references instead of hardcoded widget values. This enables real-time control of synthesizer parameters during playback.

**Why this priority**: Without parameter references, the synth sounds correct on first play but cannot be automated or controlled at runtime. This is the single biggest gap from the reference — 70+ hardcoded `i(value)` calls that should be `i(gk_blue_autoN)`.

**Independent Test**: Run `test-csd.js` and verify zero hardcoded `i()` values in generated instrument bodies, and that parameter refs `i(gk_blue_autoN)` match reference count.

**Acceptance Scenarios**:

1. **Given** demo2022.blue with 84+ automation parameters across BSB instruments, **When** CSD is generated, **Then** each automatable widget's value is replaced with its assigned `gk_blue_autoN` compilation variable name in the instrument body
2. **Given** two BSB instruments sharing the same parameter names, **When** parameters are collected, **Then** each instrument's parameters get unique sequential names (`gk_blue_auto0` through `gk_blue_auto83+`)
3. **Given** the generated CSD, **When** tested with Csound `-n`, **Then** it compiles and runs without errors

---

### User Story 2 — Mixer with Effects and BlueMixer Renders (Priority: P2)

When the user opens a project with mixer effects (sends, sub-channels, effect chains), the generated CSD includes the effect UDOs, always-on effect instruments, and the BlueMixer instrument that routes audio through sends and sub-channels.

**Why this priority**: Without the mixer, all instruments output directly — no effects processing, no reverb sends, no level mixing. Audio technically plays but sounds wrong.

**Independent Test**: Run `test-csd.js` and verify presence of `blueEffect0`, `blueEffect1` UDOs, instruments 4/5/BlueMixer, and Reverb sub-channel inits.

**Acceptance Scenarios**:

1. **Given** a project with mixer enabled and effect chains, **When** CSD is generated, **Then** all mixer sub-channel inits are present (including `ga_bluesub_Reverb_0/1`)
2. **Given** effect chains defined in the mixer, **When** CSD is generated, **Then** each effect becomes a `blueEffectN` UDO and is callable from the BlueMixer
3. **Given** the BlueMixer instrument, **When** it runs, **Then** it routes audio through level adjustments, reverb sends, and outputs via `outc`
4. **Given** the generated CSD, **When** tested with Csound `-n`, **Then** it compiles without errors

---

### User Story 3 — Score Section Matches Reference (Priority: P3)

When the user generates CSD, the `<CsScore>` section includes the tempo statement from the project's TempoMap and schedules always-on instruments (effects, BlueMixer) for the correct duration.

**Why this priority**: Without the tempo statement, timing is wrong. Without always-on scheduling, effects and mixer never run.

**Independent Test**: Run `test-csd.js` and verify tempo statement present and always-on `i` events at score end.

**Acceptance Scenarios**:

1. **Given** a project with a TempoMap defining tempo `95.333...`, **When** CSD is generated, **Then** the score contains `t 0 95.33333333333333`
2. **Given** always-on instruments (effects, BlueMixer) with computed `totalDur`, **When** CSD is generated, **Then** the score contains `i<effectId> 0 <totalDur>` and `i"BlueMixer" 0 <totalDur>`
3. **Given** the generated CSD, **When** tested with Csound `-n`, **Then** it compiles without errors

---

### User Story 4 — CSD Structure Matches Java Reference Exactly (Priority: P4)

When the user compares the TypeScript-generated CSD side-by-side with the Java-generated reference, the structural ordering, deduplication of UDOs, absence of unnecessary `<CsOptions>` for realtime output, and parameter ordering all match.

**Why this priority**: Polishing parity — ensuring the output is not just functional but structurally identical to the Java output for confidence in correctness.

**Independent Test**: Run `test-csd.js` comparison report and verify all metrics match reference: same UDO count (15 deduplicated), same instrument count (6), no CsOptions for realtime, parameter count matches (114).

**Acceptance Scenarios**:

1. **Given** realtime CSD generation, **When** output is assembled, **Then** no `<CsOptions>` section is present
2. **Given** two BSB instruments with identical UDOs, **When** UDOs are collected, **Then** duplicates are removed, producing exactly the same UDO set as the reference
3. **Given** the full generated CSD, **When** compared section-by-section with the Java reference, **Then** the ordering is: header → mixer inits → string channels → parameters → UDOs → effects → instruments → mixer instrument
4. **Given** the generated CSD, **When** played in the blue-electron app, **Then** the user hears audio matching the Java blue app's playback

---

### Edge Cases

- What happens when a BSB widget has no `parameterName`? It should use the widget's hardcoded value, not a parameter reference.
- What happens when the mixer is disabled? No mixer inits, no BlueMixer, instruments use `outc` directly.
- What happens when there are no effect chains? No `blueEffectN` UDOs, no always-on effect instruments.
- What happens when there is no TempoMap? No `t` statement in the score.
- What happens when a project has no parameters at all? No `gk_blue_autoN` init statements, instrument text uses raw widget values.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST replace automatable BSB widget values with their assigned `gk_blue_autoN` parameter variable names during compilation
- **FR-002**: The system MUST collect parameters from all arrangement instruments and the mixer, assigning unique sequential names
- **FR-003**: The system MUST generate parameter init statements (`gk_blue_autoN init <value>`) and `chnexport` declarations for all parameters
- **FR-004**: The system MUST generate mixer sub-channel inits for all mixer channels (source, sub-channels including Reverb, Master)
- **FR-005**: The system MUST generate effect UDOs (`blueEffectN`) from mixer effect chains
- **FR-006**: The system MUST generate always-on effect instruments for each mixer send
- **FR-007**: The system MUST generate the BlueMixer instrument that routes audio through levels, sends, and sub-channels
- **FR-008**: The system MUST schedule always-on instruments (effects, BlueMixer) in the score for the computed `totalDur`
- **FR-009**: The system MUST include the tempo statement from the TempoMap in the `<CsScore>` section
- **FR-010**: The system MUST deduplicate UDOs across instruments (identical UDOs from different instruments should appear only once)
- **FR-011**: The system MUST omit `<CsOptions>` for realtime CSD output
- **FR-012**: The system MUST order the CsInstruments content as: header → mixer inits → string channels → parameters → UDOs → arrangement instruments → always-on effects → BlueMixer
- **FR-013**: The system MUST generate string channel init statements (`gS_blue_strN`) and `chnexport` for all BSBFileSelector widgets
- **FR-014**: All generated CSD files MUST compile successfully with Csound

### Key Entities

- **CompileData**: Shared compilation context holding parameter name assignments, string channel assignments, and ftable number tracking
- **Parameter**: An automation parameter from a BSB instrument, with name, value, min/max, and assigned compilation variable (`gk_blue_autoN`)
- **StringChannel**: A file path or string value from a BSBFileSelector widget, with assigned compilation variable (`gS_blue_strN`)
- **MixerChannel**: A mixer routing channel (source send, sub-channel like Reverb, or Master) with init audio variables
- **EffectChain**: A mixer effect chain producing a `blueEffectN` UDO and an always-on instrument

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The `test-csd.js` comparison report shows 0 hardcoded `i()` values in instrument bodies (down from 70+)
- **SC-002**: The generated CSD parameter count matches the Java reference (114 parameters for demo2022.blue)
- **SC-003**: The generated CSD contains all reference instruments (instr 1-5 and BlueMixer)
- **SC-004**: The generated CSD contains all reference mixer inits (10 init statements including Reverb sub-channels)
- **SC-005**: The generated CSD contains the tempo statement matching the reference
- **SC-006**: The generated CSD compiles and runs successfully with Csound without any errors
- **SC-007**: The user can open demo2022.blue in the blue-electron app, click play, and hear audio matching the Java blue app's playback
- **SC-008**: All existing tests continue to pass (no regressions)

## Assumptions

- The Java CSDRender output (`demo2022_rt.csd`) is the authoritative reference for CSD structure and content
- The `test-csd.js` Node script is the primary test harness for automated verification during development
- Final acceptance testing is manual in-app playback by the user
- The `CompileData` class already exists and provides shared compilation context
- The Mixer class already loads from XML and generates init statements for source channels
- Spec 005 work (UDO wrapping, basic parameter/string inits, mixer source inits) is complete and correct
- Pattern sound objects (PatternObject) remain unimplemented and their score notes are correctly skipped
- Effect chains are derived from the mixer's XML `<channel>` elements with `<effectChain>` children
- The TempoMap is loaded from the Score's `<timeState>` element
