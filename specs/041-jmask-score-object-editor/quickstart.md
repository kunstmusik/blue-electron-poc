# Quickstart: JMask Score Object Editor Parity

## Goal

Validate that the `JMask` score-object editor no longer behaves like a seed-only placeholder and now exposes the parameter-stack workflow that this slice claims.

## Preconditions

1. Build and run the Electron app from `/Users/stevenyi/work/blue-electron` after this slice is implemented.
2. Prepare a project containing at least one `JMask` score object with multiple parameters and at least one optional section in use.
3. Keep an example where a table-based or preview-oriented workflow is expected if this slice claims it.

## Validation Steps

1. Load the project and open `ScoreObjectEditorTopComponent` for a `JMask` object.
2. Confirm the auxiliary editor renders a scrollable parameter stack instead of seed controls only.
3. Add one supported parameter and confirm it appears in the stack.
4. Reorder or remove a parameter using the supported workflow.
5. Change one supported generator selection or generator field value.
6. Enable one supported optional section such as mask, quantizer, accumulator, or probability.
7. Edit the nested section and confirm the canonical object refreshes coherently.
8. If the slice claims table-based or preview behavior, open that surface and verify it renders deliberate UI rather than a placeholder.
9. Save or reload the project and confirm supported `JMask` edits persist.
10. Remove the selected `JMask` target while the editor is open.
11. Confirm the editor falls back to the removed-target state instead of showing stale nested controls.

## Expected Results

- `JMask` opens in a real parameter-stack auxiliary editor.
- Supported generator, optional-section, and parameter-list edits mutate canonical state coherently.
- Unsupported nested data is surfaced explicitly instead of being implied silently.
- Any claimed table or preview behavior is deliberate and scoped to the selected target.
