# Feature Specification: BlueSynthBuilder Interface Parity

**Feature Branch**: `022-bsb-interface-parity`
**Created**: 2026-04-24
**Status**: Draft
**Input**: User description: "Follow Spec 021 by implementing the missing BlueSynthBuilder widgets and interface editor parity, including the richer Java Blue interface surface, preset handling, and embedded opcode-list editing."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit the BSB interface surface (Priority: P1)

As a composer editing a BlueSynthBuilder instrument, I need the Interface tab to behave like Java Blue's editor so I can inspect, select, and change widget layout and interface state without dropping back to raw XML or code-only editing.

**Why this priority**: Spec 021 closed with a BSB baseline, but the Interface tab is still mostly a placeholder. Actual widget/interface editing is the biggest remaining Orchestra parity gap.

**Independent Test**: Open a BSB-heavy project, select a BlueSynthBuilder instrument, switch to the Interface tab, enable editing, select a widget, change its layout or common properties, save, reopen, and confirm the interface changed without losing widget XML.

**Acceptance Scenarios**:

1. **Given** a BlueSynthBuilder instrument with a graphic interface is selected, **When** the Interface tab opens, **Then** it shows a scrollable interface canvas plus the editing affordances needed to inspect and modify the current widgets.
2. **Given** interface editing is enabled, **When** the user selects a widget and changes its layout or core properties, **Then** the widget state updates immediately and persists through save/reopen.
3. **Given** interface editing is disabled, **When** the user views the Interface tab, **Then** editing affordances are hidden or disabled without making the interface unreadable.

---

### User Story 2 - Edit widget properties and grid behavior (Priority: P1)

As a composer refining a BSB interface, I need a property sheet and grid controls like the Java editor so precise widget configuration does not require manual XML edits.

**Why this priority**: The Java `BSBInterfaceEditor` is more than a canvas. The property sheet and grid settings are the main tools for precise editing and are required for practical widget authoring.

**Independent Test**: Select multiple representative widget types, edit object name/value/range/label or layout properties from the Interface tab, adjust grid behavior, and confirm the interface and saved XML reflect the changes.

**Acceptance Scenarios**:

1. **Given** a widget is selected, **When** the property sheet is shown, **Then** the editor exposes the common properties needed for the ported widget type and keeps those values synchronized with the interface canvas.
2. **Given** grid settings are changed, **When** the interface is edited and the project is saved and reopened, **Then** the updated grid behavior and serialized settings persist.
3. **Given** a widget object name changes, **When** the user switches to the BSB Code tab, **Then** object-name completion reflects the new interface state without requiring a reload.

---

### User Story 3 - Use BSB presets and embedded UDO editing (Priority: P2)

As a composer working with an existing BlueSynthBuilder instrument, I need preset application and embedded opcode-list editing so the instrument's interface states and local UDOs remain editable inside the Orchestra workflow.

**Why this priority**: Java Blue's BSB editor couples interface editing with preset selection and the embedded opcode list. Spec 021 intentionally left both as placeholders.

**Independent Test**: Open a BSB instrument that already contains presets and embedded UDOs, apply a preset, edit the opcode list, save, reopen, and confirm both the preset metadata and opcode-list contents persist.

**Acceptance Scenarios**:

1. **Given** a BSB instrument contains preset data, **When** the user applies an existing preset, **Then** the interface values update to match the selected preset without breaking widget bindings.
2. **Given** the BSB UDO tab is opened, **When** the user edits the embedded opcode list, **Then** the instrument retains the updated opcode-list data through save/reopen.
3. **Given** a BSB instrument has no presets or no embedded UDOs, **When** the corresponding surfaces open, **Then** the UI shows a clear empty state rather than a broken editor.

---

### User Story 4 - Preserve unsupported BSB data safely (Priority: P2)

As a composer opening older or richer Java Blue projects, I need unsupported or partially ported BSB widgets and preset data to survive editing so the Electron port never destroys interface content it cannot fully edit yet.

**Why this priority**: BlueSynthBuilder parity is high-risk because the Java implementation contains many widget and preset paths. Safe preservation is required even where the first editing pass is incomplete.

**Independent Test**: Load a project containing unsupported or partially ported BSB structures, perform in-scope edits, save, reopen, and confirm the unsupported data still round-trips.

**Acceptance Scenarios**:

1. **Given** a BSB instrument contains a widget or preset structure the Electron port does not fully edit, **When** the user performs supported edits elsewhere, **Then** unsupported data is preserved rather than silently dropped.
2. **Given** unsupported data blocks a specific editing affordance, **When** the user reaches that area, **Then** the UI communicates the limitation without breaking the rest of the editor.

