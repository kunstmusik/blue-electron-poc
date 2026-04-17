# Project Status — blue-electron

**Date**: 2026-04-17
**Branch**: `011-window-system-research`

## Spec 011 — Closed

Feature `011-window-system-research` is complete under the Spec Kit flow. The spec, plan, research, data model, quickstart, tasks, and checklist are all present under `specs/011-window-system-research/`.

**Recommendation**: dockview v5.x (preferred), rc-dock v3.3.2 (fallback).

## Committed Baseline

This branch also includes an initial dockview-based workbench baseline in `blue-app`. It is an exploratory shell for the future window-system work, not the end of the window-system effort.

### Included In This Commit

| Component | File | Purpose |
|---|---|---|
| Panel registry | `src/renderer/components/workbench/panel-registry.ts` | All 21 Blue panels with stable IDs matching Java `preferredID`, grouped by mode (editor/properties/output) |
| Placeholder panels | `src/renderer/components/workbench/panels/PlaceholderPanel.tsx` | Stub renderer showing panel name + mode |
| Dockview wrapper | `src/renderer/components/workbench/DockviewPanel.tsx` | Maps dockview panels to registry descriptors |
| Workbench shell | `src/renderer/components/workbench/WorkbenchShell.tsx` | 3-area dockview layout (editors center, properties right, output below), layout save/restore to localStorage |
| Window menu | `src/renderer/components/workbench/WindowMenu.tsx` | Dropdown listing all 21 panels by mode, opens/focuses on click |
| Workbench store | `src/renderer/stores/workbench-store.ts` | `openPanel`, `focusPanel`, `closePanel`, `saveLayout`, `loadLayout` — equivalent to `findTopComponent` |
| Theme overrides | `src/renderer/styles/index.css` | Dockview CSS variables matching Blue dark theme |
| MenuBar update | `src/renderer/components/menu-bar/MenuBar.tsx` | Shows Window menu when project is loaded |
| App routing update | `src/renderer/App.tsx` | Uses WorkbenchShell instead of old ProjectView |

### Verification

- `pnpm test` passes
- `pnpm build` passes

### Spec 011 Artifacts

| File | Purpose |
|---|---|
| `specs/011-window-system-research/research.md` | Capability baseline, 6-candidate comparison matrix, recommendation |
| `specs/011-window-system-research/quickstart.md` | Prototype handoff notes |
| `specs/011-window-system-research/spec.md` | Feature specification |
| `specs/011-window-system-research/tasks.md` | All 21 tasks checked off |

## Immediate Next Specs

1. **Spec 012**: investigate why `~/work/blue/demo2026/01.blue` is not compiling
2. **Spec 013**: continue the collapsed sidebar group research and decide whether dockview edge groups, paneview, or a custom collapse wrapper should back the properties/output sidebars

## Follow-On After 012/013

1. Harden the workbench shell behavior around placement, ordering, persistence, and lifecycle
2. Resolve collapsed sidebar behavior for the properties/output groups
3. Replace `PlaceholderPanel` with real editor implementations
4. Remove `ProjectView` once the workbench shell is confirmed as the permanent project surface

## Notes

- Layout persistence currently uses localStorage keyed by `blue-workbench-layout`; moving that to Electron `userData` remains follow-on work.
- `AGENTS.md` and `CLAUDE.md` are still untracked auto-generated docs and are not part of the staged commit.
