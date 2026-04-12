# Tasks: Blue Java Data Port to TypeScript

**Input**: Design documents from `specs/001-blue-data-port/`
**Prerequisites**: plan.md (required), spec.md (required), research/001-003 (reference)

**Tests**: Round-trip serialization tests are REQUIRED for every data class (Constitution Principle V).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic tooling

- [x] T001 [P] Configure root workspace `package.json` with npm workspaces (already scaffolded)
- [x] T002 [P] Configure shared `tsconfig.base.json` (already scaffolded)
- [x] T003 [P] Add vitest, eslint, prettier as root devDependencies
- [x] T004 [P] Configure vitest workspace across packages
- [x] T005 [P] Add `@rgrove/parse-xml` as `blue-data` dependency

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can begin

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### XML Serialization System

- [x] T006 [US-all] Implement `Element` class wrapping parse-xml output in `packages/blue-data/src/serialization/xml-reader.ts` (mirrors Java `electric.xml.Element`: `getName()`, `getAttribute()`, `getTextString()`, `getElements()`, `addElement()`, `setText()`)
- [x] T007 [US-all] Implement `Elements` iterator class (mirrors Java `electric.xml.Elements`: `next()`, `hasMoreElements()`)
- [x] T008 [US-all] Implement `XmlWriter` in `packages/blue-data/src/serialization/xml-writer.ts` (produces matching output format to Java)
- [x] T009 [US-all] Implement `ObjRefMap` type in `packages/blue-data/src/serialization/obj-ref-map.ts` (bidirectional object↔string mapping)
- [x] T010 [US-all] Write XML round-trip tests in `packages/blue-data/src/serialization/xml-reader.test.ts`

### Foundation Types

- [x] T011 [P] [US-all] Implement `DeepCopyable<T>` interface in `packages/blue-data/src/deep-copyable.ts`
- [x] T012 [P] [US-all] Implement `BlueDataObject` interface in `packages/blue-data/src/blue-data-object.ts`
- [x] T013 [P] [US-all] Implement `BlueConstants` in `packages/blue-data/src/blue-constants.ts` (version string, constants)
- [x] T014 [P] [US-all] Implement `CopyBuffer` in `packages/blue-data/src/copy-buffer.ts`
- [x] T015 [P] [US-all] Implement text utilities in `packages/blue-data/src/utilities/text.ts` (`replaceAll`, `stripSingleLineComments`)
- [x] T016 [P] [US-all] Implement XML utilities in `packages/blue-data/src/utilities/xml.ts` (`writeInt`, `readInt`, `writeDouble`, `readDouble`, `writeBoolean`, `readBoolean`)
- [x] T017 [US-all] Implement `CompileData` in `packages/blue-data/src/compile-data.ts` (compilation context, channel assignments, global orc/sco accumulators)

### Migration System

- [x] T018 [P] [US-all] Implement `ProjectVersion` in `packages/blue-data/src/migration/project-version.ts` (parse, compare)
- [x] T019 [P] [US-all] Implement `ProjectUpgrader` abstract class in `packages/blue-data/src/migration/upgrader.ts`
- [x] T020 [US-all] Implement `UpgradeManager` in `packages/blue-data/src/migration/upgrade-manager.ts` (registry, performUpgrades on Element)
- [x] T021 [US-all] Port `ProjectUpgrader_2_1_10` in `packages/blue-data/src/migration/upgrades/upgrade-2-1-10.ts` (0dbfs extraction)
- [x] T022 [US-all] Port `ProjectUpgrader_2_3_0` in `packages/blue-data/src/migration/upgrades/upgrade-2-3-0.ts` (tempo/score restructuring, pattern layer fix)

### Time System

