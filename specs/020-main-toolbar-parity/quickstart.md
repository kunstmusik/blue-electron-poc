# Quickstart: Main Toolbar Parity

## Goal

Verify that the Electron app's top chrome now behaves like Java Blue's main toolbar and that file/window ownership moved into the native menu bar.

## Preconditions

- Install dependencies and start the app normally for the `@blue/app` package.
- Use a real `.blue` project file so window title and project-derived transport state can be observed.

## Manual Verification

1. Launch the app with no project loaded.
   - Expect the BrowserWindow title to be `Blue`.
   - Expect the top toolbar to render its Java-style group layout without the old renderer `Blue` wordmark or file buttons.

2. Open a `.blue` file from the native `File` menu.
   - Expect `Open`, `Save`, and `Save As` to live in the native `File` menu, not the toolbar.
   - Expect the window title to become `Blue - [file name].blue`.

3. Inspect the top toolbar layout.
   - Expect transport controls on the left.
   - Expect centered rounded playhead and selection displays.
   - Expect Blue Live controls on the right.
   - Expect transport buttons to use the selected Lucide mapping and the follow-playback control to appear as a text `F` toggle.

4. Exercise playback basics.
   - Start playback and confirm the play/stop controls switch state cleanly.
   - Confirm the playhead display updates during playback from authoritative engine timing rather than visibly drifting over repeated starts/stops.
   - Stop playback and confirm the playhead snaps back to the correct project-derived anchor state.
   - If playback is restarted or relocated, confirm the display does not animate through stale intermediate positions.

5. Verify selection display semantics.
   - With no render range set, expect placeholder values.
   - With a valid render start/end range, expect start, end, and duration values instead of placeholders.

6. Open the native `Window` menu.
   - Expect panel focus/open entries to exist there instead of the renderer `Window` dropdown.
   - Trigger at least one panel-focus action and `Reset Default Layout` to confirm the native menu reaches the renderer workbench.

7. Inspect Blue Live controls.
   - Expect the control group to be present.
   - If any action is unavailable in the current Electron slice, expect an explicit disabled/unavailable state instead of a silent no-op.

## Automated Validation

Run:

```bash
pnpm --filter @blue/app test
pnpm --filter @blue/app build
git diff --check
```
