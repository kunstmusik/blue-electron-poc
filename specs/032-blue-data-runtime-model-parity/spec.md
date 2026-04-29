# Feature Specification: Blue Data Runtime Model Parity for Instruments, BSB, Mixer, Automation, and Time

**Feature Branch**: `032-blue-data-runtime-model-parity`  
**Created**: 2026-04-29  
**Status**: Draft  
**Input**: User description: "Review DATA_COMPATABILITY_REPORT.md and use spec-kit process to plan out spec. If multiple specs are appropriate, use spec kit to create the different plans. We'll do task planning and implementation one at a time per spec afterwards."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Instrument Text the Same Way Java Blue Does (Priority: P1)

As a composer using BlueSynthBuilder, project UDOs, or generated instruments, I need TypeScript instrument generation to honor Java's value replacement, always-on text, UDO handling, and preservation rules so generated orchestra text stays compatible.

**Why this priority**: Instrument-generation differences break rendered orchestra output even when the rest of the project model loads correctly.

**Independent Test**: Compare Java and TypeScript generation for representative BSB, generic, JavaScript, Python, and preservation-sensitive instrument cases, including global orchestra/score and always-on output.

**Acceptance Scenarios**:

1. **Given** a project uses BlueSynthBuilder value replacement and always-on behavior, **When** TypeScript generates instrument-related output, **Then** the generated text matches Java semantics.
2. **Given** a project depends on project UDO renaming or instrument-level UDO integration, **When** TypeScript generates instrument output, **Then** Java-compatible UDO references are produced.

---

### User Story 2 - Preserve Mixer and Effect Behavior Across Save and Render (Priority: P1)

As a composer using mixer channels, effects, sends, and subchannels, I need TypeScript to load, save, and generate mixer-related content the same way Java Blue does so routing and effect behavior survive migration.

**Why this priority**: The mixer is part of both project XML and generated output, and current TypeScript behavior diverges in defaults, XML, and dependency handling.

**Independent Test**: Load representative mixer-heavy projects, save them from TypeScript, reopen them in Java Blue, and compare generated mixer-related output between Java and TypeScript.

**Acceptance Scenarios**:

1. **Given** a project contains mixer channels, subchannels, master channel data, and extra render time, **When** TypeScript loads and saves it, **Then** the mixer XML remains Java-compatible.
2. **Given** a project depends on subchannel routing or effect UDOs, **When** TypeScript generates mixer-related output, **Then** the result matches Java routing and dependency semantics.

---

### User Story 3 - Restore Java Time and Automation Model Semantics (Priority: P2)

As a composer using tempo maps, automation, and time conversions, I need TypeScript time and automation models to match Java defaults and calculations so editor behavior and generated output stay consistent.

**Why this priority**: Time-system and automation differences create subtle but wide-ranging mismatches across editing and rendering.

**Independent Test**: Compare Java and TypeScript behavior for time defaults, tempo-map ordering, BBST conversions, automation line behavior, and parameter serialization.

**Acceptance Scenarios**:

1. **Given** a project uses tempo maps, SMPTE settings, and measure-meter metadata, **When** TypeScript loads and manipulates those values, **Then** the resulting state matches Java semantics.
2. **Given** a project uses parameter automation or line-based modulation, **When** TypeScript serializes and renders that state, **Then** the automation model matches Java behavior.

### Edge Cases

- What happens when JVM-backed instruments or processors must be preserved on load/save but cannot yet execute natively in TypeScript?
- How should missing `presetGroup`, `gridSettings`, or parameter-list variants in BSB XML be normalized?
- What happens when mixer XML uses master-channel or channel-list-group structures that TypeScript currently omits on save?
- How should time conversion behave when tempo points are inserted out of order or BBST values depend on non-default beat scales?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review Java BlueSynthBuilder, GenericInstrument, JavaScriptInstrument, PythonInstrument, BlueX7, mixer, effect, parameter, line, tempo-map, and time-context classes before coding starts.
- **FR-002**: BlueSynthBuilder MUST apply Java-compatible value replacement for generated instrument text, global orchestra text, global score text, and always-on text.
- **FR-003**: BlueSynthBuilder MUST restore Java-compatible always-on and ftable generation behavior.
- **FR-004**: BlueSynthBuilder XML load MUST accept the Java parameter-list variants and normalize missing preset/grid defaults compatibly.
- **FR-005**: GenericInstrument MUST restore Java-compatible UDO reference replacement behavior.
- **FR-006**: JVM-dependent instrument types and preservation-sensitive instruments such as JavaScript, Python, BlueX7, and other deferred Java models MUST either execute compatibly or preserve their data without silent loss, consistent with the project constitution.
- **FR-007**: Mixer load, save, defaults, and generated output MUST match Java-compatible channel, subchannel, master-channel, extra-render-time, and dependency semantics.
- **FR-008**: Effect, channel, and send models MUST preserve Java-compatible XML and generated behavior for the in-scope mixer pipeline.
- **FR-009**: Parameter and automation models MUST restore Java-compatible line-based behavior rather than simplified point-only behavior where compatibility requires it.
- **FR-010**: TimeContext, TempoMap, TimeState, MeasureMeterPair, and related conversion helpers MUST match Java defaults and calculations, including SMPTE defaults, sorting behavior, and BBST conversions.
- **FR-011**: The implementation MUST add round-trip and behavior tests for representative BSB, mixer, automation, and time fixtures.

### Key Entities *(include if feature involves data)*

- **BSB Compilation Unit**: Instrument-related generated text plus parameter substitution, presets, always-on content, and ftables.
- **Runtime Instrument Variant**: Instrument model whose generated output or preservation behavior must match Java compatibility rules.
- **Mixer Graph**: Mixer channels, subchannels, sends, effects, master channel, dependencies, and extra render time.
- **Automation Line Model**: Time-based parameter automation and line semantics used across parameters and line-oriented processors.
- **Time Context State**: Tempo-map, SMPTE, measure-meter, and project-property-linked time conversion state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Representative Java and TypeScript BSB or instrument fixtures produce matching generated orchestra text for the in-scope cases.
- **SC-002**: A reviewer can load and resave a mixer-heavy Java project and reopen it in Java Blue without losing mixer structure.
- **SC-003**: A reviewer can compare Java and TypeScript behavior for representative tempo-map, BBST, and automation fixtures and observe matching results.
- **SC-004**: Preservation-sensitive runtime models do not silently lose data even when full execution remains deferred.
- **SC-005**: Automated tests cover BSB defaults and generation, mixer XML and dependencies, and the time/automation calculations identified in the compatibility report.

## Assumptions

- Earlier specs will have restored enough XML, score, and render infrastructure that this slice can focus on the remaining runtime-oriented models.
- Constitution rules about JVM-dependent behavior still apply; data preservation is mandatory even where native execution stays deferred.
- UI parity for editor widgets is out of scope unless it directly affects data compatibility or generated output.