### Edge Cases

- What happens when a BSB interface has nested groups and the current selection is deleted or becomes hidden?
- What happens when a preset references object names that changed in the current editing session?
- What happens when a project contains unsupported or unknown BSB widget types mixed with supported ones?
- What happens when edit mode is toggled while the user has unsaved property-sheet changes?
- What happens when the interface is empty and the user opens Presets or UDO tabs?
- What happens when code completions or generated text depend on widgets that were renamed or removed from the Interface tab?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The slice MUST inspect Java Blue `BlueSynthBuilderEditor`, `BSBInterfaceEditor`, `BSBEditPanel`, `BSBObjectPropertySheet`, `GridSettingsEditPanel`, `PresetsPanel`, `EmbeddedOpcodeListPanel`, and the preset model classes before implementation decisions are finalized.
- **FR-002**: The work MUST build on the Spec 021 BSB baseline rather than replacing the established top-level tab layout and code-editor behavior that already shipped.
- **FR-003**: The BSB Interface tab MUST render the current graphic interface as an editable surface rather than only a placeholder/value list.
- **FR-004**: The BSB Interface tab MUST expose and persist the BSB `editEnabled` state and adjust editing affordances accordingly.
- **FR-005**: The interface editor MUST allow selecting widgets or groups and editing the common properties needed for currently ported widget types, including layout and object-name data.
- **FR-006**: The interface editor MUST support changing widget layout position and size from the Interface workflow without requiring direct XML edits.
- **FR-007**: The interface editor MUST expose grid settings needed for precise interface editing and preserve them through save/reopen.
- **FR-008**: The data/model layer MUST port and preserve BSB preset-group data required to apply existing presets in Electron without dropping preset XML.
- **FR-009**: The BSB UDO tab MUST replace the Spec 021 placeholder with an embedded opcode-list editor bound to the instrument's local opcode list.
- **FR-010**: Interface edits that affect object names or widget values MUST remain synchronized with BSB code completions and generated instrument semantics in the existing Code tab workflow.
- **FR-011**: Unsupported or partially ported BSB widgets, groups, or preset data MUST be preserved safely when users perform supported edits.
- **FR-012**: The implementation MUST include automated coverage for interface rendering/editing, property updates, preset application, embedded opcode-list persistence, completion synchronization, and unsupported-data preservation.

### Key Entities *(include if feature involves data)*

- **BlueSynthBuilder Interface**: The editable widget canvas and surrounding editing state for a BSB instrument.
- **BSB Widget**: A graphic-interface object with layout, value, object-name, and type-specific properties.
- **BSB Widget Selection**: The currently selected widget or group whose state drives the property editor.
- **Grid Settings**: The persisted alignment/snap configuration used by the interface editor.
- **Preset Group**: The hierarchical BSB preset structure that stores named interface states.
- **Embedded Opcode List**: The BSB-local UDO collection edited from the BSB `UDO` tab.
- **Unsupported BSB Data**: Widget or preset content the Electron port cannot fully edit yet but must preserve.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can open a BlueSynthBuilder instrument in the Orchestra panel and see an actual editable Interface surface instead of the Spec 021 placeholder.
- **SC-002**: A reviewer can change a supported widget's layout or common properties, save, reopen, and observe the interface edits persisted.
- **SC-003**: A reviewer can apply an existing BSB preset and observe the interface values update without breaking object-name replacement behavior.
- **SC-004**: A reviewer can edit the embedded opcode list from the BSB `UDO` tab, save, reopen, and observe the opcode list persisted.
- **SC-005**: A reviewer can rename an interface object and then confirm the BSB Code tab completion source reflects the new object name.
- **SC-006**: A reviewer can save and reopen a BSB-heavy project containing unsupported widget or preset structures without those structures being silently dropped.

## Assumptions

- Spec 021 remains the baseline for Orchestra layout, BSB code tabs, completion plumbing, and widget-value editing.
- The first parity pass in Spec 022 targets the BSB widget types already represented in `@blue/data`; unsupported widgets must be preserved even if they are not fully editable.
- Existing BSB presets must at least be viewable and applicable in this slice; deeper preset-authoring workflows may still be narrowed during task breakdown if the Java surface proves larger than expected.
- The Electron port will continue using the current renderer/main/shared snapshot-and-patch architecture rather than introducing a separate BSB-only IPC channel.