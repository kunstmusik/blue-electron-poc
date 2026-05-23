# Feature Specification: ScoreObject BarRenderer Parity

**Feature Branch**: `047-score-object-bar-renderers`  
**Created**: 2026-05-21  
**Status**: Closed
**Input**: User description: "Use spec-kit to create a spec to implement parity for Java Blue's ScoreObject BarRenderers. There are plans to eventually change wave form rendering (for Audio soundObject and audio layer AudioClips) but for now implement the same approach as found in Java Blue. Do a detailed review of each type of bar renderer and make a plan for implementing all of them."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Java-Style Generic ScoreObject Bars (Priority: P1)

As a composer working in the Score editor, I need ordinary score objects to render with the same visual language as Java Blue so I can recognize object type, selection, color, label, and repeat structure at timeline scale.

**Why this priority**: Most score objects use Java Blue's generic, comment, or letter renderer family. Matching these first gives the score timeline recognizable parity across the widest set of objects.

**Independent Test**: Load a score containing `GenericScore`, `PatternObject`, `NotationObject`, `Comment`, `LineObject`, `ZakLineObject`, `External`, `Instance`, `PythonObject`, `JavaScriptObject`, `JMask`, `Sound`, `ObjectBuilder`, and `TrackerObject`; verify each bar uses the expected Java-style base renderer, label behavior, selection state, and letter badge where applicable.

**Acceptance Scenarios**:

1. **Given** a non-selected generic score object with a dark background color, **When** the Score timeline renders it, **Then** the bar uses the object's color, readable light text, Java-style border, and object-name label.
2. **Given** a generic score object with `REPEAT` or `REPEAT_CLASSIC` behavior and a repeat point, **When** the bar renders, **Then** repeat-point markers are visible at Java-compatible positions.
3. **Given** a selected score object, **When** the bar renders, **Then** it uses Java Blue's brightened selected fill, white border, and dark selected header band.
4. **Given** a `Comment`, **When** it renders, **Then** it uses the comment-specific italic text treatment while preserving the shared selected and border behavior.
5. **Given** any letter-rendered score object, **When** it renders, **Then** it shows the correct 9x9-style letter badge at the left and offsets the label so it does not collide with the badge.

---

### User Story 2 - See PianoRoll Note Thumbnails In Bars (Priority: P1)

As a composer arranging PianoRoll objects, I need the timeline bar to show Java Blue's compact note preview so pitch and rhythmic density are visible without opening the object editor.

**Why this priority**: `PianoRollView` is the only Java score-object bar with internal musical thumbnail drawing. It needs a dedicated parity slice rather than falling back to the generic label-only bar.

**Independent Test**: Load PianoRoll objects with notes under `SCALE`, `REPEAT`, `REPEAT_CLASSIC`, and `NONE` time behavior; verify note rectangles appear under the bar label area with Java-compatible vertical scaling, note heights, x-position behavior, and repeat handling.

**Acceptance Scenarios**:

1. **Given** a PianoRoll with notes and a layer taller than the default header band, **When** the bar renders, **Then** compact note rectangles appear below the title band.
2. **Given** a PianoRoll with no notes or an object row too short for note drawing, **When** the bar renders, **Then** it falls back to the generic renderer without thumbnail artifacts.
3. **Given** a PianoRoll using `REPEAT`, `REPEAT_CLASSIC`, `SCALE`, or `NONE`, **When** the bar renders, **Then** its thumbnail x positions and clipping follow the Java `PianoRollView` rules for that behavior.

---

### User Story 3 - See Java-Style Waveform Bars For Audio Objects (Priority: P1)

As a composer arranging audio-backed score objects and audio layer clips, I need waveform bars, fade overlays, and file offset behavior to match Java Blue's current approach until the planned future waveform redesign happens.

**Why this priority**: Audio bars are visually distinct and central to score editing. The user explicitly requested current Java waveform parity for now, not the future redesign.

**Independent Test**: Load `AudioFile`, `FrozenSoundObject`, and audio-layer `AudioClip` objects with available and unavailable audio files; verify each renders the Java-style filled bar, waveform body, selection band, labels, fade overlays, looping/file-start behavior, and safe missing-waveform fallback.

**Acceptance Scenarios**:

1. **Given** an `AudioFile` sound object with a valid file path, **When** the score-object bar renders, **Then** it fills the object color and draws the waveform using the Java-style cache and color contrast rules.
2. **Given** a `FrozenSoundObject`, **When** the bar renders, **Then** it uses the Java frozen color, waveform, and shaded extended-duration area based on original-to-frozen duration ratio.
3. **Given** an audio-layer `AudioClip`, **When** the clip bar renders, **Then** it uses translucent object color, waveform with `fileStartTime` offset and looping behavior, fade polygons, label, border, and selected state matching Java Blue.
4. **Given** waveform data is still loading or unavailable, **When** the bar renders, **Then** the rest of the bar remains stable and a later waveform update can repaint without changing canonical project data.

