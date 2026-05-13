import {
  BlueData,
  Channel,
  BlueSynthBuilder,
  BlueX7,
  BSBGroup,
  BSBWidget,
  BSBXYController,
  BSBDropdown,
  Element,
  GenericInstrument,
  Instrument,
  JavaScriptInstrument,
  Effect,
  OpcodeDefinition,
  OpcodeList,
  Preset,
  PresetGroup,
  ProjectProperties,
  PythonInstrument,
  Mixer,
  Scale,
  TempoMap,
  UDOStyle,
  convertToModern,
  convertToClassic,
  LiveData,
  LiveObjectBins,
  LiveObjectSetList,
  Send,
  Score,
  PolyObject,
  AudioLayerGroup,
  PatternsLayerGroup,
  TimeBase,
  isValidSnapValueName,
  SoundObject,
  SoundObjectLibrary,
  Instance,
  AbstractSoundObject,
  TimeBehavior,
  NoteProcessorChain,
  AudioClip,
  TimePosition,
  TimeDuration,
  TimeContext,
  GenericScore,
  PythonObject,
  JavaScriptObject,
  Comment,
  External,
  AudioFile,
  FrozenSoundObject,
  PatternObject,
  Pattern,
  LineObject,
  ZakLineObject,
  PianoRoll,
  TrackerObject,
  Track,
  TrackerNote,
  Column,
  NotationObject,
  JMask,
  Sound,
  createSoundObject,
  convertTimePosition,
  beatsToTimePosition,
  beatsToDuration,
} from '@blue/data';
import type { Parameter as BlueDataParameter } from '@blue/data';
import { AutomationCurve as BlueDataAutomationCurve } from '@blue/data';
import type { SnapValueName } from '@blue/data';
import {
  getHSliderBankDisplaySize,
  getVSliderBankDisplaySize,
  BSB_LINE_SELECTOR_HEIGHT,
} from './bsb-widget-layout';

// ─── Score Snapshot Types ───

export interface ScoreTimeStateSnapshot {
  snapEnabled: boolean;
  snapValue: string;
  primaryTimeDisplay: string;
  secondaryTimeDisplay: string;
  secondaryRulerEnabled: boolean;
  tempoRowVisible: boolean;
  meterRowVisible: boolean;
  markersRowVisible: boolean;
  smpteFrameRate: number;
  zoomIterations: number;
  scoreObjectUpdateMode?: 'UPDATE_ALL' | 'UPDATE_MATCHING' | null;
  markerUpdateMode?: 'UPDATE_ALL' | 'UPDATE_MATCHING' | null;
}

export interface MarkerSnapshot {
  name: string;
  time: number;
  sourceIndex: number;
}

export interface ScoreRowObjectSnapshot {
  objectId: string;
  objectType: string;
  name: string;
  startBeats: number;
  durationBeats: number;
  backgroundColor: number;
  isContainer: boolean;
  editorTarget: ScoreObjectEditorTargetSnapshot;
}

export interface ScoreLayerSnapshot {
  layerId: string;
  name: string;
  height: number;
  muted?: boolean;
  solo?: boolean;
  items: ScoreRowObjectSnapshot[];
}

export interface PolyObjectLayerGroupSnapshot {
  groupId: string;
  groupType: 'polyObject';
  name: string;
  layerCount: number;
  isOpenableContainer: boolean;
  layers: ScoreLayerSnapshot[];
}

export interface AudioLayerGroupSnapshot {
  groupId: string;
  groupType: 'audio';
  name: string;
  layerCount: number;
  isOpenableContainer: boolean;
  layers: ScoreLayerSnapshot[];
}

export interface PatternsLayerGroupSnapshot {
  groupId: string;
  groupType: 'patterns';
  name: string;
  layerCount: number;
  isOpenableContainer: boolean;
  layers: ScoreLayerSnapshot[];
}

export type ScoreLayerGroupSnapshot =
  | PolyObjectLayerGroupSnapshot
  | AudioLayerGroupSnapshot
  | PatternsLayerGroupSnapshot;

export interface ScoreDocumentSnapshot {
  timeState: ScoreTimeStateSnapshot;
  markers: MarkerSnapshot[];
  layerGroups: ScoreLayerGroupSnapshot[];
}

// ─── Score Object Editor Target Types ───

export interface ScoreObjectLocationRef {
  rootGroupIndex: number;
  containerPath: Array<{ layerIndex: number; objectIndex: number }>;
  layerIndex: number;
  objectIndex: number;
}

export interface ScoreObjectLibraryEntryRef {
  libraryId: string;
  libraryIndex: number;
  objectType: string;
}

export interface ScoreObjectEditorTargetSnapshot {
  selectionId: string;
  selectedObjectType: string;
  editorObjectType: string;
  ownerKind: 'timeline' | 'library';
  displayContext: 'timeline' | 'library' | 'instance';
  location?: ScoreObjectLocationRef;
  sourceInstanceLocation?: ScoreObjectLocationRef;
  library?: ScoreObjectLibraryEntryRef;
  supportsTimeBehavior: boolean;
  supportsRepeatPoint: boolean;
  supportsNoteProcessorChain: boolean;
}

// ─── Score Object Editor Document Types ───

export interface TimeConversionMeterEntry {
  measure: number;
  numBeats: number;
  beatLength: number;
}

export interface TimeConversionContext {
  meterEntries: TimeConversionMeterEntry[];
  tempoEnabled: boolean;
  initialTempo: number;
  sampleRate: number;
}

export interface TimeValueSnapshot {
  value: number;
  timeBase: string;
  displayText: string;
}

export interface NoteProcessorEntrySnapshot {
  processorType: string;
  displayName: string;
  supported: boolean;
  summary: string;
  serializedXml: string;
}

export interface NoteProcessorChainSnapshot {
  processors: NoteProcessorEntrySnapshot[];
  hasUnsupportedProcessors: boolean;
}

export interface SharedScoreObjectPropertiesSnapshot {
  target: ScoreObjectEditorTargetSnapshot;
  name: string;
  startTime: TimeValueSnapshot;
  subjectiveDuration: TimeValueSnapshot;
  endTimeDisplay: string;
  backgroundColor: number;
  timeBehavior?: string;
  repeatPoint?: TimeValueSnapshot | null;
  noteProcessorChain?: NoteProcessorChainSnapshot | null;
}

export interface TrackerColumnSnapshot {
  name: string;
  type: number;
  restrictedToInteger: boolean;
  usingRange: boolean;
  rangeMin: number;
  rangeMax: number;
  outputFrequency: boolean;
  scale: MidiScaleSnapshot | null;
  sourceIndex?: number | null;
}

export type TypeSpecificScoreObjectEditorSnapshot =
  | {
      kind: 'code';
      target: ScoreObjectEditorTargetSnapshot;
      syntax: 'text' | 'csound-score' | 'python' | 'javascript';
      text: string;
      auxiliaryFlags?: Record<string, string | number | boolean>;
    }
  | {
      kind: 'external';
      target: ScoreObjectEditorTargetSnapshot;
      scoreText: string;
      commandLine: string;
      syntaxType: string;
      canTest: boolean;
      testMessage?: string;
    }
  | {
      kind: 'audioClip';
      target: ScoreObjectEditorTargetSnapshot;
      audioFile: string;
      numChannels: number;
      audioDuration: number;
      fileStartTime: number;
      fadeIn: number;
      fadeInType: string;
      fadeOut: number;
      fadeOutType: string;
      looping: boolean;
    }
  | {
      kind: 'file';
      target: ScoreObjectEditorTargetSnapshot;
      objectType: string;
      filePath: string;
      csoundPostCode?: string;
      numChannels?: number;
      originalObjectType?: string;
      auxiliaryFlags?: Record<string, string | number | boolean>;
    }
  | {
      kind: 'polyObject';
      target: ScoreObjectEditorTargetSnapshot;
      children: Array<{
        objectId: string;
        name: string;
        objectType: string;
        startBeats: number;
        durationBeats: number;
        layerLabel: string;
      }>;
      generatedScoreText: string;
      canOpenInScore: boolean;
      canTest: boolean;
    }
  | {
      kind: 'tracker';
      target: ScoreObjectEditorTargetSnapshot;
      stepsPerBeat: number;
      showNoteNames: boolean;
      octave: number;
      tracks: Array<{
        trackId: string;
        trackName: string;
        instrumentId: string;
        noteTemplate: string;
        columns: TrackerColumnSnapshot[];
      }>;
      rows: Array<Record<string, string | number | null>>;
      canTest: boolean;
      steps: number;
    }
  | {
      kind: 'structured';
      target: ScoreObjectEditorTargetSnapshot;
      editorFamily: string;
      payloadSummary: string;
      payload: Record<string, unknown>;
    }
  | {
      kind: 'fallback';
      target: ScoreObjectEditorTargetSnapshot;
      reason: 'no-selection' | 'multiple-selection' | 'unsupported' | 'removed-target';
      message: string;
    };

export interface ScoreObjectEditorDocumentSnapshot {
  target: ScoreObjectEditorTargetSnapshot;
  shared: SharedScoreObjectPropertiesSnapshot;
  editor: TypeSpecificScoreObjectEditorSnapshot;
  timeContext: TimeConversionContext;
}

export interface ScoreObjectEditorRequest {
  target: ScoreObjectEditorTargetSnapshot;
}

// ─── End Score Object Editor Document Types ───

export type ScorePatch =
  | { type: 'updateTimeState'; patch: Partial<ScoreTimeStateSnapshot> }
  | {
      type: 'updateSharedProperties';
      target: ScoreObjectEditorTargetSnapshot;
      patch: {
        name?: string;
        backgroundColor?: number;
        startTime?: { value: number; timeBase: string };
        subjectiveDuration?: { value: number; timeBase: string };
      };
    }
  | {
      type: 'updateSoundObjectBehavior';
      target: ScoreObjectEditorTargetSnapshot;
      patch: {
        timeBehavior?: string;
        repeatPoint?: { value: number; timeBase: string } | null;
      };
    }
  | {
      type: 'replaceNoteProcessorChain';
      target: ScoreObjectEditorTargetSnapshot;
      chain: NoteProcessorChainSnapshot | null;
    }
  | {
      type: 'updateTypeSpecificEditor';
      target: ScoreObjectEditorTargetSnapshot;
      patch: Record<string, unknown>;
    }
  | {
      type: 'addScoreObjects';
      groupId: string;
      objects: Array<{
        layerIndex: number;
        objectType: string;
        name: string;
        startBeats: number;
        durationBeats: number;
        backgroundColor: number;
      }>;
    }
  | {
      type: 'moveScoreObjects';
      moves: Array<{
        target: ScoreObjectEditorTargetSnapshot;
        targetStartBeats: number;
        targetLayerIndex: number;
        targetGroupId: string;
      }>;
    }
  | {
      type: 'removeScoreObjects';
      targets: ScoreObjectEditorTargetSnapshot[];
    }
  | {
      type: 'addLayer';
      groupId: string;
      layerIndex: number;
    }
  | {
      type: 'removeLayer';
      groupId: string;
      layerIndex: number;
    };

// ─── End Score Snapshot Types ───

export type TempoCurveTypeSnapshot = 'constant' | 'linear';

export interface TempoPointSnapshot {
  beat: number;
  tempo: number;
  curveType: TempoCurveTypeSnapshot;
}

export interface TempoMapSnapshot {
  enabled: boolean;
  points: TempoPointSnapshot[];
}

export interface MeterSnapshot {
  measure: number;
  numBeats: number;
  beatLength: number;
}

export interface MeterMapSnapshot {
  entries: MeterSnapshot[];
}

interface MeterMapLike {
  getEntries(): ReadonlyArray<{
    measure: number;
    meter: {
      numBeats: number;
      beatLength: number;
    };
  }>;
}

export interface ToolbarProjectTransportSnapshot {
  renderStartTime: number;
  renderEndTime: number;
  loopRendering: boolean;
  tempoMap: TempoMapSnapshot;
  meterMap: MeterMapSnapshot;
  sampleRate: number;
  smpteFrameRate: number;
}

export interface PlaybackClockSnapshot {
  sessionId: number;
  sampleFrames: number;
  sequence: number;
  sampleRate?: number;
  ksmps?: number;
}

export interface ProjectPropertiesSnapshot {
  title: string;
  author: string;
  notes: string;
  sampleRate: string;
  ksmps: string;
  nchnls: string;
  useZeroDbFS: boolean;
  zeroDbFS: string;
  diskSampleRate: string;
  diskKsmps: string;
  diskChannels: string;
  diskUseZeroDbFS: boolean;
  diskZeroDbFS: string;
  useAudioOut: boolean;
  useAudioIn: boolean;
  useMidiIn: boolean;
  useMidiOut: boolean;
  noteAmpsEnabled: boolean;
  outOfRangeEnabled: boolean;
  warningsEnabled: boolean;
  benchmarkEnabled: boolean;
  advancedSettings: string;
  completeOverride: boolean;
  fileName: string;
  askOnRender: boolean;
  diskNoteAmpsEnabled: boolean;
  diskOutOfRangeEnabled: boolean;
  diskWarningsEnabled: boolean;
  diskBenchmarkEnabled: boolean;
  diskAdvancedSettings: string;
  diskCompleteOverride: boolean;
  diskAlwaysRenderEntireProject: boolean;
  mediaFolder: string;
  copyToMediaFileOnImport: boolean;
}

export interface LiveObjectCellSnapshot {
  uniqueId: string;
  enabled: boolean;
  keyTrigger: number;
  midiTrigger: number;
  displayName: string;
  soundObjectType: string;
  hasSoundObject: boolean;
}

export interface LiveObjectBinsSnapshot {
  columns: number;
  rows: number;
  cells: Array<Array<LiveObjectCellSnapshot | null>>;
}

export interface LiveObjectSetSnapshot {
  name: string;
  liveObjectIds: string[];
}

export interface BlueLiveProjectSnapshot {
  commandLine: string;
  commandLineEnabled: boolean;
  commandLineOverride: boolean;
  tempo: number;
  repeat: number;
  repeatEnabled: boolean;
  liveCodeText: string;
  bins: LiveObjectBinsSnapshot;
  sets: LiveObjectSetSnapshot[];
}

export interface MidiScaleSnapshot {
  scaleName: string;
  baseFrequency: number;
  octave: number;
  ratios: number[];
}

export interface MidiInputProcessorSnapshot {
  keyMapping: string;
  velocityMapping: string;
  pitchConstant: string;
  ampConstant: string;
  scale: MidiScaleSnapshot | null;
}

export type MixerChannelKind = 'instrument' | 'subChannel' | 'master';
export type MixerChainKind = 'pre' | 'post';

export interface EffectSnapshot {
  effectXml: string;
  name: string;
  enabled: boolean;
  numIns: number;
  numOuts: number;
  style: 'CLASSIC' | 'MODERN';
  code: string;
  comments: string;
  editEnabled: boolean;
  gridSettings: GridSettingsSnapshot;
  objectNames: string[];
  widgets: BsbWidgetSnapshot[];
  widgetTree: BsbWidgetNodeSnapshot;
  udos: UdoDefinitionSnapshot[];
}

export interface EffectEditorSnapshot extends EffectSnapshot {
  effectId: string;
  ownerType: 'project' | 'library';
  projectRef?: ProjectEffectRef;
  libraryRef?: LibraryEffectRef;
}

export interface EffectEditorRequest {
  effectId: string;
  ownerType: 'project' | 'library';
  projectRef?: ProjectEffectRef;
  libraryRef?: LibraryEffectRef;
}

export interface EffectEditorPatchRequest extends EffectEditorRequest {
  patch: EffectEditablePatch;
}

export interface ProjectEffectRef {
  channelId: string;
  chain: MixerChainKind;
  entryId: string;
}

export interface LibraryEffectRef {
  libraryEffectId: string;
}

export interface MixerEffectEntrySnapshot extends EffectSnapshot {
  entryId: string;
  kind: 'effect';
  projectRef?: ProjectEffectRef;
  libraryRef?: LibraryEffectRef;
}

export interface MixerSendEntrySnapshot {
  entryId: string;
  kind: 'send';
  sendChannel: string;
  level: number;
  enabled: boolean;
}

export type MixerChainEntrySnapshot = MixerEffectEntrySnapshot | MixerSendEntrySnapshot;

export interface MixerChannelSnapshot {
  id: string;
  name: string;
  channelKind: MixerChannelKind;
  association?: string;
  outChannel: string;
  muted: boolean;
  solo: boolean;
  level: number;
  volume: number;
  pan: number;
  preChain: MixerChainEntrySnapshot[];
  postChain: MixerChainEntrySnapshot[];
}

export interface MixerSnapshot {
  enabled: boolean;
  extraRenderTime: number;
  channels: MixerChannelSnapshot[];
  subChannels: MixerChannelSnapshot[];
  master: MixerChannelSnapshot;
}

export interface MixerChannelEditableFields {
  name: string;
  outChannel: string;
  muted: boolean;
  solo: boolean;
  level: number;
  volume: number;
  pan: number;
}

export interface EffectEditablePatch {
  effectXml?: string;
  name?: string;
  enabled?: boolean;
  numIns?: number;
  numOuts?: number;
  style?: 'CLASSIC' | 'MODERN';
  code?: string;
  comments?: string;
  bsbInterface?: BsbInterfacePatch;
  opcodeList?: EmbeddedOpcodeListPatch;
}

export interface MixerEffectPatch {
  effectXml?: string;
  name?: string;
  enabled?: boolean;
  numIns?: number;
  numOuts?: number;
  style?: 'CLASSIC' | 'MODERN';
  code?: string;
  comments?: string;
  bsbInterface?: BsbInterfacePatch;
  opcodeList?: EmbeddedOpcodeListPatch;
}

export type MixerFollowUpPatch =
  | { type: 'duplicateChainEntry'; channelId: string; chain: MixerChainKind; entryId: string }
  | { type: 'copyChainEntry'; channelId: string; chain: MixerChainKind; entryId: string }
  | { type: 'pasteChainEntries'; channelId: string; chain: MixerChainKind; index?: number; payload: MixerChainClipboardPayload }
  | { type: 'moveChainEntryAcrossChains'; fromChannelId: string; fromChain: MixerChainKind; toChannelId: string; toChain: MixerChainKind; entryId: string; index?: number };

export interface MixerChainClipboardPayload {
  sourceKind: 'project';
  entries: MixerChainEntrySnapshot[];
}

export type MixerPatch =
  | { type: 'setMixerEnabled'; value: boolean }
  | { type: 'updateExtraRenderTime'; value: number }
  | { type: 'updateChannel'; channelId: string; patch: Partial<MixerChannelEditableFields> }
  | { type: 'addSubChannel'; name?: string; insertIndex?: number; channelId?: string }
  | { type: 'removeSubChannel'; channelId: string }
  | { type: 'addEffectFromLibrary'; channelId: string; chain: MixerChainKind; libraryEffectId: string; effectXml?: string; insertIndex?: number; entryId?: string }
  | { type: 'addSend'; channelId: string; chain: MixerChainKind; sendChannel?: string; level?: number; insertIndex?: number; entryId?: string }
  | { type: 'updateSend'; channelId: string; chain: MixerChainKind; entryId: string; patch: { sendChannel?: string; level?: number; enabled?: boolean } }
  | { type: 'updateEffect'; channelId: string; chain: MixerChainKind; entryId: string; patch: EffectEditablePatch }
  | { type: 'removeChainEntry'; channelId: string; chain: MixerChainKind; entryId: string }
  | { type: 'reorderChainEntry'; channelId: string; chain: MixerChainKind; from: number; to: number }
  | MixerFollowUpPatch;

export interface EffectsLibraryCategorySnapshot {
  categoryId: string;
  name: string;
  categories: EffectsLibraryCategorySnapshot[];
  effects: LibraryEffectSnapshot[];
}

export interface LibraryEffectSnapshot extends EffectSnapshot {
  libraryEffectId: string;
  categoryId?: string;
}

export interface EffectsLibrarySnapshot {
  loaded: boolean;
  sourcePath: string | null;
  loadError?: string;
  root: EffectsLibraryCategorySnapshot;
}

export type EffectsLibraryPatch =
  | { type: 'addCategory'; parentCategoryId?: string; name?: string; insertIndex?: number; categoryId?: string }
  | { type: 'addEffect'; parentCategoryId?: string; name?: string; insertIndex?: number; effectId?: string }
  | { type: 'renameCategory'; categoryId: string; name: string }
  | { type: 'reorderCategory'; parentCategoryId?: string; from: number; to: number }
  | { type: 'removeCategory'; categoryId: string }
  | { type: 'renameEffect'; effectId: string; name: string }
  | { type: 'duplicateEffect'; effectId: string; insertIndex?: number; libraryEffectId?: string }
  | { type: 'removeEffect'; effectId: string }
  | { type: 'updateEffect'; effectId: string; patch: EffectEditablePatch }
  | { type: 'pasteCategory'; parentCategoryId?: string; sourceSnapshot: EffectsLibraryCategorySnapshot }
  | { type: 'pasteEffect'; parentCategoryId?: string; sourceEffect: LibraryEffectSnapshot }
  | { type: 'moveNode'; nodeId: string; targetParentCategoryId?: string; targetIndex: number };

export type MidiInputPatch =
  | { type: 'updateKeyMapping'; value: string }
  | { type: 'updateVelocityMapping'; value: string }
  | { type: 'updatePitchConstant'; value: string }
  | { type: 'updateAmpConstant'; value: string }
  | { type: 'updateScale'; scale: MidiScaleSnapshot | null };

export interface BlueLiveNoteTriggerRequest {
  type: 'noteOn' | 'noteOff';
  midiNote: number;
  velocity: number;
  channel: number;
  source: 'mouse' | 'computer';
}

export interface BlueLiveNoteTriggerResult {
  ok: boolean;
  message?: string;
  submittedScoreText?: string;
}

export type BlueLivePatch =
  | { type: 'updateOptions'; patch: Partial<Pick<BlueLiveProjectSnapshot, 'commandLine' | 'commandLineEnabled' | 'commandLineOverride'>> }
  | { type: 'updateTempoRepeat'; patch: Partial<Pick<BlueLiveProjectSnapshot, 'tempo' | 'repeat' | 'repeatEnabled'>> }
  | { type: 'updateLiveCodeText'; text: string }
  | { type: 'setCellEnabled'; column: number; row: number; enabled: boolean }
  | { type: 'insertRow'; index: number }
  | { type: 'removeRow'; index: number }
  | { type: 'insertColumn'; index: number }
  | { type: 'removeColumn'; index: number }
  | { type: 'captureEnabledSet' }
  | { type: 'renameSet'; index: number; name: string }
  | { type: 'removeSet'; index: number }
  | { type: 'moveSet'; from: number; to: number }
  | { type: 'applySet'; index: number };

export interface ProjectEditorSnapshot {
  filePath: string | null;
  version: string;
  sessionId: number;
  globalOrc: string;
  globalSco: string;
  orchestra: OrchestraSnapshot;
  mixer?: MixerSnapshot;
  projectProperties: ProjectPropertiesSnapshot;
  transport: ToolbarProjectTransportSnapshot;
  tablesText: string;
  projectUdos: UdoDefinitionSnapshot[];
  loaded: boolean;
  blueLive?: BlueLiveProjectSnapshot;
  midiInput?: MidiInputProcessorSnapshot;
  score?: ScoreDocumentSnapshot;
}

export interface ProjectSummarySnapshot {
  title?: string;
  author?: string;
  sampleRate?: string;
  version?: string;
  filePath?: string | null;
}

export interface ProjectDocumentPatch {
  globalOrc?: string;
  globalSco?: string;
  orchestra?: OrchestraPatch;
  mixer?: MixerPatch;
  projectProperties?: Partial<ProjectPropertiesSnapshot>;
  transport?: Partial<Pick<ToolbarProjectTransportSnapshot, 'renderStartTime' | 'renderEndTime' | 'loopRendering'>> & {
    tempoMap?: Partial<TempoMapSnapshot>;
  };
  tablesText?: string;
  projectUdo?: ProjectUdoPatch;
  blueLive?: BlueLivePatch;
  midiInput?: MidiInputPatch;
  score?: ScorePatch;
}

export interface ProjectDocumentCommitReceipt {
  revision: number;
  sessionId: number;
}

export type BsbRealtimeControlKind = 'value' | 'selected' | 'selectedIndex' | 'xy' | 'sliderBank';

export interface BsbRealtimeControlUpdate {
  assignmentId: string;
  widgetId: string;
  kind: BsbRealtimeControlKind;
  payload: Record<string, number | boolean>;
}

export interface MixerRealtimeLevelUpdate {
  channelId: string;
  level: number;
}

export interface EffectRealtimeUpdate {
  channelId: string;
  chain: 'pre' | 'post';
  entryId: string;
  bsbWidgetValues?: Record<string, number>;
}

