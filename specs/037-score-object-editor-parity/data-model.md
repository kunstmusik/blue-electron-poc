# Data Model: Score Object Editor Parity

## Entity: ScoreObjectLocationRef

- **Purpose**: Canonical path from the root score graph to a selected timeline object, including nested `PolyObject` traversal.
- **Fields**:
  - `rootGroupIndex: number`
  - `containerPath: Array<{ layerIndex: number; objectIndex: number }>`
  - `layerIndex: number`
  - `objectIndex: number`
- **Relationships**:
  - Used by score shell row snapshots and by canonical patch application helpers.
  - Can identify either a direct timeline object or the source `Instance` location that routed editing to a library object.
- **Validation**:
  - `rootGroupIndex >= 0`
  - every `containerPath` segment must resolve to a `PolyObject`
  - `layerIndex` and `objectIndex` must resolve within the selected container at patch-application time
- **Persistence**:
  - Session-only snapshot or IPC metadata; never written to project XML.

## Entity: ScoreObjectLibraryEntryRef

- **Purpose**: Stable runtime identity for a `SoundObjectLibrary` entry that may be edited through the auxiliary panels.
- **Fields**:
  - `libraryId: string`
  - `libraryIndex: number`
  - `objectType: string`
- **Relationships**:
  - Owned by `SoundObjectLibrary`.
  - Referenced by `ScoreObjectEditorTargetSnapshot` when the resolved editor target lives in the library.
- **Validation**:
  - `libraryId` must remain stable for the current project session.
  - `libraryIndex` must match the current library ordering when the target is resolved.

## Entity: ScoreObjectEditorTargetSnapshot

- **Purpose**: Renderer-facing description of the exact canonical object the auxiliary panels should edit.
- **Fields**:
  - `selectionId: string`
  - `selectedObjectType: string`
  - `editorObjectType: string`
  - `ownerKind: 'timeline' | 'library'`
  - `displayContext: 'timeline' | 'library' | 'instance'`
  - `location?: ScoreObjectLocationRef`
  - `sourceInstanceLocation?: ScoreObjectLocationRef`
  - `library?: ScoreObjectLibraryEntryRef`
  - `supportsTimeBehavior: boolean`
  - `supportsRepeatPoint: boolean`
  - `supportsNoteProcessorChain: boolean`
- **Relationships**:
  - Embedded into each visible `ScoreRowObjectSnapshot` so the renderer can map selection IDs to canonical targets.
  - Used by the on-demand editor-document fetch path.
- **Validation**:
  - `selectionId` must remain stable across score-shell rerenders for the same canonical object while the structure is unchanged.
  - `library` is required when `ownerKind === 'library'`.
  - `sourceInstanceLocation` is required when `displayContext === 'instance'`.

## Entity: TimeValueSnapshot

- **Purpose**: Shared representation for editable time values in the properties panel.
- **Fields**:
  - `value: number`
  - `timeBase: string`
  - `displayText: string`
- **Relationships**:
  - Used for `startTime`, `subjectiveDuration`, and `repeatPoint`.
- **Validation**:
  - `timeBase` must map to a supported `TimeBase` name.
  - `value` must be finite.

## Entity: NoteProcessorEntrySnapshot

- **Purpose**: One renderer-facing entry within a note-processor chain.
- **Fields**:
  - `processorType: string`
  - `displayName: string`
  - `supported: boolean`
  - `summary: string`
  - `serializedXml: string`
- **Relationships**:
  - Nested inside `NoteProcessorChainSnapshot`.
  - Derived from typed `NoteProcessor` instances and `UnsupportedProcessor` fallbacks.
- **Validation**:
  - `serializedXml` must round-trip back to the same processor when possible.
  - unsupported processors must preserve their original XML and type name.

## Entity: NoteProcessorChainSnapshot

- **Purpose**: Typed renderer-facing view of a score object's note-processor chain.
- **Fields**:
  - `processors: NoteProcessorEntrySnapshot[]`
  - `hasUnsupportedProcessors: boolean`
- **Relationships**:
  - Present only when the resolved editor target is a `SoundObject` that supports note processors.
- **Validation**:
  - processor order must match the canonical chain order
  - `hasUnsupportedProcessors` must reflect the current processor list

## Entity: SharedScoreObjectPropertiesSnapshot

- **Purpose**: Shared properties document for the ScoreObject properties panel.
- **Fields**:
  - `target: ScoreObjectEditorTargetSnapshot`
  - `name: string`
  - `startTime: TimeValueSnapshot`
  - `subjectiveDuration: TimeValueSnapshot`
  - `endTimeDisplay: string`
  - `backgroundColor: number`
  - `timeBehavior?: string`
  - `repeatPoint?: TimeValueSnapshot | null`
  - `noteProcessorChain?: NoteProcessorChainSnapshot | null`
