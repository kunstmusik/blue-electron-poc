# Data Model: UUID And Deep Copy Safety

## Entity: BsbWidgetIdentity

- **Purpose**: Local editing handle for one BSB widget or group inside one BSB graphic interface.
- **Fields**:
  - `uniqueId`: non-empty string once the widget is available for editing; represented by the model field currently named `id`
  - `objectName`: user-facing replacement name, not identity
  - parent/child position in the BSB tree
- **Relationships**:
  - Belongs to one `BsbGraphicInterfaceState`
  - May be nested under a `BsbGroup`
  - May correspond to an automation parameter through objectName/parameterName conventions
- **Validation**:
  - Every editable widget in one BSB interface has a unique uniqueId.
  - Ordinary load/save preserves explicit uniqueIds.
  - Missing uniqueIds and duplicate loaded uniqueIds are repaired before editing.
  - User-visible duplication rekeys all widget uniqueIds.

## Entity: BsbGraphicInterfaceState

- **Purpose**: Root BSB widget tree plus grid/edit settings used by `BlueSynthBuilder`.
- **Fields**:
  - root group
  - child widget tree
  - grid settings and edit-enabled state
- **Relationships**:
  - Owned by one `BlueSynthBuilderIdentityBundle`
  - Contains many `BsbWidgetIdentity` entries
- **Validation**:
  - Traversal covers all nested groups and slider-bank child sliders.
  - New widget creation checks the full tree for collisions.
  - Load normalization is deterministic for a given tree shape except for newly minted UUID values.

## Entity: AutomationParameterIdentity

- **Purpose**: Stable automation parameter identity used to attach automation data to the correct control.
- **Fields**:
  - `uniqueId`
  - `name`
  - label, range, resolution, fixed value
  - automation enabled flag and line points
- **Relationships**:
  - Belongs to one `BlueSynthBuilderIdentityBundle`
  - Matches BSB controls by name/parameter behavior
- **Validation**:
  - Ordinary load/save preserves explicit uniqueIds.
  - User-visible duplication rekeys uniqueIds while preserving names, ranges, values, and line points.
  - Automation curves remain attached to the duplicated parameter after rekeying.

## Entity: PresetLookupIdentity

- **Purpose**: Local lookup key for a preset group/preset entry.
- **Fields**:
  - preset uniqueId
  - preset name
  - setting map keyed by objectName
- **Relationships**:
  - Belongs to one preset group tree
  - May reference dropdown item uniqueIds through setting values
- **Validation**:
  - Preserved during ordinary load/save.
  - Regenerated during user-visible duplication.
  - Current-preset references are rewritten when preset uniqueIds are regenerated.
  - Setting values continue to resolve against duplicated widget objectNames and dropdown item uniqueIds.

## Entity: DropdownItemLookupIdentity

- **Purpose**: Local lookup key for dropdown choices and preset value encoding.
- **Fields**:
  - dropdown item uniqueId
  - display name
  - stored value
- **Relationships**:
  - Belongs to one dropdown widget
  - May be referenced by preset settings using `id:<uniqueId>` values
- **Validation**:
  - Preserved during ordinary load/save.
  - Regenerated during user-visible duplication.
  - Preset setting values such as `id:<uniqueId>` are rewritten when dropdown item uniqueIds are regenerated.

## Entity: ProgrammaticBsbDuplicate

- **Purpose**: In-memory duplicate of BSB content that does not rely on XML round trips and does not preserve local identities.
- **Fields**:
  - copied graphic interface
  - copied opcode list
  - copied preset group
  - copied automation parameter list
  - copied instrument text/global text fields
- **Relationships**:
  - Used by user-visible duplicate operations
- **Validation**:
  - Does not share mutable child arrays, maps, widgets, parameters, or presets with the source.
  - Regenerates local identities before the duplicate is exposed for editing.
  - Preserves non-identity musical content.

## Entity: SoundEmbeddedBsbState

- **Purpose**: Structured embedded BSB data owned by a `Sound` object and persisted as Java-compatible BSB XML.
- **Fields**:
  - `BlueSynthBuilder` model
  - BSB instrument XML emitted at save/API adapter boundaries
  - legacy text fallback migrated into structured BSB instrument text
- **Relationships**:
  - Owned by one `Sound`
  - Uses the same `BlueSynthBuilderIdentityBundle` policy when parsed
- **Validation**:
  - Empty or legacy plain-text Sound data still migrates through the existing fallback behavior.
  - User-visible Sound duplication produces fresh BSB widget uniqueIds, automation parameter uniqueIds, preset uniqueIds, and dropdown item uniqueIds.
  - Ordinary Sound load/save preserves explicit embedded BSB identities.
