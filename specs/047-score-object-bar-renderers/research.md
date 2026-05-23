# Research: ScoreObject BarRenderer Parity

**Feature**: 047-score-object-bar-renderers  
**Date**: 2026-05-21  
**Scope**: Java Blue score-object bar renderer/view parity for the React Score timeline, including current Java waveform rendering for audio-backed objects.

## Java Blue Renderer Inventory

### Common View Base

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/SoundObjectView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/SoundObjectViewFactory.java`

Findings:

- Java resolves sound-object views through `@SoundObjectViewPlugin` metadata loaded from `blue/score/soundObjectViews`.
- `SoundObjectView` positions bars from `startTime.toBeats(context) * pixelSecond` and sizes them from `subjectiveDuration.toBeats(context) * pixelSecond`.
- The base view listens for name, start, duration, color, and repeat-point changes and repaints or resizes accordingly.
- Selection comes from the Score top component lookup and affects all concrete view painting.

Decision:

- TypeScript should use a renderer registry keyed by snapshot `objectType` and a typed `barRenderer` payload. React components should not instantiate Java-like mutable view objects.

### GenericView

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/GenericView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/GenericViewable.java`
- Java `GenericViewable` implementors checked: `GenericScore`, `PatternObject`, `NotationObject`

Findings:

- Draws antialiased filled rectangle from the score-object background color using `BlueGradientFactory.getGradientPaint(bgColor)`.
- Non-selected border uses brightened and darkened color variants; selected border is white.
- Selected fill brightens the score-object color twice and draws a dark header band at `(0, 2, width, 18)`.
- Font color is black for bright colors and white for dark colors.
- Labels use bold 12px-ish label font and draw only when height is at least 20px.
- Names split on Java's escaped newline pattern and each line is drawn at `16 + i * Layer.LAYER_HEIGHT`.
- `REPEAT` and `REPEAT_CLASSIC` with a non-null repeat point draw paired small triangular repeat markers at repeat boundaries.

Decision:

- Implement the generic renderer as a reusable helper and use it for `GenericScore`, `PatternObject`, `NotationObject`, and any deliberate generic fallback. Preserve repeat markers and label splitting.

### CommentView

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/CommentView.java`

Findings:

- Shares the generic fill, selection, border, and readable text rules.
- Uses italic 12px label font.
- Draws labels at `15 + i * Layer.LAYER_HEIGHT`.
- Does not draw repeat markers.

Decision:

- Implement `Comment` as a separate renderer family rather than a generic renderer option, because text style and y-position are intentionally different.

### LetterRendererView And Letter Types

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/LetterRendererView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/AbstractLineObjectView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/ExternalView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/InstanceView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/JMaskView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/JavaScriptObjectView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/ObjectBuilderView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/PythonObjectView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/SoundView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/TrackerObjectView.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-clojure/src/main/java/blue/clojure/soundObject/ClojureObjectView.java`

Findings:

- `LetterRendererView` extends `GenericView`.
- It sets `labelOffset = 13` so labels clear the badge.
- It draws a 9x9 badge at `x=2, y=5` and the letter at roughly `x=3, y=13` using bold 10px font.
- Selected badge color is white with black letter.
- Non-selected badge color is the background color brightened twice, with black or white letter based on background brightness.
- Java mappings:
  - `AbstractLineObject` -> `L`, covering `LineObject` and `ZakLineObject`
  - `External` -> `E`
  - `Instance` -> `I`
  - `JMask` -> `J`
  - `JavaScriptObject` -> `J`
  - `ObjectBuilder` -> `O`
  - `PythonObject` -> `P`
  - `Sound` -> `S`
  - `TrackerObject` -> `T`
  - `ClojureObject` -> `C`

Decision:

- Implement one letter renderer helper plus explicit mapping tests per object type. `ClojureObject` should remain a documented fallback until `@blue/data` supports the type.

