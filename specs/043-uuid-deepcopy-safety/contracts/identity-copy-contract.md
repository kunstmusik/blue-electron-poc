# Contract: BSB Identity And Copy Policy

## Scope

This contract defines how identity-bearing BSB and automation fields behave across ordinary load/save, user-visible duplication, and paste. It is the implementation contract for `@blue/data` and the reference contract for renderer integrations.

## Identity Families

### BSB Widget UniqueId

- Used as the local edit handle for widget update, move, resize, group, ungroup, and remove operations.
- Must be non-empty before a widget is exposed for editing.
- Must be unique within one BSB graphic interface.
- Is clone-sensitive and must be regenerated for user-visible duplicate/paste operations.
- Is serialized as a `uniqueId` attribute; legacy child `<id>` values are accepted on load and migrated on save.

### Automation Parameter UniqueId

- Used as the identity for automation parameter XML and parameter data.
- Must be preserved during ordinary load/save.
- Is clone-sensitive and must be regenerated for user-visible duplicate operations.
- Rekeying must preserve name, label, range, resolution, enabled state, fixed value, curve, and points.

### Preset UniqueId

- Used as a local preset lookup key.
- Must be preserved during ordinary load/save.
- Must be regenerated during user-visible duplicate/paste operations.
- References to preset ids, such as the current preset id on a group, must be rewritten when ids are regenerated.

### Dropdown Item UniqueId

- Used as a local dropdown lookup key and by preset values such as `id:<uniqueId>`.
- Must be preserved during ordinary load/save.
- Must be regenerated during user-visible duplicate/paste operations.
- Preset values such as `id:<uniqueId>` must be rewritten when dropdown item ids are regenerated.

## Operation Contracts

### Ordinary Load

Given saved BSB XML, loading must:

1. Preserve explicit unique BSB widget uniqueIds.
2. Assign new uniqueIds to widgets with missing uniqueIds.
3. Repair duplicate widget uniqueIds by preserving the first occurrence and assigning new uniqueIds to later colliding widgets.
4. Preserve automation parameter uniqueIds when present.
5. Preserve preset and dropdown item uniqueIds.
6. Preserve non-identity musical content.

### Ordinary Save

Given a loaded or edited project, saving must:

1. Write each widget uniqueId currently assigned to the BSB widget as a `uniqueId` attribute.
2. Write each automation parameter uniqueId currently assigned to the parameter.
3. Preserve preset and dropdown item uniqueIds.
4. Avoid rewriting identities solely because a save occurred.

### New Widget Creation

Given an existing BSB interface, adding a widget must:

1. Generate a UUID-style widget uniqueId through the shared `@blue/data` identity helper.
2. Check the full widget tree for collisions before exposing the widget.
3. Retry or regenerate if a collision is detected.
4. Avoid module-level counters that reset independently from loaded project state.

### User-Visible Duplicate

Given a BSB instrument, Sound object with embedded BSB data, or copy-buffer paste that exposes a separate editable object, duplication must:

1. Produce independent arrays, maps, widgets, parameters, presets, opcode list entries, and group children.
2. Rekey every BSB widget uniqueId in the duplicate.
3. Rekey every automation parameter uniqueId in the duplicate.
4. Rekey every preset uniqueId in the duplicate and rewrite current-preset references.
5. Rekey every dropdown item uniqueId in the duplicate and rewrite preset `id:<uniqueId>` values.
6. Preserve objectName, bounds, values, line data, automation curves, presets, opcode data, and instrument text.
7. Avoid save-to-XML and load-from-XML as the copy algorithm for BSB aggregate substructures; `Sound` owns structured BSB state and uses XML only at persistence/API adapter boundaries.

### Widget-Targeted Mutation

Given a widget uniqueId after load, create, duplicate, or paste, widget-targeted mutation must:

1. Resolve exactly one widget.
2. Mutate only that widget and its intended descendants when the operation is group-scoped.
3. Leave sibling duplicates untouched.

## Required Regression Evidence

- Loading explicit uniqueIds and creating a new widget produces non-colliding uniqueIds.
- Loading legacy missing uniqueIds assigns uniqueIds without data loss.
- Loading duplicate uniqueIds repairs collisions before editing.
- Saving after ordinary load preserves explicit uniqueIds and writes widget identity as `uniqueId`.
- Duplicating `BlueSynthBuilder` rekeys widget uniqueIds and automation parameter uniqueIds.
- Duplicating `Sound` with embedded BSB XML rekeys widget uniqueIds and automation parameter uniqueIds.
- Patching one duplicate by widget uniqueId cannot affect a sibling duplicate.
- Preset and dropdown item uniqueIds survive ordinary load/save.
- Preset and dropdown item uniqueIds are regenerated during duplication while dependent references remain valid.
