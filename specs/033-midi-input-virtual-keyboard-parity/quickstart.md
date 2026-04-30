# Quickstart: MIDI Input Panel And Virtual Keyboard Parity

## Preconditions

1. Work from `/Users/stevenyi/work/blue-electron` on branch `033-midi-input-virtual-keyboard-parity`.
2. Keep Java Blue sources available at `/Users/stevenyi/work/nbprojects/blue/blue-core` and `/Users/stevenyi/work/nbprojects/blue/blue-ui-core` for parity comparison.
3. Ensure the local Electron app can load `.blue` projects and that `blue-engine` is available for Blue Live validation.

## Validation Commands

Run from `/Users/stevenyi/work/blue-electron`:

```bash
pnpm --filter @blue/data test
pnpm --filter @blue/data build
pnpm --filter @blue/app test
pnpm --filter @blue/app build
git diff --check
```

## Manual MIDI Input Panel Scenario

1. Launch the Electron app and load a `.blue` project.
2. Open `MIDI Input` from the toolbar or workbench.
3. Confirm the panel no longer renders placeholder content.
4. Change key mapping, velocity mapping, pitch constant, amp constant, and scale.
5. Save the project.
6. Reopen the same project.
7. Confirm the edited MIDI Input values are restored.

## Manual Virtual Keyboard Blue Live Scenario

1. Load a project that can be triggered in Blue Live.
2. Start Blue Live from the toolbar.
3. Open `Virtual Keyboard`.
4. Confirm the panel no longer renders placeholder content.
5. Click a piano key with the mouse and confirm Blue Live receives a note-on event.
6. Release the key and confirm Blue Live receives the matching note-off behavior.
7. Use the computer keyboard to trigger notes and confirm the same behavior.
8. Change channel, octave, and velocity override controls.
9. Trigger another note and confirm the new settings take effect.
10. Press `All Notes Off` and confirm no stuck notes remain.

## Manual Workbench Integration Scenario

1. Open `MIDI Input` and confirm it appears as the registered properties-side panel.
2. Open `Virtual Keyboard` and confirm it appears as the registered output-side panel.
3. Reopen each panel through the existing workbench flows and confirm focus/open behavior remains stable.
4. Confirm the toolbar `MIDI Input` button opens or focuses the MIDI Input panel instead of remaining disabled.

## Manual Disabled-State Scenario

1. Open the app with no project loaded.
2. Confirm MIDI Input and Virtual Keyboard surfaces present safe disabled or empty states rather than crashing.
3. Load a project but leave Blue Live stopped.
4. Confirm the Virtual Keyboard does not submit note events and clearly indicates that Blue Live is not running.

## Deferred Checks

- External MIDI device enumeration and hardware input listeners remain out of scope for this slice.
- Project-independent MIDI or OSC settings remain out of scope for this slice.