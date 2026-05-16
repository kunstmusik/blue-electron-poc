# Quickstart: JMask Score Object Editor Parity

## Goal

Validate that the `JMask` score-object editor no longer behaves like a seed-only placeholder and now exposes the Java-style top bar, parameter-stack workflow, generator routing, modifier sections, and any table or preview behavior that this slice claims.

## Preconditions

1. Build and run the Electron app from `/Users/stevenyi/work/blue-electron` after this slice is implemented.
2. Open `fixtures/jmask-all-generators.blue` or prepare a project containing at least one `JMask` score object with multiple parameters, at least one hidden row, at least one renamed field, and at least one optional section in use.
3. Use a `JMask` object that includes `Constant`, `Item List`, `Segment`, `Random`, `Probability`, and `Oscillator` parameters when validating the full supported subset.

## Validation Steps

1. Load the project and open `ScoreObjectEditorTopComponent` for a `JMask` object.
2. Confirm the auxiliary editor renders the Java-style top bar with the title, visibility popup, seed controls, and the claimed preview entry point instead of seed controls only.
3. Toggle one row's visibility from the top-bar popup and confirm the parameter stack hides or restores that row coherently.
4. Use the parameter-row context menu to add a parameter before or after an existing row and confirm the new row uses the chosen generator type.
5. Use the supported workflow to push a row up or down, then confirm the visible labels renumber correctly.
6. Confirm the first three rows follow the protected removal behavior claimed by the implementation.
7. Double-click a parameter label to rename its field and confirm the label updates coherently.
8. Change one supported generator selection or generator field value.
9. Enable one supported optional section such as mask, quantizer, accumulator, or probability.
10. Edit the nested section and confirm the canonical object refreshes coherently.
11. Exercise point insert, drag, and remove behavior on one supported table surface.
12. Trigger preview with the `Test` button or `Cmd/Ctrl+T` and verify generated notes are tied to the selected target duration.
13. Save or reload the project and confirm supported `JMask` edits persist.
14. Remove the selected `JMask` target while the editor is open.
15. Confirm the editor falls back to the removed-target state instead of showing stale nested controls.

## Expected Results

- `JMask` opens in a real parameter-stack auxiliary editor with the Java-style top bar and row controls claimed by the implementation.
- Supported generator, optional-section, table, and parameter-list edits mutate canonical state coherently and survive save/reload through the `@blue/data` field snapshot.
- The Java registry order is `Constant`, `Item List`, `Segment`, `Random`, `Probability`, `Oscillator`.
- Supported probability subtype order is `Uniform`, `Linear`, `Triangle`, `Exponential`, `Gaussian`, `Cauchy`, `Beta`, `Weibull`.
- Table and preview behavior is deliberate and scoped to the selected target.

## Automated Closeout Coverage

- `packages/blue-data/src/sound-objects/j-mask.test.ts`
- `packages/blue-data/src/sound-objects/jmask-save-load.test.ts`
- `packages/blue-app/src/renderer/tests/jmask-editor-contract.test.tsx`
