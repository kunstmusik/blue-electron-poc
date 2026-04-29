# Research: Blue Live Part 1

## Java Blue Source Anchors

- Blue Live toolbar actions: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/blueLive/BlueLiveToolBar.java`
- Blue Live editor: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/blueLive/BlueLiveTopComponent.java`
- Live Space table model: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/blueLive/LiveObjectsTableModel.java`
- Live saved-set table model: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/blueLive/LiveObjectSetListTableModel.java`
- LiveData model/XML: `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/LiveData.java`
- LiveObject model/XML: `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/blueLive/LiveObject.java`
- LiveObjectBins model/XML: `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/blueLive/LiveObjectBins.java`
- LiveObjectSet model/XML: `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/blueLive/LiveObjectSet.java`
- LiveObjectSetList model/XML: `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/blueLive/LiveObjectSetList.java`
- Blue Live render manager path: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/render/RealtimeRenderManager.java`
- Blue Live CSD generation: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/render/CSDRender.java`
- Command-line Blue Live runner: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/render/CommandlineRunner.java`
- Blue Live repeat binding: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/render/BlueLiveBinding.java`
- OSC Blue Live action hooks for future parity: `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/OSCActions.java`

## Current TypeScript Source Anchors

- Current Blue Live toolbar placeholder: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarBlueLive.tsx`
- Native menu and project playback IPC: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- Current realtime engine lifecycle: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/engine-bridge.ts`
- Engine client/protocol: `/Users/stevenyi/work/blue-electron/packages/blue-engine-client/src/engine-client.ts`
- Project snapshot/patch contract: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- Workbench panel registry: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- Shared Csound editor surface: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx`
- Csound context menu helpers: `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/csound-editor-menu.ts`
- TypeScript LiveData stub: `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live-data.ts`
- TypeScript LiveObject stubs: `/Users/stevenyi/work/blue-electron/packages/blue-data/src/live/`

## Decision: Blue Live Toolbar Controls Runtime State, Not Editor Focus

Java `BlueLiveToolBar.runButtonActionPerformed()` toggles `RealtimeRenderManager.renderForBlueLive(data)` and `stopBlueLiveRendering()`. The current Electron `ToolbarBlueLive` calls `openPanel('BlueLiveTopComponent')`, which implements the wrong behavior for the toolbar button.

**Decision**: Make `Blue Live` a runtime toggle wired to main-process Blue Live IPC. Opening/focusing `BlueLiveTopComponent` remains a Window menu/workbench concern.

**Rationale**: This directly matches Java toolbar behavior and the user's top priority. It also separates authoring UI from live engine lifecycle.

**Alternatives considered**:

- Keep toolbar as an editor shortcut and add another runtime button: rejected because it preserves the bug.
- Make the button both open the editor and toggle runtime: rejected because the user explicitly said it should not select the editor.

## Decision: Use A Separate Blue Live Engine Session

Java `RealtimeRenderManager` keeps `currentRenderService` and `currentBlueLiveRenderService` separately. Starting Blue Live stops only the current Blue Live service, not realtime rendering.

**Decision**: Introduce a separate Blue Live engine session in the Electron main process, with independent lifecycle, output tab, status events, and cleanup. Realtime playback keeps using the existing `EngineBridge` path.

**Rationale**: A second engine session is required for concurrent realtime and Blue Live. It avoids coupling live recompiles to normal playback state.

**Alternatives considered**:

- Reuse the existing realtime `EngineBridge`: rejected because it would force Blue Live and realtime playback to stop each other.
- Add Blue Live state only in the renderer: rejected because engine processes and ZMQ clients are owned by the main process.

## Decision: Port A Blue Live-Specific CSD Generation Path

Java `CSDRender.generateCSDForBlueLiveImpl()` is not the same as standard realtime or disk generation. It uses a long fixed live duration, skips score timeline generation, includes global setup, always-on instruments, mixer support, `blueAllNotesOff`, and returns no tempo map. `CommandlineRunner.renderForBlueLive()` adds `-Lstdin` unless overridden and appends `--omacro:BLUE_LIVE=1 --smacro:BLUE_LIVE=1`.

**Decision**: Add a TypeScript Blue Live CSD generation path to `@blue/data` and use it from main-process Blue Live startup/recompile. Do not fake Blue Live by calling ordinary `BlueData.toCSD()`.

**Rationale**: The Java path materially changes the generated CSD and runtime command-line behavior. Using ordinary realtime CSD would miss All Notes Off and Live-specific runtime inputs.

**Alternatives considered**:

- Add macros/options around ordinary `toCSD()`: rejected because score generation and all-notes-off instrument behavior would still diverge.
- Keep Blue Live command-line details outside the data model only: rejected because CSD content itself must be generated differently.

## Decision: Replace TypeScript LiveData Stubs Before Renderer Work

Current TypeScript `LiveData.saveAsXML()` returns an empty `<liveData/>`, while Java persists command line, booleans, bins, saved sets, repeat, tempo, repeat-enabled state, and live-code text. Current TypeScript `LiveObject` and bin classes also do not match Java XML.

**Decision**: Implement Java-compatible `LiveData`, `LiveObject`, `LiveObjectBins`, `LiveObjectSet`, and `LiveObjectSetList` load/save/deep-copy behavior before wiring project snapshots or UI.

**Rationale**: Renderer edits would be unsafe if save/reopen loses Blue Live project data. This is a constitution-level serialization concern.

**Alternatives considered**:

- Preserve raw XML only and show a read-only UI: rejected because the feature requires editable Live Space, Live Code, and Options.
- Store a renderer-only LiveData cache: rejected because main-process `BlueData` is canonical.

## Decision: Implement Live Space Core, Defer Nested SoundObject Opening

Java Live Space includes tempo/repeat controls, a live-object grid, set list, trigger action, enabled toggling, row/column actions, copy/paste actions, and a right-click add/remove menu. Double-clicking a live cell toggles enabled state. Selection can expose the nested SoundObject to NetBeans lookup for editing elsewhere.

**Decision**: Implement the Live Space shell, grid, enabled toggling, row/column changes, saved-set add/remove/rename/reorder/apply behavior, and trigger behavior. Keep opening or editing nested SoundObjects deferred.

**Rationale**: The user explicitly deferred opening SoundObject editors. The remaining Live Space behavior is enough to view, preserve, toggle, and trigger existing live objects.

**Alternatives considered**:

- Fully port nested SoundObject editing now: rejected by explicit scope.
- Display only placeholders for the grid: rejected because Live Space UI is a requested Part 1 deliverable.

## Decision: Live Code Stores Text And Evaluates Selection

Java Live Code stores `liveCodeText` in `LiveData`. Its Cmd-E action evaluates selected orchestra text through `RealtimeRenderManager.evalOrc()`, though the Java command-line runner leaves `evalOrc` as TODO.

**Decision**: Store Live Code text through the project patch bridge. Evaluation should use the same engine-evaluation contract as global orchestra/score editors, with Blue Live as the target when running.

**Rationale**: This preserves project data and avoids inventing a separate live-code evaluation mechanism.

**Alternatives considered**:

- Save Live Code but omit evaluation: rejected because Evaluate Code is part of this spec.
- Use a different shortcut for Live Code: rejected unless conflicts are found during implementation.

## Decision: Options Tab Drives Blue Live Startup

Java Options stores `commandLine`, `commandLineEnabled`, and `commandLineOverride`. If enabled and override is false, Java appends LiveData flags after the realtime command and adds `-Lstdin`; if override is true, it uses the LiveData command line as the whole command.

**Decision**: Preserve these fields and apply them during Blue Live start/recompile. The first implementation may map command-line options into blue-engine option calls where possible, but the user-visible behavior and saved fields must match Java.

**Rationale**: Options is a requested tab and affects runtime behavior, so it cannot be a passive placeholder.

**Alternatives considered**:

- Save Options fields but ignore them for engine startup: rejected because it violates Java behavior.
- Move Options to app Settings: rejected because Java stores these values per project in LiveData.

## Decision: All Notes Off Sends A Score Event To A Generated Instrument

Java `BlueLiveToolBar.allNotesOffButtonActionPerformed()` sends `i "blueAllNotesOff" 0 1`; Java CSD generation adds a `blueAllNotesOff` instrument that calls `turnoff2` for all project instrument ids.

**Decision**: Add the `blueAllNotesOff` instrument during Blue Live CSD generation and have the toolbar send the same score event to the running Blue Live engine.

**Rationale**: Sending the score event without the generated instrument would fail; generating the instrument without sending the Java event would leave the toolbar incomplete.

**Alternatives considered**:

- Stop/restart the engine for all notes off: rejected because Java sends an immediate live event.
- Send raw `turnoff2` code through orchestra evaluation: rejected because Java uses a named instrument.

## Decision: Evaluate Code Routes To Blue Live First, Realtime Second

The user specified that selected text goes to Blue Live if running, otherwise to realtime render if playing, and later clarified that the current code context should be used when no selection exists. The current TypeScript engine client has `compileOrc()` and `readScore()` commands; implementation must confirm they are safe while running or add the smallest needed engine-client protocol support.

**Decision**: Add a single main-process evaluation command accepting editor kind (`orc` or `sco`) and selected or contextual text. Route to Blue Live when running, otherwise realtime when running. Disable the renderer menu action only when no eligible engine is active.

**Rationale**: Routing in main process keeps engine state authoritative and avoids renderer guessing which engine is active.

**Alternatives considered**:

- Let renderer call separate Blue Live/realtime APIs: rejected because it duplicates routing and state logic.
- Always broadcast to both engines: rejected because user specified Blue Live priority.

## Decision: Settings Is A Modal BrowserWindow With Placeholder Categories

The user requested a macOS-style `Settings...` menu item with Cmd-, and a modal BrowserWindow modeled on the provided dark split-layout reference. Only `MIDI` and `OSC` categories are needed for this part.

**Decision**: Add a standard macOS application menu with `About Blue`, `Settings...`, Services, Hide/Show, and Quit. `Settings...` opens one modal child BrowserWindow with a renderer settings surface containing MIDI and OSC placeholder editors. About Blue remains deferred.

**Rationale**: This establishes native menu structure and the settings shell without expanding into actual MIDI/OSC configuration.

**Alternatives considered**:

- Use an in-workbench settings panel: rejected because the user requested a modal BrowserWindow.
- Implement MIDI/OSC editors now: rejected by scope; placeholders are sufficient.

## Deferrals

- MIDI Input toolbar runtime behavior and MIDI device management.
- SCO Pad tab and keyboard/MIDI pad capture behavior.
- Opening or editing nested SoundObjects from Live Space.
- Live Space trigger-note routing; the Trigger control currently alerts `not yet implemented` until the Score implementation owns SoundObject note generation.
- Complete About Blue dialog.
- Real MIDI and OSC settings editors beyond placeholders.
- Full OSC Blue Live action parity beyond making room for future OSC settings.
