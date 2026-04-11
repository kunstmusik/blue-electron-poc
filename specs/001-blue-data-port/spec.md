# Feature Specification: Blue Java Data Classes Port to TypeScript

**Feature Branch**: `001-blue-data-port`
**Created**: 2026-04-11
**Status**: Draft
**Input**: User description: Port Blue Java data classes and business logic to TypeScript with Electron app for loading .blue files and playing via blue-engine

## Background

Blue is a Csound composition environment built on the NetBeans Rich Client Platform in Java. It manages complex music composition projects (`.blue` files) containing scores, instruments, mixers, automation, and audio clips, then compiles them into CSD (Csound Document) files for audio rendering.

This feature ports the **entire data model and business logic** to TypeScript as a standalone, environment-agnostic package (`@blue/data`), builds a TypeScript client for the existing C++ blue-engine process (`@blue/engine-client`), and wraps it in a minimal Electron app (`@blue/app`) that can open `.blue` project files and play them.

The data layer must work in both browser and Node.js, enabling future web-based applications that reuse the data model without the Electron shell.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open and Play a .blue Project (Priority: P1)

A user opens the Electron app, selects an existing `.blue` project file from their filesystem, and the app loads, parses, and displays the project's metadata (title, author, score structure). The user then hits a "Play" button, which compiles the project data into a CSD, launches the blue-engine C++ process, sends the CSD via ZeroMQ, and begins audio playback. The user can stop playback at any time.

**Why this priority**: This is the core MVP — the single end-to-end flow that proves the entire stack works. Without this, nothing else matters.

**Independent Test**: Can be fully tested by opening a simple `.blue` file (containing GenericScore sound objects), pressing Play, and hearing Csound audio output. Delivers the fundamental value proposition: existing Blue projects run in the new app.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** the user opens a valid `.blue` file, **Then** the project data is loaded and displayed, including score structure, instruments, and mixer channels
2. **Given** a project is loaded, **When** the user presses Play, **Then** audio begins playing through the system audio output
3. **Given** a project is playing, **When** the user presses Stop, **Then** audio playback ceases and the engine process is cleanly terminated
4. **Given** the user opens a `.blue` file from an older version of Blue, **Then** the migration system automatically upgrades the data before loading

---

### User Story 2 - Round-Trip Save and Reload (Priority: P1)

A user opens a `.blue` project, makes changes (e.g., edits a score, modifies project properties), saves the file, and reopens it. The reloaded file is identical in content to the saved state. The saved file is also loadable by the original Java Blue application.

**Why this priority**: Data integrity is non-negotiable. If the TypeScript app corrupts or loses data on save, it's not a viable port. Bi-directional compatibility with Java Blue is required for migration.

**Independent Test**: Can be fully tested by loading a `.blue` file, calling `saveToString()`, parsing the output, and verifying every field matches the original. Additionally, opening the saved file in Java Blue must produce identical project state.

**Acceptance Scenarios**:

1. **Given** a `.blue` file is loaded, **When** the user saves and reloads, **Then** all data is preserved exactly
2. **Given** a `.blue` file is saved by the TypeScript app, **When** opened in the Java Blue app, **Then** the project loads with all data intact
3. **Given** a project contains shared object references (via objRefMap), **When** saved and reloaded, **Then** all cross-references resolve correctly

---

### User Story 3 - View and Edit Score with Audio Layers (Priority: P2)

A user opens a `.blue` project that contains audio layers (audio clips on a timeline). The app displays the audio clips with their properties (file path, start time, duration, fades, looping). The user can edit clip properties and the changes are reflected in the saved file.

**Why this priority**: Audio layers are one of the three main score layer types (along with pattern layers and the default PolyObject). Many Blue projects use audio clips for composition with prerecorded audio files.

**Independent Test**: Can be fully tested by loading a `.blue` file with audio layers, verifying all clip properties deserialize correctly, modifying a property, saving, and confirming the change persists.

**Acceptance Scenarios**:

1. **Given** a `.blue` file with audio layers is loaded, **When** the app displays the score, **Then** all audio clips show correct file paths, start times, durations, and fade settings
2. **Given** an audio clip is loaded, **When** the user changes its fade-in type, **Then** the change is saved correctly
3. **Given** an audio clip references an audio file, **When** the CSD is generated, **Then** the correct `diskin2`-based score events are produced with fade parameters

