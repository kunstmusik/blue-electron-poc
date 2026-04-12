# Feature Specification: Complete Blue Data Model + Electron App + Engine Integration

**Feature Branch**: `002-complete-blue-data`
**Created**: 2026-04-11
**Status**: Draft
**Input**: Follow-up to `001-blue-data-port` (157/157 tasks complete)

## Background

The `@blue/data` package from Phase 1-10 provides the core data model with XML serialization compatible with Java Blue. All foundational types are complete: Score, AudioLayers, PatternLayers, Mixer, Automation, and the primary SoundObject types (GenericScore, PythonObject, JavaScriptObject, CSDSoundObject, Comment).

This feature completes three remaining areas:
1. **Missing SoundObject and NoteProcessor types** — 12 SoundObject types, ~15 NoteProcessor types, and BlueSynthBuilder (BSB) data types
2. **Electron application** — Desktop app for opening `.blue` files and playing them
3. **Engine client** — ZeroMQ client for the C++ blue-engine process with full playback

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Load Any .blue File Without Data Loss (Priority: P1)

A user opens any existing `.blue` project file from the Java Blue application. All data is loaded correctly — including audio clips, pattern sequencer data, instrument definitions, mixer settings, automation curves, and all SoundObject types. The project displays correctly in the app. The user can save the file and reopen it with no data loss.

**Why this priority:** If the app can't load a real project file from the user's library, nothing else matters. Complete data model coverage is the foundation.

**Independent Test**: Load a collection of real `.blue` files from the user's Java Blue project library, verify all data loads without errors or warnings, save and reload with identical content.

**Acceptance Scenarios**:
1. **Given** a `.blue` file created in Java Blue containing AudioFile, PianoRoll, and LineObject sound objects, **When** the app loads it, **Then** all sound objects are deserialized correctly with no unknown type warnings
2. **Given** a project with complex NoteProcessor chains, **When** loaded, **Then** all processors are preserved and their parameters are intact
3. **Given** a project with BlueSynthBuilder instruments, **When** loaded, **Then** BSB data is preserved and CSD generation produces correct orchestra code

---

### User Story 2 — Open, View, and Play a .blue Project (Priority: P1)

A user opens the Electron app, selects a `.blue` file, and sees the project's structure displayed (score layers, audio clips, pattern grids, instruments, mixer). The user then hits Play, which compiles the project to CSD, launches the blue-engine C++ process, and begins audio playback. The user can stop playback at any time. Project metadata, errors, and status are visible.

**Why this priority:** This is the MVP — the single end-to-end flow that proves the entire stack works. Without this, there's no usable application.

**Independent Test**: Can be fully tested by opening a simple `.blue` file, verifying its structure is displayed, pressing Play, hearing Csound audio output, and pressing Stop to halt playback.

**Acceptance Scenarios**:
1. **Given** the app is running, **When** the user opens a `.blue` file, **Then** the project structure is displayed with score layers, instruments, and mixer visible
2. **Given** a project is loaded, **When** the user presses Play, **Then** audio begins playing through the system output within 2 seconds
3. **Given** a project is playing, **When** the user presses Stop, **Then** audio playback ceases and the engine process is cleanly terminated
4. **Given** the engine crashes during playback, **When** it exits unexpectedly, **Then** the app shows an error and allows restart

---

### User Story 3 — Engine Client Communication (Priority: P2)

The app communicates with the blue-engine C++ process via ZeroMQ REQ/REP. The engine is spawned, initialized with CSD orchestra/score, and controlled (start, stop, pause). Channel values and automation curves can be sent to the engine during playback for real-time parameter control.

**Why this priority:** Required for actual audio playback and real-time control. Without this, the Play button does nothing.

**Independent Test**: Can be tested by starting a `.blue` project with a simple GenericScore, pressing Play, and verifying audio output from the blue-engine process.

**Acceptance Scenarios**:
1. **Given** a CSD is generated from a project, **When** sent to blue-engine via ZMQ, **Then** the engine responds with success and begins audio output
2. **Given** the engine is playing, **When** a channel value is changed, **Then** the change takes effect in the running audio
3. **Given** the engine is playing, **When** an automation curve is created, **Then** the engine interpolates parameter values per k-cycle

---

### User Story 4 — BlueSynthBuilder Instruments Generate Correct CSD (Priority: P2)

A user opens a `.blue` file containing BlueSynthBuilder (BSB) instruments. The BSB data is loaded correctly, and during CSD generation, the BSB instrument produces the correct Csound orchestra code with parameter mappings.

**Why this priority:** BSB is a major Blue feature — many projects use it. Without BSB support, a significant portion of the user's project library is incomplete.

**Independent Test**: Load a `.blue` file with BSB instruments, verify CSD generation includes the correct orchestra code with BSB parameters mapped to p-fields.

