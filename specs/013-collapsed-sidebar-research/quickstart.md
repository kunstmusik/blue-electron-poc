# Quickstart: Collapsed Sidebar Group Research

## Goal

Use the current dockview workbench baseline to prototype Java-style collapsed auxiliary groups without splitting panel identity or persistence away from dockview.

## Current Baseline

- `specs/011-window-system-research` already selected dockview as the workbench foundation.
- `packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx` currently opens one right-side panel and one bottom panel, but it does not model collapsed side rails or grouped auxiliary behavior.
- `packages/blue-app/src/renderer/stores/workbench-store.ts` and `WindowMenu.tsx` already provide stable-ID open/focus behavior that the prototype should preserve.

## Recommended Prototype Order

1. Keep dockview as the canonical host for all panels and groups.
2. Introduce auxiliary-group metadata above raw panel registration so the app knows which dockview panels belong to the right or bottom collapsed-group system.
3. Build a thin edge controller that can render collapsed handles, track the active group per edge, and reveal the associated dockview group on demand.
4. Prototype the right edge first using `SoundObjectPropertiesTopComponent` and `MidiInputPanelTopComponent`, matching the two Java screenshot states.
5. Apply the same abstraction to one bottom-edge pair such as `ScoreObjectEditorTopComponent` and `MixerTopComponent`.
6. Persist `api.toJSON()` alongside supplemental collapsed-group metadata keyed by auxiliary-group ID and edge.
7. Verify that Window-menu actions and future programmatic reveal calls still work through stable panel IDs.

## Proof Points For The Prototype

- `WorkbenchShell.tsx` no longer hard-codes a single right panel and a single bottom panel as the only auxiliary baseline.
- `workbench-store.ts` can route reveal requests through auxiliary-group metadata instead of blindly adding panels with default placement.
- The same edge-controller abstraction can drive both the right-edge properties rail and the bottom-edge output rail.
- Restoring the layout reconstructs both dockview groups and collapsed-handle state.

## Files To Start From

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panel-registry.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`

## Validation Checklist

- One auxiliary group can remain expanded while another is represented as a collapsed handle on the same edge.
- Clicking a collapsed handle reveals the correct dockview-backed group and focuses its active panel.
- Programmatic reveal by stable panel ID still works after the collapsed-group layer is added.
- Layout restore brings back both the dockview layout and the collapsed-group edge state.
- The same abstraction works for both right-edge and bottom-edge auxiliary groups.
- The fallback path remains viable: if the edge controller proves unnecessary, the design can collapse back to dockview-only grouped sidebars without changing panel IDs.

## Out Of Scope For The First Prototype

- Real panel implementations beyond placeholders
- Drag-to-reorder or drag-to-float behavior for collapsed handles
- Multi-window or popout behavior
- Replacing the existing dockview shell with paneview or another second layout system

## Decision Guardrail

Do not switch the prototype to `Paneview` unless the dockview-backed prototype fails for a concrete reason tied to the Java behavior baseline. The default path for the next session is dockview groups plus a thin custom collapse controller.

## First Files To Modify In The Implementation Spec

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panel-registry.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`
