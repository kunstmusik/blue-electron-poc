# Quickstart: Left Edge Parity

## Goal

Add left-edge parity for user-driven auxiliary workspace customization while keeping the current Java-aligned default layout unchanged.

## Implemented Outcome

The completed 015 slice now provides:

1. A version 5 instance-based auxiliary layout model with seeded and derived-singleton group instances.
2. User-driven left, right, and bottom edge reassignment without seeding any default left-edge tools.
3. Drag-based edge moves:
   - drag a docked auxiliary group from its header area to another supported edge
   - drag a slide-out tool from its title bar to another supported edge
4. Group-aware minimize and restore behavior:
   - minimizing a docked auxiliary edge group minimizes the whole edge group
   - restoring minimized tools on an occupied edge rejoins the existing edge group
   - restoring a minimized edge group uses its last live docked size instead of a seeded default size
5. A Radix-backed auxiliary tab context menu with `Close`, `Close Group`, `Maximize`/`Restore`, `Minimize`, and `Minimize Group`.

## Implementation Order

1. Replace the current fixed two-group auxiliary session model with the version 5 instance-based model from this plan.
2. Add a layout migration from version 4 to version 5 so existing right/bottom layouts survive the refactor cleanly.
3. Separate seeded default group definitions from persisted current group instances so saved custom left-edge placements stop snapping back to the seeded defaults.
4. Implement whole-group edge reassignment without changing stable panel IDs or losing active-tool identity.
5. Implement single-tool split-out so one tool can leave a seeded multi-tool group and become a derived singleton group on another edge.
6. Replace explicit move buttons with drag-based edge reassignment for docked groups and slide-out tools.
7. Implement merge-back so a derived singleton can rejoin its seeded sibling group when returned to the same edge.
8. Preserve existing minimize, slide-out, dock-single-tool, restore-group, maximize, and reveal semantics for left-edge groups.
9. Add a renderer-owned auxiliary tab context menu using Radix primitives.
10. Keep fresh/reset layouts seeded only from the Java-aligned right/bottom defaults and clear all custom left-edge placements during reset.
11. Expand Vitest coverage to include layout migration, left-edge reassignment, singleton split/merge, persistence, reset behavior, and docked-size restore behavior.

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

### Docked Size Restore

1. Resize a docked auxiliary group on the left, right, or bottom edge.
2. Minimize the group.
3. Restore the group from the edge rail.
4. Confirm the restored group returns at the last live docked size rather than the seed default size.

### Auxiliary Tab Context Menu

1. Right-click an auxiliary tab in a docked edge group.
2. Confirm the menu presents `Close`, `Close Group`, `Maximize`/`Restore`, `Minimize`, and `Minimize Group`.
3. Confirm the menu styling remains in-app and theme-matched rather than using an Electron-native context menu.
4. Confirm `Float`, `Float Group`, `Dock`, and `Dock Group` remain unavailable until popout-window tracking is implemented cleanly.

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
- Docked auxiliary groups restore to the last live docked size after minimize/restore.
- Auxiliary tab context menus are renderer-owned and Radix-backed for Java-parity styling and direct state integration.

## Out Of Scope

- Unlocking arbitrary drag-and-drop docking for all auxiliary groups
- Expanding left-edge moves beyond the four current prototype auxiliary panels
- Deciding to seed any Java-backed left-edge default tool
- Moving workbench layout persistence away from localStorage in this slice
- Implementing `Float` / `Float Group` / `Dock` / `Dock Group` with true separate OS-window popouts in this slice
- Choosing a broader application-wide component system direction beyond the current targeted Radix adoption for workbench context menus
