# Data Model: BSB Widget UI

**Branch**: `023-bsb-widget-ui` | **Date**: 2026-04-24

---

## 1. Java BeanInfo Property Matrix (Canonical)

Properties are listed as declared by `*BeanInfo.java` — these are the authoritative exposed properties for the property sheet in Java Blue. Properties marked with `(*)` are absent or misnamed in the current TypeScript model.

### BSBCheckBox
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `label` | `String` | (*) missing in TS |
| `automationAllowed` | `boolean` | (*) missing in TS |
| `randomizable` | `boolean` | (*) missing in TS |
| `comment` | `String` | (*) missing in TS |

### BSBDropdown
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `selectedIndex` | `int` | |
| `BSBDropdownItemList` | list | (*) list management; TypeScript needs add/remove/reorder items |
| `fontSize` | `int` | (*) missing in TS |
| `automationAllowed` | `boolean` | (*) missing in TS |
| `randomizable` | `boolean` | (*) missing in TS |
| `comment` | `String` | (*) missing in TS |

### BSBFileSelector
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `fileName` | `String` | TS uses `selectedPath` — rename or alias |
| `textFieldWidth` | `int` | (*) missing in TS |
| `stringChannelEnabled` | `boolean` | present in TS |
| `comment` | `String` | (*) missing in TS |

### BSBGroup
| Property | Java Type | Notes |
|---|---|---|
| `x` | `int` | |
| `y` | `int` | |
| `groupName` | `String` | (*) missing in TS |
| `titleEnabled` | `boolean` | (*) missing in TS |
| `font` | `Font` | (*) missing in TS; serialize as font-family string |
| `backgroundColor` | `Color` | (*) missing in TS; serialize as hex string |
| `borderColor` | `Color` | (*) missing in TS; serialize as hex string |
| `labelTextColor` | `Color` | (*) missing in TS; serialize as hex string |
| `comment` | `String` | (*) missing in TS |

### BSBHSlider
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `sliderWidth` | `int` | present in TS |
| `minimum` | `double` | present via base class |
| `maximum` | `double` | present via base class |
| `value` | `double` | present via base class |
| `resolution` | `double` | (*) missing in TS |
| `valueDisplayEnabled` | `boolean` | (*) missing in TS |
| `automationAllowed` | `boolean` | (*) missing in TS |
| `randomizable` | `boolean` | (*) missing in TS |
| `comment` | `String` | (*) missing in TS |

### BSBHSliderBank
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `numberOfSliders` | `int` | TS uses `sliderCount` — rename |
| `sliderWidth` | `int` | present in TS |
| `minimum` | `double` | present via base |
| `maximum` | `double` | present via base |
| `resolution` | `double` | (*) missing in TS |
| `gap` | `int` | (*) missing in TS |
| `valueDisplayEnabled` | `boolean` | (*) missing in TS |
| `automationAllowed` | `boolean` | (*) missing in TS |
| `randomizable` | `boolean` | (*) missing in TS |
| `comment` | `String` | (*) missing in TS |

### BSBKnob
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `knobWidth` | `int` | present in TS |
| `minimum` | `double` | present via base |
| `maximum` | `double` | present via base |
| `value` | `double` | present via base |
| `label` | `String` | (*) missing in TS |
| `labelEnabled` | `boolean` | (*) missing in TS |
| `labelFont` | `Font` | (*) missing in TS; serialize as font-family string |
| `valueDisplayEnabled` | `boolean` | (*) missing in TS |
| `automationAllowed` | `boolean` | (*) missing in TS |
| `randomizable` | `boolean` | (*) missing in TS |
| `comment` | `String` | (*) missing in TS |

> Note: `knobHeight` in the TS model has no Java BeanInfo equivalent — the Java knob is always square (`knobWidth × knobWidth`). Remove or deprecate `knobHeight`.

### BSBLabel
| Property | Java Type | Notes |
|---|---|---|
| `x` | `int` | |
| `y` | `int` | |
| `label` | `String` | TS uses `labelText` — rename to `label` |
| `font` | `Font` | (*) missing in TS; serialize as font-family string |

### BSBLineObject
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `canvasWidth` | `int` | present via base |
| `canvasHeight` | `int` | present via base |
| `XMax` | `double` | present via base |
| `lines` | list | present via base |
| `separatorType` | enum | present via base |
| `leadingZero` | `boolean` | present via base |
| `relativeXValues` | `boolean` | present via base |
| `locked` | `boolean` | present via base |
| `comment` | `String` | (*) missing in TS |

### BSBSubChannelDropdown
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `comment` | `String` | (*) missing in TS |

### BSBTextField
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `textFieldWidth` | `int` | present in TS |
| `value` | `String` | TS uses `textFieldValue` — rename to `value` |
| `comment` | `String` | (*) missing in TS |

### BSBVSlider
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `sliderHeight` | `int` | present in TS |
| `minimum` | `double` | present via base |
| `maximum` | `double` | present via base |
| `value` | `double` | present via base |
| `resolution` | `double` | (*) missing in TS |
| `valueDisplayEnabled` | `boolean` | (*) missing in TS |
| `automationAllowed` | `boolean` | (*) missing in TS |
| `randomizable` | `boolean` | (*) missing in TS |
| `comment` | `String` | (*) missing in TS |

