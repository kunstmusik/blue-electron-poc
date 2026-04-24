# Requirements Checklist: BSB Widget UI

**Branch**: `023-bsb-widget-ui` | **Date**: 2026-04-24

---

## User Story 1 — Widget-specific visual rendering in non-edit mode (P1)

- [ ] All widgets render visually distinct from generic gray boxes
- [ ] `BSBHSlider`: slider track at `sliderWidth` × 30px; value panel (50×30) when `valueDisplayEnabled`
- [ ] `BSBVSlider`: slider track at 30 × `sliderHeight`; value panel below when `valueDisplayEnabled`
- [ ] `BSBKnob`: circle at `knobWidth`; label above when `labelEnabled`; value panel below when `valueDisplayEnabled`
- [ ] `BSBCheckBox`: checkbox with `label` text
- [ ] `BSBDropdown`: select control with items from `BSBDropdownItemList` at `fontSize`
- [ ] `BSBLabel`: plain text using `label` and `font`
- [ ] `BSBTextField`: text input at `textFieldWidth`
- [ ] `BSBValue`: interactive numeric display (click/drag to change); `comment` tooltip in non-edit mode
- [ ] `BSBGroup`: titled border container with `groupName`; child widgets rendered inside
- [ ] `BSBXYController`: 2D pad at `width`×`height`; cross-hair at `(xValue, yValue)`; value display when `valueDisplayEnabled`
- [ ] `BSBFileSelector`: text field at `textFieldWidth` + browse button
- [ ] `BSBLineObject`: canvas at `canvasWidth`×`canvasHeight` with line segments
- [ ] `BSBSubChannelDropdown`: dropdown for sub-channel selection
- [ ] `BSBHSliderBank`: `numberOfSliders` sliders side-by-side at `sliderWidth` with `gap`
- [ ] `BSBVSliderBank`: `numberOfSliders` sliders stacked at `sliderHeight` with `gap`
- [ ] All widgets positioned at `(node.x, node.y)` by the canvas wrapper
- [ ] `comment` shown as `title` tooltip on each widget in non-edit mode

---

## User Story 2 — Java-parity per-widget property sheet (P1)

- [ ] Property sheet dispatches to typed per-widget panel (not generic property dump)
- [ ] `BSBHSlider` panel: objectName, x, y, sliderWidth, minimum, maximum, value, resolution, valueDisplayEnabled, automationAllowed, randomizable, comment
- [ ] `BSBVSlider` panel: objectName, x, y, sliderHeight, minimum, maximum, value, resolution, valueDisplayEnabled, automationAllowed, randomizable, comment
- [ ] `BSBKnob` panel: objectName, x, y, knobWidth, minimum, maximum, value, label, labelEnabled, labelFont, valueDisplayEnabled, automationAllowed, randomizable, comment
- [ ] `BSBCheckBox` panel: objectName, x, y, label, automationAllowed, randomizable, comment
- [ ] `BSBDropdown` panel: objectName, x, y, selectedIndex, BSBDropdownItemList editor, fontSize, automationAllowed, randomizable, comment
- [ ] `BSBLabel` panel: x, y, label, font
- [ ] `BSBTextField` panel: objectName, x, y, textFieldWidth, value, comment
- [ ] `BSBValue` panel: objectName, x, y, minimum, maximum, defaultValue, automationAllowed
- [ ] `BSBXYController` panel: objectName, x, y, width, height, XMin, XMax, YMin, YMax, valueDisplayEnabled, automationAllowed, randomizable, comment
- [ ] `BSBGroup` panel: x, y, groupName, titleEnabled, font, backgroundColor, borderColor, labelTextColor, comment
- [ ] `BSBFileSelector` panel: objectName, x, y, textFieldWidth, stringChannelEnabled, fileName, comment
- [ ] `BSBHSliderBank` panel: objectName, x, y, numberOfSliders, sliderWidth, minimum, maximum, resolution, gap, valueDisplayEnabled, automationAllowed, randomizable, comment
- [ ] `BSBVSliderBank` panel: objectName, x, y, numberOfSliders, sliderHeight, minimum, maximum, resolution, gap, valueDisplayEnabled, automationAllowed, randomizable, comment
- [ ] `BSBLineObject` panel: objectName, x, y, canvasWidth, canvasHeight, XMax, separatorType, leadingZero, relativeXValues, locked, comment
- [ ] `BSBSubChannelDropdown` panel: objectName, x, y, comment
- [ ] Property edits dispatch patch and update canvas immediately

---

## User Story 3 — Edit-mode visual affordances (P2)

- [ ] `BSBHSlider`: right-edge resize handle in edit mode; drag updates `sliderWidth`
- [ ] `BSBVSlider`: bottom-edge resize handle in edit mode; drag updates `sliderHeight`
- [ ] `BSBKnob`: right-edge resize handle in edit mode; drag updates `knobWidth`
- [ ] `BSBLineObject`: right + bottom edge handles; drag updates `canvasWidth`/`canvasHeight`
- [ ] `BSBXYController`: right + bottom edge handles; drag updates `width`/`height`
- [ ] `BSBValue`: non-interactive label with `objectName` shown in edit mode
- [ ] Resize handles not visible in non-edit mode
- [ ] Resize respects snap-to-grid when `gridSettings.snapEnabled` is true

---

## User Story 4 — Data model property parity (P2)

- [ ] `BSBHSlider`: `resolution`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` added; round-trip test passes
- [ ] `BSBVSlider`: same as above
- [ ] `BSBKnob`: `label`, `labelEnabled`, `labelFont`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` added; `knobHeight` audited/removed; round-trip test passes
- [ ] `BSBCheckBox`: `label`, `automationAllowed`, `randomizable`, `comment` added; round-trip test passes
- [ ] `BSBDropdown`: `fontSize`, `automationAllowed`, `randomizable`, `comment` added; round-trip test passes
- [ ] `BSBValue`: `defaultValue`, `automationAllowed` added; `precision` audited; round-trip test passes
- [ ] `BSBGroup`: `groupName`, `titleEnabled`, `font`, `backgroundColor`, `borderColor`, `labelTextColor`, `comment` added; round-trip test passes
- [ ] `BSBLabel`: renamed `labelText`→`label`; `font` added; round-trip test passes
- [ ] `BSBHSliderBank`: renamed `sliderCount`→`numberOfSliders`; `resolution`, `gap`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` added; round-trip test passes
- [ ] `BSBVSliderBank`: same as above
- [ ] `BSBFileSelector`: renamed `selectedPath`→`fileName`; `textFieldWidth`, `comment` added; round-trip test passes
- [ ] `BSBTextField`: renamed `textFieldValue`→`value`; `comment` added; round-trip test passes
- [ ] `BSBSubChannelDropdown`: `comment` added; round-trip test passes
- [ ] `BSBXYController`: renamed `xMinimum`→`XMin`, `xMaximum`→`XMax`, `yMinimum`→`YMin`, `yMaximum`→`YMax`; `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` added; round-trip test passes
- [ ] `BSBLineObject`: `comment` added; round-trip test passes
- [ ] All `@blue/data` tests pass after model changes
- [ ] Java-generated `.blue` file parsed, saved, and diffed — no data loss

---

## Cross-Cutting Requirements

- [ ] `pnpm --filter @blue/data test` passes
- [ ] `pnpm --filter @blue/app test` passes
- [ ] `pnpm --filter @blue/app build` passes
- [ ] `git diff --check` passes (no whitespace errors)
- [ ] Spec 022 canvas selection, preset bar, grid settings, and UDO editor remain functional (no regression)
- [ ] Widget rendering does not break if optional fields are absent (defaults applied)
