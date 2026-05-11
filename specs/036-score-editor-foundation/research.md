# Research: Score Editor Planning

## Decision: Split score work into three specs instead of one large score-editor spec

**Rationale**: Java Blue separates the score feature into a large main shell (`ScoreTopComponent`), a plugin-driven auxiliary editor (`ScoreObjectEditorTopComponent`), and a shared properties surface (`SoundObjectPropertiesTopComponent`). The TypeScript port is missing all three, plus the score document bridge they depend on. Treating that as one implementation spec would hide critical dependencies and make validation too coarse.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/ScoreTopComponent.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/ScoreObjectEditorTopComponent.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/SoundObjectPropertiesTopComponent.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`

**Alternatives considered**:

- One full score-editor spec: rejected because it would combine foundational bridge work, the main shell, and every object editor into one large, hard-to-validate slice.
- A pure `@blue/data` pre-spec only for score state: rejected because the visible score shell and the score bridge are tightly coupled and should land together as the first usable milestone.

## Decision: Start with the score document bridge and shell before ScoreObject editor surfaces

**Rationale**: The current renderer snapshot contains no score graph at all. It only exposes transport metadata such as tempo map, meter map, render start and end, and SMPTE value. Without a typed score snapshot and patch path, the renderer cannot render or mutate the score safely.

**Current gap audit**:

- `packages/blue-app/src/shared/project-editor.ts` has no score graph snapshot or score patch types.
- `packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx` still routes `ScoreTopComponent` to a placeholder panel.
- `packages/blue-data/src/time/time-state.ts` currently preserves only SMPTE frame rate, while Java `TimeState` also stores snap state, zoom, primary and secondary ruler display, and row visibility.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/DockviewPanel.tsx`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/time/time-state.ts`
- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/score/TimeState.java`

**Alternatives considered**:

- Build the score shell from renderer-local `@blue/data` objects: rejected because it would bypass the current canonical-document ownership model already used by the other editors.

## Decision: Extend the existing project snapshot and patch bridge instead of adding a score-only IPC path

**Rationale**: The app already uses `ProjectEditorSnapshot` and `ProjectDocumentPatch` as the canonical renderer-to-main seam for orchestra, mixer, Blue Live, MIDI Input, tables, and project properties. The score shell should follow the same ownership model so score state stays consistent with save/reopen, playback, and later auxiliary editor work.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/project-editor.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/project-store.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/main/main.ts`

**Alternatives considered**:

- A dedicated score-only IPC surface outside `ProjectDocumentPatch`: rejected because it would split canonical project ownership and duplicate optimistic-update logic already solved elsewhere.

## Decision: Mirror Java's layer-group provider split in the first shell spec

**Rationale**: Java Blue renders the score through provider-style layer-group surfaces instead of one monolithic row component. That structure maps well to the current TypeScript data model, which already distinguishes `PolyObject`, audio, and pattern layer groups.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/LayerGroupUIProvider.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/PolyObjectUIProvider.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/AudioLayerGroupUIProvider.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-patterns-ui/src/main/java/blue/score/layers/patterns/ui/PatternsLayerGroupUIProvider.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score.ts`

**Alternatives considered**:

- Flatten all layer-group rendering into one React component: rejected because it would make later audio and pattern parity harder to stage independently.

## Decision: Keep nested score-path session state renderer-local rather than persisting it in the project document

**Rationale**: Java stores nested score-path and scroll position as editor-session state in `ScoreController` and `ScorePath`, not in the saved project. The Electron port should do the same: the canonical project keeps score content and time state, while the currently open nested path and its scroll restoration stay local to the renderer score panel.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/ScoreController.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/ScorePath.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/stores/workbench-store.ts`

**Alternatives considered**:

- Save the active nested path into the project XML or shared patch contract: rejected because it would persist editor-session state that Java treats as transient.

## Decision: Use minimal structured display snapshots for the shell and defer editor-depth object payloads to later specs

**Rationale**: The first score spec needs enough structured data to render timeline geometry, names, colors, row grouping, and container navigation. It does not need the full editor payloads required by Spec 037. Keeping the first snapshot minimal reduces bridge size and keeps 036 focused on the shell milestone.

**Sources Reviewed**:

- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/score.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/poly-object.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-layer-group.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/patterns/patterns-layer-group.ts`

**Alternatives considered**:

