# Project Status — blue-electron

**Date**: 2026-04-18
**Branch**: `013-collapsed-sidebar-research`

## Current Active Work — Spec 013 Collapsed Sidebar Group Research

Spec `013-collapsed-sidebar-research` is now the current active work. The planning and task-generation steps are complete, and the research package now narrows the next implementation step for collapsed auxiliary groups in the future workbench shell.

## Current Recommendation

- **Preferred direction**: dockview groups plus a thin custom collapse controller
- **Fallback**: dockview-only grouped sidebars if a separate collapse controller proves unnecessary
- **Not recommended as primary host**: paneview-backed sidebars

## Why This Is The Recommendation

- The existing `blue-app` shell already uses dockview as the canonical panel/group host.
- `WindowMenu.tsx` and `workbench-store.ts` define a stable-ID reveal/focus flow that should remain intact.
- The Java screenshots show durable collapsed edge handles and one-expanded-group-per-edge behavior that dockview alone does not yet prove out as a first-class rail pattern.
- A thin app-level collapse controller keeps the custom work localized to edge handles, auxiliary-group metadata, and restore policy instead of introducing a second layout system.

## Current Shell Baseline

The current dockview shell remains intentionally simple:

- `WorkbenchShell.tsx` adds all startup editor tabs, then only the first properties panel on the right and the first output panel on the bottom.
- `workbench-store.ts` can open and focus panels by stable ID, but new panels do not yet carry collapsed-group placement rules.
- Layout persistence still stores only raw dockview JSON in local storage under `blue-workbench-layout`.

## Bounded Prototype Slice

The next implementation step should stay intentionally small:

1. **Right edge prototype**: `SoundObjectPropertiesTopComponent` expanded, `MidiInputPanelTopComponent` as a collapsed/revealable sibling handle
2. **Bottom edge prototype**: `ScoreObjectEditorTopComponent` expanded, `MixerTopComponent` as a collapsed/revealable sibling handle
3. **Persistence**: save dockview JSON plus auxiliary-group metadata for collapsed state, edge ordering, and last active panel
4. **Reveal flow**: preserve Window-menu and future programmatic reveal by stable panel ID

## Validation Targets For The Next Implementation Spec

- One auxiliary group per edge can remain expanded while sibling groups stay visible as collapsed handles
- Clicking a collapsed handle reveals the correct group and focuses its active panel
- Right-edge and bottom-edge state remain independent
- Layout restore rebuilds both dockview structure and collapsed-edge metadata

## Related Specs

- **Spec 011**: closed; dockview was selected as the workbench foundation, with rc-dock as fallback
- **Spec 012**: closed; demo2026 parity work now matches the Java `01.csd` reference byte-for-byte

## Immediate Follow-On

1. Write the implementation spec or code changes for the bounded collapsed-group prototype in `packages/blue-app/src/renderer/components/workbench`
2. Route stable-ID reveal through auxiliary-group metadata instead of raw `api.addPanel(...)` placement
3. Add supplemental persistence for collapsed-edge state alongside dockview JSON
