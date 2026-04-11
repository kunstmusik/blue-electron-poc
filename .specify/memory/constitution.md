# Blue TypeScript Port Constitution

## Core Principles

### I. Data-First, UI-Separated
All business logic and data classes live in `blue-data` — a pure TypeScript package with zero UI dependencies and zero Node.js runtime dependencies. The data layer must work identically in both browser and Node.js environments. UI layers (Electron renderer, future web app) consume `blue-data` as a dependency.

### II. Backwards-Compatible Serialization
The TypeScript data classes must load and save `.blue` project files that are byte-for-byte compatible with the existing Java application. XML serialization uses the `electric.xml`-compatible format. Migration system (`UpgradeManager`) operates on raw XML before deserialization, exactly as the Java version does. Round-trip loading and saving of existing `.blue` files is the primary correctness criterion.

### III. JVM Dependencies Preserved, Not Replaced
SoundObjects and note processors that depend on JVM runtimes (Jython for `PythonObject`, Clojure for `ClojureObject`) preserve their data on load/save in all environments. Score generation for these types uses a Java subprocess in Node.js (reusing existing Java code). In browser, these types load/save silently but skip generation with a warning. `JavaScriptObject` is ported natively using JS `vm`/`Function` — works in both environments.

### IV. Engine as External Process
The blue-engine C++ process communicates via ZeroMQ REQ/REP binary protocol + shared memory. The TypeScript client (`blue-engine-client`) uses this protocol directly — no FFI, no native bindings beyond ZMQ. Shared memory access is proxied through ZMQ commands in Phase 1 to avoid native addon complexity.

### V. Test-First for Serialization
Every data class ported from Java must have round-trip serialization tests: load a known `.blue` XML fragment → save to XML → compare output matches expected format → reload → verify object state equivalence. This is non-negotiable for data integrity.

## Additional Constraints

### File I/O Abstraction
`blue-data` never imports `fs`, `path`, `child_process`, `Buffer`, or any Node.js built-in. File paths are stored as strings. Loading and saving files is the caller's responsibility. The public API is `BlueData.loadFromString(xml)` and `blueData.saveToString()`.

### XML Parser
Use `@rgrove/parse-xml` (pure JS, spec-compliant XML 1.0) wrapped in a minimal `Element`/`Elements` API mirroring the Java `electric.xml` library. No DOM dependency. Works in both browser and Node.

### Monorepo Structure
npm workspaces with `packages/blue-data`, `packages/blue-engine-client` (Node-only), `packages/blue-app` (Electron), and future `packages/blue-ui`. Each package has its own `tsconfig.json` extending `tsconfig.base.json`.

## Development Workflow

### Porting Order
Classes are ported in strict dependency order (see `research/002-data-class-dependency-graph.md`). Foundation types → time system → score layer interfaces → audio/pattern layers → SoundObjects → instruments → mixer → root BlueData. No skipping layers.

### Research Integration
All architecture decisions, class mappings, and protocol documentation live in `research/`. These documents are the source of truth for implementation details. Changes to architecture require updating the relevant research document.

### Spec-Driven Development
Features are defined via `/speckit.specify` before implementation. Technical plans via `/speckit.plan` reference the research documents. Task breakdowns via `/speckit.tasks` follow the dependency order from the class graph.

**Version**: 1.0.0 | **Ratified**: 2026-04-11 | **Last Amended**: 2026-04-11