### PianoRollView

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/PianoRollView.java`

Findings:

- Extends `GenericView`, then draws note thumbnails below the standard layer-height title band.
- Skips thumbnail drawing when height is not greater than `SoundLayer.LAYER_HEIGHT` or no notes exist.
- Computes a cache of min note number, max note number, pitch range, and total note duration.
- Draw area is `height - SoundLayer.LAYER_HEIGHT - 6`.
- Note height is clamped to 1..3 pixels from available height and pitch range.
- Vertical note position maps note number to draw height with a linear scale.
- Draw color is background darker when selected, background brighter twice when not selected.
- `SCALE` maps object note time 0..notesDuration to the full rendered width.
- `REPEAT` maps note positions inside each repeat window and clips notes at window width.
- `REPEAT_CLASSIC` repeats full windows and then draws a partial final window.
- `NONE` draws note start and duration directly by `pixelSecond` and clips to object width.

Decision:

- Snapshot PianoRoll note data and time-behavior inputs explicitly so the renderer can draw the Java thumbnail without querying editor payloads or parsing XML.

### AudioFileView

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/AudioFileView.java`

Findings:

- Uses object background color as a flat fill, not the generic gradient.
- Chooses waveform color from background brightness: darker waveform on bright backgrounds, brighter waveform on dark backgrounds.
- Retrieves waveform data through `AudioWaveformCache.getAudioWaveformData(BlueSystem.getFullPath(audioFilename), pixelSeconds)`.
- Adds an `AudioWaveformListener` if data is still loading.
- Draws waveform translated by `(1, 2)` into `height - 4`.
- Uses no file-start offset and no looping for `AudioFile`.
- Selected state draws the dark header band and white border/label.

Decision:

- Implement current Java-style waveform drawing as renderer/app infrastructure keyed by resolved audio file path and pixel scale. Keep it replaceable for the future waveform redesign.

### FrozenSoundObjectView

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/views/FrozenSoundObjectView.java`

Findings:

- Uses fixed normal background `rgb(193,205,205)` independent of the stored score-object color.
- Computes `percentOriginal` as original frozen sound-object duration divided by current frozen object duration.
- Fills the whole bar, then overlays a translucent black shade over the extended area from `width * percentOriginal`.
- Draws waveform from the frozen wave file name with the same cache/listener approach as `AudioFileView`.
- Selected state brightens the fixed normal background, draws a dark header band, and uses white text/border.

Decision:

- Snapshot frozen file path plus original/current duration ratio when available. If the original sound object is unavailable in TypeScript data, render the waveform and skip the extended-area shade with an explicit tested fallback.

### AudioClipPanel, FadeHandle, FadeRenderer

Source reviewed:

- `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/AudioClipPanel.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/FadeHandle.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/FadeRenderer.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/AudioLayersPanel.java`

Findings:

- Audio clips are not sound-object views; `AudioLayersPanel` instantiates `AudioClipPanel` per `AudioClip`.
- Audio layers paint a black background, horizontal layer separators, and snap-grid vertical lines.
- `AudioClipPanel` uses translucent object background `alpha=194` when not selected and `rgba(255,255,255,128)` when selected.
- Non-selected wave color starts from the object color, darkened for bright colors and brightened for dark colors.
- Waveform drawing uses `fileStartTime * pixelSecond` as the waveform offset and passes the looping flag to `AudioWaveformUI.paintWaveForm`.
- Fade overlays use translucent black on bright backgrounds and translucent white on dark backgrounds.
- `paintFade` builds a polygon from `FadeRenderer.getValue(x, fadeType, fadeIn)` for every pixel of fade duration.
- Fade types are `LINEAR`, `CONSTANT_POWER`, `SYMMETRIC`, `FAST`, and `SLOW`.
- Fade handles are interactive in Java, but this spec's required scope is bar rendering parity. Existing editor/property patch flows own durable fade values.
- Alt-drag file-start editing, alt-shift split, and fade-handle interactions are Java behaviors adjacent to rendering. They should be preserved or deferred explicitly if current TypeScript score interactions do not support them.

Decision:

- Implement AudioClip rendering parity now, including fade curve helpers and visible fade polygons. Treat fade handles and audio-edit interactions as separate follow-up unless existing score interaction code already supports them cleanly.

## TypeScript Current-State Findings

Source reviewed:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/ScoreTimeCanvas.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/AudioLayerGroupCanvas.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/register-sound-object-types.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/piano-roll.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/audio-file.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/frozen-sound-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-clip.ts`