---

### User Story 4 - Keep Renderer Data Canonical And Testable (Priority: P2)

As a maintainer, I need score-object bar rendering to be driven by typed project snapshots and renderer-owned drawing helpers so UI parity does not leak new persistence into `@blue/data` or duplicate score-object editor logic.

**Why this priority**: The timeline is renderer-owned, but its inputs must remain canonical and testable. Renderer-only state or ad hoc XML parsing would make parity brittle.

**Independent Test**: Run contract tests for score-row snapshot payloads and renderer tests for each renderer family; confirm no new Node or UI dependencies are introduced into `@blue/data`.

**Acceptance Scenarios**:

1. **Given** a project snapshot is created, **When** it includes score-row objects, **Then** each object carries enough renderer metadata to choose and draw the correct Java parity renderer.
2. **Given** the renderer receives an unsupported or not-yet-ported Java-only type, **When** it draws the timeline, **Then** it falls back deliberately with visible generic behavior and documented unsupported coverage.
3. **Given** score-object properties change and the project snapshot refreshes, **When** bars re-render, **Then** labels, colors, repeat markers, waveform metadata, and PianoRoll thumbnails reflect the refreshed canonical data.

### Edge Cases

- Row height below 20px must suppress text labels like Java Blue.
- Multi-line object names split on the Java escaped newline marker must draw each line at layer-height intervals when space allows.
- Bright background colors must use dark text; dark background colors must use light text.
- Selected bars must remain legible even if the object color is already very bright.
- Repeat marker drawing must avoid infinite loops for missing, zero, negative, or non-finite repeat points.
- Very narrow objects must keep stable dimensions and clipped content without resizing the timeline.
- Letter badges must not obscure labels for narrow bars.
- PianoRoll thumbnails must handle empty notes, a single-pitch range, zero/negative durations, and rows too short for note drawing.
- Audio files can be missing, moved, loading, unsupported, or have no decodable waveform data.
- AudioClip fade lengths can be zero, longer than available duration, or overlap; renderer output must clamp visually without mutating canonical data.
- AudioClip file offsets must reflect looping and non-looping Java behavior where current TypeScript data exposes enough metadata.
- `ClojureObjectView` exists in Java but `ClojureObject` is not currently a registered TypeScript sound-object type; this spec must document and test the fallback instead of silently claiming support.
- Planned future waveform rendering changes are out of scope; this slice intentionally implements the current Java-style waveform cache/drawing approach.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The implementation MUST review Java Blue's current score-object view sources before coding, including `SoundObjectView`, `GenericView`, `CommentView`, `LetterRendererView`, every `*View` registered with `@SoundObjectViewPlugin`, `ClojureObjectView`, `AudioClipPanel`, `FadeHandle`, `FadeRenderer`, and `AudioLayersPanel`.
- **FR-002**: The renderer MUST replace the current one-size score-object bar drawing with a registry or equivalent dispatch that selects the correct renderer family from `ScoreRowObjectSnapshot.objectType` and typed renderer metadata.
- **FR-003**: Shared score-row snapshots MUST include typed renderer metadata for common bar fields: object type, display name, start, duration, background color, selection identity, time behavior, repeat point, and renderer family.
- **FR-004**: The generic renderer MUST match Java `GenericView` behavior for gradient-style fill, selected fill, selected header band, border, readable text, label offset, multi-line labels, height gating, and repeat-point markers.
- **FR-005**: The generic renderer MUST cover Java `GenericViewable` types present in the TypeScript port, including `GenericScore`, `PatternObject`, and `NotationObject`.
- **FR-006**: The comment renderer MUST match Java `CommentView`, including italic label treatment and shared fill, selection, and border behavior.
- **FR-007**: The letter renderer base MUST match Java `LetterRendererView`, including the small badge geometry, selected and normal badge colors, mini font scale, and label offset.
- **FR-008**: Letter renderer mappings MUST be implemented for TypeScript-supported types matching Java plugins: `LineObject`/`ZakLineObject` -> `L`, `External` -> `E`, `Instance` -> `I`, `PythonObject` -> `P`, `JavaScriptObject` -> `J`, `JMask` -> `J`, `Sound` -> `S`, `ObjectBuilder` -> `O` when data support exists, and `TrackerObject` -> `T`.
- **FR-009**: Java's `ClojureObjectView` -> `C` mapping MUST be recorded as a deferred or fallback mapping unless `ClojureObject` is ported in the same implementation; the task list must not imply unsupported Clojure data parity.
- **FR-010**: PianoRoll bars MUST extend the generic renderer and then draw Java `PianoRollView` note thumbnails below the title band when row height and note data allow.
- **FR-011**: PianoRoll thumbnail metadata MUST include note octave, scale degree, start, duration, time behavior, repeat point, note duration range, and scale-degree count needed to reproduce Java's `SCALE`, `REPEAT`, `REPEAT_CLASSIC`, and `NONE` drawing branches.
- **FR-012**: AudioFile bars MUST match Java `AudioFileView` current behavior: object-color fill, contrast waveform color, waveform offset origin, selected header band, border, and label.
- **FR-013**: FrozenSoundObject bars MUST match Java `FrozenSoundObjectView` current behavior: fixed frozen normal color, selected state, waveform, label, border, and shaded area for duration beyond the frozen source object's original duration when metadata is available.
- **FR-014**: AudioClip bars MUST match Java `AudioClipPanel` current behavior: translucent background, waveform with `fileStartTime` offset and looping flag, selected state, label, border, fade-in/fade-out polygons, and fade-type curves from Java `FadeRenderer`.
- **FR-015**: Audio fade curve calculations MUST be ported as pure renderer/app helpers with regression tests for `LINEAR`, `CONSTANT_POWER`, `SYMMETRIC`, `FAST`, and `SLOW` fade types.
- **FR-016**: Waveform data retrieval and caching MUST live outside `@blue/data`; `@blue/data` must remain UI-free, browser-safe, and free of Node built-ins.
- **FR-017**: Waveform rendering MUST use the current Java-style cache-by-file-and-pixel-scale approach for this slice and MUST leave future waveform-rendering redesigns out of scope.
- **FR-018**: Renderer tests MUST cover each renderer family and each Java-registered type mapping, including explicit fallback coverage for Clojure or other unsupported Java-only types.
- **FR-019**: Contract tests MUST prove snapshot creation provides all renderer metadata for generic, comment, letter, PianoRoll, AudioFile, FrozenSoundObject, and AudioClip bars without parsing serialized XML in React components.
- **FR-020**: Implementation MUST preserve existing score selection, drag, resize, context menu, copy/paste, and nested-score navigation behavior while changing only bar drawing and renderer metadata.