**Acceptance Scenarios**:
1. **Given** a project with a BSB oscillator instrument, **When** CSD is generated, **Then** the oscillator orchestra code with correct parameters appears in the CSD
2. **Given** a BSB instrument with multiple components, **When** CSD is generated, **Then** all component code is assembled correctly

---

### Edge Cases

- **What happens when a `.blue` file contains an unknown SoundObject type?** — The XML node is preserved as opaque data on save. On load, a warning is logged and the object is stored as a generic placeholder.
- **What happens when the blue-engine process is not found?** — The app shows an error message with instructions to install/configure the engine path.
- **How does the app handle very large projects (1000+ clips)?** — Performance target: load a 5MB `.blue` file in under 3 seconds, generate CSD in under 5 seconds.
- **What happens when a SoundObject's audio file is missing?** — The data loads fine. CSD generation warns about missing files but still produces the CSD (Csound handles the missing file at runtime).

## Requirements *(mandatory)*

### Functional Requirements

#### Phase 11: SoundObjects, NoteProcessors, BSB
- **FR-201**: System MUST implement all 12 remaining SoundObject types: AudioFile, Sound, External, LineObject, ZakLineObject, PatternObject, PianoRoll, NotationObject, JMask, Instance, TrackerObject, FrozenSoundObject
- **FR-202**: Each SoundObject MUST implement `loadFromXML()`, `saveAsXML()`, `generateForCSD()`, and `deepCopy()`
- **FR-203**: System MUST implement all ~15 remaining NoteProcessor types with correct note transformation logic
- **FR-204**: System MUST implement BSB data types (BSBObject, BSBComponent, BSBParameter, etc.) with XML serialization
- **FR-205**: BSB CSD generation MUST produce correct Csound orchestra code with parameter-to-p-field mappings
- **FR-206**: All new types MUST be registered in the SoundObjectRegistry for XML deserialization dispatch

#### Phase 12: Electron Application
- **FR-207**: Electron app MUST present a file open dialog for `.blue` files
- **FR-208**: Electron app MUST display loaded project structure (score layers, instruments, mixer)
- **FR-209**: Electron app MUST provide Play and Stop buttons that control the blue-engine process
- **FR-210**: Electron app MUST display playback status (playing, stopped, error)
- **FR-211**: Electron app MUST handle engine process crashes gracefully
- **FR-212**: Electron app MUST support save and save-as functionality

#### Phase 13: Engine Client Integration
- **FR-213**: System MUST spawn and manage the blue-engine C++ process as a child process
- **FR-214**: System MUST communicate with blue-engine via ZeroMQ REQ/REP binary protocol
- **FR-215**: System MUST support channel operations (CREATE_CHANNEL, SET_CHANNEL, GET_CHANNEL)
- **FR-216**: System MUST support automation operations (CREATE, UPDATE, DELETE, ENABLE, DISABLE, LIST, CLEAR)
- **FR-217**: System MUST handle engine process crashes — detect exit, clean up ZMQ socket, notify UI
- **FR-218**: Engine client MUST be wired into the Electron app's Play/Stop controls

### Key Entities *(include if feature involves data)*

- **SoundObject** (12 new types): Each extends AbstractSoundObject with type-specific `generateForCSD()` logic
- **NoteProcessor** (~15 new types): Each extends NoteProcessor with type-specific `process()` logic
- **BSBObject**: BlueSynthBuilder instrument with components, parameters, and CSD code generation
- **EngineClient**: ZMQ REQ/REP client with binary protocol for blue-engine communication
- **EngineBridge**: Electron main process bridge between renderer IPC and engine-client

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-101**: Any `.blue` file created in Java Blue 2.0.0+ loads without errors or unknown type warnings
- **SC-102**: A `.blue` file with BSB instruments generates correct CSD orchestra code
- **SC-103**: Opening a `.blue` file and pressing Play produces audio output within 2 seconds
- **SC-104**: The Electron app handles engine crashes without crashing itself
- **SC-105**: Load time for a 5MB `.blue` file is under 3 seconds
- **SC-106**: All ~180 existing tests continue to pass after new types are added
- **SC-107**: All new SoundObject and NoteProcessor types have round-trip XML serialization tests

## Assumptions

- The blue-engine C++ executable is pre-installed and accessible on the user's system
- Csound 7 is installed and discoverable by the blue-engine
- The existing `@blue/data` package (from Phase 1-10) is the foundation — no changes to completed types needed
- BSB CSD generation logic follows the same patterns as the Java implementation (templates + parameter substitution)
- The Electron app targets macOS first (the developer's platform), with Windows/Linux as future targets
- MIDI input is out of scope for these phases (preserved on load/save but not live input)
