# Quickstart: BSB Widget UI

## Prerequisites

- Spec 022 `022-bsb-interface-parity` must be merged or present on the working branch.
- Java reference sources should be nearby for rendering details:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBHSliderView.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBVSliderView.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBKnobView.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBCheckBoxView.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBValueView.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBGroupView.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBXYControllerView.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/blueSynthBuilder/` (all `*BeanInfo.java` files)
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBEditPanel.java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/orchestra/editor/blueSynthBuilder/swing/BSBObjectViewHolder.java`

## Development Order

1. **Phase 0 — XML audit**: Open `~/work/blue/demo2026/01.csd` and a BSB-heavy `.blue` project. Grep for `knobHeight`, `precision`, `labelText`, `textFieldValue`, `selectedPath`, `sliderCount`, `xMinimum` to confirm which attribute names Java actually emits. Record results; adjust rename strategy before touching model code.

2. **Phase 1 — `@blue/data` model parity**: Add missing fields and handle renames in each widget class. Update parse + serialize + XML round-trip tests. Run `pnpm --filter @blue/data test` — must be green.

3. **Phase 2 — Widget renderer components**: Create `widgets/BSB[Name]Widget.tsx` for each of the 15 widget types. Start with `BSBHSlider`, `BSBKnob`, `BSBCheckBox`, `BSBLabel` since they have clear, simple layouts. Wire them into `BSBInterfaceCanvas.tsx`.

4. **Phase 3 — Generic dynamic property sheet**: Replaced per-widget panel approach with a single `BSBPropertySheet.tsx` that uses a `BEANINFO_PROPERTIES` map (15 widget types) to dynamically filter which fields appear per widget type. Includes inline dropdown items editor.

5. **Phase 3.5 — Widget interaction fixes**: Slider thumb drag, dropdown interaction, BSB group navigation with breadcrumb bar, value panel double-click editing, group color parsing, canvas background color, group child selection blocking in edit mode, group width/height calculation fix. See `BSB_GROUP_PANEL_WIDTH_ISSUE.md` for remaining ~5px group width issue.

6. **Phase 4 — Edit-mode affordances**: Add resize handles in the canvas wrapper for the 5 resizable types; implement `BSBValue` edit-mode placeholder.

6. **Phase 5 — Validation**: Full test + build pass, manual verification, XML round-trip diff.

## Manual Verification

1. Start the app: `pnpm --filter @blue/app dev`
2. Open a `.blue` project containing real BSB instruments with populated graphic interfaces (e.g., `~/work/blue/demo2026/01.csd`).
3. Select a BSB instrument → Interface tab:
   - Confirm sliders look like sliders, knobs look like knobs, labels show text, etc.
   - Confirm each widget renders at the correct position and approximate size.
4. Toggle edit mode:
   - Select a `BSBHSlider` → confirm resize handle appears at the right edge; drag it → confirm `sliderWidth` changes.
   - Select a `BSBKnob` → confirm property sheet shows `knobWidth`, `label`, `labelEnabled`, `valueDisplayEnabled`, etc.
   - Select a `BSBValue` → confirm it renders as a non-interactive label in edit mode.
5. Change a property in the property sheet → confirm canvas updates immediately.
6. Save and reopen → confirm all property changes persisted and no data was lost.
7. Verify `comment` appears as a tooltip on widget hover in non-edit mode.

## Automated Verification

Run from `/Users/stevenyi/work/blue-electron`:

```bash
pnpm --filter @blue/data test
pnpm --filter @blue/app test
pnpm --filter @blue/app build
git diff --check
```

## Key File Locations

| File | Purpose |
|---|---|
| `packages/blue-data/src/instruments/blue-synth-builder/bsb-h-slider.ts` | Model changes |
| `packages/blue-data/src/instruments/blue-synth-builder/bsb-knob.ts` | Model changes |
| `packages/blue-app/.../bsb/BSBInterfaceCanvas.tsx` | Widget dispatch |
| `packages/blue-app/.../bsb/BSBPropertySheet.tsx` | Property panel dispatch |
| `packages/blue-app/.../bsb/widgets/` | Per-widget renderer components |
| `packages/blue-app/.../bsb/BSBPropertySheet.tsx` | Generic dynamic property sheet with BeanInfo filtering |
| `specs/023-bsb-widget-ui/BSB_GROUP_PANEL_WIDTH_ISSUE.md` | BSBGroup width investigation |

## Expected Follow-On Work

- `BSBLineObject` line-editing interactions (drag control points).
- Full `BSBDropdown` item-list editor (add/remove/reorder dropdown items).
- `BSBGroup` nested child layout and border rendering.
- Automation/randomization workflow beyond property-sheet exposure.
- Any widget types discovered in real `.blue` files but not currently in the 15-type factory set.
