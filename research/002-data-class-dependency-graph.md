# Data Class Dependency Graph & Porting Order

This document maps ALL Java classes that need to be ported to TypeScript, organized by dependency order. Includes audio layers, pattern layers, all SoundObject types, and JVM-dependency notes.

## Environment Compatibility Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Works in both browser and Node.js |
| 🟡 | Works in both, but feature is limited/degraded in browser |
| 🔴 | Node.js only (requires subprocess, file system, etc.) |

## Layer 0: Foundation (no dependencies on other Blue classes)

| Java Class | TS Target | Env | Notes |
|-----------|-----------|-----|-------|
| `blue.utility.TextUtilities` | `@blue/data/src/utilities/text.ts` | ✅ | String utilities, regex helpers |
| `blue.utility.ScoreUtilities` | `@blue/data/src/utilities/score.ts` | ✅ | Score manipulation utilities |
| `blue.utility.UDOUtilities` | `@blue/data/src/utilities/udo.ts` | ✅ | UDO parsing |
| `blue.utility.ObjectUtilities` | `@blue/data/src/utilities/object.ts` | ✅ | Generic object load/save dispatcher |
| `blue.utility.XMLUtilities` | `@blue/data/src/utilities/xml.ts` | ✅ | XML read/write helpers (writeInt, readDouble, etc.) |
| `blue.utility.ScoreExpressionParser` | `@blue/data/src/utilities/expression-parser.ts` | ✅ | Expression parsing for score |
| `blue.CopyBuffer` | `@blue/data/src/copy-buffer.ts` | ✅ | Static clipboard buffer |
| `blue.DeepCopyable` | `@blue/data/src/deep-copyable.ts` | ✅ | Interface: `deepCopy()` |
| `blue.BlueDataObject` | `@blue/data/src/blue-data-object.ts` | ✅ | Interface: `saveAsXML()`, `deepCopy()` |
| `blue.BlueConstants` | `@blue/data/src/blue-constants.ts` | ✅ | Version string, constants |
| `blue.CompileData` | `@blue/data/src/compile-data.ts` | ✅ | Compilation context (orchestra/sco accumulators, channel assignments) |

## Layer 1: Basic Value Types

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `blue.time.TimeContext` | `@blue/data/src/time/time-context.ts` | Layer 0 |
| `blue.time.TimePosition` | `@blue/data/src/time/time-position.ts` | Layer 0 |
| `blue.time.TimeDuration` | `@blue/data/src/time/time-duration.ts` | Layer 0 |
| `blue.time.TempoMap` | `@blue/data/src/time/tempo-map.ts` | Layer 0 |
| `blue.time.TimeState` | `@blue/data/src/time/time-state.ts` | Layer 0, TimePosition, TimeDuration |
| `blue.time.TimeBase` | `@blue/data/src/time/time-base.ts` | enum (BEATS, SECONDS, etc.) |
| `blue.time.TimeUnitMath` | `@blue/data/src/time/time-unit-math.ts` | Layer 0 |
| `blue.time.TimeContextManager` | `@blue/data/src/time/time-context-manager.ts` | TimeContext |
| `blue.time.TimeUtilities` | `@blue/data/src/time/time-utilities.ts` | Layer 0 |
| `blue.time.SmpteFrameRate` | `@blue/data/src/time/smpte-frame-rate.ts` | enum |
| `blue.Marker` | `@blue/data/src/marker.ts` | Layer 0 |
| `blue.MarkersList` | `@blue/data/src/markers-list.ts` | Marker |
| `blue.Tables` | `@blue/data/src/tables.ts` | Layer 0 |
| `blue.udo.OpcodeList` | `@blue/data/src/opcodes/opcode-list.ts` | Layer 0 |
| `blue.udo.OpcodeDefinition` | `@blue/data/src/opcodes/opcode-definition.ts` | Layer 0 |