---

### User Story 4 - View and Edit Score with Pattern Layers (Priority: P2)

A user opens a `.blue` project that contains pattern layers. The app displays the pattern grids (boolean arrays), the sound object each pattern repeats, and the pattern beat length. The user can toggle pattern cells and the changes affect score generation.

**Why this priority**: Pattern layers are the second main score layer type, enabling rhythmic/sequencer-style composition. Projects using pattern layers depend on correct pattern-to-score expansion.

**Independent Test**: Can be fully tested by loading a `.blue` file with pattern layers, verifying pattern data deserializes correctly, toggling cells, and confirming the generated CSD repeats the sound object at correct positions.

**Acceptance Scenarios**:

1. **Given** a `.blue` file with pattern layers is loaded, **When** the app displays the score, **Then** pattern grids show correct on/off states for each cell
2. **Given** a pattern layer is loaded, **When** the CSD is generated, **Then** the contained sound object is repeated at positions matching the pattern grid
3. **Given** a user toggles a pattern cell, **When** the project is saved and regenerated, **Then** the pattern change is reflected in the output

---

### User Story 5 - Use the Data Library from Node.js Scripts (Priority: P3)

A developer writes a Node.js script that imports `@blue/data`, loads a `.blue` project file, inspects its data structure programmatically (e.g., lists all instruments, extracts score text, counts audio clips), and exports a summary as JSON.

**Why this priority**: This validates that `blue-data` is truly environment-agnostic and usable as a library — not just tied to the Electron app. It enables scripting, batch processing, and headless CSD generation pipelines.

**Independent Test**: Can be fully tested by writing a standalone Node.js script that imports `@blue/data`, loads a `.blue` file, and outputs JSON. No Electron or UI required.

**Acceptance Scenarios**:

1. **Given** a Node.js script imports `@blue/data`, **When** it calls `BlueData.loadFromString()`, **Then** the project data is accessible as TypeScript objects
2. **Given** a project is loaded in Node.js, **When** the script calls `blueData.saveToString()`, **Then** valid `.blue` XML is produced

---

### User Story 6 - Open a Project with Python/Clojure SoundObjects (Priority: P3)

A user opens a `.blue` project that contains `PythonObject` or `ClojureObject` sound objects. The app loads and displays the project, including the embedded Python/Clojure code. When generating CSD output, these objects are handled appropriately for the environment.

**Why this priority**: Some advanced Blue projects use JVM-language sound objects. The data must load/save correctly even if generation is limited.

**Independent Test**: Can be fully tested by loading a `.blue` file with `PythonObject`/`ClojureObject`, verifying the code strings are preserved, and saving produces a valid file. In Node, CSD generation uses a Java subprocess.

**Acceptance Scenarios**:

1. **Given** a `.blue` file with PythonObject sound objects is loaded, **When** the app displays the score, **Then** the Python code is preserved and visible
2. **Given** a project with PythonObject is saved, **When** opened in Java Blue, **Then** the PythonObject loads correctly
3. **Given** a project with PythonObject is loaded in Node.js, **When** CSD is generated, **Then** the Java subprocess produces the correct note output
4. **Given** a project with PythonObject is loaded in browser, **When** CSD is generated, **Then** a warning is shown and the object is skipped

---

### Edge Cases

- **What happens when a `.blue` file is from a version older than any known migrator?** — The system loads with version `0.0.0` and applies all known upgrades, treating the file as maximally old.
- **How does the system handle a `.blue` file with malformed XML?** — Parse error with clear message about line/column. No partial data is returned.
- **What happens when the blue-engine process crashes during playback?** — The Electron app detects the process exit, stops the UI, and shows an error. ZMQ socket is cleaned up.
- **How does the system handle audio files that no longer exist on disk?** — `AudioClip` stores the path as a string. The data loads fine. CSD generation warns about missing files but still produces the CSD (Csound will handle the missing file error at runtime).
- **What happens when a `.blue` file contains an unknown SoundObject type?** — The XML node is preserved as opaque data on save. On load, a warning is logged and the object is stored as a generic placeholder.
- **How does the system handle very large projects (100+ instruments, 1000+ score events)?** — XML parsing and CSD generation must complete without memory issues. Performance target: load a 5MB `.blue` file in under 3 seconds.
- **What happens when the ZMQ port is already in use?** — The engine bridge tries the next available port, up to 10 retries.

