import {
  BlueData,
  BlueSynthBuilder,
  BlueX7,
  BSBGroup,
  BSBWidget,
  GenericInstrument,
  Instrument,
  JavaScriptInstrument,
  OpcodeDefinition,
  Preset,
  PresetGroup,
  ProjectProperties,
  PythonInstrument,
  TempoMap,
  UDOStyle,
} from '@blue/data';
import {
  getHSliderBankDisplaySize,
  getVSliderBankDisplaySize,
  BSB_LINE_SELECTOR_HEIGHT,
} from './bsb-widget-layout';

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

export interface ProjectEditorSnapshot {
  filePath: string | null;
  version: string;
  globalOrc: string;
  globalSco: string;
  orchestra: OrchestraSnapshot;
  projectProperties: ProjectPropertiesSnapshot;
  transport: ToolbarProjectTransportSnapshot;
  loaded: boolean;
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
  projectProperties?: Partial<ProjectPropertiesSnapshot>;
  transport?: Partial<Pick<ToolbarProjectTransportSnapshot, 'renderStartTime' | 'renderEndTime' | 'loopRendering'>>;
}

export interface ProjectDocumentCommitReceipt {
  revision: number;
}

export type BsbRealtimeControlKind = 'value' | 'selected' | 'selectedIndex' | 'xy' | 'sliderBank';

export interface BsbRealtimeControlUpdate {
  assignmentId: string;
  widgetId: string;
  kind: BsbRealtimeControlKind;
  payload: Record<string, number | boolean>;
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
}

export interface JavaScriptInstrumentSnapshot extends InstrumentSnapshotBase {
  type: 'javascript';
  text: string;
  globalOrc: string;
  globalSco: string;
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
  | { type: 'reorderUdo'; from: number; to: number }
  | { type: 'randomize' }
  | { type: 'makeGroup'; widgetIds: string[]; parentGroupId?: string }
  | { type: 'breakGroup'; widgetId: string }
  | { type: 'pasteWidgets'; widgetData: string; parentGroupId?: string };

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
      | 'globalOrc'
      | 'globalSco'
      | 'orchestra'
      | 'projectProperties'
      | 'transport'
      | 'loaded'
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
    globalOrc: '',
    globalSco: '',
    orchestra: createEmptyOrchestraSnapshot(false),
    projectProperties: createDefaultProjectPropertiesSnapshot(),
    transport: createEmptyToolbarProjectTransportSnapshot(),
    loaded: false,
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

export function createProjectEditorSnapshot(
  data: BlueData,
  filePath: string | null,
): ProjectEditorSnapshot {
  return {
    filePath,
    version: data.getVersion(),
    globalOrc: data.getGlobalOrcSco().getGlobalOrc(),
    globalSco: data.getGlobalOrcSco().getGlobalSco(),
    orchestra: createOrchestraSnapshot(data),
    projectProperties: createProjectPropertiesSnapshot(
      data.getProjectProperties(),
    ),
    transport: createToolbarProjectTransportSnapshot(data),
    loaded: true,
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

const KNOWN_WIDGET_TYPES = new Set([
  'BSBKnob', 'BSBCheckBox', 'BSBHSlider', 'BSBVSlider',
  'BSBHSliderBank', 'BSBVSliderBank', 'BSBValue', 'BSBDropdown',
  'BSBXYController', 'BSBSubChannelDropdown', 'BSBFileSelector',
  'BSBTextField', 'BSBLabel', 'BSBLineObject', 'BSBGroup',
]);

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
        varName: typeof lineRecord.varName === 'string' ? lineRecord.varName : '',
        min: typeof lineRecord.min === 'number' ? lineRecord.min : 0,
        max: typeof lineRecord.max === 'number' ? lineRecord.max : 1,
        color: typeof lineRecord.color === 'string' ? lineRecord.color : '#000000',
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

function buildPresetGroupSnapshot(bsb: import('@blue/data').BlueSynthBuilder): PresetGroupSnapshot | undefined {
  const pg = bsb.getPresetGroup();
  if (!pg) return undefined;

  const convert = (group: import('@blue/data').PresetGroup): PresetGroupSnapshot => ({
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

function buildUdoListSnapshot(bsb: import('@blue/data').BlueSynthBuilder): UdoDefinitionSnapshot[] {
  const udos = bsb.getUdoList();
  return udos.map((udo: import('@blue/data').OpcodeDefinition) => ({
    name: udo.getName(),
    style: udo.getStyle(),
    outTypes: udo.getOutTypes(),
    inTypes: udo.getInTypes(),
    inputArguments: udo.getInputArguments(),
    code: udo.getCode(),
    comments: udo.getComments(),
  }));
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
      case 'updateAssignment':
        changed =
          arrangement.updateAssignment(orchestraPatch.assignmentId, {
            enabled: orchestraPatch.enabled,
            nextArrangementId: orchestraPatch.nextAssignmentId,
          }) || changed;
        break;
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

  return (
    patch.globalOrc === undefined &&
    patch.globalSco === undefined &&
    !hasProjectProperties &&
    !hasTransport &&
    !hasOrchestra
  );
}
