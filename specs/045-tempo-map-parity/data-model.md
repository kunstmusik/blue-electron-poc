# Data Model: Tempo Map Parity

## Entity: TempoMapSnapshot

Renderer-safe representation of the canonical project tempo map.

### Fields

- `enabled: boolean` - whether score time conversion uses the tempo map.
- `visible: boolean` - whether the expanded line graph is open.
- `points: TempoPointSnapshot[]` - ordered tempo points.

### Validation

- At least one tempo point must exist.
- First point must have `beat` equal to `0`.
- Points must be ordered by increasing beat.
- Duplicate beat positions are not allowed; edit operations must resolve to one point.
- `visible` must round-trip through `TempoMap.isVisible()` / `setVisible()`.

## Entity: TempoPointSnapshot

Renderer-safe point used by bars, graphs, dialogs, and patches.

### Fields

- `id?: string` - optional renderer-only stable key if implementation needs one; canonical identity is index plus beat ordering.
- `beat: number` - absolute Csound beat position.
- `tempo: number` - BPM value.
- `curveType: 'constant' | 'linear'` - segment interpolation type from this point to the next point.
- `timeBase?: string` - optional original Java Blue time base for future-preserving edits.
- `positionValue?: number` - optional original position value paired with `timeBase`.

### Validation

- `beat` must be finite and non-negative.
- First point `beat` must be 0.
- `tempo` must be finite and greater than 0.
- UI point-edit dialog accepts 1 through 999 BPM.
- Line graph pointer editing clamps display interaction to 30 through 240 BPM.
- `curveType` must be `constant` or `linear`.
- If `timeBase`/`positionValue` are present, patch application must convert or preserve them through existing `@blue/data` `TimePosition` utilities.

## Entity: TempoPatch

Typed mutation applied to canonical `BlueData` tempo map.

### Variants

- `setTempoEnabled`
  - `enabled: boolean`
- `setTempoVisible`
  - `visible: boolean`
- `addTempoPoint`
  - `beat: number`
  - `tempo: number`
  - `curveType?: 'constant' | 'linear'`
  - optional original position metadata
- `updateTempoPoint`
  - `index: number`
  - `beat?: number`
  - `tempo?: number`
  - `curveType?: 'constant' | 'linear'`
  - optional original position metadata
- `setTempoCurveType`
  - `index: number`
  - `curveType: 'constant' | 'linear'`
- `removeTempoPoint`
  - `index: number`
- `replaceTempoMap`
  - `map: TempoMapSnapshot`

### Validation

- Indexes must resolve in the current canonical map at apply time.
- `removeTempoPoint` must reject index 0 and must never remove the last point.
- `addTempoPoint` must avoid duplicate beat positions.
- `updateTempoPoint` must keep index 0 at beat 0 and must keep a point between neighboring beats.
- `replaceTempoMap` must validate the complete map before mutation.
- Every accepted mutation must update canonical `BlueData` and publish a refreshed project snapshot.

## Entity: TempoRegion

Derived display region for the collapsed tempo bar.

### Fields

- `pointIndex: number`
- `startBeat: number`
- `endBeat: number`
- `tempo: number`
- `curveType: 'constant' | 'linear'`
- `label: string`
- `disabled: boolean`
- `selected: boolean`
- `hovered: boolean`

### Derivation Rules

- `startBeat` comes from point beat.
- `endBeat` is the next point beat, or the visible timeline end.
- Label uses tempo BPM and may omit text when the region is too narrow.
- Linear segments show ramp direction based on the next point tempo.

## Entity: TempoLinePoint

Derived display point for the expanded line graph.

### Fields

- `pointIndex: number`
- `x: number`
- `y: number`
- `beat: number`
- `tempo: number`
- `curveType: 'constant' | 'linear'`

### Derivation Rules

- `x = beat * pixelsPerBeat`.
- `y` maps 30 BPM to graph bottom and 240 BPM to graph top.
- Constant segments draw horizontal then vertical lines.
- Linear segments draw direct sloped lines.

## Entity: TempoMapModalDraft

Local modal state used for bulk editing.

### Fields

- `rows: TempoPointSnapshot[]`
- `dirty: boolean`
- `validationIssues: string[]`

### Lifecycle

1. Modal opens by copying `TempoMapSnapshot`.
2. User edits rows, adds a row at last beat + 4.0 using previous tempo and Constant curve type, or deletes rows when more than one row remains.
3. Cancel discards the draft.
4. OK validates the complete draft and sends `replaceTempoMap`.

## State Transitions

```text
collapsed tempo row
  -> arrow toggle
expanded tempo row with line graph
  -> arrow toggle
collapsed tempo row

tempo map snapshot
  -> renderer operation
tempo patch
  -> main process apply
canonical TempoMap
  -> snapshot refresh
tempo map snapshot

modal closed
  -> Project menu command
modal draft opened
  -> Cancel
modal closed with no project change

modal draft opened
  -> OK with valid draft
replaceTempoMap patch
  -> canonical TempoMap replaced
```
