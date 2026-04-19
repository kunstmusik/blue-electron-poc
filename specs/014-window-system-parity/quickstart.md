# Quickstart: Window System Parity

## Goal

Implement NetBeans-style parity for the prototype auxiliary groups without abandoning dockview as the canonical workbench runtime.

## Implementation Order

1. Replace the simplified spec 013 auxiliary metadata with the explicit presentation-state model from this plan.
2. Define durable auxiliary group definitions for the prototype `properties` and `output` groups using stable panel IDs.
3. Rework the edge rail so minimized state renders ordered visible tabs rather than merely selecting a docked sibling panel.
4. Wire minimized-tab activation to open one shell-owned, edge-attached slide-out per edge with remembered, validated size.
5. Support slide-out hide, toggle, and dock-single-tool behavior without restoring the whole minimized group.
6. Wire maximize and restore so the same auxiliary group can enter dockview maximized mode and render with top-tab presentation while maximized.
7. Persist dockview JSON plus the minimized/home-edge and slide-out metadata needed to rebuild the parity model after reload.
8. Route `WindowMenu` and other stable-ID reveal calls through the new state machine so minimized, slide-out, maximized, and docked groups all focus correctly without duplication.

## Files To Start From

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`

## Validation Flows

### Right Edge / Properties

1. Dock `SoundObjectPropertiesTopComponent` and `MidiInputPanelTopComponent` as one auxiliary group on the right edge.
2. Minimize the group and confirm ordered visible edge tabs remain.
3. Click the `MidiInputPanelTopComponent` minimized tab and confirm an edge-attached, resizable slide-out opens with that panel active and no top tab strip.
4. Dock the active slide-out tool and confirm only that tool returns to the right-edge docked group.
5. Maximize the right-edge group and confirm it presents as a top-tab group.
6. Restore from maximized and confirm the right-edge docked presentation returns intact.

### Bottom Edge / Output

1. Dock `ScoreObjectEditorTopComponent` and `MixerTopComponent` as one auxiliary group on the bottom edge.
2. Repeat minimize, slide-out reopen, maximize, and restore flows.
3. Confirm bottom-edge transitions do not corrupt right-edge state.

### Reveal And Persistence

1. Trigger reveal from `WindowMenu` for each prototype panel while it is docked.
2. Trigger reveal again while it is minimized, in a slide-out, and maximized.
3. Confirm reveal focuses or transitions the existing presentation rather than creating duplicates.
4. Save and reload the workbench with one group minimized and the other in a slide-out or maximized.
5. Confirm active tab, presentation state, and slide-out sizing are restored correctly.

## Done Criteria For The Slice

- Minimized groups remain visible as edge tabs on their owning edge.
- Clicking a minimized tab opens the correct edge-attached slide-out and clicking it again hides the slide-out.
- Docking from a slide-out docks only the selected tool, while restore-all docks the minimized group.
- Maximized auxiliary groups present with top tabs similar to the main editor area.
- Restore returns each group to its remembered edge and active panel.
- Stable-ID reveal works from every presentation state without duplicate instances.
- Persisted layouts restore valid docked, minimized, slide-out, and maximized state for the prototype groups.

## Out Of Scope

- Extending the state model to every `properties` or `output` group in the application
- Cross-window popout parity beyond in-window slide-outs and docked groups
- Drag reorder for minimized tabs
- Long-term migration of layout persistence away from localStorage

## Current Implementation Result

The bounded 014 prototype is now implemented in the renderer workbench shell:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts` now owns the group-first session model for `docked`, `minimized`, `slideout`, and `maximized` presentations.
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts` routes stable-ID reveal, minimize, maximize, and restore through that session model.
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryRail.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx`, `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`, and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx` expose the minimized-tab, slide-out, maximize, restore, and reveal interactions.
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-auxiliary.test.ts` and `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/tests/workbench-store.test.ts` validate layout-envelope parsing, legacy upgrade, minimized-tab derivation, slide-out sizing, docking semantics, and non-mutating layout persistence.

## Validation Result

- `pnpm --filter @blue/app test`: PASS
- `pnpm --filter @blue/app build`: PASS
- The known non-blocking warnings remain:
  - Vite chunk-size warning for the renderer bundle
  - Node `MODULE_TYPELESS_PACKAGE_JSON` warning for `postcss.config.js`

## Remaining Follow-On

- Manual in-app parity review against the Java window flows is still needed for final UX confirmation.
- The implementation remains intentionally limited to the prototype `properties` and `output` groups from spec 014.
- Left-edge support exists in the shell and state model, but no Java-backed left-edge prototype tool is assigned yet.
