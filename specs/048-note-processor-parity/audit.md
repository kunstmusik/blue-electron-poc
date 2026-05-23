# Note Processor Parity Audit

**Feature**: 048-note-processor-parity
**Audited**: 2026-05-23
**Scope**: Java Blue NoteProcessor and NoteProcessorChain parity across data model, render application points, ScoreObject Properties UI, layer/layer-group/root UI, and tests.

## Executive Summary

The TypeScript port has useful foundations from Specs 030 and 037, but it is not at Java Blue parity. The largest gaps are an erroneous `Code` processor shim, missing root-level chain processing during score generation, no functional chain editor UI, no layer/layer-group/root chain edit workflow, and no comprehensive tests proving every in-scope processor works through object, layer, layer-group, and root application points. `PythonProcessor` remains a known gap, but Jython/Python parity is explicitly deferred from this implementation slice.

## Java Blue Reference Baseline

Java Blue exposes note processors through `@NoteProcessorPlugin` annotations in `blue-core/src/main/java/blue/noteProcessor`:

| Java processor | Status expected in Electron parity |
| --- | --- |
| `AddProcessor` | First-class processor |
| `PchAddProcessor` | First-class processor |
| `MultiplyProcessor` | First-class processor |
| `RandomAddProcessor` | First-class processor |
| `RandomMultiplyProcessor` | First-class processor |
| `SubListProcessor` | First-class processor |
| `RotateProcessor` | First-class processor |
| `RetrogradeProcessor` | First-class processor |
| `InversionProcessor` | First-class processor |
| `PchInversionProcessor` | First-class processor |
| `EqualsProcessor` | First-class processor |
| `SwitchProcessor` | First-class processor |
| `TimeWarpProcessor` | First-class processor |
| `LineAddProcessor` | First-class processor |
| `LineMultiplyProcessor` | First-class processor |
| `TuningProcessor` | First-class processor |
| `PythonProcessor` | Deferred: preserve XML and label clearly; Jython/Python execution and full editing are out of scope for this slice |

Java `Code` is not a note processor. It is a helper value object used by `PythonProcessor`.

Java chain editing surfaces:

- `SoundObjectPropertiesTopComponent` embeds `NoteProcessorChainEditor` for selected sound objects.
- `SoundLayerPanel` opens `NoteProcessorDialog` for sound-layer chains.
- `ScoreObjectBar` opens `NoteProcessorDialog` for root score and layer-group chains.
- `NoteProcessorChainEditor` supports add, remove, push up, push down, cut, copy, paste, named-chain import, and named-chain save.

Java render application points:

- Sound-object chains are applied by score-object implementations where Java applies them.
- `SoundLayer.generateForCSD()` applies the layer chain after merging object notes.
- Layer groups apply their group chain after merging layers where the group supports note processors.
- `Score.generateForCSD()` applies the root score chain after merging layer groups.

## Current TypeScript Status

### Processor Catalog

Implemented as TypeScript classes:

- `AddProcessor`
- `MultiplyProcessor`
- `RandomAddProcessor`
- `RandomMultiplyProcessor`
- `LineAddProcessor`
- `LineMultiplyProcessor`
- `PchAddProcessor`
- `PchInversionProcessor`
- `InversionProcessor`
- `RetrogradeProcessor`
- `RotateProcessor`
- `TimeWarpProcessor`
- `TuningProcessor`
- `SwitchProcessor`
- `SubListProcessor`
- `EqualsProcessor`

Missing, incorrect, or deferred:

- `PythonProcessor` is not implemented as a first-class TypeScript processor. Full-class-name XML currently normalizes to `PythonProcessor`, but there is no loader in `PROCESSOR_MAP`, so it becomes `UnsupportedProcessor`. This is now an intentional deferral for the Jython/Python follow-up, provided the XML remains preserved and the UI labels it clearly.
- `UnsupportedProcessor.process()` returns the input notes unchanged, so Python or unknown processors can silently no-op during rendering.
- `Code` is implemented as a `NoteProcessor` and registered in `PROCESSOR_MAP`, but Java `blue.noteProcessor.Code` is not a processor plugin. This creates a false processor type and hides the real PythonProcessor shape.
- `ValueTimeMapper` is correctly a helper, not a processor, and current tests assert it remains unsupported if encountered as a chain processor.

### Serialization and Chain Model

Working foundations:

- `NoteProcessorChain` loads full Java class names through normalization for known processors.
- Known processor `saveAsXML()` methods generally emit Java full class-name `type` attributes.
- `NoteProcessorChainMap` uses Java-compatible `<npc name="..."><noteProcessorChain>...</noteProcessorChain></npc>` wrappers and still accepts legacy direct `<noteProcessorChain name="...">` entries.
- Unknown processor XML is preserved by `UnsupportedProcessor`.

Gaps:

