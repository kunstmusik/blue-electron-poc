# Implementation Plan: Output Window

**Branch**: `025-output-window` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-output-window/spec.md`

## Summary

Implement a tabbed output window panel that captures Csound engine stdout/stderr in real time during rendering sessions. The API mirrors the NetBeans Output Window (IOProvider/InputOutput/OutputWriter) used in Java Blue, supporting named tabs ("Csound" for realtime, "Csound (Disk)" for disk render), with clear/reset/select operations matching Java Blue's pre-render initialization sequence.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x
**Primary Dependencies**: Zustand 5.x (output store), dockview 5.2.0 (panel registration), `@tanstack/react-virtual` (virtualized text rendering), existing IPC bridge (preload/main)
**Storage**: Ephemeral — no persistence (matches Java Blue behavior)
**Testing**: Vitest 4.x
**Target Platform**: Electron desktop app (macOS primary, Windows/Linux secondary)
**Project Type**: Desktop application feature
**Performance Goals**: Handle 10,000+ lines without UI lag; output appears within 1 second
**Constraints**: Must not block main process; IPC must batch high-frequency output
**Scale/Scope**: 2-3 named tabs; thousands of output lines per session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Data-First, UI-Separated | **PASS** | Output window is purely a UI/runtime feature — no data model changes to `blue-data`. The IOProvider API lives in `blue-app/shared`. No `blue-data` changes needed. |
| II. Backwards-Compatible Serialization | **PASS** | No serialization changes. Output is ephemeral. |
| III. JVM Dependencies Preserved | **PASS** | No JVM-dependent code. |
| IV. Engine as External Process | **PASS** | Stdout/stderr from the engine process are already captured in `EngineBridge`; we forward them via IPC instead of just logging. |
| V. Test-First for Serialization | **N/A** | No serialization in this feature. |

**Post-Phase 1 re-check**: Still passes. All new code is in `blue-app` (renderer + main + shared).

## Project Structure

### Documentation (this feature)

```text
specs/025-output-window/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── io-provider-api.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/blue-app/
├── src/shared/
│   ├── io-provider.ts              # IOProvider/InputOutput/OutputWriter types + store interface
│   └── project-editor.ts           # (existing — no changes needed for output window)
├── src/main/
│   └── main.ts                     # Wire engine stdout/stderr → IPC 'engine-output' channel
├── src/preload/
│   └── preload.ts                  # Add onEngineOutput listener
├── src/renderer/
│   ├── stores/
│   │   └── output-store.ts         # Zustand store: tabs, lines, append/reset/select actions
│   ├── components/workbench/
│   │   ├── panels/output/
│   │   │   └── OutputPanel.tsx     # Tabbed virtualized output panel component
│   │   └── DockviewPanel.tsx       # (existing — add OutputTopComponent branch)
│   ├── hooks/
│   │   └── use-ipc-listeners.ts    # (existing — wire engine-output IPC to output store)
│   └── types/
│       └── global.d.ts             # (existing — add onEngineOutput type)
├── src/renderer/tests/
│   └── output-store.test.ts        # Unit tests for output store
└── src/shared/
    └── workbench-menu.ts           # (existing — add OutputTopComponent to panel registry)
```

**Structure Decision**: All new code lives in `packages/blue-app`. No `blue-data` or `blue-engine-client` changes. The output store, panel component, and IPC wiring are contained within the app package.

## Complexity Tracking

No constitution violations. No entries needed.
