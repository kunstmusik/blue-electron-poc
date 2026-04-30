# Research: MIDI Input Panel And Virtual Keyboard Parity

## Java Blue Source Anchors

- MIDI Input panel registration: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/midi/MidiInputPanelTopComponent.java`
- MIDI Input editor UI: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/midi/MidiInputProcessorPanel.java`
- Java MIDI runtime path: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/midi/MidiInputEngine.java`
- Virtual Keyboard panel registration: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/midi/VirtualKeyboardTopComponent.java`
- Virtual Keyboard UI and key handling: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/midi/VirtualKeyboardPanel.java`

## Current TypeScript Source Anchors

- Project MIDI processor data: `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-input-processor.ts`
- Existing mapping helpers: `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-key-mapping.ts`, `/Users/stevenyi/work/blue-electron/packages/blue-data/src/midi/midi-velocity-mapping.ts`
- Existing typed scale model: `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/piano-roll/scale.ts`
- Workbench panel registry: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- Current panel routing: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- Current toolbar state: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
- Current project snapshot and patch contract: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- Current project-store optimistic patch path: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- Current Blue Live engine lifecycle: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/blue-live-engine.ts`
- Current Blue Live IPC wiring: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`

## Decision: Keep MIDI Input Settings Project-Owned And Extend The Existing Snapshot/Patch Bridge

Java Blue treats MIDI input processing as project state, not a renderer-only preference. The Electron port already uses `createProjectEditorSnapshot(...)` and `applyProjectDocumentPatch(...)` as the canonical bridge for editable project data.

**Decision**: Add `midiInput` snapshot and patch types to the existing `project-editor.ts` contract and route panel edits through `project-store.ts`, rather than building a separate state store.

**Rationale**: This keeps the main-process `BlueData` document canonical, matches how Blue Live and project properties already work, and makes save/reopen validation straightforward.

**Alternatives considered**:

- Store MIDI Input settings in a renderer-only Zustand slice: rejected because it would diverge from `.blue` persistence.
- Add bespoke IPC methods for each field: rejected because the project document patch flow already exists and is better suited to this kind of project-owned state.

## Decision: Convert MIDI Scale Through The Existing Typed `Scale` Model Instead Of Exposing Raw XML In The Renderer

`MidiInputProcessor` currently preserves scale as raw XML, but the repo already includes a typed `Scale` model used by Piano Roll logic.

**Decision**: Add typed scale accessors or adapters around `MidiInputProcessor` and expose a structured scale snapshot to the renderer.

**Rationale**: A typed scale snapshot is easier to validate, easier to test, and avoids pushing XML-specific concerns into React panel code.

**Alternatives considered**:

- Keep scale as raw XML text in the renderer: rejected because it would make a parity UI harder to build and easier to corrupt.
- Defer scale editing entirely: rejected because scale is part of the Java MIDI Input panel surface and part of the requested parity scope.

## Decision: Put Java-Compatible Pitch And Velocity Mapping In A Pure `@blue/data` Helper

Java `MidiInputEngine` applies the project's `MidiInputProcessor` semantics before sending events into Blue Live. Those semantics are data-driven and not specific to Electron main or React.

**Decision**: Add a pure MIDI trigger-mapping helper in `@blue/data` that consumes `MidiInputProcessor`, typed scale data, and an incoming note event, then returns the values needed to format Blue Live score events.

**Rationale**: This keeps data logic testable and reusable, and avoids burying Java parity math in Electron main-process code.

**Alternatives considered**:

- Implement all MIDI mapping logic in `blue-live-engine.ts`: rejected because it would mix project data semantics with engine transport concerns.
- Route note events directly from the renderer to Blue Live without applying `MidiInputProcessor`: rejected because it would make the MIDI Input panel irrelevant to the requested manual workflow.

## Decision: Use One Blue Live Note-Trigger IPC Surface For Virtual Keyboard Note-On And Note-Off

The current Electron port has Blue Live lifecycle, orchestra evaluation, score submission, and All Notes Off, but no raw note trigger IPC. Java Blue's MIDI runtime path ultimately feeds Blue Live through generated score strings.

**Decision**: Add one explicit `blue-live:trigger-note` IPC path that accepts note-on and note-off requests from the renderer, reads canonical project MIDI input settings in main, applies Java-compatible trigger mapping, formats score events, and submits them through the active Blue Live session.

**Rationale**: This is the missing runtime seam needed by both the Virtual Keyboard and future external MIDI input work.

**Alternatives considered**:

- Reuse `engine:evaluate-code` for keyboard note events: rejected because it is editor-oriented, not note-oriented.
- Send raw score strings from the renderer: rejected because the main process should remain authoritative for engine routing and project state reads.

## Decision: Scope Spec 033 To Virtual Keyboard Plus Project MIDI Settings, Not OS MIDI Device Management

The user asked for a manual flow that loads a project, adjusts MIDI Input settings, starts Blue Live, and plays from the Virtual Keyboard. That does not require OS MIDI device enumeration or background hardware listeners.

**Decision**: Keep Spec 033 focused on the project MIDI processor panel, the Virtual Keyboard, and the Blue Live note-trigger path. Hardware MIDI device enumeration, settings, and background input capture stay deferred.

**Rationale**: This keeps the slice small enough to implement cleanly while still delivering the requested parity workflow.

**Alternatives considered**:

- Add Web MIDI or native device enumeration now: rejected as a different feature with significantly larger platform scope.
- Make the MIDI Input panel read-only until hardware input exists: rejected because the user explicitly asked to adjust those settings as part of the manual test.

## Decision: Open MIDI Input Through The Existing Workbench And Toolbar Flows

`MidiInputPanelTopComponent` is already registered as a properties-side auxiliary panel, and the toolbar already exposes a disabled `MIDI Input` button.

**Decision**: The toolbar button should open or focus `MidiInputPanelTopComponent`, and `DockviewPanel.tsx` should route that panel id to a real React implementation.

**Rationale**: This matches the existing workbench model and removes a known deferred control instead of adding another entry point.

**Alternatives considered**:

- Create a modal or Settings-window MIDI editor: rejected because the panel is already modeled as a workbench top component.
- Leave the toolbar button disabled and require opening from the Window menu only: rejected because the spec explicitly calls out the toolbar interaction.

## Decision: Keep Virtual Keyboard Runtime State Renderer-Local But Engine Routing Main-Process-Owned

Java Virtual Keyboard behavior includes mouse playing, computer-key mappings, channel changes, octave changes, velocity override, and All Notes Off. Only part of that state is project-owned.

**Decision**: Keep transient keyboard state such as pressed notes, current channel, current octave, velocity override, and panel focus in the renderer. The main process remains authoritative for Blue Live routing and project MIDI settings.

**Rationale**: The renderer is the natural home for panel interaction state, while main already owns engine sessions and canonical project data.

**Alternatives considered**:

- Persist Virtual Keyboard channel/octave state in the project document: rejected because it is runtime UI state, not durable project content.
- Move all pressed-note tracking into the main process: rejected because renderer interaction and cleanup are easier to reason about locally.

## Decision: Limit Computer Keyboard Capture To Intentional Panel Focus

Java Virtual Keyboard maps computer keys to notes but lives inside a desktop UI with many other keyboard shortcuts.

**Decision**: Capture computer-key note events only when the Virtual Keyboard panel is focused or explicitly active, and release all pressed notes on blur or panel deactivation.

**Rationale**: This reduces accidental interference with global editor shortcuts while preserving the requested parity behavior.

**Alternatives considered**:

- Global key capture whenever Blue Live is running: rejected because it would steal normal editor shortcuts.
- Mouse-only keyboard behavior: rejected because computer-key playing is part of Java parity.

## Decision: Reuse Existing Blue Live All Notes Off For The Virtual Keyboard Button

The Electron port already supports `blue-live:all-notes-off` and the Java Virtual Keyboard includes an explicit All Notes Off affordance.

**Decision**: The Virtual Keyboard will call the existing All Notes Off engine path and also clear any local pressed-note bookkeeping.

**Rationale**: This avoids duplicating engine behavior and ensures the Virtual Keyboard and toolbar silence behavior stay aligned.

**Alternatives considered**:

- Emit individual note-off events for every pressed key only: rejected because it is weaker than the existing engine-wide All Notes Off path.

## Deferrals

- OS MIDI device enumeration and background hardware MIDI capture.
- Project-independent MIDI preferences or global settings windows.
- User-customizable computer keyboard layouts beyond Java-compatible defaults.
- Any non-Blue Live routing for Virtual Keyboard notes.