- [x] T023 [P] [US-all] Implement `TimeBase` enum in `packages/blue-data/src/time/time-base.ts`
- [x] T024 [P] [US-all] Implement `SmpteFrameRate` enum in `packages/blue-data/src/time/smpte-frame-rate.ts`
- [x] T025 [P] [US-all] Implement `TimePosition` in `packages/blue-data/src/time/time-position.ts` (beats, seconds, SMPTE; `saveAsXML()`, `loadFromXML()`)
- [x] T026 [P] [US-all] Implement `TimeDuration` in `packages/blue-data/src/time/time-duration.ts` (beats, seconds; `saveAsXML()`, `loadFromXML()`)
- [x] T027 [US-all] Implement `TempoMap` in `packages/blue-data/src/time/tempo-map.ts`
- [x] T028 [US-all] Implement `TimeContext` in `packages/blue-data/src/time/time-context.ts`
- [x] T029 [US-all] Implement `TimeState` in `packages/blue-data/src/time/time-state.ts`
- [x] T030 [US-all] Implement `TimeUnitMath` and `TimeUtilities` in `packages/blue-data/src/time/`

**Checkpoint**: Foundation ready — XML serialization works, migration system applies upgrades, time system is functional. User story implementation can now begin.

---

## Phase 3: User Story 1 — Open and Play a .blue Project (Priority: P1) 🎯 MVP

**Goal**: Load a `.blue` file, display metadata, generate CSD, send to blue-engine, play audio.

**Independent Test**: Load a simple `.blue` file (GenericScore only), press Play, hear Csound audio output.

### Tests for User Story 1

- [ ] T031 [P] [US1] Round-trip test: load a real `.blue` file from Java Blue, save, compare in `packages/blue-data/tests/integration/roundtrip-simple-blue-file.test.ts`
- [ ] T032 [P] [US1] Migration test: load a pre-2.3.0 `.blue` file, verify migration applied in `packages/blue-data/tests/integration/migration-old-file.test.ts`
- [ ] T033 [US1] CSD generation test: generate CSD from a simple project, verify orchestra/score structure in `packages/blue-data/tests/integration/csd-generation.test.ts`
- [ ] T034 [US1] Engine client test: send test orchestra/score to blue-engine, verify audio in `packages/blue-engine-client/tests/integration/engine-playback.test.ts`

### Implementation — Score Object Base + GenericScore

- [ ] T035 [P] [US1] Implement `ScoreObject` interface in `packages/blue-data/src/score/score-object.ts`
- [ ] T036 [P] [US1] Implement `ScoreObjectEvent` and `ScoreObjectListener` in `packages/blue-data/src/score/`
- [ ] T037 [P] [US1] Implement `SoundObject` interface in `packages/blue-data/src/sound-objects/sound-object.ts`
- [ ] T038 [P] [US1] Implement `AbstractSoundObject` base class in `packages/blue-data/src/sound-objects/abstract-sound-object.ts`
- [ ] T039 [P] [US1] Implement `TimeBehavior` enum in `packages/blue-data/src/sound-objects/time-behavior.ts`
- [ ] T040 [P] [US1] Implement `Note` and `NoteList` in `packages/blue-data/src/sound-objects/note.ts` and `note-list.ts`
- [ ] T041 [US1] Implement `GenericScore` in `packages/blue-data/src/sound-objects/generic-score.ts` (raw Csound score text, `generateForCSD()`, load/save XML)
- [ ] T042 [US1] Implement `SoundObjectUtilities` in `packages/blue-data/src/sound-objects/sound-object-utilities.ts` (common load/save helpers)

### Implementation — PolyObject (default score container)

- [ ] T043 [P] [US1] Implement score layer base interfaces in `packages/blue-data/src/score/layers/`: `Layer`, `LayerGroup`, `ScoreObjectLayer`, `ScoreObjectLayerGroup`, `LayerGroupProvider`, `LayerGroupProviderManager`, `LayerGroupDataEvent`, `LayerGroupListener`, `DeepCopyableLG`
- [ ] T044 [US1] Implement `SoundLayer` in `packages/blue-data/src/sound-objects/sound-layer.ts` (layer within PolyObject)
- [ ] T045 [US1] Implement `PolyObject` in `packages/blue-data/src/sound-objects/poly-object.ts` (SoundObject + ScoreObjectLayerGroup<SoundLayer>)
- [ ] T046 [US1] Implement `PolyObjectLayerGroupProvider` in `packages/blue-data/src/sound-objects/poly-object-layer-group-provider.ts`
- [ ] T047 [US1] Implement `Score` in `packages/blue-data/src/score/score.ts` (container for layer groups, TimeContext, TimeState, NoteProcessorChain)

