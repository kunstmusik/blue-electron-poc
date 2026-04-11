// ─── Core ───
export { BlueData } from './blue-data';
export type { BlueDataObject, BlueDataObjectStatic } from './blue-data-object';
export type { DeepCopyable } from './deep-copyable';
export { BLUE_VERSION } from './blue-constants';
export { CompileData } from './compile-data';
export { setCopy as setCopyBuffer, getCopy as getCopyBuffer, hasContent as hasClipboardContent, clear as clearClipboard } from './copy-buffer';

// ─── Arrangement ───
export { Arrangement } from './arrangement';

// ─── Instruments ───
export { Instrument } from './instruments/instrument';
export { GenericInstrument } from './instruments/generic-instrument';
export { InstrumentAssignment } from './instruments/instrument-assignment';
export { InstrumentLibrary } from './instruments/instrument-library';

// ─── Project ───
export { ProjectProperties } from './project-properties';
export { GlobalOrcSco } from './global-orc-sco';
export { Tables } from './tables';
export { LiveData } from './live-data';
export { ScratchPadData } from './scratch-pad-data';
export { MarkersList } from './markers-list';

// ─── Time ───
export { TimeBase } from './time/time-base';
export { SmpteFrameRate } from './time/smpte-frame-rate';
export { TimePosition } from './time/time-position';
export { TimeDuration } from './time/time-duration';
export { TempoMap } from './time/tempo-map';
export { TimeContext } from './time/time-context';
export { TimeState } from './time/time-state';

// ─── Score ───
export { Score } from './score/score';
export type { ScoreObject } from './score/score-object';
export { ScoreObjectEvent, ScoreEventType } from './score/score-object-event';
export type { ScoreObjectListener } from './score/score-object-event';
export { ScoreGenerationException } from './score/score-generation-exception';

// ─── Score Layers ───
export type { Layer } from './score/layers/layer';
export { LAYER_HEIGHT } from './score/layers/layer';
export type { LayerGroup } from './score/layers/layer-group';
export type { ScoreObjectLayer } from './score/layers/score-object-layer';
export type { ScoreObjectLayerGroup } from './score/layers/score-object-layer-group';
export type { AutomatableLayer } from './score/layers/automatable-layer';
export type { AutomatableLayerGroup } from './score/layers/automatable-layer-group';
export type { LayerGroupProvider } from './score/layers/layer-group-provider';
export { LayerGroupProviderManager } from './score/layers/layer-group-provider-manager';
export { LayerGroupDataEvent, LayerGroupDataEventType } from './score/layers/layer-group-data-event';
export type { LayerGroupListener } from './score/layers/layer-group-listener';
export type { DeepCopyableLG } from './score/layers/deep-copyable-lg';

// ─── Sound Objects ───
export type { SoundObject, SoundObjectStatic } from './sound-objects/sound-object';
export { AbstractSoundObject } from './sound-objects/abstract-sound-object';
export { TimeBehavior } from './sound-objects/time-behavior';
export { SoundObjectException } from './sound-objects/sound-object-exception';
export { Note } from './sound-objects/note';
export { NoteList } from './sound-objects/note-list';
export { GenericScore } from './sound-objects/generic-score';
export { PolyObject } from './sound-objects/poly-object';
export { SoundLayer } from './sound-objects/sound-layer';
export { PolyObjectLayerGroupProvider } from './sound-objects/poly-object-layer-group-provider';
export { SoundObjectLibrary } from './sound-objects/sound-object-library';

// ─── Note Processors ───
export { NoteProcessorChain } from './note-processors/note-processor-chain';
export { NoteProcessorChainMap } from './note-processors/note-processor-chain-map';

// ─── MIDI ───
export { MidiInputProcessor } from './midi/midi-input-processor';

// ─── Serialization ───
export { Element, Elements } from './serialization/xml-reader';
export { ObjRefSaveMap, ObjRefLoadMap } from './serialization/obj-ref-map';

// ─── Migration ───
export { ProjectVersion } from './migration/project-version';
export { ProjectUpgrader } from './migration/upgrader';
export { UpgradeManager } from './migration/upgrade-manager';
export { ProjectUpgrader_2_1_10 } from './migration/upgrades/upgrade-2.1.10';
export { ProjectUpgrader_2_3_0 } from './migration/upgrades/upgrade-2.3.0';

// ─── Utilities ───
export { replaceAll, stripSingleLineComments, stripBlockComments } from './utilities/text';
export { writeInt, readInt, writeDouble, readDouble, writeBoolean, readBoolean } from './utilities/xml';
