# Data Model: BlueSynthBuilder Interface Parity

## Existing Entities To Extend

### BlueSynthBuilder

**Role**: Canonical project instrument in the main process and the authoritative owner of BSB code, interface, preset, and opcode-list data.

**Existing responsibilities from Spec 021**:

- Preserve/load/save baseline `graphicInterface` XML
- Preserve/load/save instrument text, always-on text, global orchestra, global score, and local opcode list
- Expose widget replacement values for code generation

**New/expanded responsibilities for Spec 022**:

- Preserve and expose editable interface structure beyond flat widget summaries
- Preserve and expose preset-group data required to apply existing presets
- Persist interface edit-enabled state and grid settings
- Support widget/property/layout mutation helpers used by the renderer patch flow

### BSBGraphicInterface

**Role**: Hierarchical container for the BSB widget tree and editor-facing interface settings.

**Fields**:

- `rootGroup: BSBGroup`
- `editEnabled: boolean`
- `gridSettings: GridSettings` or equivalent serializable structure

**Validation**:

- Widget hierarchy must remain stable across save/reopen.
- Grid settings must round-trip without dropping unknown compatible fields.
- Toggling `editEnabled` must not destroy interface state.

### BSBWidget

**Role**: Base class for the editable BSB graphic-interface objects.

**Common fields**:

- `id` or stable selection key
- `type`
- `objectName`
- `x`
- `y`
- `width`
- `height`
- `value`
- `minimum`
- `maximum`
- `parameterName`
- type-specific presentation fields

**Validation**:

- `objectName` uniqueness should follow Java expectations where required for replacement semantics.
- Widgets that cannot be fully edited must still preserve their XML state.

### BSBGroup

**Role**: Composite widget containing child widgets and groups.

**Fields**:

- common widget fields
- `children: BSBWidget[]`

**Validation**:

- Nested group ordering must round-trip unchanged.
- Group selection and editing must not flatten the hierarchy.

## New Entities To Port or Formalize

### PresetGroup

**Role**: Hierarchical tree of BSB presets used by the Interface editor.

**Fields**:

- `presetGroupName: string`
- `subGroups: PresetGroup[]`
- `presets: Preset[]`
- `currentPresetUniqueId?: string`
- `currentPresetModified: boolean`

**Validation**:

- Current preset metadata must persist through save/reopen.
- Unknown preset structures should not be dropped if authoring support is incomplete.

### Preset

**Role**: Named BSB interface state that can apply widget values to the current interface.

**Fields**:

- `uniqueId: string`
- `presetName: string`
- widget value mappings or equivalent Java-compatible payload

**Validation**:

- Applying a preset must update matching widgets without corrupting unrelated ones.
- Missing or renamed widget references must degrade safely.

### GridSettings

**Role**: Persisted interface-editor alignment and snapping preferences.

**Likely fields**:

- grid enabled/disabled
- snap enabled/disabled
- width/height or spacing controls

**Validation**:

- Grid settings changes must persist through save/reopen.

## Snapshot Entities

### BlueSynthBuilderInstrumentSnapshot

**Role**: Renderer-facing serializable BSB snapshot used by the Orchestra editor.

**Existing fields from Spec 021**:

- `instrumentText`
- `alwaysOnInstrumentText`
- `globalOrc`
- `globalSco`
- `objectNames`
- `widgets` (flat summaries)

**New fields proposed for Spec 022**:

- `editEnabled: boolean`
- `gridSettings: GridSettingsSnapshot`
- `widgetTree: BsbWidgetNodeSnapshot`
- `selectedWidgetId?: string`
- `presetGroup?: PresetGroupSnapshot`
- `unsupportedInterfaceWarnings?: string[]`

### BsbWidgetNodeSnapshot

**Role**: Recursive snapshot of a widget or widget group for canvas rendering and selection.

**Fields**:

- `id: string`
- `type: string`
- `objectName: string`
- `x: number`
- `y: number`
- `width: number`
- `height: number`
- `value?: number`
- `minimum?: number`
- `maximum?: number`
- `parameterName?: string`
- `children?: BsbWidgetNodeSnapshot[]`
- `editable: boolean`
- `preservedOnly?: boolean`

### PresetGroupSnapshot

**Role**: Renderer-facing serializable preset hierarchy.

**Fields**:

- `name: string`
- `subGroups: PresetGroupSnapshot[]`
- `presets: PresetSnapshot[]`
- `currentPresetUniqueId?: string`
- `currentPresetModified: boolean`

### PresetSnapshot

**Fields**:

- `uniqueId: string`
- `name: string`
- value summary or widget-value mapping metadata needed for UI selection/apply

## Patch Entities

### BsbInterfacePatch

**Role**: Renderer-to-main intent for BSB interface mutations.

**Possible variants**:

- `setEditEnabled`
- `selectWidget`
- `updateWidgetProperties`
- `moveWidget`
- `resizeWidget`
- `updateGridSettings`
- `applyPreset`
- `updateEmbeddedOpcodeList`

### InstrumentPatch Extension

**Role**: Existing orchestra instrument patch flow extended for BSB-specific edits.

**Proposal**:

- Keep Spec 021 `updateInstrument` as the transport entry point
- Extend `InstrumentPatch` with a structured `bsbInterface` branch or equivalent union-style payload for complex BSB edits

**Validation**:

- Patch application must be stable under optimistic local updates and out-of-order async replies, reusing the protections added in Spec 021.

## State Transitions

1. Project load creates a richer `BlueSynthBuilderInstrumentSnapshot` including interface tree, grid settings, presets, and opcode-list state.
2. Opening the Interface tab renders the widget tree and property/grid surfaces from the snapshot.
3. Selecting or editing a widget dispatches a BSB patch through the existing orchestra update flow.
4. The main process applies the mutation to canonical `BlueData` and returns a refreshed snapshot.
5. The Code tab completion source refreshes from the updated interface object names.
6. Saving serializes canonical `BlueData` back to `.blue`.

## Serialization Rules

- Preset-group and preset data require load/save round-trip coverage before UI parity is considered complete.
- Unsupported widget or preset structures must be preserved rather than dropped.
- Embedded opcode-list edits must round-trip through existing BSB/local UDO XML.
- Interface edit-enabled and grid settings state must round-trip through save/reopen.