# Contract: Tempo Map Surface

## Shared Snapshot Contract

`/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts` must expose tempo map state sufficient for all tempo UI surfaces.

```ts
export type TempoCurveTypeSnapshot = 'constant' | 'linear';

export interface TempoPointSnapshot {
  beat: number;
  tempo: number;
  curveType: TempoCurveTypeSnapshot;
  timeBase?: string;
  positionValue?: number;
}

export interface TempoMapSnapshot {
  enabled: boolean;
  visible: boolean;
  points: TempoPointSnapshot[];
}
```

Compatibility rule: existing consumers that only read `enabled` and `points` must continue to work after `visible` and optional point metadata are added.

## Patch Contract

The implementation may place these variants under a dedicated `ScorePatch` tempo variant or under `ProjectDocumentPatch.transport.tempoMap`, but the serialized renderer-to-main contract must cover the following operations:

```ts
export type TempoMapPatch =
  | { type: 'setTempoEnabled'; enabled: boolean }
  | { type: 'setTempoVisible'; visible: boolean }
  | {
      type: 'addTempoPoint';
      point: TempoPointSnapshot;
    }
  | {
      type: 'updateTempoPoint';
      index: number;
      patch: Partial<TempoPointSnapshot>;
    }
  | {
      type: 'setTempoCurveType';
      index: number;
      curveType: TempoCurveTypeSnapshot;
    }
  | {
      type: 'removeTempoPoint';
      index: number;
    }
  | {
      type: 'replaceTempoMap';
      map: TempoMapSnapshot;
    };
```

## Apply Semantics

- Patch application is canonical: mutate `BlueData.getScore().getTimeContext().getTempoMap()`, not renderer-only state.
- `setTempoVisible` must call the canonical `TempoMap.setVisible()` and cause a snapshot refresh.
- Point operations must preserve order after mutation.
- `replaceTempoMap` must validate all rows before mutating the canonical map.
- Rejected operations must leave the canonical map unchanged.
- Optimistic renderer updates must be reconciled with the next authoritative project snapshot.

## Renderer Components

### TempoRegionBar

Props:

```ts
interface TempoRegionBarProps {
  tempoMap: TempoMapSnapshot;
  totalBeats: number;
  pixelsPerBeat: number;
  snapEnabled: boolean;
  snapValue: SnapValueName;
  tempoForSnap: number;
  smpteFrameRate: number;
  sampleRate: number;
  rootTimelineOnly: boolean;
  onTempoPatch: (patch: TempoMapPatch) => void;
  onOpenPointDialog: (index: number) => void;
}
```

Required behavior:

- Height 20px.
- Renders one region per point.
- Double-click adds or edits.
- Right-click opens region context menu.
- Tooltip exposes beat, tempo, and curve.
- Disabled tempo map prevents Java-style direct editing.

### TempoLineView

Props:

```ts
interface TempoLineViewProps {
  tempoMap: TempoMapSnapshot;
  totalBeats: number;
  pixelsPerBeat: number;
  snapEnabled: boolean;
  snapValue: SnapValueName;
  tempoForSnap: number;
  smpteFrameRate: number;
  sampleRate: number;
  rootTimelineOnly: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onTempoPatch: (patch: TempoMapPatch) => void;
}
```

Required behavior:

- Height 80px when visible.
- Uses 30 to 240 BPM vertical range for pointer editing.
- Draws constant steps and linear slopes.
- Supports point insertion, drag update, curve context menu, and deletion.
- Applies existing snap settings and modifier bypass semantics.

### TempoPointDialog

Required fields:

- Position editor accepting beat input at minimum; BBT/BBST/BBF support is preferred when reusable time-position controls are available.
- Tempo BPM input.
- OK and Cancel.

Required validation:

- First point position is disabled/fixed at beat 0.
- Non-first point position is bounded between neighboring points.
- Tempo must be positive, with UI range 1 to 999 BPM.

### TempoMapEditorDialog

Required fields:

- Table columns: Beat, Tempo (BPM), Delete.
- Add action.
- OK and Cancel.

Required behavior:

- Edits a copy.
- Add inserts last beat + 4.0, previous tempo, Constant curve type.
- Delete disabled when only one row remains.
- OK sends `replaceTempoMap`.
- Cancel sends no patch.

## Native Menu Contract

`/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/application-menu.ts` must replace the placeholder `Edit Tempo Map...` item with a real enabled project command.

Suggested command:

```ts
mainWindow?.webContents.send('native-menu-command', { type: 'edit-tempo-map' });
```

The renderer must listen for this command and open `TempoMapEditorDialog` with the current tempo map snapshot.

## Test Contract

Tests must prove:

- Snapshot includes `visible` and preserves tempo points.
- Patch operations mutate canonical `BlueData`.
- Invalid patch operations leave data unchanged.
- Region bar context menu dispatches correct patches.
- Line view pointer operations dispatch bounded, snapped patches.
- Project menu item is enabled only when a project is loaded and sends the edit command.
- Modal Cancel sends no patch and OK sends `replaceTempoMap`.
