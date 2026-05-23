# Contract: ScoreObject BarRenderer Surface

## Shared Snapshot Contract

`ScoreRowObjectSnapshot` MUST include renderer metadata for timeline bar drawing.

```ts
interface ScoreRowObjectSnapshot {
  objectId: string;
  objectType: string;
  name: string;
  startBeats: number;
  durationBeats: number;
  backgroundColor: number;
  isContainer: boolean;
  editorTarget: ScoreObjectEditorTargetSnapshot;
  barRenderer: ScoreObjectBarRendererSnapshot;
}
```

Contract expectations:

- `barRenderer.kind` determines the renderer family.
- Snapshot creation owns object-type inspection and payload creation.
- Renderer components must not parse `serializedXml`.
- Unknown or Java-only types must use `kind: "fallback"` with a reason.

## Renderer Registry Contract

```ts
type ScoreObjectBarRendererComponent = (props: {
  item: ScoreRowObjectSnapshot;
  selected: boolean;
  pixelsPerBeat: number;
  rowHeight: number;
  waveform?: WaveformCacheEntry | null;
}) => React.ReactElement;

function getScoreObjectBarRenderer(
  snapshot: ScoreObjectBarRendererSnapshot,
): ScoreObjectBarRendererComponent;
```

Required behavior:

- `generic` draws Java `GenericView`.
- `comment` draws Java `CommentView`.
- `letter` draws Java `LetterRendererView`.
- `pianoRoll` draws Java `PianoRollView` by composing generic base plus note thumbnails.
- `audioFile` draws Java `AudioFileView`.
- `frozenSoundObject` draws Java `FrozenSoundObjectView`.
- `audioClip` draws Java `AudioClipPanel`.
- `fallback` draws a safe generic bar with explicit fallback semantics.

## Generic Renderer Contract

Inputs:

```ts
type GenericBarRendererSnapshot = {
  kind: "generic";
  labelLines: string[];
  timeBehavior: string;
  repeatPointBeats: number | null;
};
```

Required behavior:

- Fill and border colors follow Java bright/dark and selected-state rules.
- Text renders only when `rowHeight >= 20`.
- Labels use Java-compatible escaped newline splitting.
- Repeat markers render for `REPEAT` and `REPEAT_CLASSIC` only.
- The renderer is clipped to the bar bounds and does not change layout dimensions.

## Letter Mapping Contract

Required supported mappings:

| Object Type | Letter |
|-------------|--------|
| LineObject | L |
| ZakLineObject | L |
| External | E |
| Instance | I |
| PythonObject | P |
| JavaScriptObject | J |
| JMask | J |
| Sound | S |
| TrackerObject | T |

Conditional mappings:

| Object Type | Letter | Required Treatment |
|-------------|--------|--------------------|
| ObjectBuilder | O | Render if data model exists; otherwise fallback with documented reason |
| ClojureObject | C | Fallback until TypeScript data support exists |

## PianoRoll Renderer Contract

Inputs:

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

Required behavior:

- Draw the generic base first.
- Skip notes when there are no notes or `rowHeight <= DEFAULT_ROW_HEIGHT`.
- Use Java-compatible min/max note-number cache and note-height clamp.
- Draw `SCALE`, `REPEAT`, `REPEAT_CLASSIC`, and `NONE` behavior branches separately.
- Clip notes to the bar region.

## Audio Waveform Contract

Waveform lookup is app-owned and optional.

```ts
type WaveformRequest = {
  filePath: string;
  pixelSecond: number;
};

type WaveformCacheEntry = {
  key: string;
  filePath: string;
  pixelSecond: number;
  loading: boolean;
  error?: string;
  channels: Array<{ min: number[]; max: number[] }>;
};
```

Required behavior:

- Cache by resolved file path and pixel scale.
- Keep the bar visually stable while waveform data is loading or missing.
- Never persist waveform data in `BlueData`.
- Keep the helper replaceable for the planned future waveform redesign.

## AudioClip Fade Contract

```ts
type AudioFadeType = "LINEAR" | "CONSTANT_POWER" | "SYMMETRIC" | "FAST" | "SLOW";

function getAudioFadeValue(
  x: number,
  fadeType: AudioFadeType,
  fadeIn: boolean,
): number;
```

Required behavior:

- Match Java `FadeRenderer.getValue` for all fade types.
- Clamp visual fade polygon length to available clip width.
- Use translucent dark fade color on bright backgrounds and translucent light fade color on dark backgrounds.

## Test Contract

Automated tests must prove:

- Snapshot creation assigns the expected `barRenderer.kind` and payload per supported object type.
- Generic renderer labels, selected state, color contrast, and repeat markers match expected semantics.
- Comment renderer uses italic treatment and no repeat markers.
- Every letter mapping above renders the expected letter or explicit fallback.
- PianoRoll thumbnails draw expected note rectangles for each time behavior branch.
- AudioFile and FrozenSoundObject bars request waveform data and fall back safely.
- AudioClip bars apply file-start offset, looping flag, fade colors, and fade curves.
- Existing selection and score-object interaction tests still pass after renderer extraction.
