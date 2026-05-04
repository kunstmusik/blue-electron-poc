# Data Model: Score Editor Foundation

## Entity: ScoreDocumentSnapshot

- **Purpose**: Renderer-facing view of the score shell state needed to render the score timeline without instantiating canonical `@blue/data` classes in the renderer.
- **Fields**:
  - `timeState: ScoreTimeStateSnapshot`
  - `markers: MarkerSnapshot[]`
  - `layerGroups: ScoreLayerGroupSnapshot[]`
- **Relationships**:
  - Added to `ProjectEditorSnapshot`.
  - Consumed together with the existing transport snapshot for tempo, meter, render-start, render-end, and loop metadata.
- **Validation**:
  - Preserve layer-group order from canonical `Score`.
  - Omit unsupported layer-group details only when a deliberate fallback state is available.
  - Must survive project load and save without inventing renderer-only canonical fields.

## Entity: ScoreTimeStateSnapshot

- **Purpose**: Structured representation of Java `TimeState` fields required by the score shell.
- **Fields**:
  - `snapEnabled: boolean`
  - `snapValue: string`
  - `primaryTimeDisplay: string`
  - `secondaryTimeDisplay: string`
  - `secondaryRulerEnabled: boolean`
  - `tempoRowVisible: boolean`
  - `meterRowVisible: boolean`
  - `markersRowVisible: boolean`
  - `smpteFrameRate: number`
  - `zoomIterations: number`
- **Relationships**:
  - Derived from canonical `Score.getTimeState()`.
  - Updated through `ScorePatch`.
- **Validation**:
  - `snapValue` must map to a Java-compatible `SnapValue`.
  - `primaryTimeDisplay` and `secondaryTimeDisplay` must map to Java-compatible `TimeBase` values.
  - `smpteFrameRate > 0`.
  - Older project XML missing these fields must degrade to Java-compatible defaults.

## Entity: MarkerSnapshot

- **Purpose**: Structured marker data for score-shell display while the canonical `MarkersList` continues to preserve raw XML.
- **Fields**:
  - `name: string`
  - `time: number`
  - `sourceIndex: number`
- **Relationships**:
  - Derived from `BlueData.getMarkersList()`.
  - Read-only in this spec.
- **Validation**:
  - Preserve marker order from the canonical markers list.
  - Ignore malformed markers safely instead of crashing the score shell.

## Entity: ScoreLayerGroupSnapshot

- **Purpose**: Minimal display snapshot for one renderable root score layer group.
- **Variants**:
  - `PolyObjectLayerGroupSnapshot`
  - `AudioLayerGroupSnapshot`
  - `PatternsLayerGroupSnapshot`
- **Common Fields**:
  - `groupId: string`
  - `groupType: 'polyObject' | 'audio' | 'patterns'`
  - `name: string`
  - `layerCount: number`
  - `isOpenableContainer: boolean`
- **Relationships**:
  - Produced from canonical score layer groups in `Score`.
  - Rendered by provider-style React row and header components.
- **Validation**:
  - `groupId` must remain stable for the current snapshot lifetime.
  - Snapshot shape must include enough information to render root rows and open nested `PolyObject` paths.

## Entity: ScoreLayerSnapshot

- **Purpose**: Display snapshot for one visible row within a layer group.
- **Fields**:
  - `layerId: string`
  - `name: string`
  - `height: number`
  - `muted?: boolean`
  - `solo?: boolean`
  - `items: ScoreRowObjectSnapshot[]`
- **Relationships**:
  - Nested inside each `ScoreLayerGroupSnapshot`.
  - Rendered by shell row components for poly-object, audio, and pattern group types.
- **Validation**:
  - Preserve layer order from the canonical group.
  - `height` must reflect the canonical layer height or a deliberate Java-compatible default.

## Entity: ScoreRowObjectSnapshot

- **Purpose**: Minimal timeline-display snapshot for one visible score object or audio clip.
- **Fields**:
  - `objectId: string`
  - `objectType: string`
  - `name: string`
  - `startBeats: number`
  - `durationBeats: number`
  - `backgroundColor: number`
  - `isContainer: boolean`
- **Relationships**:
  - Produced from `ScoreObject` or `AudioClip` instances inside `ScoreLayerSnapshot.items`.
  - Used for geometry, labels, color, tooltips, and nested-path entry.
- **Validation**:
  - `durationBeats >= 0`
  - `startBeats` and `durationBeats` must use canonical `TimeContext`.
  - `isContainer` is `true` only for objects that can open a nested score path in this slice.

## Entity: ScorePatch

- **Purpose**: Explicit mutation contract for canonical score-shell updates in this spec.
- **Variants**:
  - `updateTimeState` with `patch: Partial<ScoreTimeStateSnapshot>`
- **Relationships**:
  - Nested in `ProjectDocumentPatch.score`.
  - Applied in shared patch helpers to canonical `Score.getTimeState()`.
- **Validation**:
  - Empty patches are invalid.
  - Time-display and snap values must map to supported enum names before mutation.

## Entity: ScorePathSession

- **Purpose**: Renderer-local session state for nested score-path navigation.
- **Fields**:
  - `segments: Array<{ groupId: string | null; label: string }>`
  - `activeGroupId: string | null`
  - `scrollByGroupId: Record<string, { x: number; y: number }>`
- **Relationships**:
  - Owned by the score panel or a local score hook.
  - Derived from the current `ScoreDocumentSnapshot` and user navigation.
- **Validation**:
  - Root path is represented by `activeGroupId = null`.
  - Invalid or removed group ids must fall back safely to the root path.
- **Persistence**:
  - Not stored in `ProjectEditorSnapshot` or project XML.

## State Flows

### Score Snapshot Flow

1. Main process owns canonical `BlueData`.
2. `createProjectEditorSnapshot(...)` serializes score shell data into `ScoreDocumentSnapshot`.
3. Renderer project store exposes the snapshot to `ScorePanel`.
4. Existing transport snapshot continues to provide tempo, meter, render-start, and loop metadata consumed by the shell.

### Score Time-State Edit Flow

1. User changes snap, zoom, row visibility, or ruler display from the score shell.
2. Renderer dispatches `ProjectDocumentPatch.score`.
3. Main process applies the patch to canonical `Score.getTimeState()`.
4. Refreshed snapshot round-trips the same score-shell state back to the renderer.

### Nested Score-Path Flow

1. User activates an openable `PolyObject` from the score shell.
2. Renderer saves the current scroll coordinates under the current path key.
3. Renderer switches `ScorePathSession.activeGroupId` to the selected nested group.
4. Returning to a previous path restores its saved scroll coordinates.

### Project Reload Flow

1. User loads or reloads a project.
2. Canonical `BlueData` reconstructs score graph, `TimeState`, and `MarkersList`.
3. Renderer receives a fresh `ScoreDocumentSnapshot`.
4. Renderer reinitializes `ScorePathSession`, falling back to the root score if the previous active path is no longer valid.