## Layer 2: Project Properties, Instruments, ScoreObject base

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `blue.ProjectProperties` | `@blue/data/src/project-properties.ts` | Layer 0, 0dbfs settings |
| `blue.score.ScoreObject` (interface) | `@blue/data/src/score/score-object.ts` | TimePosition, TimeDuration, Color |
| `blue.score.ScoreObjectEvent` | `@blue/data/src/score/score-object-event.ts` | enum of event types |
| `blue.score.ScoreObjectListener` | `@blue/data/src/score/score-object-listener.ts` | ScoreObjectEvent |
| `blue.orchestra.Instrument` (abstract) | `@blue/data/src/instruments/instrument.ts` | BlueDataObject, Layer 0 |
| `blue.orchestra.GenericInstrument` | `@blue/data/src/instruments/generic-instrument.ts` | Instrument |
| `blue.InstrumentLibrary` | `@blue/data/src/instruments/instrument-library.ts` | Instrument, BlueDataObject |
| `blue.InstrumentAssignment` | `@blue/data/src/instruments/instrument-assignment.ts` | Instrument |
| `blue.orchestra.BlueSynthBuilder.*` | `@blue/data/src/instruments/bsb/*` | Instrument, automation — **large subtree** |
| `blue.Arrangement` | `@blue/data/src/arrangement.ts` | InstrumentAssignment, InstrumentLibrary, Instrument, CompileData |
| `blue.ArrangementEvent` | `@blue/data/src/arrangement-event.ts` | — |
| `blue.ArrangementListener` | `@blue/data/src/arrangement-listener.ts` | ArrangementEvent |

## Layer 3: Score Layer Base Interfaces

These are the interfaces in `blue-core` that define the layer system:

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `blue.score.layers.Layer` | `@blue/data/src/score/layers/layer.ts` | ScoreObject, DeepCopyable |
| `blue.score.layers.LayerGroup<T>` | `@blue/data/src/score/layers/layer-group.ts` | List\<T\>, NoteProcessorChain, NoteList, TimeContext, CompileData |
| `blue.score.layers.ScoreObjectLayer<T>` | `@blue/data/src/score/layers/score-object-layer.ts` | Layer, List\<T extends ScoreObject\> |
| `blue.score.layers.ScoreObjectLayerGroup<T>` | `@blue/data/src/score/layers/score-object-layer-group.ts` | LayerGroup\<T\> |
| `blue.score.layers.AutomatableLayer` | `@blue/data/src/score/layers/automatable-layer.ts` | Layer, ParameterIdList |
| `blue.score.layers.AutomatableLayerGroup` | `@blue/data/src/score/layers/automatable-layer-group.ts` | LayerGroup |
| `blue.score.layers.LayerGroupProvider` | `@blue/data/src/score/layers/layer-group-provider.ts` | Layer, LayerGroup |
| `blue.score.layers.LayerGroupProviderManager` | `@blue/data/src/score/layers/layer-group-provider-manager.ts` | LayerGroupProvider (manages registration) |
| `blue.score.layers.LayerGroupDataEvent` | `@blue/data/src/score/layers/layer-group-data-event.ts` | Layer, event type constants |
| `blue.score.layers.LayerGroupListener` | `@blue/data/src/score/layers/layer-group-listener.ts` | LayerGroupDataEvent |
| `blue.score.layers.DeepCopyableLG` | `@blue/data/src/score/layers/deep-copyable-lg.ts` | DeepCopyable for LayerGroup |

## Layer 3.5: Audio Score Layers (`blue-score-layers-audio-core`)