export type SupportedNewInstrumentType =
  | 'generic'
  | 'python'
  | 'javascript'
  | 'blueX7'
  | 'blueSynthBuilder';

export type InstrumentSnapshot =
  | GenericInstrumentSnapshot
  | JavaScriptInstrumentSnapshot
  | PythonInstrumentSnapshot
  | BlueX7InstrumentSnapshot
  | BlueSynthBuilderInstrumentSnapshot
  | UnknownInstrumentSnapshot;

export interface InstrumentSnapshotBase {
  assignmentId: string;
  type: string;
  name: string;
  enabled: boolean;
  comment: string;
}

export interface GenericInstrumentSnapshot extends InstrumentSnapshotBase {
  type: 'generic';
  text: string;
  globalOrc: string;
  globalSco: string;
  udolist: UdoDefinitionSnapshot[];
}

export interface JavaScriptInstrumentSnapshot extends InstrumentSnapshotBase {
  type: 'javascript';
  text: string;
  globalOrc: string;
  globalSco: string;
  udolist: UdoDefinitionSnapshot[];
}

export interface PythonInstrumentSnapshot extends InstrumentSnapshotBase {
  type: 'python';
  text: string;
  globalOrc: string;
  globalSco: string;
}

export interface BlueX7InstrumentSnapshot extends InstrumentSnapshotBase {
  type: 'blueX7';
}

export interface BlueSynthBuilderInstrumentSnapshot extends InstrumentSnapshotBase {
  type: 'blueSynthBuilder';
  instrumentText: string;
  alwaysOnInstrumentText: string;
  globalOrc: string;
  globalSco: string;
  objectNames: string[];
  widgets: BsbWidgetSnapshot[];
  editEnabled: boolean;
  gridSettings: GridSettingsSnapshot;
  widgetTree: BsbWidgetNodeSnapshot;
  presetGroup?: PresetGroupSnapshot;
  opcodeListText?: string;
  udolist?: UdoDefinitionSnapshot[];
}

export interface UdoDefinitionSnapshot {
  name: string;
  style: 'CLASSIC' | 'MODERN';
  outTypes: string;
  inTypes: string;
  inputArguments: string;
  code: string;
  comments: string;
}

export type EmbeddedOpcodeListPatch =
  | { type: 'addUdo'; index?: number; definition?: UdoDefinitionSnapshot }
  | { type: 'removeUdo'; index: number }
  | { type: 'updateUdo'; index: number; patch: Partial<UdoDefinitionSnapshot> }
  | { type: 'convertUdoStyle'; index: number; style: 'CLASSIC' | 'MODERN' }
  | { type: 'reorderUdo'; from: number; to: number };

export type ProjectUdoPatch =
  | { type: 'add'; index?: number; definition?: UdoDefinitionSnapshot }
  | { type: 'remove'; index: number }
  | { type: 'update'; index: number; patch: Partial<UdoDefinitionSnapshot> }
  | { type: 'reorder'; from: number; to: number }
  | { type: 'convertStyle'; index: number; style: 'CLASSIC' | 'MODERN' };

export interface BsbWidgetSnapshot {
  objectName: string;
  widgetType: string;
  value: number;
  minimum: number;
  maximum: number;
}

export interface GridSettingsSnapshot {
  enabled: boolean;
  snapEnabled: boolean;
  width: number;
  height: number;
  gridStyle: 'NONE' | 'DOT' | 'LINE';
}

export interface BsbWidgetNodeSnapshot {
  id: string;
  type: string;
  objectName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  minimum: number;
  maximum: number;
  editable: boolean;
  preservedOnly?: boolean;
  properties: Record<string, unknown>;
  children?: BsbWidgetNodeSnapshot[];
}

export interface PresetGroupSnapshot {
  name: string;
  currentPresetUniqueId?: string;
  currentPresetModified: boolean;
  subGroups: PresetGroupSnapshot[];
  presets: PresetSnapshot[];
}

export interface PresetSnapshot {
  uniqueId: string;
  name: string;
  values?: Record<string, string>;
}

export type BsbInterfacePatch =
  | { type: 'setEditEnabled'; value: boolean }
  | { type: 'selectWidget'; widgetId?: string }
  | { type: 'updateWidgetProperties'; widgetId: string; properties: Record<string, unknown> }
  | { type: 'updateSliderBankValue'; widgetId: string; sliderIndex: number; value: number }
  | { type: 'moveWidget'; widgetId: string; x: number; y: number }
  | { type: 'resizeWidget'; widgetId: string; width: number; height: number }
  | { type: 'addWidget'; widgetType: string; x: number; y: number; parentGroupId?: string }
  | { type: 'removeWidget'; widgetId: string }
  | { type: 'updateGridSettings'; patch: Partial<GridSettingsSnapshot> }
  | { type: 'applyPreset'; presetUniqueId: string }
  | { type: 'updatePreset'; presetUniqueId: string }
  | { type: 'addPreset'; presetName: string; presetGroupPath?: string }
  | { type: 'addPresetGroup'; groupName: string; parentGroupPath?: string }
  | { type: 'synchronizePresets' }
  | { type: 'updateEmbeddedOpcodeList'; opcodeList: string }
  | { type: 'addUdo'; index?: number; definition?: UdoDefinitionSnapshot }
  | { type: 'removeUdo'; index: number }
  | { type: 'updateUdo'; index: number; patch: Partial<UdoDefinitionSnapshot> }
  | { type: 'convertUdoStyle'; index: number; style: 'CLASSIC' | 'MODERN' }
  | { type: 'reorderUdo'; from: number; to: number }
  | { type: 'randomize' }
  | { type: 'makeGroup'; widgetIds: string[]; parentGroupId?: string }
  | { type: 'breakGroup'; widgetId: string }
  | { type: 'pasteWidgets'; widgetData: string; parentGroupId?: string };

// ─── Sound Score Object Editor Types ───

export type SoundEditorTab = 'interface' | 'automation' | 'code' | 'udo' | 'comments';

export interface SoundAutomationParameterSnapshot {
  parameterId: string;
  name: string;
  label: string;
  automationEnabled: boolean;
  value: number;
  minimum: number;
  maximum: number;
  curve: string;
  points: Array<{ x: number; y: number }>;
}

export interface SoundEditorPayload {
  comment: string;
  bsbInstrument: BlueSynthBuilderInstrumentSnapshot | null;
  automationParameters: SoundAutomationParameterSnapshot[];
  availableTabs: SoundEditorTab[];
  testAvailable: boolean;
  deferredCapabilities: string[];
}

// ─── End Sound Score Object Editor Types ───

export interface UnknownInstrumentSnapshot extends InstrumentSnapshotBase {
  type: 'unknown';
  instrumentType: string;
}

export interface ArrangementRowSnapshot {
  assignmentId: string;
  enabled: boolean;
  instrumentName: string;
  instrumentType: InstrumentSnapshot['type'];
  instrumentSummary?: string;
  editable: boolean;
}

export interface ArrangementSnapshot {
  rows: ArrangementRowSnapshot[];
}

export interface TemporaryInstrumentLibrarySnapshot {
  status: 'deferred';
  message: string;
}

export interface OrchestraSnapshot {
  loaded: boolean;
  arrangement: ArrangementSnapshot;
  instruments: InstrumentSnapshot[];
  temporaryLibrary: TemporaryInstrumentLibrarySnapshot;
}

export type InstrumentPatch = Partial<{
  name: string;
  enabled: boolean;
  comment: string;
  text: string;
  instrumentText: string;
  alwaysOnInstrumentText: string;
  globalOrc: string;
  globalSco: string;
  bsbWidgetValues: Record<string, number>;
  bsbOpcodeListText: string;
  bsbInterface: BsbInterfacePatch;
  embeddedOpcodeList: EmbeddedOpcodeListPatch;
}>;

export type OrchestraPatch =
  | {
      type: 'addInstrument';
      instrumentType: SupportedNewInstrumentType;
      insertAfterAssignmentId?: string;
    }
  | { type: 'removeAssignment'; assignmentId: string }
  | {
      type: 'duplicateAssignment';
      sourceAssignmentId: string;
    }
  | {
      type: 'pasteInstrument';
      instrument: InstrumentSnapshot;
    }
  | {
      type: 'updateAssignment';
      assignmentId: string;
      enabled?: boolean;
      nextAssignmentId?: string;
    }
  | {
      type: 'replaceInstrument';
      assignmentId: string;
      instrumentType: SupportedNewInstrumentType;
    }
  | { type: 'convertGenericToBsb'; assignmentId: string }
  | {
      type: 'updateInstrument';
      assignmentId: string;
      patch: InstrumentPatch;
    }
  | {
      type: 'updateInstrumentComment';
      assignmentId: string;
      comment: string;
    };

export type ProjectLoadedPayload = ProjectSummarySnapshot &
  Partial<
    Pick<
      ProjectEditorSnapshot,
      | 'sessionId'
      | 'globalOrc'
      | 'globalSco'
      | 'orchestra'
      | 'mixer'
      | 'projectProperties'
      | 'transport'
      | 'tablesText'
      | 'projectUdos'
      | 'loaded'
      | 'blueLive'
      | 'midiInput'
      | 'score'
    >
  >;

function createDefaultProjectPropertiesSnapshot(): ProjectPropertiesSnapshot {
  return {
    title: '',
    author: '',
    notes: '',
    sampleRate: '44100',
    ksmps: '64',
    nchnls: '2',
    useZeroDbFS: false,
    zeroDbFS: '32768',
    diskSampleRate: '44100',
    diskKsmps: '64',
    diskChannels: '2',
    diskUseZeroDbFS: false,
    diskZeroDbFS: '32768',
    useAudioOut: true,
    useAudioIn: false,
    useMidiIn: false,
    useMidiOut: false,
    noteAmpsEnabled: true,
    outOfRangeEnabled: true,
    warningsEnabled: true,
    benchmarkEnabled: true,
    advancedSettings: '',
    completeOverride: false,
    fileName: '',
    askOnRender: false,
    diskNoteAmpsEnabled: true,
    diskOutOfRangeEnabled: true,
    diskWarningsEnabled: true,
    diskBenchmarkEnabled: true,
    diskAdvancedSettings: '',
    diskCompleteOverride: false,
    diskAlwaysRenderEntireProject: false,
    mediaFolder: '',
    copyToMediaFileOnImport: true,
  };
}

export function createEmptyProjectPropertiesSnapshot(): ProjectPropertiesSnapshot {
  return createDefaultProjectPropertiesSnapshot();
}

export function createEmptyProjectEditorSnapshot(): ProjectEditorSnapshot {
  return {
    filePath: null,
    version: '',
    sessionId: 0,
    globalOrc: '',
    globalSco: '',
    orchestra: createEmptyOrchestraSnapshot(false),
    mixer: createEmptyMixerSnapshot(),
    projectProperties: createDefaultProjectPropertiesSnapshot(),
    transport: createEmptyToolbarProjectTransportSnapshot(),
    tablesText: '',
    projectUdos: [],
    loaded: false,
    score: createEmptyScoreDocumentSnapshot(),
  };
}

const MIXER_CHANNEL_IDS = new WeakMap<object, string>();
const MIXER_ENTRY_IDS = new WeakMap<object, string>();
let nextMixerSnapshotId = 1;

function assignMixerSnapshotId(
  map: WeakMap<object, string>,
  value: object,
  prefix: string,
  preferredId?: string,
): string {
  const existing = map.get(value);
  if (existing) {
    return existing;
  }

  const id = preferredId && preferredId.trim().length > 0
    ? preferredId.trim()
    : `${prefix}-${nextMixerSnapshotId++}`;
  map.set(value, id);
  return id;
}

export function getMixerChannelSnapshotId(channel: Channel, preferredId?: string): string {
  const association = channel.getAssociation().trim();
  if (association.length > 0) {
    return association;
  }

  if (channel.getName() === Mixer.MASTER_CHANNEL) {
    return 'master';
  }

  return assignMixerSnapshotId(MIXER_CHANNEL_IDS, channel, 'mixer-channel', preferredId);
}

export function getMixerEntrySnapshotId(entry: Effect | Send, preferredId?: string): string {
  return assignMixerSnapshotId(
    MIXER_ENTRY_IDS,
    entry,
    entry instanceof Effect ? 'mixer-effect' : 'mixer-send',
    preferredId,
  );
}

function toGridSettingsSnapshot(settings: {
  enabled: boolean;
  snapEnabled: boolean;
  width: number;
  height: number;
  gridStyle: string;
}): GridSettingsSnapshot {
  return {
    enabled: settings.enabled,
    snapEnabled: settings.snapEnabled,
    width: settings.width,
    height: settings.height,
    gridStyle: settings.gridStyle as GridSettingsSnapshot['gridStyle'],
  };
}

function collectGraphicInterfaceWidgets(graphicInterface: {
  getRootGroup(): {
    id?: string;
    getChildren(): unknown[];
  };
  getGridSettings(): {
    enabled: boolean;
    snapEnabled: boolean;
    width: number;
    height: number;
    gridStyle: string;
  };
  isEditEnabled(): boolean;
}): BsbWidgetSnapshot[] {
  const widgets: BsbWidgetSnapshot[] = [];
  const visit = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    const objectName =
      typeof record.getObjectName === 'function'
        ? (record.getObjectName as () => unknown)()
        : record.objectName ?? record._objectName;
    if (typeof objectName === 'string' && objectName.trim()) {
      widgets.push({
        objectName: objectName.trim(),
        widgetType:
          typeof record.constructor === 'function' && 'name' in record.constructor
            ? String(record.constructor.name)
            : 'BSBObject',
        value: typeof record.value === 'number' ? record.value : 0,
        minimum: typeof record.minimum === 'number' ? record.minimum : 0,
        maximum: typeof record.maximum === 'number' ? record.maximum : 1,
      });
    }

    const children =
      typeof record.getChildren === 'function'
        ? (record.getChildren as () => unknown[]).call(node)
        : record.children ?? record._children;
    if (Array.isArray(children)) {
      children.forEach(visit);
    }
  };

  visit(graphicInterface.getRootGroup());
  return widgets.sort((a, b) => a.objectName.localeCompare(b.objectName));
}

function collectGraphicInterfaceObjectNames(graphicInterface: {
  getRootGroup(): {
    id?: string;
    getChildren(): unknown[];
  };
  getGridSettings(): {
    enabled: boolean;
    snapEnabled: boolean;
    width: number;
    height: number;
    gridStyle: string;
  };
  isEditEnabled(): boolean;
}): string[] {
  return collectGraphicInterfaceWidgets(graphicInterface).map((widget) => widget.objectName);
}

function buildWidgetTreeNodeFromGraphicNode(widget: unknown): BsbWidgetNodeSnapshot | null {
  if (!widget || typeof widget !== 'object') return null;
  const record = widget as Record<string, unknown>;

  const id = typeof record.id === 'string' ? record.id : '';
  if (!id) return null;

  const ctorName = typeof record.constructor === 'function' && 'name' in record.constructor
    ? String(record.constructor.name)
    : 'Unknown';

  const preservedOnly = !KNOWN_WIDGET_TYPES.has(ctorName);

  const properties: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(record)) {
    if (['id', 'objectName', 'x', 'y', 'parameterName', '_children', 'children', 'stringChannel', 'labelFont', 'font'].includes(key)) continue;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null) {
      properties[key] = val as string | number | boolean | null;
    }
  }

  const fontKeys = ['labelFont', 'font'] as const;
  for (const fk of fontKeys) {
    const fv = record[fk];
    if (fv && typeof fv === 'object') {
      const f = fv as Record<string, unknown>;
      if (typeof f.name === 'string') properties[`${fk}.name`] = f.name;
      if (typeof f.size === 'number') properties[`${fk}.size`] = f.size;
      if (typeof f.style === 'number') properties[`${fk}.style`] = f.style;
    }
  }

  const dropdownItems = record.dropdownItems;
  if (Array.isArray(dropdownItems)) {
    properties['dropdownItems'] = dropdownItems;
  }

  const lines = record.lines;
  if (Array.isArray(lines)) {
    properties.lines = lines.map((line) => {
      if (!line || typeof line !== 'object') {
        return {
          varName: '',
          min: 0,
          max: 1,
          color: '#000000',
          points: [],
        };
      }

      const lineRecord = line as Record<string, unknown>;
      const points = Array.isArray(lineRecord.points)
        ? lineRecord.points.map((point) => {
            if (!point || typeof point !== 'object') {
              return { x: 0, y: 0 };
            }
            const pointRecord = point as Record<string, unknown>;
            return {
              x: typeof pointRecord.x === 'number' ? pointRecord.x : 0,
              y: typeof pointRecord.y === 'number' ? pointRecord.y : 0,
            };
          })
        : [];

      return {
        varName: typeof lineRecord.name === 'string' && lineRecord.name.trim().length > 0
          ? lineRecord.name
          : typeof lineRecord.varName === 'string'
            ? lineRecord.varName
            : '',
        min: typeof lineRecord.min === 'number' ? lineRecord.min : 0,
        max: typeof lineRecord.max === 'number' ? lineRecord.max : 1,
        color: normalizeBsbLineColor(lineRecord.color),
        resolution: typeof lineRecord.resolution === 'string' ? lineRecord.resolution : undefined,
        rightBound: typeof lineRecord.rightBound === 'boolean' ? lineRecord.rightBound : undefined,
        endPointsLinked: typeof lineRecord.endPointsLinked === 'boolean' ? lineRecord.endPointsLinked : undefined,
        points,
      };
    });
  }

  const sliders = record.sliders;
  if (Array.isArray(sliders)) {
    properties.sliders = sliders.map((slider) => {
      if (!slider || typeof slider !== 'object') {
        return { value: 0 };
      }
      const sliderRecord = slider as Record<string, unknown>;
      return {
        value: typeof sliderRecord.value === 'number' ? sliderRecord.value : 0,
      };
    });
  }

  const children = typeof record.getChildren === 'function'
    ? (record.getChildren as () => unknown[]).call(widget)
    : record.children ?? record._children;

  return {
    id,
    type: ctorName,
    objectName: typeof record.objectName === 'string' ? record.objectName : '',
    x: typeof record.x === 'number' ? record.x : 0,
    y: typeof record.y === 'number' ? record.y : 0,
    width:
      typeof record.width === 'number'
        ? record.width
        : typeof record.sliderWidth === 'number'
          ? record.sliderWidth
          : typeof record.textFieldWidth === 'number'
            ? record.textFieldWidth
            : typeof record.canvasWidth === 'number'
              ? record.canvasWidth
              : 60,
    height:
      typeof record.height === 'number'
        ? record.height
        : typeof record.sliderHeight === 'number'
          ? record.sliderHeight
          : typeof record.canvasHeight === 'number'
            ? record.canvasHeight + BSB_LINE_SELECTOR_HEIGHT
            : 24,
    value: typeof record.value === 'number' ? record.value : 0,
    minimum: typeof record.minimum === 'number' ? record.minimum : 0,
    maximum: typeof record.maximum === 'number' ? record.maximum : 1,
    editable: !preservedOnly,
    preservedOnly,
    properties,
    children: Array.isArray(children)
      ? children
          .map((child) => buildWidgetTreeNodeFromGraphicNode(child))
          .filter((node): node is BsbWidgetNodeSnapshot => Boolean(node))
      : undefined,
  };
}

function buildWidgetTreeSnapshotFromGraphicInterface(graphicInterface: {
  getRootGroup(): {
    id?: string;
    getChildren(): unknown[];
  };
}): BsbWidgetNodeSnapshot {
  const rootGroup = graphicInterface.getRootGroup();
  const children: BsbWidgetNodeSnapshot[] = [];

  for (const child of rootGroup.getChildren()) {
    const node = buildWidgetTreeNodeFromGraphicNode(child);
    if (node) {
      children.push(node);
    }
  }

  return {
    id: rootGroup.id || 'root',
    type: 'BSBRootGroup',
    objectName: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    value: 0,
    minimum: 0,
    maximum: 1,
    editable: true,
    properties: {},
    children,
  };
}

function createEffectSnapshotBase(effect: Effect): EffectSnapshot {
  const graphicInterface = effect.getGraphicInterface();
  return {
    effectXml: effect.saveAsXML().toXml(),
    name: effect.getName(),
    enabled: effect.isEnabled(),
    numIns: effect.getNumIns(),
    numOuts: effect.getNumOuts(),
    style: effect.getStyle(),
    code: effect.getCode(),
    comments: effect.getComments(),
    editEnabled: graphicInterface.isEditEnabled(),
    gridSettings: toGridSettingsSnapshot(graphicInterface.getGridSettings()),
    objectNames: collectGraphicInterfaceObjectNames(graphicInterface),
    widgets: collectGraphicInterfaceWidgets(graphicInterface),
    widgetTree: buildWidgetTreeSnapshotFromGraphicInterface(graphicInterface),
    udos: effect.getOpcodeList().getOpcodes().map(udoToSnapshot),
  };
}

export function createEffectEditorSnapshot(
  effect: Effect,
  effectId: string,
  ownerType: 'project' | 'library',
  refs?: {
    projectRef?: ProjectEffectRef;
    libraryRef?: LibraryEffectRef;
  },
): EffectEditorSnapshot {
  return {
    ...createEffectSnapshotBase(effect),
    effectId,
    ownerType,
    projectRef: refs?.projectRef,
    libraryRef: refs?.libraryRef,
  };
}

export function createMixerEffectEntrySnapshot(
  effect: Effect,
  entryId: string,
  refs?: {
    projectRef?: ProjectEffectRef;
    libraryRef?: LibraryEffectRef;
  },
): MixerEffectEntrySnapshot {
  return {
    ...createEffectSnapshotBase(effect),
    entryId,
    kind: 'effect',
    projectRef: refs?.projectRef,
    libraryRef: refs?.libraryRef,
  };
}

export function createLibraryEffectSnapshot(
  effect: Effect,
  libraryEffectId: string,
  categoryId?: string,
): LibraryEffectSnapshot {
  return {
    ...createEffectSnapshotBase(effect),
    libraryEffectId,
    categoryId,
  };
}

function createMixerSendEntrySnapshot(send: Send, entryId: string): MixerSendEntrySnapshot {
  return {
    entryId,
    kind: 'send',
    sendChannel: send.getSendChannel(),
    level: send.getLevel(),
    enabled: send.isEnabled(),
  };
}

function createMixerChainSnapshot(
  chain: Array<Effect | Send>,
  refs: {
    channelId: string;
    chain: MixerChainKind;
    libraryRef?: LibraryEffectRef;
  },
): MixerChainEntrySnapshot[] {
  return chain.map((entry) => {
    if (entry instanceof Effect) {
      const entryId = getMixerEntrySnapshotId(entry);
      return {
        ...createEffectSnapshotBase(entry),
        entryId,
        kind: 'effect',
        projectRef: {
          channelId: refs.channelId,
          chain: refs.chain,
          entryId,
        },
        libraryRef: refs.libraryRef,
      };
    }

    return createMixerSendEntrySnapshot(entry, getMixerEntrySnapshotId(entry));
  });
}

function createMixerChannelSnapshot(
  channel: Channel,
  channelKind: MixerChannelKind,
  refs?: {
    libraryRef?: LibraryEffectRef;
  },
): MixerChannelSnapshot {
  const id = getMixerChannelSnapshotId(channel);
  return {
    id,
    name: channel.getName(),
    channelKind,
    association: channel.getAssociation() || undefined,
    outChannel: channel.getOutChannel(),
    muted: channel.isMuted(),
    solo: channel.isSolo(),
    level: channel.getLevel(),
    volume: channel.getVolume(),
    pan: channel.getPan(),
    preChain: createMixerChainSnapshot(channel.getPreEffects(), {
      channelId: id,
      chain: 'pre',
      libraryRef: refs?.libraryRef,
    }),
    postChain: createMixerChainSnapshot(channel.getPostEffects(), {
      channelId: id,
      chain: 'post',
      libraryRef: refs?.libraryRef,
    }),
  };
}

export function createEmptyMixerSnapshot(): MixerSnapshot {
  const master = new Channel();
  master.setName(Mixer.MASTER_CHANNEL);
  return {
    enabled: true,
    extraRenderTime: 0,
    channels: [],
    subChannels: [],
    master: createMixerChannelSnapshot(master, 'master'),
  };
}

export function createMixerSnapshot(mixer: Mixer): MixerSnapshot {
  return {
    enabled: mixer.isEnabled(),
    extraRenderTime: mixer.getExtraRenderTime(),
    channels: mixer.getChannels().map((channel) =>
      createMixerChannelSnapshot(channel, 'instrument'),
    ),
    subChannels: mixer.getSubChannels().map((channel) =>
      createMixerChannelSnapshot(channel, 'subChannel'),
    ),
    master: createMixerChannelSnapshot(mixer.getMaster(), 'master'),
  };
}

