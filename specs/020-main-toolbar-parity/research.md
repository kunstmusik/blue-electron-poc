# Research Notes: Java Main Toolbar Parity

## Scope

Spec 020 replaces the current Electron header with Java Blue's main-toolbar structure and moves renderer-owned menu responsibilities into Electron's native menu bar. The goal is toolbar/menu/window-title parity, not a full port of every Java menu command.

## Current Electron Baseline

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/MenuBar.tsx` currently mixes branding, project metadata, file actions, a renderer `WindowMenu`, transport, and a playback status pill into one header.
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts` already owns a native `File`, `Edit`, and `Playback` menu, but not a `Window` menu.
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx` currently mirrors workbench panel focus/reset actions entirely inside the renderer.
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` exposes editor text and project properties, but not toolbar-oriented transport/time metadata such as `renderStartTime`, `renderEndTime`, `loopRendering`, or tempo-map data.
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/playback-store.ts` tracks coarse playback status only (`idle`, `starting`, `playing`, `stopping`, `stopped`, `error`); it does not expose a live playhead position.

## Java Source Findings

### Main Toolbar Layout

References:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/toolbar/MainToolBar.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/toolbar/TransportControls.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/toolbar/PlayheadDisplayPanel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/toolbar/SelectionDisplayPanel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/blueLive/BlueLiveToolBar.java`

Findings:

- Java Blue places transport controls on the left, playhead and selection displays in centered rounded black panels, and Blue Live controls toward the right.
- `MainToolBar` also includes a BSB widget-info button, but the user did not request it for this slice.
- `TransportControls` uses previous marker, next marker, rewind, play, stop, a text `F` follow-playback toggle, and a repeat toggle.
- `PlayheadDisplayPanel` shows one primary and one secondary time readout; `SelectionDisplayPanel` shows start, end, and duration.

### File Menu Ownership

Reference screenshot from user plus current Java app menu behavior:

- Open/Save/Save As live in the native `File` menu, not inside the toolbar.
- The screenshot also shows `New Project`, `Open Example Project`, import commands, render commands, and recent projects; those are broader menu-parity work and are not required in spec 020.

### Selection Display Source

Reference:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/toolbar/SelectionDisplayPanel.java`

Finding:

- Java Blue's selection display is driven by `BlueData.getRenderStartTime()` and `BlueData.getRenderEndTime()`, not by a separate arbitrary score-selection model.
- When `renderEndTime < 0`, Java shows placeholder values rather than fake numeric ranges.

### Playhead Display Source

Reference:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/toolbar/PlayheadDisplayPanel.java`

Finding:

- Java updates the playhead from a render-time manager and formats it through score time-context utilities.
- The Electron port does not currently have an equivalent playhead event stream.

## Decisions

### Decision: Remove Renderer Header Ownership For File/Window/Branding

- `Open`, `Save`, and `Save As` move fully into the native `File` menu.
- The renderer `WindowMenu` is removed and replaced by a native `Window` menu.
- The renderer `Blue` wordmark is removed from project chrome.
- The BrowserWindow title becomes the file identifier: `Blue - [file].blue`.

Rationale:

- This matches the Java screenshots and avoids split ownership between native and renderer menus.
- It also simplifies the toolbar so it can focus on transport/time/Blue Live parity.

Alternatives considered:

- Keep file actions in the toolbar for convenience. Rejected because the user explicitly wants Java-style native menu ownership.
- Keep the `Blue` wordmark in the toolbar. Rejected because the Java screenshots rely on the native shell/menu bar and window title instead.

### Decision: Use A Hybrid Engine-Authoritative Playhead Model

- Treat `blue-engine` transport state as the authoritative playhead source while playback is active.
- Reuse the existing engine-state snapshot data (`sampleFrames`, `sampleRate`, `sequence`) to feed the renderer at a modest cadence rather than inventing per-frame IPC.
- Animate between authoritative updates in the renderer so the display remains smooth.
- Convert engine time to beat/time text in the renderer using the serialized tempo map from the shared project snapshot.

Rationale:

