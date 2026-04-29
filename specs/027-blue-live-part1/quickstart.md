# Quickstart: Blue Live Part 1

## Preconditions

1. Check out `027-blue-live-part1`.
2. Install dependencies if needed with the repository's current package workflow.
3. Ensure `blue-engine` is available on the development machine for manual engine validation.
4. Keep Java Blue sources available at `/Users/stevenyi/work/nbprojects/blue/blue-core` and `/Users/stevenyi/work/nbprojects/blue/blue-ui-core` for parity comparison.

## Implementation Validation

Run from `/Users/stevenyi/work/blue-electron`:

```bash
pnpm --filter @blue/data test
pnpm --filter @blue/app test
pnpm --filter @blue/app build
git diff --check
```

If engine-client protocol behavior changes, also run any package-level tests under `/Users/stevenyi/work/blue-electron/packages/blue-engine-client`.

## Manual Blue Live Toolbar Scenario

1. Launch the Electron app.
2. Open a `.blue` project.
3. Select an editor other than `Blue Live`.
4. Press the toolbar `Blue Live` button.
5. Confirm the selected editor does not change.
6. Confirm the toolbar shows Blue Live running.
7. Confirm output appears in a Blue Live-specific output context, not the realtime `Csound` tab.
8. Press the toolbar `Blue Live` button again.
9. Confirm Blue Live stops and the toolbar returns to inactive state.

## Manual Parallel Engine Scenario

1. Open a project that can run realtime playback.
2. Start realtime playback.
3. Start Blue Live from the toolbar.
4. Confirm realtime playback remains running.
5. Stop Blue Live.
6. Confirm realtime playback remains controlled by the normal transport.
7. Stop realtime playback.

## Manual Recompile And All Notes Off Scenario

1. Start Blue Live.
2. Change a project value that should affect generated Blue Live CSD.
3. Press `Recompile`.
4. Confirm the current Blue Live session is replaced by a fresh running session.
5. Press `All Notes Off`.
6. Confirm no error occurs and the engine receives the Java-compatible `i "blueAllNotesOff" 0 1` score event.

## Manual Blue Live Editor Scenario

1. Open the `Blue Live` editor from the Window menu or workbench.
2. Confirm the editor has `Live Space`, `Live Code`, and `Options` tabs.
3. Confirm `SCO Pad` is absent, disabled, or explicitly marked deferred.
4. In Live Space, edit tempo, repeat count, repeat enabled state, and a live-object enabled state.
5. Add, rename, reorder, apply, and remove a saved set where existing live objects are available.
6. Insert and remove a row and column without reducing below one row/column.
7. Confirm double-clicking a live object toggles enabled state and does not open a SoundObject editor.
8. Press `Trigger` and confirm a `not yet implemented` alert appears instead of live note routing.
9. In Live Code, edit text and save/reopen the project.
10. In Options, edit advanced flags, command line, and complete override, then save/reopen.
11. Confirm all edited values persist.

## Manual Settings Scenario

1. On macOS, open the first app menu labeled `Blue`.
2. Confirm it contains `About Blue` and `Settings...` near the top.
3. Confirm `Settings...` shows Cmd-,.
4. Invoke Cmd-,.
5. Confirm one modal Settings window opens.
6. Confirm the left sidebar contains `MIDI` and `OSC`.
7. Select each category and confirm placeholder editor content appears on the right.
8. Invoke Cmd-, again while the window is open and confirm the existing Settings window is focused rather than duplicated.

## Manual Evaluate Code Scenario

1. Start Blue Live.
2. Open Global Orchestra.
3. Select non-empty orchestra text.
4. Right-click and confirm `Evaluate Code` is enabled; invoke it or press Cmd-Return.
5. Confirm the selected text routes to Blue Live.
6. Clear the selection and place the cursor inside an `instr` or `opcode` block in Global Orchestra.
7. Invoke `Evaluate Code` or press Cmd-Return and confirm the enclosing block routes to Blue Live.
8. Stop Blue Live and start realtime playback.
9. Repeat with a cursor inside Global Orchestra and confirm it routes to realtime using the enclosing block.
10. Repeat from Global Score with the cursor on a score line and confirm score routing uses the current line.
11. Stop all engines or place the cursor on a blank line.
12. Confirm `Evaluate Code` is disabled when no engine is running and Cmd-Return no-ops when there is no evaluable context.

## Deferred Checks

- MIDI Input toolbar runtime behavior remains deferred.
- SCO Pad remains deferred.
- Opening/editing SoundObjects from Live Space remains deferred.
- About Blue may exist as a menu item but does not need a complete dialog.
- MIDI and OSC Settings editors are placeholders only.
