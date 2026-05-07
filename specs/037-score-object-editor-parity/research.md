# Research: Score Object Editor Parity

## Decision: Add stable editor-target descriptors to score row snapshots and load full editor documents on demand

**Rationale**: The current score shell snapshot only carries display geometry and renderer-generated `objectId` values such as `sobj-0-0`. That is sufficient for local timeline selection, but not for canonical auxiliary editing, `Instance` rerouting, or library-backed objects. At the same time, serializing full code or structured editor payloads for every visible score object on every project snapshot would create unnecessary churn. Spec 037 should therefore extend row snapshots with stable editor-target descriptors and use a dedicated read path to fetch the active editor document only when the selection changes.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/score-selection-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/score/layer-groups/ScoreTimeCanvas.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/preload/preload.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`

**Alternatives considered**:

- Put full editor payloads for every visible object into `ProjectEditorSnapshot`: rejected because code-backed objects and structured editor payloads would make routine score refreshes too heavy.
- Keep raw renderer-only `objectId` strings and resolve by layer position only inside the renderer: rejected because canonical `Instance` and library routing must remain anchored in main-process `BlueData`.

## Decision: Preserve stable runtime library identity in `SoundObjectLibrary`

**Rationale**: Java's auxiliary score editor reroutes `Instance` and library-backed score objects to the underlying library object. The current TypeScript `SoundObjectLibrary` stores only an array of objects and does not expose stable runtime IDs, containment, or reverse lookup helpers. Spec 037 should add or preserve stable library entry identity so the renderer and shared helpers can refer to library-backed objects without relying on fragile array positions or reference equality.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/blue-data.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/sound-object-library.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/instance.ts`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/ScoreObjectEditorTopComponent.java`

**Alternatives considered**:

- Recompute library ownership from object reference equality and array index whenever a panel needs it: rejected because it obscures canonical identity and does not map cleanly to `Instance.libraryId`.

## Decision: Keep the auxiliary surfaces in Dockview and replace the existing placeholders in place

**Rationale**: The workbench already reserves `SoundObjectPropertiesTopComponent` in the properties auxiliary group and `ScoreObjectEditorTopComponent` in the output auxiliary group. Java Blue also treats these as always-available top components rather than one-off dialogs. Spec 037 should therefore replace the current placeholder rendering in Dockview rather than invent a new windowing model.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/SoundObjectPropertiesTopComponent.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/ScoreObjectEditorTopComponent.java`

**Alternatives considered**:

- Open score-object editors in separate windows like mixer effect editors: rejected because Java parity and the current workbench layout already reserve auxiliary panel slots for these surfaces.

## Decision: Mirror Java's plugin-style editor selection with a static React registry keyed by editor family

**Rationale**: Java discovers editor plugins through `ScoreObjectEditorPlugin` registrations and chooses the best match for the resolved score-object type. In Electron, dynamic plugin loading is unnecessary, but the routing model is still valuable. A static registry keyed by resolved object type and editor family preserves the same behavior while keeping the renderer implementation straightforward and testable.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/ScoreObjectEditorTopComponent.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/GenericScoreEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/PythonEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/JavaScriptObjectEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/AudioFileEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/LineEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/ZakLineEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/PatternEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/PianoRollEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/JMaskEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/TrackerEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/NotationEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/FrozenSoundObjectEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/InstanceEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/ObjectBuilderEditor.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/AudioClipEditor.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/panels/editors/SelectedCodeEditor.tsx`

**Alternatives considered**:

- One large switch statement embedded directly in the top-level panel component: rejected because it scales poorly across the supported score-object families and makes fallback behavior harder to reason about.

## Decision: Reuse editor-family shells where the TypeScript models already share common field shapes

**Rationale**: The TypeScript port already groups many score-object classes around shared field patterns: code-backed objects with a single main text body, file-backed objects with path or fade settings, structured grid or pattern objects, and shared `AbstractSoundObject` properties. Reusing family-level React shells will keep the implementation tractable while still honoring the supported-type list in the spec.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/abstract-sound-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/generic-score.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/python-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/javascript-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/comment.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/audio-file.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/external.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/pattern-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/piano-roll.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/j-mask.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/tracker-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/notation-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/line-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/zak-line-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/frozen-sound-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-clip.ts`

**Alternatives considered**:

- Build a fully bespoke renderer component for every supported type from the outset: rejected because several types share enough editable structure to justify family-level shells, while the more specialized surfaces can still branch inside those shells.

## Decision: Keep the shared properties surface focused on shared fields, and keep deep content editing in the type-specific editor panel

**Rationale**: Java Blue splits the score-object workflow into a compact properties surface for shared ScoreObject fields and a separate editor top component for object-specific content. The Electron port should keep the same boundary: the properties panel owns name, time, color, time behavior, repeat point, and note processor chain, while deeper content editing belongs to the score-object editor registry.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/SoundObjectPropertiesTopComponent.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/ScoreObjectEditorTopComponent.java`

**Alternatives considered**:

- Merge shared properties and type-specific content into one large inspector: rejected because it muddies the Java parity target and makes unsupported or multi-selection fallback states harder to present cleanly.

## Decision: Represent note-processor chains as typed snapshots with per-processor support metadata

**Rationale**: FR-003 requires the properties surface to support note-processor-chain behavior where it applies. The TypeScript port already has a typed `NoteProcessorChain` model, individual processor classes, and an `UnsupportedProcessor` fallback that preserves raw XML. Spec 037 should surface note-processor chains as typed editor data with per-processor support metadata instead of dropping to a raw XML textarea.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/note-processor-chain-map.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/note-processors/unsupported-processor.ts`

**Alternatives considered**:

- Treat note processor chains as opaque XML blobs in the renderer: rejected because the data layer already exposes typed processor identity and unsupported-processor preservation, which is a better fit for a user-facing properties workflow.

## Decision: Keep later score-object follow-up and shell management/navigation workflows out of Spec 037

**Rationale**: Spec 037 should stay focused on the first auxiliary editor shell. The remaining score-object editor work now lives in Specs 038 and 039, while the shell management/navigation follow-up now lives in Spec 040.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/specs/038-score-object-editor-tier1-parity/spec.md`
- `/Users/stevenyi/work/blue-electron/specs/039-score-object-editor-tier2-parity/spec.md`
- `/Users/stevenyi/work/blue-electron/specs/040-score-editor-management-navigation/spec.md`
- `/Users/stevenyi/work/blue-electron/STATUS.md`

**Alternatives considered**:

- Fold the remaining editor and shell follow-up work into this slice: rejected because it would blur the boundary between the auxiliary editor foundation and the later grouped follow-up specs.

## Planned Editor Families

- **Code-backed editors**: `GenericScore`, `PythonObject`, `JavaScriptObject`, `Comment`, and `External` should reuse a shared CodeMirror-backed editor shell.
- **File or clip editors**: `AudioClip`, `AudioFile`, and `FrozenSoundObject` need file-oriented field groups with fade or range metadata where applicable.
- **Reference or routed editors**: `Instance` should reroute to its underlying target while exposing library-editing context; `Sound` should reuse the existing BSB-oriented editor surface rather than fall back to plain text.
- **Structured editors**: `PolyObject`, `PatternObject`, `PianoRoll`, `TrackerObject`, `NotationObject`, `LineObject`, `ZakLineObject`, and `JMask` need a family-level registry entry plus per-type content handling.
- **Explicit fallbacks**: Java-only objects such as `ObjectBuilder` and any still-thin TypeScript models such as `CSDSoundObject` must return deliberate unsupported states until dedicated model or UI work exists.