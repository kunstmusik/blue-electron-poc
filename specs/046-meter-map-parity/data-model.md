# Data Model: Meter Map Parity

## MeterMapSnapshot

Renderer-safe representation of the canonical score meter map.

```ts
type MeterMapSnapshot = {
  entries: MeterEntrySnapshot[];
};
```

Rules:

- Entries are sorted by ascending `measure`.
- The first entry is always measure 1.
- Snapshot data is created from canonical `BlueData.getScore().getTimeContext().getMeterMap()`.
- Renderer code must not treat this snapshot as canonical after dispatching edits; it should rely on refreshed project snapshots or optimistic patch merge.

## MeterEntrySnapshot

Single meter change entry.

```ts
type MeterEntrySnapshot = {
  measure: number;
  numBeats: number;
  beatLength: number;
  startBeat: number;
};
```

Fields:

- `measure`: one-based measure number where the meter becomes active.
- `numBeats`: numerator, such as `4` in 4/4.
- `beatLength`: denominator, such as `4` in 4/4.
- `startBeat`: absolute score beat where this entry begins, derived from accumulated prior entries.

Validation:

- `measure`, `numBeats`, and `beatLength` are positive integers.
- `measure` values are unique.
- The first entry has `measure === 1`.
- `startBeat` is derived, not user-editable.
- Modal validation should require `beatLength` to be a power of two.

## MeterMapPatch

Typed project-document mutation for meter-map edits.

```ts
type MeterMapPatch =
  | { type: "meter-map-set-entry"; measure: number; numBeats: number; beatLength: number }
  | {
      type: "meter-map-update-entry";
      previousMeasure: number;
      measure: number;
      numBeats: number;
      beatLength: number;
    }
  | { type: "meter-map-remove-entry"; measure: number }
  | { type: "meter-map-replace"; entries: MeterEntryInput[] };

type MeterEntryInput = {
  measure: number;
  numBeats: number;
  beatLength: number;
};
```

Rules:

- `meter-map-set-entry` inserts a new entry or replaces the entry at the same measure.
- `meter-map-update-entry` changes an existing entry and may move it to a new measure within neighbor bounds.
- `meter-map-remove-entry` rejects measure 1 and rejects deletion if it would leave no entries.
- `meter-map-replace` validates the complete sorted map before applying any changes.

## DerivedMeterRegion

UI-only representation used for drawing and hit testing.

```ts
type DerivedMeterRegion = {
  entry: MeterEntrySnapshot;
  index: number;
  startBeat: number;
  endBeat: number | null;
  label: string;
};
```

Rules:

- `endBeat` is the next entry's `startBeat`, or `null` for the open-ended final region.
- Labels use `numBeats/beatLength`.
- Hit testing compares pointer beat against `[startBeat, endBeat)`.
- Rendering clips open-ended final region to the visible viewport.

## MeterEntryDraft

Dialog-local editable entry.

```ts
type MeterEntryDraft = {
  originalMeasure: number;
  measure: number;
  signatureText: string;
  numBeats: number | null;
  beatLength: number | null;
  errors: Record<string, string>;
};
```

Rules:

- Inline row editing uses a draft so Cancel can discard changes.
- The first entry disables measure edits.
- Non-first measure edits are bounded by neighboring entries.
- Signature text parses as `numerator/denominator`.

## MeterMapModalDraft

Complete copied table state used by the Project menu modal.

```ts
type MeterMapModalDraft = {
  entries: MeterEntryDraft[];
  dirty: boolean;
  errors: Record<number, Record<string, string>>;
};
```

Rules:

- Created from the current snapshot when the modal opens.
- Add appends `lastMeasure + 8` with `4/4`.
- Delete is disabled when only one row remains.
- OK converts to `meter-map-replace` only if the full draft is valid.
- Cancel discards the draft and dispatches no patch.

## State Transitions

```text
Canonical MeterMap
  -> ProjectEditorSnapshot.meterMap
  -> MeterRegionBar / MeterMapEditorDialog draft
  -> validated MeterMapPatch
  -> main-process BlueData MeterMap
  -> refreshed ProjectEditorSnapshot
```

No renderer component may bypass the patch boundary for persistent meter-map changes.
