# Quickstart: Note Processor Parity Validation

## Automated Validation

From `/Users/stevenyi/work/blue-electron`:

```bash
pnpm --filter @blue/data test
pnpm --filter @blue/app test
pnpm --filter @blue/app build
```

## Manual Validation

1. Open a project containing score objects with note processor chains.
2. Select a supported score object and open ScoreObject Properties.
3. Confirm the Note Processors surface is editable, not just a summary.
4. Add an in-scope processor, edit one parameter, move it up/down, copy/paste it, and remove it.
5. Save and reload the project. Confirm processor identity, order, and parameters persist.
6. Add a named chain from the editor and import it into another chain.
7. Use a sound-object layer `N` affordance and edit that layer chain.
8. Use a layer-group affordance and edit that layer-group chain.
9. Use the root-score affordance and edit the root chain.
10. Render or generate CSD with object, layer, group, and root chains. Confirm output changes according to processor order.
11. Load a project containing PythonProcessor XML. Confirm it is preserved and clearly labeled as deferred, with no Jython/Python execution implied.
12. Load a project containing an unknown processor. Confirm it is preserved and cannot be accidentally overwritten by editing adjacent supported processors.

## Focused Regression Cases

- Root score chain with `AddProcessor` affects final generated notes.
- SoundLayer chain applies after score-object chain.
- LayerGroup chain applies after SoundLayer chain.
- Root score chain applies after LayerGroup chain.
- Seeded random processors produce stable results.
- Java helper `Code` is not addable as a processor.
- PythonProcessor is preservation-only in this feature.