Separate NetBeans module. Pure Java, no JVM-language dependencies.

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `AudioClip` | `@blue/data/src/score/audio/audio-clip.ts` | ScoreObject, TimePosition, TimeDuration, FadeType, File |
| `AudioLayer` | `@blue/data/src/score/audio/audio-layer.ts` | ScoreObjectLayer\<AudioClip\>, AutomatableLayer, CompileData, Mixer |
| `AudioLayerGroup` | `@blue/data/src/score/audio/audio-layer-group.ts` | ScoreObjectLayerGroup\<AudioLayer\>, CompileData |
| `AudioLayerGroupProvider` | `@blue/data/src/score/audio/audio-layer-group-provider.ts` | LayerGroupProvider |
| `AudioLayerListener` | `@blue/data/src/score/audio/audio-layer-listener.ts` | AudioLayer, AudioClip |
| `FadeType` (enum) | `@blue/data/src/score/audio/fade-type.ts` | LINEAR, CONSTANT_POWER, SYMMETRIC, FAST, SLOW |

**Embedded Csound resources (port as template strings):**
- `playback_instrument.orc` → diskin2 instrument template used by `AudioLayer.generateForCSD()`
- `blue_fade.udo` → fade UDO (5 types, based on Ardour's Curve.cpp), appended to global orc during CSD gen

## Layer 3.6: Pattern Score Layers (`blue-score-layers-patterns-core`)

Separate NetBeans module. Pure Java, no JVM-language dependencies.

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `PatternData` | `@blue/data/src/score/patterns/pattern-data.ts` | boolean array, block size 16, auto-resizing |
| `PatternLayer` | `@blue/data/src/score/patterns/pattern-layer.ts` | Layer, SoundObject, PatternData |
| `PatternsLayerGroup` | `@blue/data/src/score/patterns/patterns-layer-group.ts` | LayerGroup\<PatternLayer\>, patternBeatsLength, NoteProcessorChain |
| `PatternsLayerGroupProvider` | `@blue/data/src/score/patterns/patterns-layer-group-provider.ts` | LayerGroupProvider |

**How PatternLayer works:** Each `PatternLayer` holds a `SoundObject` and a `PatternData` (boolean array). During CSD generation, the sound object is generated once, then its notes are repeated at positions where the pattern array is `true`, each repetition offset by `index * patternBeatsLength`.

## Layer 4: PolyObject (nested layer group SoundObject)

`PolyObject` is both a `SoundObject` (note generator) and a `ScoreObjectLayerGroup<SoundLayer>`. It was the root score type before 2.3.0 and is still used as a nested container.

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `PolyObject` | `@blue/data/src/sound-objects/poly-object.ts` | SoundObject, ScoreObjectLayerGroup\<SoundLayer\>, AutomatableLayerGroup, TimeState |
| `SoundLayer` | `@blue/data/src/sound-objects/sound-layer.ts` | Layer (holds SoundObjects within PolyObject) |
| `PolyObjectLayerGroupProvider` | `@blue/data/src/sound-objects/poly-object-layer-group-provider.ts` | LayerGroupProvider |

## Layer 5: SoundObject base types

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `SoundObject` (interface) | `@blue/data/src/sound-objects/sound-object.ts` | ScoreObject, NoteList generator |
| `AbstractSoundObject` | `@blue/data/src/sound-objects/abstract-sound-object.ts` | SoundObject base impl |
| `TimeBehavior` (enum) | `@blue/data/src/sound-objects/time-behavior.ts` | NONE, REPEAT, SCALE |
| `OnLoadProcessable` (interface) | `@blue/data/src/sound-objects/on-load-processable.ts` | `processOnLoad()` |
| `Note` | `@blue/data/src/sound-objects/note.ts` | p-field based Csound note |
| `NoteList` | `@blue/data/src/sound-objects/note-list.ts` | List\<Note\> with merge/sort |
| `NoteParseException` | `@blue/data/src/sound-objects/note-parse-exception.ts` | — |
| `SoundObjectException` | `@blue/data/src/sound-objects/sound-object-exception.ts` | — |
| `SoundObjectUtilities` | `@blue/data/src/sound-objects/sound-object-utilities.ts` | Common save/load helpers |
| `GenericViewable` (interface) | `@blue/data/src/sound-objects/generic-viewable.ts` | UI marker interface |

## Layer 6: Concrete SoundObject Types

Each has `loadFromXML(Element, objRefMap)` and `saveAsXML(objRefMap)`. All extend `AbstractSoundObject` or implement `SoundObject` directly.

| Java Class | TS Target | Env | JVM Dep? | Notes |
|-----------|-----------|-----|----------|-------|
| `GenericScore` | `@blue/data/src/sound-objects/generic-score.ts` | ✅ | No | **Most common** — raw Csound score text |
| `CSDSoundObject` | `@blue/data/src/sound-objects/csd-sound-object.ts` | ✅ | No | Embedded CSD file |
| `AudioFile` | `@blue/data/src/sound-objects/audio-file.ts` | ✅ | No | Disk-based audio file (uses diskin2) |
| `Sound` | `@blue/data/src/sound-objects/sound.ts` | ✅ | No | Simple sound object |
| `Comment` | `@blue/data/src/sound-objects/comment.ts` | ✅ | No | Comment/note in score (no notes generated) |
| `External` | `@blue/data/src/sound-objects/external.ts` | ✅ | No | External process sound object |
| `AbstractLineObject` | `@blue/data/src/sound-objects/abstract-line-object.ts` | ✅ | No | Base for line-based objects |
| `LineObject` | `@blue/data/src/sound-objects/line-object.ts` | ✅ | No | Line-based note generator |
| `ZakLineObject` | `@blue/data/src/sound-objects/zak-line-object.ts` | ✅ | No | Zak memory line object |
| `PatternObject` | `@blue/data/src/sound-objects/pattern-object.ts` | ✅ | No | Pattern-based sound object (different from PatternLayer!) |
| `PianoRoll` | `@blue/data/src/sound-objects/piano-roll.ts` | ✅ | No | Piano roll sound object |
| `NotationObject` | `@blue/data/src/sound-objects/notation-object.ts` | ✅ | No | Notation-based sound object |
| `JMask` | `@blue/data/src/sound-objects/j-mask.ts` | ✅ | No | Mask sound object |
| `Instance` | `@blue/data/src/sound-objects/instance.ts` | ✅ | No | Instance/reference sound object |
| `TrackerObject` | `@blue/data/src/sound-objects/tracker-object.ts` | ✅ | No | Tracker-style sound object |
| `FrozenSoundObject` | `@blue/data/src/sound-objects/frozen-sound-object.ts` | ✅ | No | Frozen/cached sound object |
| `JavaScriptObject` | `@blue/data/src/sound-objects/javascript-object.ts` | ✅ | Partially | JS code → `score` var; run in `vm`/`Function` sandbox |
| `PythonObject` | `@blue/data/src/sound-objects/python-object.ts` | 🟡 | **Yes (Jython)** | **Data: ✅ both envs. Generation: 🔴 Node only** (Java/Python subprocess) |
| `ObjectBuilder` | `@blue/data/src/sound-objects/object-builder.ts` | ✅ | No | Plugin interface for custom builders |
| `ObjectBuilderRegistry` | `@blue/data/src/sound-objects/object-builder-registry.ts` | ✅ | No | Registry of ObjectBuilders |

## Layer 7: Sound Object Library & Global Data

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `SoundObjectLibrary` | `@blue/data/src/sound-objects/sound-object-library.ts` | All SoundObject types, BlueDataObject |
| `GlobalOrcSco` | `@blue/data/src/global-orc-sco.ts` | Layer 0 |
| `GlobalVariables` | `@blue/data/src/global-variables.ts` | — |

## Layer 8: Mixer

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `Mixer` | `@blue/data/src/mixer/mixer.ts` | Channel, ChannelList, BlueDataObject |
| `Channel` | `@blue/data/src/mixer/channel.ts` | Effect, Send, BlueDataObject |
| `ChannelList` | `@blue/data/src/mixer/channel-list.ts` | Channel |
| `Effect` | `@blue/data/src/mixer/effect.ts` | BlueDataObject |
| `EffectManager` | `@blue/data/src/mixer/effect-manager.ts` | Effect |
| `EffectsChain` | `@blue/data/src/mixer/effects-chain.ts` | Effect |
| `Send` | `@blue/data/src/mixer/send.ts` | BlueDataObject |
| `MixerNode` | `@blue/data/src/mixer/mixer-node.ts` | — |

## Layer 9: Automation

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `blue.automation.Parameter` | `@blue/data/src/automation/parameter.ts` | BlueDataObject |
| `blue.automation.ParameterList` | `@blue/data/src/automation/parameter-list.ts` | Parameter |
| `blue.automation.ParameterIdList` | `@blue/data/src/automation/parameter-id-list.ts` | — |
| `blue.automation.ParameterNameManager` | `@blue/data/src/automation/parameter-name-manager.ts` | ParameterList |
| `blue.automation.ParameterTimeManager` | `@blue/data/src/automation/parameter-time-manager.ts` | Parameter |
| `blue.automation.Automatable` | `@blue/data/src/automation/automatable.ts` | ParameterList |
| `blue.automation.AutomatableCollectionListener` | `@blue/data/src/automation/automatable-collection-listener.ts` | — |
| `blue.automation.LineColors` | `@blue/data/src/automation/line-colors.ts` | — |

## Layer 10: Note Processors

| Java Class | TS Target | Env | JVM Dep? | Notes |
|-----------|-----------|-----|----------|-------|
| `NoteProcessor` (abstract) | `@blue/data/src/note-processors/note-processor.ts` | ✅ | No | Base class |
| `NoteProcessorChain` | `@blue/data/src/note-processors/note-processor-chain.ts` | ✅ | No | Chain of processors |
| `NoteProcessorChainMap` | `@blue/data/src/note-processors/note-processor-chain-map.ts` | ✅ | No | Named chains |
| `AddProcessor` | `@blue/data/src/note-processors/add-processor.ts` | ✅ | No | Add value to p-fields |
| `MultiplyProcessor` | `@blue/data/src/note-processors/multiply-processor.ts` | ✅ | No | Multiply p-fields |
| `RandomAddProcessor` | `@blue/data/src/note-processors/random-add-processor.ts` | ✅ | No | Random add |
| `RandomMultiplyProcessor` | `@blue/data/src/note-processors/random-multiply-processor.ts` | ✅ | No | Random multiply |
| `LineAddProcessor` | `@blue/data/src/note-processors/line-add-processor.ts` | ✅ | No | Linear add |
| `LineMultiplyProcessor` | `@blue/data/src/note-processors/line-multiply-processor.ts` | ✅ | No | Linear multiply |
| `PchAddProcessor` | `@blue/data/src/note-processors/pch-add-processor.ts` | ✅ | No | Pitch add |
| `PchInversionProcessor` | `@blue/data/src/note-processors/pch-inversion-processor.ts` | ✅ | No | Pitch inversion |
| `InversionProcessor` | `@blue/data/src/note-processors/inversion-processor.ts` | ✅ | No | Inversion |
| `RetrogradeProcessor` | `@blue/data/src/note-processors/retrograde-processor.ts` | ✅ | No | Retrograde |
| `RotateProcessor` | `@blue/data/src/note-processors/rotate-processor.ts` | ✅ | No | Rotate |
| `TimeWarpProcessor` | `@blue/data/src/note-processors/time-warp-processor.ts` | ✅ | No | Time warp |
| `TuningProcessor` | `@blue/data/src/note-processors/tuning-processor.ts` | ✅ | No | Tuning |
| `SwitchProcessor` | `@blue/data/src/note-processors/switch-processor.ts` | ✅ | No | Switch |
| `SubListProcessor` | `@blue/data/src/note-processors/sublist-processor.ts` | ✅ | No | Sub-list |
| `EqualsProcessor` | `@blue/data/src/note-processors/equals-processor.ts` | ✅ | No | Equals filter |
| `Code` | `@blue/data/src/note-processors/code.ts` | ✅ | No | Generic code block |
| `PythonProcessor` | `@blue/data/src/note-processors/python-processor.ts` | 🟡 | **Yes (Jython)** | **Data: ✅ both. Processing: 🔴 Node only** |
| `ValueTimeMapper` | `@blue/data/src/note-processors/value-time-mapper.ts` | ✅ | No | Value/time mapping |

## Layer 11: Live Data & MIDI

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `blue.LiveData` | `@blue/data/src/live-data.ts` | BlueDataObject, LiveObjectSetList |
| `blue.blueLive.LiveObject` | `@blue/data/src/live/live-object.ts` | BlueDataObject |
| `blue.blueLive.LiveObjectSet` | `@blue/data/src/live/live-object-set.ts` | LiveObject |
| `blue.blueLive.LiveObjectBins` | `@blue/data/src/live/live-object-bins.ts` | — |
| `blue.blueLive.LiveObjectSetList` | `@blue/data/src/live/live-object-set-list.ts` | LiveObjectSet |
| `blue.midi.MidiInputProcessor` | `@blue/data/src/midi/midi-input-processor.ts` | MidiKeyMapping, MidiVelocityMapping |
| `blue.midi.MidiKeyMapping` | `@blue/data/src/midi/midi-key-mapping.ts` | — |
| `blue.midi.MidiVelocityMapping` | `@blue/data/src/midi/midi-velocity-mapping.ts` | — |

## Layer 12: Scratch Pad & Plugin Data

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `blue.ScratchPadData` | `@blue/data/src/scratch-pad-data.ts` | BlueDataObject |
| `blue.data.BlueDataObjectManager` | `@blue/data/src/blue-data-object-manager.ts` | Plugin data loading |
| `blue.clojure.project.ClojureProjectData` | `@blue/data/src/plugins/clojure-project-data.ts` | **JVM-dep (Clojure)** — preserve XML only |
| `blue.clojure.project.ClojureLibraryEntry` | `@blue/data/src/plugins/clojure-library-entry.ts` | **JVM-dep (Clojure)** — preserve XML only |

## Layer 13: Root — BlueData

| Java Class | TS Target | Dependencies |
|-----------|-----------|-------------|
| `blue.BlueData` | `@blue/data/src/blue-data.ts` | **ALL** of the above |
| `blue.BlueSystem` | `@blue/data/src/blue-system.ts` | System utilities (relative paths, i18n strings) |

## Cross-Cutting: Migration System

| Java Class | TS Target |
|-----------|-----------|
| `blue.upgrades.ProjectVersion` | `@blue/data/src/migration/project-version.ts` |
| `blue.upgrades.ProjectUpgrader` | `@blue/data/src/migration/upgrader.ts` |
| `blue.upgrades.UpgradeManager` | `@blue/data/src/migration/upgrade-manager.ts` |
| `blue.upgrades.ProjectUpgrader_2_1_10` | `@blue/data/src/migration/upgrades/upgrade-2-1-10.ts` |
| `blue.upgrades.ProjectUpgrader_2_3_0` | `@blue/data/src/migration/upgrades/upgrade-2-3-0.ts` |

## Cross-Cutting: Serialization

| Component | TS Target |
|-----------|-----------|
| XML reader (compatible with Java `electric.xml`) | `@blue/data/src/serialization/xml-reader.ts` |
| XML writer | `@blue/data/src/serialization/xml-writer.ts` |
| Object reference map | `@blue/data/src/serialization/obj-ref-map.ts` |

---

## JVM Dependency Strategy

### Classes that are pure (no JVM-language deps) — ✅ both browser and Node
**Everything listed above except:** `PythonObject`, `PythonProcessor`, `ClojureObject`, `ClojureProjectData`, `ClojureLibraryEntry`

These can be fully ported to TypeScript with native implementations, working in both browser and Node.

### Classes with JVM-language dependencies

| Class | Dependency | Phase 1 (data) | Phase 2 (generation) |
|-------|-----------|---------------|---------------------|
| `PythonObject` (SoundObject) | Jython | ✅ Preserve `pythonCode` on load/save. Skip `generateNotes()`. Works in both envs. | 🔴 **Node only.** Java subprocess that loads blue-core.jar, calls `generateNotes()`, returns note text. Or: native Python subprocess. **In browser:** skip with warning, or use server-side rendering service. |
| `PythonProcessor` (NoteProcessor) | Jython | ✅ Preserve code on load/save. Skip processing. | 🔴 Same as PythonObject. |
| `ClojureObject` (SoundObject, in `blue-clojure` module) | Clojure runtime | ✅ Preserve `clojureCode` on load/save. Skip `generateNotes()`. Works in both envs. | 🔴 **Node only.** Java subprocess that loads blue-clojure.jar. Or: nbb/babashka subprocess. **In browser:** skip with warning, or use server-side rendering service. |
| `ClojureProjectData` (Plugin, in `blue-clojure` module) | Clojure runtime | ✅ Preserve as opaque XML. | Same as ClojureObject. |
| `ClojureLibraryEntry` (in `blue-clojure` module) | Clojure runtime | ✅ Preserve as opaque XML. | Same. |
| `JavaScriptObject` (SoundObject) | Nashorn/GraalJS | ✅ Preserve code on load/save. | ✅ **Both envs.** Node: `vm.runInNewContext()`. Browser: `new Function()` sandboxed. The code is already JS. |

### Browser vs Node Capability Summary

| Capability | Browser | Node.js |
|-----------|---------|---------|
| Load/save `.blue` files (all data) | ✅ | ✅ |
| Display/edit all data structures | ✅ | ✅ |
| XML serialization round-trip | ✅ | ✅ |
| Migration/version upgrades | ✅ | ✅ |
| CSD generation (pure TS SoundObjects) | ✅ | ✅ |
| CSD generation (`JavaScriptObject`) | ✅ | ✅ |
| CSD generation (`PythonObject`, `ClojureObject`) | ❌ (warn) | ✅ (subprocess) |
| Note processing (`PythonProcessor`) | ❌ (skip) | ✅ (subprocess) |
| Audio file playback (blue-engine) | ❌ | ✅ |
| Engine control (ZMQ) | ❌ | ✅ |

**Key insight:** The data layer (`blue-data`) is fully portable. Only the **score generation** step for JVM-dependent SoundObjects is Node-exclusive. A browser app can still load, display, edit, and save `.blue` files — it just can't generate CSD output for projects that use Python/Clojure SoundObjects.

### Key Patterns to Replicate

### 1. `BlueDataObject` interface
Every serializable class implements:
```java
Element saveAsXML();
static T loadFromXML(Element data);        // or with objRefMap
T deepCopy();
```

### 2. Object Reference Map
Two maps are used during serialization:
- `objRefMap` (Object → String): During save, assigns IDs to shared objects
- `objRefMap` (String → Object): During load, resolves references

### 3. Property Change Events
Many classes fire `PropertyChangeEvent`s. In TypeScript, we can use:
- Node.js `EventEmitter`
- Or a simple callback pattern
- For Phase 1, this can be stubbed — only needed for UI

### 4. SoundObject Plugin Registry
SoundObjects use the `@SoundObjectPlugin` annotation for auto-registration. In TS, use a registry pattern:
```typescript
const soundObjectRegistry = new Map<string, SoundObjectConstructor>();
function registerSoundObject(name: string, ctor: SoundObjectConstructor) { ... }
```

### 5. LayerGroupProvider registration
Layer groups are registered via `LayerGroupProviderManager`. The manager is populated by:
- Built-in: `PolyObjectLayerGroupProvider`
- Module-provided: `AudioLayerGroupProvider`, `PatternsLayerGroupProvider`
In TS, these will be statically registered.

### 6. Deep Copy
Most classes have copy constructors. In TS, implement `deepCopy()` via explicit copy constructors.