## Requirements *(mandatory)*

### Functional Requirements

#### Data Loading & Serialization
- **FR-001**: System MUST load `.blue` XML project files produced by Blue Java versions 2.0.0 through 2.9.x
- **FR-002**: System MUST save `.blue` XML files that are loadable by the Java Blue application
- **FR-003**: System MUST apply version migrations automatically when loading older `.blue` files (currently: upgrades for 2.1.10 and 2.3.0)
- **FR-004**: System MUST preserve object reference maps (shared object references via objRefMap) during load and save
- **FR-005**: System MUST handle unknown SoundObject XML nodes gracefully — preserve as opaque XML on save, log warning on load
- **FR-006**: System MUST provide `loadFromString(xml: string)` and `saveToString(): string` APIs — no filesystem I/O in the data layer

#### Data Model Completeness
- **FR-007**: System MUST implement all core data types: BlueData, ProjectProperties, Arrangement, InstrumentLibrary, Instrument, Score, Mixer, Tables, GlobalOrcSco, MarkersList, LiveData, ScratchPadData, MidiInputProcessor
- **FR-008**: System MUST implement all score layer types: PolyObject (with SoundLayers), AudioLayerGroup/AudioLayer/AudioClip, PatternsLayerGroup/PatternLayer/PatternData
- **FR-009**: System MUST implement all SoundObject types: GenericScore, CSDSoundObject, AudioFile, Sound, Comment, External, LineObject, ZakLineObject, PatternObject, PianoRoll, NotationObject, JMask, Instance, TrackerObject, FrozenSoundObject, JavaScriptObject, PythonObject, and all ObjectBuilder-registered types
- **FR-010**: System MUST implement all NoteProcessor types: AddProcessor, MultiplyProcessor, RandomAddProcessor, RandomMultiplyProcessor, LineAddProcessor, LineMultiplyProcessor, PchAddProcessor, PchInversionProcessor, InversionProcessor, RetrogradeProcessor, RotateProcessor, TimeWarpProcessor, TuningProcessor, SwitchProcessor, SubListProcessor, EqualsProcessor, Code, PythonProcessor, ValueTimeMapper
- **FR-011**: System MUST implement the automation system: Parameter, ParameterList, ParameterIdList, ParameterNameManager, ParameterTimeManager, Automatable
- **FR-012**: System MUST implement the BlueSynthBuilder (BSB) data types and their serialization

#### CSD Generation
- **FR-013**: System MUST generate valid CSD strings from BlueData, including: orchestra (from Arrangement + Instruments), global orc/sco, F-tables, and score events
- **FR-014**: System MUST generate CSD score events from all score layer types: PolyObject (recursively through SoundLayers), AudioLayer (diskin2-based with fade UDOs), PatternLayer (pattern-based repetition)
- **FR-015**: System MUST embed the `blue_fade.udo` Csound UDO when generating CSD with audio clips that use non-linear fades
- **FR-016**: System MUST handle `blueMixerOut` → `outc` conversion in generated orchestra code when mixer is not enabled
- **FR-017**: System MUST support JavaScriptObject CSD generation via sandboxed JS execution (Node: `vm.runInNewContext`, browser: `new Function()`)
- **FR-018**: System MUST support PythonObject and ClojureObject CSD generation via Java subprocess in Node.js, and skip with warning in browser

#### Engine Integration
- **FR-019**: System MUST spawn and manage the blue-engine C++ process as a child process
- **FR-020**: System MUST communicate with blue-engine via ZeroMQ REQ/REP binary protocol (CREATE_ENGINE, SET_OPTION, COMPILE_ORC, READ_SCORE, START, STOP, EXIT)
- **FR-021**: System MUST support channel operations (CREATE_CHANNEL, SET_CHANNEL, GET_CHANNEL) via ZMQ
- **FR-022**: System MUST support automation operations (CREATE, UPDATE, DELETE, ENABLE, DISABLE, LIST, CLEAR) via ZMQ
- **FR-023**: System MUST handle engine process crashes gracefully — detect exit, clean up ZMQ socket, notify UI

