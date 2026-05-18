# Feature Specification: UUID And Deep Copy Safety

**Feature Branch**: `043-uuid-deepcopy-safety`  
**Created**: 2026-05-18  
**Status**: Closed  
**Input**: User description: "Create a formal spec from UUID_AND_DEEPCOPY.md so the duplicate BSB widget id P1 issue is handled through a dedicated UUID and clone-safe deep-copy feature."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Widgets Safely After Loading Existing BSB Data (Priority: P1)

As a composer editing a saved Blue Synth Builder interface, I need newly created widgets to receive identifiers that cannot collide with identifiers already loaded from the project so that edits, moves, grouping, and removal always target exactly one widget.

**Why this priority**: This directly covers the P1 issue found during review: explicit widget uniqueIds are preserved on load, and new widget generation must not reuse an existing identifier after an edited file is loaded.

**Independent Test**: Load a BSB interface that already contains an explicit widget uniqueId, add another widget, then update each widget independently and verify each operation affects only the intended widget.

**Acceptance Scenarios**:

1. **Given** a BSB interface loaded from saved data containing an explicit widget uniqueId, **When** the user adds a new widget, **Then** the new widget receives a uniqueId that is unique within that BSB interface.
2. **Given** a BSB interface loaded from legacy data where some widgets do not have explicit uniqueIds, **When** the interface is opened, **Then** each widget receives a stable uniqueId for the editing session without changing unrelated widget content.
3. **Given** two widgets in one BSB interface, **When** the user updates, moves, resizes, groups, or removes one widget by uniqueId, **Then** no sibling widget is affected by the operation.

---

### User Story 2 - Duplicate BSB And Sound Objects Without Shared Identity (Priority: P1)

As a composer duplicating instruments or score objects, I need the duplicate to preserve musical content while receiving fresh clone-sensitive identities so that editing one copy cannot accidentally mutate or target the other.

**Why this priority**: Whole-object duplication currently can preserve serialized BSB ids and automation parameter identities, which makes duplicated structures unsafe once both copies are edited.

**Independent Test**: Duplicate a BSB instrument and a Sound object containing embedded BSB interface data, compare the original and duplicate identity fields, and edit each copy independently.

**Acceptance Scenarios**:

1. **Given** a BSB instrument with widgets and automation parameters, **When** the user duplicates it, **Then** the duplicate preserves visible widget content, object names, bounds, values, and automation data while using fresh widget uniqueIds and fresh automation parameter identities.
2. **Given** a Sound object with embedded BSB interface data, **When** the user duplicates the Sound, **Then** the original and duplicate do not share clone-sensitive BSB widget uniqueIds or automation parameter identities.
3. **Given** two duplicated objects with equivalent musical content, **When** the user patches a widget or automation parameter in one duplicate, **Then** the sibling duplicate remains unchanged.

---

### User Story 3 - Preserve Existing Project Identity Across Ordinary Load And Save (Priority: P2)

As a composer reopening existing projects, I need ordinary load and save to preserve explicit identifiers already present in the file so that project data does not churn and existing automation, presets, and editor state remain attached.

**Why this priority**: Clone safety must not turn normal project loading into a migration that rewrites every identity-bearing field.

**Independent Test**: Load a project containing explicit BSB widget uniqueIds, automation parameter identities, preset identities, and dropdown item identities; save it; then verify the same explicit identifiers are still present and connected to the same content.

**Acceptance Scenarios**:

1. **Given** saved project data with explicit BSB widget uniqueIds, **When** the project is loaded and saved without user-visible duplication, **Then** those widget uniqueIds are preserved.
2. **Given** saved automation parameter identities, **When** the project is loaded and saved without user-visible duplication, **Then** those identities remain attached to the same parameters and automation curves.
3. **Given** saved preset and dropdown item identities, **When** the project is loaded or saved without user-visible duplication, **Then** those identities remain valid local lookup keys for their containing BSB data.

---

### User Story 4 - Make Deep Copy Behavior Explicit And Predictable (Priority: P2)

As a developer maintaining Blue data behavior, I need deep-copy behavior to be explicit and duplicate-safe so that identity rekeying rules are clear, testable, and not accidental side effects of persistence.

**Why this priority**: A reliable identity policy depends on making copy APIs produce independent editable duplicates with fresh identities while preserving ordinary load/save identity stability.

**Independent Test**: Exercise deep-copy flows and verify copies preserve content semantics while applying the clone-safety rekey policy.

**Acceptance Scenarios**:

1. **Given** a BSB aggregate with widgets, presets, opcode data, and automation parameters, **When** a deep copy is made, **Then** the copy preserves content semantics without relying on save-and-reload behavior.
2. **Given** a user-visible duplicate operation, **When** it creates an equivalent copy, **Then** the operation rekeys local identities before exposing the duplicate for editing.
3. **Given** future copy or clipboard flows, **When** they create user-visible duplicates, **Then** they apply the same identity policy as instrument and Sound duplication.

### Edge Cases

