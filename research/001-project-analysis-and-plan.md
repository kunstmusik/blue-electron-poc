# Blue TypeScript Port — Project Analysis & Plan

## 1. Source Codebases Analyzed

### 1.1 Blue Java Application (`~/work/nbprojects/blue`)

**Type:** NetBeans Rich Client Platform (RCP) application, Maven-based multi-module project
**Version:** 2.9.1-SNAPSHOT
**Java Version:** 25
**NetBeans Platform:** RELEASE270

#### Module Structure (32 modules)

| Module | Purpose |
|--------|---------|
| `blue-core` | **Core data model** — BlueData, Score, Arrangement, Instruments, Mixer, Automation, SoundObjects, Tables, Markers, LiveData, NoteProcessors, TimeContext |
| `blue-projects` | Project management — BlueProject wrapper, open/save/recent, MIDI/CSD import |
| `blue-services` | Application services |
| `blue-settings` | Preferences/settings management |
| `blue-ui-core` | Core UI components |
| `blue-ui-editor` | Score/time-based editors |
| `blue-ui-components` | UI widget library |
| `blue-ui-filemanager` | File management UI |
| `blue-ui-nbutilities` | NetBeans utilities |
| `blue-ui-utilities` | General UI utilities |
| `blue-plaf` | Look-and-feel |
| `blue-utilities` | General utilities (TextUtilities, etc.) |
| `blue-midi` | MIDI input processing |
| `blue-osc` | Open Sound Control support |
| `blue-clojure` | Clojure scripting integration |
| `blue-plugin` | Plugin system |
| `blue-csnd6` | Csound 6 engine integration |
| `blue-ext-*` | External dependencies (Jython, GraalJS, OpenJFX, Commons IO/Lang3/Text, EXML) |
| `blue-score-layers-audio-core` | Audio score layer core |
| `blue-score-layers-audio-ui` | Audio score layer UI |
| `blue-score-layers-patterns-core` | Pattern score layer core |
| `blue-score-layers-patterns-ui` | Pattern score layer UI |
| `branding` | Application branding |
| `application` | Application entry point / distribution |

#### Core Data Model (`blue-core`)

The root data class is **`BlueData`**, which aggregates:

| Property | Type | Description |
|----------|------|-------------|
| `version` | String | App version at save time (e.g. "2.9.1") |
| `arrangement` | Arrangement | Selected instruments from library, mapped to instrument IDs |
| `mixer` | Mixer | Audio mixer with channels, effects, sends |
| `projectProperties` | ProjectProperties | Title, author, sample rate, ksmps, nchnls, Csound options |
| `sObjLib` | SoundObjectLibrary | Library of reusable sound objects |
| `globalOrcSco` | GlobalOrcSco | Global orchestra/sco code |
| `tableSet` | Tables | F-table definitions |
| `opcodeList` | OpcodeList | User-defined opcodes (UDOs) |
| `noteProcessorChainMap` | NoteProcessorChainMap | Note transformation processors |
| `liveData` | LiveData | Blue Live mode data |
| `score` | Score | The main score — contains LayerGroups, TimeContext, TempoMap |
| `scratchData` | ScratchPadData | Scratch pad |
| `markersList` | MarkersList | Timeline markers |
| `loopRendering` | boolean | Loop rendering flag |
| `renderStartTime` / `renderEndTime` | double | Render loop bounds |
| `midiInputProcessor` | MidiInputProcessor | MIDI input config |
| `pluginData` | List\<BlueDataObject\> | Plugin extensibility data |

**Serialization format:** XML via the `electric.xml` library. `BlueData.saveAsXML()` produces an XML document with a `<blueData version="...">` root element. Loading is via `BlueData.loadFromXML(Element)`.

#### Migration System (`blue.upgrades` package)

The migration system is a **versioned XML upgrader chain**:

```
UpgradeManager
  └─ List<ProjectUpgrader> (ordered)
       ├─ ProjectUpgrader_2_1_10  (upgrades to 2.1.10)
       └─ ProjectUpgrader_2_3_0   (upgrades to 2.3.0)
```

**How it works:**
1. On load, the XML `version` attribute is read from `<blueData version="...">`
2. `ProjectVersion.parseVersion()` parses it into comparable version parts
3. Each `ProjectUpgrader` is checked — if file version < upgrader version, `performUpgrade(Element)` is called
4. Upgraders **mutate the raw XML Element** before BlueData deserialization
5. This happens in `BlueData.loadFromXML()` before any object construction