export function createEmptyOrchestraSnapshot(loaded = false): OrchestraSnapshot {
  return {
    loaded,
    arrangement: { rows: [] },
    instruments: [],
    temporaryLibrary: {
      status: 'deferred',
      message: 'Program-wide orchestra library is deferred for this slice.',
    },
  };
}

export function createEmptyTempoMapSnapshot(): TempoMapSnapshot {
  return {
    enabled: false,
    points: [
      {
        beat: 0,
        tempo: 60,
        curveType: 'constant',
      },
    ],
  };
}

export function createEmptyMeterMapSnapshot(): MeterMapSnapshot {
  return {
    entries: [
      {
        measure: 1,
        numBeats: 4,
        beatLength: 4,
      },
    ],
  };
}

export function createTempoMapSnapshot(tempoMap: TempoMap): TempoMapSnapshot {
  return {
    enabled: tempoMap.isEnabled(),
    points: tempoMap.getTempoPoints().map((point) => ({
      beat: point.beat,
      tempo: point.tempo,
      curveType: point.curveType === 'CONSTANT' ? 'constant' : 'linear',
    })),
  };
}

export function createMeterMapSnapshot(meterMap: MeterMapLike): MeterMapSnapshot {
  return {
    entries: meterMap.getEntries().map((entry) => ({
      measure: entry.measure,
      numBeats: entry.meter.numBeats,
      beatLength: entry.meter.beatLength,
    })),
  };
}

export function createEmptyToolbarProjectTransportSnapshot(): ToolbarProjectTransportSnapshot {
  return {
    renderStartTime: 0,
    renderEndTime: -1,
    loopRendering: false,
    tempoMap: createEmptyTempoMapSnapshot(),
    meterMap: createEmptyMeterMapSnapshot(),
    sampleRate: 44100,
    smpteFrameRate: 30,
  };
}

export function createToolbarProjectTransportSnapshot(
  data: BlueData,
): ToolbarProjectTransportSnapshot {
  const timeContext = data.getScore().getTimeContext();
  return {
    renderStartTime: data.getRenderStartTime(),
    renderEndTime: data.getRenderEndTime(),
    loopRendering: data.isLoopRendering(),
    tempoMap: createTempoMapSnapshot(
      data.getScore().getTimeContext().getTempoMap(),
    ),
    meterMap: createMeterMapSnapshot(timeContext.getMeterMap()),
    sampleRate: Number(data.getProjectProperties().sampleRate) || 44100,
    smpteFrameRate: timeContext.getSmpteFramesPerSecond(),
  };
}

export function createProjectPropertiesSnapshot(
  properties: ProjectProperties,
): ProjectPropertiesSnapshot {
  return {
    title: properties.title,
    author: properties.author,
    notes: properties.notes,
    sampleRate: properties.sampleRate,
    ksmps: properties.ksmps,
    nchnls: properties.nchnls,
    useZeroDbFS: properties.useZeroDbFS,
    zeroDbFS: properties.zeroDbFS,
    diskSampleRate: properties.diskSampleRate,
    diskKsmps: properties.diskKsmps,
    diskChannels: properties.diskChannels,
    diskUseZeroDbFS: properties.diskUseZeroDbFS,
    diskZeroDbFS: properties.diskZeroDbFS,
    useAudioOut: properties.useAudioOut,
    useAudioIn: properties.useAudioIn,
    useMidiIn: properties.useMidiIn,
    useMidiOut: properties.useMidiOut,
    noteAmpsEnabled: properties.noteAmpsEnabled,
    outOfRangeEnabled: properties.outOfRangeEnabled,
    warningsEnabled: properties.warningsEnabled,
    benchmarkEnabled: properties.benchmarkEnabled,
    advancedSettings: properties.advancedSettings,
    completeOverride: properties.completeOverride,
    fileName: properties.fileName,
    askOnRender: properties.askOnRender,
    diskNoteAmpsEnabled: properties.diskNoteAmpsEnabled,
    diskOutOfRangeEnabled: properties.diskOutOfRangeEnabled,
    diskWarningsEnabled: properties.diskWarningsEnabled,
    diskBenchmarkEnabled: properties.diskBenchmarkEnabled,
    diskAdvancedSettings: properties.diskAdvancedSettings,
    diskCompleteOverride: properties.diskCompleteOverride,
    diskAlwaysRenderEntireProject: properties.diskAlwaysRenderEntireProject,
    mediaFolder: properties.mediaFolder,
    copyToMediaFileOnImport: properties.copyToMediaFileOnImport,
  };
}

// ─── Score Snapshot Helpers ───

const LAYER_GROUP_ID_MAP = new WeakMap<object, string>();
let nextLayerGroupId = 1;

function assignLayerGroupId(obj: object): string {
  const existing = LAYER_GROUP_ID_MAP.get(obj);
  if (existing) return existing;
  const id = `lg-${nextLayerGroupId++}`;
  LAYER_GROUP_ID_MAP.set(obj, id);
  return id;
}

function createScoreTimeStateSnapshot(data: BlueData): ScoreTimeStateSnapshot {
  const ts = data.getScore().getTimeState();
  return {
    snapEnabled: ts.isSnapEnabled(),
    snapValue: ts.getSnapValue(),
    primaryTimeDisplay: ts.getTimeDisplay(),
    secondaryTimeDisplay: ts.getSecondaryTimeDisplay(),
    secondaryRulerEnabled: ts.isSecondaryRulerEnabled(),
    tempoRowVisible: ts.isTempoRowVisible(),
    meterRowVisible: ts.isMeterRowVisible(),
    markersRowVisible: ts.isMarkersRowVisible(),
    smpteFrameRate: ts.getSmpteFrameRate(),
    zoomIterations: ts.getZoomIterations(),
  };
}

function createMarkerSnapshots(data: BlueData): MarkerSnapshot[] {
  const markers: MarkerSnapshot[] = [];
  const markersList = data.getMarkersList();
  if (!markersList) return markers;
  const elements = markersList.getMarkers();
  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i];
    if (!elem) continue;
    const name = elem.getAttribute('name') ?? elem.getName() ?? '';
    const timeText = elem.getTextString() ?? elem.getAttribute('time') ?? '0';
    const time = parseFloat(timeText) || 0;
    markers.push({ name, time, sourceIndex: i });
  }
  return markers;
}

function createScoreLayerGroupSnapshots(data: BlueData): ScoreLayerGroupSnapshot[] {
  const score = data.getScore();
  const context = score.getTimeContext();
  const result: ScoreLayerGroupSnapshot[] = [];

  for (let i = 0; i < score.length; i++) {
    const lg = score[i];
    if (!lg) continue;

    if (lg instanceof PolyObject) {
      result.push(createPolyObjectGroupSnapshot(lg, context, i));
    } else if (lg instanceof AudioLayerGroup) {
      result.push(createAudioLayerGroupSnapshot(lg, context, i));
    } else if (lg instanceof PatternsLayerGroup) {
      result.push(createPatternsLayerGroupSnapshot(lg));
    }
  }

  return result;
}

function createPolyObjectGroupSnapshot(lg: PolyObject, context: import('@blue/data').TimeContext, rootGroupIndex: number): PolyObjectLayerGroupSnapshot {
  const groupId = assignLayerGroupId(lg);
  const layers: ScoreLayerSnapshot[] = [];

  for (let i = 0; i < lg.length; i++) {
    const layer = lg[i];
    const items: ScoreRowObjectSnapshot[] = [];
    for (let j = 0; j < layer.length; j++) {
      const sObj = layer[j];
      const location: ScoreObjectLocationRef = { rootGroupIndex, containerPath: [], layerIndex: i, objectIndex: j };
      items.push({
        objectId: `sobj-${i}-${j}`,
        objectType: sObj.constructor.name,
        name: sObj.getName(),
        startBeats: sObj.getStartTime().toBeats(context),
        durationBeats: sObj.getSubjectiveDuration().toBeats(context),
        backgroundColor: sObj.getBackgroundColor(),
        isContainer: sObj instanceof PolyObject,
        editorTarget: buildEditorTargetSnapshot(sObj, `sobj-${i}-${j}`, location),
      });
    }
    layers.push({
      layerId: `${groupId}-layer-${i}`,
      name: layer.getName(),
      height: 44,
      items,
    });
  }

  return {
    groupId,
    groupType: 'polyObject',
    name: lg.getName(),
    layerCount: lg.length,
    isOpenableContainer: true,
    layers,
  };
}

function createAudioLayerGroupSnapshot(lg: AudioLayerGroup, context: import('@blue/data').TimeContext, rootGroupIndex: number): AudioLayerGroupSnapshot {
  const groupId = assignLayerGroupId(lg);
  const layers: ScoreLayerSnapshot[] = [];

  for (let i = 0; i < lg.length; i++) {
    const layer = lg[i];
    const items: ScoreRowObjectSnapshot[] = [];
    for (let j = 0; j < layer.length; j++) {
      const clip = layer[j];
      const location: ScoreObjectLocationRef = { rootGroupIndex, containerPath: [], layerIndex: i, objectIndex: j };
      items.push({
        objectId: `aclp-${i}-${j}`,
        objectType: 'AudioClip',
        name: clip.getName(),
        startBeats: clip.getStartTime().toBeats(context),
        durationBeats: clip.getSubjectiveDuration().toBeats(context),
        backgroundColor: 0x669966,
        isContainer: false,
        editorTarget: {
          selectionId: `aclp-${i}-${j}`,
          selectedObjectType: 'AudioClip',
          editorObjectType: 'AudioClip',
          ownerKind: 'timeline',
          displayContext: 'timeline',
          location,
          supportsTimeBehavior: false,
          supportsRepeatPoint: false,
          supportsNoteProcessorChain: false,
        },
      });
    }
    layers.push({
      layerId: `${groupId}-layer-${i}`,
      name: layer.getName(),
      height: 44,
      muted: layer.isMuted(),
      solo: layer.isSolo(),
      items,
    });
  }

  return {
    groupId,
    groupType: 'audio',
    name: lg.getName(),
    layerCount: lg.length,
    isOpenableContainer: false,
    layers,
  };
}

function createPatternsLayerGroupSnapshot(lg: PatternsLayerGroup): PatternsLayerGroupSnapshot {
  const groupId = assignLayerGroupId(lg);
  const layers: ScoreLayerSnapshot[] = [];

  for (let i = 0; i < lg.length; i++) {
    const layer = lg[i];
    layers.push({
      layerId: `${groupId}-layer-${i}`,
      name: layer.getName(),
      height: 44,
      muted: layer.isMuted(),
      solo: layer.isSolo(),
      items: [],
    });
  }

  return {
    groupId,
    groupType: 'patterns',
    name: lg.getName(),
    layerCount: lg.length,
    isOpenableContainer: false,
    layers,
  };
}

export function createScoreDocumentSnapshot(data: BlueData): ScoreDocumentSnapshot {
  return {
    timeState: createScoreTimeStateSnapshot(data),
    markers: createMarkerSnapshots(data),
    layerGroups: createScoreLayerGroupSnapshots(data),
  };
}

export function createEmptyScoreDocumentSnapshot(): ScoreDocumentSnapshot {
  return {
    timeState: {
      snapEnabled: false,
      snapValue: 'BEAT',
      primaryTimeDisplay: 'BEATS',
      secondaryTimeDisplay: 'TIME',
      secondaryRulerEnabled: false,
      tempoRowVisible: true,
      meterRowVisible: true,
      markersRowVisible: true,
      smpteFrameRate: 24,
      zoomIterations: 0,
    },
    markers: [],
    layerGroups: [],
  };
}

function buildEditorTargetSnapshot(
  sObj: SoundObject,
  selectionId: string,
  location: ScoreObjectLocationRef,
): ScoreObjectEditorTargetSnapshot {
  const isInstance = sObj instanceof Instance;
  const lib = isInstance ? (sObj as Instance).getSoundObject() : null;
  const libraryId = isInstance ? (sObj as Instance).getLibraryId() : null;

  if (isInstance && lib) {
    return {
      selectionId,
      selectedObjectType: 'Instance',
      editorObjectType: lib.constructor.name,
      ownerKind: 'library',
      displayContext: 'instance',
      sourceInstanceLocation: location,
      supportsTimeBehavior: true,
      supportsRepeatPoint: true,
      supportsNoteProcessorChain: true,
    };
  }

  const isSoundObject = sObj instanceof AbstractSoundObject;
  return {
    selectionId,
    selectedObjectType: sObj.constructor.name,
    editorObjectType: sObj.constructor.name,
    ownerKind: 'timeline',
    displayContext: 'timeline',
    location,
    supportsTimeBehavior: isSoundObject,
    supportsRepeatPoint: isSoundObject,
    supportsNoteProcessorChain: isSoundObject,
  };
}

function getCodeText(sObj: SoundObject): string {
  if (sObj instanceof GenericScore) return sObj.getScoreText();
  if (sObj instanceof PythonObject) return sObj.getPythonCode();
  if (sObj instanceof JavaScriptObject) return sObj.getJavaScriptCode();
  if (sObj instanceof Comment) return sObj.getText();
  if (sObj instanceof External) return sObj.getText();
  return '';
}

export function setCodeText(sObj: SoundObject, text: string): boolean {
  if (sObj instanceof GenericScore) { sObj.setScoreText(text); return true; }
  if (sObj instanceof PythonObject) { sObj.setPythonCode(text); return true; }
  if (sObj instanceof JavaScriptObject) { sObj.setJavaScriptCode(text); return true; }
  if (sObj instanceof Comment) { sObj.setText(text); return true; }
  if (sObj instanceof External) { sObj.setText(text); return true; }
  return false;
}

function getEditorFamily(objectType: string): TypeSpecificScoreObjectEditorSnapshot['kind'] {
  switch (objectType) {
    case 'AudioClip':
      return 'audioClip';
    case 'External':
      return 'external';
    case 'PolyObject':
      return 'polyObject';
    case 'TrackerObject':
      return 'tracker';
    case 'GenericScore':
    case 'PythonObject':
    case 'JavaScriptObject':
    case 'Comment':
      return 'code';
    case 'AudioFile':
    case 'FrozenSoundObject':
      return 'file';
    case 'PatternObject':
    case 'PianoRoll':
    case 'NotationObject':
    case 'LineObject':
    case 'ZakLineObject':
    case 'JMask':
    case 'Sound':
      return 'structured';
    default:
      return 'fallback';
  }
}

function getSyntaxForType(objectType: string): 'text' | 'csound-score' | 'python' | 'javascript' {
  switch (objectType) {
    case 'PythonObject': return 'python';
    case 'JavaScriptObject': return 'javascript';
    case 'GenericScore': return 'csound-score';
    default: return 'text';
  }
}

function resolveTimelineTarget(
  score: Score,
  location: ScoreObjectLocationRef,
): { sObj: SoundObject | AudioClip; layer: Array<SoundObject | AudioClip>; objectIndex: number } | null {
  const rootGroup = score[location.rootGroupIndex];
  if (!rootGroup) return null;

  if (rootGroup instanceof PolyObject) {
    let container: PolyObject = rootGroup;

    for (const segment of location.containerPath) {
      const containerLayer = container[segment.layerIndex];
      if (!containerLayer) return null;
      const nested = containerLayer[segment.objectIndex];
      if (!(nested instanceof PolyObject)) return null;
      container = nested;
    }

    const layer = container[location.layerIndex] as Array<SoundObject | AudioClip> | undefined;
    if (!layer) return null;
    const sObj = layer[location.objectIndex] ?? null;
    if (!sObj) return null;
    return { sObj, layer, objectIndex: location.objectIndex };
  }

  if (rootGroup instanceof AudioLayerGroup) {
    if (location.containerPath.length > 0) return null;
    const layer = rootGroup[location.layerIndex] as Array<SoundObject | AudioClip> | undefined;
    if (!layer) return null;
    const sObj = layer[location.objectIndex] ?? null;
    if (!sObj) return null;
    return { sObj, layer, objectIndex: location.objectIndex };
  }

  return null;
}

function resolveEditorTarget(data: BlueData, target: ScoreObjectEditorTargetSnapshot): { sObj: SoundObject | AudioClip; isLibraryOwned: boolean } | null {
  const score = data.getScore();

  let sObj: SoundObject | AudioClip | null = null;
  let isLibraryOwned = false;

  if (target.ownerKind === 'library' && target.displayContext === 'instance') {
    isLibraryOwned = true;
    const lib = data.getSoundObjectLibrary();
    if (target.library) {
      sObj = lib.getObjectById(target.library.libraryId) ?? null;
    } else {
      const instLoc = target.sourceInstanceLocation;
      if (instLoc) {
        const timelineResolved = resolveTimelineTarget(score, instLoc);
        if (timelineResolved?.sObj instanceof Instance) {
          sObj = timelineResolved.sObj.getSoundObject();
        }
      }
    }
  } else {
    const loc = target.location;
    if (!loc) return null;
    sObj = resolveTimelineTarget(score, loc)?.sObj ?? null;
  }

  return sObj ? { sObj, isLibraryOwned } : null;
}

function formatTimeDisplay(startTime: number, duration: number): string {
  const end = startTime + duration;
  return `${end.toFixed(4)}`;
}

function createTimeValueSnapshot(value: number, timeBase: string): TimeValueSnapshot {
  return {
    value,
    timeBase,
    displayText: `${value.toFixed(4)}`,
  };
}

function createTimeConversionContext(context: import('@blue/data').TimeContext): TimeConversionContext {
  const meterMap = context.getMeterMap();
  const meterEntries: TimeConversionMeterEntry[] = [];
  for (let i = 0; i < meterMap.size(); i++) {
    const entry = meterMap.get(i);
    meterEntries.push({
      measure: entry.measure,
      numBeats: entry.meter.numBeats,
      beatLength: entry.meter.beatLength,
    });
  }
  const tempoMap = context.getTempoMap();
  const tempoPoints = tempoMap.getTempoPoints();
  return {
    meterEntries,
    tempoEnabled: tempoMap.isEnabled(),
    initialTempo: tempoPoints.length > 0 ? tempoPoints[0].tempo : 60,
    sampleRate: context.getSampleRate(),
  };
}

function createNoteProcessorChainSnapshot(chain: NoteProcessorChain): NoteProcessorChainSnapshot {
  const processors: NoteProcessorEntrySnapshot[] = [];
  let hasUnsupported = false;
  for (const proc of chain.getProcessors()) {
    const typeName = proc.constructor.name;
    const isUnsupported = typeName === 'UnsupportedProcessor';
    if (isUnsupported) hasUnsupported = true;
    processors.push({
      processorType: typeName,
      displayName: typeName,
      supported: !isUnsupported,
      summary: typeName,
      serializedXml: '',
    });
  }
  return { processors, hasUnsupportedProcessors: hasUnsupported };
}