### Implementation — Instrument & Arrangement

- [ ] T048 [P] [US1] Implement `Instrument` abstract class in `packages/blue-data/src/instruments/instrument.ts`
- [ ] T049 [P] [US1] Implement `GenericInstrument` in `packages/blue-data/src/instruments/generic-instrument.ts`
- [ ] T050 [US1] Implement `InstrumentAssignment` in `packages/blue-data/src/instruments/instrument-assignment.ts`
- [ ] T051 [US1] Implement `Arrangement` in `packages/blue-data/src/arrangement.ts` (instrument→ID mapping, `generateOrchestra()`, `generateGlobalOrc()`)
- [ ] T052 [US1] Implement `InstrumentLibrary` in `packages/blue-data/src/instruments/instrument-library.ts`

### Implementation — Project Properties, Tables, GlobalOrcSco

- [ ] T053 [P] [US1] Implement `ProjectProperties` in `packages/blue-data/src/project-properties.ts` (sr, ksmps, nchnls, 0dbfs, Csound options)
- [ ] T054 [P] [US1] Implement `Tables` in `packages/blue-data/src/tables.ts` (F-table definitions)
- [ ] T055 [P] [US1] Implement `GlobalOrcSco` in `packages/blue-data/src/global-orc-sco.ts`

### Implementation — BlueData (root) + CSD Generation

- [ ] T056 [US1] Implement `BlueData` in `packages/blue-data/src/blue-data.ts` (root aggregation, `loadFromString()`, `saveToString()`, `toCSD()`)
- [ ] T057 [US1] Implement `toCSD()` method — assembles orchestra + score + global orc/sco + tables + options into complete CSD string

### Implementation — BlueSynthBuilder data types

- [ ] T058 [US1] Implement BSB data types in `packages/blue-data/src/instruments/bsb/` (BSBObject, BSBComponent, etc. — preserve data, no CSD generation needed for Phase 1 MVP)

### Implementation — Engine Client

- [ ] T059 [P] [US1] Implement protocol constants in `packages/blue-engine-client/src/protocol.ts` (command codes, message format)
- [ ] T060 [US1] Implement `EngineClient` in `packages/blue-engine-client/src/engine-client.ts` (ZMQ REQ/REP: create, setOption, compileOrc, readScore, start, stop, exit)
- [ ] T061 [US1] Implement channel operations in `EngineClient` (createChannel, setChannel, getChannel via ZMQ)

### Implementation — Electron App

- [ ] T062 [P] [US1] Implement Electron main process in `packages/blue-app/src/main/main.ts` (window creation, file dialog via IPC)
- [ ] T063 [P] [US1] Implement preload script in `packages/blue-app/src/preload/preload.ts` (context bridge for file open/save, play/stop)
- [ ] T064 [US1] Implement engine bridge in `packages/blue-app/src/main/engine-bridge.ts` (spawn blue-engine, manage lifecycle, ZMQ connection)
- [ ] T065 [US1] Implement renderer `app.tsx` in `packages/blue-app/src/renderer/` — file open dialog, project metadata display, Play/Stop buttons, status indicator
- [ ] T066 [US1] Wire IPC: renderer → main (open file) → blue-data (load) → engine-bridge (spawn + send CSD) → play

**Checkpoint**: User Story 1 complete — can open a simple `.blue` file, see metadata, press Play, hear audio. Independently testable.

---

## Phase 4: User Story 2 — Round-Trip Save and Reload (Priority: P1)

**Goal**: Save changes to a `.blue` file and reload with full data integrity. Saved file must also load in Java Blue.

**Independent Test**: Load → modify → save → reload → verify all data matches. Load saved file in Java Blue → verify.

### Tests for User Story 2

- [ ] T067 [P] [US2] Round-trip test with modifications: load, change a property, save, reload, verify in `packages/blue-data/tests/integration/roundtrip-modify.test.ts`
- [ ] T068 [P] [US2] Cross-compatibility test: save from TS, load in Java Blue (requires Java Blue available) in `packages/blue-data/tests/integration/java-compatibility.test.ts`
- [ ] T069 [US2] ObjRefMap test: shared object references preserved on round-trip in `packages/blue-data/tests/integration/objref-roundtrip.test.ts`

