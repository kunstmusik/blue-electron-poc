# Research: Meter Map Parity

**Feature**: 046-meter-map-parity  
**Date**: 2026-05-20  
**Scope**: Java Blue time-signature ruler bar, Edit Time Signature Map modal, canonical meter-map patches, tests.

## Java Blue Parity Findings

### Ruler Bar

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/meter/MeterRegionBar.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/time/MeterMap.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/time/MeasureMeterPair.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/time/Meter.java`

Findings:

- The Java meter row is a 20px score header bar that draws one horizontal region per meter entry.
- Region start positions come from meter-map conversion, not from multiplying measure number by a fixed meter length.
- Region labels show the active time signature, and hover state identifies the current region.
- Tooltip text includes the measure number and time signature.
- Double-clicking the bar edits the existing entry for the clicked measure or inserts a new default 4/4 entry at that measure.
- Right-clicking opens a context menu with `Edit Time Signature...` and, for non-first entries, `Delete Time Signature Change`.
- The first entry is structural: it remains at measure 1 and cannot be deleted.

### Inline Meter Edit Dialog

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/meter/MeterRegionBar.java`

Findings:

- Inline edits allow changing the measure and signature for a single entry.
- The first entry's measure is fixed.
- Editable measure bounds are constrained between neighboring meter entries.
- Java's inline edit parser accepts a positive numerator and denominator. The modal table applies stricter power-of-two denominator validation.

Decision:

- The TypeScript implementation should prefer one shared validation path with a power-of-two denominator unless Java-inline compatibility is explicitly preserved. If stricter validation is chosen, document it in implementation notes and tests.

### Bulk Meter Map Modal

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/time/MeterMapEditorPanel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/EditMeterMapAction.java`

Findings:

- Java exposes the Project menu action as `Edit Time Signature Map...`.
- The modal edits a copied meter map until OK.
- The table has Measure, Time Signature, and Delete columns.
- Add appends a default 4/4 entry at last measure + 8.
- Delete is disabled when only one row remains.
- OK replaces the canonical meter map; Cancel leaves it unchanged.

## TypeScript Current-State Findings

Source reviewed:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MeterRegionBar.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/meter-map.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoRegionBar.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoMapEditorDialog.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/TempoPointDialog.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/tempo-map-utils.ts`

Findings:

- `MeterRegionBar.tsx` already exists but uses simplified region math. It computes beats from the entry's own meter rather than accumulated prior meter durations.
- `ColumnHeader.tsx` mounts the meter row but does not provide Java parity editing workflows.
- `ScorePanel.tsx` has row visibility controls and now provides a useful Spec 045 template for tempo modal state, `blue-edit-tempo-map` event handling, and patch dispatch.
- `application-menu.ts` contains a placeholder `Edit Time Signature Map...` entry.
- `main.ts`, `shared/workbench-menu.ts`, and `renderer/stores/workbench-store.ts` now have concrete `edit-tempo-map` patterns to mirror for `edit-meter-map`.
- `project-editor.ts` has meter snapshot data but does not yet expose complete typed meter-map patch operations. It now has concrete `TempoMapPatch`, `applyTempoMapPatch`, and renderer optimistic merge patterns to adapt.
- `@blue/data` already contains the core meter-map model and conversion utilities that should remain canonical.
- `TempoRegionBar`, `TempoPointDialog`, `TempoMapEditorDialog`, and `tempo-map-utils` are now available as completed Spec 045 references for meter row/menu/dialog implementation style.

## Decisions

### Decision 1: Extend Existing Meter Region Bar Instead Of Replacing The Header System

**Decision**: Keep the existing score header architecture and upgrade `MeterRegionBar.tsx` plus supporting utilities.

**Rationale**: The existing `ColumnHeader` and `ScorePanel` layout already host score ruler rows. A local upgrade reduces layout risk and lets tests focus on meter behavior.

**Alternatives Considered**:

- Rebuild the complete score header: rejected because it would mix unrelated score timeline work into the meter feature.

### Decision 2: Use `@blue/data` MeterMap As The Canonical Conversion Source

**Decision**: Use existing `MeterMap` behavior for measure-to-beat and beat-to-measure semantics, and expose derived start beats in the shared snapshot for renderer hit testing.

**Rationale**: Java parity depends on accumulated measure duration. Renderer-only shortcuts have already drifted from correct behavior.

**Alternatives Considered**:

- Duplicate all conversion logic in renderer components: rejected because it risks divergent semantics.
- Keep current fixed-measure math: rejected because it fails mixed-meter projects.

### Decision 3: Add Typed Project Document Patches For Meter Operations

**Decision**: Add typed patch variants for add, update, remove, and replace-map operations.

**Rationale**: Direct renderer-local mutations would bypass canonical project state and save/load behavior. A typed patch surface matches recent score and transport editor patterns.

**Alternatives Considered**:

- Send full snapshots for every edit: rejected because it makes small row operations harder to validate and merge optimistically.

### Decision 4: Implement Native Menu Command Through Existing Menu Listener Path

**Decision**: Replace the placeholder Project menu item with an enabled command that dispatches to the renderer and opens a modal dialog.

**Rationale**: This follows the existing Electron menu integration pattern and preserves Project menu ownership in the main process.

**Alternatives Considered**:

- Render the menu action only inside the Score panel: rejected because the user explicitly requested the Project menu entry and Java parity.

### Decision 5: Reuse Completed Spec 045 Infrastructure Patterns

**Decision**: Implement meter parity on the new `046-meter-map-parity` branch and mirror Spec 045's completed transport patch, optimistic merge, native menu command, renderer event, row context menu, and modal dialog patterns where appropriate.

**Rationale**: Spec 045 solved the same interaction classes for tempo. Reusing those seams keeps meter implementation consistent and reduces risk, while meter-map conversion and validation remain domain-specific.

## Risks And Follow-Ups

- Spec 045 introduced reusable implementation patterns, but not generic shared components. Spec 046 should copy/adapt patterns deliberately rather than entangling meter behavior with tempo state.
- If the final implementation chooses Java-inline-compatible denominator parsing for the small edit dialog and stricter modal validation for the table, tests must make that split explicit.
- Correct BBT/BBST/BBF ruler conversion may require touching existing time display utilities outside the meter row component.