**Key insight:** The migration system operates on **raw XML nodes**, not on deserialized objects. This allows structural schema changes to be handled before object construction.

#### Play/Render Flow

1. User hits "Play" in the UI
2. `BlueData` is compiled into a CSD (Csound Document) string:
   - `Arrangement.generateOrchestra()` — generates Csound instrument code
   - `Arrangement.generateGlobalOrc()` — generates global orchestra code
   - `Score.generateScore()` — generates Csound score events
   - `ProjectProperties` → Csound options (`-r`, `-k`, `-nch`, etc.)
3. The CSD is written to a temp file
4. Csound engine is spawned (via csound6 module or external engine)
5. For the blue-engine integration, the compiled orchestra/score would be sent via ZMQ

### 1.2 Blue Engine (`~/work/csound/blue-engine`)

**Type:** C++ standalone executable with CMake build
**Interface:** ZeroMQ REQ/REP binary protocol + POSIX shared memory

#### Architecture

```
Host App ──ZMQ REQ/REP──> ZmqHandler::processOne()
                              │
                              ▼
                         CsoundEngine methods
                         (create → setOption → compileOrc → readScore → start)
                              │
                              ▼ (perform thread)
                    AutomationManager → writes to SharedMemory
                    csoundPerformKsmps() — one k-cycle of audio
                    blue_shm opcodes read/write SharedMemory
```

#### Protocol Commands

| Code | Command | Description |
|------|---------|-------------|
| 0x01 | CREATE_ENGINE | Create Csound instance |
| 0x02 | COMPILE_ORC | Compile orchestra string |
| 0x03 | READ_SCORE | Submit score events |
| 0x04 | SET_OPTION | Set Csound option |
| 0x05 | START | Start perform thread |
| 0x10 | SET_CHANNEL | Set channel value in shared memory |
| 0x11 | GET_CHANNEL | Get channel value |
| 0x12 | CREATE_CHANNEL | Create named channel |
| 0x13 | GET_SHM_NAME | Get shared memory region name |
| 0x20-0x26 | Automation cmds | Create/update/delete automation curves |

#### Shared Memory

- 64-byte header (magic `0x454C5542`, version 1, channel count, max channels)
- Up to 256 channels, 80 bytes each (64-byte name, atomic double value, flags)
- Total: 20,544 bytes
- External clients open by name and read/write channel values directly

#### What Blue Engine Needs

1. **Orchestra string** — Csound orchestra code defining instruments
2. **Score string** — Csound score events
3. **Channel values** — real-time control parameters (doubles by name)
4. **Automation definitions** — optional time-value curves
5. **Csound options** — like `-odac`, `-d`

---

## 2. Target Architecture

### 2.1 Framework Decision: Electron vs Tauri

| Factor | Electron | Tauri |
|--------|----------|-------|
| **Language** | Full TypeScript/JS | Rust backend + JS/TS frontend |
| **blue-engine integration** | Node.js child process + node-zeromq + node-shared-memory | Rust FFI or sidecar process |
| **Data classes** | Pure TypeScript, usable from Node | Rust structs, usable from Rust |
| **Maturity for audio apps** | More mature, larger bundle | Smaller bundle, newer |
| **Access to blue-engine** | Via ZMQ from Node (good existing JS client pattern) | Via Rust ZMQ client (would need to be written) |

**Recommendation: Electron**

Reasons:
1. The blue-engine already has a JavaScript/Node.js example client pattern (`test_client.js`) — the ZMQ protocol is well understood from the JS side
2. The data classes will be in TypeScript and directly usable from Node CLI tools
3. Electron's larger bundle size is not a concern for a desktop audio app
4. The blue-engine runs as a separate process regardless — Electron's Node backend communicates via ZMQ just like any other host
5. Tauri's Rust backend would add an extra FFI layer between Rust and the C++ engine that isn't needed

### 2.2 Monorepo Structure

