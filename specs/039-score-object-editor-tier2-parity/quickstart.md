# Quickstart: Score Object Editor Tier 2 Parity

## Goal

Validate that the heavyweight remaining score-object editors are planned and, once implemented, expose real auxiliary surfaces for `Sound`, `PianoRoll`, and `JMask`.

## Preconditions

1. Build and run the Electron app from `/Users/stevenyi/work/blue-electron` after this slice is implemented.
2. Prepare a project that includes:
   - one `Sound` score object with meaningful BSB or automation content
   - one `PianoRoll` score object with existing notes
   - one `JMask` score object using multiple generators or parameters

## Validation Steps

1. Load the project and open `ScoreObjectEditorTopComponent`.
2. Select the `Sound` object.
3. Confirm the editor exposes interface, automation, and comment workflows instead of a comment-only surface.
4. Edit supported `Sound` content and confirm the canonical object refreshes correctly.
5. Select the `PianoRoll` object.
6. Confirm the editor shows a dedicated note canvas with time and pitch context.
7. Edit notes and supported view controls.
8. Confirm the canonical `PianoRoll` data updates correctly.
9. Select the `JMask` object.
10. Confirm the editor shows generator and parameter controls beyond the seed fields.
11. Edit supported generator settings and confirm the canonical object refreshes coherently.
12. Remove the currently selected Tier 2 object while its editor is open.
13. Confirm the auxiliary editor clears safely instead of retaining stale content.

## Expected Results

- `Sound` is edited as a real multi-surface object.
- `PianoRoll` is edited from a dedicated note-entry canvas.
- `JMask` exposes generator editing rather than seed-only controls.
- Tier 2 editors continue to respect the common fallback behavior from Spec 037.