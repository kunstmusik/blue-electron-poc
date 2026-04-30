# Implementation Plan: MIDI Input Panel And Virtual Keyboard Parity

**Branch**: `033-midi-input-virtual-keyboard-parity` | **Date**: 2026-04-30 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/spec.md](/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/spec.md`

## Summary

Replace the current MIDI Input and Virtual Keyboard placeholders with Java Blue-parity workbench panels. Extend the existing project snapshot/patch bridge with editable `MidiInputProcessor` state, add a pure MIDI trigger-mapping helper in `@blue/data`, and add a Blue Live note-trigger IPC path so the Virtual Keyboard can play notes through the current project's MIDI input settings. External MIDI device enumeration and OS-level hardware routing remain out of scope for this slice.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict monorepo packages  
**Primary Dependencies**: `@blue/data` `MidiInputProcessor`/`MidiKeyMapping`/`MidiVelocityMapping`/`Scale`, existing `BlueData` and Blue Live engine session code, Electron IPC/preload bridge, Zustand 5.x project/workbench/blue-live stores, Dockview 5.2.0 workbench shell, Vitest 4.x  
**Storage**: Main-process in-memory `BlueData` remains canonical; renderer consumes serializable project snapshots and sends explicit patch intents; `.blue` XML remains the only durable persistence; Virtual Keyboard performance state is transient renderer state only  
**Testing**: Vitest unit and renderer tests in `@blue/data` and `@blue/app`, plus `pnpm --filter @blue/data test`, `pnpm --filter @blue/data build`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, and `git diff --check`  
**Target Platform**: Electron desktop on macOS first, while preserving current cross-platform workbench behavior  
**Project Type**: Desktop application feature spanning shared data-model, Electron main/preload, and React renderer panels  
**Performance Goals**: Virtual Keyboard note-on and note-off dispatch should feel immediate during Blue Live use, with no stuck notes after release or All Notes Off; panel edits should use the current optimistic snapshot/patch flow without noticeable UI lag  
**Constraints**: Preserve Java `.blue` compatibility; keep `@blue/data` browser-safe and Node-free; route live note triggering only through a running Blue Live session; follow existing workbench design language; do not expand this slice into OS MIDI device enumeration or global MIDI settings  
**Scale/Scope**: One project-backed MIDI Input panel, one Virtual Keyboard panel, one new project snapshot/patch extension for MIDI input state, one Blue Live note-trigger IPC surface, and the focused tests needed for the requested manual workflow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. Project-owned MIDI processor state and any pitch/velocity mapping helper stay in `@blue/data` or shared snapshot code; renderer panels only consume snapshots and emit patch or note-trigger intents.
- **Backwards-Compatible Serialization**: PASS. The feature requires explicit `MidiInputProcessor` round-trip coverage and must not drop scale or constant values on save/reopen.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Java Blue MIDI UI and trigger behavior are the source of truth for parity decisions.
- **Engine as External Process**: PASS. The feature routes note events into the existing Blue Live external engine session rather than embedding audio or MIDI processing in the renderer.
- **Test-First for Serialization**: PASS. `MidiInputProcessor` snapshot, scale conversion, and Blue Live note routing tests are required before panel work is considered complete.
- **Research Integration**: PASS. The relevant Java MIDI UI/runtime anchors and current TypeScript seams are documented in `research.md`.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── midi-input-virtual-keyboard-surfaces.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── midi/
│   ├── midi-input-processor.ts
│   ├── midi-key-mapping.ts
│   ├── midi-velocity-mapping.ts
│   └── [new trigger-mapping helper/tests for Java-compatible live note processing]
├── sound-objects/piano-roll/
│   └── scale.ts
└── index.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
└── project-editor.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/
├── main.ts
└── blue-live-engine.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/
└── preload.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/
├── stores/
│   ├── project-store.ts
│   └── workbench-store.ts
├── components/menu-bar/
│   └── ToolbarBlueLive.tsx
├── components/workbench/
│   └── DockviewPanel.tsx
├── components/workbench/panels/
│   ├── [new] MidiInputPanel.tsx
│   ├── [new] VirtualKeyboardPanel.tsx
│   └── [new] midi-input/ and virtual-keyboard/ support components/hooks
└── tests/
    └── [new renderer/main contract and panel tests for MIDI input and virtual keyboard]
```

**Structure Decision**: Keep MIDI processor data and mapping logic in `@blue/data`, extend the existing main-process project snapshot/patch bridge for editable MIDI input state, route Virtual Keyboard note events through a new Blue Live note-trigger IPC surface in Electron main, and render both panels inside the current Dockview workbench shell.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/research.md](/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/data-model.md](/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/contracts/midi-input-virtual-keyboard-surfaces.md](/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/contracts/midi-input-virtual-keyboard-surfaces.md)
- [/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/quickstart.md](/Users/stevenyi/work/blue-electron/specs/033-midi-input-virtual-keyboard-parity/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. The design keeps editable MIDI processor state in canonical project data and moves Java-compatible trigger mapping into a pure helper instead of burying it in renderer code.
- **Backwards-Compatible Serialization**: PASS. Snapshot and patch additions are narrow and are backed by explicit round-trip tests for MIDI processor and scale data.
- **JVM Dependencies Preserved, Not Replaced**: PASS. The plan uses Java MIDI UI/runtime classes as the parity source and does not invent a non-Java behavior model.
- **Engine as External Process**: PASS. Blue Live note triggering is routed through the existing external engine session lifecycle in Electron main.
- **Test-First for Serialization**: PASS. Foundational tasks require `MidiInputProcessor` and trigger-mapping tests before panel work.
- **Research Integration**: PASS. Research decisions explicitly bound scope, identify the Java anchors, and defer OS MIDI device management to a later slice.
