# Research: BSB Widget UI

**Branch**: `023-bsb-widget-ui` | **Date**: 2026-04-24
**Sources**: Java Blue sources under `/Users/stevenyi/work/nbprojects/blue`

---

## 1. Java Property Exposure Mechanism — BeanInfo Introspection

Java Blue's property sheet (`BSBObjectPropertySheet`) does **not** manually enumerate widget fields. It uses the NetBeans `BeanNode` API on each widget class and passes the result to a `PropertySheetView`. The actual property list for each widget type is therefore declared exclusively in its `*BeanInfo.java` file under:

```
blue-core/src/main/java/blue/orchestra/blueSynthBuilder/
```

The TypeScript port must manually replicate the same field set because there is no BeanInfo-equivalent mechanism in the browser/renderer. The canonical field list per widget type is reproduced in `data-model.md`.

---

## 2. Widget-to-View Factory — `BSBObjectEditorFactory`

`blue-ui-core/.../swing/BSBObjectEditorFactory.java` — `getView(BSBObject bsbObj)` — maps each Java model class to a `BSBObjectView` subclass:

| Java Model Class        | View Class                   | Notes                         |
|-------------------------|------------------------------|-------------------------------|
| `BSBGroup`              | `BSBGroupView`               | Titled border container        |
| `BSBCheckBox`           | `BSBCheckBoxView`            |                               |
| `BSBDropdown`           | `BSBDropdownView`            |                               |
| `BSBFileSelector`       | `BSBFileSelectorView`        |                               |
| `BSBHSlider`            | `BSBHSliderView`             | `ResizeableView` (width only) |
| `BSBHSliderBank`        | `BSBHSliderBankView`         |                               |
| `BSBKnob`               | `BSBKnobView`                | `ResizeableView` (width only) |
| `BSBLabel`              | `BSBLabelView`               |                               |
| `BSBLineObject`         | `BSBLineObjectView`          | `ResizeableView` (both)       |
| `BSBSubChannelDropdown` | `BSBSubChannelDropdownView`  |                               |
| `BSBTextField`          | `BSBTextFieldView`           |                               |
| `BSBVSlider`            | `BSBVSliderView`             | `ResizeableView` (height only)|
| `BSBVSliderBank`        | `BSBVSliderBankView`         |                               |
| `BSBValue`              | `BSBValueView`               | `EditModeConditional`         |
| `BSBXYController`       | `BSBXYControllerView`        | `ResizeableView` (both)       |

`BSBEnvelopeGenerator` and `BSBTabbedPane` are commented out in the factory and remain deferred.

---

## 3. Edit Mode — `EditModeConditional` Interface

```java
// blue-ui-core/.../EditModeConditional.java
public interface EditModeConditional {
    void setEditEnabledProperty(BooleanProperty editEnabled);
}
```

Implementors add a `ChangeListener` on the `BooleanProperty` that switches between two render states:
- `BSBValueView`: disables user interaction in edit mode (shows placeholder label), re-enables in non-edit mode.
- `BSBHSliderView` and `BSBVSliderView` both implement `ResizeableView` but NOT `EditModeConditional` — they remain interactive in both modes; only resize handles appear in edit mode.

In the TypeScript port, the `editEnabled` boolean is already carried in `BSBInterfaceEditor` state (from Spec 022). Widget renderer components receive `editEnabled` as a prop and adapt rendering accordingly.

---

## 4. Resize Handles — `ResizeableView` Interface

```java
public interface ResizeableView {
    boolean canResizeWidgetWidth();
    boolean canResizeWidgetHeight();
    int getWidgetMinimumWidth();
    int getWidgetMinimumHeight();
}
```

`BSBEditPanel` wraps each widget view in a `BSBObjectViewHolder` which reads `canResizeWidgetWidth/Height()` and paints drag handles at the right/bottom edges. In the TypeScript port, this becomes per-widget metadata about which dimension supports drag-resize.

Per-widget resize capability (from Java source):

| Widget            | Width | Height |
|-------------------|-------|--------|
| `BSBHSlider`      | yes   | no     |
| `BSBVSlider`      | no    | yes    |
| `BSBKnob`         | yes   | no     |
| `BSBLineObject`   | yes   | yes    |
| `BSBXYController` | yes   | yes    |
| All others        | no    | no     |

---

## 5. Tooltip / Comment Pattern

`BSBObjectView.getToolTipText()` delegates to `bsbObj.getComment()` when `shouldShowToolTip()` is true. `shouldShowToolTip()` returns true only in non-edit mode.

In the TypeScript port, `comment` should be exposed as a `title` attribute on the root element of each widget renderer in non-edit mode.

---

## 6. BSBHSlider Rendering Pattern

Source: `BSBHSliderView.java`

Layout: `BoxLayout.X_AXIS` — `ValueSlider` + optional `ValuePanel` side-by-side.