### Implementation — Complete XML Serialization

- [ ] T070 [P] [US2] Implement `ProjectProperties.saveAsXML()` / `loadFromXML()`
- [ ] T071 [P] [US2] Implement `Instrument.saveAsXML()` / `loadFromXML()`
- [ ] T072 [P] [US2] Implement `InstrumentAssignment.saveAsXML()` / `loadFromXML()`
- [ ] T073 [P] [US2] Implement `InstrumentLibrary.saveAsXML()` / `loadFromXML()`
- [ ] T074 [US2] Implement `Arrangement.saveAsXML()` / `loadFromXML()` (including legacy pre-0.95.0 format with embedded instrument libraries)
- [ ] T075 [US2] Implement `Tables.saveAsXML()` / `loadFromXML()`
- [ ] T076 [US2] Implement `GlobalOrcSco.saveAsXML()` / `loadFromXML()`
- [ ] T077 [US2] Implement `GenericScore.saveAsXML()` / `loadFromXML()`
- [ ] T078 [US2] Implement `PolyObject.saveAsXML()` / `loadFromXML()` with SoundLayer children
- [ ] T079 [US2] Implement `Score.saveAsXML()` / `loadFromXML()` with layer groups
- [ ] T080 [US2] Implement `BlueData.saveAsXML()` / `loadFromXML()` — full root serialization with version attribute

### Implementation — ObjRefMap Integration

- [ ] T081 [US2] Wire objRefMap through all `saveAsXML()` and `loadFromXML()` methods that use shared references
- [ ] T082 [US2] Implement `BlueDataObjectManager` in `packages/blue-data/src/blue-data-object-manager.ts` (plugin data loading)

**Checkpoint**: User Stories 1 AND 2 both work — full round-trip data integrity verified.

---

## Phase 5: User Story 3 — Audio Layers (Priority: P2)

**Goal**: Load, display, edit, and generate CSD for audio layers with clips.

**Independent Test**: Load `.blue` file with audio layers, verify all clip properties, modify a clip, save, regenerate CSD with correct diskin2 score events.

### Tests for User Story 3

- [ ] T083 [P] [US3] Round-trip test: audio layer with clips in `packages/blue-data/tests/integration/audio-layer-roundtrip.test.ts`
- [ ] T084 [US3] CSD generation test: diskin2 score events with fade params in `packages/blue-data/tests/integration/audio-csd-gen.test.ts`

### Implementation — Audio Score Layers

- [ ] T085 [P] [US3] Implement `FadeType` enum in `packages/blue-data/src/score/audio/fade-type.ts`
- [ ] T086 [P] [US3] Implement `AudioClip` in `packages/blue-data/src/score/audio/audio-clip.ts` (file path, start time, duration, fades, looping, load/save XML)
- [ ] T087 [US3] Implement `AudioLayer` in `packages/blue-data/src/score/audio/audio-layer.ts` (ScoreObjectLayer<AudioClip>, AutomatableLayer, `generateForCSD()` → diskin2 notes)
- [ ] T088 [US3] Implement `AudioLayerGroup` in `packages/blue-data/src/score/audio/audio-layer-group.ts` (ScoreObjectLayerGroup<AudioLayer>, `generateForCSD()`)
- [ ] T089 [US3] Implement `AudioLayerGroupProvider` in `packages/blue-data/src/score/audio/audio-layer-group-provider.ts`
- [ ] T090 [US3] Embed `playback_instrument.orc` as template string in `packages/blue-data/src/score/audio/playback-instrument.orc.ts`
- [ ] T091 [US3] Embed `blue_fade.udo` as template string in `packages/blue-data/src/score/audio/blue-fade.udo.ts`
- [ ] T092 [US3] Wire `LayerGroupProviderManager` to register AudioLayerGroupProvider

### Implementation — CSD Generation for Audio

