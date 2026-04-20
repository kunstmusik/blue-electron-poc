# Implementation Plan: Component System Research

**Branch**: `016-component-system-research` | **Date**: 2026-04-20 | **Spec**: [/Users/stevenyi/work/blue-electron/specs/016-component-system-research/spec.md](/Users/stevenyi/work/blue-electron/specs/016-component-system-research/spec.md)
**Input**: Feature specification from `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/spec.md`

## Summary

Produce a research package that inventories reusable UI surfaces in Java blue and the current Electron port, clusters those surfaces into component-need categories, compares current custom workbench ownership against Radix primitives, shadcn-style wrappers, and Electron-native menus where relevant, and recommends a bounded roadmap for future UI specs.

## Technical Context

**Language/Version**: Markdown planning documents derived from TypeScript 5.8.x renderer code and Java NetBeans sources  
**Primary Dependencies**: Java Blue `TopComponent` registrations and window-manager metadata, current React 19 / Electron 35 / Dockview 5.2.0 renderer implementation, candidate UI approaches under study: Radix primitives, shadcn/ui-style wrappers, and Electron-native menus  
**Storage**: Repository documentation only (`specs/016-component-system-research/`)  
**Testing**: Source-audit validation via `rg`, document review, and `git diff --check`  
**Target Platform**: Research for the Electron desktop renderer with the Java application as the parity baseline  
**Project Type**: Desktop application research slice  
**Performance Goals**: Reduce ambiguity enough that the next UI spec can start without another round of broad exploratory discussion  
**Constraints**: No runtime behavior changes in this slice; recommendations must stay traceable to Java reference sources and current Electron implementation boundaries; Dockview-owned workbench chrome must be treated as a distinct ownership category  
**Scale/Scope**: All currently registered Java workbench windows, current Electron panel-registry surfaces, workbench menus/context menus, dialogs/overlays, browser-style panels, and current custom workbench chrome

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Data-First, UI-Separated**: PASS. This feature is documentation and planning only; it does not move logic into or out of `blue-data`.
- **II. Backwards-Compatible Serialization**: PASS. No `.blue` serialization behavior changes are proposed in this slice.
- **III. JVM Dependencies Preserved, Not Replaced**: PASS. Java blue is the source of truth for UI surface inventory and parity expectations.
- **IV. Engine as External Process**: PASS. No playback or engine changes are involved.
- **V. Test-First for Serialization**: N/A. The slice is research-only and does not touch project serialization.

**Gate Result**: PASS. No constitution exception is needed.

## Project Structure

### Documentation (this feature)

```text
specs/016-component-system-research/
├── java-ui-feature-inventory.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── research-output.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/blue-app/
├── src/renderer/components/workbench/
│   ├── WorkbenchShell.tsx
│   ├── AuxiliaryTab.tsx
│   ├── AuxiliaryRail.tsx
│   ├── AuxiliarySlideout.tsx
│   ├── WindowMenu.tsx
│   ├── DockviewPanel.tsx
│   └── panel-registry.ts
├── src/renderer/styles/
│   └── index.css
└── package.json

/Users/stevenyi/work/nbprojects/blue/
├── blue-ui-core/src/main/java/
├── blue-ui-filemanager/src/main/java/
└── blue-ui-core/src/main/resources/blue/ui/core/WindowManager.wswmgr
```

**Structure Decision**: Keep all outputs under `specs/016-component-system-research/`. The source audit spans the current Electron renderer workbench and the Java NetBeans UI modules but does not create implementation tasks yet.

## Phase 0 Research Decisions

1. Use Java `TopComponent` registrations and window-manager metadata as the baseline inventory corpus.
   - This gives a stable, source-controlled list of current workbench windows, their logical modes, and startup intent.
2. Audit the current Electron port from both `panel-registry.ts` and the live workbench shell.
   - The registry shows declared surfaces; the shell reveals which ones are already backed by Dockview, custom chrome, Radix, or bespoke controls.
3. Group findings by surface family rather than by file alone.
   - The research should cover categories such as workbench tabs/groups, edge rails/slideouts, menus/context menus, dialogs/popovers, browser-style trees/lists/tables, forms/property sheets, console-like panels, and toolbar/transport controls.
4. Compare concrete candidate families against those surface categories.
   - The explicit candidate mapping for this slice is:
     - primitive renderer-owned components: Radix
     - styled wrapper component layer: shadcn/ui-style approach
     - native operating-system menus: Electron menu APIs
     - bespoke workbench ownership: Dockview/custom renderer code
5. Expect a hybrid recommendation rather than a single-library answer.
   - Current evidence already suggests workbench chrome and Dockview-owned interactions need to stay custom, while menus/overlays and generic controls may have different winners.

## Phase 1 Design Artifacts

- `java-ui-feature-inventory.md`: source-traceable Java component list with required UI feature tags and current Electron counterparts
- `research.md`: source-audit scope, evaluation criteria, and concrete research decisions
- `data-model.md`: research entities for UI surfaces, component-need categories, evaluations, and roadmap candidates
- `contracts/research-output.md`: required output structure for the research deliverable and comparison matrix
- `quickstart.md`: execution order and validation flow for completing the research slice

## Post-Design Constitution Check

- **I. Data-First, UI-Separated**: PASS
- **II. Backwards-Compatible Serialization**: PASS
- **III. JVM Dependencies Preserved, Not Replaced**: PASS
- **IV. Engine as External Process**: PASS
- **V. Test-First for Serialization**: N/A

**Post-Design Gate Result**: PASS.

## Complexity Tracking

No constitution exception is required. The deliberate complexity in this slice is the breadth of the audit surface, which is justified because the project now needs a component-system decision grounded in both the Java reference application and the current Electron implementation rather than local one-off choices.
