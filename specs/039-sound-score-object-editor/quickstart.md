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

- `Sound` opens in a real tabbed auxiliary editor shell.
- Supported Interface, Automation, and Comments workflows all mutate canonical state coherently.
- The test-preview workflow is scoped to the selected target and reports success or failure explicitly.
- Unsupported `Sound` subfeatures are surfaced deliberately instead of silently discarded.