- `ValueSlider`: occupies `sliderWidth` px (width), fixed `VALUE_DISPLAY_HEIGHT = 30` px (height).
- `ValuePanel`: optional, `VALUE_DISPLAY_WIDTH = 50` px wide × `VALUE_DISPLAY_HEIGHT = 30` px tall; shown when `valueDisplayEnabled` is true.
- Total width: `sliderWidth + (valueDisplayEnabled ? 50 : 0)`.
- Total height: always 30 px.
- `resolution` controls the number of discrete tick positions: `numTicks = (resolution > 0) ? (max - min) / resolution : (max - min) * 100`.
- `comment` shown as tooltip on the `ValueSlider` in non-edit mode.
- Resize: width only; minimum width = `VALUE_DISPLAY_WIDTH` (50 px if value display on) or some minimum slider px.

BSBVSlider is the transposed equivalent: height = `sliderHeight`, width = 30 fixed, `ValuePanel` appears below.

---

## 7. BSBKnob Rendering Pattern

Source: `BSBKnobView.java`

Layout: `GridBagLayout` stacked vertically — optional `JLabel` (top) + `Knob` circle (middle) + optional `ValuePanel` (bottom).

- `Knob` circle is `knobWidth × knobWidth` (square; Java has no separate `knobHeight`).
- `JLabel` shown when `labelEnabled` is true, using `labelFont`.
- `ValuePanel` shown when `valueDisplayEnabled` is true.
- Total height: `label height (if labelEnabled) + knobWidth + value panel height (if vde)`.
- Total width: `knobWidth`.
- Resize: width only (resizing width also resizes height since the knob is square).
- `comment` shown as tooltip on the `Knob` component.
- Scale: linear scale `[minimum, maximum]` → knob rotation.

---

## 8. BSBCheckBox Rendering Pattern

Source: `BSBCheckBoxView.java`

Layout: A single `JCheckBox` using `label` as the text.

- Non-edit mode: checkbox is fully interactive.
- Edit mode: checkbox is present but value interaction is not explicitly blocked (Java source does not implement `EditModeConditional`).
- No resize (neither width nor height).
- `comment` shown as tooltip in non-edit mode.

---

## 9. BSBLabel Rendering Pattern

No EditModeConditional, no ResizeableView. A plain `JLabel` with `label` text and `font` applied. No `objectName` (BSBLabel does not extend the base channel object).

---

## 10. BSBValue Rendering Pattern

`BSBValue` implements `EditModeConditional`:
- **Non-edit mode**: interactive numeric display (click/drag to change value, double-click to type).
- **Edit mode**: non-interactive placeholder label showing the channel name.

---

## 11. BSBGroup Rendering Pattern

`BSBGroupView` is a titled-border container. Key properties:
- `groupName` → title of the border.
- `titleEnabled` → shows/hides the title.
- `backgroundColor`, `borderColor`, `labelTextColor` → CSS-mappable colors.
- `font` → title font.
- Child widgets are rendered inside the group bounds.

Groups can be nested (a group's children can include other groups).

---

## 12. BSBXYController Rendering Pattern

A 2D pad component at `width × height`. Cross-hair at `(xValue, yValue)` normalized within `[XMin, XMax] × [YMin, YMax]`. Click/drag updates both values simultaneously. Optional value display shows numeric X/Y values when `valueDisplayEnabled` is true.

---

## 13. BSBLineObject Rendering Pattern

A canvas at `canvasWidth × canvasHeight`. Displays a list of piecewise linear line segments (from the `lines` property). `relativeXValues` and `XMax` control the X scale. Editable by clicking/dragging control points (in both edit and non-edit modes, subject to `locked` flag). `separatorType` and `leadingZero` affect CSD output, not the visual rendering.

---

## 14. BSBDropdown Rendering Pattern

A `JComboBox` with `BSBDropdownItemList` items at `fontSize` font size. `selectedIndex` tracks the current selection.

---

## 15. BSBTextField Rendering Pattern

A `JTextField` at `textFieldWidth` px wide. The field value is stored as `value` (Java name) — note the TypeScript class currently uses `textFieldValue` as the property name.

---

## 16. BSBFileSelector Rendering Pattern

A `JTextField` (at `textFieldWidth` px wide) + browse `JButton` side-by-side. `stringChannelEnabled` enables an additional string-channel route. `fileName` holds the current value.

---

## 17. BSBSubChannelDropdown Rendering Pattern

A `JComboBox` that lists available sub-channels in the BSB context. No extra configuration properties beyond `objectName`, `x`, `y`, `comment`.

---

## 18. BSBHSliderBank / BSBVSliderBank Rendering Patterns

`numberOfSliders` individual sliders arranged side-by-side (H) or stacked (V), each `sliderWidth`/`sliderHeight` wide/tall, with `gap` px spacing between them. `resolution`, `minimum`, `maximum`, `valueDisplayEnabled` apply uniformly to all sliders in the bank. Per-slider value display panels appear when `valueDisplayEnabled` is true.
