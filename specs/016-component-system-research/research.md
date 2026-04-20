# Research Notes: Component System Research

## Scope

Planning-phase research baseline for feature `016-component-system-research`. This slice does not change runtime behavior. It prepares a traceable decision package for the next UI-oriented specs by inventorying current Java and Electron surfaces and defining how candidate component approaches should be evaluated.

## Inputs

- Spec 016 feature definition in `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/spec.md`
- Current Electron workbench implementation under:
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`
  - `/Users/stevenyi/work/blue-electron/packages/blue-app/package.json`
- Java Blue window registrations and window-manager metadata under:
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/resources/blue/ui/core/WindowManager.wswmgr`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-ui-filemanager/src/main/java`
  - `/Users/stevenyi/work/nbprojects/blue/blue-clojure/src/main/java`

## Current Baseline

The Electron port now has enough UI surface area that component decisions can no longer be treated as isolated one-offs:

- The workbench shell already mixes Dockview-owned tabs/groups, custom auxiliary rails and slide-outs, bespoke styling, and a targeted Radix context menu.
- The Java application exposes a larger surface than the current bounded parity slices: editor windows, property windows, output windows, browser-style panels, console-style panels, and multiple menu/action entry points.
- Recent parity work proved that some surfaces are structurally different:
  - workbench group chrome is tightly coupled to Dockview
  - auxiliary rails and slide-outs are app-owned custom surfaces
  - context menus and overlays are more likely to be reusable across features

That makes the open question a component-system and ownership question, not merely a “pick a popular library” question.

## Java Source Signals

The current Java audit already shows a stable workbench inventory centered on NetBeans `TopComponent` registrations:

- `editor` windows include `ScoreTopComponent`, `OrchestraTopComponent`, `GlobalOrchestraTopComponent`, `GlobalScoreTopComponent`, `TablesTopComponent`, `UserDefinedOpcodeTopComponent`, `ProjectPropertiesTopComponent`, `BlueLiveTopComponent`, and `ScratchPadTopComponent`
- `properties` windows include `SoundObjectPropertiesTopComponent`, `SoundObjectLibraryTopComponent`, `MarkersTopComponent`, `AudioFilePlayerTopComponent`, and `MidiInputPanelTopComponent`
- `output` windows include `ScoreObjectEditorTopComponent`, `MixerTopComponent`, `VirtualKeyboardTopComponent`, `JavaScriptConsoleTopComponent`, `JythonConsoleTopComponent`, `ClojureConsoleTopComponent`, and `BlueFileManagerTopComponent`
- Commented-out or unregistered surfaces such as `MidiProjectSettingsTopComponent` should be noted explicitly but kept out of the baseline completeness count

The current `WindowManager.wswmgr` confirms a joined NetBeans window system with logical modes and editor-area constraints but does not itself answer reusable component strategy questions.

## Required Research Deliverable

The concrete exit artifact for the inventory portion of this slice is:

- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`

That document should be treated as the source-traceable checklist for closure of the research slice. It must list the Java components in scope, the Electron counterpart or gap for each one, and the required UI features implied by each surface.

## Decision 1: Use source registrations as the inventory baseline

**Decision**: The research inventory should start from Java `TopComponent` registrations plus `WindowManager` metadata, then map those to current Electron surfaces.

**Rationale**:

- This keeps the audit tied to source-controlled truth rather than screenshots or memory.
- It provides a complete starting list even for surfaces not yet implemented in Electron.
- It makes parity gaps explicit.

**Alternatives considered**:

- Start from the current Electron panel registry only: rejected because it would miss Java-only surfaces that still affect the roadmap.
- Start from screenshots or manual walkthroughs: rejected because it would be incomplete and harder to validate.

## Decision 2: Organize the research by surface family

**Decision**: The research should group findings into reusable surface families rather than only cataloging individual windows.

**Rationale**:

- A component-system decision needs to know what kinds of interactions repeat, not just how many windows exist.
- Different windows may share the same component need: for example property sheets, browser panels, or console-like panes.
- This is the only useful way to compare candidate approaches across the product.

**Alternatives considered**:

- Treat every `TopComponent` as a unique case: rejected because it would not produce reusable guidance.

## Decision 3: Evaluate four ownership/implementation families