export function createScoreObjectEditorDocument(
  data: BlueData,
  request: ScoreObjectEditorRequest,
): ScoreObjectEditorDocumentSnapshot | null {
  const target = request.target;
  const resolved = resolveEditorTarget(data, target);
  if (!resolved) {
    const fallbackDisplay = data.getScore().getTimeState().getTimeDisplay() as string;
    return {
      target,
      shared: {
        target,
        name: '',
        startTime: createTimeValueSnapshot(0, fallbackDisplay),
        subjectiveDuration: createTimeValueSnapshot(0, fallbackDisplay),
        endTimeDisplay: '0.0000',
        backgroundColor: 0,
      },
      editor: { kind: 'fallback', target, reason: 'removed-target', message: 'Score object no longer exists.' },
      timeContext: createTimeConversionContext(data.getScore().getTimeContext()),
    };
  }

  const { sObj, isLibraryOwned } = resolved;
  const score = data.getScore();
  const context = score.getTimeContext();
  const primaryDisplay = score.getTimeState().getTimeDisplay() as string;
  const isSoundObject = sObj instanceof AbstractSoundObject;

  const startTime = sObj instanceof AudioClip
    ? sObj.getStartTime().toBeats(context)
    : (sObj as SoundObject).getStartTime().toBeats(context);
  const startTimeBase = String(sObj instanceof AudioClip
    ? sObj.getStartTime().getTimeBase()
    : (sObj as SoundObject).getStartTime().getTimeBase());
  const duration = sObj instanceof AudioClip
    ? sObj.getSubjectiveDuration().toBeats(context)
    : (sObj as SoundObject).getSubjectiveDuration().toBeats(context);
  const durationBase = String(sObj instanceof AudioClip
    ? sObj.getSubjectiveDuration().getTimeBase()
    : (sObj as SoundObject).getSubjectiveDuration().getTimeBase());

  const shared: SharedScoreObjectPropertiesSnapshot = {
    target,
    name: sObj.getName(),
    startTime: createTimeValueSnapshot(startTime, startTimeBase),
    subjectiveDuration: createTimeValueSnapshot(duration, durationBase),
    endTimeDisplay: formatTimeDisplay(startTime, duration),
    backgroundColor: sObj.getBackgroundColor(),
  };

  if (isSoundObject && !(sObj instanceof AudioClip)) {
    const so = sObj as AbstractSoundObject;
    shared.timeBehavior = so.getTimeBehavior();
    const rp = so.getRepeatPoint();
    const rpBase = rp ? String(rp.getTimeBase()) : primaryDisplay;
    shared.repeatPoint = rp ? createTimeValueSnapshot(rp.toBeats(context), rpBase) : null;
    shared.noteProcessorChain = createNoteProcessorChainSnapshot(so.getNoteProcessorChain());
  }

  const objectType = target.editorObjectType;
  const family = getEditorFamily(objectType);

  let editor: TypeSpecificScoreObjectEditorSnapshot;

  switch (family) {
    case 'code': {
      editor = {
        kind: 'code',
        target,
        syntax: getSyntaxForType(objectType),
        text: getCodeText(sObj as SoundObject),
      };
      break;
    }
    case 'external': {
      const ext = sObj as External;
      editor = {
        kind: 'external',
        target,
        scoreText: ext.getText(),
        commandLine: ext.getCommandLine(),
        syntaxType: ext.getSyntaxType(),
        canTest: false,
      };
      break;
    }
    case 'audioClip': {
      const clip = sObj as AudioClip;
      editor = {
        kind: 'audioClip',
        target,
        audioFile: clip.getAudioFile ? clip.getAudioFile() : '',
        numChannels: clip.getNumChannels ? clip.getNumChannels() : 0,
        audioDuration: clip.getAudioDuration ? clip.getAudioDuration() : 0,
        fileStartTime: clip.getFileStartTime ? clip.getFileStartTime() : 0,
        fadeIn: clip.getFadeIn ? clip.getFadeIn() : 0,
        fadeInType: clip.getFadeInType ? String(clip.getFadeInType()) : 'LINEAR',
        fadeOut: clip.getFadeOut ? clip.getFadeOut() : 0,
        fadeOutType: clip.getFadeOutType ? String(clip.getFadeOutType()) : 'LINEAR',
        looping: clip.isLooping ? clip.isLooping() : false,
      };
      break;
    }
    case 'file': {
      if (sObj instanceof AudioFile) {
        const af = sObj as AudioFile;
        editor = {
          kind: 'file',
          target,
          objectType,
          filePath: af.getSoundFileName(),
          csoundPostCode: af.getCsoundPostCode(),
        };
      } else if (sObj instanceof FrozenSoundObject) {
        const fso = sObj as FrozenSoundObject;
        const inner = fso.getFrozenSoundObject();
        editor = {
          kind: 'file',
          target,
          objectType,
          filePath: fso.getFrozenWaveFileName(),
          numChannels: fso.getNumChannels(),
          originalObjectType: inner?.constructor.name ?? '',
        };
      } else {
        editor = {
          kind: 'file',
          target,
          objectType,
          filePath: '',
        };
      }
      break;
    }
    case 'polyObject': {
      const pObj = sObj as PolyObject;
      const children: Array<{
        objectId: string;
        name: string;
        objectType: string;
        startBeats: number;
        durationBeats: number;
        layerLabel: string;
      }> = [];
      for (let li = 0; li < pObj.length; li++) {
        const layer = pObj[li];
        for (let oi = 0; oi < layer.length; oi++) {
          const child = layer[oi];
          children.push({
            objectId: `poly-child-${li}-${oi}`,
            name: child.getName(),
            objectType: child.constructor.name,
            startBeats: child.getStartTime().toBeats(context),
            durationBeats: child.getSubjectiveDuration().toBeats(context),
            layerLabel: layer.getName(),
          });
        }
      }
      editor = {
        kind: 'polyObject',
        target,
        children,
        generatedScoreText: '',
        canOpenInScore: true,
        canTest: false,
      };
      break;
    }
    case 'tracker': {
      const to = sObj as TrackerObject;
      const trackList = to.getTracks();
      const stepsPerBeat = to.getStepsPerBeat();
      const numSteps = trackList.getSteps();

      const tracks: Array<{
        trackId: string;
        trackName: string;
        instrumentId: string;
        noteTemplate: string;
        columns: TrackerColumnSnapshot[];
      }> = [];

      for (let ti = 0; ti < trackList.size(); ti++) {
        const track = trackList.getTrack(ti)!;
        const columns: TrackerColumnSnapshot[] = [];
        // skip col 0 (tied state handled specially in UI)
        for (let ci = 1; ci < track.getNumColumns(); ci++) {
          const col = track.getColumn(ci);
          if (col) {
            columns.push(createTrackerColumnSnapshot(col, ci - 1));
          }
        }
        tracks.push({
          trackId: `tracker-track-${ti}`,
          trackName: track.getName() || `Track ${ti + 1}`,
          instrumentId: track.getInstrumentId(),
          noteTemplate: track.getNoteTemplate(),
          columns,
        });
      }

      const rows: Array<Record<string, string | number | null>> = [];
      if (trackList.size() > 0) {
        for (let si = 0; si < numSteps; si++) {
          const row: Record<string, string | number | null> = { step: si };
          for (let ti = 0; ti < trackList.size(); ti++) {
            const track = trackList.getTrack(ti)!;
            const trNote = track.getTrackerNote(si);

            // tied/off state
            let status = '';
            if (trNote.isOff()) {
              status = 'OFF';
            } else if (trNote.isTied()) {
              status = '-';
            }
            row[`track-${ti}-status`] = status;

            for (let ci = 1; ci < track.getNumColumns(); ci++) {
              row[`track-${ti}-col-${ci - 1}`] = trNote.getValue(ci);
            }
          }
          rows.push(row);
        }
      }
      editor = {
        kind: 'tracker',
        target,
        steps: numSteps,
        stepsPerBeat,
        showNoteNames: false,
        octave: 0,
        tracks,
        rows,
        canTest: false,
      };
      break;
    }
    case 'structured': {
      if (sObj instanceof PatternObject) {
        const po = sObj as PatternObject;
        const numSteps = po.getBeats() * po.getSubDivisions();
        const patterns: Array<{
          patternName: string;
          patternScore: string;
          muted: boolean;
          solo: boolean;
          values: boolean[];
        }> = [];
        for (let i = 0; i < po.size(); i++) {
          const p = po.getPattern(i);
          patterns.push({
            patternName: p.patternName,
            patternScore: p.patternScore,
            muted: p.muted,
            solo: p.solo,
            values: [...p.values],
          });
        }
        editor = {
          kind: 'structured',
          target,
          editorFamily: objectType,
          payloadSummary: `${po.size()} pattern(s), ${po.getBeats()} beats, ${po.getSubDivisions()} sub`,
          payload: {
            beats: po.getBeats(),
            subDivisions: po.getSubDivisions(),
            numSteps,
            patterns,
          },
        };
      } else if (sObj instanceof LineObject) {
        const lo = sObj as LineObject;
        editor = {
          kind: 'structured',
          target,
          editorFamily: objectType,
          payloadSummary: `${lo.getLines().length} line(s)`,
          payload: {
            lines: lo.getLines().map(l => ({
              varName: l.varName,
              min: l.min,
              max: l.max,
              resolution: l.resolution,
              color: l.color,
              rightBound: l.rightBound,
              endPointsLinked: l.endPointsLinked,
              points: l.points.map(pt => ({ x: pt.x, y: pt.y })),
            })),
          },
        };
      } else if (sObj instanceof ZakLineObject) {
        const zlo = sObj as ZakLineObject;
        editor = {
          kind: 'structured',
          target,
          editorFamily: objectType,
          payloadSummary: `${zlo.getLines().length} zak line(s), zak space: ${zlo.getZakSpace()}`,
          payload: {
            zakSpace: zlo.getZakSpace(),
            lines: zlo.getLines().map(l => ({
              channel: l.channel,
              min: l.min,
              max: l.max,
              resolution: l.resolution,
              color: l.color,
              rightBound: l.rightBound,
              endPointsLinked: l.endPointsLinked,
              points: l.points.map(pt => ({ x: pt.x, y: pt.y })),
            })),
          },
        };
      } else if (sObj instanceof PianoRoll) {
        const pr = sObj as PianoRoll;
        editor = {
          kind: 'structured',
          target,
          editorFamily: objectType,
          payloadSummary: `${pr.getNotes().length} notes`,
          payload: {
            instrumentId: pr.getInstrumentId(),
            noteTemplate: pr.getNoteTemplate(),
            pchGenerationMethod: pr.getPchGenerationMethod(),
            transposition: pr.getTransposition(),
          },
        };
      } else if (sObj instanceof NotationObject) {
        const no = sObj as NotationObject;
        editor = {
          kind: 'structured',
          target,
          editorFamily: objectType,
          payloadSummary: 'notation',
          payload: {
            staffData: no.getStaffData(),
          },
        };
      } else if (sObj instanceof JMask) {
        const jm = sObj as JMask;
        editor = {
          kind: 'structured',
          target,
          editorFamily: objectType,
          payloadSummary: `seed: ${jm.isSeedUsed() ? jm.getSeed() : 'random'}`,
          payload: {
            seedUsed: jm.isSeedUsed(),
            seed: jm.getSeed(),
          },
        };
      } else if (sObj instanceof Sound) {
        const snd = sObj as Sound;
        const bsbText = snd.getBSBInstrumentText();
        const bsb = parseSoundBSB(bsbText);

        let bsbInstrument: BlueSynthBuilderInstrumentSnapshot | null = null;
        let automationParameters: SoundAutomationParameterSnapshot[] = [];

        if (bsb) {
          bsbInstrument = buildSoundBSBInstrumentSnapshot(bsb);
          automationParameters = buildSoundAutomationParameters(bsb);
        }

        const availableTabs: SoundEditorTab[] = [];
        if (bsb) {
          availableTabs.push('interface', 'automation', 'code', 'udo');
        }
        availableTabs.push('comments');

        editor = {
          kind: 'structured',
          target,
          editorFamily: objectType,
          payloadSummary: bsb ? 'BSB instrument' : 'BSB instrument (empty)',
          payload: {
            comment: snd.getComment(),
            bsbInstrument,
            automationParameters,
            availableTabs,
            testAvailable: false,
            deferredCapabilities: [],
          } satisfies SoundEditorPayload,
        };
      } else {
        editor = {
          kind: 'structured',
          target,
          editorFamily: objectType,
          payloadSummary: `${objectType} editor`,
          payload: {},
        };
      }
      break;
    }
    default: {
      editor = {
        kind: 'fallback',
        target,
        reason: 'unsupported',
        message: `Editor for ${objectType} is not yet supported.`,
      };
      break;
    }
  }

  return { target, shared, editor, timeContext: createTimeConversionContext(context) };
}

export function createFallbackEditorDocument(
  reason: TypeSpecificScoreObjectEditorSnapshot extends { kind: 'fallback'; reason: infer R } ? R : never,
  message: string,
): ScoreObjectEditorDocumentSnapshot {
  const target: ScoreObjectEditorTargetSnapshot = {
    selectionId: '',
    selectedObjectType: '',
    editorObjectType: '',
    ownerKind: 'timeline',
    displayContext: 'timeline',
    supportsTimeBehavior: false,
    supportsRepeatPoint: false,
    supportsNoteProcessorChain: false,
  };
  return {
    target,
    shared: {
      target,
      name: '',
      startTime: createTimeValueSnapshot(0, 'beats'),
      subjectiveDuration: createTimeValueSnapshot(0, 'beats'),
      endTimeDisplay: '0.0000',
      backgroundColor: 0,
    },
    editor: { kind: 'fallback', target, reason, message },
    timeContext: { meterEntries: [{ measure: 1, numBeats: 4, beatLength: 4 }], tempoEnabled: false, initialTempo: 60, sampleRate: 44100 },
  };
}

function applyTimebaseUpdate(
  data: BlueData,
  oldTimeBase: TimeBase,
  newTimeBase: TimeBase,
  scoreObjectMode: 'UPDATE_ALL' | 'UPDATE_MATCHING',
  markerMode: 'UPDATE_ALL' | 'UPDATE_MATCHING' | null,
): void {
  const score = data.getScore();
  const context = score.getTimeContext();

  if (scoreObjectMode != null) {
    for (const layerGroup of score) {
      for (const layer of layerGroup) {
        if (!Array.isArray(layer)) continue;
        for (const sObj of layer as unknown as import('@blue/data').ScoreObject[]) {
          if (!('getStartTime' in sObj)) continue;
          const updateStart = scoreObjectMode === 'UPDATE_ALL'
            || sObj.getStartTime().getTimeBase() === oldTimeBase;
          if (updateStart) {
            sObj.setStartTime(convertTimePosition(sObj.getStartTime(), newTimeBase, context));
          }
          const updateDuration = scoreObjectMode === 'UPDATE_ALL'
            || sObj.getSubjectiveDuration().getTimeBase() === oldTimeBase;
          if (updateDuration) {
            const durBeats = sObj.getSubjectiveDuration().toBeats(context);
            sObj.setSubjectiveDuration(beatsToDuration(durBeats, newTimeBase, context));
          }
          if ('getRepeatPoint' in sObj && 'setRepeatPoint' in sObj) {
            const so = sObj as AbstractSoundObject;
            const rp = so.getRepeatPoint();
            if (rp) {
              const shouldUpdate = scoreObjectMode === 'UPDATE_ALL'
                || rp.getTimeBase() === oldTimeBase;
              if (shouldUpdate) {
                const rpBeats = rp.toBeats(context);
                so.setRepeatPoint(beatsToDuration(rpBeats, newTimeBase, context));
              }
            }
          }
        }
      }
    }
  }

  if (markerMode != null) {
    // TODO: Implement marker timebase update when MarkersList is ported to @blue/data
  }
}

export function applyScoreTimeStatePatch(
  data: BlueData,
  patch: Partial<ScoreTimeStateSnapshot>,
): boolean {
  const ts = data.getScore().getTimeState();
  let changed = false;

  if (patch.snapEnabled !== undefined && ts.isSnapEnabled() !== patch.snapEnabled) {
    ts.setSnapEnabled(patch.snapEnabled);
    changed = true;
  }
  if (patch.snapValue !== undefined && isValidSnapValueName(patch.snapValue) && ts.getSnapValue() !== patch.snapValue) {
    ts.setSnapValue(patch.snapValue as SnapValueName);
    changed = true;
  }
  let oldTimeDisplay: TimeBase | undefined;
  if (patch.primaryTimeDisplay !== undefined) {
    const td = patch.primaryTimeDisplay as TimeBase;
    if (Object.values(TimeBase).includes(td) && ts.getTimeDisplay() !== td) {
      oldTimeDisplay = ts.getTimeDisplay();
      ts.setTimeDisplay(td);
      changed = true;
    }
  }
  if (patch.secondaryTimeDisplay !== undefined) {
    const std = patch.secondaryTimeDisplay as TimeBase;
    if (Object.values(TimeBase).includes(std) && ts.getSecondaryTimeDisplay() !== std) {
      ts.setSecondaryTimeDisplay(std);
      changed = true;
    }
  }
  if (patch.secondaryRulerEnabled !== undefined && ts.isSecondaryRulerEnabled() !== patch.secondaryRulerEnabled) {
    ts.setSecondaryRulerEnabled(patch.secondaryRulerEnabled);
    changed = true;
  }
  if (patch.tempoRowVisible !== undefined && ts.isTempoRowVisible() !== patch.tempoRowVisible) {
    ts.setTempoRowVisible(patch.tempoRowVisible);
    changed = true;
  }
  if (patch.meterRowVisible !== undefined && ts.isMeterRowVisible() !== patch.meterRowVisible) {
    ts.setMeterRowVisible(patch.meterRowVisible);
    changed = true;
  }
  if (patch.markersRowVisible !== undefined && ts.isMarkersRowVisible() !== patch.markersRowVisible) {
    ts.setMarkersRowVisible(patch.markersRowVisible);
    changed = true;
  }
  if (patch.smpteFrameRate !== undefined && patch.smpteFrameRate > 0 && ts.getSmpteFrameRate() !== patch.smpteFrameRate) {
    ts.setSmpteFrameRate(patch.smpteFrameRate);
    changed = true;
  }
  if (patch.zoomIterations !== undefined && ts.getZoomIterations() !== patch.zoomIterations) {
    ts.setZoomIterations(patch.zoomIterations);
    changed = true;
  }

  if (oldTimeDisplay !== undefined && patch.scoreObjectUpdateMode != null) {
    const newBase = patch.primaryTimeDisplay as TimeBase;
    applyTimebaseUpdate(data, oldTimeDisplay, newBase, patch.scoreObjectUpdateMode, patch.markerUpdateMode ?? null);
  }

  return changed;
}

function isNonEmptyScorePatch(patch: ScorePatch): boolean {
  if (patch.type === 'updateTimeState') {
    return Object.keys(patch.patch).length > 0;
  }
  if (patch.type === 'updateSharedProperties' || patch.type === 'updateSoundObjectBehavior' || patch.type === 'replaceNoteProcessorChain' || patch.type === 'updateTypeSpecificEditor') {
    return true;
  }
  if (patch.type === 'addScoreObjects' || patch.type === 'moveScoreObjects' || patch.type === 'addLayer' || patch.type === 'removeLayer') {
    return true;
  }
  if (patch.type === 'removeScoreObjects') {
    return patch.targets.length > 0;
  }
  return true;
}

// ─── End Score Snapshot Helpers ───

export function createProjectEditorSnapshot(
  data: BlueData,
  filePath: string | null,
  sessionId = 0,
): ProjectEditorSnapshot {
  reconcileMixerWithArrangement(data);
  return {
    filePath,
    version: data.getVersion(),
    sessionId,
    globalOrc: data.getGlobalOrcSco().getGlobalOrc(),
    globalSco: data.getGlobalOrcSco().getGlobalSco(),
    orchestra: createOrchestraSnapshot(data),
    mixer: createMixerSnapshot(data.getMixer()),
    projectProperties: createProjectPropertiesSnapshot(
      data.getProjectProperties(),
    ),
    transport: createToolbarProjectTransportSnapshot(data),
    tablesText: data.getTableSet().getTables(),
    projectUdos: createProjectUdoListSnapshot(data),
    loaded: true,
    blueLive: createBlueLiveProjectSnapshot(data.getLiveData()),
    midiInput: createMidiInputProcessorSnapshot(data.getMidiInputProcessor()),
    score: createScoreDocumentSnapshot(data),
  };
}

function getInstrumentSnapshotType(instrument: Instrument | undefined): InstrumentSnapshot['type'] {
  if (instrument instanceof GenericInstrument) return 'generic';
  if (instrument instanceof JavaScriptInstrument) return 'javascript';
  if (instrument instanceof PythonInstrument) return 'python';
  if (instrument instanceof BlueX7) return 'blueX7';
  if (instrument instanceof BlueSynthBuilder) return 'blueSynthBuilder';
  return 'unknown';
}

function getInstrumentSummary(instrument: Instrument | undefined): string {
  if (!instrument) return 'Unresolved instrument';
  return instrument.constructor.name;
}

function collectBsbWidgets(bsb: BlueSynthBuilder): BsbWidgetSnapshot[] {
  const widgets: BsbWidgetSnapshot[] = [];
  const visit = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    const record = node as Record<string, unknown>;
    const objectName =
      typeof record.getObjectName === 'function'
        ? (record.getObjectName as () => unknown)()
        : record.objectName ?? record._objectName;
    if (typeof objectName === 'string' && objectName.trim()) {
      widgets.push({
        objectName: objectName.trim(),
        widgetType:
          typeof record.constructor === 'function' && 'name' in record.constructor
            ? String(record.constructor.name)
            : 'BSBObject',
        value: typeof record.value === 'number' ? record.value : 0,
        minimum: typeof record.minimum === 'number' ? record.minimum : 0,
        maximum: typeof record.maximum === 'number' ? record.maximum : 1,
      });
    }
    const children =
      typeof record.getChildren === 'function'
        ? (record.getChildren as () => unknown[]).call(node)
        : record.children ?? record._children;
    if (Array.isArray(children)) {
      children.forEach(visit);
    }
  };

  visit(bsb.getGraphicInterface().getRootGroup());
  return widgets.sort((a, b) => a.objectName.localeCompare(b.objectName));
}

function collectBsbObjectNames(bsb: BlueSynthBuilder): string[] {
  return collectBsbWidgets(bsb).map((widget) => widget.objectName);
}

function parseSoundBSB(text: string): BlueSynthBuilder | null {
  if (!text || !text.trim()) return null;
  try {
    const elem = Element.parse(text);
    return BlueSynthBuilder.loadFromXML(elem);
  } catch {
    return null;
  }
}

function buildSoundAutomationParameters(bsb: BlueSynthBuilder): SoundAutomationParameterSnapshot[] {
  const params = bsb.getParameters();
  return params.map((param) => ({
    parameterId: param.getUniqueId(),
    name: param.getName(),
    label: param.getLabel(),
    automationEnabled: param.isEnabled(),
    value: param.getFixedValue(),
    minimum: param.getMinimum(),
    maximum: param.getMaximum(),
    curve: param.getCurve(),
    points: param.getPoints().map((p) => ({ x: p.time, y: p.value })),
  }));
}

function buildSoundBSBInstrumentSnapshot(bsb: BlueSynthBuilder): BlueSynthBuilderInstrumentSnapshot {
  return {
    assignmentId: '',
    type: 'blueSynthBuilder',
    name: bsb.getName(),
    enabled: true,
    comment: bsb.getComment(),
    instrumentText: bsb.getInstrumentText(),
    alwaysOnInstrumentText: bsb.getAlwaysOnInstrumentText(),
    globalOrc: bsb.getGlobalOrc(),
    globalSco: bsb.getGlobalSco(),
    objectNames: collectBsbObjectNames(bsb),
    widgets: collectBsbWidgets(bsb),
    editEnabled: bsb.getGraphicInterface().isEditEnabled(),
    gridSettings: buildGridSettingsSnapshot(bsb),
    widgetTree: buildWidgetTreeSnapshot(bsb),
    presetGroup: buildPresetGroupSnapshot(bsb),
    opcodeListText: bsb.getOpcodeListText(),
    udolist: buildUdoListSnapshot(bsb),
  };
}

const KNOWN_WIDGET_TYPES = new Set([
  'BSBKnob', 'BSBCheckBox', 'BSBHSlider', 'BSBVSlider',
  'BSBHSliderBank', 'BSBVSliderBank', 'BSBValue', 'BSBDropdown',
  'BSBXYController', 'BSBSubChannelDropdown', 'BSBFileSelector',
  'BSBTextField', 'BSBLabel', 'BSBLineObject', 'BSBGroup',
]);

function bsbColorIntToCss(color: number): string {
  const rgb = (color >>> 0) & 0x00ffffff;
  return `#${rgb.toString(16).padStart(6, '0')}`;
}

function normalizeBsbLineColor(raw: unknown): string {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return bsbColorIntToCss(raw);
  }
  if (typeof raw !== 'string') {
    return '#808080';
  }
  const trimmed = raw.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return bsbColorIntToCss(parseInt(trimmed, 10));
  }
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed;
  }
  return '#808080';
}

function buildWidgetTreeNode(widget: unknown): BsbWidgetNodeSnapshot | null {
  if (!widget || typeof widget !== 'object') return null;
  const record = widget as Record<string, unknown>;

  const id = typeof record.id === 'string' ? record.id : '';
  if (!id) return null;

  const ctorName = typeof record.constructor === 'function' && 'name' in record.constructor
    ? String(record.constructor.name)
    : 'Unknown';

  const preservedOnly = !KNOWN_WIDGET_TYPES.has(ctorName);

  const properties: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(record)) {
    if (['id', 'objectName', 'x', 'y', 'parameterName', '_children', 'children', 'stringChannel', 'labelFont', 'font'].includes(key)) continue;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || val === null) {
      properties[key] = val as string | number | boolean | null;
    }
  }

  const fontKeys = ['labelFont', 'font'] as const;
  for (const fk of fontKeys) {
    const fv = record[fk];
    if (fv && typeof fv === 'object') {
      const f = fv as Record<string, unknown>;
      if (typeof f.name === 'string') properties[`${fk}.name`] = f.name;
      if (typeof f.size === 'number') properties[`${fk}.size`] = f.size;
      if (typeof f.style === 'number') properties[`${fk}.style`] = f.style;
    }
  }

  const dropdownItems = record.dropdownItems;
  if (Array.isArray(dropdownItems)) {
    properties['dropdownItems'] = dropdownItems;
  }

  const lines = record.lines;
  if (Array.isArray(lines)) {
    properties.lines = lines.map((line) => {
      if (!line || typeof line !== 'object') {
        return {
          varName: '',
          min: 0,
          max: 1,
          color: '#000000',
          points: [],
        };
      }

      const lineRecord = line as Record<string, unknown>;
      const points = Array.isArray(lineRecord.points)
        ? lineRecord.points.map((point) => {
            if (!point || typeof point !== 'object') {
              return { x: 0, y: 0 };
            }
            const pointRecord = point as Record<string, unknown>;
            return {
              x: typeof pointRecord.x === 'number' ? pointRecord.x : 0,
              y: typeof pointRecord.y === 'number' ? pointRecord.y : 0,
            };
          })
        : [];

      return {
        varName: typeof lineRecord.name === 'string' && lineRecord.name.trim().length > 0
          ? lineRecord.name
          : typeof lineRecord.varName === 'string'
            ? lineRecord.varName
            : '',
        min: typeof lineRecord.min === 'number' ? lineRecord.min : 0,
        max: typeof lineRecord.max === 'number' ? lineRecord.max : 1,
        color: normalizeBsbLineColor(lineRecord.color),
        resolution: typeof lineRecord.resolution === 'string' ? lineRecord.resolution : undefined,
        rightBound: typeof lineRecord.rightBound === 'boolean' ? lineRecord.rightBound : undefined,
        endPointsLinked: typeof lineRecord.endPointsLinked === 'boolean' ? lineRecord.endPointsLinked : undefined,
        points,
      };
    });
  }

  const sliders = record.sliders;
  if (Array.isArray(sliders)) {
    properties.sliders = sliders.map((slider) => {
      if (!slider || typeof slider !== 'object') {
        return { value: 0 };
      }
      const sliderRecord = slider as Record<string, unknown>;
      return {
        value: typeof sliderRecord.value === 'number' ? sliderRecord.value : 0,
      };
    });
  }

  const getChildren = record.getChildren;
  const childArray = typeof getChildren === 'function' ? (getChildren as () => unknown[]).call(widget) : [];
  const children: BsbWidgetNodeSnapshot[] = [];
  if (Array.isArray(childArray)) {
    for (const child of childArray) {
      const node = buildWidgetTreeNode(child);
      if (node) children.push(node);
    }
  }

  let width: number;
  let height: number;

  const vde = record.valueDisplayEnabled === true;
  const le = record.labelEnabled === true;

  if (ctorName === 'BSBHSlider') {
    width = (typeof record.sliderWidth === 'number' ? record.sliderWidth : 150) + (vde ? 50 : 0);
    height = 30;
  } else if (ctorName === 'BSBVSlider') {
    width = 50;
    height = (typeof record.sliderHeight === 'number' ? record.sliderHeight : 150) + (vde ? 30 : 0);
  } else if (ctorName === 'BSBHSliderBank') {
    const sliderCount = Array.isArray(sliders) && sliders.length > 0
      ? sliders.length
      : typeof record.numberOfSliders === 'number'
        ? record.numberOfSliders
        : 1;
    const sliderWidth = typeof record.sliderWidth === 'number' ? record.sliderWidth : 100;
    const gap = typeof record.gap === 'number' ? record.gap : 5;
    ({ width, height } = getHSliderBankDisplaySize(sliderCount, sliderWidth, gap, vde));
  } else if (ctorName === 'BSBVSliderBank') {
    const sliderCount = Array.isArray(sliders) && sliders.length > 0
      ? sliders.length
      : typeof record.numberOfSliders === 'number'
        ? record.numberOfSliders
        : 1;
    const sliderHeight = typeof record.sliderHeight === 'number' ? record.sliderHeight : 100;
    const gap = typeof record.gap === 'number' ? record.gap : 5;
    ({ width, height } = getVSliderBankDisplaySize(sliderCount, sliderHeight, gap, vde));
  } else if (ctorName === 'BSBKnob') {
    const kw = typeof record.knobWidth === 'number' ? record.knobWidth : 60;
    width = kw;
    height = kw + (le ? 16 : 0) + (vde ? 14 : 0);
  } else if (ctorName === 'BSBGroup') {
    width = typeof record.width === 'number' ? record.width : 20;
    height = typeof record.height === 'number' ? record.height : 20;
    delete properties['width'];
    delete properties['height'];
  } else if (ctorName === 'BSBLabel' || ctorName === 'BSBCheckBox') {
    width = typeof record.width === 'number' ? record.width : 0;
    height = typeof record.height === 'number' ? record.height : 0;
  } else if (ctorName === 'BSBDropdown' || ctorName === 'BSBSubChannelDropdown') {
    const fontSize = typeof record.fontSize === 'number' ? record.fontSize : 12;
    width = 0;
    height = typeof record.height === 'number' ? record.height : Math.max(24, fontSize + 8);
  } else if (ctorName === 'BSBTextField') {
    width = typeof record.textFieldWidth === 'number' ? record.textFieldWidth : 100;
    height = 30;
  } else if (ctorName === 'BSBLineObject') {
    width = typeof record.canvasWidth === 'number' ? record.canvasWidth : 200;
    height = (typeof record.canvasHeight === 'number' ? record.canvasHeight : 160) + BSB_LINE_SELECTOR_HEIGHT;
  } else if (ctorName === 'BSBFileSelector') {
    const tfw = typeof record.textFieldWidth === 'number' ? record.textFieldWidth : 100;
    width = tfw + 30;
    height = 30;
  } else {
    width = typeof record.sliderWidth === 'number' ? record.sliderWidth
      : typeof record.width === 'number' ? record.width
      : 60;
    height = typeof record.sliderHeight === 'number' ? record.sliderHeight
      : typeof record.height === 'number' ? record.height
      : 24;
  }

  return {
    id,
    type: ctorName,
    objectName: typeof record.objectName === 'string' ? record.objectName : '',
    x: typeof record.x === 'number' ? record.x : 0,
    y: typeof record.y === 'number' ? record.y : 0,
    width,
    height,
    value: typeof record.value === 'number' ? record.value : 0,
    minimum: typeof record.minimum === 'number' ? record.minimum : 0,
    maximum: typeof record.maximum === 'number' ? record.maximum : 1,
    editable: !preservedOnly,
    preservedOnly,
    properties,
    children: children.length > 0 ? children : undefined,
  };
}

