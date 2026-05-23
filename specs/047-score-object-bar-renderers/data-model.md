# Data Model: ScoreObject BarRenderer Parity

## ScoreRowObjectSnapshot Extension

Renderer-safe representation of one score timeline item.

```ts
type ScoreRowObjectSnapshot = {
  objectId: string;
  objectType: string;
  name: string;
  startBeats: number;
  durationBeats: number;
  startTimeBase: string;
  durationTimeBase: string;
  backgroundColor: number;
  isContainer: boolean;
  editorTarget: ScoreObjectEditorTargetSnapshot;
  serializedXml?: string;
  barRenderer: ScoreObjectBarRendererSnapshot;
};
```

Rules:

- `barRenderer` is derived from the canonical score object or audio clip while creating the project snapshot.
- Renderer components must not parse `serializedXml` for bar drawing.
- `barRenderer` contains UI drawing metadata only; it is not persisted into `.blue` XML.

## ScoreObjectBarRendererSnapshot

Discriminated union for Java parity renderer families.

```ts
type ScoreObjectBarRendererSnapshot =
  | GenericBarRendererSnapshot
  | CommentBarRendererSnapshot
  | LetterBarRendererSnapshot
  | PianoRollBarRendererSnapshot
  | AudioFileBarRendererSnapshot
  | FrozenSoundObjectBarRendererSnapshot
  | AudioClipBarRendererSnapshot
  | FallbackBarRendererSnapshot;
```

Rules:

- `kind` selects the renderer implementation.
- Every variant includes enough metadata for deterministic renderer tests.
- Unsupported Java-only data types use `fallback`, not a fabricated supported renderer.

## GenericBarRendererSnapshot

Shared payload for Java `GenericView`.

```ts
type GenericBarRendererSnapshot = {
  kind: "generic";
  labelLines: string[];
  timeBehavior: string;
  repeatPointBeats: number | null;
};
```

Rules:

- `labelLines` are split with Java-compatible escaped newline semantics.
- Repeat markers render only for `REPEAT` or `REPEAT_CLASSIC` when `repeatPointBeats` is positive and finite.
- Used for Java `GenericViewable` types available in TypeScript: `GenericScore`, `PatternObject`, and `NotationObject`.

## CommentBarRendererSnapshot

Payload for Java `CommentView`.

```ts
type CommentBarRendererSnapshot = {
  kind: "comment";
  labelLines: string[];
};
```

Rules:

- Uses comment-specific italic text placement.
- Does not draw repeat markers.

## LetterBarRendererSnapshot

Payload for Java `LetterRendererView`.

```ts
type LetterBarRendererSnapshot = {
  kind: "letter";
  letter: "L" | "E" | "I" | "J" | "O" | "P" | "S" | "T" | "C";
  labelLines: string[];
  timeBehavior: string;
  repeatPointBeats: number | null;
  mappingStatus: "supported" | "fallback";
};
```

Rules:

- Supported mappings render the Java badge and generic base.
- `mappingStatus: "fallback"` is reserved for known Java mappings whose data type is not currently ported.
- `C` is expected to remain fallback until `ClojureObject` exists in `@blue/data`.

## PianoRollBarRendererSnapshot

Payload for Java `PianoRollView`.

```ts
type PianoRollBarRendererSnapshot = {
  kind: "pianoRoll";
  labelLines: string[];
  timeBehavior: string;
  repeatPointBeats: number | null;
  scaleDegreeCount: number;
  notesDurationBeats: number;
  notes: Array<{
    octave: number;
    scaleDegree: number;
    startBeats: number;
    durationBeats: number;
  }>;
};
```

Rules:

- Extends generic renderer behavior before drawing note thumbnails.
- `scaleDegreeCount` is used to convert octave/scale degree into Java note number.
- `notesDurationBeats` is the max note end used by `SCALE` behavior.
- Invalid or empty notes produce generic-only rendering.

## AudioFileBarRendererSnapshot

Payload for Java `AudioFileView`.

```ts
type AudioFileBarRendererSnapshot = {
  kind: "audioFile";
  labelLines: string[];
  audioFilePath: string;
  waveformKey: string | null;
};
```

Rules:

- The waveform cache resolves `audioFilePath` outside `@blue/data`.
- Empty or unavailable files render the stable bar without waveform content.

## FrozenSoundObjectBarRendererSnapshot

Payload for Java `FrozenSoundObjectView`.

```ts
type FrozenSoundObjectBarRendererSnapshot = {
  kind: "frozenSoundObject";
  labelLines: string[];
  frozenWaveFileName: string;
  waveformKey: string | null;
  originalDurationBeats: number | null;
  currentDurationBeats: number;
};
```

Rules:

- Uses fixed Java frozen colors rather than the object's background color for normal fill.
- Extended-area shade renders only when both original and current durations are positive and finite.

## AudioClipBarRendererSnapshot

Payload for Java `AudioClipPanel`.

```ts
type AudioClipBarRendererSnapshot = {
  kind: "audioClip";
  labelLines: string[];
  audioFilePath: string;
  waveformKey: string | null;
  fileStartTimeBeats: number;
  audioDurationBeats: number;
  looping: boolean;
  fadeInBeats: number;
  fadeInType: AudioFadeType;
  fadeOutBeats: number;
  fadeOutType: AudioFadeType;
};

type AudioFadeType = "LINEAR" | "CONSTANT_POWER" | "SYMMETRIC" | "FAST" | "SLOW";
```

Rules:

- File start offset and looping are drawing inputs only.
- Fade polygons are clamped to the visible clip width.
- AudioClip background color still comes from the parent score-row snapshot.

## FallbackBarRendererSnapshot

Payload for unsupported or unknown renderer mappings.

```ts
type FallbackBarRendererSnapshot = {
  kind: "fallback";
  labelLines: string[];
  reason: "unknown-type" | "java-only-type" | "missing-data";
  javaRenderer?: string;
};
```

Rules:

- Fallback draws generic bar behavior when safe.
- Tests must verify `ClojureObject` and absent `ObjectBuilder` support do not appear as fully supported renderers unless the data model exists.

## WaveformCacheEntry

Derived app-side waveform summary.

```ts
type WaveformCacheEntry = {
  key: string;
  filePath: string;
  pixelSecond: number;
  loading: boolean;
  error?: string;
  channels: Array<{
    min: number[];
    max: number[];
  }>;
};
```

Rules:

- Keyed by resolved file path and pixel scale, matching Java's cache intent.
- Not stored in project snapshots or `.blue` XML.
- Can be replaced by a future waveform renderer without changing score-object data.

## State Flow

```text
Canonical BlueData score object / AudioClip
  -> ProjectEditorSnapshot.ScoreRowObjectSnapshot.barRenderer
  -> Score bar renderer registry
  -> optional WaveformCacheEntry lookup
  -> painted timeline bar
```

No renderer family writes canonical project data as part of drawing.