### Key Entities *(include if feature involves data)*

- **Score Object Bar Renderer**: Renderer family responsible for drawing one timeline bar from snapshot data.
- **Score Row Object Snapshot**: Shared renderer input for one timeline item, extended with typed bar-renderer metadata.
- **Generic Renderer Payload**: Common renderer fields for fill, label, selected state, and repeat markers.
- **Letter Renderer Mapping**: Association between score-object type and Java letter badge.
- **PianoRoll Thumbnail Payload**: Compact note and timing summary needed to draw Java-style note rectangles.
- **Audio Waveform Payload**: Audio file identity and playback offset metadata used by waveform cache and drawing helpers.
- **AudioClip Fade Payload**: Fade duration and fade type metadata used to draw Java-compatible fade polygons.
- **Waveform Cache Entry**: Renderer/app-owned waveform summary keyed by resolved file path and pixel scale.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can load a project containing every TypeScript-supported Java view mapping and identify the same generic/comment/letter renderer family Java Blue would use.
- **SC-002**: A reviewer can visually compare PianoRoll bars with Java Blue and confirm note thumbnails appear only when Java would draw them and follow the same time-behavior branches.
- **SC-003**: A reviewer can visually compare AudioFile, FrozenSoundObject, and AudioClip bars with Java Blue and confirm current waveform, selected-state, label, border, and fade behavior is represented.
- **SC-004**: Focused renderer and contract tests cover every renderer family, each letter mapping, PianoRoll thumbnail behavior, fade curve behavior, missing-waveform fallback, and unsupported Clojure fallback.
- **SC-005**: Existing score editing interactions still pass their focused tests after renderer changes.

## Assumptions

- The TypeScript app should implement renderer parity only for score-object types currently ported or intentionally supported by the TypeScript data model.
- `ObjectBuilder` and `ClojureObject` may require fallback treatment if their data classes are not available in `@blue/data` at implementation time.
- Waveform decoding and file access belong in `@blue/app` main/preload/renderer infrastructure, not in `@blue/data`.
- This spec intentionally avoids the planned future waveform redesign; any new waveform helper should be replaceable later without changing canonical project data.
- Canvas, SVG, or DOM/CSS rendering are acceptable if tests verify Java-compatible output semantics and existing interactions remain intact.