```
blue-electron/
├── packages/
│   ├── blue-data/           # Pure TypeScript data classes (no UI)
│   │   ├── src/
│   │   │   ├── blue-data.ts           # Root data class
│   │   │   ├── arrangement.ts
│   │   │   ├── score/
│   │   │   │   ├── score.ts
│   │   │   │   ├── layers/
│   │   │   │   │   ├── layer.ts
│   │   │   │   │   ├── layer-group.ts
│   │   │   │   │   ├── score-object-layer.ts
│   │   │   │   │   ├── score-object-layer-group.ts
│   │   │   │   │   ├── automatable-layer.ts
│   │   │   │   │   ├── automatable-layer-group.ts
│   │   │   │   │   └── layer-group-provider.ts
│   │   │   │   ├── audio/
│   │   │   │   │   ├── audio-layer-group.ts
│   │   │   │   │   ├── audio-layer.ts
│   │   │   │   │   ├── audio-clip.ts
│   │   │   │   │   └── fade-type.ts
│   │   │   │   ├── patterns/
│   │   │   │   │   ├── patterns-layer-group.ts
│   │   │   │   │   ├── pattern-layer.ts
│   │   │   │   │   └── pattern-data.ts
│   │   │   │   └── time-context.ts
│   │   │   ├── mixer/
│   │   │   │   ├── mixer.ts
│   │   │   │   ├── channel.ts
│   │   │   │   └── effects.ts
│   │   │   ├── instruments/
│   │   │   │   ├── instrument.ts
│   │   │   │   ├── instrument-library.ts
│   │   │   │   └── instrument-assignment.ts
│   │   │   ├── automation/
│   │   │   │   └── parameter.ts
│   │   │   ├── sound-objects/
│   │   │   │   ├── sound-object.ts        # Interface
│   │   │   │   ├── abstract-sound-object.ts
│   │   │   │   ├── sound-object-library.ts
│   │   │   │   ├── poly-object.ts          # Nested layer group
│   │   │   │   ├── generic-score.ts        # Most common
│   │   │   │   ├── note.ts                 # p-field based note
│   │   │   │   ├── note-list.ts
│   │   │   │   ├── time-behavior.ts
│   │   │   │   └── ...                     # All concrete types
│   │   │   ├── project-properties.ts
│   │   │   ├── tables.ts
│   │   │   ├── opcode-list.ts
│   │   │   ├── markers.ts
│   │   │   ├── live-data.ts
│   │   │   ├── midi-input-processor.ts
│   │   │   ├── scratch-pad-data.ts
│   │   │   └── note-processors/
│   │   ├── src/serialization/
│   │   │   ├── xml-reader.ts              # Compatible with Java electric.xml
│   │   │   ├── xml-writer.ts
│   │   │   └── obj-ref-map.ts
│   │   ├── src/migration/
│   │   │   ├── version.ts
│   │   │   ├── upgrader.ts
│   │   │   ├── upgrade-manager.ts
│   │   │   └── upgrades/
│   │   │       ├── upgrade-2.1.10.ts
│   │   │       └── upgrade-2.3.0.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── blue-engine-client/    # TypeScript client for blue-engine
│   │   ├── src/
│   │   │   ├── engine-client.ts
│   │   │   ├── shared-memory.ts
│   │   │   ├── automation.ts
│   │   │   └── protocol.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── blue-app/              # Electron application (phase 1: minimal)
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── main.ts
│   │   │   │   └── engine-bridge.ts
│   │   │   ├── preload/
│   │   │   │   └── preload.ts
│   │   │   └── renderer/
│   │   │       ├── index.html
│   │   │       ├── app.tsx
│   │   │       └── styles.css
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── blue-ui/               # Future: full UI components
│       └── ...
│
├── research/                  # Architecture docs and decisions
│   └── 001-project-analysis-and-plan.md
├── package.json               # Root workspace config
├── tsconfig.base.json         # Shared TypeScript config
└── .gitignore
```

### 2.3 Package Relationships

```
blue-data (pure TS, universal: browser + Node)
    ↑           ↖
blue-engine-client    blue-app (Electron)
   (Node only)            ↑
                    blue-ui (future, browser)
```

- **`blue-data`**: Zero UI, zero runtime dependencies. Targets **both browser and Node.js**. Pure data classes with XML serialization compatible with Java `.blue` files. Importable from browser apps (future web UI), Node scripts, CLI tools, tests, and any UI layer. Includes ALL data types: core model, score layers (audio, patterns, poly), sound objects (20+ types), mixer, automation, note processors, live data, MIDI, migration system.
- **`blue-engine-client`**: **Node.js only** — ZMQ + shared memory access to the blue-engine process. Not usable in browser.
- **`blue-app`**: Electron app that ties it together — loads `.blue` files via `blue-data`, sends to engine via `blue-engine-client`, has a play button.
- **`blue-ui`** (future): Rich UI components running in browser/electron renderer, consumes `blue-data`.

