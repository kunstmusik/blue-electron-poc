# Project Status — blue-electron

**Date**: 2026-04-20
**Branch**: `016-component-system-research`

## Current Active Work — Spec 016 Component System Research

Spec `016-component-system-research` is now the active research and planning slice for future UI/component-system work in `blue-app`.

- Goal: inventory Java blue UI surfaces and current Electron counterparts, group them into reusable component-need categories, compare Dockview/custom workbench ownership against Radix primitives, shadcn-style wrappers, and Electron-native menus where relevant, and recommend bounded next UI specs
- Constraint: this slice is documentation-only and must stay traceable to current Java registrations and current Electron implementation boundaries
- Planning status: complete
- Task status: generated; `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/tasks.md` contains 22 research tasks
- Implementation status: not started; this slice should not land runtime behavior changes

## Spec 016 Planning Result

The 016 planning package is complete:

- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/spec.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/plan.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/research.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/data-model.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/quickstart.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/contracts/research-output.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/checklists/requirements.md`
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/tasks.md`

Key outcome of the 016 planning slice:

- use Java `TopComponent` registrations and window-manager metadata as the baseline inventory corpus
- require a dedicated Java inventory deliverable at `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md` that maps every registered Java component in scope to required UI features
- audit the current Electron port from both `panel-registry.ts` and the live workbench shell
- group findings by surface family rather than by individual file or window alone
- compare four concrete approach families: Dockview/custom workbench ownership, Radix primitives, shadcn-style wrappers, and Electron-native menus
- expect a hybrid recommendation rather than a single-library answer

### Primary Research Inputs

- Java reference roots:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-filemanager`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-editor`
- Java window-manager metadata:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/resources/blue/ui/core/WindowManager.wswmgr`
- Electron workbench roots:
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/package.json`

### Suggested Next Step

- Run `/speckit.tasks` if task generation is wanted for the research execution itself
- Otherwise continue directly with the source-audit and comparison work described in `quickstart.md`

## Spec 015 Close-Out

Spec `015-left-edge-parity` is complete as the current auxiliary left-edge parity slice for `blue-app`.

## Spec 014 Close-Out

Spec `014-window-system-parity` is complete as the current bounded prototype slice for auxiliary window-system parity in `blue-app`.

## Spec 013 Close-Out

Spec `013-collapsed-sidebar-research` is complete as a bounded prototype and research slice.

- The 013 runtime prototype proved stable panel IDs, auxiliary-edge metadata, and a simplified edge-rail shell in `blue-app`.
- That slice intentionally did **not** claim full NetBeans RCP parity.
- Its main recommendation stands: keep dockview as the canonical panel/group host and localize custom behavior around auxiliary-group presentation state.

## Spec 014 Implemented Slice

The implemented 014 slice now provides the bounded prototype behavior for the four target panels:

- Auxiliary groups can be `docked`, `minimized`, `slideout`, or `maximized`
- Minimizing a group leaves visible ordered edge tabs on the owning edge
- Clicking a minimized tab toggles one edge-attached, resizable slide-out tool window per edge
- Docking from a slide-out docks only the selected tool, while the rail restore action docks the whole minimized group
- Maximizing a docked auxiliary group presents it with top tabs like the main editor area
- Restore returns the selected tool or group to its home edge without duplicating stable panel IDs
- Layout save/restore and Window-menu reveal must honor the existing presentation state

## What Landed

- **Canonical runtime host**: dockview remains the live host for docked and maximized auxiliary groups
- **App-owned layer**: minimized edge tabs, edge-attached slide-outs, home-edge restore metadata, stable-ID reveal routing, and parity session state
- **Prototype scope**:
  - right / `properties`: `SoundObjectPropertiesTopComponent`, `MidiInputPanelTopComponent`
  - bottom / `output`: `ScoreObjectEditorTopComponent`, `MixerTopComponent`