### BSBVSliderBank
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `numberOfSliders` | `int` | TS uses `sliderCount` — rename |
| `sliderHeight` | `int` | present in TS |
| `minimum` | `double` | present via base |
| `maximum` | `double` | present via base |
| `resolution` | `double` | (*) missing in TS |
| `gap` | `int` | (*) missing in TS |
| `valueDisplayEnabled` | `boolean` | (*) missing in TS |
| `automationAllowed` | `boolean` | (*) missing in TS |
| `randomizable` | `boolean` | (*) missing in TS |
| `comment` | `String` | (*) missing in TS |

### BSBValue
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `minimum` | `double` | present via base |
| `maximum` | `double` | present via base |
| `defaultValue` | `double` | (*) missing in TS; TS has `precision` which is not in BeanInfo — audit Java XML for presence of `precision` before removing |
| `automationAllowed` | `boolean` | (*) missing in TS |

### BSBXYController
| Property | Java Type | Notes |
|---|---|---|
| `objectName` | `String` | |
| `x` | `int` | |
| `y` | `int` | |
| `width` | `int` | present via base |
| `height` | `int` | present via base |
| `XMin` | `double` | TS uses `xMinimum` — rename to `XMin` for Java parity |
| `XMax` | `double` | TS uses `xMaximum` — rename to `XMax` |
| `YMin` | `double` | TS uses `yMinimum` — rename to `YMin` |
| `YMax` | `double` | TS uses `yMaximum` — rename to `YMax` |
| `valueDisplayEnabled` | `boolean` | (*) missing in TS |
| `automationAllowed` | `boolean` | (*) missing in TS |
| `randomizable` | `boolean` | (*) missing in TS |
| `comment` | `String` | (*) missing in TS |

---

## 2. Summary of Required TS Model Changes

### Fields to Add

| Widget | Fields to Add |
|---|---|
| `BSBHSlider` | `resolution`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` |
| `BSBVSlider` | `resolution`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` |
| `BSBKnob` | `label`, `labelEnabled`, `labelFont`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` |
| `BSBCheckBox` | `label`, `automationAllowed`, `randomizable`, `comment` |
| `BSBDropdown` | `fontSize`, `automationAllowed`, `randomizable`, `comment` |
| `BSBValue` | `defaultValue`, `automationAllowed` |
| `BSBGroup` | `groupName`, `titleEnabled`, `font`, `backgroundColor`, `borderColor`, `labelTextColor`, `comment` |
| `BSBLabel` | `font` |
| `BSBHSliderBank` | `resolution`, `gap`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` |
| `BSBVSliderBank` | `resolution`, `gap`, `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` |
| `BSBFileSelector` | `textFieldWidth`, `comment` |
| `BSBTextField` | `comment` |
| `BSBSubChannelDropdown` | `comment` |
| `BSBXYController` | `valueDisplayEnabled`, `automationAllowed`, `randomizable`, `comment` |
| `BSBLineObject` | `comment` |

### Fields to Rename

| Widget | Current TS Name | Canonical Java Name |
|---|---|---|
| `BSBLabel` | `labelText` | `label` |
| `BSBTextField` | `textFieldValue` | `value` |
| `BSBFileSelector` | `selectedPath` | `fileName` |
| `BSBHSliderBank` | `sliderCount` | `numberOfSliders` |
| `BSBVSliderBank` | `sliderCount` | `numberOfSliders` |
| `BSBXYController` | `xMinimum` | `XMin` |
| `BSBXYController` | `xMaximum` | `XMax` |
| `BSBXYController` | `yMinimum` | `YMin` |
| `BSBXYController` | `yMaximum` | `YMax` |

### Fields to Audit / Remove

| Widget | Field | Action |
|---|---|---|
| `BSBKnob` | `knobHeight` | Audit Java XML; not in BeanInfo. Remove from model if not present in any real `.blue` file. |
| `BSBValue` | `precision` | Audit Java XML; not in BeanInfo. Retain if present in real Java XML, otherwise remove. |

---

## 3. Snapshot Shape Extensions

The `BsbWidgetNodeSnapshot` union type (in `packages/blue-app/src/shared/project-editor.ts` or similar) must be extended to carry the new fields. Since widget nodes are currently transmitted as `properties: Record<string, unknown>`, the minimal change is:

1. Add new fields to each TS widget class in `@blue/data`.
2. Ensure `toSnapshot()` and `fromSnapshot()` / XML parse methods include the new fields.
3. No structural change to the snapshot union type is required if widget properties are carried as a flat `properties` bag; however, a typed per-widget snapshot is preferred for the property sheet.

---

## 4. Widget Renderer Metadata (Edit/Resize Capabilities)

```typescript
interface WidgetRenderMeta {
  canResizeWidth: boolean;
  canResizeHeight: boolean;
  minWidth?: number;
  minHeight?: number;
  editModeConditional: boolean;  // true for BSBValue only
}
```

Per-widget values:

| Widget | canResizeWidth | canResizeHeight | editModeConditional |
|---|---|---|---|
| `BSBHSlider` | true | false | false |
| `BSBVSlider` | false | true | false |
| `BSBKnob` | true | false | false |
| `BSBLineObject` | true | true | false |
| `BSBXYController` | true | true | false |
| `BSBValue` | false | false | true |
| All others | false | false | false |
