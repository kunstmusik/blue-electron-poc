# Research: Tempo Map Parity

## Decision: Use Java Blue Tempo Score Components As Behavioral Source

**Decision**: Treat the following Java classes as the parity anchors for this spec:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/tempo/TempoRegionBar.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/tempo/TempoEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/tempo/TempoEditorPanel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/tempo/TempoEditorControl.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/time/TempoMapEditorPanel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/project/EditTempoMapAction.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/time/TempoMap.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/time/TempoPoint.java`

**Rationale**: The Java UI now has two explicit tempo surfaces: a collapsed Pro Tools-style region bar and a collapsible line graph editor. These are more specific than the older generic score ruler requirements and directly match the user's request.

**Alternatives considered**:

- Keep the current static Electron tempo summary row: rejected because it does not provide authoring, context menus, or line-view parity.
- Implement only the Project menu modal: rejected because the user explicitly requested ruler-bar and arrow-toggle interactions.

## Decision: Extend The Existing Transport Tempo Snapshot Instead Of Creating A Separate Renderer Store

**Decision**: Extend `TempoMapSnapshot` in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` with `visible` and richer point metadata, then use typed project-document patches for all mutations.

**Rationale**: The current Score panel already reads `transport.tempoMap` for ruler conversion and playhead behavior. Keeping tempo data in that snapshot prevents a second source of truth and keeps menu, modal, ruler, and playback consumers aligned with canonical `BlueData`.

**Alternatives considered**:

- Store tempo editor state in a renderer-only Zustand slice: rejected because tempo affects save/load, CSD generation, and playback timing.
- Add a separate `score.tempoMap` snapshot: possible, but it would duplicate `transport.tempoMap` unless the transport snapshot is removed. That larger refactor is unnecessary for this slice.

## Decision: Add Tempo Patch Operations Under The Shared Project Patch Contract

**Decision**: Extend the patch union to include tempo map operations, either as `transport.tempoMap` sub-operations or a dedicated `score` patch variant if implementation review shows that fits the current store better. The operations must cover set enabled, set visible, add point, update point, set curve type, remove point, and replace map.

**Rationale**: The current code only applies `tempoMap.enabled` at `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`. Ruler and modal parity need structural point mutations and visibility. Using explicit operations keeps validation localized and avoids replacing a complete map for every drag event unless a bulk modal replace is intended.

**Alternatives considered**:

- Send complete snapshots for every edit: rejected for drag-heavy line editing because it makes validation and optimistic updates noisier.
- Mutate renderer state first and sync later: rejected because canonical data must remain authoritative.

## Decision: Implement React Components Matching Java Row Heights And Interactions

**Decision**: Add dedicated renderer components for the tempo region bar, tempo line graph, point dialog, and tempo map modal in the Score panel area.

**Rationale**: Current `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx` renders only a single text summary. The Java design requires a 20px region bar plus optional 80px graph. Dedicated components keep the large pointer interaction logic out of `ColumnHeader.tsx`.

**Alternatives considered**:

- Use canvas for every tempo surface: possible for the graph, but DOM/SVG can handle small point/region editing and is easier to test with current renderer tests. The implementer should choose the simplest component technique that supports pixel-accurate pointer math and tests.

## Decision: Preserve Existing Time Conversion Helpers

**Decision**: Continue using the existing tempo-map conversion logic for ruler/playhead behavior, but ensure it reads updated tempo points and curve types after patches.

**Rationale**: `ColumnHeader.tsx` already has a tempo-map adapter for constant and linear curves. This spec is about edit parity, not replacing the conversion math unless tests expose divergence.

**Alternatives considered**:

- Move all conversion into `@blue/data` for renderer usage immediately: desirable long term, but this slice can remain scoped if parity tests pass.

## Decision: Project Menu Opens A Renderer Modal Through Native Menu Command Dispatch

**Decision**: Replace the current placeholder Project menu item with a real command that sends a native menu command to the renderer, where the Score panel or app-level listener opens `TempoMapEditorDialog`.

**Rationale**: The existing Electron menu already sends renderer commands for several Project menu actions. The modal is renderer UI because it edits a project snapshot draft and uses existing renderer styling/test infrastructure.

**Alternatives considered**:

- Use an Electron native `BrowserWindow` modal: rejected as heavier than needed and inconsistent with existing score dialogs.
- Apply edits directly in main process: rejected because the user needs an interactive table UI.

## Current TypeScript Gaps

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ColumnHeader.tsx` renders a static tempo text row instead of a region bar or line graph.
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx` shows a tempo arrow button, but the button currently has no expand/collapse behavior.
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` snapshots only tempo-map enabled state and points, not visibility, and applies only `tempoMap.enabled` patches.
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/tempo-map.ts` has `isVisible()` and `setVisible()`, but `setVisible()` currently does not notify listeners; implementation should verify whether this affects snapshot refresh.
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts` has placeholder entries for `Edit Tempo Map...` and `Edit Time Signature Map...`.

## Java Behavior Notes To Preserve

- `TempoRegionBar` row height is 20px; expanded row total is 100px through `TempoEditorPanel` and `TempoEditorControl`.
- Region bar labels show a note-style tempo value in Java; Electron can use a plain accessible label if font coverage is unreliable, but should visually communicate BPM.
- Region bar double-click adds a Constant point using the current tempo at that beat or edits an existing point within tolerance.
- Region bar context menu: Edit Tempo..., Constant, Linear, Delete Tempo Point for non-first points.
- Point edit dialog keeps first point fixed at beat 0 and bounds edits between neighbor points.
- Tempo line graph uses min 30 BPM and max 240 BPM for y-axis editing.
- Tempo line graph draws Constant as a step and Linear as a sloped segment.
- Line graph left-click inserts, drag moves, Ctrl constrains one axis, Shift bypasses snap during drag, and right-click deletes selected non-first points or opens segment curve menu.
- `TempoMapEditorPanel` modal edits a copy, adds a point at last beat + 4.0, uses previous tempo, disables delete when only one point remains, and replaces the map only on OK.

## Testing Strategy

- Shared/main tests should validate patch application directly on `BlueData` and `.blue` save/load.
- Renderer tests should validate visible UI state, context menus, dialogs, pointer interactions, snap behavior, and menu-command modal opening.
- Build validation should include `pnpm --filter @blue/app build`, `pnpm --filter @blue/app test`, targeted renderer tests, and `pnpm --filter @blue/data test` if `@blue/data` listener or model behavior changes.
