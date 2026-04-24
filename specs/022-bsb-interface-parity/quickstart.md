# Quickstart: BlueSynthBuilder Interface Parity

## Prerequisites

- Work from the current Orchestra baseline that landed in Spec 021.
- Keep Java reference sources nearby:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/orchestra/editor/BlueSynthBuilderEditor.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBInterfaceEditor.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/udo/EmbeddedOpcodeListPanel.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/blueSynthBuilder/PresetGroup.java`

## Development Order

1. Expand `@blue/data` BlueSynthBuilder support for richer interface state, preset-group preservation, and embedded opcode-list mutation helpers.
2. Extend the shared BSB snapshot/patch contract in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`.
3. Extend the renderer project store to support optimistic BSB interface edits without regressing the Spec 021 latest-only reconciliation protections.
4. Replace the Interface placeholder in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBInterfaceEditor.tsx` with a canvas plus property/grid/preset editing surfaces.
5. Replace the UDO placeholder in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/BSBUDOPanel.tsx` with an embedded opcode-list editor.
6. Refresh BSB code-tab completion plumbing so live interface object-name edits are visible immediately in the Code tab.

## Manual Verification

1. Start the app with `pnpm --filter @blue/app dev`.
2. Open a `.blue` project that contains real BlueSynthBuilder instruments with populated interface widgets.
3. Open the `Orchestra` tab and select a BSB instrument.
4. In `Interface`, verify the canvas renders the interface widgets instead of the Spec 021 placeholder.
5. Toggle BSB edit mode, select a widget, change layout or common properties, save, reopen, and confirm the edits persist.
6. Apply an existing preset and confirm the interface values update.
7. Open the `UDO` tab, edit the embedded opcode list, save, reopen, and confirm the opcode list persists.
8. Rename an interface object, switch to `Code`, and confirm BSB completion entries reflect the new name.

## Implementation Notes

- Spec 021's BSB code tabs and tab layout remain the baseline and should not be reworked without a clear regression reason.
- Unsupported or partially ported widgets must be preserved even if the first pass cannot fully edit them.
- Preset support should prioritize applying and preserving existing presets before deeper authoring workflow parity.

## Automated Verification

Run these from `/Users/stevenyi/work/blue-electron`:

```bash
pnpm --filter @blue/data test
pnpm --filter @blue/app test
pnpm --filter @blue/app build
git diff --check
```

## Expected Follow-On Work

- Deeper preset-authoring workflows if existing-preset application/preservation is insufficient for the first pass.
- Additional unsupported BSB widget types beyond the currently ported TypeScript model.
- Any remaining Java BSB property-sheet fields that are discovered during implementation but do not fit the initial slice.