#### Electron Application
- **FR-024**: Electron app MUST present a file open dialog to select `.blue` files
- **FR-025**: Electron app MUST display loaded project metadata (title, author, score structure summary)
- **FR-026**: Electron app MUST provide Play and Stop buttons that control the blue-engine process
- **FR-027**: Electron app MUST display playback status (playing, stopped, error)

#### Environment Compatibility
- **FR-028**: The `@blue/data` package MUST work identically in browser and Node.js environments
- **FR-029**: The `@blue/data` package MUST NOT import any Node.js built-in modules (`fs`, `path`, `child_process`, `Buffer`, etc.)
- **FR-030**: The `@blue/engine-client` package is Node.js only and MUST NOT be importable in browser environments (or must fail gracefully with a clear error)

### Key Entities

- **BlueData**: Root project object. Contains version, arrangement, mixer, project properties, sound object library, score, tables, global orc/sco, opcode list, note processor chains, live data, markers, MIDI input config, scratch pad data, and plugin data. Serializes to `<blueData version="...">` XML root.
- **Score**: Container for layer groups. Holds TimeContext (tempo map, time signature), TimeState, and NoteProcessorChain. Layers can be PolyObject groups, Audio layer groups, or Pattern layer groups.
- **LayerGroup**: Polymorphic container of Layers. Three implementations: AudioLayerGroup (contains AudioLayers with AudioClips), PatternsLayerGroup (contains PatternLayers with PatternData grids), PolyObject (contains SoundLayers with SoundObjects).
- **SoundObject**: Polymorphic note generator. Each type generates Csound score events differently. GenericScore contains raw score text; AudioClip references audio files with timing/fade data; PatternLayer repeats a sound object at pattern positions; etc.
- **Arrangement**: Maps Instruments to instrument IDs for CSD generation. Holds enabled/disabled state per instrument assignment.
- **Mixer**: Audio routing system with Channels, Effects, Sends, and subchannel routing. Controls how instrument output maps to Csound audio channels.
- **Instrument**: Csound instrument definition. Can be GenericInstrument (raw orc/sco text) or BlueSynthBuilder-generated (visual synth → CSD code).
- **Parameter**: Automation curve definition. Time-value pairs with interpolation type (step, linear, exponential), targeting mixer or sound object channels.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any `.blue` file created in Java Blue 2.0.0+ loads without errors in the TypeScript app
- **SC-002**: Any `.blue` file saved by the TypeScript app loads without errors in the Java Blue app
- **SC-003**: Round-trip load → save → reload → save produces byte-identical XML on the second save (idempotent serialization after initial migration)
- **SC-004**: A simple `.blue` file with GenericScore sound objects produces correct audio when played through the Electron app
- **SC-005**: A `.blue` file with audio clips plays the referenced audio files at correct times with correct fades
- **SC-006**: A `.blue` file with pattern layers generates correct repeated score events
- **SC-007**: Load time for a 5MB `.blue` file is under 3 seconds on a modern laptop
- **SC-008**: The `@blue/data` package imports and functions correctly in both Node.js and a browser bundle (verified by separate test scripts)
- **SC-009**: All 85+ data classes from the Java codebase have TypeScript equivalents with matching XML serialization

## Assumptions

- The blue-engine C++ executable is pre-installed on the user's system and accessible via PATH or configurable path setting
- The user's `.blue` files are from Blue Java version 2.0.0 or later (files older than 2.0.0 may have unsupported formats)
- Csound 7 is installed and discoverable by the blue-engine (the engine handles Csound dynamic loading)
- Audio output on macOS uses Core Audio (the blue-engine handles this)
- The Electron app targets macOS first (the developer's platform), with Windows/Linux as future targets
- `PythonObject` and `ClojureObject` score generation via Java subprocess requires Java 17+ to be installed
- The `electric.xml` Java library format is well-understood — it's a lightweight XML serializer with a known output format (attributes, text nodes, nested elements — no namespaces, CDATA, or processing instructions)
- Audio file paths in `.blue` files are absolute paths. Relative path resolution is handled by the caller (Electron app or Node script)
- MIDI input is out of scope for Phase 1 (the MidiInputProcessor data is preserved on load/save but not used for live input)
- The Blue Live mode data is preserved on load/save but live mode playback is out of scope for Phase 1
- Plugin data (`BlueData.pluginData`) is preserved as opaque XML without deserialization — plugin support is deferred
