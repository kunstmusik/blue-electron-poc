# Contract: BSB Widget UI Surface

**Branch**: `023-bsb-widget-ui` | **Date**: 2026-04-24

---

## 1. Widget Renderer Component Contract

Each widget renderer lives in `packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/widgets/`.

### Props Interface

```typescript
interface BSBWidgetProps {
  /** The snapshot node for this widget (type-discriminated). */
  node: BsbWidgetNodeSnapshot;
  /** Whether the canvas is currently in edit mode. */
  editEnabled: boolean;
  /** Whether this widget is currently selected (edit mode only). */
  selected: boolean;
  /** Dispatch a patch for a widget property change originating from within the widget. */
  onPatch: (patch: BsbInterfacePatch) => void;
}
```

All 15 widget renderer components accept this interface. Individual components may use a narrowed version of `node` (e.g., `BSBHSliderNodeSnapshot`) for type safety.

### Positioning Contract

Widget renderers are **not** responsible for positioning. `BSBInterfaceCanvas` positions each widget component in an absolutely-placed wrapper at `(node.x, node.y)`. The widget component itself renders at its natural size.

### Size Contract

Each widget renders at its natural Java-parity size:

| Widget | Width formula | Height formula |
|---|---|---|
| `BSBHSlider` | `sliderWidth + (valueDisplayEnabled ? 50 : 0)` | `30` |
| `BSBVSlider` | `30` | `sliderHeight + (valueDisplayEnabled ? 50 : 0)` |
| `BSBKnob` | `knobWidth` | `(labelEnabled ? labelHeight : 0) + knobWidth + (valueDisplayEnabled ? 14 : 0)` |
| `BSBCheckBox` | `auto` | `auto` |
| `BSBDropdown` | `auto` | `auto` |
| `BSBLabel` | `auto` | `auto` |
| `BSBTextField` | `textFieldWidth` | `auto` |
| `BSBValue` | `auto` | `auto` |
| `BSBGroup` | `from children bounds` | `from children bounds` |
| `BSBXYController` | `width` | `height` |
| `BSBFileSelector` | `textFieldWidth + buttonWidth` | `auto` |
| `BSBLineObject` | `canvasWidth` | `canvasHeight` |
| `BSBSubChannelDropdown` | `auto` | `auto` |
| `BSBHSliderBank` | `numberOfSliders * sliderWidth + (numberOfSliders - 1) * gap` | `30` |
| `BSBVSliderBank` | `30` | `numberOfSliders * sliderHeight + (numberOfSliders - 1) * gap` |

### Edit Mode Contract

- All widgets: when `editEnabled` is true, the widget is visually "selected-aware" (no specific change required inside the component; selection highlight is applied by the canvas wrapper).
- `BSBValue` only: when `editEnabled` is true, replace the interactive value display with a non-interactive label showing `objectName`.
- No other widget type changes its interactive behavior based on `editEnabled` (resize handles are applied by the canvas wrapper, not the widget component itself).

### Tooltip / Comment Contract

When `editEnabled` is false and `node.comment` is non-empty, the root element of each widget renderer should carry `title={node.comment}`.

---

## 2. Widget Resize Metadata

Exported from a shared metadata module (e.g., `bsb-widget-meta.ts`):

```typescript
interface BsbWidgetResizeMeta {
  canResizeWidth: boolean;
  canResizeHeight: boolean;
  minWidth: number;
  minHeight: number;
  editModeConditional: boolean;
}

const BSB_WIDGET_RESIZE_META: Record<BsbWidgetType, BsbWidgetResizeMeta> = {
  BSBHSlider:      { canResizeWidth: true,  canResizeHeight: false, minWidth: 50,  minHeight: 30, editModeConditional: false },
  BSBVSlider:      { canResizeWidth: false, canResizeHeight: true,  minWidth: 30,  minHeight: 50, editModeConditional: false },
  BSBKnob:         { canResizeWidth: true,  canResizeHeight: false, minWidth: 20,  minHeight: 20, editModeConditional: false },
  BSBLineObject:   { canResizeWidth: true,  canResizeHeight: true,  minWidth: 50,  minHeight: 50, editModeConditional: false },
  BSBXYController: { canResizeWidth: true,  canResizeHeight: true,  minWidth: 50,  minHeight: 50, editModeConditional: false },
  BSBValue:        { canResizeWidth: false, canResizeHeight: false, minWidth: 0,   minHeight: 0,  editModeConditional: true  },
  // All others: no resize, no editModeConditional
};
```

`BSBInterfaceCanvas` reads this metadata to conditionally render resize handles in edit mode.

---

## 3. Typed Per-Widget Property Panel Contract

Each property panel lives in `packages/blue-app/src/renderer/components/workbench/panels/orchestra/bsb/property-panels/`.

```typescript
interface BSBPropertyPanelProps<T extends BsbWidgetNodeSnapshot> {
  node: T;
  onPatch: (patch: BsbInterfacePatch) => void;
}
```

Each panel is responsible for rendering labeled inputs for all properties listed in the Java BeanInfo matrix for that widget type (see `data-model.md`).

`BSBPropertySheet` dispatches to the correct panel via a switch on `selectedWidget.type`.

---

## 4. BsbInterfacePatch Extensions

The `BsbInterfacePatch` union type (established in Spec 022) must be extended or remain generic enough to carry new field updates. For most new fields, the existing `UpdateWidgetProperty` intent variant covers them:

```typescript
// Existing variant — already sufficient for most new fields
{ type: 'UpdateWidgetProperty', widgetId: string, property: string, value: unknown }
```

Structured patch variants (e.g., `UpdateDropdownItems`) may be added as needed for list-valued properties like `BSBDropdownItemList`.

---

## 5. Canvas Wrapper Selection/Resize Pattern

`BSBInterfaceCanvas` wraps each rendered widget in a positioned container that:
1. Applies `position: absolute; left: node.x; top: node.y`.
2. Applies a selection highlight ring when `selected` is true and `editEnabled` is true.
3. Renders a right-edge drag handle when `canResizeWidth` is true and `editEnabled` is true.
4. Renders a bottom-edge drag handle when `canResizeHeight` is true and `editEnabled` is true.
5. Drag handlers dispatch `UpdateWidgetProperty` patches for `width`/`height` or the widget-specific size field.