- [ ] T093 [US3] Update `BlueData.toCSD()` to handle AudioLayerGroup: generate instrument from template, generate diskin2 score events with p-fields for file path, start time, duration, fades, looping
- [ ] T094 [US3] Implement mixer channel assignment for audio layers in CSD generation
- [ ] T095 [US3] Implement `blueMixerOut` → `outc` conversion in Arrangement CSD generation

**Checkpoint**: User Story 3 complete — audio layers with clips load, save, and generate correct CSD.

---

## Phase 6: User Story 4 — Pattern Layers (Priority: P2)

**Goal**: Load, display, edit, and generate CSD for pattern layers.

**Independent Test**: Load `.blue` file with pattern layers, verify pattern grids, toggle cells, save, verify CSD repeats sound objects at pattern positions.

### Tests for User Story 4

- [x] T096 [P] [US4] Round-trip test: pattern layer with grid in `packages/blue-data/tests/integration/pattern-layer-roundtrip.test.ts`
- [x] T097 [US4] CSD generation test: pattern-based repetition in `packages/blue-data/tests/integration/pattern-csd-gen.test.ts`

### Implementation — Pattern Score Layers

- [x] T098 [P] [US4] Implement `PatternData` in `packages/blue-data/src/score/patterns/pattern-data.ts` (boolean array, block size 16, auto-resize)
- [x] T099 [US4] Implement `PatternLayer` in `packages/blue-data/src/score/patterns/pattern-layer.ts` (Layer, holds SoundObject + PatternData, `generateForCSD()`)
- [x] T100 [US4] Implement `PatternsLayerGroup` in `packages/blue-data/src/score/patterns/patterns-layer-group.ts` (LayerGroup<PatternLayer>, patternBeatsLength, NoteProcessorChain)
- [x] T101 [US4] Implement `PatternsLayerGroupProvider` in `packages/blue-data/src/score/patterns/patterns-layer-group-provider.ts`
- [x] T102 [US4] Wire `LayerGroupProviderManager` to register PatternsLayerGroupProvider

### Implementation — CSD Generation for Patterns

- [x] T103 [US4] Update `BlueData.toCSD()` to handle PatternsLayerGroup: repeat sound object at pattern positions
- [x] T104 [US4] Wire Score's layer group iteration to include pattern layers

**Checkpoint**: User Story 4 complete — pattern layers load, save, and generate correct CSD.

---

## Phase 7: User Story 5 — Node.js Library Usage (Priority: P3)

**Goal**: Use `@blue/data` from a standalone Node.js script for programmatic access.

**Independent Test**: Write a Node.js script that imports `@blue/data`, loads a `.blue` file, inspects data, exports JSON.

### Tests for User Story 5

- [x] T105 [US5] Integration test: Node.js script loads `.blue` file, outputs JSON summary in `packages/blue-data/tests/integration/node-api-usage.test.ts`

### Implementation — Package Polish

- [x] T106 [US5] Ensure `@blue/data` package.json has correct `exports` field for both ESM and CommonJS
- [x] T107 [US5] Add `index.ts` re-exports for all public types in `packages/blue-data/src/index.ts`
- [x] T108 [US5] Verify no Node.js built-in imports in `blue-data` (lint rule or manual audit)

**Checkpoint**: User Story 5 complete — `@blue/data` works as a standalone Node.js library.

---

## Phase 8: User Story 6 — Python/Clojure SoundObjects (Priority: P3)

**Goal**: Load/save `.blue` files with JVM-dependent sound objects. Generate CSD via Java subprocess in Node.js.

**Independent Test**: Load `.blue` file with `PythonObject`, verify code preserved, save, verify Java Blue loads it. In Node.js, generate CSD with Java subprocess.

### Tests for User Story 6

- [x] T109 [P] [US6] Round-trip test: PythonObject preserved in `packages/blue-data/tests/integration/python-object-roundtrip.test.ts`
- [x] T110 [US6] Node.js CSD generation test: Java subprocess generates notes in `packages/blue-data/tests/integration/python-csd-gen.test.ts` (skip if Java not available)

### Implementation — JVM-Dependent SoundObjects

