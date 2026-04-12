# Blue TypeScript Port — Remaining Work Plan

This document captures the remaining phases after Phase 10 completion (157/157 tasks).

## Completed (Phase 1-10)

`@blue/data` package is complete:
- 157/157 tasks done
- 115 tests passing
- ~180 source files, ~12,000 lines
- Zero Node.js built-ins, browser + Node compatible

## Remaining Phases (High-Level)

### Phase 11: Complete SoundObjects, NoteProcessors, BSB

**Goal:** Port all remaining SoundObject types, NoteProcessors, and BlueSynthBuilder data types so the data model is truly complete.

**Sub-tasks:**
1. **SoundObject types** (12 types):
   - `AudioFile` — disk-based audio file playback sound object
   - `Sound` — simple sound object
   - `External` — external process sound object
   - `LineObject` — line-based note generator
   - `ZakLineObject` — Zak memory line object
   - `PatternObject` — pattern-based sound object
   - `PianoRoll` — piano roll sound object
   - `NotationObject` — notation-based sound object
   - `JMask` — mask sound object
   - `Instance` — instance/reference sound object
   - `TrackerObject` — tracker-style sound object
   - `FrozenSoundObject` — frozen/cached sound object

2. **NoteProcessors** (~15 types):
   - `RandomAddProcessor`, `RandomMultiplyProcessor`
   - `LineAddProcessor`, `LineMultiplyProcessor`
   - `PchAddProcessor`, `PchInversionProcessor`
   - `InversionProcessor`, `RetrogradeProcessor`, `RotateProcessor`
   - `TimeWarpProcessor`, `TuningProcessor`
   - `SwitchProcessor`, `SubListProcessor`, `EqualsProcessor`
   - `PythonProcessor` (data preservation, JVM subprocess for generation)
   - `ValueTimeMapper`

3. **BlueSynthBuilder (BSB)** data types:
   - BSB object types: BSBObject, BSBComponent, BSBParameter, etc.
   - XML serialization for BSB instruments
   - CSD code generation from BSB data

**Why first:** Completes the data model so the Electron app can load any `.blue` file without loss.

### Phase 12: Electron Application

**Goal:** Build the Electron app with UI for opening `.blue` files, displaying project structure, and playing via blue-engine.

**Sub-tasks:**
1. **File management:**
   - Open `.blue` file dialog
   - Save / Save As
   - Recent files list
   - Auto-save / temp file recovery

2. **Project display:**
   - Project metadata (title, author, sample rate, etc.)
   - Score structure visualization
   - Audio layer timeline
   - Pattern layer grid
   - PolyObject nested layers

3. **Playback controls:**
   - Play / Stop / Pause buttons
   - Engine lifecycle management (spawn/monitor blue-engine)
   - CSD generation and transmission via ZMQ
   - Status indicators (playing, stopped, error)

4. **Shell UI:**
   - Minimal but functional interface
   - Menu bar
   - Status bar
   - Error notifications

**Why second:** Gives you a working desktop app that can load and play any `.blue` file, even with stubbed engine client.

### Phase 13: Engine Client Integration

**Goal:** Implement the ZeroMQ client for the C++ blue-engine process and wire it into the Electron app for real audio playback.

**Sub-tasks:**
1. **`@blue/engine-client` implementation:**
   - ZMQ REQ/REP protocol client (CREATE_ENGINE, SET_OPTION, COMPILE_ORC, READ_SCORE, START, STOP, EXIT)
   - Channel operations (CREATE_CHANNEL, SET_CHANNEL, GET_CHANNEL)
   - Automation operations (CREATE, UPDATE, DELETE, ENABLE, DISABLE, LIST, CLEAR)
   - Engine process lifecycle (spawn, monitor, restart on crash)
   - Binary protocol encoding/decoding

2. **Shared memory access:**
   - POSIX shared memory reader/writer (macOS/Linux)
   - Windows shared memory support
   - Or proxy through ZMQ channel commands for Phase 1

3. **Electron app integration:**
   - Wire engine bridge to engine-client
   - Real-time channel value updates
   - Automation curve editing in UI
   - Playback status from engine

**Why third:** Depends on Phase 12 (app shell) being in place. This is the final piece that makes audio actually play.

## Dependencies

```
Phase 11 (SoundObjects/Processors/BSB)
       ↓ (data model complete)
Phase 12 (Electron App)
       ↓ (app shell ready)
Phase 13 (Engine Client Integration)
       ↓
Working desktop app that loads .blue files and plays them
```

## Estimated Scope

| Phase | Focus | Est. Tasks | Effort |
|-------|-------|-----------|--------|
| 11 | SoundObjects + NoteProcessors + BSB | ~40 | Medium |
| 12 | Electron App UI | ~25 | Medium |
| 13 | Engine Client Integration | ~15 | Medium |
| **Total** | | **~80** | |
