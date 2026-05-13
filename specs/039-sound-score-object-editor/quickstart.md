# Quickstart: Sound Score Object Editor Parity

## Goal

Validate that the `Sound` score-object editor no longer behaves like a comment-only placeholder and now exposes the Java Blue tabbed workflow that this slice claims.

## Preconditions

1. Build and run the Electron app from `/Users/stevenyi/work/blue-electron` after this slice is implemented.
2. Prepare a project containing at least one `Sound` score object with:
   - BSB interface content or widget data
   - at least one automatable parameter
   - non-empty comment text
3. Keep an example where test-preview generation is expected to succeed.

## Validation Steps

1. Load the project and open `ScoreObjectEditorTopComponent` for a `Sound` object.
2. Confirm the editor shows Interface, Automation, and Comments tabs rather than a textarea only.
3. Open the Interface tab and verify the reused BSB surface renders supported widget content.
4. Edit one supported interface control and confirm the canonical object updates without changing the selected score target.
5. Open the Automation tab and verify the parameter selector plus line-editing surface render for supported parameters.
6. Edit one supported automation line or enablement state and confirm the editor refreshes against the updated canonical object.
7. Open the Comments tab and edit the comment text.
8. Confirm the comment persists after reloading the editor document.
9. Invoke the `Sound` test action.
10. Confirm the app shows generated score output or a deliberate failure message tied to the selected target.
11. Remove the selected `Sound` target while the editor is open.
12. Confirm the score-object editor falls back to the removed-target state instead of showing stale tab content.

## Expected Results

- `Sound` opens in a real tabbed auxiliary editor shell with 5 tabs: Interface, Automation, Code, UDO, and Comments.
- The Interface tab reuses the full BSB interface editor (canvas, property sheet, presets, grid settings).
- The Automation tab shows a parameter selector, enable/disable toggle, and SVG line canvas for curve editing.
- The Code tab shows BSB code sub-tabs (Instrument, Always On, Global Orc, Global Sco) with syntax completion.
- The UDO tab shows the UDO workspace panel for managing embedded opcode definitions.
- The Comments tab has a textarea for the instrument comment.
- The Test button in the tab bar shows a modal with generated score output or a deferred message.
- Unsupported `Sound` subfeatures are surfaced deliberately instead of silently discarded.

## Implementation Notes

- The Sound editor reuses `BSBInterfaceEditor`, `BSBCodeEditor`, and `BSBUDOPanel` from the orchestra editor via adapter callbacks that translate `InstrumentPatch` into `ScorePatch`.
- BSB data round-trips through `parseSoundBSB()` (text → Element → BlueSynthBuilder), patch application, and serialization back to text via `bsb.saveAsXML().toXml()`.
- The test preview shows a deferred message because `Sound.generateForCSD()` is still a stub; it will show real output once BSB CSD generation is implemented.
- Automation parameter selection and curve editing are scoped to the `SoundAutomationPanel` with an SVG-based line canvas.
- New Sound objects (empty BSB text) show only the Comments tab.
