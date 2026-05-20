# Feature Specification: Meter Map Parity

**Feature Branch**: `046-meter-map-parity` *(not created; planned only per user request)*  
**Created**: 2026-05-20  
**Status**: Draft  
**Input**: User description: "Fully implement Time Signature (Meter) for parity with Java Blue: time signature ruler bar with all interactions and context menu, Edit Meter Map menu entry with modal dialog, Java Blue parity, and tests."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Time Signatures From The Ruler Bar (Priority: P1)

As a composer working in the Score panel, I need the time signature row to behave like Java Blue's meter region bar so I can read, add, edit, and delete meter changes directly from the timeline.

**Why this priority**: The visible score row is the primary meter-editing workflow. Current rendering is simplified and does not expose Java Blue's authoring interactions.

**Independent Test**: Load a project with multiple meter changes, enable the time signature row, add a meter change by double-clicking, edit it from the context menu, delete a non-first change, and verify the canonical project snapshot and saved `.blue` data update correctly.

**Acceptance Scenarios**:

1. **Given** a project has one 4/4 meter entry at measure 1, **When** the Score panel renders with the meter row visible, **Then** the row shows a 20px time signature region labeled 4/4.
2. **Given** the user double-clicks an empty location in the meter row, **When** that beat maps to a measure without an entry, **Then** a new meter change is inserted at that measure using default 4/4.
3. **Given** the user double-clicks a location whose measure already has a meter entry, **When** the row handles the event, **Then** the existing entry edit dialog opens instead of creating a duplicate.
4. **Given** the user right-clicks a meter region, **When** the context menu opens, **Then** it offers Edit Time Signature... and offers Delete Time Signature Change only for non-first entries.
5. **Given** the user changes a meter measure, signature, or deletion from the bar, **When** the project is saved and reloaded, **Then** the meter map preserves the same ordered entries.

---

### User Story 2 - Use Correct Measure-To-Beat Region Math (Priority: P1)

As a composer using changing meters, I need meter regions and ruler labels to align with actual measure boundaries so that time signatures do not drift when meters have different lengths.

**Why this priority**: Incorrect measure-to-beat math makes the row visually misleading and can break add/edit targeting.

**Independent Test**: Load a meter map with 4/4 at measure 1, 3/4 at measure 5, and 7/8 at measure 9; verify region boundaries, tooltips, and double-click measure targeting match Java Blue conversions.

**Acceptance Scenarios**:

1. **Given** a meter map contains meter changes with different measure durations, **When** the row renders, **Then** each region starts at the true absolute beat of its measure entry.
2. **Given** the user hovers a meter region, **When** the tooltip appears, **Then** it shows the entry measure number and time signature for that region.
3. **Given** the user double-clicks at an arbitrary beat, **When** the row computes the target measure, **Then** it uses the active meter map rather than a fixed beats-per-measure shortcut.
4. **Given** the primary or secondary ruler uses BBT, BBST, or BBF display, **When** meter changes are present, **Then** ruler marks remain aligned with the same meter map data displayed by the time signature row.

---

### User Story 3 - Edit The Complete Meter Map From The Project Menu (Priority: P1)

As a composer doing bulk time-signature editing, I need a Project menu entry that opens a modal table editor equivalent to Java Blue's Edit Time Signature Map action.

**Why this priority**: Bulk editing is the Java workflow for reviewing exact measure/signature values and is required by the user request.

**Independent Test**: Choose Project -> Edit Time Signature Map..., add rows, edit measure and signature values, delete rows, cancel and OK changes, and verify only OK replaces the canonical project meter map.

**Acceptance Scenarios**:

1. **Given** a project is loaded, **When** the Project menu opens, **Then** Edit Time Signature Map... is enabled and no longer calls the placeholder action.
2. **Given** no project is loaded, **When** the Project menu opens, **Then** Edit Time Signature Map... is disabled.
3. **Given** the modal opens, **When** it displays meter entries, **Then** it shows a table with Measure, Time Signature, and Delete columns plus an Add action.
4. **Given** the user edits the modal and cancels, **When** the dialog closes, **Then** the project meter map is unchanged.
5. **Given** the user edits the modal and confirms, **When** the dialog closes, **Then** the modal's copied map replaces the canonical meter map atomically and all score/ruler views update from the new snapshot.

---

### User Story 4 - Keep Meter State Canonical Across Renderer, Main, And XML (Priority: P2)

As a maintainer, I need meter edits to flow through typed project patches and existing `@blue/data` meter models without renderer-only divergence.

**Why this priority**: Meter affects time display, snapping, score object editing, and save/load. UI-only edits would corrupt timeline parity.

**Independent Test**: Run shared/main/renderer tests that mutate every supported meter-map operation and verify snapshots, patches, save/load, and ruler conversions agree.

**Acceptance Scenarios**:

1. **Given** the renderer dispatches a meter-map operation, **When** the main process applies it, **Then** the canonical `BlueData.getScore().getTimeContext().getMeterMap()` mutates through validated typed helpers.
2. **Given** invalid meter data is supplied through the UI or patch boundary, **When** validation runs, **Then** the operation is rejected or normalized consistently and the project remains valid.
3. **Given** a score ruler or time-position editor needs BBT/BBST/BBF conversion, **When** meter changes are present, **Then** conversion uses the same map data the edit surfaces display.

