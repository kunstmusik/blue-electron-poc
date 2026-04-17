# Quickstart: UI Window System Research

## Goal

Feature `011-window-system-research` is now **complete**. The research produced a decision-ready recommendation, and this branch now also carries an initial dockview prototype baseline in `blue-app`.

## Decision Summary

**Preferred framework**: dockview v5.x (MIT, React-native, actively maintained)
**Fallback**: rc-dock v3.3.2

See `research.md` Parts 4-5 for the full recommendation and prototype scope.

## Immediate Next Specs

Before broader follow-on work on the window system, the next two specs should be:

1. **Spec 012**: investigate why `~/work/blue/demo2026/01.blue` is not compiling
2. **Spec 013**: continue the collapsed sidebar group research and decide whether dockview edge groups, paneview, or custom collapse behavior should back the properties/output sidebars

## Follow-On Workbench Work

### What to Build

Use the current dockview prototype as the baseline for the broader workbench implementation once Specs 012 and 013 are complete.

### Prototype Scope

1. **Three-area workbench**: editor center, properties sidebar (right), output bottom
2. **Tab management**: Score, Orchestra, Project Properties as editor tabs
3. **Programmatic panel control**: Open/focus panel by stable ID (mirrors `findTopComponent`)
4. **Layout persistence**: Serialize to JSON, restore on restart
5. **Panel lifecycle**: Setup/teardown hooks (mirrors `componentOpened`/`componentClosed`)
6. **Window menu**: List all panels, open/reveal on click

### Out of Scope

- Actual editor implementations (use placeholder components)
- Blue-specific data integration
- Floating/popout windows
- Custom theming

### Key References

- dockview docs: https://dockview.dev
- dockview GitHub: https://github.com/mathuo/dockview
- Java Blue TopComponent inventory: see `research.md` Part 1
- Capability baseline: see `research.md` Part 2

### Architecture Notes

- Register each Blue panel type with dockview using a stable string ID matching the Java `preferredID` convention
- Use dockview's `api.addPanel()` / `panel.api.focus()` for programmatic open/focus
- Use `api.toJSON()` / `api.fromJSON()` for layout persistence
- Use `onDidAddPanel` / `onDidRemovePanel` for lifecycle hooks
- Wrap the dockview layout in an Electron `BrowserWindow` with a Window menu built from the panel registry

## Done Criteria for This Research Feature

- [x] Capability inventory with mandatory/preferred/deferrable classification
- [x] Six-candidate comparison matrix against shared criteria
- [x] Preferred direction (dockview) and fallback (rc-dock) with reasoning
- [x] Bounded prototype scope with validation questions
- [x] STATUS.md updated as implementation handoff

## Current Baseline

- Research package complete under `specs/011-window-system-research/`
- Initial dockview workbench shell committed in `packages/blue-app`
- Immediate next numbered work is Spec 012, then Spec 013, before broader editor follow-on work