- The engine already exposes precise playback timing through `sampleFrames`, `sampleRate`, and `ksmps`; the missing piece is wiring that into the toolbar, not inventing a new clock source.
- Java Blue already uses a hybrid model: engine corrections feed a timer-driven UI display.
- Ardour likewise updates UI clocks on a timer from authoritative transport/audible sample state rather than running a UI-specific PLL for screen drawing.

Alternatives considered:

- Pure renderer wall-clock timing. Rejected because it can drift from actual engine playback.
- Per-frame main-process IPC. Rejected because it is unnecessary overhead for toolbar display.
- Shared-memory transport telemetry now. Rejected because the current shared memory region is channel-only and Electron has no shm reader yet.

### Decision: Cache Fixed Playback Metadata Per Performance

- `sampleRate` is effectively fixed for an active performance and can be cached after the first authoritative running snapshot for that playback session.
- `ksmps` can also be treated as fixed per performance and omitted from repeated UI updates unless needed for diagnostics or block-resolution reasoning.
- Stateless reads such as `GET_ENGINE_STATE` may still return the full snapshot shape for robustness and late subscribers.

Rationale:

- This keeps repeated playhead updates small without losing correctness.
- The renderer only needs the fixed-rate metadata once per playback session to convert `sampleFrames` to seconds.

Alternatives considered:

- Include `sampleRate` and `ksmps` in every transport push. Accepted as a harmless fallback, but not required if the playback session model is explicit.

### Decision: Mirror Java Selection Semantics Exactly

- The selection display will show placeholders until a valid render range exists.
- Once `renderEndTime >= 0`, the display shows start, end, and duration derived from project transport values.

Rationale:

- This is the actual Java behavior and does not require a separate score-selection implementation.

Alternatives considered:

- Bind the selection display to arbitrary editor or score selection state. Rejected because it would diverge from Java and increase scope.

### Decision: Use Existing Rounded-Rectangle Chrome And Lucide Icons

Transport icon mapping:

- Previous marker: `SkipBack`
- Next marker: `SkipForward`
- Rewind: `Rewind`
- Play: `Play`
- Stop: `Square`
- Loop: `Repeat`
- Follow playback: text `F` toggle, matching Java

Rationale:

- The user explicitly wants the current slightly rounded-rectangle style preserved.
- Lucide covers the transport set well, while the Java follow-playback control is better kept as a textual toggle.

Alternatives considered:

- Custom icon pack parity. Rejected for this slice because the user prioritized layout/functionality first.

### Decision: Blue Live Controls Ship With Explicit Availability States

- The toolbar will surface `blueLive`, `Recompile`, `All Notes Off`, and `MIDI Input` controls in the correct group and styling.
- Where no Electron backend behavior exists yet, controls should present a clear disabled or unavailable state rather than silently doing nothing.

Rationale:

- The user wants layout and control presence now, but the current Electron port does not have full Blue Live runtime support.
- Explicit availability is better than fake interactivity.

Alternatives considered:

- Hide Blue Live controls until implemented. Rejected because that would fail the requested Java toolbar parity.
- Implement ad hoc Blue Live backend behavior in the toolbar slice. Rejected as out of scope and not grounded in current port infrastructure.

### Decision: Native Window Menu Must Drive Renderer Workbench Through Shared Commands

- The current renderer-only panel metadata/menu actions need a shared menu-command layer so the native `Window` menu can focus/open panels and reset layout.
- The likely shape is:
  - shared panel descriptors consumable by both renderer and main
  - main-process menu click handlers sending typed menu commands to the renderer
  - renderer listeners dispatching those commands into `useWorkbenchStore`

Rationale:

- The native menu cannot directly call renderer Zustand actions.
- Reusing the existing panel registry semantics avoids duplicating panel names and grouping rules.

Alternatives considered:

- Hardcode duplicate Window menu entries in main. Rejected because it would drift from the renderer panel registry.

## Open Follow-On Work

- Full Java `File` menu parity beyond relocating existing `Open`, `Save`, and `Save As`
- Java-style right-click format menus for the playhead and selection displays
- Real Blue Live backend support beyond explicit availability states
- Bottom status-bar parity such as `1:1` and `INS`
- Shared-memory or other broader realtime telemetry work beyond toolbar playhead needs
