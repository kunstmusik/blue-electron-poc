# Contract: Score Editor Foundation Surfaces

## Scope

This contract describes the shared TypeScript surface for Spec 036 between `@blue/data`, the shared project snapshot layer, and the renderer score shell. It intentionally covers only the first score milestone: score-shell rendering, score time-state updates, and nested score-path navigation. Auxiliary editor surfaces and direct manipulation are deferred to later score specs.

## Project Document Contract Extension

Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`.

```ts
export interface ScoreTimeStateSnapshot {
  snapEnabled: boolean;
  snapValue: string;
  primaryTimeDisplay: string;
  secondaryTimeDisplay: string;
  secondaryRulerEnabled: boolean;
  tempoRowVisible: boolean;
  meterRowVisible: boolean;
  markersRowVisible: boolean;
  smpteFrameRate: number;
  zoomIterations: number;
}

export interface MarkerSnapshot {
  name: string;
  time: number;
  sourceIndex: number;
}

export interface ScoreRowObjectSnapshot {
  objectId: string;
  objectType: string;
  name: string;
  startBeats: number;
  durationBeats: number;
  backgroundColor: number;
  isContainer: boolean;
}

export interface ScoreLayerSnapshot {
  layerId: string;
  name: string;
  height: number;
  muted?: boolean;
  solo?: boolean;
  items: ScoreRowObjectSnapshot[];
}

export interface PolyObjectLayerGroupSnapshot {
  groupId: string;
  groupType: 'polyObject';
  name: string;
  layerCount: number;
  isOpenableContainer: boolean;
  layers: ScoreLayerSnapshot[];
}

export interface AudioLayerGroupSnapshot {
  groupId: string;
  groupType: 'audio';
  name: string;
  layerCount: number;
  isOpenableContainer: boolean;
  layers: ScoreLayerSnapshot[];
}

export interface PatternsLayerGroupSnapshot {
  groupId: string;
  groupType: 'patterns';
  name: string;
  layerCount: number;
  isOpenableContainer: boolean;
  layers: ScoreLayerSnapshot[];
}

export type ScoreLayerGroupSnapshot =
  | PolyObjectLayerGroupSnapshot
  | AudioLayerGroupSnapshot
  | PatternsLayerGroupSnapshot;

export interface ScoreDocumentSnapshot {
  timeState: ScoreTimeStateSnapshot;
  markers: MarkerSnapshot[];
  layerGroups: ScoreLayerGroupSnapshot[];
}

export type ScorePatch =
  | { type: 'updateTimeState'; patch: Partial<ScoreTimeStateSnapshot> };

export interface ProjectEditorSnapshot {
  score?: ScoreDocumentSnapshot;
}

export interface ProjectDocumentPatch {
  score?: ScorePatch;
}
```

Requirements:

- Snapshot creation must read canonical `BlueData.getScore()` and `BlueData.getMarkersList()`.
- Existing `transport` snapshot fields remain the canonical source for tempo map, meter map, render start, render end, loop rendering, and sample rate.
- Score shell snapshots are display-focused and intentionally smaller than the full canonical `@blue/data` graph.

## `@blue/data` Contract Additions

Extend `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-state.ts` and export any new public type from `/Users/stevenyi/work/blue-electron/packages/blue-data/src/index.ts`.

```ts
export type SnapValueName =
  | 'BAR'
  | 'HALF'
  | 'BEAT'
  | 'EIGHTH'
  | 'SIXTEENTH'
  | 'THIRTY_SECOND'
  | 'SIXTY_FOURTH'
  | 'QUARTER_TRIPLET'
  | 'EIGHTH_TRIPLET'
  | 'SIXTEENTH_TRIPLET'
  | 'ONE_SECOND'
  | 'HUNDRED_MS'
  | 'TEN_MS'
  | 'ONE_MS'
  | 'FRAME'
  | 'SAMPLE'
  | 'AUTO';

class TimeState {
  isSnapEnabled(): boolean;
  setSnapEnabled(value: boolean): void;
  getSnapValue(): SnapValueName;
  setSnapValue(value: SnapValueName): void;
  getTimeDisplay(): TimeBase;
  setTimeDisplay(value: TimeBase): void;
  getSecondaryTimeDisplay(): TimeBase;
  setSecondaryTimeDisplay(value: TimeBase): void;
  isSecondaryRulerEnabled(): boolean;
  setSecondaryRulerEnabled(value: boolean): void;
  isTempoRowVisible(): boolean;
  setTempoRowVisible(value: boolean): void;
  isMeterRowVisible(): boolean;
  setMeterRowVisible(value: boolean): void;
  isMarkersRowVisible(): boolean;
  setMarkersRowVisible(value: boolean): void;
  getSmpteFrameRate(): number;
  setSmpteFrameRate(value: number): void;
  getZoomIterations(): number;
  setZoomIterations(value: number): void;
  getPixelSecond(): number;
}
```

Requirements:

- `TimeState` must save and load Java-compatible XML for the score-shell fields needed in this spec.
- `TimeState` defaults must match Java when fields are absent.
- `@blue/data` remains pure TypeScript with no renderer or Electron dependencies.

## Shared Patch-Application Contract

Shared patch helpers in `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` must:

- create `ScoreDocumentSnapshot` from canonical `BlueData`
- apply `ScorePatch.updateTimeState`
- include `score` in `createEmptyProjectEditorSnapshot()`
- treat empty `score` patches as no-ops in `isEmptyProjectDocumentPatch(...)`

No dedicated score-only IPC handler should be introduced for this spec. The existing project document patch flow remains the canonical mutation path.

## Renderer Panel Contract

Extend `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`.

- `ScoreTopComponent` must render a dedicated `ScorePanel` surface.
- `ScorePanel` must not fall through to `PlaceholderPanel` after this spec lands.
- `ScorePanel` consumes `projectStore.score` plus existing `projectStore.transport`.

Expected renderer composition:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/ScorePanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScorePathBar.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScoreTimelineShell.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/ScoreRulerStack.tsx`
- provider-style layer-group row components under `.../score/layer-groups/`

## Nested Score-Path Session Contract

Nested score-path state is renderer-local. It is not part of the project patch contract.

```ts
export interface ScorePathSession {
  activeGroupId: string | null;
  segments: Array<{ groupId: string | null; label: string }>;
  scrollByGroupId: Record<string, { x: number; y: number }>;
}
```

Requirements:

- Root score is represented by `activeGroupId = null`.
- Only `PolyObject` rows may open nested paths in this spec.
- Invalid or removed path targets must fall back safely to root.

## Validation Rules

- `ScoreTopComponent` must show an explicit empty state when no project is loaded.
- Unsupported layer-group types must surface a deliberate unsupported view rather than crashing the shell.
- `TimeState` patch values must be validated against supported enum names before they mutate canonical data.
- Score shell rendering must stay deterministic for mixed root score order and nested path traversal.
