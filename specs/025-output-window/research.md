# Research: Output Window

**Date**: 2026-04-27
**Feature**: 025-output-window

## Decision 1: API Design — Mirror NetBeans IOProvider

**Decision**: Implement a TypeScript `IOProvider` / `InputOutput` / `OutputWriter` API that mirrors the NetBeans Output Window API used by Java Blue.

**Rationale**: Java Blue's rendering code (`CS6RealtimeRenderService`, `CS6DiskRendererService`, `ProcessConsole`) all follow the same pattern: get a named tab via `IOProvider.getDefault().getIO(name, false)`, call `io.getOut().reset()` to clear, call `io.getOut().println()` to write, call `io.select()` to bring to front. Mirroring this API means the TypeScript rendering code follows the same structure, making it easy to verify parity.

**Key API surface needed (based on actual Java Blue usage)**:

| NetBeans Method | Java Blue Usage | TS Equivalent |
|----------------|-----------------|---------------|
| `IOProvider.getDefault().getIO(name, newIO)` | Every render service | `ioProvider.getIO(name, newIO?)` |
| `io.getOut().reset()` | Clear before render | `io.out.reset()` |
| `io.getOut().append(text)` / `println(text)` | Write output lines | `io.out.write(text)` / `io.out.println(text)` |
| `io.getOut().append(msgText)` in callback | Per-message from Csound | Same pattern in Electron callback |
| `io.select()` | Bring tab to front | `io.select()` |
| `IOColors.setColor(io, OUTPUT, Color.WHITE)` | Style output | `io.setColor('output', '#ffffff')` |

**Not needed (Java Blue never uses)**:
- `getIn()` / `setInputVisible()` — no stdin
- `OutputListener` / hyperlinks — no clickable lines
- `IOFolding` — no collapsible regions
- `IOPosition` — no scroll bookmarks
- `setErrSeparated()` — errors mixed into main output in Java Blue

**Alternatives considered**:
- Simple `console.log` replacement: Too limited, no UI, no tabs
- Raw Zustand store without IOProvider abstraction: Loses the Java parity, harder to port rendering code
- Node.js `EventEmitter`-based: Less idiomatic for Zustand/React architecture

---

## Decision 2: IPC Architecture — Batched Output Forwarding

**Decision**: Engine stdout/stderr lines are batched and forwarded via a single IPC channel `engine-output` using `webContents.send()` from the main process.

**Rationale**: Csound can produce hundreds of messages per second during rendering. Sending each line as a separate IPC message would flood the renderer. Batching with a small time window (e.g., 50ms or per-chunk) reduces IPC overhead while keeping latency below the 1-second success criterion.

**Architecture**:
1. `EngineBridge` already captures stdout/stderr from the Csound child process
2. Extend `EngineBridge` to batch lines and emit via callback
3. `main.ts` subscribes to the callback and forwards via `mainWindow.webContents.send('engine-output', { tabName, text, type })`
4. `preload.ts` exposes `onEngineOutput` listener
5. `use-ipc-listeners.ts` wires the event to the output store's `appendToTab` action
6. The store appends lines to the active tab's line buffer

**Alternatives considered**:
- Per-line IPC: Too many messages, high overhead
- Shared memory: Unnecessary complexity for text output
- Websocket: Already using IPC; no need for additional transport

---

## Decision 3: Virtualized Text Rendering

**Decision**: Use `@tanstack/react-virtual` for the output text area to handle 10,000+ lines without DOM bloat.

**Rationale**: The project already uses `@tanstack/react-virtual` (referenced in spec 021). Csound can produce thousands of lines of output. A naive approach of rendering all lines as DOM elements would cause severe lag. Virtualization renders only the visible lines.

**Implementation approach**:
- Each `OutputLine` is a simple `{ id, text, type }` record
- The panel uses `useVirtualizer` from `@tanstack/react-virtual`
- Lines are rendered as `<div>` elements within a scrollable container
- Auto-scroll to bottom is enabled by default, disabled when user scrolls up

**Alternatives considered**:
- `<textarea>`: No per-line styling (can't color stderr differently)
- ContentEditable div: Complex, hard to virtualize
- CodeMirror: Overkill for read-only output; heavy dependency

---

## Decision 4: Panel Registration — Output Auxiliary Group

**Decision**: Register the Output panel as an auxiliary panel in the `output-main` group (bottom edge), with `openAtStartup: true`.

**Rationale**: Matches Java Blue's Output window position (bottom of the IDE). The existing `workbench-menu.ts` already supports `mode: 'output'` panels. The `auxiliary-layout.ts` already has an `output-main` seed group for bottom-edge panels.

**Registration**:
- Add `OutputTopComponent` to `WORKBENCH_PANEL_REGISTRY` with `mode: 'output'`, `auxiliaryGroupId: 'output-main'`, `openAtStartup: true`
- Add render branch in `DockviewPanel.tsx` for `OutputTopComponent` → `<OutputPanel />`
- Add "Output" entry in Window menu via `buildNativeWindowMenu()` in `main.ts`

**Alternatives considered**:
- Non-auxiliary dockview panel: Less consistent with Java Blue's fixed-position output window
- Separate BrowserWindow: Not integrated with the workbench
