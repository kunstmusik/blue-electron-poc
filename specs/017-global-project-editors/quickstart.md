# Quickstart: Global And Project Editors

## Goal

Replace the current placeholders for Global Orchestra, Global Score, and Project Properties with basic working editor-area panels backed by the current project document.

## Execution Order

1. Extend the shared `ProjectProperties` data model for any built-in Java fields needed by the bounded Project Properties surface.
2. Add or update `@blue/data` round-trip tests for the new `ProjectProperties` XML fields.
3. Extend the Electron main/preload bridge with a narrow project-editor snapshot and patch API.
4. Expand the renderer project store so it can hydrate and edit:
   - `globalOrc`
   - `globalSco`
   - built-in `projectProperties` fields
5. Replace the placeholder routing in `DockviewPanel.tsx` with real panel components for:
   - `GlobalOrchestraTopComponent`
   - `GlobalScoreTopComponent`
   - `ProjectPropertiesTopComponent`
6. Keep Monaco and grammar-aware tooling out of this slice even if the basic text panels are visually plain.

## Files To Start From

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/global-orc-sco.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/project-properties.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/hooks/use-ipc-listeners.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/PlaceholderPanel.tsx`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/globals/GlobalOrchestraTopComponent.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/globals/GlobalScoreTopComponent.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/ProjectPropertiesTopComponent.java`

## Validation Flow

### Global Orchestra

1. Open a `.blue` file with existing global orchestra text.
2. Focus `GlobalOrchestraTopComponent`.
3. Confirm the panel shows the current project text instead of a placeholder.
4. Edit the text.
5. Save the project.
6. Reopen the file and confirm the updated text persists.

### Global Score

1. Open a `.blue` file with existing global score text.
2. Focus `GlobalScoreTopComponent`.
3. Confirm the panel shows the current project text instead of a placeholder.
4. Edit the text.
5. Save and reopen the file.
6. Confirm the updated score text persists.

### Project Properties

1. Open a `.blue` file.
2. Focus `ProjectPropertiesTopComponent`.
3. Confirm the panel shows tabbed built-in project settings instead of a placeholder.
4. Edit supported fields across the built-in tabs.
5. Save and reopen the file.
6. Confirm the edited values persist.

### Empty State

1. Launch the app with no project loaded.
2. Open the three target panels.
3. Confirm all three surfaces show non-editable empty states rather than stale project content.

## Done Criteria

- `GlobalOrchestraTopComponent` is a real text editor surface backed by the current project.
- `GlobalScoreTopComponent` is a real text editor surface backed by the current project.
- `ProjectPropertiesTopComponent` is a real built-in tabbed settings surface for the bounded fields chosen in this slice.
- Save and reopen preserves edits for all supported fields.
- Any `@blue/data` schema changes are covered by round-trip tests.
- Monaco and tree-sitter work remains untouched and deferred to the next spec.

## Validation Notes

- `pnpm --filter @blue/data test`: PASS
- `pnpm --filter @blue/app test`: PASS
- `pnpm --filter @blue/app build`: PASS
- Renderer panel coverage is split between `app.test.ts` for store and flow coverage and `project-editor-panels.test.ts` for mocked panel rendering.
- Final panel polish removed redundant in-panel headers and normalized restored Dockview tab titles back to the Java-aligned human labels from the panel registry.
- The next spec remains `018-csound-editor-tooling`, which will handle Monaco integration and tree-sitter-backed Csound language support.
