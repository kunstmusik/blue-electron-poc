# Research: Blue Java Data Port

This document consolidates findings from the `research/` folder for use during implementation.

## Source Documents

| Document | Path | Content |
|----------|------|---------|
| Project Analysis & Plan | `research/001-project-analysis-and-plan.md` | Full architecture, monorepo structure, framework decision, Phase 1 plan, risks |
| Data Class Dependency Graph | `research/002-data-class-dependency-graph.md` | All 85+ classes mapped to TS targets in 14 dependency layers, env compatibility (✅/🟡/🔴) |
| Engine Protocol Reference | `research/003-engine-protocol.md` | Complete ZMQ binary protocol reference for TypeScript client |

## Key Technical Decisions

### Framework: Electron (not Tauri)
- Blue-engine runs as a separate process regardless — Node.js talks to it via ZMQ
- TypeScript data classes are directly usable from Node
- Tauri would add unnecessary Rust FFI layer
- Existing JS example client (`test_client.js`) is the reference for TS port

### `blue-data` is universal (browser + Node)
- Zero Node.js built-ins (no `fs`, `path`, `child_process`, `Buffer`)
- File I/O is caller's responsibility — `BlueData.loadFromString()` / `saveToString()`
- XML parser: `@rgrove/parse-xml` (pure JS) wrapped in `Element`/`Elements` API
- JVM-dependent score generation (Python/Clojure) skipped in browser, Java subprocess in Node

### Serialization: XML compatible with Java `electric.xml`
- Must read/write exact same format as Java Blue for bi-directional compatibility
- Object reference maps (objRefMap) for shared object references
- Migration system operates on raw XML before deserialization (2 existing upgraders: 2.1.10, 2.3.0)

### Engine Communication: ZMQ REQ/REP
- Binary protocol over ZeroMQ
- No FFI needed — pure ZMQ from Node.js
- Shared memory proxied through ZMQ channel commands in Phase 1

## Class Count Summary

| Category | Classes | Env |
|----------|---------|-----|
| Foundation (utilities, interfaces) | 11 | ✅ |
| Time system | 10 | ✅ |
| Project properties, instruments | 7 | ✅ |
| Score layer base interfaces | 11 | ✅ |
| Audio score layers | 6 + 2 Csound templates | ✅ |
| Pattern score layers | 4 | ✅ |
| PolyObject (nested layer group) | 3 | ✅ |
| SoundObject base types | 9 | ✅ |
| Concrete SoundObjects | 20 | ✅ + 🟡 (PythonObject) |
| Mixer system | 8 | ✅ |
| Automation system | 8 | ✅ |
| Note processors | 20 | ✅ + 🟡 (PythonProcessor) |
| Live data & MIDI | 7 | ✅ |
| Scratch pad, plugins | 3 | ✅ + 🟡 (Clojure types) |
| Migration system | 5 | ✅ |
| Serialization | 3 | ✅ |
| **Root: BlueData** | **1** | ✅ |
| **Total** | **~136 files** | |

## Embedded Csound Resources

Two Csound code resources must be embedded as template strings:

1. **`playback_instrument.orc`** — diskin2-based instrument for audio clip playback. Parameters: audio file path, file start time, offset, duration, fade types/times, looping flag. Located at `blue/score/layers/audio/core/playback_instrument.orc` in Java source.

2. **`blue_fade.udo`** — Complete Csound UDO implementing 5 fade envelope types (Linear, Constant Power, Symmetric, Fast, Slow) based on Ardour's `Curve.cpp`. Appended to global orc during CSD generation. Located at `blue/score/layers/audio/core/blue_fade.udo` in Java source.
