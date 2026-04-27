# Feature Specification: BSB Widget UI

**Feature Branch**: `023-bsb-widget-ui`
**Created**: 2026-04-24
**Status**: Complete
**Input**: User description: "Implement BSB Widget UI elements for edit and non-edit mode. Implementation should be based on original Java code (/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/orchestra/blueSynthBuilder). Review that all properties exposed in BSB widget properties panel matches those exposed in Java."

## User Scenarios & Testing *(mandatory)*

### Current Implementation Notes

- Spec 022 established the BSB editing infrastructure: canvas, property/grid sidebar, preset bar, and UDO editor.
- The Interface tab still renders all widgets as identical generic labeled boxes (no widget-specific visuals).
- The property sheet shows a fixed layout block (objectName, x, y, width, height) plus a blind dump of `widget.properties` rather than typed, Java-parity per-widget fields.
- Several TypeScript `@blue/data` widget model classes are missing properties that are exposed in Java's `*BeanInfo.java` descriptors. These gaps mean the property sheet, even if re-wired, would omit important fields.
- This spec closes out those three areas: data-model parity, non-edit rendering, and edit-mode affordances.
- Additional fixes delivered in this slice: preset application now correctly restores widget-specific state via `getPresetValue`/`setPresetValue` ( Checkbox, Dropdown, FileSelector, SubChannelDropdown, TextField, Value, XYController ) and syncs parameters after preset apply; runtime widget value changes now use `setValue()` and propagate to linked automation parameters; randomize support added to all randomizable widget types; engine-client request queueing prevents interleaved ZeroMQ messages.

---

### User Story 1 – Widget-specific visual rendering in non-edit mode (Priority: P1)

As a composer viewing a BlueSynthBuilder instrument in the Interface tab, I need each widget to look like its Java Blue counterpart so I can understand and use the interface without switching to Java Blue.

**Why this priority**: The Interface tab is the primary BSB editing surface and is nearly useless when every widget is an identical gray box.

**Independent Test**: Open a BSB project, select a BSB instrument, switch to the Interface tab in non-edit mode, and confirm that each major widget type (Slider, Knob, Toggle, Label, Dropdown, TextField, FileSelector, Value, XYController, LineObject, Group, SubChannelDropdown, SliderBank) renders visually distinct from the others and matches the spatial layout of the Java Blue interface.

**Acceptance Scenarios**:

1. **Given** a BSB instrument with a populated graphic interface is selected, **When** the Interface tab opens in non-edit mode, **Then** each widget renders with widget-type-specific appearance that communicates its type and current value.
2. **Given** a `BSBHSlider` or `BSBVSlider` widget is present, **When** the interface renders, **Then** the slider track and thumb are rendered at the correct `sliderWidth`/`sliderHeight`, with an optional numeric value display to the right/bottom when `valueDisplayEnabled` is true.
3. **Given** a `BSBKnob` widget is present, **When** the interface renders, **Then** the knob circle is sized to `knobWidth`, an optional label appears above if `labelEnabled` is true, and an optional value display appears below if `valueDisplayEnabled` is true.
4. **Given** a `BSBCheckBox` widget is present, **When** the interface renders, **Then** a checkbox control with its `label` is shown.
5. **Given** a `BSBDropdown` widget is present, **When** the interface renders, **Then** a select control with the current selected item and all dropdown items is rendered.
6. **Given** a `BSBLabel` widget is present, **When** the interface renders, **Then** the `label` text is shown with the configured `font`.
7. **Given** a `BSBTextField` widget is present, **When** the interface renders, **Then** a text input at `textFieldWidth` shows the current `value`.
8. **Given** a `BSBValue` widget is present in non-edit mode, **When** the interface renders, **Then** the widget shows a clickable/draggable numeric value display (matching Java's `BSBValueView` non-edit behavior).
9. **Given** a `BSBGroup` widget is present, **When** the interface renders, **Then** a titled border container using `groupName` and configured `backgroundColor`/`borderColor` wraps the group's child widgets.
10. **Given** a `BSBXYController` widget is present, **When** the interface renders, **Then** a 2D pad area at the configured `width`×`height` shows the current X/Y position.
11. **Given** a `BSBFileSelector` widget is present, **When** the interface renders, **Then** a text field plus browse button at `textFieldWidth` is shown.
12. **Given** a `BSBLineObject` widget is present, **When** the interface renders, **Then** a canvas at `canvasWidth`×`canvasHeight` shows the current line segments.
13. **Given** a `BSBSubChannelDropdown` widget is present, **When** the interface renders, **Then** a dropdown is rendered for sub-channel selection.
14. **Given** a `BSBHSliderBank` or `BSBVSliderBank` widget is present, **When** the interface renders, **Then** `numberOfSliders` sliders are rendered side-by-side (horizontal) or stacked (vertical) at the configured `sliderWidth`/`sliderHeight` and `gap`.

---

### User Story 2 – Java-parity per-widget property sheet (Priority: P1)

As a composer editing a BSB interface in edit mode, I need the property sheet to expose the same typed fields as the Java Blue property sheet for each widget type so that I can configure widgets without resorting to raw XML.

**Why this priority**: The Java property sheet exposes type-specific fields for every widget (e.g., `resolution`, `valueDisplayEnabled`, `labelEnabled`, `knobWidth`) via `*BeanInfo.java` descriptors. The current Electron property sheet blindly iterates `widget.properties` and misses most of these.

**Independent Test**: Select each widget type in edit mode and compare the property sheet fields to the Java BeanInfo-derived property matrix. All fields in the Java matrix must appear with appropriate editors.

**Acceptance Scenarios**:

1. **Given** a `BSBHSlider` or `BSBVSlider` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `sliderWidth`/`sliderHeight`, `minimum`, `maximum`, `value`, `resolution`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment`.
2. **Given** a `BSBKnob` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `knobWidth`, `minimum`, `maximum`, `value`, `label`, `labelEnabled`, `labelFont`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment`.
3. **Given** a `BSBCheckBox` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `label`, `automationAllowed`, `randomizable`, `comment`.
4. **Given** a `BSBDropdown` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `selectedIndex`, `fontSize`, `automationAllowed`, `randomizable`, `comment`; and provides a way to edit the dropdown item list (`BSBDropdownItemList`).
5. **Given** a `BSBLabel` is selected, **When** the property sheet opens, **Then** it exposes: `x`, `y`, `label`, `font`.
6. **Given** a `BSBTextField` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `textFieldWidth`, `value`, `comment`.
7. **Given** a `BSBValue` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `minimum`, `maximum`, `defaultValue`, `automationAllowed`.
8. **Given** a `BSBXYController` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `width`, `height`, `XMin`, `XMax`, `YMin`, `YMax`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment`.
9. **Given** a `BSBGroup` is selected, **When** the property sheet opens, **Then** it exposes: `x`, `y`, `groupName`, `titleEnabled`, `font`, `backgroundColor`, `borderColor`, `labelTextColor`, `comment`.
10. **Given** a `BSBFileSelector` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `textFieldWidth`, `stringChannelEnabled`, `fileName`, `comment`.
11. **Given** a `BSBHSliderBank` or `BSBVSliderBank` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `numberOfSliders`, `sliderWidth`/`sliderHeight`, `minimum`, `maximum`, `resolution`, `gap`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment`.
12. **Given** a `BSBLineObject` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `canvasWidth`, `canvasHeight`, `XMax`, `separatorType`, `leadingZero`, `relativeXValues`, `locked`, `comment`.
13. **Given** a `BSBSubChannelDropdown` is selected, **When** the property sheet opens, **Then** it exposes: `objectName`, `x`, `y`, `comment`.

---

### User Story 3 – Edit-mode visual affordances (Priority: P2)

As a composer in BSB edit mode, I need widgets to show resize handles and interactive drag feedback like Java Blue's `ResizeableView` so I can resize and reposition widgets with precision.

**Why this priority**: Java Blue's `BSBEditPanel` wraps every widget in a `BSBObjectViewHolder` and the `ResizeableView` interface adds per-widget drag handles at the edges. Without this, the canvas edit experience is significantly below Java Blue parity.

**Independent Test**: Enter edit mode, select a widget that supports resizing (Slider, Knob, XYController, LineObject), and drag its resize handle. Confirm the widget width/height property updates and the canvas reflects the new size.

**Acceptance Scenarios**:

1. **Given** edit mode is active, **When** a resizable widget is selected, **Then** resize handles appear at the appropriate edges (width-only, height-only, or both, per widget type).
2. **Given** edit mode is active and a resize handle is dragged, **When** the drag ends, **Then** the widget's dimension property updates and the canvas reflects the new size.
3. **Given** edit mode is active, **When** the same widget is in non-edit mode, **Then** no resize handles are visible.
4. **Given** `BSBValue` is selected in edit mode, **When** rendered, **Then** the widget shows a non-interactive placeholder (matches Java's `BSBValueView.setEditEnabledProperty` behavior, which disables value interaction in edit mode).
5. **Given** `BSBHSlider` or `BSBVSlider` is selected in edit mode, **When** rendered, **Then** the slider is interactive but also shows a width/height resize handle at the appropriate edge.

---

### User Story 4 – Data model property parity (Priority: P2)

As a developer maintaining `@blue/data`, I need the TypeScript BSB widget classes to expose the same properties as their Java BeanInfo counterparts so that any UI layer can produce a complete, round-trip-safe representation.

**Why this priority**: Several TS widget classes are missing BeanInfo-listed fields. This prevents the property sheet from being correct even if re-wired, and causes silent data loss on save/reload.

**Independent Test**: Run the `@blue/data` test suite plus XML round-trip fixtures against a Java Blue-generated `.blue` file that exercises all 15 widget types. All BeanInfo-listed properties must survive parse→serialize→re-parse without loss.

**Acceptance Scenarios**:

1. **Given** a `BSBHSlider` or `BSBVSlider` object is parsed from Java XML, **When** serialized and re-parsed, **Then** `resolution`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, and `comment` survive round-trip.
2. **Given** a `BSBKnob` object is parsed from Java XML, **When** serialized and re-parsed, **Then** `label`, `labelEnabled`, `labelFont`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, and `comment` survive round-trip; `knobHeight` is removed if not present in Java BeanInfo (use `knobWidth` only).
3. **Given** a `BSBCheckBox` object is parsed from Java XML, **When** serialized and re-parsed, **Then** `label`, `automationAllowed`, `randomizable`, and `comment` survive round-trip.
4. **Given** a `BSBDropdown` object is parsed from Java XML, **When** serialized and re-parsed, **Then** `fontSize`, `automationAllowed`, `randomizable`, and `comment` survive round-trip.
5. **Given** a `BSBValue` object is parsed from Java XML, **When** serialized and re-parsed, **Then** `defaultValue` survives round-trip; `precision` is retained if present in actual Java XML.
6. **Given** a `BSBGroup` object is parsed from Java XML, **When** serialized and re-parsed, **Then** `backgroundColor`, `borderColor`, `font`, `groupName`, `labelTextColor`, and `titleEnabled` survive round-trip.
7. **Given** a `BSBLabel` object is parsed from Java XML, **When** serialized and re-parsed, **Then** `font` survives round-trip and `label` is the canonical field name.
8. **Given** a `BSBHSliderBank` or `BSBVSliderBank` is parsed from Java XML, **When** serialized and re-parsed, **Then** `numberOfSliders` (not `sliderCount`), `resolution`, `gap`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, and `comment` survive round-trip.
9. **Given** a `BSBXYController` is parsed from Java XML, **When** serialized and re-parsed, **Then** `XMin`, `XMax`, `YMin`, `YMax`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, and `comment` survive round-trip.
10. **Given** a `BSBFileSelector` is parsed from Java XML, **When** serialized and re-parsed, **Then** `textFieldWidth` and `comment` survive round-trip.
11. **Given** a `BSBTextField` is parsed from Java XML, **When** serialized and re-parsed, **Then** `comment` survives round-trip; the field holding the text value uses the Java canonical name `value`.
12. **Given** a `BSBSubChannelDropdown` is parsed from Java XML, **When** serialized and re-parsed, **Then** `comment` survives round-trip.
13. **Given** a `BSBLineObject` is parsed from Java XML, **When** serialized and re-parsed, **Then** `canvasWidth`, `canvasHeight`, `XMax`, `separatorType`, `leadingZero`, `relativeXValues`, `locked`, and `comment` survive round-trip.

---

### User Story 5 – Canvas context menu for add/remove widgets (Priority: P1)

As a composer editing a BSB interface in edit mode, I need a right-click context menu on the canvas to add new widgets at the click position and remove selected widgets, matching Java Blue's `BSBEditPanelPopup` behavior.

**Why this priority**: Adding and removing widgets is a core editing operation. Without it, the BSB interface editor is read-only in terms of structure.

**Independent Test**: Enter edit mode, right-click on the canvas, select "Add Knob" from the context menu, confirm a new knob widget appears at the click position. Select it, right-click, choose "Remove", confirm it is removed.

**Acceptance Scenarios**:

1. **Given** edit mode is active, **When** the user right-clicks on the canvas background, **Then** a context menu appears with "Add" items for all 15 widget types (Group, Knob, Horizontal Slider, Horizontal Slider Bank, Vertical Slider, Vertical Slider Bank, CheckBox, Label, Dropdown List, SubChannel Dropdown List, File Selector, XY Controller, Line Object, Text Field, Value).
2. **Given** edit mode is active, **When** the user selects "Add Knob" from the context menu, **Then** a new BSBKnob widget is created at the right-click position with grid snapping applied if snap is enabled, and the widget appears in the canvas.
3. **Given** edit mode is active and a widget is selected, **When** the user right-clicks on the canvas, **Then** the context menu includes a "Remove" item.
4. **Given** edit mode is active and the user selects "Remove" from the context menu, **When** a widget is selected, **Then** the widget is removed from the canvas.
5. **Given** the user is inside a nested group, **When** a widget is added via context menu, **Then** it is added as a child of the current group.

---

### User Story 6 – Drag-to-move widgets in edit mode (Priority: P1)

As a composer editing a BSB interface in edit mode, I need to drag selected widgets to reposition them, matching Java Blue's `BSBObjectViewHolder` mouse-drag behavior.

**Why this priority**: Positioning widgets is a fundamental editing operation. Without drag-to-move, the only way to reposition widgets is by editing x/y in the property sheet.

**Independent Test**: Enter edit mode, select a widget, click and drag it to a new position. Confirm the widget follows the mouse, grid snap is applied if enabled, and the position is persisted.

**Acceptance Scenarios**:

1. **Given** edit mode is active and a widget is selected, **When** the user clicks and drags the widget, **Then** the widget moves to follow the mouse.
2. **Given** grid snap is enabled, **When** the user drags a widget, **Then** the position snaps to the grid.
3. **Given** the user drags a widget, **When** the position would go below zero, **Then** the widget is clamped at x=0 or y=0.

---

### User Story 7 – Radix Tooltip for widget comments (Priority: P3)

As a composer viewing a BSB interface in non-edit mode, I need widget comments to appear quickly as tooltips when hovering, matching Java Blue's tooltip behavior (near-instant show).

**Why deferred**: The native HTML `title` attribute works but has a ~500ms show delay. Radix Tooltip would provide instant-on-hover behavior. Functional but lower priority.

**Acceptance Scenarios**:

1. **Given** a widget has a `comment` property set, **When** the user hovers over the widget in non-edit mode, **Then** a tooltip appears within ~100ms showing the comment text.

---

### User Story 8 – Multi-select, keyboard movement, and marquee selection (Priority: P3)

As a composer editing a BSB interface, I need to select multiple widgets, move them with arrow keys, and use marquee (rubber-band) selection, matching Java Blue's `BSBObjectViewHolder` shift-click and `BSBEditPanel` marquee behavior.

**Why deferred**: Multi-select requires changing `selectedWidgetId` (singular) to `selectedWidgetIds` (plural) across the entire BSB editing stack. This is a significant refactor that affects canvas, property sheet, and all widget wrappers.

**Acceptance Scenarios**:

1. **Given** edit mode is active, **When** the user Shift-clicks a widget, **Then** the widget is toggled in/out of the selection set without clearing other selections.
2. **Given** multiple widgets are selected, **When** the user presses an arrow key, **Then** all selected widgets move by 1px (or grid size if snap enabled).
3. **Given** edit mode is active, **When** the user clicks and drags on empty canvas, **Then** a selection rectangle is drawn and all widgets within are selected on mouse release.