- Serialize full `@blue/data` score objects into the renderer snapshot immediately: rejected because the first shell only needs display and navigation fields, and full editor payloads would increase scope before the auxiliary editor spec.

## Decision: Put ScoreObject properties and type-specific editors into a second score spec

**Rationale**: Java clearly treats selection-based object editing as auxiliary surfaces, not part of the main score shell. The current workbench layout already reserves `SoundObjectPropertiesTopComponent` and `ScoreObjectEditorTopComponent`, so they can follow the shell once selection and the score bridge exist.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/SoundObjectPropertiesTopComponent.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/ScoreObjectEditorTopComponent.java`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/shared/workbench-menu.ts`
- `/Users/stevenyi/work/blue-electron/packages/blue-app/src/renderer/components/workbench/auxiliary-layout.ts`

**Alternatives considered**:

- Fold the properties panel into the shell spec: rejected because the shell needs to land first and because the properties and type-specific editor surfaces are large enough to validate independently.

## Decision: Treat direct manipulation parity as a third score follow-up spec

**Rationale**: Java's score interaction layer includes significant mouse, keyboard, drag-drop, clipboard, manager-dialog, and navigator behavior. Those flows are important, but they depend on a stable shell and stable selection-aware editor surfaces. Splitting them keeps the earlier specs testable.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/ScoreMouseListener.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/mouse/ScoreObjectSelectionListener.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/manager/ScoreManagerDialog.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/ScoreNavigatorDialog.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/ui/core/score/layers/soundObject/ScoreTimelineDropTargetListener.java`
- `/Users/stevenyi/work/nbprojects/blue/blue-score-layers-audio-ui/src/main/java/blue/score/layers/audio/ui/AudioLayersDropTargetListener.java`

**Alternatives considered**:

- Include drag, clipboard, and manager-dialog parity in the first shell spec: rejected because it would balloon the first milestone and block quicker validation of the bridge and shell layout.

## Decision: Limit the second spec's required editor inventory to score-object types already present in the TypeScript port, and track Java-only object gaps explicitly

**Rationale**: Java registers more score-object editors than the TypeScript port can currently support one-for-one. The TypeScript data layer already includes `GenericScore`, `PolyObject`, `PythonObject`, `JavaScriptObject`, `Comment`, `AudioFile`, `Sound`, `External`, `Instance`, `LineObject`, `ZakLineObject`, `PatternObject`, `PianoRoll`, `JMask`, `TrackerObject`, `NotationObject`, `FrozenSoundObject`, and `AudioClip`, but Java also has object types such as `ObjectBuilder` and module-specific objects that are not yet first-class in `@blue/data`.

**Sources Reviewed**:

- `/Users/stevenyi/work/nbprojects/blue/blue-core/src/main/java/blue/soundObject/`
- `/Users/stevenyi/work/nbprojects/blue/blue-ui-core/src/main/java/blue/soundObject/editor/`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/sound-objects/`
- `/Users/stevenyi/work/blue-electron/packages/blue-data/src/score/audio/audio-clip.ts`

**Alternatives considered**:

- Promise full Java editor parity in one pass regardless of model availability: rejected because it would hide separate data-parity work behind the score-editor scope.

## Planned Spec Split

- `036-score-editor-foundation`
  - score graph snapshot and patch bridge
  - score `TimeState` parity needed by the shell
  - Java-style `ScoreTopComponent` shell
  - mixed layer-group rendering
  - rulers, row visibility, zoom, snap, nested score-path navigation
- `037-score-object-editor-parity`
  - shared ScoreObject properties surface
  - plugin-style ScoreObject editor registry
  - editors for TypeScript-supported score-object types plus `AudioClip`
  - library and `Instance` editing behavior
- `038-score-object-editor-tier1-parity`
  - `External`, `PolyObject`, and `TrackerObject` follow-up editors
  - moderate-gap auxiliary editor parity built on the Spec 037 shell
- `039-sound-score-object-editor`
  - `Sound` tabbed editor parity, BSB reuse, automation workflow, comments, and test-preview work
- `040-pianoroll-score-object-editor`
  - `PianoRoll` note-canvas, field-editor, property, and shortcut-workflow parity
- `041-jmask-score-object-editor`
  - `JMask` parameter-stack, generator-factory, optional-section, and preview-boundary work
- `042-score-editor-management-navigation`
  - shell-level `Manage` workflow and manager dialogs
  - marker and navigator workflows plus playback-follow polish
  - remaining shell-level parity gaps after the editor specs land