function buildWidgetTreeSnapshot(bsb: BlueSynthBuilder): BsbWidgetNodeSnapshot {
  const rootGroup = bsb.getGraphicInterface().getRootGroup();
  const rootChildren = rootGroup.getChildren();

  const children: BsbWidgetNodeSnapshot[] = [];
  for (const child of rootChildren) {
    const node = buildWidgetTreeNode(child);
    if (node) children.push(node);
  }

  return {
    id: rootGroup.id || 'root',
    type: 'BSBRootGroup',
    objectName: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    value: 0,
    minimum: 0,
    maximum: 0,
    editable: true,
    properties: {},
    children,
  };
}

function buildGridSettingsSnapshot(bsb: BlueSynthBuilder): GridSettingsSnapshot {
  const gs = bsb.getGraphicInterface().getGridSettings();
  return {
    enabled: gs.enabled,
    snapEnabled: gs.snapEnabled,
    width: gs.width,
    height: gs.height,
    gridStyle: gs.gridStyle,
  };
}

function buildPresetGroupSnapshot(bsb: BlueSynthBuilder): PresetGroupSnapshot | undefined {
  const pg = bsb.getPresetGroup();
  if (!pg) return undefined;

  const convert = (group: PresetGroup): PresetGroupSnapshot => ({
    name: group.getPresetGroupName(),
    currentPresetUniqueId: group.getCurrentPresetUniqueId() || undefined,
    currentPresetModified: group.isCurrentPresetModified(),
    subGroups: group.getSubGroups().map(convert),
    presets: group.getPresets().map((p) => {
      const valuesMap = p.getValuesMap();
      const values: Record<string, string> = {};
      for (const [k, v] of valuesMap) {
        values[k] = v;
      }
      return {
        uniqueId: p.getUniqueId(),
        name: p.getPresetName(),
        values,
      };
    }),
  });

  return convert(pg);
}

function buildUdoListSnapshot(bsb: BlueSynthBuilder): UdoDefinitionSnapshot[] {
  const udos = bsb.getUdoList();
  return udos.map((udo: OpcodeDefinition) => ({
    name: udo.getName(),
    style: udo.getStyle(),
    outTypes: udo.getOutTypes(),
    inTypes: udo.getInTypes(),
    inputArguments: udo.getInputArguments(),
    code: udo.getCode(),
    comments: udo.getComments(),
  }));
}

function createProjectUdoListSnapshot(data: BlueData): UdoDefinitionSnapshot[] {
  const opcodes = data.getOpcodeList().getOpcodes();
  return opcodes.map((udo) => udoToSnapshot(udo));
}

export function udoToSnapshot(udo: OpcodeDefinition): UdoDefinitionSnapshot {
  return {
    name: udo.getName(),
    style: udo.getStyle(),
    outTypes: udo.getOutTypes(),
    inTypes: udo.getInTypes(),
    inputArguments: udo.getInputArguments(),
    code: udo.getCode(),
    comments: udo.getComments(),
  };
}

export function createInstrumentSnapshot(
  assignmentId: string,
  instrument: Instrument | undefined,
  enabled = true,
): InstrumentSnapshot {
  if (instrument instanceof GenericInstrument) {
    return {
      assignmentId,
      type: 'generic',
      name: instrument.getName(),
      enabled,
      comment: instrument.getComment(),
      text: instrument.getText(),
      globalOrc: instrument.getGlobalOrc(),
      globalSco: instrument.getGlobalSco(),
      udolist: instrument.getOpcodeList().getOpcodes().map(udoToSnapshot),
    };
  }

  if (instrument instanceof JavaScriptInstrument) {
    return {
      assignmentId,
      type: 'javascript',
      name: instrument.getName(),
      enabled,
      comment: instrument.getComment(),
      text: instrument.getText(),
      globalOrc: instrument.getGlobalOrc(),
      globalSco: instrument.getGlobalSco(),
      udolist: instrument.getOpcodeList().getOpcodes().map(udoToSnapshot),
    };
  }

  if (instrument instanceof PythonInstrument) {
    return {
      assignmentId,
      type: 'python',
      name: instrument.getName(),
      enabled,
      comment: instrument.getComment(),
      text: instrument.getText(),
      globalOrc: instrument.getGlobalOrc(),
      globalSco: instrument.getGlobalSco(),
    };
  }

  if (instrument instanceof BlueX7) {
    return {
      assignmentId,
      type: 'blueX7',
      name: instrument.getName(),
      enabled,
      comment: instrument.getComment(),
    };
  }

  if (instrument instanceof BlueSynthBuilder) {
    return {
      assignmentId,
      type: 'blueSynthBuilder',
      name: instrument.getName(),
      enabled,
      comment: instrument.getComment(),
      instrumentText: instrument.getInstrumentText(),
      alwaysOnInstrumentText: instrument.getAlwaysOnInstrumentText(),
      globalOrc: instrument.getGlobalOrc(),
      globalSco: instrument.getGlobalSco(),
      objectNames: collectBsbObjectNames(instrument),
      widgets: collectBsbWidgets(instrument),
      editEnabled: instrument.getGraphicInterface().isEditEnabled(),
      gridSettings: buildGridSettingsSnapshot(instrument),
      widgetTree: buildWidgetTreeSnapshot(instrument),
      presetGroup: buildPresetGroupSnapshot(instrument),
      opcodeListText: instrument.getOpcodeListText(),
      udolist: buildUdoListSnapshot(instrument),
    };
  }

  return {
    assignmentId,
    type: 'unknown',
    instrumentType: instrument?.constructor.name ?? 'Unknown',
    name: instrument?.getName() ?? '',
    enabled,
    comment: instrument?.getComment() ?? '',
  };
}

export function createOrchestraSnapshot(data: BlueData): OrchestraSnapshot {
  const assignments = data.getArrangement().getArrangement();
  const rows: ArrangementRowSnapshot[] = [];
  const instruments: InstrumentSnapshot[] = [];

  for (const assignment of assignments) {
    const instrumentType = getInstrumentSnapshotType(assignment.instr);
    rows.push({
      assignmentId: assignment.arrangementId,
      enabled: assignment.enabled,
      instrumentName: assignment.instr?.getName() ?? '',
      instrumentType,
      instrumentSummary: getInstrumentSummary(assignment.instr),
      editable: Boolean(assignment.instr),
    });
    instruments.push(
      createInstrumentSnapshot(
        assignment.arrangementId,
        assignment.instr,
        assignment.enabled,
      ),
    );
  }

  return {
    ...createEmptyOrchestraSnapshot(true),
    arrangement: { rows },
    instruments,
  };
}

function createInstrumentForType(type: SupportedNewInstrumentType): Instrument {
  switch (type) {
    case 'generic':
      return new GenericInstrument();
    case 'python':
      return new PythonInstrument();
    case 'javascript':
      return new JavaScriptInstrument();
    case 'blueX7':
      return new BlueX7();
    case 'blueSynthBuilder':
      return new BlueSynthBuilder();
  }
}

function createInstrumentFromSnapshot(snapshot: InstrumentSnapshot): Instrument {
  const instrument =
    snapshot.type === 'javascript'
      ? new JavaScriptInstrument()
      : snapshot.type === 'python'
        ? new PythonInstrument()
      : snapshot.type === 'blueX7'
        ? new BlueX7()
        : snapshot.type === 'blueSynthBuilder'
          ? new BlueSynthBuilder()
          : new GenericInstrument();

  applyInstrumentPatch(instrument, {
    name: snapshot.name,
    comment: snapshot.comment,
    enabled: snapshot.enabled,
  });

  if (
    snapshot.type === 'generic' ||
    snapshot.type === 'javascript' ||
    snapshot.type === 'python'
  ) {
    applyInstrumentPatch(instrument, {
      text: snapshot.text,
      globalOrc: snapshot.globalOrc,
      globalSco: snapshot.globalSco,
    });
  } else if (snapshot.type === 'blueSynthBuilder') {
    applyInstrumentPatch(instrument, {
      instrumentText: snapshot.instrumentText,
      alwaysOnInstrumentText: snapshot.alwaysOnInstrumentText,
      globalOrc: snapshot.globalOrc,
      globalSco: snapshot.globalSco,
    });
  }

  return instrument;
}

function applyEmbeddedOpcodeListPatch(opcodeList: OpcodeList, patch: EmbeddedOpcodeListPatch): boolean {
  switch (patch.type) {
    case 'addUdo': {
      const definition = patch.definition
        ? snapshotToUdo(patch.definition)
        : new OpcodeDefinition();
      const index = patch.index ?? opcodeList.size();
      opcodeList.addOpcodeAt(index, definition);
      return true;
    }
    case 'removeUdo':
      return opcodeList.removeOpcodeAt(patch.index);
    case 'updateUdo': {
      const existing = opcodeList.getOpcode(patch.index);
      if (!existing) return false;
      if (patch.patch.name !== undefined) existing.setName(patch.patch.name);
      if (patch.patch.outTypes !== undefined) existing.setOutTypes(patch.patch.outTypes);
      if (patch.patch.inTypes !== undefined) existing.setInTypes(patch.patch.inTypes);
      if (patch.patch.inputArguments !== undefined) existing.setInputArguments(patch.patch.inputArguments);
      if (patch.patch.code !== undefined) existing.setCode(patch.patch.code);
      if (patch.patch.comments !== undefined) existing.setComments(patch.patch.comments);
      if (patch.patch.style !== undefined) {
        existing.setStyle(UDOStyle[patch.patch.style as keyof typeof UDOStyle]);
      }
      return true;
    }
    case 'convertUdoStyle': {
      const udo = opcodeList.getOpcode(patch.index);
      if (!udo) return false;
      udo.setStyle(UDOStyle[patch.style as keyof typeof UDOStyle]);
      return true;
    }
    case 'reorderUdo': {
      const udo = opcodeList.getOpcode(patch.from);
      if (!udo) return false;
      opcodeList.removeOpcodeAt(patch.from);
      opcodeList.addOpcodeAt(patch.to, udo);
      return true;
    }
  }
}

