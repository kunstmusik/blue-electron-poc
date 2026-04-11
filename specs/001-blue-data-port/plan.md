# Implementation Plan: Blue Java Data Port to TypeScript

**Branch**: `001-blue-data-port` | **Date**: 2026-04-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-blue-data-port/spec.md`

## Summary

Port the complete data model and business logic of the Blue Java application (~85 classes across 32 Maven modules) to TypeScript as a standalone, environment-agnostic package (`@blue/data`). Build a Node.js-only ZMQ client for the C++ blue-engine (`@blue/engine-client`). Wrap both in a minimal Electron app (`@blue/app`) that opens `.blue` files, compiles to CSD, and plays via blue-engine.

The data layer preserves byte-compatible XML serialization with Java Blue, including automatic version migrations. The data layer works identically in browser and Node.js, enabling future web applications.

## Technical Context

**Language/Version**: TypeScript 5.8+, targeting ES2022
**Primary Dependencies**: `@rgrove/parse-xml` (XML parsing, pure JS), `zeromq` npm package (Node.js ZMQ), Electron 33 (app shell)
**Storage**: `.blue` XML files (filesystem via caller — `blue-data` has no I/O)
**Testing**: vitest (unit), integration tests with real `.blue` files from Java Blue
**Target Platform**: Node.js 22+ and modern browsers (ES2022 with DOM) for `@blue/data`; Electron macOS for `@blue/app`; Node.js only for `@blue/engine-client`
**Project Type**: Monorepo (npm workspaces) — data library + engine client + desktop app
**Performance Goals**: Load 5MB `.blue` file in <3 seconds; CSD generation for 100-instrument project in <5 seconds
**Constraints**: `@blue/data` must import zero Node.js built-ins. XML output must match Java Blue's `electric.xml` format exactly for round-trip compatibility.
**Scale/Scope**: 85+ data classes, 20+ SoundObject types, 15+ NoteProcessor types, 3 score layer systems, 2 existing migration upgraders

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Data-First, UI-Separated** | ✅ | `blue-data` has zero UI dependencies. Three separate packages: data (universal), engine client (Node), app (Electron). |
| **II. Backwards-Compatible Serialization** | ✅ | XML serialization mirrors Java `electric.xml` format exactly. Round-trip tests with real `.blue` files are primary success criterion. Migration system ported identically (XML-level upgrades before deserialization). |
| **III. JVM Dependencies Preserved** | ✅ | `PythonObject`/`ClojureObject` data preserved on load/save. CSD generation via Java subprocess in Node.js, skipped with warning in browser. `JavaScriptObject` ported to native JS `vm`. |
| **IV. Engine as External Process** | ✅ | ZMQ REQ/REP binary protocol, no FFI. Shared memory proxied through ZMQ commands in Phase 1. |
| **V. Test-First for Serialization** | ✅ | Every data class requires round-trip serialization tests: load XML → save XML → compare → reload → verify equivalence. |

## Project Structure

### Documentation (this feature)

```
specs/001-blue-data-port/
├── spec.md              # Feature specification (done)
├── plan.md              # This file
├── research.md          # Phase 0 output — references research/ docs
├── data-model.md        # Phase 1 output — class-by-class mapping
├── quickstart.md        # Phase 1 output — getting started guide
├── contracts/           # Phase 1 output — API contracts
└── tasks.md             # Phase 2 output — task breakdown
```

### Source Code (repository root)

```
packages/
├── blue-data/                        # @blue/data — universal (browser + Node)
│   ├── src/
│   │   ├── index.ts                  # Public API re-exports
│   │   ├── blue-data.ts              # Root BlueData class
│   │   ├── blue-data-object.ts       # Interface
│   │   ├── blue-constants.ts         # Version, constants
│   │   ├── compile-data.ts           # CSD compilation context
│   │   ├── copy-buffer.ts            # Clipboard
│   │   ├── arrangement.ts            # Instrument arrangement
│   │   ├── arrangement-event.ts
│   │   ├── arrangement-listener.ts
│   │   ├── project-properties.ts     # Project settings
│   │   ├── global-orc-sco.ts         # Global orchestra/score
│   │   ├── global-variables.ts
│   │   ├── blue-system.ts            # System utilities (abstracted)
│   │   ├── tables.ts                 # F-tables
│   │   ├── markers.ts                # Timeline markers
│   │   ├── markers-list.ts
│   │   ├── live-data.ts              # Live mode data
│   │   ├── scratch-pad-data.ts       # Scratch pad
│   │   ├── instrument-assignment.ts  # Arrangement instrument mapping
│   │   │
│   │   ├── time/                     # Time system
│   │   │   ├── time-context.ts       # Tempo map, SMPTE
│   │   │   ├── time-position.ts      # Temporal position
│   │   │   ├── time-duration.ts      # Duration with unit
│   │   │   ├── tempo-map.ts          # Tempo changes
│   │   │   ├── time-state.ts         # Time display state
│   │   │   ├── time-base.ts          # Enum
│   │   │   ├── time-unit-math.ts     # Unit conversion
│   │   │   ├── time-context-manager.ts
│   │   │   ├── time-utilities.ts
│   │   │   └── smpte-frame-rate.ts   # Enum
│   │   │
│   │   ├── score/                    # Score + layer system
│   │   │   ├── score.ts              # Root score container
│   │   │   ├── score-object.ts       # Interface
│   │   │   ├── score-object-event.ts
│   │   │   ├── score-object-listener.ts
│   │   │   ├── time-state.ts
│   │   │   ├── layers/               # Layer base interfaces
│   │   │   │   ├── layer.ts
│   │   │   │   ├── layer-group.ts
│   │   │   │   ├── score-object-layer.ts
│   │   │   │   ├── score-object-layer-group.ts
│   │   │   │   ├── automatable-layer.ts
│   │   │   │   ├── automatable-layer-group.ts
│   │   │   │   ├── layer-group-provider.ts
│   │   │   │   ├── layer-group-provider-manager.ts
│   │   │   │   ├── layer-group-data-event.ts
│   │   │   │   ├── layer-group-listener.ts
│   │   │   │   └── deep-copyable-lg.ts
│   │   │   ├── audio/                # Audio score layers
│   │   │   │   ├── audio-clip.ts
│   │   │   │   ├── audio-layer.ts
│   │   │   │   ├── audio-layer-group.ts
│   │   │   │   ├── audio-layer-group-provider.ts
│   │   │   │   ├── audio-layer-listener.ts
│   │   │   │   ├── fade-type.ts      # Enum: LINEAR, CONSTANT_POWER, ...
│   │   │   │   ├── playback-instrument.orc.ts  # Template string
│   │   │   │   └── blue-fade.udo.ts  # Template string
│   │   │   └── patterns/             # Pattern score layers
│   │   │       ├── pattern-data.ts
│   │   │       ├── pattern-layer.ts
│   │   │       ├── patterns-layer-group.ts
│   │   │       └── patterns-layer-group-provider.ts
│   │   │
│   │   ├── sound-objects/            # SoundObject system
│   │   │   ├── sound-object.ts       # Interface
│   │   │   ├── abstract-sound-object.ts
│   │   │   ├── sound-object-exception.ts
│   │   │   ├── sound-object-utilities.ts
│   │   │   ├── generic-viewable.ts   # Marker interface
│   │   │   ├── on-load-processable.ts
│   │   │   ├── time-behavior.ts      # Enum: NONE, REPEAT, SCALE
│   │   │   ├── note.ts               # P-field based note
│   │   │   ├── note-list.ts
│   │   │   ├── note-parse-exception.ts
│   │   │   ├── poly-object.ts        # Nested layer group SoundObject
│   │   │   ├── sound-layer.ts        # Layer within PolyObject
│   │   │   ├── poly-object-layer-group-provider.ts
│   │   │   ├── generic-score.ts      # Raw Csound score text
│   │   │   ├── csd-sound-object.ts   # Embedded CSD
│   │   │   ├── audio-file.ts         # Disk-based audio
│   │   │   ├── sound.ts              # Simple sound object
│   │   │   ├── comment.ts            # Comment
│   │   │   ├── external.ts           # External process
│   │   │   ├── abstract-line-object.ts
│   │   │   ├── line-object.ts
│   │   │   ├── zak-line-object.ts
│   │   │   ├── pattern-object.ts     # Pattern-based (different from PatternLayer)
│   │   │   ├── piano-roll.ts
│   │   │   ├── notation-object.ts
│   │   │   ├── j-mask.ts
│   │   │   ├── instance.ts
│   │   │   ├── tracker-object.ts
│   │   │   ├── frozen-sound-object.ts
│   │   │   ├── javascript-object.ts  # JS code → score
│   │   │   ├── python-object.ts      # Jython — data only, generation Node-only
│   │   │   ├── object-builder.ts
│   │   │   ├── object-builder-registry.ts
│   │   │   └── sound-object-library.ts
│   │   │
│   │   ├── instruments/              # Instrument system
│   │   │   ├── instrument.ts         # Abstract base
│   │   │   ├── generic-instrument.ts
│   │   │   ├── instrument-library.ts # User library
│   │   │   └── bsb/                  # BlueSynthBuilder types
│   │   │       └── ...
│   │   │
│   │   ├── mixer/                    # Mixer system
│   │   │   ├── mixer.ts
│   │   │   ├── channel.ts
│   │   │   ├── channel-list.ts
│   │   │   ├── effect.ts
│   │   │   ├── effect-manager.ts
│   │   │   ├── effects-chain.ts
│   │   │   ├── send.ts
│   │   │   └── mixer-node.ts
│   │   │
│   │   ├── automation/               # Automation system
│   │   │   ├── parameter.ts
│   │   │   ├── parameter-list.ts
│   │   │   ├── parameter-id-list.ts
│   │   │   ├── parameter-name-manager.ts
│   │   │   ├── parameter-time-manager.ts
│   │   │   ├── automatable.ts
│   │   │   ├── automatable-collection-listener.ts
│   │   │   └── line-colors.ts
│   │   │
│   │   ├── note-processors/          # Note processing
│   │   │   ├── note-processor.ts     # Abstract base
│   │   │   ├── note-processor-chain.ts
│   │   │   ├── note-processor-chain-map.ts
│   │   │   ├── add-processor.ts
│   │   │   ├── multiply-processor.ts
│   │   │   ├── random-add-processor.ts
│   │   │   ├── random-multiply-processor.ts
│   │   │   ├── line-add-processor.ts
│   │   │   ├── line-multiply-processor.ts
│   │   │   ├── pch-add-processor.ts
│   │   │   ├── pch-inversion-processor.ts
│   │   │   ├── inversion-processor.ts
│   │   │   ├── retrograde-processor.ts
│   │   │   ├── rotate-processor.ts
│   │   │   ├── time-warp-processor.ts
│   │   │   ├── tuning-processor.ts
│   │   │   ├── switch-processor.ts
│   │   │   ├── sublist-processor.ts
│   │   │   ├── equals-processor.ts
│   │   │   ├── code.ts
│   │   │   ├── python-processor.ts   # Jython — data only, processing Node-only
│   │   │   └── value-time-mapper.ts
│   │   │
│   │   ├── live/                     # Live mode
│   │   │   ├── live-object.ts
│   │   │   ├── live-object-set.ts
│   │   │   ├── live-object-bins.ts
│   │   │   └── live-object-set-list.ts
│   │   │
│   │   ├── midi/                     # MIDI
│   │   │   ├── midi-input-processor.ts
│   │   │   ├── midi-key-mapping.ts
│   │   │   └── midi-velocity-mapping.ts
│   │   │
│   │   ├── opcodes/                  # User-defined opcodes
│   │   │   ├── opcode-list.ts
│   │   │   └── opcode-definition.ts
│   │   │
│   │   ├── plugins/                  # Plugin data (opaque preservation)
│   │   │   ├── clojure-project-data.ts
│   │   │   └── clojure-library-entry.ts
│   │   │
│   │   ├── utilities/                # Utility functions
│   │   │   ├── text.ts               # String utilities
│   │   │   ├── score.ts              # Score manipulation
│   │   │   ├── udo.ts                # UDO utilities
│   │   │   ├── object.ts             # Generic load/save dispatcher
│   │   │   ├── xml.ts                # XML helpers
│   │   │   └── expression-parser.ts  # Score expressions
│   │   │
│   │   ├── serialization/            # XML serialization
│   │   │   ├── xml-reader.ts         # Element/Elements wrapping parse-xml
│   │   │   ├── xml-writer.ts
│   │   │   └── obj-ref-map.ts
│   │   │
│   │   └── migration/                # Version migration
│   │       ├── project-version.ts
│   │       ├── upgrader.ts
│   │       ├── upgrade-manager.ts
│   │       └── upgrades/
│   │           ├── upgrade-2.1.10.ts
│   │           └── upgrade-2.3.0.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── blue-engine-client/               # @blue/engine-client — Node.js only
│   ├── src/
│   │   ├── index.ts
│   │   ├── engine-client.ts          # ZMQ protocol client
│   │   ├── shared-memory.ts          # Shared memory (Phase 2)
│   │   ├── automation.ts             # Automation curve types
│   │   └── protocol.ts               # Binary protocol constants
│   ├── package.json
│   └── tsconfig.json
│
├── blue-app/                         # @blue/app — Electron app
│   ├── src/
│   │   ├── main/
│   │   │   ├── main.ts               # Electron main process
│   │   │   ├── engine-bridge.ts      # Manages blue-engine subprocess
│   │   │   └── file-handler.ts       # File open/save IPC
│   │   ├── preload/
│   │   │   └── preload.ts            # Context bridge
│   │   └── renderer/
│   │       ├── index.html
│   │       ├── app.tsx               # Phase 1: open file + play/stop
│   │       └── styles.css
│   ├── package.json
│   └── tsconfig.json
│
└── blue-ui/                          # Future: full UI components
    └── (placeholder)
```

**Structure Decision**: Monorepo with npm workspaces. Three active packages:
- `blue-data`: Universal TypeScript — zero Node.js built-ins, works in browser and Node
- `blue-engine-client`: Node.js only — ZMQ communication with C++ blue-engine
- `blue-app`: Electron — ties data + engine together with minimal UI

## Complexity Tracking

> **Constitution Check passed with no violations.** No complexity justification needed.