Findings:

- `ScoreTimeCanvas.tsx` currently draws all poly-object score items through one generic DOM bar with color, selected header band, and label. It does not dispatch by object type or draw repeat markers, letter badges, PianoRoll thumbnails, or audio waveforms.
- `AudioLayerGroupCanvas.tsx` currently draws audio clips as simple colored rounded bars with labels. It does not share the ScoreTimeCanvas interaction surface and does not draw Java waveform/fade behavior.
- `ScoreRowObjectSnapshot` already includes core fields such as `objectType`, `name`, start/duration beats, background color, `editorTarget`, and serialized XML.
- `project-editor.ts` already has type-specific editor snapshot logic for PianoRoll and AudioClip that can inform, but should not be coupled to, timeline rendering payloads.
- `@blue/data` registers all main TypeScript built-in sound objects except Java Clojure and Java ObjectBuilder. `CSDSoundObject` exists in TypeScript but does not have a current Java `@SoundObjectViewPlugin`; it should use deliberate fallback/generic behavior rather than a fabricated Java renderer.
- No app waveform cache or waveform renderer was found in the TypeScript app.

## Decisions

### Decision 1: Add A Typed Bar Renderer Payload To Score Row Snapshots

**Decision**: Extend `ScoreRowObjectSnapshot` with a `barRenderer` union carrying exactly the data needed by timeline renderers.

**Rationale**: React renderer code should not parse `serializedXml` or request full score-object editor documents just to draw a bar. Snapshot payloads keep the timeline deterministic and testable.

**Alternatives Considered**:

- Parse XML in `ScoreTimeCanvas`: rejected because it duplicates model logic in UI code.
- Reuse type-specific editor payloads: rejected because editor payloads are larger, editor-owned, and loaded on demand.

### Decision 2: Use A Renderer Registry In The Score Timeline

**Decision**: Replace inline DOM bar drawing with a registry of renderer components/helpers selected by `barRenderer.kind`.

**Rationale**: Java has one view class per renderer family. A registry gives the TypeScript timeline the same extensibility without Swing-style mutable components.

**Alternatives Considered**:

- A single monolithic renderer with `switch` blocks in JSX: rejected because it will make per-renderer parity tests and future waveform replacement harder.

### Decision 3: Implement Waveform Infrastructure In `@blue/app`, Not `@blue/data`

**Decision**: Add waveform data retrieval/cache/rendering under `@blue/app` boundaries, with main/preload involvement only if local file access is required.

**Rationale**: `@blue/data` must remain browser-safe and Node-free. Waveform decoding is an app/runtime concern and is explicitly planned for future replacement.

**Alternatives Considered**:

- Store waveform data in project snapshots: rejected because waveform data is derived, heavy, and not canonical.
- Add Node file access to `@blue/data`: rejected by project constraints.

### Decision 4: Treat Clojure As Explicit Fallback

**Decision**: Document Java `ClojureObjectView` and add test coverage that unsupported Clojure object types do not falsely claim parity until the data model is ported.

**Rationale**: Java has a `C` letter renderer, but the TypeScript data layer currently has no Clojure sound-object registration.

**Alternatives Considered**:

- Port `ClojureObject` as part of this renderer spec: rejected because it is a data/model/runtime feature, not a bar-rendering feature.

## Risks And Follow-Ups

- Waveform decoding may require new Electron IPC or renderer file access. Keep that infrastructure small and replaceable.
- AudioClip Java interaction behaviors such as fade handles, alt-drag file offset, and alt-shift split are adjacent to rendering. If implemented, they need their own tests; if deferred, record that deferral in status.
- `FrozenSoundObject` original-duration shading depends on the frozen source object being available. Existing TypeScript loading may not preserve that nested object; the renderer must degrade deliberately.
- If ObjectBuilder remains absent from `@blue/data`, its `O` letter renderer task should become an explicit fallback task rather than a fake implementation.