**Decision**: Compare four concrete families against the identified surface categories:

1. Dockview/custom workbench ownership
2. Radix primitives
3. shadcn/ui-style wrapped components
4. Electron-native menus where operating-system ownership is relevant

**Rationale**:

- These are the actual candidates currently under discussion in the repo.
- The current codebase already mixes custom/Dockview work with a new Radix usage.
- Electron-native menus are a separate question because they optimize for operating-system feel instead of Java parity.

**Alternatives considered**:

- Compare only two libraries: rejected because that would ignore the current custom workbench reality and the native-menu question.

## Decision 4: Use evaluation criteria that reflect parity and ownership, not just popularity

**Decision**: The comparison matrix should score each category against these criteria:

- Java parity fidelity
- renderer-state integration
- keyboard/accessibility support
- theming/styling control
- compatibility with Dockview/workbench ownership boundaries
- operating-system integration when relevant
- maintenance cost and design-system lock-in

**Rationale**:

- Popularity alone does not answer the project’s actual constraints.
- The workbench shell has different needs than app-level menus or generic dialogs.

**Alternatives considered**:

- Rank candidates by popularity or installation convenience: rejected because it would not answer the product-specific UX question.

## Decision 5: Expect a hybrid recommendation

**Decision**: The research should assume that the final recommendation may differ by surface category.

**Rationale**:

- The current workbench already demonstrates that some surfaces are inseparable from Dockview/custom code.
- Generic overlays and menus may have a different best fit than workbench tabs, rails, or slide-outs.
- Forcing a single-library answer would likely produce a misleading recommendation.

**Alternatives considered**:

- Require one universal UI approach for the whole app: rejected because it does not match the current architecture or the Java parity requirements.

## Audit Baseline

- Java components in scope: `21`
- Electron panel-registry entries in scope: `21`
- Explicit exclusions: `MidiProjectSettingsTopComponent` is commented out and intentionally excluded from the completeness count
- Closure artifact: `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`

## Inventory Summary

### Java Surface Groups

- `editor` mode: `ScoreTopComponent`, `OrchestraTopComponent`, `GlobalOrchestraTopComponent`, `GlobalScoreTopComponent`, `TablesTopComponent`, `UserDefinedOpcodeTopComponent`, `ProjectPropertiesTopComponent`, `BlueLiveTopComponent`, `ScratchPadTopComponent`
- `properties` mode: `SoundObjectPropertiesTopComponent`, `SoundObjectLibraryTopComponent`, `MarkersTopComponent`, `AudioFilePlayerTopComponent`, `MidiInputPanelTopComponent`
- `output` mode: `ScoreObjectEditorTopComponent`, `MixerTopComponent`, `VirtualKeyboardTopComponent`, `JavaScriptConsoleTopComponent`, `JythonConsoleTopComponent`, `ClojureConsoleTopComponent`, `BlueFileManagerTopComponent`

### Electron Ownership Baseline

- Dockview-owned: the core editor area tabs and groups
- Custom workbench-owned: auxiliary rails, slide-outs, move controls, restore actions, and window-system state in `WorkbenchShell.tsx`
- Renderer-owned reusable primitive candidate: menus and overlays in `AuxiliaryTab.tsx` and `WindowMenu.tsx`
- Native-system-owned: the Electron app shell or future OS-window shell only, not the workbench tab/context-menu layer

## Component Need Categories

