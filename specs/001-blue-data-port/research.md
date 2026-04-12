# Research: Blue Java Data Port

**Status**: ✅ **COMPLETE** — All 157/157 tasks done, 115 tests passing

This document consolidates findings from the `research/` folder for use during implementation.

## Source Documents

| Document | Path | Content |
|----------|------|---------|
| Project Analysis & Plan | `research/001-project-analysis-and-plan.md` | Full architecture, monorepo structure, framework decision, Phase 1-10 plan |
| Data Class Dependency Graph | `research/002-data-class-dependency-graph.md` | All 85+ classes mapped to TS targets in 14 dependency layers, env compatibility (✅/🟡/🔴) |
| Engine Protocol Reference | `research/003-engine-protocol.md` | Complete ZMQ binary protocol reference for TypeScript client |

## Key Technical Decisions

### Framework: Electron (not Tauri)
- Blue-engine runs as a separate process regardless — Node.js talks to it via ZMQ
- TypeScript data classes are directly usable from Node
- Tauri would add unnecessary Rust FFI layer
- Existing JS example client (`test_client.js`) is the reference for TS port

### `blue-data` is universal (browser + Node)
- Zero Node.js built-ins (no `fs`, `path`, `crypto`, `child_process`, `Buffer`)
- Zero `require()` calls, zero `import()` calls — all static ES module imports
- File I/O is caller's responsibility — `BlueData.loadFromString()` / `saveToString()`
- XML parser: `@rgrove/parse-xml` (pure JS) wrapped in `Element`/`Elements` API
- JVM-dependent score generation (Python/Clojure) skipped in browser, Java subprocess in Node
- `JavaScriptObject` uses `new Function()` — works in both Node and browser

### Serialization: XML compatible with Java `electric.xml`
- Must read/write exact same format as Java Blue for bi-directional compatibility
- Object reference maps (objRefMap) for shared object references
- Migration system operates on raw XML before deserialization (2 existing upgraders: 2.1.10, 2.3.0)

### Engine Communication: ZMQ REQ/REP
- Binary protocol over ZeroMQ
- No FFI needed — pure ZMQ from Node.js
- Shared memory proxied through ZMQ channel commands in Phase 1

## Implementation Results

| Metric | Value |
|--------|-------|
| Total tasks | 157 |
| Tasks complete | 157 (100%) |
| Test files | 8 |
| Tests passing | 115 |
| Source files | ~180 |
| Lines of code | ~12,000 |
| Runtime dependencies | 1 (`@rgrove/parse-xml`) |
| `require()` calls | 0 |
| `import()` calls | 0 |
| Node.js built-ins | 0 |

## Phase Completion

| Phase | Focus | Tasks | Status |
|-------|-------|-------|--------|
| 1 | Setup & Tooling | 5 | ✅ |
| 2 | Foundational (XML, migration, time) | 25 | ✅ |
| 3 | US1: Open & Play | 36 | ✅ |
| 4 | US2: Round-Trip Save | 16 | ✅ |
| 5 | US3: Audio Layers | 13 | ✅ |
| 6 | US4: Pattern Layers | 9 | ✅ |
| 7 | US5: Node.js Library | 4 | ✅ |
| 8 | US6: JVM SoundObjects | 10 | ✅ |
| 9 | Remaining Data Types | 32 | ✅ |
| 10 | Polish & Cross-Cutting | 7 | ✅ |

## Next Steps

The `@blue/data` package is complete. Remaining work outside this spec:

1. **`@blue/engine-client`** — Implement the ZeroMQ client for the C++ blue-engine process (currently scaffolded, no implementation)
2. **`@blue/app`** — Build the Electron application with UI for opening `.blue` files and playing them (currently scaffolded, no implementation)
3. **Additional SoundObject types** — Port remaining types from Java: `AudioFile`, `Sound`, `External`, `LineObject`, `ZakLineObject`, `PatternObject`, `PianoRoll`, `NotationObject`, `JMask`, `Instance`, `TrackerObject`, `FrozenSoundObject` (registry supports easy addition)
4. **BlueSynthBuilder (BSB)** — Port BSB data types and CSD code generation (currently stubbed)
5. **Full note processors** — Implement remaining processor types: `RandomAddProcessor`, `RandomMultiplyProcessor`, `LineAddProcessor`, `LineMultiplyProcessor`, `PchAddProcessor`, `PchInversionProcessor`, `InversionProcessor`, `RetrogradeProcessor`, `RotateProcessor`, `TimeWarpProcessor`, `TuningProcessor`, `SwitchProcessor`, `SubListProcessor`, `EqualsProcessor`, `PythonProcessor`, `ValueTimeMapper`
