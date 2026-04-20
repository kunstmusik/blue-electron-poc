# Contract: Component System Research Output

## Purpose

This contract defines the minimum required structure for the completed research output of spec 016. It is a documentation contract, not a runtime or network interface.

## Required Sections

The research deliverable must include all of the following:

1. **Java Component And Required UI Feature Inventory**
   - Dedicated document at `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`
   - Source-traceable list of current Java workbench windows in scope
   - Required UI feature tags or notes for every listed component
   - Explicit note for any intentionally excluded non-registered surface

2. **Electron Inventory**
   - Current Electron counterparts, custom surfaces, and known gaps
   - Current ownership style for each surface or category

3. **Component Need Categories**
   - Groupings that explain which surfaces share reusable needs
   - Clear notes on which categories are workbench-owned versus general-purpose

4. **Comparison Matrix**
   - Candidate approach families evaluated against every category
   - Fit notes covering parity, state integration, theming, accessibility, ownership, and maintenance

5. **Recommendation Record**
   - Preferred approach per major category
   - Areas that should remain bespoke or Dockview-owned
   - Areas that should remain deferred

6. **Roadmap**
   - At least one immediate next spec candidate
   - At least one deferred follow-on area
   - Bounded pilot suggestion for the immediate next spec

## Required Qualities

- Every inventory item must be traceable back to a source file or current Electron implementation path.
- Every Java component in scope must map to at least one required UI feature in the dedicated inventory document.
- The recommendation must explain mixed ownership where a single universal component answer would be misleading.
- The document must clearly separate:
  - what should remain workbench-owned
  - what should move toward reusable renderer-owned primitives
  - what, if anything, should prefer native operating-system menus

## Explicit Non-Goals

- The research output does not need to include implementation tasks.
- The research output does not need to ship new runtime UI behavior.
- The research output does not need to force a single-library answer if the evidence supports a hybrid approach.