| Category | Representative Java Surfaces | Shared Required UI Features | Current Ownership | Parity Status |
| --- | --- | --- | --- | --- |
| Workbench editor tabs | Score, Orchestra, Global Orchestra, Global Score, Tables, UDOs, Project Properties, Blue Live, Scratch Pad | `editor-tabs`, `startup-editor`, `window-menu-entry` | Dockview/custom | Strong; already aligned with the main joined editor area |
| Property and inspector surfaces | Sound Object Properties, MIDI Input, Markers, Audio File Player | `property-sheet`, `auxiliary-dock-group`, `collapse-slideout`, `maximize-restore`, `floating-popout` | Custom workbench-owned content with renderer primitives for controls | Partial; chrome and lifecycle now work, but content is still bespoke |
| Browser and library surfaces | Sound Object Library, File Manager | `browser-tree-list`, `auxiliary-dock-group`, `collapse-slideout`, `drag-reposition` | Custom workbench-owned content | Partial; needs category-specific component guidance |
| Console and REPL surfaces | JavaScript Console, Jython Console, Clojure Console | `console-repl`, `auxiliary-dock-group`, `collapse-slideout`, `window-menu-entry` | Custom workbench-owned content | Partial; state/lifecycle fit is good, editor affordances remain custom |
| Live-control surfaces | Blue Live, Mixer, Virtual Keyboard | `keyboard-live-control`, `auxiliary-dock-group`, `collapse-slideout`, `maximize-restore` | Custom workbench-owned content | Partial; likely to remain bespoke for the foreseeable future |
| Auxiliary dock and slideout lifecycle | Properties and output groups plus all derived singleton tools | `auxiliary-dock-group`, `collapse-slideout`, `maximize-restore`, `floating-popout`, `drag-reposition` | Custom workbench-owned with Dockview backing | Strong for the current parity slice |
| Menus and command surfaces | Auxiliary tab context menu, Window menu, reveal actions | `window-menu-entry` and related command affordances | Renderer-owned primitive candidate | Strong for Radix; weak for Electron-native menus in the workbench |

## Comparison Matrix

| Category | Dockview/custom workbench | Radix primitives | shadcn-style wrappers | Electron-native menus | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Workbench editor tabs | Best fit for layout, tab state, drag behavior, and parity | Not a fit | Not a fit | Not a fit | Keep Dockview/custom |
| Property and inspector surfaces | Best as the container and lifecycle host | Good for controls, popovers, and small overlays | Acceptable later if control repetition grows | Poor fit | Mixed: custom content + Radix primitives |
| Browser and library surfaces | Best as the host for tree/list content | Good for supporting overlays and command menus | Acceptable later | Poor fit | Mixed: custom content + selective primitives |
| Console and REPL surfaces | Best as the host for scrollback/input behavior | Good for menus and lightweight overlays | Acceptable later | Poor fit | Keep custom content; use primitives selectively |
| Live-control surfaces | Best as the host for transport/audio controls | Good for supporting controls and overlays | Acceptable later | Poor fit | Keep custom content; use primitives selectively |
| Auxiliary dock and slideout lifecycle | Required for current parity behavior | Not sufficient on its own | Not sufficient on its own | Poor fit | Keep custom/Dockview-owned |
| Menus and command surfaces | Poor fit for renderer menu semantics | Best fit for renderer-owned menus | Acceptable as a wrapper layer over Radix later | Good only for app shell / OS-level actions | Use Radix in renderer; keep Electron-native for app shell only |

## Recommendation Record

- Keep Dockview/custom ownership for the workbench editor area, auxiliary edge lifecycle, float/maximize/restore behavior, and drag-reposition logic.
- Use Radix primitives for renderer-owned menus, context menus, popovers, and other small overlay affordances that need to stay state-aware and theme-consistent.
- Defer shadcn-style wrappers until the component inventory proves that repeated primitive combinations are worth standardizing into a wrapper layer.
- Keep Electron-native menus for the app shell and future OS-window shell actions only; do not move workbench context menus to native menus.
- Treat property sheets, browser/library panes, console/REPL panes, and live-control panels as custom content surfaces that can still consume shared primitives internally.

## Roadmap

### Immediate Next Spec

- `017-component-primitive-pilot`
- Goal: take the highest-frequency reusable controls from the inventory and pilot them as a small Radix-backed primitive set before deciding whether shadcn wrappers add real value
- Bounded pilot surface: workbench context menus, a representative popover/select/dialog set, and a simple inspector field row

### Deferred Follow-On Areas

- OS-window popouts for auxiliary groups
- Electron-native menu treatment for the workbench shell, if a future parity review shows a clear benefit
- Broader shadcn adoption across the app before the control inventory is stable
- Non-workbench restyling work that does not change the component-system decision

## Risks And Assumptions

- The Java inventory is source-traceable, but some surfaces are still better understood as feature families than as one-to-one widget clones.
- A hybrid recommendation is intentional; forcing one universal ownership model would hide the current architecture’s real boundaries.
- The next spec should validate the primitive choice on a bounded pilot rather than trying to standardize the entire app in one pass.