### 2.4 `blue-data` Dual-Environment Constraints

Since `blue-data` must work in both browser and Node, the following constraints apply:

| Constraint | Rule | Rationale |
|-----------|------|-----------|
| **No Node.js built-ins** | No `fs`, `path`, `crypto`, `child_process`, `Buffer` | These don't exist in browsers |
| **File I/O abstraction** | Use `File`/`Blob` (browser) or `string` paths (Node). The data classes hold file paths as `string`. File reading/writing is done by the caller, passing content in as strings. | Decouples data from I/O mechanism |
| **XML parsing** | Use `DOMParser` (browser) or a pure-JS XML library (Node). Bundle a lightweight XML parser that works in both environments. | `electric.xml` is a custom Java library — need equivalent |
| **Color representation** | Use numeric RGB values, not `java.awt.Color` | No Color class in JS |
| **Time system** | Pure math on `TimePosition`/`TimeDuration` — no system clock dependencies | Already clean in Java code |
| **Unique IDs** | Use `crypto.randomUUID()` (browser/modern Node) or a simple counter-based UUID fallback | Java uses `VMID.toString()` |
| **Audio file metadata** | `AudioClip.numChannels` and `audioDuration` are stored as plain numbers. Reading these from actual audio files is the caller's responsibility. | `javax.sound.sampled` is JVM-only |
| **Relative path resolution** | `BlueSystem.getRelativePath()` is abstracted — the caller provides a path resolver function | Java's file system is different from browser's File API |
| **Embedded Csound code** | Template strings (CSD orchestra/fade UDO) — no file I/O needed | Clean — just strings |
| **JVM subprocess** | For `PythonObject`/`ClojureObject` score generation — **Node only**. Browser apps will simply skip these or warn. | No subprocess API in browser |

#### Recommended I/O Pattern

```typescript
// Loading a .blue file — caller handles I/O
const xmlString = await fetchFileContent(url);  // browser: fetch(), node: fs.readFile()
const blueData = BlueData.loadFromString(xmlString);

// Saving — caller handles I/O
const xmlString = blueData.saveToString();
await writeFileContent(path, xmlString);  // browser: download, node: fs.writeFile()

// AudioClip file paths stored as strings — resolved at CSD generation time
clip.audioFile;  // string path — resolved by caller or CSD generator
```

#### TypeScript Target Config

```jsonc
// tsconfig.base.json — targets ES2022, DOM + ES lib
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"]  // DOM for browser, ES2022 for modern JS
  }
}
```

#### XML Parser Choice

The Java app uses `electric.xml` — a lightweight custom XML library. Options for TS:

1. **`@rgrove/parse-xml`** — Pure JS, no DOM dependency, works in browser and Node. Fast, spec-compliant XML 1.0 parser. Returns a simple tree structure we can walk.
2. **`DOMParser`** (browser built-in) / `linkedom` or `xmldom` (Node polyfill) — Standard DOM API but requires environment-specific setup.
3. **Write a minimal parser** — The `.blue` XML format is well-known and predictable. A targeted parser matching `electric.xml`'s API (`Element`, `Elements`, `getAttribute`, `getTextString`, etc.) would be small and have zero dependencies.

**Recommendation:** Option 3 — write a minimal `Element`/`Elements` wrapper using `@rgrove/parse-xml` as the parser underneath. This gives us API parity with the Java `electric.xml` library (`Element.getName()`, `Element.getAttribute()`, `Element.getTextString()`, `Element.getElements()`, `Element.addElement()`) with zero DOM dependency and cross-environment compatibility.

---

## 3. Phase 1 Implementation Plan

### Phase 1 Goal
Port all data classes with migration support, build a minimal Electron app that can:
1. Open a `.blue` project file
2. Compile it to CSD (orchestra + score strings)
3. Send to blue-engine via ZMQ
4. Hit play to render audio

### Phase 1 Tasks

#### Task 1: Monorepo Setup
- [ ] Initialize workspace with npm/yarn workspaces or pnpm
- [ ] Set up shared TypeScript configuration
- [ ] Configure ESLint, Prettier
- [ ] Set up build pipeline

