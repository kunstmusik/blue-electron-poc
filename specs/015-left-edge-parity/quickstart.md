# Quickstart: Left Edge Parity

## Goal

Add left-edge parity for user-driven auxiliary workspace customization while keeping the current Java-aligned default layout unchanged.

## Implementation Order

1. Replace the current fixed two-group auxiliary session model with the version 5 instance-based model from this plan.
2. Add a layout migration from version 4 to version 5 so existing right/bottom layouts survive the refactor cleanly.
3. Separate seeded default group definitions from persisted current group instances so saved custom left-edge placements stop snapping back to the seeded defaults.
4. Add explicit move-to-left, move-to-right, and move-to-bottom actions in auxiliary header and slide-out chrome.
5. Implement whole-group edge reassignment without changing stable panel IDs or losing active-tool identity.
6. Implement single-tool split-out so one tool can leave a seeded multi-tool group and become a derived singleton group on another edge.
7. Implement merge-back so a derived singleton can rejoin its seeded sibling group when returned to the same edge.
8. Preserve existing minimize, slide-out, dock-single-tool, restore-group, maximize, and reveal semantics for left-edge groups.
9. Keep fresh/reset layouts seeded only from the Java-aligned right/bottom defaults and clear all custom left-edge placements during reset.
10. Expand Vitest coverage to include layout migration, left-edge reassignment, singleton split/merge, persistence, and reset behavior.

## Files To Start From

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryHeaderActions.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-store.test.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`

## Validation Flows

### Default Layout

1. Start from a fresh layout or reset to the default layout.
2. Confirm no auxiliary tool is seeded on the left edge.
3. Confirm the prototype groups still seed on the right and bottom edges as before.

### Move Whole Group To Left Edge

1. Move the `properties-main` group to the left edge using the new move action.
2. Confirm both `SoundObjectPropertiesTopComponent` and `MidiInputPanelTopComponent` now dock on the left edge.
3. Minimize the group and confirm left-edge tabs appear.
4. Open a left-edge tab and confirm the slide-out opens on the left with the selected tool active.
5. Restore the group from the rail and confirm it returns to a docked left-edge group.

### Move Single Tool To Left Edge

1. Starting from the default layout, move `MidiInputPanelTopComponent` to the left edge while leaving `SoundObjectPropertiesTopComponent` on the right.
2. Confirm the moved tool becomes its own left-edge singleton group.
3. Minimize that singleton group and confirm the left-edge rail shows only the moved tool.
4. Dock the tool from its slide-out and confirm the right-edge sibling group remains intact.

### Merge Back

1. Move a singleton left-edge tool back to the right edge of its seeded sibling group.
2. Confirm the singleton disappears as a standalone group and the tool rejoins the seeded group in seeded definition order.

### Persistence And Reset

1. Save a layout with one whole group on the left and one single tool split to the left.
2. Reload the workbench and confirm those custom placements restore.
3. Reset the layout to defaults.
4. Confirm all left-edge custom placements disappear and the seeded right/bottom layout returns.

### Reveal Behavior

1. Use `WindowMenu` to reveal each prototype auxiliary panel while it is docked on the left edge.
2. Repeat while it is minimized and in a left-edge slide-out.
3. Confirm reveal focuses or transitions the existing presentation and never creates a duplicate instance.

## Done Criteria For The Slice

- Fresh and reset layouts seed zero left-edge auxiliary tools.
- A user can move a whole prototype auxiliary group to the left edge and use normal minimize, slide-out, restore, and maximize flows there.
- A user can move one prototype tool to the left edge while leaving its sibling group on the original edge.
- Returning a singleton tool to its compatible seeded edge merges it back into the seeded group without changing stable panel IDs.
- Saved layouts restore custom left-edge placements, and reset removes them.
- Left, right, and bottom edges continue to behave independently.

## Out Of Scope

- Unlocking arbitrary drag-and-drop docking for all auxiliary groups
- Expanding left-edge moves beyond the four current prototype auxiliary panels
- Deciding to seed any Java-backed left-edge default tool
- Moving workbench layout persistence away from localStorage in this slice