- [x] T111 [P] [US6] Implement `PythonObject` in `packages/blue-data/src/sound-objects/python-object.ts` (data: `pythonCode`, load/save XML; generation: skip in browser, Java subprocess in Node)
- [x] T112 [US6] Implement `JavaScriptObject` in `packages/blue-data/src/sound-objects/javascript-object.ts` (data: `javaScriptCode`; generation: `vm.runInNewContext()` in Node, `new Function()` in browser)
- [x] T113 [US6] Implement Java subprocess protocol for PythonObject/ClojureObject CSD generation (JSON in → note text out)
- [x] T114 [US6] Implement `ClojureProjectData` and `ClojureLibraryEntry` preservation types in `packages/blue-data/src/plugins/` (opaque XML preservation)

### Implementation — Remaining SoundObject Types

- [x] T115 [P] [US6] Implement remaining SoundObject types: `CSDSoundObject`, `AudioFile`, `Sound`, `Comment`, `External`, `LineObject`, `ZakLineObject`, `PatternObject`, `PianoRoll`, `NotationObject`, `JMask`, `Instance`, `TrackerObject`, `FrozenSoundObject` (each: load/save XML, `generateForCSD()`)
- [x] T116 [US6] Implement `ObjectBuilder` and `ObjectBuilderRegistry` in `packages/blue-data/src/sound-objects/`
- [x] T117 [US6] Implement `SoundObjectLibrary` in `packages/blue-data/src/sound-objects/sound-object-library.ts`
- [x] T118 [US6] Register all SoundObject types in a central registry for XML deserialization dispatch

**Checkpoint**: User Story 6 complete — all SoundObject types preserved on load/save, Python/Clojure generation works in Node.

---

## Phase 9: Remaining Data Types (Completeness)

**Goal**: Port all remaining data classes from the Java codebase that aren't covered by user stories above.

### Mixer System

- [x] T119 [P] Implement `Mixer` in `packages/blue-data/src/mixer/mixer.ts`
- [x] T120 [P] Implement `Channel` in `packages/blue-data/src/mixer/channel.ts`
- [x] T121 [P] Implement `ChannelList` in `packages/blue-data/src/mixer/channel-list.ts`
- [x] T122 [P] Implement `Effect` in `packages/blue-data/src/mixer/effect.ts`
- [x] T123 [P] Implement `EffectManager` in `packages/blue-data/src/mixer/effect-manager.ts`
- [x] T124 [P] Implement `EffectsChain` in `packages/blue-data/src/mixer/effects-chain.ts`
- [x] T125 [P] Implement `Send` in `packages/blue-data/src/mixer/send.ts`
- [x] T126 Implement `MixerNode` in `packages/blue-data/src/mixer/mixer-node.ts`
- [x] T127 Wire Mixer saveAsXML/loadFromXML

### Automation System

- [x] T128 [P] Implement `Parameter` in `packages/blue-data/src/automation/parameter.ts`
- [x] T129 [P] Implement `ParameterList` in `packages/blue-data/src/automation/parameter-list.ts`
- [x] T130 [P] Implement `ParameterIdList` in `packages/blue-data/src/automation/parameter-id-list.ts`
- [x] T131 [P] Implement `ParameterNameManager` in `packages/blue-data/src/automation/parameter-name-manager.ts`
- [x] T132 [P] Implement `ParameterTimeManager` in `packages/blue-data/src/automation/parameter-time-manager.ts`
- [x] T133 [P] Implement `Automatable` in `packages/blue-data/src/automation/automatable.ts`
- [x] T134 [P] Implement `AutomatableCollectionListener` in `packages/blue-data/src/automation/`
- [x] T135 [P] Implement `LineColors` in `packages/blue-data/src/automation/line-colors.ts`

### Note Processors

- [x] T136 [P] Implement remaining note processors in `packages/blue-data/src/note-processors/`: AddProcessor, MultiplyProcessor, RandomAddProcessor, RandomMultiplyProcessor, LineAddProcessor, LineMultiplyProcessor, PchAddProcessor, PchInversionProcessor, InversionProcessor, RetrogradeProcessor, RotateProcessor, TimeWarpProcessor, TuningProcessor, SwitchProcessor, SubListProcessor, EqualsProcessor, Code, ValueTimeMapper, PythonProcessor (data only)
- [x] T137 Implement `NoteProcessorChainMap` in `packages/blue-data/src/note-processors/note-processor-chain-map.ts`