### Edge Cases

- First meter entry must remain at measure 1 and must not be deleted.
- Duplicate measure entries must replace or edit the existing entry, not create ambiguous duplicates.
- Measure numbers must remain positive integers.
- Time signatures must have positive numerator and denominator; modal table editing must enforce Java's power-of-two denominator rule.
- Bar single-entry edit parity should be checked against Java, where the inline dialog accepts positive denominator values; if implementation standardizes on power-of-two denominators, document the intentional stricter validation.
- Meter rows must compute start beats from accumulated measure durations, not `(measure - 1) * current numBeats`.
- Modal edits must operate on a copy and must not leak partial changes while the dialog is open.
- Projects with old or malformed meter-map XML must still load through existing `@blue/data` fallback behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST use Java Blue's `MeterRegionBar`, `MeterMapEditorPanel`, `EditMeterMapAction`, `MeterMap`, `MeasureMeterPair`, and `Meter` as the parity source before coding.
- **FR-002**: The shared project snapshot MUST include ordered meter entries with measure, numerator, denominator, and enough derived start-beat data for accurate renderer row boundaries.
- **FR-003**: The shared patch surface MUST support validated meter operations: add entry, update entry, remove entry, and replace map.
- **FR-004**: The Score panel MUST render a Java-style 20px time signature region bar from canonical meter-map data.
- **FR-005**: The meter region bar MUST draw one region per meter entry, show signature labels when the region is wide enough, and visually distinguish hover state.
- **FR-006**: The meter region bar MUST show tooltips with measure number and time signature for the hovered region.
- **FR-007**: Double-clicking the meter region bar MUST add a new meter entry at the clicked beat's measure or open edit for an existing entry at that measure.
- **FR-008**: Newly added row entries from double-click MUST default to 4/4 and must use the measure number computed from the current meter map.
- **FR-009**: Right-clicking a meter region MUST open a context menu with Edit Time Signature... and Delete Time Signature Change, with Delete unavailable for the first entry.
- **FR-010**: The point edit dialog opened from the region bar MUST allow editing measure and time signature, keep the first entry fixed at measure 1, bound measure edits between neighboring entries, and commit only valid updates.
- **FR-011**: Region drawing, hit testing, hover, and double-click targeting MUST use true meter-map accumulated measure start beats.
- **FR-012**: Project -> Edit Time Signature Map... MUST be implemented as a real menu command enabled only when a project is loaded.
- **FR-013**: The Edit Time Signature Map modal MUST edit a copy of the map in a table with Measure, Time Signature, Delete, Add, OK, and Cancel behaviors matching Java Blue's table workflow.
- **FR-014**: The Edit Time Signature Map modal Add action MUST add a row at last measure + 8 with default 4/4; Delete MUST be disabled when only one row remains.
- **FR-015**: OK in the Edit Time Signature Map modal MUST atomically replace the canonical meter map and Cancel MUST leave it unchanged.
- **FR-016**: All meter changes MUST update renderer state through existing project snapshot refresh/optimistic patch patterns and MUST be persisted by existing `.blue` XML save/load.
- **FR-017**: Automated tests MUST cover shared patch validation, snapshot creation, save/load of ordered meter entries, region-bar interactions, correct boundary math, Project menu wiring, and modal OK/Cancel behavior.

### Key Entities *(include if feature involves data)*

- **Meter Map**: Canonical score time context object containing ordered measure-to-meter entries.
- **Meter Entry**: A measure number and a time signature numerator/denominator.
- **Meter Region Bar**: Timeline row that displays one horizontal region per meter entry and supports direct edits.
- **Meter Map Modal Draft**: A copied meter-map table state used by the modal until OK replaces the canonical map.
- **Meter Patch**: Typed project-document mutation that updates canonical `BlueData` meter state from renderer or menu commands.
- **Derived Measure Boundary**: Renderer-safe start beat calculated from accumulated meter-map entries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can perform the Java Blue time-signature row workflow: add an entry by double-click, edit an entry, and delete a non-first entry.
- **SC-002**: A reviewer can load mixed 4/4, 3/4, and 7/8 entries and verify row boundaries/tooltips align with Java-compatible measure start beats.
- **SC-003**: A reviewer can use Project -> Edit Time Signature Map... to add, edit, delete, cancel, and OK a complete map, with cancel leaving the project unchanged.
- **SC-004**: Automated tests cover every functional requirement that mutates meter-map state and fail if meter edits stop reaching the canonical project document.
- **SC-005**: Existing BBT/BBST/BBF ruler and time-position conversion tests continue to pass after meter UI and patch work.

## Assumptions

- The menu label should match Java Blue as "Edit Time Signature Map..." even though this spec is named Meter Map Parity.
- The renderer may use React/Radix-native equivalents of Java Swing menus and dialogs, but user-visible behavior and state transitions should match Java Blue.
- Undo/redo is not required unless an app-wide undo stack already exists for project-document patches; this spec requires atomic patching and safe cancel behavior.
- Tempo editing from Spec 045 is intentionally separate; this spec may reuse shared row/menu/dialog patterns created by Spec 045 but should not require changing tempo behavior.
