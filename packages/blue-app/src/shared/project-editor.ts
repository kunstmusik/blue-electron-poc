import {
  BlueData,
  ProjectProperties,
  TempoMap,
} from '@blue/data';

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
  projectProperties?: Partial<ProjectPropertiesSnapshot>;
  transport?: Partial<Pick<ToolbarProjectTransportSnapshot, 'renderStartTime' | 'renderEndTime' | 'loopRendering'>>;
}

export type ProjectLoadedPayload = ProjectSummarySnapshot &
  Partial<Pick<ProjectEditorSnapshot, 'globalOrc' | 'globalSco' | 'projectProperties' | 'transport' | 'loaded'>>;

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
    projectProperties: createDefaultProjectPropertiesSnapshot(),
    transport: createEmptyToolbarProjectTransportSnapshot(),
    loaded: false,
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
    projectProperties: createProjectPropertiesSnapshot(
      data.getProjectProperties(),
    ),
    transport: createToolbarProjectTransportSnapshot(data),
    loaded: true,
  };
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

  return (
    patch.globalOrc === undefined &&
    patch.globalSco === undefined &&
    !hasProjectProperties &&
    !hasTransport
  );
}
