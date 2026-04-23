# Implementation Plan: Java Main Toolbar Parity

**Branch**: `020-main-toolbar-parity` | **Date**: 2026-04-23 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/spec.md`

## Summary

Replace the current renderer-owned `MenuBar` with a Java Blue-style main toolbar composed of transport controls, playhead display, selection display, and Blue Live controls; move file and window ownership into the native Electron menu bar; and update the BrowserWindow title to `Blue - [file].blue` when a project is loaded. The implementation should stay within the current React/Electron/Zustand architecture, reuse existing rounded-rectangle chrome, and drive the playhead from authoritative `blue-engine` transport snapshots with renderer-side interpolation rather than a pure wall-clock estimate or per-frame IPC stream.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: Electron `Menu`/`BrowserWindow`, Zustand 5.x stores, `@blue/data` time/tempo utilities, `dockview` 5.2.0 workbench state, `lucide-react` transport icons  
**Storage**: Existing renderer Zustand stores plus project snapshot IPC; fixed-per-performance playback clock metadata cached in the renderer playback store; optional lightweight renderer preference persistence for toolbar-only toggles via existing local storage patterns  
**Testing**: Vitest renderer/store tests, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, `git diff --check`  
**Target Platform**: Electron desktop app, macOS-first parity with cross-platform native menu behavior  
**Project Type**: Desktop application UI + Electron main/preload integration  
**Performance Goals**: Toolbar interactions should feel immediate, and playhead display updates should animate smoothly from authoritative engine timing without visible drift, renderer jank, or per-frame main-process IPC chatter  
**Constraints**: Follow Java Blue source behavior first, do not leave duplicate renderer/native menu ownership, keep file identity in the OS window title instead of toolbar text, treat broader Java `File` menu parity as follow-on work, and defer shared-memory transport telemetry until a later realtime-data slice  
**Scale/Scope**: One top-level toolbar replacement plus associated native menu, preload/IPC, project snapshot, playback-store, and tests; no full Java menu-bar port and no new Blue Live backend runtime in this slice

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. Toolbar UI reads project/playback state from stores and shared snapshots rather than embedding data logic into components.
- **Backwards-Compatible Serialization**: PASS. The slice only exposes existing project state (`renderStartTime`, `renderEndTime`, `loopRendering`, tempo map) through shared snapshots; `.blue` format behavior remains unchanged.
- **JVM Dependencies Preserved, Not Replaced**: PASS. No JVM-backed generation path changes.
- **Engine as External Process**: PASS. Playback still runs through `blue-engine`; the toolbar reflects engine-authored transport state rather than bypassing the engine.
- **Test-First for Serialization**: PASS/N/A. No new serialization class is introduced; snapshot additions are UI-facing.
- **Research Integration**: PASS. Java, Ardour, and engine timing references for toolbar/menu behavior are captured in `research.md` and `/Users/stevenyi/work/blue-electron/research/005-playback-display-design.md`.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── main-toolbar-parity-surface.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/
├── App.tsx
├── components/menu-bar/
│   └── MenuBar.tsx
├── hooks/
│   └── use-ipc-listeners.ts
├── stores/
│   ├── playback-store.ts
│   ├── project-store.ts
│   └── workbench-store.ts
└── components/workbench/
    ├── WindowMenu.tsx
    └── panel-registry.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
└── project-editor.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/
└── preload.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/
├── main.ts
└── engine-bridge.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
├── app.test.ts
├── project-editor-panels.test.ts
└── workbench-auxiliary.test.ts
```

**Structure Decision**: Keep the toolbar as renderer app chrome, but move reusable panel metadata and native menu command wiring into shared/main-preload boundaries so the Electron menu bar becomes the single owner of File/Window commands. Extend the playback store to cache authoritative engine timing metadata for the active performance and let the renderer interpolate the display between snapshots.

## Complexity Tracking

No constitution violations are required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/research.md](/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/research.md) and [/Users/stevenyi/work/blue-electron/research/005-playback-display-design.md](/Users/stevenyi/work/blue-electron/research/005-playback-display-design.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/contracts/main-toolbar-parity-surface.md](/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/contracts/main-toolbar-parity-surface.md)
- [/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/020-main-toolbar-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. The design uses shared snapshot/state models for toolbar displays and native menu commands.
- **Backwards-Compatible Serialization**: PASS. Toolbar state is derived from existing `BlueData` fields and Electron UI preferences only.
- **Research Integration**: PASS. Java toolbar/menu sources, engine timing state, and Ardour clocking references are explicitly recorded in the design artifacts.
