# Research: Score Editor Management and Navigation

## Decision: Prioritize root-ruler render start or end interaction before marker authoring

**Rationale**: The TypeScript port already persists `renderStartTime` and `renderEndTime` in canonical project data and already exposes those values in the toolbar, but the score shell still has no ruler interaction or visual selection state. Java Blue uses the score `TimeBar` for both click-to-set render start and drag-to-select render ranges, so this is the cleanest first slice and the correct foundation for later marker work on the same ruler surface.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/TimeBar.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/menu-bar/ToolbarDisplays.tsx`

## Decision: Marker parity in this slice should cover ruler creation, menu or shortcut creation, move, and rename

**Rationale**: The current TypeScript shell only renders static marker labels. Java Blue supports shift-click creation on the marker row, project-menu or shortcut creation, drag-to-move, double-click rename, and context actions. The user explicitly requested creation, movement, renaming, mouse-based creation, and menu or shortcut parity, so those behaviors need to be first-class scope rather than implied follow-up work.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/MarkersBar.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/AddMarkerAction.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/resources/blue/ui/core/layer.xml`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/MarkersBar.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts`

## Decision: Keep render-range and marker persistence canonical instead of introducing renderer-owned storage

**Rationale**: `BlueData` already stores render start, render end, and the marker list, and the current project snapshot already exposes transport values and marker snapshots. The missing piece is mutation plumbing and shell interaction, not persistence. Keeping those values canonical also satisfies the requirement that save or reload restores the same state.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/markers-list.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data-root-compatibility.test.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`

## Decision: Treat root-timeline-only authoring as intentional parity for both render-range and marker editing

**Rationale**: Java Blue limits render-range and direct marker authoring to the root score timeline. Nested score-path navigation can still consume marker or follow state, but the authoring gestures themselves should stay rooted at the top-level score shell in this slice.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/TimeBar.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/MarkersBar.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`

## Decision: Keep the `Manage` workflow in scope, but move it behind the concrete ruler and marker gaps

**Rationale**: The shell still shows a non-functional `Manage` affordance, so the manager dialogs remain valid work. However, the review shows that render-range and marker authoring are both more concrete parity gaps and better bounded first steps for this branch.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- Java Blue `ScoreManagerDialog` and `LayerGroupManagerDialog` references
- `/Users/stevenyi/work/blue-electron/STATUS.md`

## Decision: Replace the marker-related placeholder surface with a real marker-centered workflow

**Rationale**: The workbench already registers `MarkersTopComponent`, but it still resolves to placeholder behavior in the TypeScript shell. Java Blue provides a dedicated marker list with row actions and a way to set render start from a selected marker, so this slice should provide a real marker-centered auxiliary workflow rather than leaving markers split between a static ruler row and a placeholder panel.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/MarkersTopComponent.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/AuxiliarySlideout.tsx`

## Decision: Keep follow-playback-on-render-start and time-pointer polish in the same shell slice

**Rationale**: The current application menu still exposes `Enable follow playback on render start` as a placeholder, and the score shell still lacks explicit time-pointer polish. Those gaps are tightly coupled to the score viewport and menu command flow, so they belong in the same spec after the ruler and marker foundations are in place.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/toolbar/SelectionDisplayPanel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/toolbar/PlayheadDisplayPanel.java`