- There is no first-class PythonProcessor serialization model with editable `code` content; this is deferred and should remain preservation-only in this slice.
- Processor snapshots sent to the renderer contain only constructor names and blank `serializedXml`; they do not expose editable fields or complete summaries.
- `replaceNoteProcessorChain` clears a chain when passed `null`, but non-null replacement is explicitly deferred and does not reify processors back into the model.

### Render/Application Points

Working or partially working:

- Sound-object-level application exists in several score-object generators, including `GenericScore`, `External`, `JavaScriptObject`, `Instance`, `PianoRoll`, `JMask`, `TrackerObject`, `PatternObject`, and `PolyObject`.
- `SoundLayer.generateForCSD()` applies its layer chain after merging notes.
- `PolyObject.generateForCSD()` applies its chain after merging layers and before time behavior, so nested/root poly-object group behavior is partially covered.
- `PatternsLayerGroup.generateForCSD()` applies its group chain.
- XML load/save preserves root score, layer, group, and sound-object chain nodes in several locations.

Gaps:

- `Score.generateForCSD()` does not apply the root score `NoteProcessorChain`, despite loading and saving it.
- Audio layer groups return a new empty chain and have no editable chain, which matches the current TypeScript comment but must be checked against Java parity expectations for root/group menus.
- Application ordering across object, layer, layer group, and root is not covered by tests.
- Per-object application coverage is per-class rather than centralized, so unsupported or partially ported objects can diverge without test failures.

### UI and Application Editing

Working foundations:

- `ScoreObjectPropertiesPanel` replaces the placeholder and displays a note-processor summary for selected sound objects.
- Score snapshots include `supportsNoteProcessorChain` for score-object editor targets.
- Layer headers show an `N` button for non-audio groups.

Gaps:

- The ScoreObject Properties panel does not provide an editable NoteProcessorChainEditor equivalent; it only lists processor display names.
- Layer header `N` button calls `alert("Not yet implemented")`.
- There is no chain edit dialog for sound-object, layer, layer-group, or root targets.
- Score document snapshots do not expose note-processor chain summaries or edit targets for layers, layer groups, or root.
- There is no visible root or layer-group note-processor affordance equivalent to Java `ScoreObjectBar` root/group menus.
- Existing patch types cannot replace a non-empty chain because renderer snapshots are not reified into model processors.
- Named chain import/save from `NoteProcessorChainMap` is not exposed in the renderer.

### Tests

Existing tests:

- Basic `NoteProcessorChain` unsupported ValueTimeMapper preservation.
- Basic `NoteProcessorChainMap` storage/load/save/deep-copy behavior.
- Basic `UnsupportedProcessor` XML preservation.
- Some score-object editor tests verify a note-processor-chain snapshot is present or omitted.
- A layer header UI test verifies audio layers do not show the note-processor button.

Missing tests:

- No comprehensive per-processor processing parity test file exists in the current tree.
- No per-processor XML round-trip matrix exists for all Java plugin processors.
- No tests prove `PythonProcessor` load/edit/save/execution behavior; for this slice, required coverage is limited to preservation-only load/save visibility.
- No tests prove processor behavior when applied at sound-object, sound-layer, layer-group, and root score scopes.
- No tests prove Java-compatible application ordering across object, layer, group, and root chains.
- No renderer tests cover adding, removing, reordering, editing properties, copy/cut/paste, named-chain import, or named-chain save in a chain editor.
- No renderer/main tests cover patches for layer, layer-group, and root chain targets.

## Missing Work Inventory

1. Treat `PythonProcessor` as a preservation-only deferred processor for this slice and document Jython/Python work for a later feature.
2. Remove `Code` from the addable/registered processor catalog because Java `Code` is not a note processor plugin.
3. Ensure every in-scope Java plugin note processor can be created, loaded from Java XML, edited, deep-copied, serialized, and applied without silent data loss.
4. Apply root score chains in `Score.generateForCSD()` after layer groups are merged, matching Java Blue.
5. Audit every TypeScript score-object generator that owns a chain and either apply Java-equivalent processor behavior or document why Java also does not apply it.
6. Add renderer-facing processor descriptors with editable property metadata and serialized payloads.
7. Add a chain edit dialog/component with add/remove/reorder/cut/copy/paste, property editing, deferred/unsupported processor display, named-chain import, and named-chain save.
8. Wire ScoreObject Properties to open or embed the chain editor and commit non-empty chain edits to canonical project data.
9. Wire layer, layer-group, and root note-processor edit targets into score snapshots, renderer UI, IPC/patch contracts, and main-process model mutation.
10. Add visible indicators for non-empty object/layer/group/root chains where Java Blue marks them.
11. Add unit tests for every in-scope processor's processing behavior.
12. Add serialization tests for every in-scope processor, deferred PythonProcessor preservation, and chain map behavior.
13. Add scope tests proving every in-scope processor works through object, layer, layer-group, and root chains.
14. Add UI and patch tests for all chain editing workflows.
15. Add regression coverage for generated note lists or CSD output so missing root/group/layer application fails visibly.