#### Task 2: `blue-data` Package — Core Types
Port these Java classes to TypeScript (with XML serialization):

**Priority order (dependency chain):**

1. **Foundation types:**
   - `ProjectProperties` (sample rate, ksmps, nchnls, Csound options)
   - `ProjectVersion` + migration system (`UpgradeManager`, `ProjectUpgrader`, `ProjectVersion`)
   - `TimeContext`, `TimeState`, `TempoMap` (time system — used everywhere)

2. **Score layer base interfaces** (in `blue-core`):
   - `Layer`, `LayerGroup<T>`, `ScoreObjectLayer`, `ScoreObjectLayerGroup`
   - `AutomatableLayer`, `AutomatableLayerGroup`
   - `LayerGroupProvider`, `LayerGroupProviderManager`
   - `LayerGroupDataEvent`, `LayerGroupListener`
   - `DeepCopyableLG`

3. **Audio score layers** (in `blue-score-layers-audio-core`):
   - `AudioClip` — file-based audio clip with fade in/out, looping, file offset
   - `AudioLayer` — list of `AudioClip`s, implements `ScoreObjectLayer<AudioClip>` + `AutomatableLayer`
   - `AudioLayerGroup` — list of `AudioLayer`s, implements `ScoreObjectLayerGroup<AudioLayer>`
   - `AudioLayerGroupProvider`
   - `FadeType` enum (LINEAR, CONSTANT_POWER, SYMMETRIC, FAST, SLOW)

4. **Pattern score layers** (in `blue-score-layers-patterns-core`):
   - `PatternData` — boolean array pattern (block size 16, auto-resizing)
   - `PatternLayer` — holds a `SoundObject` + `PatternData`, repeats sound object at pattern positions
   - `PatternsLayerGroup` — list of `PatternLayer`s with `patternBeatsLength`
   - `PatternsLayerGroupProvider`

5. **Sound Object base types** (in `blue-core`):
   - `SoundObject` interface (note generator)
   - `AbstractSoundObject` base class
   - `ScoreObject` interface, `ScoreObjectEvent`, `ScoreObjectListener`
   - `Note`, `NoteList`, `SoundObjectException`
   - `TimeBehavior` enum (NONE, REPEAT, SCALE)
   - `OnLoadProcessable` interface

6. **PolyObject** (nested layer group — the original/default score type):
   - `PolyObject` — implements `SoundObject` AND `ScoreObjectLayerGroup<SoundLayer>`
   - `SoundLayer` — layer within PolyObject containing SoundObjects
   - This is the layer group that was originally the root score before 2.3.0

7. **Instruments:**
   - `Instrument` (abstract base)
   - `GenericInstrument`
   - `InstrumentAssignment`
   - `Arrangement`
   - `InstrumentLibrary` (user library, separate from project)

8. **Mixer:**
   - `Mixer`, `Channel`, `ChannelList`, `Effect`, `EffectsChain`, `Send`, `MixerNode`

9. **Concrete SoundObject types** (all in `blue.soundObject`):
   - `GenericScore` — raw Csound score text (most common)
   - `CSDSoundObject` — embedded CSD
   - `AudioFile` — disk-based audio file playback
   - `Sound` — simple sound object
   - `Comment` — comment/note in score
   - `External` — external process sound object
   - `LineObject` / `AbstractLineObject` / `ZakLineObject` — line-based note generators
   - `PatternObject` — pattern-based sound object (different from PatternLayer!)
   - `PianoRoll` — piano roll sound object
   - `NotationObject` — notation-based
   - `JMask` — mask sound object
   - `Instance` — instance/reference sound object
   - `TrackerObject` — tracker-style sound object
   - `FrozenSoundObject` — frozen/cached sound object
   - `JavaScriptObject` — JavaScript code generating notes (Nashorn/GraalJS)
   - `PythonObject` — **JVM-dependent** (Jython) — preserve data only for Phase 1
   - `ObjectBuilder` / `ObjectBuilderRegistry` — plugin registry for custom sound objects

10. **Sound Object Library:**
    - `SoundObjectLibrary` — library of reusable sound objects

