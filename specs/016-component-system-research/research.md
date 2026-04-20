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

## Recommended Research Boundaries

The research deliverable should explicitly answer:

1. Which current Java surfaces exist and how they cluster into reusable categories.
2. Which current Electron surfaces are already good enough and should remain custom or Dockview-owned.
3. Which categories are best served by a primitive component approach.
4. Which categories, if any, justify a styled wrapper approach.
5. Which categories, if any, should prefer native operating-system menus.
6. Which next spec should land first once the recommendation is complete.

## Deferred Beyond This Slice

- Implementing new runtime UI behavior
- Enabling OS-window popouts for auxiliary groups
- Converting existing menus or overlays to a new component system
- Broad restyling work not required to answer the component-system question
