# Quickstart: Component System Research

## Goal

Produce a research package that inventories Java and Electron UI surfaces, compares component-approach families, and recommends the next bounded UI spec.

## Execution Order

1. Build the Java inventory from `TopComponent` registrations, mode assignments, startup flags, and window-manager metadata.
2. Write the source-traceable Java component and required UI feature list into `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md`.
3. Build the Electron inventory from the current panel registry, workbench shell, menus, overlays, and current custom/Dockview-owned surfaces.
4. Group both inventories into component-need categories.
5. Evaluate the concrete candidate families:
   - Dockview/custom workbench ownership
   - Radix primitives
   - shadcn/ui-style wrappers
   - Electron-native menus where applicable
6. Document the preferred ownership model for each category.
7. Name the immediate next spec and the deferred follow-on areas.

## Files To Start From

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panel-registry.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WorkbenchShell.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliaryTab.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/WindowMenu.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/styles/index.css`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/resources/blue/ui/core/WindowManager.wswmgr`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-filemanager/src/main/java`

## Validation Flow

### Inventory Validation

1. Confirm every currently registered Java workbench window is represented in the inventory.
2. Confirm every current Electron panel-registry entry is represented in the inventory.
3. Confirm gaps are recorded explicitly rather than silently omitted.
4. Confirm `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md` lists at least one required UI feature for each Java component in scope.

### Category Validation

1. Review the category list.
2. Confirm similar surfaces are grouped together.
3. Confirm workbench-owned chrome is separated from generic reusable UI categories.

### Comparison Validation

1. Confirm each category is evaluated against the concrete candidate families.
2. Confirm the evaluation addresses parity fidelity, state integration, theming, accessibility, ownership, and maintenance.
3. Confirm the menu/context-menu category explicitly addresses the Radix versus native-menu question.

### Recommendation Validation

1. Confirm the research names a preferred approach for each major category.
2. Confirm it documents areas that should remain custom or Dockview-owned.
3. Confirm it names at least one immediate next spec and at least one deferred follow-on area.

## Done Criteria

- The Java and Electron UI inventories are complete and source-traceable.
- `/Users/stevenyi/work/blue-electron/specs/016-component-system-research/java-ui-feature-inventory.md` is complete enough to act as the closure checklist for Java-side surface coverage.
- The component-need categories are clear enough that future specs can target them directly.
- The comparison matrix explicitly addresses the current Radix versus shadcn versus native-menu question.
- The recommendation names a coherent mixed or unified strategy without leaving the core decision ambiguous.
- The roadmap identifies the next bounded spec to execute.
