# Implementation Plan: Complete Blue Data Model + Electron App + Engine Integration

**Branch**: `002-complete-blue-data` | **Date**: 2026-04-11 | **Spec**: [spec.md](./spec.md)
**Prerequisite**: Phase 1-10 from `001-blue-data-port` (157/157 tasks complete)

## Summary

Three sequential phases to complete the Blue TypeScript port:

1. **Phase 11**: Port remaining SoundObjects (12 types), NoteProcessors (~15 types), and BlueSynthBuilder data types
2. **Phase 12**: Build Electron app with UI for opening `.blue` files, displaying project structure, and play/stop controls
3. **Phase 13**: Implement `@blue/engine-client` (ZMQ client for C++ blue-engine) and wire it into the Electron app

## Technical Context

**Language/Version**: TypeScript 5.8+, ES2022, bundler module resolution
**Primary Dependencies**: `@rgrove/parse-xml` (XML), `zeromq` (ZMQ), Electron 33 (app shell)
**Storage**: `.blue` XML files (filesystem via caller — `blue-data` has no I/O)
**Testing**: vitest (unit + integration), performance benchmarks
**Target Platform**: macOS first, then Windows/Linux
**Performance Goals**: Load 5MB `.blue` in <3s; CSD gen for 1000+ clips in <5s; Play response <2s
**Constraints**: `@blue/data` must remain zero Node.js built-ins; all static imports only

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Data-First, UI-Separated** | ✅ | Phase 11 extends `blue-data` (no UI). Phases 12-13 add separate packages. |
| **II. Backwards-Compatible Serialization** | ✅ | All new SoundObjects/NoteProcessors must have XML round-trip tests. |
| **III. JVM Dependencies Preserved** | ✅ | New types follow same patterns (PythonProcessor data-only, JavaScriptObject via `new Function()`). |
| **IV. Engine as External Process** | ✅ | Phase 13 implements ZMQ client — no FFI. |
| **V. Test-First for Serialization** | ✅ | Every new type gets round-trip XML test. |

## Project Structure

### Phase 11: SoundObjects + NoteProcessors + BSB (packages/blue-data)

```
packages/blue-data/src/
├── sound-objects/
│   ├── audio-file.ts          # FR-201
│   ├── sound.ts
│   ├── external.ts
│   ├── line-object.ts
│   ├── zak-line-object.ts
│   ├── pattern-object.ts
│   ├── piano-roll.ts
│   ├── notation-object.ts
│   ├── j-mask.ts
│   ├── instance.ts
│   ├── tracker-object.ts
│   └── frozen-sound-object.ts
│
├── note-processors/
│   ├── random-add-processor.ts
│   ├── random-multiply-processor.ts
│   ├── line-add-processor.ts
│   ├── line-multiply-processor.ts
│   ├── pch-add-processor.ts
│   ├── pch-inversion-processor.ts
│   ├── inversion-processor.ts
│   ├── retrograde-processor.ts
│   ├── rotate-processor.ts
│   ├── time-warp-processor.ts
│   ├── tuning-processor.ts
│   ├── switch-processor.ts
│   ├── sublist-processor.ts
│   ├── equals-processor.ts
│   ├── python-processor.ts      # Data preservation (Phase 8 pattern)
│   └── value-time-mapper.ts
│
└── instruments/bsb/
    ├── bsb-object.ts            # FR-204
    ├── bsb-component.ts
    ├── bsb-parameter.ts
    └── bsb-compilation-unit.ts
```

### Phase 12: Electron App (packages/blue-app)

```
packages/blue-app/
├── src/
│   ├── main/
│   │   ├── main.ts              # Electron main process, menu, file dialog
│   │   ├── file-manager.ts      # Open/save/autosave
│   │   ├── engine-bridge.ts     # Spawns blue-engine, manages lifecycle
│   │   └── ipc-handlers.ts      # Renderer ↔ main process IPC
│   ├── preload/
│   │   └── preload.ts           # Context bridge (file, play, status)
│   └── renderer/
│       ├── index.html
│       ├── app.tsx              # Main UI: project display + play/stop
│       ├── project-view.tsx     # Score layers, instruments, mixer display
│       └── styles.css
├── package.json
└── tsconfig.json
```

### Phase 13: Engine Client (packages/blue-engine-client)

```
packages/blue-engine-client/
├── src/
│   ├── index.ts
│   ├── engine-client.ts         # ZMQ REQ/REP protocol client
│   ├── engine-process.ts        # Spawn/monitor blue-engine executable
│   ├── protocol.ts              # Binary protocol constants + encoding
│   ├── channel.ts               # Channel operations
│   └── automation.ts            # Automation curve operations
├── package.json
└── tsconfig.json
```

## Phase Dependencies

```
Phase 11 (blue-data extensions)
  └─ Depends on: 001-blue-data-port (existing foundation)

Phase 12 (blue-app UI)
  └─ Depends on: Phase 11 (complete data model), 001-blue-data-port (BlueData, Score, etc.)

Phase 13 (blue-engine-client + integration)
  └─ Depends on: Phase 12 (app shell with Play/Stop wired to stub)
```

## Complexity Tracking

> All phases follow established patterns from Phase 1-10:
> - SoundObjects: extend AbstractSoundObject, implement loadFromXML/saveAsXML/generateForCSD/deepCopy
> - NoteProcessors: extend NoteProcessor, implement process/getDisplayName/deepCopy
> - BSB: follow Java BSB structure, CSD generation via template substitution
> - Electron app: follows established patterns from analysis docs
> - Engine client: follows ZMQ binary protocol from research/003-engine-protocol.md