11. **Supporting types:**
    - `Tables` (F-tables)
    - `OpcodeList`
    - `GlobalOrcSco`
    - `MarkersList` / `Markers`
    - `NoteProcessorChain` / `NoteProcessorChainMap` / individual processors
    - `LiveData` / `LiveObject` / `LiveObjectSet` / `LiveObjectBins` / `LiveObjectSetList`
    - `ScratchPadData`
    - `MidiInputProcessor` / `MidiKeyMapping` / `MidiVelocityMapping`
    - `Automation` (Parameter, ParameterList, ParameterIdList, Automatable, etc.)

12. **Root aggregation:**
    - `BlueData` (the root class that holds everything)

#### Task 3: XML Serialization
- [ ] XML reader compatible with the Java `electric.xml` library format
- [ ] XML writer that produces the same format the Java app writes
- [ ] Handle object reference maps (objects shared across the XML, referenced by ID)

#### Task 4: Migration System
- [ ] Port `ProjectVersion` parsing and comparison
- [ ] Port `ProjectUpgrader` base class
- [ ] Port existing upgraders (`ProjectUpgrader_2_1_10`, `ProjectUpgrader_2_3_0`)
- [ ] Wire into `BlueData.load()` — auto-upgrade on load

#### Task 5: `blue-engine-client` Package
- [ ] ZMQ REQ/REP client implementing the binary protocol
- [ ] Shared memory reader/writer (platform-aware: POSIX on macOS, Windows API on Windows)
- [ ] Client class with methods: `createEngine()`, `setOption()`, `compileOrc()`, `readScore()`, `start()`, `setChannel()`, `getChannel()`, automation methods
- [ ] Engine lifecycle management (spawn/monitor blue-engine process)

#### Task 6: CSD Generation
- [ ] `BlueData.toCSD()` method — generates the full CSD string
- [ ] Generate orchestra from `Arrangement` (including `blueMixerOut` → `outc` conversion)
- [ ] Generate global orc/sco from `GlobalOrcSco`
- [ ] Generate score from `Score` — iterates all LayerGroups and SoundObjects
- [ ] Audio layers: generate `diskin2`-based instrument + score events with fade params
- [ ] Pattern layers: repeat sound object at pattern positions
- [ ] PolyObject: recursively generate from nested SoundObjects/layers
- [ ] Assemble with proper CSD header/footer
- [ ] **JVM-dependent SoundObjects** (`PythonObject`, `ClojureObject`):
  - Phase 1: preserve data on load/save, skip note generation
  - Plan: spawn a Java subprocess to call the Java `generateNotes()` method for these types
  - The Java subprocess loads the relevant .blue module jars and processes the sound objects
  - Alternative: port the script logic to TypeScript (Python → Python via child process, Clojure → nbb/babashka)
- [ ] **JavaScriptObject**: port to use Node.js `vm` module or GraalJS via child process
- [ ] **AudioLayer CSD generation**: loads `playback_instrument.orc` and `blue_fade.udo` templates from embedded resources

#### Task 7: `blue-app` — Minimal Electron App
- [ ] Electron main process with window
- [ ] File open dialog for `.blue` files
- [ ] Load and parse via `blue-data`
- [ ] Apply migrations if needed
- [ ] Generate CSD
- [ ] Spawn blue-engine process
- [ ] Send CSD via ZMQ
- [ ] Play button → `START` command
- [ ] Stop button → cleanup

#### Task 8: Testing
- [ ] Unit tests for data class serialization (round-trip: load → save → load)
- [ ] Unit tests for migration system
- [ ] Integration tests for engine client communication
- [ ] Test with existing `.blue` project files from the user's collection

---

## 4. Key Technical Decisions & Rationale

### 4.1 Serialization: XML over JSON
**Decision:** Maintain XML serialization as the primary format for `.blue` files.
**Rationale:** Backwards compatibility with existing Java-written `.blue` files. The Java app uses `electric.xml` for a custom XML format. We must read this exact format. JSON can be added later as an optional format.

### 4.2 Object References
**Decision:** Use the same `objRefMap` pattern the Java code uses.
**Rationale:** The Java serialization uses forward references and an `objRefMap` to handle object graphs with shared references (e.g., sound objects referenced from multiple places). We must replicate this.

### 4.3 Migration Strategy
**Decision:** Port the existing XML-level migration approach.
**Rationale:** The Java system modifies raw XML before deserialization. This is cleaner than object-level migrations and handles structural changes. We should port this pattern exactly.

### 4.4 Engine Communication
**Decision:** Communicate with blue-engine via ZMQ from Node.js, using the existing binary protocol.
**Rationale:** The protocol is well-documented in the engine code and the JS example client. Writing a TypeScript version of the JS client is straightforward and avoids any FFI complexity.