### Live Data, MIDI, Markers

- [x] T138 [P] Implement `LiveData` in `packages/blue-data/src/live-data.ts`
- [x] T139 [P] Implement Live types in `packages/blue-data/src/live/`: LiveObject, LiveObjectSet, LiveObjectBins, LiveObjectSetList
- [x] T140 [P] Implement `MidiInputProcessor` in `packages/blue-data/src/midi/midi-input-processor.ts`
- [x] T141 [P] Implement MIDI mapping types in `packages/blue-data/src/midi/`: MidiKeyMapping, MidiVelocityMapping
- [x] T142 [P] Implement `MarkersList` in `packages/blue-data/src/markers-list.ts`
- [x] T143 [P] Implement `ScratchPadData` in `packages/blue-data/src/scratch-pad-data.ts`

### Opcode List

- [x] T144 [P] Implement `OpcodeList` and `OpcodeDefinition` in `packages/blue-data/src/opcodes/`

### Utilities

- [x] T145 [P] Implement `ScoreUtilities` in `packages/blue-data/src/utilities/score.ts`
- [x] T146 [P] Implement `UDOUtilities` in `packages/blue-data/src/utilities/udo.ts`
- [x] T147 [P] Implement `ObjectUtilities` in `packages/blue-data/src/utilities/object.ts`
- [x] T148 [P] Implement `ScoreExpressionParser` in `packages/blue-data/src/utilities/expression-parser.ts`

### Engine Client — Automation

- [x] T149 Implement automation ZMQ commands in `EngineClient`: createAutomation, updateAutomation, deleteAutomation, enableAutomation, disableAutomation, listAutomation, clearAutomation
- [x] T150 Implement automation curve types in `packages/blue-engine-client/src/automation.ts`

**Checkpoint**: All 85+ data classes ported. Complete data model parity with Java Blue.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T151 [P] Comprehensive documentation: JSDoc comments on all public API types
- [x] T152 Full round-trip test suite: load all example `.blue` files from Java Blue, save, reload, verify
- [x] T153 [P] Performance benchmarks: measure load time for 5MB `.blue` file, CSD generation time
- [x] T154 Electron app: file save dialog, error handling, engine crash recovery
- [x] T155 [P] Quickstart guide in `packages/blue-data/README.md`
- [x] T156 Lint pass: enforce no Node.js built-ins in `blue-data`
- [x] T157 CI setup: build + test on push

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **User Stories (Phases 3-8)**: All depend on Foundational completion
  - User stories can proceed in parallel (if staffed) or sequentially (P1 → P2 → P3)
- **Remaining Data Types (Phase 9)**: Depends on Foundational, can overlap with user stories
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no dependencies on other stories. **This is the MVP.**
- **US2 (P1)**: After Foundational — depends on US1's serialization infrastructure but independently testable
- **US3 (P2)**: After Foundational — audio layers are independent of pattern layers
- **US4 (P2)**: After Foundational — pattern layers are independent of audio layers
- **US5 (P3)**: After Foundational — package polish, no UI dependency
- **US6 (P3)**: After Foundational — JVM-dependent types, independent of other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel
- Within a user story, model types marked [P] can run in parallel
- Different user stories can be worked on in parallel by different developers

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Open a simple `.blue` file, press Play, hear audio
5. Commit and tag as `mvp-alpha`

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (open + play) → Test → **MVP!**
3. Add US2 (round-trip save) → Test → Data integrity verified
4. Add US3 (audio layers) → Test → Audio clip support
5. Add US4 (pattern layers) → Test → Pattern sequencer support
6. Add US5 (Node.js library) → Test → Library usability
7. Add US6 (Python/Clojure) → Test → Full project compatibility
8. Phase 9 (remaining types) → Full data model completeness
9. Phase 10 (polish) → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Total: ~157 tasks** across 10 phases