function applyBsbInterfacePatch(instrument: BlueSynthBuilder, patch: BsbInterfacePatch): boolean {
  switch (patch.type) {
    case 'setEditEnabled':
      instrument.setBsbEditEnabled(patch.value);
      return true;
    case 'selectWidget':
      return false;
    case 'updateWidgetProperties':
      return instrument.updateWidgetProperties(patch.widgetId, patch.properties);
    case 'updateSliderBankValue':
      return instrument.updateSliderBankValue(patch.widgetId, patch.sliderIndex, patch.value);
    case 'moveWidget':
      return instrument.updateWidgetProperties(patch.widgetId, {
        x: patch.x,
        y: patch.y,
      });
    case 'resizeWidget':
      return instrument.updateWidgetProperties(patch.widgetId, {
        width: patch.width,
        height: patch.height,
      });
    case 'addWidget': {
      const gi = instrument.getGraphicInterface();
      const widget = gi.createWidgetByType(patch.widgetType);
      if (!widget) return false;
      widget.x = patch.x;
      widget.y = patch.y;
      if (patch.parentGroupId) {
        const parent = gi.findWidgetById(patch.parentGroupId);
        if (parent && parent instanceof BSBGroup) {
          parent.addChild(widget);
        } else {
          gi.getRootGroup().addChild(widget);
        }
      } else {
        gi.getRootGroup().addChild(widget);
      }
      instrument.invalidateGraphicInterfaceCache();
      return true;
    }
    case 'removeWidget': {
      const gi2 = instrument.getGraphicInterface();
      const removed = gi2.removeWidget(patch.widgetId);
      if (removed) instrument.invalidateGraphicInterfaceCache();
      return removed;
    }
    case 'updateGridSettings':
      instrument.setBsbGridSettings(patch.patch);
      return true;
    case 'applyPreset': {
      console.log('applyPreset patch received:', patch);
      const success = instrument.applyPreset(patch.presetUniqueId);
      console.log('instrument.applyPreset returned:', success);
      return success;
    }
    case 'updatePreset': {
      const presetGroup = instrument.getPresetGroup();
      if (!presetGroup) return false;
      const preset = presetGroup.findPresetByUniqueId(patch.presetUniqueId);
      if (!preset) return false;
      preset.updatePresets(instrument.getGraphicInterface());
      presetGroup.setCurrentPresetModified(false);
      return true;
    }
    case 'addPreset': {
      const presetGroup = instrument.getPresetGroup();
      if (!presetGroup) return false;
      const preset = new Preset();
      preset.updatePresets(instrument.getGraphicInterface());
      preset.setPresetName(patch.presetName);
      preset['uniqueId'] = crypto.randomUUID();
      presetGroup.getPresets().push(preset);
      presetGroup.getPresets().sort((a, b) => a.getPresetName().localeCompare(b.getPresetName()));
      presetGroup.setCurrentPresetUniqueId(preset.getUniqueId());
      presetGroup.setCurrentPresetModified(false);
      return true;
    }
    case 'addPresetGroup': {
      const presetGroup = instrument.getPresetGroup();
      if (!presetGroup) return false;
      const newFolder = new PresetGroup();
      newFolder.setPresetGroupName(patch.groupName);
      presetGroup.getSubGroups().push(newFolder);
      presetGroup.getSubGroups().sort((a, b) => a.getPresetGroupName().localeCompare(b.getPresetGroupName()));
      return true;
    }
    case 'synchronizePresets': {
      const presetGroup = instrument.getPresetGroup();
      if (!presetGroup) return false;
      // TODO: Implement synchronizePresets functionality
      return false;
    }
    case 'updateEmbeddedOpcodeList':
      instrument.setOpcodeListText(patch.opcodeList);
      return true;
    case 'addUdo': {
      if (!patch.definition) {
        return instrument.addUdo(patch.index, undefined);
      }
      const definition = new OpcodeDefinition();
      definition.setName(patch.definition.name);
      definition.setStyle(UDOStyle[patch.definition.style as keyof typeof UDOStyle]);
      definition.setOutTypes(patch.definition.outTypes);
      definition.setInTypes(patch.definition.inTypes);
      definition.setInputArguments(patch.definition.inputArguments);
      definition.setCode(patch.definition.code);
      definition.setComments(patch.definition.comments);
      return instrument.addUdo(patch.index, definition);
    }
    case 'removeUdo':
      return instrument.removeUdo(patch.index);
    case 'updateUdo': {
      const convertedPatch: Record<string, unknown> = { ...patch.patch };
      if (patch.patch.style !== undefined) {
        convertedPatch.style = UDOStyle[patch.patch.style as keyof typeof UDOStyle];
      }
      return instrument.updateUdo(patch.index, convertedPatch as Parameters<typeof instrument.updateUdo>[1]);
    }
    case 'convertUdoStyle':
      return instrument.convertUdoStyle(
        patch.index,
        UDOStyle[patch.style as keyof typeof UDOStyle],
      );
    case 'reorderUdo':
      return instrument.reorderUdo(patch.from, patch.to);
    case 'randomize':
      instrument.getGraphicInterface().getRootGroup().randomize();
      instrument.invalidateGraphicInterfaceCache();
      return true;
    case 'makeGroup': {
      const gi = instrument.getGraphicInterface();
      const widgetsToGroup: BSBWidget[] = [];
      const collect = (parent: BSBGroup): void => {
        for (const child of parent.getChildren()) {
          if (patch.widgetIds.includes(child.id)) {
            widgetsToGroup.push(child);
            parent.removeChildById(child.id);
          } else if (child instanceof BSBGroup) {
            collect(child as BSBGroup);
          }
        }
      };
      collect(gi.getRootGroup());
      if (widgetsToGroup.length === 0) return false;

      let minX = Infinity, minY = Infinity;
      for (const w of widgetsToGroup) {
        minX = Math.min(minX, w.x);
        minY = Math.min(minY, w.y);
      }

      const group = new BSBGroup();
      group.id = crypto.randomUUID();
      group.x = minX;
      group.y = minY;
      group.groupName = 'Group';

      for (const w of widgetsToGroup) {
        w.x = w.x - minX + 10;
        w.y = w.y - minY + 10;
        group.addChild(w);
      }

      const targetParent = patch.parentGroupId
        ? gi.findWidgetById(patch.parentGroupId)
        : null;
      if (targetParent instanceof BSBGroup) {
        targetParent.addChild(group);
      } else {
        gi.getRootGroup().addChild(group);
      }
      instrument.invalidateGraphicInterfaceCache();
      return true;
    }
    case 'breakGroup': {
      const gi = instrument.getGraphicInterface();
      const group = gi.findWidgetById(patch.widgetId);
      if (!(group instanceof BSBGroup)) return false;

      const findParent = (parent: BSBGroup, targetId: string): BSBGroup | null => {
        for (const child of parent.getChildren()) {
          if (child.id === targetId) return parent;
          if (child instanceof BSBGroup) {
            const found = findParent(child, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const parentGroup = findParent(gi.getRootGroup(), patch.widgetId) ?? gi.getRootGroup();
      const gx = group.x;
      const gy = group.y;
      const children = group.getChildren();
      for (const child of children) {
        child.x += gx;
        child.y += gy;
        parentGroup.addChild(child);
      }
      group.clearChildren();
      gi.removeWidget(patch.widgetId);
      instrument.invalidateGraphicInterfaceCache();
      return true;
    }
    case 'pasteWidgets': {
      const gi = instrument.getGraphicInterface();
      let parsed: BsbWidgetNodeSnapshot[];
      try {
        parsed = JSON.parse(patch.widgetData);
      } catch { return false; }
      if (!Array.isArray(parsed) || parsed.length === 0) return false;

      const existingNames = new Set<string>();
      const collectNames = (group: BSBGroup): void => {
        for (const child of group.getChildren()) {
          if (child.objectName) {
            existingNames.add(child.objectName);
            for (const dk of getDerivedKeys(child)) existingNames.add(dk);
          }
          if (child instanceof BSBGroup) collectNames(child);
        }
      };
      collectNames(gi.getRootGroup());

      const targetParent = patch.parentGroupId
        ? gi.findWidgetById(patch.parentGroupId)
        : null;
      const parent = targetParent instanceof BSBGroup ? targetParent : gi.getRootGroup();

      for (const node of parsed) {
        ensureUniqueName(node, existingNames);
        const widget = createWidgetFromSnapshot(gi, node);
        if (widget) parent.addChild(widget);
      }
      instrument.invalidateGraphicInterfaceCache();
      return true;
    }
  }
}

function createWidgetFromSnapshot(gi: any, node: BsbWidgetNodeSnapshot): BSBWidget | null {
  const bsbGi = gi as { createWidgetByType(t: string): BSBWidget | null };
  const widget = bsbGi.createWidgetByType(node.type);
  if (!widget) return null;

  widget.objectName = node.objectName || '';
  widget.x = node.x;
  widget.y = node.y;

  if (node.properties) {
    for (const [key, val] of Object.entries(node.properties)) {
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        (widget as any)[key] = val;
      } else if (key === 'dropdownItems' && Array.isArray(val)) {
        (widget as any)[key] = val;
      }
    }
  }

  if (widget instanceof BSBGroup) {
    widget.width = node.width ?? 20;
    widget.height = node.height ?? 20;
    const fn = node.properties?.['font.name'];
    const fs = node.properties?.['font.size'];
    const fst = node.properties?.['font.style'];
    if (typeof fn === 'string' || typeof fs === 'number' || typeof fst === 'number') {
      widget.font = {
        name: typeof fn === 'string' ? fn : widget.font.name,
        size: typeof fs === 'number' ? fs : widget.font.size,
        style: typeof fst === 'number' ? fst : widget.font.style,
      };
    }
    if (node.children) {
      for (const childNode of node.children) {
        const child = createWidgetFromSnapshot(gi, childNode);
        if (child) widget.addChild(child);
      }
    }
  }

  return widget;
}

export function ensureUniqueName(node: BsbWidgetNodeSnapshot, existingNames: Set<string>): void {
  const name = node.objectName;
  if (name && hasCollision(name, node, existingNames)) {
    const prefix = name.replace(/\d+$/, '');
    let i = 1;
    let candidate: string;
    do {
      candidate = `${prefix}${i++}`;
    } while (hasCollision(candidate, node, existingNames));
    node.objectName = candidate;
    existingNames.add(candidate);
    for (const dk of getDerivedKeysForSnapshot(node)) existingNames.add(dk);
  } else if (name) {
    existingNames.add(name);
    for (const dk of getDerivedKeysForSnapshot(node)) existingNames.add(dk);
  }
  if (node.children) {
    for (const child of node.children) ensureUniqueName(child, existingNames);
  }
}

function hasCollision(candidate: string, node: BsbWidgetNodeSnapshot, existingNames: Set<string>): boolean {
  if (existingNames.has(candidate)) return true;
  const origName = node.objectName;
  node.objectName = candidate;
  const derived = getDerivedKeysForSnapshot(node);
  node.objectName = origName;
  for (const dk of derived) {
    if (existingNames.has(dk)) return true;
  }
  return false;
}

function getDerivedKeysForSnapshot(node: BsbWidgetNodeSnapshot): string[] {
  const name = node.objectName;
  if (!name) return [];
  switch (node.type) {
    case 'BSBXYController':
      return [name + 'X', name + 'Y'];
    case 'BSBHSliderBank':
    case 'BSBVSliderBank': {
      const count = typeof node.properties?.['sliderBankCount'] === 'number'
        ? node.properties.sliderBankCount : 0;
      const keys: string[] = [];
      for (let i = 0; i < count; i++) keys.push(`${name}.${i}`);
      return keys;
    }
    case 'BSBLineObject': {
      const lines = node.properties?.['lines'];
      if (!Array.isArray(lines)) return [];
      const keys: string[] = [];
      for (const line of lines) {
        if (line && typeof line === 'object' && typeof (line as any).varName === 'string') {
          keys.push(`${name}_${(line as any).varName}`);
        }
      }
      return keys;
    }
    default:
      return [];
  }
}

function getDerivedKeys(widget: BSBWidget): string[] {
  const name = widget.objectName;
  if (!name) return [];
  const w = widget as any;
  switch (widget.constructor.name) {
    case 'BSBXYController':
      return [name + 'X', name + 'Y'];
    case 'BSBHSliderBank':
    case 'BSBVSliderBank': {
      const count = typeof w.sliderBankCount === 'number' ? w.sliderBankCount : 0;
      const keys: string[] = [];
      for (let i = 0; i < count; i++) keys.push(`${name}.${i}`);
      return keys;
    }
    case 'BSBLineObject': {
      const lines: unknown[] = Array.isArray(w.lines) ? w.lines : [];
      const keys: string[] = [];
      for (const line of lines) {
        if (line && typeof line === 'object' && typeof (line as any).varName === 'string') {
          keys.push(`${name}_${(line as any).varName}`);
        }
      }
      return keys;
    }
    default:
      return [];
  }
}

function applyInstrumentPatch(instrument: Instrument, patch: InstrumentPatch): boolean {
  let changed = false;
  if (patch.name !== undefined && instrument.getName() !== patch.name) {
    instrument.setName(patch.name);
    changed = true;
  }
  if (patch.enabled !== undefined && instrument.isEnabled() !== patch.enabled) {
    instrument.setEnabled(patch.enabled);
    changed = true;
  }
  if (patch.comment !== undefined && instrument.getComment() !== patch.comment) {
    instrument.setComment(patch.comment);
    changed = true;
  }

  if (instrument instanceof GenericInstrument) {
    if (patch.text !== undefined && instrument.getText() !== patch.text) {
      instrument.setText(patch.text);
      changed = true;
    }
    if (patch.globalOrc !== undefined && instrument.getGlobalOrc() !== patch.globalOrc) {
      instrument.setGlobalOrc(patch.globalOrc);
      changed = true;
    }
    if (patch.globalSco !== undefined && instrument.getGlobalSco() !== patch.globalSco) {
      instrument.setGlobalSco(patch.globalSco);
      changed = true;
    }
    if (patch.embeddedOpcodeList) {
      changed = applyEmbeddedOpcodeListPatch(instrument.getOpcodeList(), patch.embeddedOpcodeList) || changed;
    }
  } else if (instrument instanceof JavaScriptInstrument || instrument instanceof PythonInstrument) {
    if (patch.text !== undefined && instrument.getText() !== patch.text) {
      instrument.setText(patch.text);
      changed = true;
    }
    if (patch.globalOrc !== undefined && instrument.getGlobalOrc() !== patch.globalOrc) {
      instrument.setGlobalOrc(patch.globalOrc);
      changed = true;
    }
    if (patch.globalSco !== undefined && instrument.getGlobalSco() !== patch.globalSco) {
      instrument.setGlobalSco(patch.globalSco);
      changed = true;
    }
    if (patch.embeddedOpcodeList) {
      changed = applyEmbeddedOpcodeListPatch(instrument.getOpcodeList(), patch.embeddedOpcodeList) || changed;
    }
  } else if (instrument instanceof BlueSynthBuilder) {
    if (
      patch.instrumentText !== undefined &&
      instrument.getInstrumentText() !== patch.instrumentText
    ) {
      instrument.setInstrumentText(patch.instrumentText);
      changed = true;
    }
    if (
      patch.alwaysOnInstrumentText !== undefined &&
      instrument.getAlwaysOnInstrumentText() !== patch.alwaysOnInstrumentText
    ) {
      instrument.setAlwaysOnInstrumentText(patch.alwaysOnInstrumentText);
      changed = true;
    }
    if (patch.globalOrc !== undefined && instrument.getGlobalOrc() !== patch.globalOrc) {
      instrument.setGlobalOrc(patch.globalOrc);
      changed = true;
    }
    if (patch.globalSco !== undefined && instrument.getGlobalSco() !== patch.globalSco) {
      instrument.setGlobalSco(patch.globalSco);
      changed = true;
    }
    if (patch.bsbWidgetValues) {
      for (const [objectName, value] of Object.entries(patch.bsbWidgetValues)) {
        changed = instrument.updateWidgetValue(objectName, value) || changed;
      }
    }
    if (patch.bsbOpcodeListText !== undefined && instrument.getOpcodeListText() !== patch.bsbOpcodeListText) {
      instrument.setOpcodeListText(patch.bsbOpcodeListText);
      changed = true;
    }
    if (patch.bsbInterface) {
      changed = applyBsbInterfacePatch(instrument, patch.bsbInterface) || changed;
    }
  }

  return changed;
}

function convertGenericToBsb(instrument: GenericInstrument): BlueSynthBuilder {
  const bsb = new BlueSynthBuilder();
  bsb.setName(instrument.getName());
  bsb.setComment(instrument.getComment());
  bsb.setGlobalOrc(instrument.getGlobalOrc());
  bsb.setGlobalSco(instrument.getGlobalSco());
  bsb.setInstrumentText(instrument.getText());
  bsb.setOpcodeList(instrument.getOpcodeList());
  return bsb;
}

export function applyProjectPropertiesPatch(
  properties: ProjectProperties,
  patch: Partial<ProjectPropertiesSnapshot>,
): boolean {
  let changed = false;
  const propertyRecord = properties as unknown as Record<string, unknown>;

  const entries = Object.entries(patch) as Array<
    [keyof ProjectPropertiesSnapshot, ProjectPropertiesSnapshot[keyof ProjectPropertiesSnapshot]]
  >;

  for (const [key, value] of entries) {
    switch (key) {
      case 'title':
      case 'author':
      case 'notes':
      case 'sampleRate':
      case 'ksmps':
      case 'nchnls':
      case 'useZeroDbFS':
      case 'zeroDbFS':
      case 'diskSampleRate':
      case 'diskKsmps':
      case 'diskChannels':
      case 'diskUseZeroDbFS':
      case 'diskZeroDbFS':
      case 'useAudioOut':
      case 'useAudioIn':
      case 'useMidiIn':
      case 'useMidiOut':
      case 'noteAmpsEnabled':
      case 'outOfRangeEnabled':
      case 'warningsEnabled':
      case 'benchmarkEnabled':
      case 'advancedSettings':
      case 'completeOverride':
      case 'fileName':
      case 'askOnRender':
      case 'diskNoteAmpsEnabled':
      case 'diskOutOfRangeEnabled':
      case 'diskWarningsEnabled':
      case 'diskBenchmarkEnabled':
      case 'diskAdvancedSettings':
      case 'diskCompleteOverride':
      case 'diskAlwaysRenderEntireProject':
      case 'mediaFolder':
      case 'copyToMediaFileOnImport':
        if (propertyRecord[key] !== value) {
          propertyRecord[key] = value;
          changed = true;
        }
        break;
      default:
        break;
    }
  }

  return changed;
}

export function createBlueLiveProjectSnapshot(liveData: LiveData): BlueLiveProjectSnapshot {
  const bins = liveData.getLiveObjectBins();
  const cells: Array<Array<LiveObjectCellSnapshot | null>> = [];
  for (let c = 0; c < bins.getColumnCount(); c++) {
    const col: Array<LiveObjectCellSnapshot | null> = [];
    for (let r = 0; r < bins.getRowCount(); r++) {
      const obj = bins.getLiveObject(c, r);
      if (obj) {
        col.push({
          uniqueId: obj.getUniqueId(),
          enabled: obj.isEnabled(),
          keyTrigger: obj.getKeyTrigger(),
          midiTrigger: obj.getMidiTrigger(),
          displayName: obj.getDisplayName(),
          soundObjectType: obj.getSoundObjectType(),
          hasSoundObject: obj.hasSoundObject,
        });
      } else {
        col.push(null);
      }
    }
    cells.push(col);
  }

  return {
    commandLine: liveData.getCommandLine(),
    commandLineEnabled: liveData.isCommandLineEnabled(),
    commandLineOverride: liveData.isCommandLineOverride(),
    tempo: liveData.getTempo(),
    repeat: liveData.getRepeat(),
    repeatEnabled: liveData.isRepeatEnabled(),
    liveCodeText: liveData.getLiveCodeText(),
    bins: { columns: bins.getColumnCount(), rows: bins.getRowCount(), cells },
    sets: liveData.getLiveObjectSets().getSets().map((set) => ({
      name: set.getName(),
      liveObjectIds: set.getLiveObjectIds(),
    })),
  };
}

export function createMidiScaleSnapshot(scale: Scale | null): MidiScaleSnapshot | null {
  if (!scale) {
    return null;
  }

  return {
    scaleName: scale.scaleName,
    baseFrequency: scale.baseFrequency,
    octave: scale.octave,
    ratios: Array.isArray(scale.ratios) ? [...scale.ratios] : [],
  };
}

export function createTrackerColumnSnapshot(
  column: Column,
  sourceIndex: number | null = null,
): TrackerColumnSnapshot {
  return {
    name: column.getName(),
    type: column.getType(),
    restrictedToInteger: column.isRestrictedToInteger(),
    usingRange: column.isUsingRange(),
    rangeMin: column.getRangeMin(),
    rangeMax: column.getRangeMax(),
    outputFrequency: column.isOutputFrequency(),
    scale: createMidiScaleSnapshot(column.getScale()),
    sourceIndex,
  };
}

export function createMidiInputProcessorSnapshot(
  processor: { getKeyMapping(): string; getVelocityMapping(): string; getPitchConstant(): string; getAmpConstant(): string; getScale(): Scale | null },
): MidiInputProcessorSnapshot {
  return {
    keyMapping: processor.getKeyMapping(),
    velocityMapping: processor.getVelocityMapping(),
    pitchConstant: processor.getPitchConstant(),
    ampConstant: processor.getAmpConstant(),
    scale: createMidiScaleSnapshot(processor.getScale()),
  };
}

function createScaleFromSnapshot(snapshot: MidiScaleSnapshot | null): Scale | null {
  if (!snapshot) {
    return null;
  }

  const scale = new Scale();
  scale.scaleName = snapshot.scaleName;
  scale.baseFrequency = snapshot.baseFrequency;
  scale.octave = snapshot.octave;
  scale.ratios = snapshot.ratios.length > 0 ? [...snapshot.ratios] : [...scale.ratios];
  return scale;
}

function createTrackerColumnFromSnapshot(snapshot: TrackerColumnSnapshot): Column {
  const column = new Column();
  column.setName(snapshot.name);
  column.setType(snapshot.type);
  column.setRestrictedToInteger(Boolean(snapshot.restrictedToInteger));
  column.setUsingRange(Boolean(snapshot.usingRange));

  const rangeMin = Number(snapshot.rangeMin);
  const rangeMax = Number(snapshot.rangeMax);
  if (Number.isFinite(rangeMin)) {
    column.setRangeMin(rangeMin);
  }
  if (Number.isFinite(rangeMax)) {
    column.setRangeMax(rangeMax);
  }

  const scale = createScaleFromSnapshot(snapshot.scale ?? null);
  if (scale) {
    column.setScale(scale);
  }
  column.setOutputFrequency(Boolean(snapshot.outputFrequency));
  return column;
}

function applyMidiInputPatch(
  data: BlueData,
  patch: MidiInputPatch,
): boolean {
  const midiInput = data.getMidiInputProcessor();

  switch (patch.type) {
    case 'updateKeyMapping':
      midiInput.setKeyMapping(patch.value);
      return true;
    case 'updateVelocityMapping':
      midiInput.setVelocityMapping(patch.value);
      return true;
    case 'updatePitchConstant':
      midiInput.setPitchConstant(patch.value);
      return true;
    case 'updateAmpConstant':
      midiInput.setAmpConstant(patch.value);
      return true;
    case 'updateScale':
      midiInput.setScale(createScaleFromSnapshot(patch.scale));
      return true;
  }
}

function applyBlueLivePatch(data: BlueData, patch: BlueLivePatch): boolean {
  const liveData = data.getLiveData();
  switch (patch.type) {
    case 'updateOptions':
      if (patch.patch.commandLine !== undefined) liveData.setCommandLine(patch.patch.commandLine);
      if (patch.patch.commandLineEnabled !== undefined) liveData.setCommandLineEnabled(patch.patch.commandLineEnabled);
      if (patch.patch.commandLineOverride !== undefined) liveData.setCommandLineOverride(patch.patch.commandLineOverride);
      return true;
    case 'updateTempoRepeat':
      if (patch.patch.tempo !== undefined) liveData.setTempo(patch.patch.tempo);
      if (patch.patch.repeat !== undefined) liveData.setRepeat(patch.patch.repeat);
      if (patch.patch.repeatEnabled !== undefined) liveData.setRepeatEnabled(patch.patch.repeatEnabled);
      return true;
    case 'updateLiveCodeText':
      liveData.setLiveCodeText(patch.text);
      return true;
    case 'setCellEnabled': {
      const obj = liveData.getLiveObjectBins().getLiveObject(patch.column, patch.row);
      if (obj) {
        obj.setEnabled(patch.enabled);
        return true;
      }
      return false;
    }
    case 'insertRow':
      liveData.getLiveObjectBins().insertRow(patch.index);
      return true;
    case 'removeRow':
      liveData.getLiveObjectBins().removeRow(patch.index);
      return true;
    case 'insertColumn':
      liveData.getLiveObjectBins().insertColumn(patch.index);
      return true;
    case 'removeColumn':
      liveData.getLiveObjectBins().removeColumn(patch.index);
      return true;
    case 'captureEnabledSet': {
      const sets = liveData.getLiveObjectSets();
      const count = sets.getSets().length;
      sets.captureEnabledSet(liveData.getLiveObjectBins(), `Set ${count + 1}`);
      return true;
    }
    case 'renameSet':
      liveData.getLiveObjectSets().rename(patch.index, patch.name);
      return true;
    case 'removeSet':
      liveData.getLiveObjectSets().removeAt(patch.index);
      return true;
    case 'moveSet':
      liveData.getLiveObjectSets().move(patch.from, patch.to);
      return true;
    case 'applySet':
      return liveData.getLiveObjectSets().applySet(patch.index, liveData.getLiveObjectBins());
  }
}

function findPolyObjectByGroupId(score: import('@blue/data').Score, groupId: string): PolyObject | null {
  for (let i = 0; i < score.length; i++) {
    const lg = score[i];
    if (lg instanceof PolyObject) {
      if (assignLayerGroupId(lg) === groupId) return lg;
      const found = findPolyObjectByGroupIdRecursive(lg, groupId);
      if (found) return found;
    }
  }
  return null;
}

function findPolyObjectByGroupIdRecursive(pObj: PolyObject, groupId: string): PolyObject | null {
  for (const layer of pObj) {
    for (const sObj of layer) {
      if (sObj instanceof PolyObject) {
        if (assignLayerGroupId(sObj) === groupId) return sObj;
        const found = findPolyObjectByGroupIdRecursive(sObj, groupId);
        if (found) return found;
      }
    }
  }
  return null;
}

function applyAddScoreObjectsPatch(data: BlueData, patch: ScorePatch & { type: 'addScoreObjects' }): boolean {
  const score = data.getScore();

  const targetGroup = findPolyObjectByGroupId(score, patch.groupId);
  if (!targetGroup) return false;

  for (const obj of patch.objects) {
    const sObj = createSoundObject(obj.objectType);
    if (!sObj) continue;

    if (sObj instanceof AbstractSoundObject) {
      sObj.setName(obj.name);
      sObj.setStartTime(TimePosition.beats(obj.startBeats));
      sObj.setSubjectiveDuration(TimeDuration.beats(obj.durationBeats));
      sObj.setBackgroundColor(obj.backgroundColor);
    } else if (sObj instanceof PolyObject) {
      sObj.setName(obj.name);
      sObj.setStartTime(TimePosition.beats(obj.startBeats));
      sObj.setSubjectiveDuration(TimeDuration.beats(obj.durationBeats));
      sObj.setBackgroundColor(obj.backgroundColor);
    }

    if (obj.layerIndex >= 0 && obj.layerIndex < targetGroup.length) {
      targetGroup[obj.layerIndex].push(sObj);
    }
  }

  return true;
}

function applyMoveScoreObjectsPatch(
  data: BlueData,
  patch: ScorePatch & { type: 'moveScoreObjects' },
): boolean {
  const score = data.getScore();
  const resolvedMoves: Array<{
    move: (typeof patch.moves)[number];
    sourceResolved: NonNullable<ReturnType<typeof resolveTimelineTarget>>;
    targetLayer: Array<SoundObject | AudioClip>;
  }> = [];

  for (const move of patch.moves) {
    const sourceLocation = move.target.location ?? move.target.sourceInstanceLocation;
    if (!sourceLocation) continue;

    const sourceResolved = resolveTimelineTarget(score, sourceLocation);
    if (!sourceResolved) continue;

    const targetGroup = findPolyObjectByGroupId(score, move.targetGroupId);
    if (!targetGroup) continue;

    const targetLayer = targetGroup[move.targetLayerIndex] as Array<SoundObject | AudioClip> | undefined;
    if (!targetLayer) continue;

    resolvedMoves.push({ move, sourceResolved, targetLayer });
  }

  resolvedMoves.sort((a, b) => b.sourceResolved.objectIndex - a.sourceResolved.objectIndex);

  let changed = false;
  for (const entry of resolvedMoves) {
    const [sObj] = entry.sourceResolved.layer.splice(entry.sourceResolved.objectIndex, 1);
    if (!sObj) continue;

    if (sObj instanceof AudioClip) {
      sObj.setStartTime(TimePosition.beats(entry.move.targetStartBeats));
    } else if (sObj instanceof AbstractSoundObject) {
      sObj.setStartTime(TimePosition.beats(entry.move.targetStartBeats));
    }

    entry.targetLayer.push(sObj);
    changed = true;
  }

  return changed;
}

function removeScoreObjectByTarget(data: BlueData, target: ScoreObjectEditorTargetSnapshot): boolean {
  const score = data.getScore();
  const location = target.location ?? target.sourceInstanceLocation;
  if (!location) return false;

  const timelineResolved = resolveTimelineTarget(score, location);
  if (!timelineResolved) return false;
  const { layer, objectIndex } = timelineResolved;
  if (objectIndex < 0 || objectIndex >= layer.length) return false;

  layer.splice(objectIndex, 1);
  return true;
}

function applyScoreObjectPatch(data: BlueData, patch: ScorePatch): boolean {
  if (patch.type === 'addScoreObjects') {
    return applyAddScoreObjectsPatch(data, patch);
  }

  if (patch.type === 'moveScoreObjects') {
    return applyMoveScoreObjectsPatch(data, patch);
  }

  if (patch.type === 'removeScoreObjects') {
    let removedAny = false;
    for (const target of patch.targets) {
      if (removeScoreObjectByTarget(data, target)) {
        removedAny = true;
      }
    }
    return removedAny;
  }

  if (patch.type === 'addLayer') {
    const score = data.getScore();
    const targetGroup = findPolyObjectByGroupId(score, patch.groupId);
    if (!targetGroup) return false;
    targetGroup.newLayerAt(patch.layerIndex + 1);
    return true;
  }

  if (patch.type === 'removeLayer') {
    const score = data.getScore();
    const targetGroup = findPolyObjectByGroupId(score, patch.groupId);
    if (!targetGroup) return false;
    if (patch.layerIndex >= 0 && patch.layerIndex < targetGroup.length) {
      targetGroup.removeLayers(patch.layerIndex, patch.layerIndex);
    }
    return true;
  }

  if (patch.type === 'updateTimeState') {
    return applyScoreTimeStatePatch(data, patch.patch);
  }

  const target = (patch as { target: ScoreObjectEditorTargetSnapshot }).target;
  const resolved = resolveEditorTarget(data, target);
  if (!resolved) return false;

  const { sObj } = resolved;
  const score = data.getScore();
  const context = score.getTimeContext();

  switch (patch.type) {
    case 'updateSharedProperties': {
      const p = patch.patch;
      if (p.name !== undefined) sObj.setName(p.name);
      if (p.backgroundColor !== undefined) {
        if (sObj instanceof AudioClip) {
          sObj.setBackgroundColor(p.backgroundColor);
        } else if (sObj instanceof AbstractSoundObject) {
          sObj.setBackgroundColor(p.backgroundColor);
        }
      }
      if (p.startTime !== undefined) {
        const tb = p.startTime.timeBase as TimeBase;
        const tp = beatsToTimePosition(p.startTime.value, tb, context);
        if (sObj instanceof AudioClip) {
          sObj.setStartTime(tp);
        } else if (sObj instanceof AbstractSoundObject) {
          sObj.setStartTime(tp);
        }
      }
      if (p.subjectiveDuration !== undefined) {
        const tb = p.subjectiveDuration.timeBase as TimeBase;
        const td = beatsToDuration(p.subjectiveDuration.value, tb, context);
        if (sObj instanceof AudioClip) {
          sObj.setSubjectiveDuration(td);
        } else if (sObj instanceof AbstractSoundObject) {
          sObj.setSubjectiveDuration(td);
        }
      }
      return true;
    }
    case 'updateSoundObjectBehavior': {
      if (!(sObj instanceof AbstractSoundObject)) return false;
      const p = patch.patch;
      if (p.timeBehavior !== undefined) {
        sObj.setTimeBehavior(p.timeBehavior as TimeBehavior);
      }
      if (p.repeatPoint !== undefined) {
        if (p.repeatPoint === null) {
          sObj.setRepeatPoint(null);
        } else {
          const tb = p.repeatPoint.timeBase as TimeBase;
          sObj.setRepeatPoint(beatsToDuration(p.repeatPoint.value, tb, context));
        }
      }
      return true;
    }
    case 'replaceNoteProcessorChain': {
      if (!(sObj instanceof AbstractSoundObject)) return false;
      if (patch.chain === null) {
        sObj.setNoteProcessorChain(new NoteProcessorChain());
      } else {
        // For now, preserve existing chain — full replacement requires processor reification
        // which is deferred to a later iteration.
      }
      return true;
    }
    case 'updateTypeSpecificEditor': {
      if (patch.patch.text !== undefined) {
        return setCodeText(sObj as SoundObject, patch.patch.text as string);
      }
      if (sObj instanceof External) {
        const ext = sObj as External;
        const p = patch.patch;
        if (p.scoreText !== undefined) ext.setText(p.scoreText as string);
        if (p.commandLine !== undefined) ext.setCommandLine(p.commandLine as string);
        if (p.syntaxType !== undefined) ext.setSyntaxType(p.syntaxType as string);
        return true;
      }
      if (sObj instanceof TrackerObject) {
        const to = sObj as TrackerObject;
        const p = patch.patch;
        if (p.showNoteNames !== undefined) {
          // stored in tracker payload, not directly on model
        }
        if (p.octave !== undefined) {
          // stored in tracker payload, not directly on model
        }
        if (Array.isArray(p.cellChanges)) {
          const trackList = to.getTracks();
          for (const change of p.cellChanges as Array<{ trackId: string; rowIndex: number; columnId: string; value: string | number | null }>) {
            const trackIdx = parseInt(change.trackId.replace('tracker-track-', ''), 10);
            if (trackIdx >= 0 && trackIdx < trackList.size() && change.columnId.startsWith('track-')) {
              const track = trackList.getTrack(trackIdx)!;
              if (change.rowIndex >= 0 && change.rowIndex < track.getNumSteps()) {
                const trNote = track.getTrackerNote(change.rowIndex);
                const val = String(change.value ?? '').trim();
                if (val === '-') {
                  trNote.setTied(true);
                  trNote.setOff(false);
                } else if (val.toUpperCase() === 'OFF') {
                  trNote.setOff(true);
                  trNote.setTied(false);
                } else {
                  trNote.setTied(false);
                  trNote.setOff(false);
                  trNote.setValue(1, val);
                }
              }
            }
          }
        }
        if (p.stepsPerBeat !== undefined) to.setStepsPerBeat(p.stepsPerBeat as number);
        if (p.steps !== undefined) {
          to.getTracks().setSteps(p.steps as number);
        }
        if (p.updateTrackCell !== undefined) {
          const { trackIndex, columnIndex, stepIndex, value } = p.updateTrackCell as { trackIndex: number; columnIndex: number; stepIndex: number; value: string };
          const trackList = to.getTracks();
          if (trackIndex >= 0 && trackIndex < trackList.size()) {
            const track = trackList.getTrack(trackIndex)!;
            if (stepIndex >= 0 && stepIndex < track.getNumSteps()) {
              const trNote = track.getTrackerNote(stepIndex);
              const val = String(value ?? '').trim();

              if (columnIndex === -1) { // status column
                if (val === '-') {
                  trNote.setTied(true);
                  trNote.setOff(false);
                } else if (val.toUpperCase() === 'OFF') {
                  trNote.setOff(true);
                  trNote.setTied(false);
                } else {
                  trNote.setTied(false);
                  trNote.setOff(false);
                }
              } else {
                if (trNote.isOff()) {
                  return true;
                }
                const col = track.getColumn(columnIndex + 1);
                if (!col) {
                  return true;
                }
                if (!col.isValid(val)) {
                  // Java parity: invalid edits are rejected and prior value is preserved.
                  return true;
                }

                if (!trNote.isActive()) {
                  if (val.length === 0) {
                    return true;
                  }

                  let previousNote: TrackerNote | null = null;
                  for (let i = stepIndex - 1; i >= 0; i--) {
                    const temp = track.getTrackerNote(i);
                    if (temp.isActive()) {
                      previousNote = temp;
                      break;
                    }
                  }

                  if (previousNote) {
                    trNote.copyValues(previousNote);
                  } else {
                    for (let i = 1; i < track.getNumColumns(); i++) {
                      const c = track.getColumn(i);
                      if (c) {
                        trNote.setValue(i, c.getDefaultValue());
                      }
                    }
                  }
                }
                trNote.setValue(columnIndex + 1, val);
              }
            }
          }
        }
        if (p.updateTrackProperties !== undefined) {
          const { trackIndex, name, instrumentId, noteTemplate, columns } = p.updateTrackProperties as {
            trackIndex: number;
            name: string;
            instrumentId: string;
            noteTemplate: string;
            columns?: TrackerColumnSnapshot[];
          };
          const track = to.getTracks().getTrack(trackIndex);
          if (track) {
            track.setName(name);
            track.setInstrumentId(instrumentId);
            track.setNoteTemplate(noteTemplate);

            if (columns) {
              const oldCols: Column[] = [];
              for (let i = 1; i < track.getNumColumns(); i++) {
                const c = track.getColumn(i);
                if (c) oldCols.push(c);
              }
              const priorValues: string[][] = [];
              for (let rowIndex = 0; rowIndex < track.getNumSteps(); rowIndex++) {
                const trNote = track.getTrackerNote(rowIndex);
                const rowValues: string[] = [];
                for (let colIndex = 0; colIndex < oldCols.length; colIndex++) {
                  rowValues.push(trNote.getValue(colIndex + 1));
                }
                priorValues.push(rowValues);
              }
              const sourceIndexMap: Array<number | null> = columns.map((columnDef, newIndex) => {
                if (typeof columnDef.sourceIndex === 'number' && Number.isInteger(columnDef.sourceIndex)) {
                  const sourceIndex = columnDef.sourceIndex;
                  return sourceIndex >= 0 && sourceIndex < oldCols.length ? sourceIndex : null;
                }
                if (columnDef.sourceIndex === undefined) {
                  return newIndex >= 0 && newIndex < oldCols.length ? newIndex : null;
                }
                return null;
              });

              oldCols.forEach((c) => track.removeColumn(c));

              columns.forEach((columnDef) => {
                track.addColumn(createTrackerColumnFromSnapshot(columnDef));
              });

              for (let rowIndex = 0; rowIndex < track.getNumSteps(); rowIndex++) {
                const trNote = track.getTrackerNote(rowIndex);
                if (trNote.isOff()) {
                  continue;
                }
                for (let colIndex = 0; colIndex < columns.length; colIndex++) {
                  const sourceIndex = sourceIndexMap[colIndex];
                  if (sourceIndex === null) {
                    continue;
                  }
                  const priorValue = priorValues[rowIndex]?.[sourceIndex] ?? '';
                  if (priorValue.trim().length > 0) {
                    trNote.setValue(colIndex + 1, priorValue);
                  }
                }
              }
            }
          }
        }
        if (p.addTrack !== undefined) {
          const trackList = to.getTracks();
          const newTrack = new Track();
          trackList.addTrack(newTrack);
        }
        if (p.duplicateTrack !== undefined) {
          const trackIdx = p.duplicateTrack as number;
          const track = to.getTracks().getTrack(trackIdx);
          if (track) {
            to.getTracks().addTrack(Track.fromOther(track), trackIdx + 1);
          }
        }
        if (p.clearTrack !== undefined) {
          const trackIdx = p.clearTrack as number;
          const track = to.getTracks().getTrack(trackIdx);
          if (track) {
            track.clearNotes();
          }
        }
        if (p.removeTrack !== undefined) {
          to.getTracks().removeTrack(p.removeTrack as number);
        }
        if (p.trackerAction !== undefined) {
          const action = p.trackerAction as {
            type: string;
            trackIndex: number;
            stepIndex: number;
            columnIndex: number;
            noteBuffer?: Array<Array<{ tied: boolean; off: boolean; fields: string[] }>>;
          };
          const trackList = to.getTracks();
          const track = trackList.getTrack(action.trackIndex);

          if (track) {
            const note = action.stepIndex >= 0 && action.stepIndex < track.getNumSteps()
              ? track.getTrackerNote(action.stepIndex)
              : null;

            switch (action.type) {
              case 'toggleTie':
                if (note && note.isActive() && !note.isOff()) {
                  note.setTied(!note.isTied());
                }
                break;
              case 'clearOrDuplicate':
                if (note) {
                  if (note.isOff() || note.isActive()) {
                    note.clear();
                  } else {
                    for (let i = action.stepIndex - 1; i >= 0; i--) {
                      const prev = track.getTrackerNote(i);
                      if (prev.isActive()) {
                        note.copyValues(prev);
                        break;
                      }
                    }
                  }
                }
                break;
              case 'setNoteOff':
                if (note) {
                  const wasOff = note.isOff();
                  note.clear();
                  note.setOff(!wasOff);
                }
                break;
              case 'incrementValue':
                if (note && action.columnIndex >= 0) {
                  const col = track.getColumn(action.columnIndex + 1);
                  const val = note.getValue(action.columnIndex + 1);
                  if (col && val && val !== '' && val !== '-' && val !== 'OFF') {
                    const newVal = col.getIncrementValue(val);
                    if (newVal !== null) note.setValue(action.columnIndex + 1, newVal);
                  }
                }
                break;
              case 'decrementValue':
                if (note && action.columnIndex >= 0) {
                  const col = track.getColumn(action.columnIndex + 1);
                  const val = note.getValue(action.columnIndex + 1);
                  if (col && val && val !== '' && val !== '-' && val !== 'OFF') {
                    const newVal = col.getDecrementValue(val);
                    if (newVal !== null) note.setValue(action.columnIndex + 1, newVal);
                  }
                }
                break;
              case 'deleteNote':
                if (note) {
                  note.clear();
                }
                break;
              case 'insertNote':
                if (action.stepIndex < track.getNumSteps() - 1) {
                  track.insertNote(action.stepIndex);
                }
                break;
              case 'removeNote':
                track.removeNote(action.stepIndex);
                break;
              case 'cutNotes': {
                const buffer = action.noteBuffer;
                if (buffer && buffer.length > 0) {
                  for (let i = 0; i < buffer.length; i++) {
                    const rowIndex = action.stepIndex + i;
                    if (rowIndex >= track.getNumSteps()) break;
                    const n = track.getTrackerNote(rowIndex);
                    n.clear();
                  }
                }
                break;
              }
              case 'pasteNotes': {
                const buf = action.noteBuffer;
                if (buf && buf.length > 0) {
                  for (let i = 0; i < buf.length; i++) {
                    const destRow = action.stepIndex + i;
                    if (destRow >= track.getNumSteps()) break;
                    const dest = track.getTrackerNote(destRow);
                    const src = buf[i];
                    const sourceNote = src?.[0];
                    if (!sourceNote) {
                      continue;
                    }
                    dest.clear();
                    if (sourceNote.off) {
                      dest.setOff(true);
                    } else {
                      dest.setTied(sourceNote.tied);
                      for (let f = 0; f < sourceNote.fields.length; f++) {
                        dest.setValue(f + 1, sourceNote.fields[f]);
                      }
                    }
                  }
                }
                break;
              }
              case 'setNoteValue':
                if (note && action.columnIndex >= 0) {
                  const col = track.getColumn(action.columnIndex + 1);
                  if (!col) {
                    break;
                  }
                  const buf2 = action.noteBuffer;
                  if (buf2 && buf2[0] && buf2[0][0]) {
                    const nextValue = String(buf2[0][0].fields[0] ?? '').trim();
                    if (!col.isValid(nextValue)) {
                      break;
                    }
                    if (!note.isActive()) {
                      if (nextValue.length === 0) {
                        break;
                      }

                      let previousNote: TrackerNote | null = null;
                      for (let i = action.stepIndex - 1; i >= 0; i--) {
                        const temp = track.getTrackerNote(i);
                        if (temp.isActive()) {
                          previousNote = temp;
                          break;
                        }
                      }

                      if (previousNote) {
                        note.copyValues(previousNote);
                      } else {
                        for (let i = 1; i < track.getNumColumns(); i++) {
                          const defaultCol = track.getColumn(i);
                          if (defaultCol) {
                            note.setValue(i, defaultCol.getDefaultValue());
                          }
                        }
                      }
                    }
                    note.setValue(action.columnIndex + 1, nextValue);
                  }
                }
                break;
            }
          }
        }
        return true;
      }
      if (sObj instanceof AudioClip) {
        const clip = sObj as AudioClip;
        const p = patch.patch;
        if (p.audioFile !== undefined) clip.setAudioFile(p.audioFile as string);
        if (p.fileStartTime !== undefined) clip.setFileStartTime(p.fileStartTime as number);
        if (p.fadeIn !== undefined) clip.setFadeIn(p.fadeIn as number);
        if (p.fadeOut !== undefined) clip.setFadeOut(p.fadeOut as number);
        if (p.looping !== undefined) clip.setLooping(null, p.looping as boolean);
        return true;
      }
      if (sObj instanceof AudioFile) {
        const af = sObj as AudioFile;
        const p = patch.patch;
        if (p.filePath !== undefined) af.setSoundFileName(p.filePath as string);
        if (p.csoundPostCode !== undefined) af.setCsoundPostCode(p.csoundPostCode as string);
        return true;
      }
      if (sObj instanceof FrozenSoundObject) {
        const fso = sObj as FrozenSoundObject;
        const p = patch.patch;
        if (p.filePath !== undefined) fso.setFrozenWaveFileName(p.filePath as string);
        return true;
      }
      if (sObj instanceof PatternObject) {
        const po = sObj as PatternObject;
        const p = patch.patch;
        if (p.beats !== undefined) po.setBeats(p.beats as number);
        if (p.subDivisions !== undefined) po.setSubDivisions(p.subDivisions as number);
        if (Array.isArray(p.patterns)) {
          const newPatterns = p.patterns as Array<{
            patternName: string;
            patternScore: string;
            muted: boolean;
            solo: boolean;
            values: boolean[];
          }>;
          while (po.size() > 0) {
            (po as unknown as { _patterns: Pattern[] })._patterns.pop();
          }
          for (const sp of newPatterns) {
            const np = new Pattern(sp.values.length);
            np.patternName = sp.patternName;
            np.patternScore = sp.patternScore;
            np.muted = sp.muted;
            np.solo = sp.solo;
            np.values = [...sp.values];
            po.addPattern(np);
          }
        }
        if (p.toggleStep !== undefined) {
          const { patternIndex, stepIndex } = p.toggleStep as { patternIndex: number; stepIndex: number };
          if (patternIndex >= 0 && patternIndex < po.size()) {
            const pat = po.getPattern(patternIndex);
            if (stepIndex >= 0 && stepIndex < pat.values.length) {
              pat.values[stepIndex] = !pat.values[stepIndex];
            }
          }
        }
        if (p.updatePatternScore !== undefined) {
          const { patternIndex, patternScore } = p.updatePatternScore as { patternIndex: number; patternScore: string };
          if (patternIndex >= 0 && patternIndex < po.size()) {
            po.getPattern(patternIndex).patternScore = patternScore;
          }
        }
        if (p.updatePatternName !== undefined) {
          const { patternIndex, patternName } = p.updatePatternName as { patternIndex: number; patternName: string };
          if (patternIndex >= 0 && patternIndex < po.size()) {
            po.getPattern(patternIndex).patternName = patternName;
          }
        }
        if (p.toggleMute !== undefined) {
          const idx = p.toggleMute as number;
          if (idx >= 0 && idx < po.size()) {
            po.getPattern(idx).muted = !po.getPattern(idx).muted;
          }
        }
        if (p.toggleSolo !== undefined) {
          const idx = p.toggleSolo as number;
          if (idx >= 0 && idx < po.size()) {
            po.getPattern(idx).solo = !po.getPattern(idx).solo;
          }
        }
        if (p.addPattern !== undefined) {
          const numSteps = po.getBeats() * po.getSubDivisions();
          po.addPattern(new Pattern(numSteps));
        }
        return true;
      }
      if (sObj instanceof ZakLineObject) {
        const zlo = sObj as ZakLineObject;
        const p = patch.patch;
        if (p.zakSpace !== undefined) zlo.setZakSpace(p.zakSpace as number);
        if (Array.isArray(p.lines)) {
          const existingLines = zlo.getLines();
          const newLines = p.lines as Array<{
            channel: number;
            min?: number;
            max?: number;
            resolution?: string;
            color: number;
            rightBound?: boolean;
            endPointsLinked?: boolean;
            points: Array<{ x: number; y: number }>;
          }>;
          (zlo as unknown as { _lines: typeof newLines })._lines = newLines.map((line, index) => ({
            channel: line.channel,
            min: typeof line.min === 'number' ? line.min : existingLines[index]?.min,
            max: typeof line.max === 'number' ? line.max : existingLines[index]?.max,
            resolution: typeof line.resolution === 'string' ? line.resolution : existingLines[index]?.resolution,
            color: line.color,
            rightBound: typeof line.rightBound === 'boolean' ? line.rightBound : existingLines[index]?.rightBound,
            endPointsLinked: typeof line.endPointsLinked === 'boolean' ? line.endPointsLinked : existingLines[index]?.endPointsLinked,
            points: line.points.map(pt => ({ x: pt.x, y: pt.y })),
          }));
        }
        return true;
      }
      if (sObj instanceof LineObject) {
        const lo = sObj as LineObject;
        const p = patch.patch;
        if (p.lines !== undefined) {
          const existingLines = lo.getLines();
          const inner = lo as unknown as { _lines: Array<{
            varName: string;
            min?: number;
            max?: number;
            resolution?: string;
            color: number;
            rightBound?: boolean;
            endPointsLinked?: boolean;
            points: Array<{ x: number; y: number }>;
          }> };
          inner._lines = (p.lines as Array<{
            varName: string;
            min?: number;
            max?: number;
            resolution?: string;
            color: number;
            rightBound?: boolean;
            endPointsLinked?: boolean;
            points: Array<{ x: number; y: number }>;
          }>).map((line, index) => ({
            varName: line.varName,
            min: typeof line.min === 'number' ? line.min : existingLines[index]?.min,
            max: typeof line.max === 'number' ? line.max : existingLines[index]?.max,
            resolution: typeof line.resolution === 'string' ? line.resolution : existingLines[index]?.resolution,
            color: line.color,
            rightBound: typeof line.rightBound === 'boolean' ? line.rightBound : existingLines[index]?.rightBound,
            endPointsLinked: typeof line.endPointsLinked === 'boolean' ? line.endPointsLinked : existingLines[index]?.endPointsLinked,
            points: line.points.map(pt => ({ x: pt.x, y: pt.y })),
          }));
        }
        return true;
      }
      if (sObj instanceof NotationObject) {
        const no = sObj as NotationObject;
        const p = patch.patch;
        if (p.staffData !== undefined) no.setStaffData(p.staffData as string);
        return true;
      }
      if (sObj instanceof JMask) {
        const jm = sObj as JMask;
        const p = patch.patch;
        if (p.seedUsed !== undefined) jm.setSeedUsed(p.seedUsed as boolean);
        if (p.seed !== undefined) jm.setSeed(p.seed as number);
        return true;
      }
      if (sObj instanceof PianoRoll) {
        const pr = sObj as PianoRoll;
        const p = patch.patch;
        if (p.instrumentId !== undefined) pr.setInstrumentId(p.instrumentId as string);
        if (p.noteTemplate !== undefined) pr.setNoteTemplate(p.noteTemplate as string);
        if (p.pchGenerationMethod !== undefined) pr.setPchGenerationMethod(p.pchGenerationMethod as number);
        if (p.transposition !== undefined) pr.setTransposition(p.transposition as number);
        return true;
      }
      if (sObj instanceof Sound) {
        const snd = sObj as Sound;
        const p = patch.patch;
        if (p.comment !== undefined) snd.setComment(p.comment as string);

        if (p.bsbInterfacePatch !== undefined) {
          const bsb = parseSoundBSB(snd.getBSBInstrumentText());
          if (bsb) {
            applyBsbInterfacePatch(bsb, p.bsbInterfacePatch as BsbInterfacePatch);
            snd.setBSBInstrumentText(bsb.saveAsXML().toXml());
          }
        }

        if (p.bsbCodePatch !== undefined) {
          const codePatch = p.bsbCodePatch as Record<string, string>;
          const bsb = parseSoundBSB(snd.getBSBInstrumentText());
          if (bsb) {
            if (codePatch.instrumentText !== undefined) bsb.setInstrumentText(codePatch.instrumentText);
            if (codePatch.alwaysOnInstrumentText !== undefined) bsb.setAlwaysOnInstrumentText(codePatch.alwaysOnInstrumentText);
            if (codePatch.globalOrc !== undefined) bsb.setGlobalOrc(codePatch.globalOrc);
            if (codePatch.globalSco !== undefined) bsb.setGlobalSco(codePatch.globalSco);
            snd.setBSBInstrumentText(bsb.saveAsXML().toXml());
          }
        }

        if (p.bsbOpcodeListPatch !== undefined) {
          const bsb = parseSoundBSB(snd.getBSBInstrumentText());
          if (bsb) {
            applyEmbeddedOpcodeListPatch(bsb.getOpcodeList(), p.bsbOpcodeListPatch as EmbeddedOpcodeListPatch);
            snd.setBSBInstrumentText(bsb.saveAsXML().toXml());
          }
        }

        if (p.automationPatch !== undefined) {
          const autoPatch = p.automationPatch as {
            parameterId: string;
            automationEnabled?: boolean;
            points?: Array<{ x: number; y: number }>;
            curve?: string;
          };
          const bsb = parseSoundBSB(snd.getBSBInstrumentText());
          if (bsb) {
            const params = bsb.getParameters();
            const param = params.find(
              (pr: BlueDataParameter) => pr.getUniqueId() === autoPatch.parameterId || pr.getName() === autoPatch.parameterId,
            );
            if (param) {
              if (autoPatch.automationEnabled !== undefined) param.setAutomationEnabled(autoPatch.automationEnabled);
              if (autoPatch.points !== undefined) {
                param.setPoints(autoPatch.points.map((pt: { x: number; y: number }) => ({ time: pt.x, value: pt.y })));
              }
              if (autoPatch.curve !== undefined) {
                const curveKey = autoPatch.curve as keyof typeof BlueDataAutomationCurve;
                if (curveKey in BlueDataAutomationCurve) {
                  param.setCurve(BlueDataAutomationCurve[curveKey]);
                }
              }
            }
            snd.setBSBInstrumentText(bsb.saveAsXML().toXml());
          }
        }

        return true;
      }
      return false;
    }
    default:
      return false;
  }
}

export function applyProjectDocumentPatch(
  data: BlueData,
  patch: ProjectDocumentPatch,
): boolean {
  let changed = false;

  if (patch.globalOrc !== undefined) {
    data.getGlobalOrcSco().setGlobalOrc(patch.globalOrc);
    changed = true;
  }

  if (patch.globalSco !== undefined) {
    data.getGlobalOrcSco().setGlobalSco(patch.globalSco);
    changed = true;
  }

  if (patch.tablesText !== undefined) {
    data.getTableSet().setTables(patch.tablesText);
    changed = true;
  }

  if (patch.projectUdo) {
    changed = applyProjectUdoPatch(data, patch.projectUdo) || changed;
  }

  if (patch.projectProperties) {
    changed =
      applyProjectPropertiesPatch(
        data.getProjectProperties(),
        patch.projectProperties,
      ) || changed;
  }

  if (patch.orchestra) {
    const arrangement = data.getArrangement();
    const orchestraPatch = patch.orchestra;

    switch (orchestraPatch.type) {
      case 'addInstrument':
        arrangement.addInstrument(
          createInstrumentForType(orchestraPatch.instrumentType),
          undefined,
        );
        changed = true;
        break;
      case 'removeAssignment':
        changed = arrangement.removeInstrumentById(orchestraPatch.assignmentId) !== null || changed;
        break;
      case 'duplicateAssignment': {
        const current = arrangement.getInstrumentById(orchestraPatch.sourceAssignmentId);
        if (current) {
          arrangement.addInstrument(current.deepCopy(), undefined);
          changed = true;
        }
        break;
      }
      case 'pasteInstrument':
        arrangement.addInstrument(createInstrumentFromSnapshot(orchestraPatch.instrument), undefined);
        changed = true;
        break;
      case 'updateAssignment': {
        const oldId = orchestraPatch.assignmentId;
        const newId = orchestraPatch.nextAssignmentId?.trim();
        changed =
          arrangement.updateAssignment(oldId, {
            enabled: orchestraPatch.enabled,
            nextArrangementId: newId,
          }) || changed;
        if (newId && newId !== oldId) {
          const channel = data.getMixer().getChannels().find(
            (ch) => ch.getAssociation().trim() === oldId,
          );
          if (channel) {
            channel.setAssociation(newId);
            channel.setName(newId);
          }
        }
        break;
      }
      case 'replaceInstrument':
        changed =
          arrangement.replaceInstrument(
            orchestraPatch.assignmentId,
            createInstrumentForType(orchestraPatch.instrumentType),
          ) || changed;
        break;
      case 'convertGenericToBsb': {
        const current = arrangement.getInstrumentById(orchestraPatch.assignmentId);
        if (current instanceof GenericInstrument) {
          changed =
            arrangement.replaceInstrument(
              orchestraPatch.assignmentId,
              convertGenericToBsb(current),
            ) || changed;
        }
        break;
      }
      case 'updateInstrument': {
        const instrument = arrangement.getInstrumentById(orchestraPatch.assignmentId);
        if (instrument) {
          changed = applyInstrumentPatch(instrument, orchestraPatch.patch) || changed;
        }
        break;
      }
      case 'updateInstrumentComment': {
        const instrument = arrangement.getInstrumentById(orchestraPatch.assignmentId);
        if (instrument && instrument.getComment() !== orchestraPatch.comment) {
          instrument.setComment(orchestraPatch.comment);
          changed = true;
        }
        break;
      }
    }
  }

  if (patch.mixer) {
    changed = applyMixerPatchToData(data, patch.mixer) || changed;
  }

  if (patch.orchestra || patch.mixer) {
    changed = reconcileMixerWithArrangement(data) || changed;
  }

  if (patch.transport) {
    if (patch.transport.renderStartTime !== undefined && data.getRenderStartTime() !== patch.transport.renderStartTime) {
      data.setRenderStartTime(patch.transport.renderStartTime);
      changed = true;
    }

    if (patch.transport.renderEndTime !== undefined && data.getRenderEndTime() !== patch.transport.renderEndTime) {
      data.setRenderEndTime(patch.transport.renderEndTime);
      changed = true;
    }

    if (patch.transport.loopRendering !== undefined && data.isLoopRendering() !== patch.transport.loopRendering) {
      data.setLoopRendering(patch.transport.loopRendering);
      changed = true;
    }

    if (patch.transport.tempoMap?.enabled !== undefined) {
      data.getScore().getTimeContext().getTempoMap().setEnabled(patch.transport.tempoMap.enabled);
      changed = true;
    }
  }

  if (patch.blueLive) {
    changed = applyBlueLivePatch(data, patch.blueLive) || changed;
  }

  if (patch.midiInput) {
    changed = applyMidiInputPatch(data, patch.midiInput) || changed;
  }

  if (patch.score) {
    changed = applyScoreObjectPatch(data, patch.score) || changed;
  }

  return changed;
}

function applyProjectUdoPatch(data: BlueData, patch: ProjectUdoPatch): boolean {
  const opcodeList = data.getOpcodeList();

  switch (patch.type) {
    case 'add': {
      const udo = patch.definition
        ? snapshotToUdo(patch.definition)
        : new OpcodeDefinition();
      const index = patch.index ?? opcodeList.size();
      opcodeList.addOpcodeAt(index, udo);
      return true;
    }
    case 'remove': {
      return opcodeList.removeOpcodeAt(patch.index);
    }
    case 'update': {
      const existing = opcodeList.getOpcode(patch.index);
      if (!existing) return false;
      if (patch.patch.name !== undefined) existing.setName(patch.patch.name);
      if (patch.patch.style !== undefined) existing.setStyle(patch.patch.style as UDOStyle);
      if (patch.patch.outTypes !== undefined) existing.setOutTypes(patch.patch.outTypes);
      if (patch.patch.inTypes !== undefined) existing.setInTypes(patch.patch.inTypes);
      if (patch.patch.inputArguments !== undefined) existing.setInputArguments(patch.patch.inputArguments);
      if (patch.patch.code !== undefined) existing.setCode(patch.patch.code);
      if (patch.patch.comments !== undefined) existing.setComments(patch.patch.comments);
      return true;
    }
    case 'reorder': {
      return opcodeList.moveOpcode(patch.from, patch.to);
    }
    case 'convertStyle': {
      const udo = opcodeList.getOpcode(patch.index);
      if (!udo) return false;
      if (patch.style === 'MODERN') {
        convertToModern(udo);
      } else {
        convertToClassic(udo);
      }
      return true;
    }
  }
}

function snapshotToUdo(snapshot: UdoDefinitionSnapshot): OpcodeDefinition {
  const udo = new OpcodeDefinition();
  udo.setName(snapshot.name);
  udo.setStyle(snapshot.style as UDOStyle);
  udo.setOutTypes(snapshot.outTypes);
  udo.setInTypes(snapshot.inTypes);
  udo.setInputArguments(snapshot.inputArguments);
  udo.setCode(snapshot.code);
  udo.setComments(snapshot.comments);
  return udo;
}

function createEffectFromXml(effectXml: string): Effect {
  return Effect.loadFromXML(Element.parse(effectXml));
}

function generateUniqueSubChannelName(existingNames: ReadonlySet<string>): string {
  let index = existingNames.size + 1;
  while (true) {
    const name = `SubChannel${index}`;
    if (!existingNames.has(name)) {
      return name;
    }
    index++;
  }
}

function findMixerChannelById(mixer: Mixer, channelId: string): Channel | null {
  if (channelId === 'master') {
    return mixer.getMaster();
  }

  const sourceChannel = mixer.getChannels().find(
    (channel) => channel.getAssociation() === channelId || getMixerChannelSnapshotId(channel) === channelId,
  );
  if (sourceChannel) {
    return sourceChannel;
  }

  const subChannel = mixer.getSubChannels().find(
    (channel) => getMixerChannelSnapshotId(channel) === channelId,
  );
  if (subChannel) {
    return subChannel;
  }

  return null;
}

function reconcileSubChannelName(mixer: Mixer, oldName: string, newName: string): void {
  const allChannels = [mixer.getMaster(), ...mixer.getChannels(), ...mixer.getSubChannels()];

  for (const channel of allChannels) {
    if (channel.getOutChannel() === oldName) {
      channel.setOutChannel(newName);
    }

    for (const entry of [...channel.getPreEffects(), ...channel.getPostEffects()]) {
      if (entry instanceof Send && entry.getSendChannel() === oldName) {
        entry.setSendChannel(newName);
      }
    }
  }
}

function reconcileSubChannelRemoved(mixer: Mixer, removedName: string): void {
  const allChannels = [mixer.getMaster(), ...mixer.getChannels(), ...mixer.getSubChannels()];

  for (const channel of allChannels) {
    if (channel.getOutChannel() === removedName) {
      channel.setOutChannel(Channel.MASTER);
    }

    for (const entry of [...channel.getPreEffects(), ...channel.getPostEffects()]) {
      if (entry instanceof Send && entry.getSendChannel() === removedName) {
        entry.setSendChannel(Channel.MASTER);
      }
    }
  }
}

function findMixerChainForChannel(
  mixer: Mixer,
  channelId: string,
  chain: MixerChainKind,
): Array<Effect | Send> | null {
  const channel = findMixerChannelById(mixer, channelId);
  if (!channel) {
    return null;
  }

  if (channel === mixer.getMaster()) {
    return chain === 'pre' ? channel.getPreEffects() : channel.getPostEffects();
  }

  if (mixer.getSubChannels().includes(channel)) {
    return chain === 'pre' ? channel.getPreEffects() : channel.getPostEffects();
  }

  return chain === 'pre' ? channel.getPreEffects() : channel.getPostEffects();
}

export function applyEffectEditablePatchToEffect(
  effect: Effect,
  patch: EffectEditablePatch,
): boolean {
  let changed = false;

  if (patch.effectXml !== undefined) {
    const loaded = createEffectFromXml(patch.effectXml);
    effect.setName(loaded.getName());
    effect.setEnabled(loaded.isEnabled());
    effect.setNumIns(loaded.getNumIns());
    effect.setNumOuts(loaded.getNumOuts());
    effect.setStyle(loaded.getStyle());
    effect.setCode(loaded.getCode());
    effect.setComments(loaded.getComments());
    effect.getGraphicInterface().loadFromXML(loaded.getGraphicInterface().saveAsXML());
    effect.getOpcodeList().clear();
    effect.getOpcodeList().addAll(loaded.getOpcodeList());
    changed = true;
  }

  if (patch.name !== undefined && effect.getName() !== patch.name) {
    effect.setName(patch.name);
    changed = true;
  }
  if (patch.enabled !== undefined && effect.isEnabled() !== patch.enabled) {
    effect.setEnabled(patch.enabled);
    changed = true;
  }
  if (patch.numIns !== undefined && effect.getNumIns() !== patch.numIns) {
    effect.setNumIns(patch.numIns);
    changed = true;
  }
  if (patch.numOuts !== undefined && effect.getNumOuts() !== patch.numOuts) {
    effect.setNumOuts(patch.numOuts);
    changed = true;
  }
  if (patch.style !== undefined && effect.getStyle() !== patch.style) {
    effect.setStyle(patch.style as UDOStyle);
    changed = true;
  }
  if (patch.code !== undefined && effect.getCode() !== patch.code) {
    effect.setCode(patch.code);
    changed = true;
  }
  if (patch.comments !== undefined && effect.getComments() !== patch.comments) {
    effect.setComments(patch.comments);
    changed = true;
  }
  if (patch.bsbInterface) {
    const temp = new BlueSynthBuilder();
    temp.setGraphicInterface(effect.getGraphicInterface());
    temp.setOpcodeList(effect.getOpcodeList());
    changed = applyBsbInterfacePatch(temp, patch.bsbInterface) || changed;
    syncEffectParametersFromWidgets(effect);
  }
  if (patch.opcodeList) {
    changed = applyEmbeddedOpcodeListPatch(effect.getOpcodeList(), patch.opcodeList) || changed;
  }

  return changed;
}

function syncEffectParametersFromWidgets(effect: Effect): void {
  const params = effect.getParameters();
  const gi = effect.getGraphicInterface();
  const rootGroup = gi.getRootGroup();

  const findParam = (name: string) => params.find((p) => p.getName() === name);

  const visit = (widgets: BSBWidget[]) => {
    for (const widget of widgets) {
      if (widget instanceof BSBGroup) {
        visit(widget.getChildren());
        continue;
      }
      if (!widget.objectName) continue;

      if (widget instanceof BSBXYController) {
        const px = findParam(`${widget.objectName}X`);
        const py = findParam(`${widget.objectName}Y`);
        if (px) px.setFixedValue(widget.xValue);
        if (py) py.setFixedValue(widget.yValue);
      } else if (widget instanceof BSBDropdown) {
        const param = findParam(widget.objectName);
        if (param) param.setFixedValue(widget.selectedIndex);
      } else {
        const param = findParam(widget.objectName);
        if (param) param.setFixedValue(widget.value);
      }
    }
  };

  visit(rootGroup.getChildren());
}

function applyMixerChannelEditablePatch(
  channel: Channel,
  patch: Partial<MixerChannelEditableFields>,
  nameAlreadyApplied = false,
): boolean {
  let changed = false;

  if (!nameAlreadyApplied && patch.name !== undefined && channel.getName() !== patch.name) {
    channel.setName(patch.name);
    changed = true;
  }
  if (patch.outChannel !== undefined && channel.getOutChannel() !== patch.outChannel) {
    channel.setOutChannel(patch.outChannel);
    changed = true;
  }
  if (patch.muted !== undefined && channel.isMuted() !== patch.muted) {
    channel.setMuted(patch.muted);
    changed = true;
  }
  if (patch.solo !== undefined && channel.isSolo() !== patch.solo) {
    channel.setSolo(patch.solo);
    changed = true;
  }
  if (patch.level !== undefined && channel.getLevel() !== patch.level) {
    channel.setLevel(patch.level);
    changed = true;
  }
  if (patch.volume !== undefined && channel.getVolume() !== patch.volume) {
    channel.setVolume(patch.volume);
    changed = true;
  }
  if (patch.pan !== undefined && channel.getPan() !== patch.pan) {
    channel.setPan(patch.pan);
    changed = true;
  }

  return changed;
}

function applyMixerPatchToChain(
  chain: Array<Effect | Send>,
  patch: MixerPatch,
  preferredEntryId?: string,
): boolean {
  switch (patch.type) {
    case 'addEffectFromLibrary': {
      const effectXml = patch.effectXml;
      if (!effectXml) {
        return false;
      }
      const effect = createEffectFromXml(effectXml);
      getMixerEntrySnapshotId(effect, patch.entryId ?? preferredEntryId);
      const insertIndex = patch.insertIndex ?? chain.length;
      chain.splice(Math.min(Math.max(insertIndex, 0), chain.length), 0, effect);
      return true;
    }
    case 'addSend': {
      const send = new Send();
      if (patch.sendChannel !== undefined) {
        send.setSendChannel(patch.sendChannel);
      }
      if (patch.level !== undefined) {
        send.setLevel(patch.level);
      }
      if (preferredEntryId || patch.entryId) {
        getMixerEntrySnapshotId(send, patch.entryId ?? preferredEntryId);
      }
      const insertIndex = patch.insertIndex ?? chain.length;
      chain.splice(Math.min(Math.max(insertIndex, 0), chain.length), 0, send);
      return true;
    }
    case 'updateSend': {
      const index = chain.findIndex(
        (entry) => entry instanceof Send && getMixerEntrySnapshotId(entry) === patch.entryId,
      );
      if (index < 0) {
        return false;
      }
      const send = chain[index] as Send;
      let changed = false;
      if (patch.patch.sendChannel !== undefined && send.getSendChannel() !== patch.patch.sendChannel) {
        send.setSendChannel(patch.patch.sendChannel);
        changed = true;
      }
      if (patch.patch.level !== undefined && send.getLevel() !== patch.patch.level) {
        send.setLevel(patch.patch.level);
        changed = true;
      }
      if (patch.patch.enabled !== undefined && send.isEnabled() !== patch.patch.enabled) {
        send.setEnabled(patch.patch.enabled);
        changed = true;
      }
      return changed;
    }
    case 'updateEffect': {
      const index = chain.findIndex(
        (entry) => entry instanceof Effect && getMixerEntrySnapshotId(entry) === patch.entryId,
      );
      if (index < 0) {
        return false;
      }

      const current = chain[index] as Effect;
      if (patch.patch.effectXml !== undefined) {
        const nextEffect = createEffectFromXml(patch.patch.effectXml);
        getMixerEntrySnapshotId(nextEffect, patch.entryId);
        chain[index] = nextEffect;
        return true;
      }

      return applyEffectEditablePatchToEffect(current, patch.patch);
    }
    case 'removeChainEntry': {
      const index = chain.findIndex((entry) => getMixerEntrySnapshotId(entry) === patch.entryId);
      if (index < 0) {
        return false;
      }
      chain.splice(index, 1);
      return true;
    }
    case 'reorderChainEntry': {
      if (
        patch.from < 0 ||
        patch.to < 0 ||
        patch.from >= chain.length ||
        patch.to >= chain.length ||
        patch.from === patch.to
      ) {
        return false;
      }

      const [moved] = chain.splice(patch.from, 1);
      chain.splice(patch.to, 0, moved);
      return true;
    }
    case 'duplicateChainEntry': {
      const dupIndex = chain.findIndex((entry) => getMixerEntrySnapshotId(entry) === patch.entryId);
      if (dupIndex < 0) return false;
      const original = chain[dupIndex];
      if (original instanceof Effect) {
        const clone = createEffectFromXml(original.saveAsXML().toXml());
        getMixerEntrySnapshotId(clone, crypto.randomUUID());
        chain.splice(dupIndex + 1, 0, clone);
      } else if (original instanceof Send) {
        const clone = new Send();
        clone.setSendChannel(original.getSendChannel());
        clone.setLevel(original.getLevel());
        clone.setEnabled(original.isEnabled());
        getMixerEntrySnapshotId(clone, crypto.randomUUID());
        chain.splice(dupIndex + 1, 0, clone);
      }
      return true;
    }
    case 'copyChainEntry': {
      return true;
    }
    case 'pasteChainEntries': {
      const insertIndex = patch.index ?? chain.length;
      for (let i = 0; i < patch.payload.entries.length; i++) {
        const entry = patch.payload.entries[i];
        if (entry.kind === 'effect') {
          const effect = createEffectFromXml(entry.effectXml);
          getMixerEntrySnapshotId(effect, entry.entryId + '-paste-' + i);
          chain.splice(Math.min(insertIndex + i, chain.length), 0, effect);
        } else if (entry.kind === 'send') {
          const send = new Send();
          send.setSendChannel(entry.sendChannel);
          send.setLevel(entry.level);
          send.setEnabled(entry.enabled);
          getMixerEntrySnapshotId(send, entry.entryId + '-paste-' + i);
          chain.splice(Math.min(insertIndex + i, chain.length), 0, send);
        }
      }
      return true;
    }
    default:
      return false;
  }
}

function applyMixerPatchToData(data: BlueData, patch: MixerPatch): boolean {
  const mixer = data.getMixer();

  switch (patch.type) {
    case 'setMixerEnabled':
      if (mixer.isEnabled() !== patch.value) {
        mixer.setEnabled(patch.value);
        return true;
      }
      return false;
    case 'updateExtraRenderTime':
      if (mixer.getExtraRenderTime() !== patch.value) {
        mixer.setExtraRenderTime(patch.value);
        return true;
      }
      return false;
    case 'updateChannel': {
      const channel = findMixerChannelById(mixer, patch.channelId);
      if (!channel) {
        return false;
      }

      if (patch.patch.name !== undefined && channel.getName() !== patch.patch.name) {
        const oldName = channel.getName();
        const isSubChannel = mixer.getSubChannels().includes(channel);
        channel.setName(patch.patch.name);
        if (isSubChannel) {
          reconcileSubChannelName(mixer, oldName, patch.patch.name);
        }
      }

      return applyMixerChannelEditablePatch(channel, patch.patch, true);
    }
    case 'addSubChannel': {
      const nextChannel = new Channel();
      const existingNames = new Set(mixer.getSubChannels().map((ch) => ch.getName()));
      nextChannel.setName(patch.name ?? generateUniqueSubChannelName(existingNames));
      nextChannel.setAssociation('');
      getMixerChannelSnapshotId(nextChannel, patch.channelId);
      const insertIndex =
        patch.insertIndex === undefined
          ? mixer.getSubChannels().length
          : Math.min(Math.max(patch.insertIndex, 0), mixer.getSubChannels().length);
      mixer.getSubChannels().splice(insertIndex, 0, nextChannel);
      return true;
    }
    case 'removeSubChannel': {
      const index = mixer.getSubChannels().findIndex(
        (channel) => getMixerChannelSnapshotId(channel) === patch.channelId,
      );
      if (index < 0) {
        return false;
      }
      const removedName = mixer.getSubChannels()[index].getName();
      mixer.getSubChannels().splice(index, 1);
      reconcileSubChannelRemoved(mixer, removedName);
      return true;
    }
    case 'addEffectFromLibrary':
    case 'addSend':
    case 'updateSend':
    case 'updateEffect':
    case 'removeChainEntry':
    case 'reorderChainEntry':
    case 'duplicateChainEntry':
    case 'copyChainEntry':
    case 'pasteChainEntries': {
      const chain = findMixerChainForChannel(mixer, patch.channelId, patch.chain);
      if (!chain) {
        return false;
      }
      return applyMixerPatchToChain(
        chain,
        patch,
        'entryId' in patch ? patch.entryId : undefined,
      );
    }
    case 'moveChainEntryAcrossChains': {
      const fromChain = findMixerChainForChannel(mixer, patch.fromChannelId, patch.fromChain);
      if (!fromChain) return false;
      const fromIndex = fromChain.findIndex((entry) => getMixerEntrySnapshotId(entry) === patch.entryId);
      if (fromIndex < 0) return false;
      const [removed] = fromChain.splice(fromIndex, 1);
      const toChain = findMixerChainForChannel(mixer, patch.toChannelId, patch.toChain);
      if (!toChain) {
        fromChain.splice(fromIndex, 0, removed);
        return false;
      }
      const insertIndex = patch.index ?? toChain.length;
      toChain.splice(Math.min(Math.max(insertIndex, 0), toChain.length), 0, removed);
      return true;
    }
  }
}

export function reconcileMixerSnapshotWithArrangement(
  mixer: MixerSnapshot,
  orchestra: OrchestraSnapshot,
): MixerSnapshot {
  const nextChannels: MixerChannelSnapshot[] = [];
  const existingByAssociation = new Map(
    mixer.channels
      .filter((channel) => channel.association)
      .map((channel) => [channel.association!, channel] as const),
  );
  const fallbackChannels = mixer.channels.filter((channel) => !channel.association);
  let fallbackIndex = 0;

  for (const row of orchestra.arrangement.rows) {
    const existing = existingByAssociation.get(row.assignmentId) ?? fallbackChannels[fallbackIndex++];
    if (existing) {
      nextChannels.push({
        ...existing,
        association: row.assignmentId,
        channelKind: 'instrument' as MixerChannelKind,
      });
    } else {
      nextChannels.push({
        id: row.assignmentId,
        name: row.instrumentName,
        channelKind: 'instrument' as MixerChannelKind,
        association: row.assignmentId,
        outChannel: Mixer.MASTER_CHANNEL,
        muted: false,
        solo: false,
        level: 0,
        volume: 1,
        pan: 0.5,
        preChain: [],
        postChain: [],
      });
    }
  }

  const nextSubChannels = mixer.subChannels.map((channel) => ({
    ...channel,
    channelKind: 'subChannel' as MixerChannelKind,
  }));

  return {
    ...mixer,
    channels: nextChannels,
    subChannels: nextSubChannels,
    master: {
      ...mixer.master,
      channelKind: 'master' as MixerChannelKind,
    },
  };
}

export function reconcileMixerWithArrangement(data: BlueData): boolean {
  const mixer = data.getMixer();
  const orchestra = createOrchestraSnapshot(data);
  const reconciled = reconcileMixerSnapshotWithArrangement(createMixerSnapshot(mixer), orchestra);

  const sourceChannels = mixer.getChannels();
  const sourceByAssociation = new Map(
    sourceChannels
      .filter((channel) => channel.getAssociation().trim().length > 0)
      .map((channel) => [channel.getAssociation(), channel] as const),
  );
  const sourceFallbackChannels = sourceChannels.filter(
    (channel) => channel.getAssociation().trim().length === 0,
  );
  let sourceFallbackIndex = 0;
  let changed =
    mixer.isEnabled() !== reconciled.enabled ||
    mixer.getExtraRenderTime() !== reconciled.extraRenderTime ||
    sourceChannels.length !== reconciled.channels.length ||
    mixer.getSubChannels().length !== reconciled.subChannels.length ||
    mixer.getMaster().getName() !== reconciled.master.name ||
    mixer.getMaster().getOutChannel() !== reconciled.master.outChannel ||
    mixer.getMaster().isMuted() !== reconciled.master.muted ||
    mixer.getMaster().isSolo() !== reconciled.master.solo ||
    mixer.getMaster().getLevel() !== reconciled.master.level ||
    mixer.getMaster().getVolume() !== reconciled.master.volume ||
    mixer.getMaster().getPan() !== reconciled.master.pan;
  const nextSourceChannels = reconciled.channels.map((snapshot) => {
    const current =
      (snapshot.association
        ? sourceByAssociation.get(snapshot.association)
        : undefined) ?? sourceFallbackChannels[sourceFallbackIndex++];

    const next = current ?? new Channel();
    if (
      !current ||
      current.getAssociation().trim() !== (snapshot.association ?? '') ||
      current.getName() !== snapshot.name ||
      current.getOutChannel() !== snapshot.outChannel ||
      current.isMuted() !== snapshot.muted ||
      current.isSolo() !== snapshot.solo ||
      current.getLevel() !== snapshot.level ||
      current.getVolume() !== snapshot.volume ||
      current.getPan() !== snapshot.pan
    ) {
      changed = true;
    }
    if (snapshot.association) {
      next.setAssociation(snapshot.association);
    }
    next.setName(snapshot.name);
    next.setOutChannel(snapshot.outChannel);
    next.setMuted(snapshot.muted);
    next.setSolo(snapshot.solo);
    next.setLevel(snapshot.level);
    next.setVolume(snapshot.volume);
    next.setPan(snapshot.pan);
    return next;
  });

  const nextSubChannels = reconciled.subChannels.map((snapshot, index) => {
    const current = mixer.getSubChannels()[index] ?? new Channel();
    if (
      !mixer.getSubChannels()[index] ||
      current.getName() !== snapshot.name ||
      current.getOutChannel() !== snapshot.outChannel ||
      current.isMuted() !== snapshot.muted ||
      current.isSolo() !== snapshot.solo ||
      current.getLevel() !== snapshot.level ||
      current.getVolume() !== snapshot.volume ||
      current.getPan() !== snapshot.pan
    ) {
      changed = true;
    }
    current.setName(snapshot.name);
    current.setOutChannel(snapshot.outChannel);
    current.setMuted(snapshot.muted);
    current.setSolo(snapshot.solo);
    current.setLevel(snapshot.level);
    current.setVolume(snapshot.volume);
    current.setPan(snapshot.pan);
    return current;
  });

  if (changed) {
    mixer.setEnabled(reconciled.enabled);
    mixer.setExtraRenderTime(reconciled.extraRenderTime);
    mixer.getChannels().splice(0, mixer.getChannels().length, ...nextSourceChannels);
    mixer.getSubChannels().splice(0, mixer.getSubChannels().length, ...nextSubChannels);
    mixer.getMaster().setName(reconciled.master.name);
    mixer.getMaster().setOutChannel(reconciled.master.outChannel);
    mixer.getMaster().setMuted(reconciled.master.muted);
    mixer.getMaster().setSolo(reconciled.master.solo);
    mixer.getMaster().setLevel(reconciled.master.level);
    mixer.getMaster().setVolume(reconciled.master.volume);
    mixer.getMaster().setPan(reconciled.master.pan);
  }

  return changed;
}

export function isEmptyProjectDocumentPatch(patch: ProjectDocumentPatch): boolean {
  const hasProjectProperties =
    patch.projectProperties !== undefined &&
    Object.keys(patch.projectProperties).length > 0;
  const hasTransport =
    patch.transport !== undefined &&
    Object.keys(patch.transport).length > 0;
  const hasOrchestra =
    patch.orchestra !== undefined &&
    Object.keys(patch.orchestra).length > 0;
  const hasProjectUdo =
    patch.projectUdo !== undefined &&
    Object.keys(patch.projectUdo).length > 0;
  const hasBlueLive =
    patch.blueLive !== undefined &&
    Object.keys(patch.blueLive).length > 0;
  const hasMidiInput = patch.midiInput !== undefined;
  const hasMixer = patch.mixer !== undefined;
  const hasScore = patch.score !== undefined && isNonEmptyScorePatch(patch.score);

  return (
    patch.globalOrc === undefined &&
    patch.globalSco === undefined &&
    patch.tablesText === undefined &&
    !hasProjectProperties &&
    !hasTransport &&
    !hasOrchestra &&
    !hasProjectUdo &&
    !hasBlueLive &&
    !hasMidiInput &&
    !hasMixer &&
    !hasScore
  );
}

export function createNestedPolyObjectSnapshot(
  data: BlueData,
  location: ScoreObjectLocationRef,
): PolyObjectLayerGroupSnapshot | null {
  const score = data.getScore();
  const context = score.getTimeContext();
  const lg = score[location.rootGroupIndex];
  if (!lg || !(lg instanceof PolyObject)) return null;

  let container: PolyObject = lg;
  for (const segment of location.containerPath) {
    const containerLayer = container[segment.layerIndex];
    if (!containerLayer) return null;
    const nested = containerLayer[segment.objectIndex];
    if (!(nested instanceof PolyObject)) return null;
    container = nested;
  }

  const layer = container[location.layerIndex];
  if (!layer) return null;

  const sObj = layer[location.objectIndex];
  if (!(sObj instanceof PolyObject)) return null;

  const parentPath: ScoreObjectLocationRef = {
    rootGroupIndex: location.rootGroupIndex,
    containerPath: [...location.containerPath, { layerIndex: location.layerIndex, objectIndex: location.objectIndex }],
    layerIndex: 0,
    objectIndex: 0,
  };

  const groupId = assignLayerGroupId(sObj);
  const layers: ScoreLayerSnapshot[] = [];

  for (let i = 0; i < sObj.length; i++) {
    const subLayer = sObj[i];
    const items: ScoreRowObjectSnapshot[] = [];
    for (let j = 0; j < subLayer.length; j++) {
      const nestedObj = subLayer[j];
      const itemLocation: ScoreObjectLocationRef = {
        ...parentPath,
        layerIndex: i,
        objectIndex: j,
      };
      items.push({
        objectId: `sobj-${i}-${j}`,
        objectType: nestedObj.constructor.name,
        name: nestedObj.getName(),
        startBeats: nestedObj.getStartTime().toBeats(context),
        durationBeats: nestedObj.getSubjectiveDuration().toBeats(context),
        backgroundColor: nestedObj.getBackgroundColor(),
        isContainer: nestedObj instanceof PolyObject,
        editorTarget: buildEditorTargetSnapshot(nestedObj, `sobj-${i}-${j}`, itemLocation),
      });
    }
    layers.push({
      layerId: `${groupId}-layer-${i}`,
      name: subLayer.getName(),
      height: 44,
      items,
    });
  }

  return {
    groupId,
    groupType: 'polyObject',
    name: sObj.getName(),
    layerCount: sObj.length,
    isOpenableContainer: true,
    layers,
  };
}