- **Parity-support scope**:
  - left / right / bottom edges are supported by the shell and state model
  - no left-edge Java-backed prototype tool has been assigned in this slice yet
- **Primary implementation files**:
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryHeaderActions.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`

## Validation

- `pnpm --filter @blue/app test`: PASS
- `pnpm --filter @blue/app build`: PASS
- In-app verification confirmed the current right and bottom prototype flows are working well enough to close the slice.
- No full Java-side manual parity checklist has been completed yet, so broader UX confirmation is still follow-on.

## Spec 015 Implementation Summary

The 015 left-edge parity slice is now implemented:

- **v5 instance-based model**: The auxiliary layout has been migrated from the fixed version 4 two-group model to a version 5 instance-based model with seeded and derived-singleton group instances
- **Layout migration**: Version 2, 3, and 4 stored layouts are automatically upgraded to version 5 on load
- **Whole-group moves**: Users can move any auxiliary group to the left, right, or bottom edge via header actions
- **Single-tool splits**: Moving one tool out of a multi-tool seeded group creates a derived singleton instance on the target edge
- **Merge-back**: Derived singletons can merge back into their seeded sibling group, preserving seed definition panel order
- **Reset layout**: The Window menu now exposes a "Reset Default Layout" action that discards derived singletons and re-seeds the default right/bottom layout
- **Zero left-edge defaults**: Fresh and reset layouts seed zero left-edge tools
- **Edge independence**: Left, right, and bottom edge state is fully independent
- **Drag-to-edge moves**: Docked auxiliary groups move by dragging their header area, and slide-out tools move by dragging the slide-out title bar to left, right, or bottom edge drop zones
- **Group-aware edge behavior**: Restoring minimized tools on an occupied edge rejoins the existing edge group; minimizing a docked edge group minimizes the full edge group
- **Docked-size restore**: Minimizing and restoring a docked edge group now restores the last live docked size instead of the seeded default size
- **Auxiliary tab context menu**: Auxiliary tabs now use a Radix-based context menu with `Close`, `Close Group`, `Maximize`/`Restore`, `Minimize`, and `Minimize Group`
- **Menu decision**: Electron-native context menus were deferred; the current choice is to keep workbench-internal menus renderer-owned for Java-parity styling and direct access to Dockview/Zustand state

### Primary Implementation Files

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts` — v5 data model, migration, normalization, move/merge/reset operations
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts` — store actions for group-instance IDs, move-to-edge, merge-back, reset-layout
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx` — renders rails, slideouts, and move controls from instance-based state
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryHeaderActions.tsx` — move-to-edge and minimize controls in docked group headers
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx` — move-to-edge controls in slide-out chrome
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx` — updated to use groupInstanceId for restore actions
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryTab.tsx` — Radix-backed auxiliary tab context menu
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx` — reset-layout action and presentation badges

### Validation

- `pnpm --filter @blue/app test`: PASS (49 tests, 0 failures, 2 skipped)
- `pnpm --filter @blue/app build`: PASS
- In-app verification of left-edge moves, singleton splits, merge-back, reset, and the new auxiliary tab context menu is recommended as follow-on

### Remaining Follow-On

- Manual in-app parity review against the Java reference for left-edge behavior
- Broader UX polish for left-edge slide-out sizing and tab ordering
- Decide whether `Float` / `Float Group` should use Dockview popout groups in separate OS windows and add the required auxiliary-state tracking before enabling those menu items
- Add a follow-on spec to inventory reusable component needs from the Java application and compare a Radix-first approach against adopting shadcn wrappers more broadly, including whether workbench context menus should remain Radix-based or move to Electron-native menus

## Related Specs

- **Spec 011**: closed; dockview was selected as the workbench foundation, with rc-dock as fallback
- **Spec 012**: closed; demo2026 parity work now matches the Java `01.csd` reference byte-for-byte
- **Spec 013**: closed; bounded auxiliary-rail prototype and implementation recommendation completed