- What happens when saved BSB data contains a mix of explicit uniqueIds, missing uniqueIds, and legacy child `<id>` values?
- What happens when loaded data already contains duplicate widget uniqueIds from a prior bug or manually edited file?
- What happens when a duplicated BSB or Sound object contains automation curves linked to parameters whose identities are rekeyed?
- What happens when preset data references dropdown item identities during duplication?
- What happens when the platform cannot provide a native UUID facility for new id generation?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST preserve explicit BSB widget uniqueIds during ordinary project load and save when no user-visible duplication is requested.
- **FR-002**: The system MUST assign unique editing-session uniqueIds to legacy BSB widgets that load without explicit uniqueIds.
- **FR-003**: The system MUST ensure newly created BSB widget uniqueIds cannot collide with any existing widget uniqueId in the same BSB interface, including uniqueIds loaded from saved data.
- **FR-004**: The system MUST treat BSB widget uniqueIds as clone-sensitive identities that are regenerated for user-visible duplicate and paste flows.
- **FR-005**: The system MUST treat automation parameter identities as clone-sensitive identities that are regenerated for user-visible duplicate flows while preserving parameter names, ranges, values, and automation curves.
- **FR-006**: The system MUST preserve preset identities and dropdown item identities as local lookup keys during ordinary load and save, and regenerate them during user-visible duplication while rewriting dependent references.
- **FR-007**: The system MUST provide a single documented identity policy that distinguishes ordinary load/save from user-visible duplicate and paste behavior.
- **FR-008**: The system MUST keep BSB object names, positions, dimensions, values, line data, presets, opcode data, and other non-identity musical content equivalent when duplicating BSB or Sound data.
- **FR-009**: The system MUST make Sound duplication clone-safe for embedded BSB data, including widget uniqueIds and automation parameter identities.
- **FR-010**: The system MUST ensure widget-targeted operations such as update, move, resize, group, ungroup, and remove affect only the intended widget after load, duplication, and paste.
- **FR-011**: The system MUST keep automation curves attached to the corresponding duplicated parameters after clone-sensitive parameter identities are regenerated.
- **FR-012**: The system MUST avoid using persistence round trips as the definition of duplicate behavior for BSB aggregates, except at existing XML-only storage boundaries such as `Sound`.
- **FR-013**: Automated regression tests MUST cover new widget creation after loading explicit uniqueIds, legacy data without uniqueIds, duplicate BSB and Sound clone safety, automation parameter rekeying, ordinary load/save preservation, and sibling-isolation patching.
- **FR-014**: When loaded BSB data already contains duplicate widget uniqueIds, the system MUST restore editing uniqueness before the interface is exposed for editing, preserving the first occurrence where possible and rekeying later colliding occurrences.

### Key Entities *(include if feature involves data)*

- **BSB Widget Identity**: The local handle used to find, update, move, resize, group, and remove one widget inside a BSB interface.
- **Automation Parameter Identity**: The stable parameter identity used to keep automation data attached to the correct control.
- **Preset Identity**: A local preset lookup key that must continue to resolve preset settings after load, save, and duplication.
- **Dropdown Item Identity**: A local dropdown choice lookup key used by preset settings and dropdown value encoding.
- **User-Visible Duplicate**: A copy exposed as a separate editable object and therefore responsible for regenerating clone-sensitive identities.
- **Legacy BSB Data**: Saved BSB data that lacks explicit widget uniqueIds, contains legacy child `<id>` values, or contains older sequential identity values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can load BSB data with an existing explicit widget uniqueId, add a widget, and verify all widget uniqueIds are unique before and after saving.
- **SC-002**: A reviewer can load legacy BSB data without explicit widget uniqueIds and verify every editable widget receives a uniqueId without losing visible widget content.
- **SC-003**: A reviewer can duplicate a BSB instrument and confirm that clone-sensitive widget and automation parameter identities differ between original and duplicate while musical content matches.
- **SC-004**: A reviewer can duplicate a Sound object with embedded BSB data and confirm that patching one duplicate by widget uniqueId does not affect the sibling duplicate.
- **SC-005**: A reviewer can load and save project data containing explicit widget, automation, preset, and dropdown identities and confirm ordinary load/save preserves those identities.
- **SC-006**: Automated tests cover all P1 clone-safety regressions identified in the handoff note, including the duplicate widget uniqueId after edited XML reload scenario.

## Assumptions

- The first slice keeps XML as the project persistence format and focuses on copy and identity behavior rather than replacing project storage.
- BSB widget uniqueIds and automation parameter identities are clone-sensitive and must be regenerated for user-visible duplicates.
- Preset identities and dropdown item identities are local lookup keys for their containing BSB data and are preserved in this slice.
- Renderer-level BSB widget paste already rekeys snapshot widget uniqueIds, but model-level duplication of whole BSB and Sound objects still needs the shared identity policy.
- Sound now carries structured BSB state canonically in memory while continuing to load and save Java-compatible embedded BSB XML.