### 4.5 Shared Memory on macOS
**Decision:** Use POSIX shared memory (`/dev/shm` equivalent on macOS).
**Rationale:** The blue-engine already creates POSIX shared memory on macOS. The Node.js client needs to open the same shared memory region by name. The `node-shm` or custom native addon may be needed — this is a research item.

### 4.6 CSD Generation
**Decision:** Implement CSD generation in `blue-data` as a method on `BlueData`.
**Rationale:** The Java `Arrangement.generateOrchestra()`, `Arrangement.generateGlobalOrc()`, etc. methods already do this. Port this logic to TypeScript. The CSD string is what gets sent to the engine.

---

## 5. Risks & Open Questions

### 5.1 Shared Memory Access from Node.js
**Risk:** POSIX shared memory access from Node.js may require native addons.
**Mitigation:** Research `node-addon-api`, `node-shm`, or write a minimal native addon. Alternatively, the engine's ZMQ protocol has `GET_CHANNEL`/`SET_CHANNEL` commands that proxy shared memory access — we could use those for simpler setups, though with more overhead.

### 5.2 Sound Object Type Proliferation
**Risk:** There are many concrete `SoundObject` subclasses in the Java codebase, each with their own XML format.
**Mitigation:** Start with the most common types (GenericScore, CSDSoundObject, etc.). The XML deserializer can have a registry pattern where new types are added incrementally.

### 5.3 BlueSynthBuilder (BSB)
**Risk:** The Java code has a visual synth builder system (`BSBObject`, etc.) that generates instrument code from visual components.
**Mitigation:** Phase 1 doesn't need BSB UI — just needs to preserve BSB data in the data model and generate the Csound code from it.

### 5.4 Plugin Data
**Risk:** `BlueData.pluginData` holds `BlueDataObject` instances from plugins, which are dynamically loaded in the Java app.
**Mitigation:** For Phase 1, treat plugin data as opaque XML nodes — preserve them on save without needing to deserialize them.

### 5.5 Note Processors
**Risk:** Note processors (PythonProcessor, ClojureProcessor, etc.) embed scripting code.
**Mitigation:** Phase 1: preserve the data. Phase 2: implement scripting runtime integration.

### 5.6 JVM-Dependent SoundObjects
**Risk:** `PythonObject` uses Jython, `ClojureObject` (in `blue-clojure` module) uses Clojure runtime. These are in separate modules and can't be directly ported.
**Mitigation:**
- **Phase 1:** Preserve data on load/save (the `pythonCode`, `clojureCode` strings). Skip note generation for these types. This works in both browser and Node.
- **Phase 2 (score generation, Node only):** Spawn a Java subprocess that loads the blue-core/blue-clojure jars and calls `generateNotes()` on the sound objects. The Java process returns the NoteList as text, which the TypeScript side parses into score events.
  - **In browser:** JVM subprocess is impossible. Browser-based apps will either skip these sound objects with a warning, or use a server-side rendering service.
  - Alternative: use native Python (via Python subprocess) and nbb/babashka for Clojure — still Node-only.

### 5.7 JavaScript SoundObjects
**Risk:** `JavaScriptObject` uses the JVM's JavaScript engine (Nashorn or GraalJS).
**Mitigation:** The code is already JavaScript — just needs a `vm` context to execute. In Node, use `vm.runInNewContext()`. In browser, use `new Function()` or `eval()` (sandboxed). The `score` variable output is parsed as Csound score text. This works in both environments.

---

## 6. Estimated Phase 1 Scope

| Area | Complexity | Notes |
|------|-----------|-------|
| Monorepo setup | Low | Standard tooling |
| blue-data core types | **High** | 60+ classes including audio/pattern layers, 20+ SoundObject types |
| XML serialization | Medium | Must match Java format exactly |
| Migration system | Medium | 2 existing upgraders to port |
| blue-engine-client | Medium | ZMQ protocol + shared memory |
| CSD generation | **High** | Audio layers (diskin2 + fades), pattern layers, PolyObject, JVM subprocess for Python/Clojure |
| Electron app shell | Low | Minimal UI for Phase 1 |
| Testing | Medium | Round-trip serialization is critical |

**The bulk of the work is porting the data model classes and their XML serialization — this is mechanical but large in scope.**
