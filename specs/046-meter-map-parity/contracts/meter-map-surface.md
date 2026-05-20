# Contract: Meter Map Surface

## Shared Snapshot Contract

`ProjectEditorSnapshot.transport.meterMap` MUST expose enough information for renderer drawing and hit testing without recomputing Java-incompatible boundaries.

```ts
type ProjectEditorSnapshot = {
  transport: {
    meterMap: MeterMapSnapshot;
  };
};

type MeterMapSnapshot = {
  entries: MeterEntrySnapshot[];
};

type MeterEntrySnapshot = {
  measure: number;
  numBeats: number;
  beatLength: number;
  startBeat: number;
};
```

Contract expectations:

- `entries[0].measure` is `1`.
- `startBeat` values are monotonically increasing.
- Entries are ordered by `measure`.
- The renderer treats `startBeat` as derived read-only data.

## Patch Contract

Meter edits are transported as typed project-document patches.

```ts
type ProjectDocumentPatch = {
  transport?: {
    meterMap?: MeterMapPatch;
  };
};

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

Validation contract:

- Reject empty replace-map entries.
- Reject non-positive or non-integer measure, numerator, or denominator.
- Reject deletion of the first entry.
- Reject a moved entry outside its neighboring measure bounds.
- Reject duplicate measures after normalization.
- For modal table edits, reject denominators that are not powers of two.

## Renderer Component Contract

### MeterRegionBar

```ts
type MeterRegionBarProps = {
  meterMap: MeterMapSnapshot;
  viewportStartBeat: number;
  viewportEndBeat: number;
  pixelsPerBeat: number;
  onPatchMeterMap: (patch: MeterMapPatch) => void;
};
```

Required behavior:

- Render a 20px row with one region per meter entry.
- Show labels like `4/4` when the region has enough width.
- Show hover state and tooltip with `Measure X / Time Signature: N/D`.
- Double-click edit existing entry at clicked measure or insert default `4/4`.
- Right-click menu actions:
  - `Edit Time Signature...`
  - `Delete Time Signature Change` for non-first entries only.

### MeterEntryDialog

```ts
type MeterEntryDialogProps = {
  entry: MeterEntrySnapshot;
  previousEntry?: MeterEntrySnapshot;
  nextEntry?: MeterEntrySnapshot;
  isFirstEntry: boolean;
  onConfirm: (patch: MeterMapPatch) => void;
  onCancel: () => void;
};
```

Required behavior:

- First entry measure is fixed at `1`.
- Non-first entry measure is constrained between neighbors.
- Signature parses from `N/D`.
- OK dispatches `meter-map-update-entry`; Cancel dispatches nothing.

### MeterMapEditorDialog

```ts
type MeterMapEditorDialogProps = {
  meterMap: MeterMapSnapshot;
  open: boolean;
  onConfirm: (patch: Extract<MeterMapPatch, { type: "meter-map-replace" }>) => void;
  onCancel: () => void;
};
```

Required behavior:

- Edits a local copy.
- Table columns: Measure, Time Signature, Delete.
- Add inserts `lastMeasure + 8` with `4/4`.
- Delete disabled when only one row remains.
- OK validates and dispatches one replace-map patch.
- Cancel dispatches nothing.

## Native Menu Contract

Menu label:

```text
Edit Time Signature Map...
```

Required behavior:

- Enabled only when a project is loaded.
- Sends a renderer command such as `edit-meter-map` or `edit-time-signature-map`.
- Opens `MeterMapEditorDialog` for the active project.

## Test Contract

Automated tests must prove:

- Snapshot start beats are accumulated correctly for mixed meters.
- Patch validation rejects invalid first-entry, duplicate-measure, and denominator inputs.
- Region bar double-click and context menu dispatch the right patches.
- Modal Cancel is a no-op and OK dispatches exactly one replace-map patch.
- Main menu enablement and command dispatch work with and without a project.
