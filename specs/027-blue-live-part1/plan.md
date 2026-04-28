# Implementation Plan: Blue Live Part 1

**Branch**: `027-blue-live-part1` | **Date**: 2026-04-28 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/spec.md](/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/spec.md`

## Summary

Replace the current Blue Live toolbar placeholder with a real Blue Live engine lifecycle, using a Blue Live-specific CSD generation path and a separate blue-engine session that can run alongside realtime playback. Port Java-compatible Blue Live project data into `@blue/data`, expose it through the existing project snapshot/patch bridge, and implement the Blue Live editor tabs for Live Space, Live Code, and Options while explicitly deferring MIDI Input, SCO Pad, nested SoundObject editor opening, and About Blue. Add a macOS-style Settings menu/window and add `Evaluate Code` to the global orchestra/score editors with Blue Live priority over realtime playback.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.x, Electron 35.x, strict renderer/main/preload packages, pure TypeScript `@blue/data`  
**Primary Dependencies**: `@blue/data` `BlueData`/`LiveData`/`LiveObject*`/CSD generation, `@blue/engine-client` ZMQ protocol, existing `EngineBridge`, Electron `Menu`/`BrowserWindow`/IPC, Zustand 5.x project/playback/workbench stores, Dockview 5.2.0 panel registry, CodeMirror 6 `SelectedCodeEditor`, existing Csound context menu/completion helpers, Radix Context Menu for renderer menus, existing Output window IPC  
**Storage**: Main-process in-memory `BlueData` remains canonical; renderer consumes serializable LiveData snapshots and sends explicit project document patches; `.blue` XML remains persistence; Settings window categories are placeholders in this part and do not require durable settings storage  
**Testing**: Vitest unit/renderer tests, focused main/preload IPC tests where practical, `pnpm --filter @blue/data test`, `pnpm --filter @blue/app test`, `pnpm --filter @blue/app build`, `git diff --check`; engine lifecycle behavior may need injectable `EngineBridge`/`EngineClient` test doubles  
**Target Platform**: Electron desktop on macOS first, with cross-platform menu fallbacks preserved where the native app menu differs  
**Project Type**: Desktop application renderer + Electron main/preload + shared data-model and engine-client feature  
**Performance Goals**: Blue Live start/recompile should serialize/compile without blocking renderer interaction after command dispatch; engine output batching should remain comparable to realtime output; Live Space grid edits should update local UI immediately for typical Java Blue Live grid sizes  
**Constraints**: Preserve Java `.blue` compatibility; keep `@blue/data` UI-free and Node-free; run Blue Live in a separate engine session from realtime; do not open nested SoundObject editors in this part; keep MIDI Input, SCO Pad, About Blue, and real MIDI/OSC settings implementation deferred  
**Scale/Scope**: Blue Live toolbar controls, one separate Blue Live engine lifecycle, Blue Live CSD generation, LiveData XML/snapshot/patch support, one Blue Live workbench panel, one modal Settings BrowserWindow, Evaluate Code command in global orchestra/score editors

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Data-First, UI-Separated**: PASS. Java-compatible LiveData and Blue Live CSD generation belong in `@blue/data`; React receives snapshots and sends patch intents.
- **Backwards-Compatible Serialization**: PASS with required round-trip tests. Current TypeScript LiveData stubs must be replaced with Java-compatible load/save behavior before renderer edits are trusted.
- **JVM Dependencies Preserved, Not Replaced**: PASS. Nested SoundObjects inside LiveObject cells are preserved through existing data model rules; unsupported JVM-dependent generation paths must follow existing project behavior.
- **Engine as External Process**: PASS. Blue Live uses blue-engine as a separate external process/session rather than FFI or renderer audio.
- **Test-First for Serialization**: PASS. LiveData and LiveObject XML tests are mandatory before UI integration.
- **Research Integration**: PASS. Java Blue Live render/editor/menu anchors and TypeScript architecture decisions are captured in `research.md`.

## Project Structure

### Documentation (this feature)

```text
/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── blue-live-settings-surface.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
/Users/stevenyi/work/blue-electron/packages/blue-data/src/
├── blue-data.ts
├── live-data.ts
├── live/
│   ├── live-object.ts
│   ├── live-object-bins.ts
│   ├── live-object-set.ts
│   └── live-object-set-list.ts
└── [new or expanded tests near touched data/CSD files]

/Users/stevenyi/work/blue-electron/packages/blue-engine-client/src/
├── engine-client.ts
└── protocol.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/
├── project-editor.ts
└── workbench-menu.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/
├── main.ts
├── engine-bridge.ts
└── [optional blue-live/settings helper modules if extraction reduces main.ts risk]

/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/
└── preload.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/
├── stores/
│   ├── project-store.ts
│   └── [new blue-live/settings stores if needed]
├── components/menu-bar/
│   └── ToolbarBlueLive.tsx
├── components/settings/
│   └── [new modal window React surface]
└── components/workbench/
    ├── DockviewPanel.tsx
    └── panels/
        ├── BlueLivePanel.tsx
        ├── GlobalOrchestraPanel.tsx
        ├── GlobalScorePanel.tsx
        └── editors/
            ├── SelectedCodeEditor.tsx
            ├── CsoundEditorContextMenu.tsx
            └── csound-editor-menu.ts

/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/
├── blue-live-toolbar.test.tsx
├── blue-live-panel.test.tsx
├── blue-live-store.test.ts
├── settings-window.test.tsx
└── evaluate-code.test.tsx
```

**Structure Decision**: Put Java-compatible LiveData and Blue Live CSD generation in `@blue/data`; extend the existing main-process project document bridge for LiveData patches; introduce a separate Blue Live engine bridge/session in the main process; keep Blue Live editor rendering in the workbench panel system; keep Settings as a modal Electron BrowserWindow with a renderer surface.

## Complexity Tracking

No constitution exception is required.

## Phase 0 Research Output

See [/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/research.md](/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/research.md).

## Phase 1 Design Output

- [/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/data-model.md](/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/data-model.md)
- [/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/contracts/blue-live-settings-surface.md](/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/contracts/blue-live-settings-surface.md)
- [/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/quickstart.md](/Users/stevenyi/work/blue-electron/specs/027-blue-live-part1/quickstart.md)

## Post-Design Constitution Check

- **Data-First, UI-Separated**: PASS. Data/model/generation work is isolated to `@blue/data`; renderer code only consumes snapshots and emits patches.
- **Backwards-Compatible Serialization**: PASS. Data model requires Java-compatible LiveData XML tests, including old-format upgrade and saved-set references.
- **JVM Dependencies Preserved, Not Replaced**: PASS. LiveObject SoundObjects remain data-owned and are not opened/edited through new UI in this part.
- **Engine as External Process**: PASS. Blue Live and realtime both use external blue-engine sessions managed by main process.
- **Test-First for Serialization**: PASS. Tasks must place LiveData/LiveObject XML coverage before UI/editor work.
- **Research Integration**: PASS. Research documents the Java render path, editor behavior, toolbar actions, and deferrals.