- **Relationships**:
  - Returned inside `ScoreObjectEditorDocumentSnapshot`.
  - Mutated through shared score patch variants.
- **Validation**:
  - `timeBehavior`, `repeatPoint`, and `noteProcessorChain` must only be present when the resolved target supports them.
  - `endTimeDisplay` is derived read-only display state, not a patchable field.

## Entity: ScoreObjectEditorDocumentSnapshot

- **Purpose**: On-demand editor document for the active selection shown in the auxiliary panels.
- **Fields**:
  - `target: ScoreObjectEditorTargetSnapshot`
  - `shared: SharedScoreObjectPropertiesSnapshot`
  - `editor: TypeSpecificScoreObjectEditorSnapshot`
- **Relationships**:
  - Loaded through `window.blueAPI.getScoreObjectEditorDocument(...)`.
  - Refreshed when the active selection changes or after score-object patch application succeeds.
- **Validation**:
  - exactly one document exists per uniquely editable selection
  - `editor.kind` must match the resolved `editorObjectType` family

## Entity: TypeSpecificScoreObjectEditorSnapshot

- **Purpose**: Family-based payload for the `ScoreObjectEditorTopComponent` registry.
- **Variants**:
  - `CodeBackedScoreObjectEditorSnapshot`
  - `AudioClipScoreObjectEditorSnapshot`
  - `FileBackedScoreObjectEditorSnapshot`
  - `StructuredScoreObjectEditorSnapshot`
  - `FallbackScoreObjectEditorSnapshot`
- **Representative fields**:
  - `CodeBacked`: `kind`, `syntax`, `text`, `auxiliaryFlags`
  - `AudioClip`: `kind`, `audioFile`, `numChannels`, `audioDuration`, `fileStartTime`, `fadeIn`, `fadeInType`, `fadeOut`, `fadeOutType`, `looping`
  - `FileBacked`: `kind`, `filePath`, `auxiliaryFlags`
  - `Structured`: `kind`, `editorFamily`, `payloadSummary`, `payload`
  - `Fallback`: `kind`, `reason`, `message`
- **Relationships**:
  - Selected by the static renderer registry.
  - Updated through `ScorePatch.updateTypeSpecificEditor`.
- **Validation**:
  - unknown or unsupported families must resolve to `Fallback`, not renderer crashes
  - `payload` contents remain specific to the resolved editor family

## Entity: ScorePatch

- **Purpose**: Canonical mutation contract for score object auxiliary editing.
- **Variants**:
  - `updateTimeState`
  - `updateSharedProperties`
  - `updateSoundObjectBehavior`
  - `replaceNoteProcessorChain`
  - `updateTypeSpecificEditor`
- **Relationships**:
  - Nested in `ProjectDocumentPatch.score`.
  - Applied by shared helpers against canonical timeline or library-owned score objects.
- **Validation**:
  - target must resolve at patch-application time or return a deliberate removed-target fallback
  - empty patch payloads are invalid
  - time, color, time-behavior, and note-processor edits must validate before mutation

## State Flows

### Selection To Auxiliary Document Flow

1. The score shell emits a stable `selectionId` from the selected row item.
2. The renderer resolves the corresponding `ScoreObjectEditorTargetSnapshot` from the current score snapshot.
3. The auxiliary panel calls `window.blueAPI.getScoreObjectEditorDocument({ target })`.
4. Main resolves the canonical timeline or library object, builds `SharedScoreObjectPropertiesSnapshot`, builds the type-specific editor snapshot, and returns one `ScoreObjectEditorDocumentSnapshot`.

### Shared Properties Edit Flow

1. User edits name, start time, duration, color, time behavior, repeat point, or note processor chain.
2. Renderer converts the edit into one `ProjectDocumentPatch.score` variant.
3. Shared helpers resolve the same target in canonical `BlueData` and mutate it.
4. Renderer refreshes the auxiliary document and the score shell against the updated canonical state.

### Type-Specific Editor Flow

1. The editor registry chooses a family-specific React editor from `editor.kind`.
2. User edits type-specific fields.
3. Renderer dispatches `ScorePatch.updateTypeSpecificEditor`.
4. Shared helpers validate the family payload against the resolved object type, mutate the canonical model, and refresh the active document.

### Instance Or Library-Backed Flow

1. Selection resolves to an `Instance` or a score object already owned by `SoundObjectLibrary`.
2. Target resolution reroutes the editor target to the library object while retaining `sourceInstanceLocation` or library context metadata.
3. Panels display library-context messaging while editing the underlying library object.
4. Timeline objects using that library entry refresh against the canonical library-backed value.

### Removed Or Unsupported Target Flow

1. Selection changes, the target is removed, or the type is unported.
2. Canonical resolution fails or resolves to an explicitly unsupported type.
3. The auxiliary panel receives `FallbackScoreObjectEditorSnapshot` or an empty-state reason.
4. The renderer clears stale controls and keeps the score shell stable.