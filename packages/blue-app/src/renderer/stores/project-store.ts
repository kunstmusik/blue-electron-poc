import { create } from 'zustand';
import { toast } from 'sonner';
import {
  BlueSynthBuilder,
  BlueX7,
  GenericInstrument,
  JavaScriptInstrument,
} from '@blue/data';
import {
  createEmptyProjectEditorSnapshot,
  type BlueLiveProjectSnapshot,
  type BlueLivePatch,
  type BsbRealtimeControlUpdate,
  type ArrangementRowSnapshot,
  type InstrumentPatch,
  type InstrumentSnapshot,
  type ProjectDocumentPatch,
  type ProjectLoadedPayload,
  type ProjectPropertiesSnapshot,
  type OrchestraPatch,
  type OrchestraSnapshot,
  type ProjectUdoPatch,
  type SupportedNewInstrumentType,
  type ToolbarProjectTransportSnapshot,
  type UdoDefinitionSnapshot,
} from '../../shared/project-editor';
import {
  getHSliderBankDisplaySize,
  getVSliderBankDisplaySize,
  BSB_LINE_SELECTOR_HEIGHT,
} from '../../shared/bsb-widget-layout';
import {
  EMPTY_UDO_SNAPSHOT,
  cloneUdoSnapshot,
  convertUdoSnapshotStyle,
  formatUdoListAsOpcodeText,
} from '../components/workbench/panels/udo/udo-snapshot-utils';

interface ProjectState {
  title: string;
  author: string;
  sampleRate: string;
  version: string;
  filePath: string | null;
  isLoading: boolean;
  isDirty: boolean;
  loaded: boolean;
  globalOrc: string;
  globalSco: string;
  orchestra: OrchestraSnapshot;
  projectProperties: ProjectPropertiesSnapshot;
  transport: ToolbarProjectTransportSnapshot;
  tablesText: string;
  projectUdos: UdoDefinitionSnapshot[];
  generatedCsd: { text: string; title: string } | null;
  blueLive: BlueLiveProjectSnapshot | null;
}

interface ProjectActions {
  loadProject: () => Promise<void>;
  saveProject: () => Promise<void>;
  saveProjectAs: () => Promise<void>;
  setProjectInfo: (info: ProjectLoadedPayload | null) => void;
  setLoading: (loading: boolean) => void;
  markDirty: () => void;
  markClean: () => void;
  clearProject: () => void;
  applyProjectDocumentPatch: (patch: ProjectDocumentPatch) => Promise<void>;
  updateGlobalOrc: (globalOrc: string) => Promise<void>;
  updateGlobalSco: (globalSco: string) => Promise<void>;
  updateOrchestra: (orchestra: OrchestraPatch) => Promise<void>;
  updateProjectProperties: (
    patch: Partial<ProjectPropertiesSnapshot>,
  ) => Promise<void>;
  setLoopRendering: (loopRendering: boolean) => Promise<void>;
  updateTablesText: (tablesText: string) => Promise<void>;
  applyProjectUdoPatch: (patch: ProjectUdoPatch) => Promise<void>;
  applyBlueLivePatch: (patch: BlueLivePatch) => Promise<void>;
  setGeneratedCsd: (csd: { text: string; title: string } | null) => void;
  generateCsdToScreen: () => Promise<void>;
  generateCsdToDisk: () => Promise<void>;
  flushPendingPatches: () => Promise<void>;
}

let latestProjectPatchRequestId = 0;
let pendingPatches: ProjectDocumentPatch[] = [];
let pendingPatchTimer: ReturnType<typeof setTimeout> | null = null;
let storeGet: any;
let storeSet: any;
const PATCH_FLUSH_DELAY_MS = 100;
/*
      const shouldRebuildWidgetIndexes = Object.prototype.hasOwnProperty.call(
        patch.properties,
        'objectName',
      );
      const result = updateWidgetTreeById(instrument.widgetTree, patch.widgetId, (node) => {
        for (const [key, value] of Object.entries(patch.properties)) {
          switch (key) {
            case 'objectName': node.objectName = value as string; break;
            case 'x': node.x = value as number; break;
            case 'y': node.y = value as number; break;
            case 'width': node.width = value as number; break;
            case 'height': node.height = value as number; break;
            case 'value': node.value = value as number; break;
            case 'defaultValue':
              node.properties.defaultValue = value as number;
              if (node.type === 'BSBValue') {
                node.value = value as number;
              }
              break;
            case 'minimum': node.minimum = value as number; break;
            case 'maximum': node.maximum = value as number; break;
            case 'selectedIndex':
              node.properties.selectedIndex = value as number;
              node.value = value as number;
              break;
            case 'sliderWidth':
              node.properties.sliderWidth = value as number;
              if (node.type === 'BSBHSliderBank') {
                syncSliderBankLayout(node);
              } else {
                node.width = (value as number) + (node.properties.valueDisplayEnabled ? 50 : 0);
              }
              break;
            case 'sliderHeight':
              node.properties.sliderHeight = value as number;
              if (node.type === 'BSBVSliderBank') {
                syncSliderBankLayout(node);
              } else {
                node.height = (value as number) + (node.properties.valueDisplayEnabled ? 30 : 0);
              }
              break;
            case 'knobWidth':
              node.properties.knobWidth = value as number;
              node.width = value as number;
              break;
            case 'canvasWidth':
              node.properties.canvasWidth = value as number;
              node.width = value as number;
              break;
            case 'canvasHeight':
              node.properties.canvasHeight = value as number;
              node.height = node.type === 'BSBLineObject'
                ? (value as number) + BSB_LINE_SELECTOR_HEIGHT
                : (value as number);
              break;
            case 'textFieldWidth':
              node.properties.textFieldWidth = value as number;
              node.width = node.type === 'BSBFileSelector'
                ? (value as number) + 30
                : (value as number);
              break;
            case 'numberOfSliders': {
              const nextCount = Math.max(1, value as number);
              const previous = Array.isArray(node.properties.sliders)
                ? node.properties.sliders as Array<{ value?: number }>
                : [];
              node.properties.numberOfSliders = nextCount;
              node.properties.sliders = Array.from(
                { length: nextCount },
                (_unused, index) => previous[index] ?? { value: node.minimum ?? 0 },
              );
              syncSliderBankLayout(node);
              break;
            }
            case 'valueDisplayEnabled':
              node.properties.valueDisplayEnabled = value;
              if (node.type === 'BSBHSlider') {
                const sliderWidth = typeof node.properties.sliderWidth === 'number' ? node.properties.sliderWidth : 150;
                node.width = sliderWidth + (value ? 50 : 0);
              } else if (node.type === 'BSBVSlider') {
                const sliderHeight = typeof node.properties.sliderHeight === 'number' ? node.properties.sliderHeight : 150;
                node.height = sliderHeight + (value ? 30 : 0);
              } else if (node.type === 'BSBHSliderBank' || node.type === 'BSBVSliderBank') {
                syncSliderBankLayout(node);
              }
              break;
            case 'gap':
              node.properties.gap = value as number;
              if (node.type === 'BSBHSliderBank' || node.type === 'BSBVSliderBank') {
                syncSliderBankLayout(node);
              }
              break;
            default: node.properties[key] = value; break;
          }
        }
        return true;
      });
      if (result.changed) {
        instrument.widgetTree = result.node;
        if (shouldRebuildWidgetIndexes) {
          rebuildWidgetIndexes();
        }
  const patches = pendingPatches.slice();
  pendingPatches = [];
  pendingPatchTimer = null;
  if (patches.length === 0) return;

      const result = updateWidgetTreeById(instrument.widgetTree, patch.widgetId, (node) => {
        const sliderCount = typeof node.properties.numberOfSliders === 'number'
          ? Math.max(1, node.properties.numberOfSliders)
          : Array.isArray(node.properties.sliders)
            ? Math.max(1, node.properties.sliders.length)
            : 1;
        const sliders = Array.isArray(node.properties.sliders)
          ? [...(node.properties.sliders as Array<{ value?: number }>)]
          : Array.from({ length: sliderCount }, () => ({ value: node.minimum ?? 0 }));
        if (patch.sliderIndex < 0 || patch.sliderIndex >= sliders.length) {
          return false;
        }
        sliders[patch.sliderIndex] = {
          ...sliders[patch.sliderIndex],
          value: patch.value,
        };
        node.properties.sliders = sliders;
        return true;
      });
      if (result.changed) {
        instrument.widgetTree = result.node;
      }
      break;
    }
    case 'updateGridSettings':
      instrument.gridSettings = { ...instrument.gridSettings, ...patch.patch };
      break;
    case 'applyPreset':
      if (instrument.presetGroup) {
        instrument.presetGroup = clonePresetGroupSnapshot(instrument.presetGroup);
        instrument.presetGroup.currentPresetUniqueId = patch.presetUniqueId;
        instrument.presetGroup.currentPresetModified = false;
        const preset = findPresetById(instrument.presetGroup, patch.presetUniqueId);
        if (preset?.values && instrument.widgetTree) {
          const result = applyPresetToTree(instrument.widgetTree, preset.values);
          if (result.changed) {
            instrument.widgetTree = result.node;
          }
        }
      }
      break;
    case 'updatePreset':
      if (instrument.presetGroup) {
        instrument.presetGroup = clonePresetGroupSnapshot(instrument.presetGroup);
        instrument.presetGroup.currentPresetModified = false;
      }
      break;
    case 'addPreset':
      // Optimistic update - actual preset creation happens on main process
      if (instrument.presetGroup) {
        instrument.presetGroup = clonePresetGroupSnapshot(instrument.presetGroup);
        instrument.presetGroup.currentPresetModified = false;
      }
      break;
    case 'addPresetGroup':
      // Optimistic update - actual group creation happens on main process
      if (instrument.presetGroup) {
        instrument.presetGroup = clonePresetGroupSnapshot(instrument.presetGroup);
      }
      break;
    case 'synchronizePresets':
      // Optimistic update - actual sync happens on main process
      if (instrument.presetGroup) {
        instrument.presetGroup = clonePresetGroupSnapshot(instrument.presetGroup);
      }
      break;
    case 'updateEmbeddedOpcodeList':
      instrument.opcodeListText = patch.opcodeList;
      break;
    case 'addWidget': {
      if (!instrument.widgetTree) break;
      const newId = `w${Date.now()}`;
      const newNode: import('../../shared/project-editor').BsbWidgetNodeSnapshot = {
        id: newId,
        type: patch.widgetType,
        objectName: '',
        x: patch.x,
        y: patch.y,
        width: 60,
        height: 24,
        value: 0,
        minimum: 0,
        maximum: 1,
        properties: {},
        children: patch.widgetType === 'BSBGroup' ? [] : undefined,
      };
      const targetId = patch.parentGroupId;
      if (targetId) {
        const result = updateWidgetTreeById(instrument.widgetTree, targetId, (node) => {
          if (node.type !== 'BSBGroup') {
            return false;
          }
          node.children = [...(node.children ?? []), newNode];
          return true;
        });
        if (result.changed) {
          instrument.widgetTree = result.node;
          rebuildWidgetIndexes();
        }
      } else {
        const nextRoot = cloneWidgetNode(instrument.widgetTree);
        nextRoot.children = [...(nextRoot.children ?? []), newNode];
        instrument.widgetTree = nextRoot;
        rebuildWidgetIndexes();
      }
      break;
    }
    case 'removeWidget': {
      if (!instrument.widgetTree) break;
      const result = removeWidgetFromTree(instrument.widgetTree, patch.widgetId);
      if (result.removed) {
        instrument.widgetTree = result.node;
        rebuildWidgetIndexes();
      }
      break;
    }
    case 'randomize':
      break;
  }
}
      };
    }
    case 'javascript': {
      const instrument = new JavaScriptInstrument();
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
    case 'blueX7': {
      const instrument = new BlueX7();
      return {
        assignmentId,
        type: 'blueX7',
        name: instrument.getName(),
        enabled,
        comment: instrument.getComment(),
      };
    }
    case 'blueSynthBuilder': {
      const instrument = new BlueSynthBuilder();
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
        objectNames: [],
        widgets: [],
      };
    }
  }

  throw new Error(`Unsupported instrument type: ${instrumentType}`);
}
function updateInstrumentSnapshot(
*/

let pendingFlushPromise: Promise<void> | null = null;

const doFlushAsync = async (): Promise<void> => {
  const patches = pendingPatches.slice();
  pendingPatches = [];
  if (patches.length === 0) {
    return;
  }

  try {
    const receipt = await window.blueAPI.commitProjectDocumentPatches(patches);
    if (receipt?.revision !== undefined) {
      latestProjectPatchRequestId = receipt.revision;
    }
  } catch (err: unknown) {
    toast.error(`Failed to save project changes: ${err instanceof Error ? err.message : String(err)}`);
    try {
      const snapshot = await window.blueAPI.getProjectDocument();
      if (snapshot) {
        applyProjectInfoToState(snapshot, true);
      }
    } catch (recoveryErr: unknown) {
      console.error('[project-store] Failed to recover canonical project state after commit error:', recoveryErr);
    }
  }
};

const startFlush = (): Promise<void> => {
  if (pendingFlushPromise) {
    return pendingFlushPromise;
  }

  pendingFlushPromise = doFlushAsync().finally(() => {
    pendingFlushPromise = null;
  });

  return pendingFlushPromise;
};

const scheduleFlush = (): void => {
  if (pendingPatchTimer) {
    clearTimeout(pendingPatchTimer);
  }

  pendingPatchTimer = setTimeout(() => {
    pendingPatchTimer = null;
    void startFlush();
  }, PATCH_FLUSH_DELAY_MS);
};

export const __testFlushPendingPatches = (): void => {
  if (pendingPatchTimer) {
    clearTimeout(pendingPatchTimer);
    pendingPatchTimer = null;
  }

  void startFlush();
};

export const __testAwaitPendingPatches = async (): Promise<void> => {
  while (pendingFlushPromise) {
    await pendingFlushPromise;
  }
};

export const __testClearPendingPatches = (): void => {
  if (pendingPatchTimer) {
    clearTimeout(pendingPatchTimer);
    pendingPatchTimer = null;
  }

  pendingPatches = [];
  pendingFlushPromise = null;
};

function buildRealtimeControlUpdate(
  patch: ProjectDocumentPatch,
): BsbRealtimeControlUpdate | undefined {
  if (!patch.orchestra || patch.orchestra.type !== 'updateInstrument') {
    return undefined;
  }

  const bsbPatch = patch.orchestra.patch.bsbInterface;
  if (!bsbPatch) {
    return undefined;
  }

  const baseUpdate = {
    assignmentId: patch.orchestra.assignmentId,
    widgetId: bsbPatch.type === 'updateWidgetProperties' || bsbPatch.type === 'updateSliderBankValue'
      ? bsbPatch.widgetId
      : undefined,
  };

  switch (bsbPatch.type) {
    case 'updateWidgetProperties': {
      const properties = bsbPatch.properties;
      if (typeof properties.value === 'number') {
        return {
          ...baseUpdate,
          widgetId: bsbPatch.widgetId,
          kind: 'value',
          payload: { value: properties.value },
        };
      }

      if (typeof properties.selectedIndex === 'number') {
        return {
          ...baseUpdate,
          widgetId: bsbPatch.widgetId,
          kind: 'selectedIndex',
          payload: { selectedIndex: properties.selectedIndex },
        };
      }

      if (typeof properties.selected === 'boolean') {
        return {
          ...baseUpdate,
          widgetId: bsbPatch.widgetId,
          kind: 'selected',
          payload: { selected: properties.selected },
        };
      }

      if (typeof properties.xValue === 'number' && typeof properties.yValue === 'number') {
        return {
          ...baseUpdate,
          widgetId: bsbPatch.widgetId,
          kind: 'xy',
          payload: { xValue: properties.xValue, yValue: properties.yValue },
        };
      }

      return undefined;
    }
    case 'updateSliderBankValue':
      return {
        ...baseUpdate,
        widgetId: bsbPatch.widgetId,
        kind: 'sliderBank',
        payload: {
          value: bsbPatch.value,
          sliderIndex: bsbPatch.sliderIndex,
        },
      };
    default:
      return undefined;
  }
}

function syncSummaryFromProperties(
  properties: ProjectPropertiesSnapshot,
): Pick<ProjectState, 'title' | 'author' | 'sampleRate'> {
  return {
    title: properties.title,
    author: properties.author,
    sampleRate: properties.sampleRate,
  };
}

function applyProjectInfoToState(
  info: ProjectLoadedPayload | null,
  preserveDirty: boolean,
): void {
  if (!info) {
    if (!preserveDirty) {
      storeSet(buildInitialState());
    }
    return;
  }

  storeSet((state: ProjectState) => {
    const nextProjectProperties = info.projectProperties
      ? mergeProjectProperties(state.projectProperties, info.projectProperties)
      : state.projectProperties;
    const nextTransport = info.transport
      ? {
          ...state.transport,
          ...info.transport,
          tempoMap: info.transport.tempoMap ?? state.transport.tempoMap,
        }
      : state.transport;
    const summary = info.projectProperties
      ? syncSummaryFromProperties(nextProjectProperties)
      : {
          title: state.title,
          author: state.author,
          sampleRate: state.sampleRate,
        };

    return {
      ...state,
      title: info.title ?? summary.title,
      author: info.author ?? summary.author,
      sampleRate: info.sampleRate ?? summary.sampleRate,
      version: info.version ?? state.version,
      filePath: info.filePath ?? state.filePath,
      loaded:
        info.loaded ??
        (info.filePath !== undefined
          ? info.filePath !== null
          : state.loaded || Boolean(info.globalOrc || info.globalSco || info.projectProperties)),
      isLoading: false,
      isDirty: preserveDirty ? state.isDirty : false,
      globalOrc: info.globalOrc ?? state.globalOrc,
      globalSco: info.globalSco ?? state.globalSco,
      orchestra: info.orchestra ?? state.orchestra,
      projectProperties: nextProjectProperties,
      transport: nextTransport,
      tablesText: info.tablesText ?? state.tablesText,
      projectUdos: info.projectUdos ?? state.projectUdos,
      blueLive: info.blueLive ?? state.blueLive,
    };
  });
}

function mergeProjectProperties(
  current: ProjectPropertiesSnapshot,
  patch: Partial<ProjectPropertiesSnapshot>,
): ProjectPropertiesSnapshot {
  return {
    ...current,
    ...patch,
  };
}

function buildInitialState(): ProjectState {
  const snapshot = createEmptyProjectEditorSnapshot();
  return {
    title: snapshot.projectProperties.title,
    author: snapshot.projectProperties.author,
    sampleRate: snapshot.projectProperties.sampleRate,
    version: snapshot.version,
    filePath: snapshot.filePath,
    isLoading: false,
    isDirty: false,
    loaded: snapshot.loaded,
    globalOrc: snapshot.globalOrc,
    globalSco: snapshot.globalSco,
    orchestra: snapshot.orchestra,
    projectProperties: snapshot.projectProperties,
    transport: snapshot.transport,
    tablesText: snapshot.tablesText,
    projectUdos: snapshot.projectUdos,
    generatedCsd: null,
    blueLive: snapshot.blueLive ?? null,
  };
}

function cloneInstrumentSnapshot(instrument: InstrumentSnapshot): InstrumentSnapshot {
  return structuredClone(instrument);
}

function applyProjectUdoPatchToSnapshot(
  udos: UdoDefinitionSnapshot[],
  patch: ProjectUdoPatch,
): UdoDefinitionSnapshot[] {
  const list = udos.map((udo) => cloneUdoSnapshot(udo));

  switch (patch.type) {
    case 'add': {
      const def = patch.definition ?? EMPTY_UDO_SNAPSHOT;
      const index = patch.index ?? list.length;
      list.splice(index, 0, cloneUdoSnapshot(def));
      break;
    }
    case 'remove': {
      if (patch.index >= 0 && patch.index < list.length) {
        list.splice(patch.index, 1);
      }
      break;
    }
    case 'update': {
      if (patch.index >= 0 && patch.index < list.length) {
        list[patch.index] = { ...list[patch.index], ...patch.patch };
      }
      break;
    }
    case 'reorder': {
      if (
        patch.from >= 0 && patch.from < list.length &&
        patch.to >= 0 && patch.to < list.length &&
        patch.from !== patch.to
      ) {
        const [moved] = list.splice(patch.from, 1);
        list.splice(patch.to, 0, moved);
      }
      break;
    }
    case 'convertStyle': {
      if (patch.index >= 0 && patch.index < list.length) {
        list[patch.index] = convertUdoSnapshotStyle(list[patch.index]!, patch.style);
      }
      break;
    }
  }

  return list;
}

function applyBlueLivePatchToSnapshot(
  snap: BlueLiveProjectSnapshot,
  patch: BlueLivePatch,
): BlueLiveProjectSnapshot {
  const next = {
    ...snap,
    bins: {
      ...snap.bins,
      cells: snap.bins.cells.map((col) => [...col]),
    },
    sets: snap.sets.map((set) => ({
      ...set,
      liveObjectIds: [...set.liveObjectIds],
    })),
  };

  switch (patch.type) {
    case 'updateOptions':
      if (patch.patch.commandLine !== undefined) next.commandLine = patch.patch.commandLine;
      if (patch.patch.commandLineEnabled !== undefined) next.commandLineEnabled = patch.patch.commandLineEnabled;
      if (patch.patch.commandLineOverride !== undefined) next.commandLineOverride = patch.patch.commandLineOverride;
      break;
    case 'updateTempoRepeat':
      if (patch.patch.tempo !== undefined) next.tempo = patch.patch.tempo;
      if (patch.patch.repeat !== undefined) next.repeat = patch.patch.repeat;
      if (patch.patch.repeatEnabled !== undefined) next.repeatEnabled = patch.patch.repeatEnabled;
      break;
    case 'updateLiveCodeText':
      next.liveCodeText = patch.text;
      break;
    case 'setCellEnabled':
      if (
        patch.column >= 0 &&
        patch.column < next.bins.cells.length &&
        patch.row >= 0 &&
        patch.row < next.bins.cells[patch.column]!.length
      ) {
        const cell = next.bins.cells[patch.column]![patch.row];
        if (cell) {
          next.bins.cells[patch.column]![patch.row] = { ...cell, enabled: patch.enabled };
        }
      }
      break;
    case 'insertRow':
      {
        const insertIndex = Math.min(Math.max(patch.index, 0), next.bins.rows);
        next.bins = {
          ...next.bins,
          rows: next.bins.rows + 1,
          cells: next.bins.cells.map((col) => {
            const nextCol = [...col];
            nextCol.splice(insertIndex, 0, null);
            return nextCol;
          }),
        };
      }
      break;
    case 'removeRow':
      if (next.bins.rows <= 1 || patch.index < 0 || patch.index >= next.bins.rows) {
        break;
      }
      next.bins = {
        ...next.bins,
        rows: next.bins.rows - 1,
        cells: next.bins.cells.map((col) => {
          const nextCol = [...col];
          nextCol.splice(patch.index, 1);
          return nextCol;
        }),
      };
      break;
    case 'insertColumn':
      {
        const insertIndex = Math.min(Math.max(patch.index, 0), next.bins.cells.length);
        const cells = [...next.bins.cells];
        cells.splice(insertIndex, 0, Array.from({ length: next.bins.rows }, () => null));
        next.bins = { ...next.bins, columns: next.bins.columns + 1, cells };
      }
      break;
    case 'removeColumn':
      if (next.bins.columns <= 1 || patch.index < 0 || patch.index >= next.bins.cells.length) {
        break;
      }
      {
        const cells = [...next.bins.cells];
        cells.splice(patch.index, 1);
        next.bins = { ...next.bins, columns: next.bins.columns - 1, cells };
      }
      break;
    case 'captureEnabledSet':
      next.sets = [
        ...next.sets,
        {
          name: `Set ${next.sets.length + 1}`,
          liveObjectIds: next.bins.cells
            .flatMap((col) => col)
            .filter((cell): cell is NonNullable<typeof cell> => cell !== null && cell.enabled)
            .map((cell) => cell.uniqueId),
        },
      ];
      break;
    case 'renameSet':
      if (patch.index >= 0 && patch.index < next.sets.length) {
        next.sets = next.sets.map((s, i) => i === patch.index ? { ...s, name: patch.name } : s);
      }
      break;
    case 'removeSet':
      if (patch.index >= 0 && patch.index < next.sets.length) {
        next.sets = next.sets.filter((_, i) => i !== patch.index);
      }
      break;
    case 'moveSet':
      if (patch.from >= 0 && patch.from < next.sets.length && patch.to >= 0 && patch.to < next.sets.length) {
        const sets = [...next.sets];
        const [moved] = sets.splice(patch.from, 1);
        sets.splice(patch.to, 0, moved);
        next.sets = sets;
      }
      break;
    case 'applySet':
      if (patch.index >= 0 && patch.index < next.sets.length) {
        const enabledIds = new Set(next.sets[patch.index]!.liveObjectIds);
        next.bins = {
          ...next.bins,
          cells: next.bins.cells.map((col) =>
            col.map((cell) => (cell ? { ...cell, enabled: enabledIds.has(cell.uniqueId) } : cell)),
          ),
        };
      }
      break;
  }

  return next;
}

function cloneInstrumentSnapshotForMutation<T extends InstrumentSnapshot>(instrument: T): T {
  return { ...instrument };
}

function cloneArrangementRowSnapshot(row: ArrangementRowSnapshot): ArrangementRowSnapshot {
  return { ...row };
}

function clonePresetGroupSnapshot(
  group: import('../../shared/project-editor').PresetGroupSnapshot,
): import('../../shared/project-editor').PresetGroupSnapshot {
  return {
    ...group,
    subGroups: group.subGroups.map((subGroup) => clonePresetGroupSnapshot(subGroup)),
    presets: group.presets.map((preset) => ({
      ...preset,
      values: preset.values ? { ...preset.values } : undefined,
    })),
  };
}

function cloneOrchestraSnapshot(orchestra: OrchestraSnapshot): OrchestraSnapshot {
  return {
    ...orchestra,
    arrangement: {
      ...orchestra.arrangement,
    },
    instruments: orchestra.instruments,
    temporaryLibrary: orchestra.temporaryLibrary,
  };
}

function cloneArrangementRowsForMutation(orchestra: OrchestraSnapshot): ArrangementRowSnapshot[] {
  const nextRows = orchestra.arrangement.rows.slice();
  orchestra.arrangement.rows = nextRows;
  return nextRows;
}

function cloneInstrumentsForMutation(orchestra: OrchestraSnapshot): InstrumentSnapshot[] {
  const nextInstruments = orchestra.instruments.slice();
  orchestra.instruments = nextInstruments;
  return nextInstruments;
}

function getNextArrangementId(rows: ArrangementRowSnapshot[]): string {
  let max = 0;
  for (const row of rows) {
    const value = Number.parseInt(row.assignmentId, 10);
    if (Number.isFinite(value)) {
      max = Math.max(max, value);
    }
  }
  return String(max + 1);
}

function createDefaultInstrumentSnapshot(
  instrumentType: SupportedNewInstrumentType,
  assignmentId: string,
  enabled = true,
): InstrumentSnapshot {
  switch (instrumentType) {
    case 'generic': {
      const instrument = new GenericInstrument();
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
    case 'javascript': {
      const instrument = new JavaScriptInstrument();
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
    case 'blueX7': {
      const instrument = new BlueX7();
      return {
        assignmentId,
        type: 'blueX7',
        name: instrument.getName(),
        enabled,
        comment: instrument.getComment(),
      };
    }
    case 'blueSynthBuilder': {
      const instrument = new BlueSynthBuilder();
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
        objectNames: [],
        widgets: [],
      };
    }
  }

  throw new Error(`Unsupported instrument type: ${instrumentType}`);
}

function updateInstrumentSnapshot(
  orchestra: OrchestraSnapshot,
  assignmentId: string,
  patch: InstrumentPatch,
): void {
  const instrumentIndex = orchestra.instruments.findIndex((candidate) => candidate.assignmentId === assignmentId);
  const rowIndex = orchestra.arrangement.rows.findIndex((candidate) => candidate.assignmentId === assignmentId);

  if (instrumentIndex < 0) {
    return;
  }

  const nextInstruments = cloneInstrumentsForMutation(orchestra);
  const instrument = cloneInstrumentSnapshotForMutation(nextInstruments[instrumentIndex]!);
  nextInstruments[instrumentIndex] = instrument;

  const rowNeedsMutation = patch.name !== undefined || patch.enabled !== undefined;
  let row = rowIndex >= 0 ? orchestra.arrangement.rows[rowIndex]! : undefined;
  if (rowNeedsMutation && rowIndex >= 0 && row) {
    const nextRows = cloneArrangementRowsForMutation(orchestra);
    row = cloneArrangementRowSnapshot(nextRows[rowIndex]!);
    nextRows[rowIndex] = row;
  }

  if (patch.name !== undefined) {
    instrument.name = patch.name;
    if (row) {
      row.instrumentName = patch.name;
    }
  }

  if (patch.enabled !== undefined) {
    instrument.enabled = patch.enabled;
    if (row) {
      row.enabled = patch.enabled;
    }
  }

  if (patch.comment !== undefined) {
    instrument.comment = patch.comment;
  }

  if (instrument.type === 'generic' || instrument.type === 'javascript' || instrument.type === 'python') {
    if (patch.text !== undefined) {
      instrument.text = patch.text;
    }
    if (patch.globalOrc !== undefined) {
      instrument.globalOrc = patch.globalOrc;
    }
    if (patch.globalSco !== undefined) {
      instrument.globalSco = patch.globalSco;
    }
  } else if (instrument.type === 'blueSynthBuilder') {
    if (patch.instrumentText !== undefined) {
      instrument.instrumentText = patch.instrumentText;
    }
    if (patch.alwaysOnInstrumentText !== undefined) {
      instrument.alwaysOnInstrumentText = patch.alwaysOnInstrumentText;
    }
    if (patch.globalOrc !== undefined) {
      instrument.globalOrc = patch.globalOrc;
    }
    if (patch.globalSco !== undefined) {
      instrument.globalSco = patch.globalSco;
    }
    if (patch.bsbWidgetValues) {
      instrument.widgets = instrument.widgets.map((widget) => {
        const value = patch.bsbWidgetValues?.[widget.objectName];
        return value === undefined ? widget : { ...widget, value };
      });
    }
    if (patch.bsbOpcodeListText !== undefined) {
      instrument.opcodeListText = patch.bsbOpcodeListText;
    }
    if (patch.bsbInterface) {
      applyBsbInterfacePatchToSnapshot(instrument, patch.bsbInterface);
    }
  }
}

function applyBsbInterfacePatchToSnapshot(
  instrument: import('../../shared/project-editor').BlueSynthBuilderInstrumentSnapshot,
  patch: import('../../shared/project-editor').BsbInterfacePatch,
): void {
  const getSnapshotWidgetValue = (node: import('../../shared/project-editor').BsbWidgetNodeSnapshot): number => {
    if (node.type === 'BSBValue' && typeof node.properties.defaultValue === 'number') {
      return node.properties.defaultValue;
    }
    if (node.type === 'BSBCheckBox') {
      return node.properties.selected === true ? 1 : 0;
    }
    if (node.type === 'BSBDropdown' && typeof node.properties.selectedIndex === 'number') {
      return node.properties.selectedIndex;
    }
    return typeof node.value === 'number' ? node.value : 0;
  };

  const syncWidgetListFromTree = (): void => {
    if (!instrument.widgetTree?.children) {
      instrument.widgets = [];
      return;
    }

    const nextWidgets: typeof instrument.widgets = [];
    const visit = (node: import('../../shared/project-editor').BsbWidgetNodeSnapshot): void => {
      if (node.objectName) {
        nextWidgets.push({
          objectName: node.objectName,
          widgetType: node.type,
          value: getSnapshotWidgetValue(node),
          minimum: node.minimum,
          maximum: node.maximum,
        });
      }
      if (node.children) {
        node.children.forEach(visit);
      }
    };

    instrument.widgetTree.children.forEach(visit);
    instrument.widgets = nextWidgets.sort((left, right) => left.objectName.localeCompare(right.objectName));
  };

  const syncSliderBankLayout = (node: import('../../shared/project-editor').BsbWidgetNodeSnapshot): void => {
    const sliderCount = Array.isArray(node.properties.sliders)
      ? Math.max(1, node.properties.sliders.length)
      : typeof node.properties.numberOfSliders === 'number'
        ? Math.max(1, node.properties.numberOfSliders)
        : 1;
    const gap = typeof node.properties.gap === 'number' ? node.properties.gap : 5;
    const showValue = node.properties.valueDisplayEnabled === true;

    if (node.type === 'BSBHSliderBank') {
      const sliderWidth = typeof node.properties.sliderWidth === 'number' ? node.properties.sliderWidth : 100;
      const size = getHSliderBankDisplaySize(sliderCount, sliderWidth, gap, showValue);
      node.width = size.width;
      node.height = size.height;
    } else if (node.type === 'BSBVSliderBank') {
      const sliderHeight = typeof node.properties.sliderHeight === 'number' ? node.properties.sliderHeight : 100;
      const size = getVSliderBankDisplaySize(sliderCount, sliderHeight, gap, showValue);
      node.width = size.width;
      node.height = size.height;
    }
  };

  const parsePresetNumber = (raw: string): number | null => {
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseLegacyPresetNumber = (raw: string): number | null => {
    return parsePresetNumber(raw.startsWith('ver2:') ? raw.substring(5) : raw);
  };

  const applyLineObjectPreset = (
    node: import('../../shared/project-editor').BsbWidgetNodeSnapshot,
    raw: string,
  ): void => {
    const existingLines = Array.isArray(node.properties.lines)
      ? (node.properties.lines as Array<{
          varName?: string;
          min?: number;
          max?: number;
          color?: string;
          points?: Array<{ x: number; y: number }>;
        }>).map((line) => ({
          ...line,
          points: Array.isArray(line.points) ? line.points.map((point) => ({ ...point })) : [],
        }))
      : [];

    const parts = raw.split('@_@');
    let version = 1;
    let startIndex = 0;
    if (parts[0]?.startsWith('version=')) {
      version = parseInt(parts[0].substring(8), 10) || 1;
      startIndex = 1;
    }

    for (let index = startIndex; index < parts.length; index++) {
      const values = parts[index].split(':');
      const lineName = values[0];
      const lineIndex = existingLines.findIndex((candidate) => candidate.varName === lineName);
      if (lineIndex < 0) continue;

      const line = existingLines[lineIndex]!;
      const min = typeof line.min === 'number' ? line.min : 0;
      const max = typeof line.max === 'number' ? line.max : 1;
      const range = max - min;
      const points: Array<{ x: number; y: number }> = [];

      for (let valueIndex = 1; valueIndex < values.length; valueIndex += 2) {
        const nextX = parseFloat(values[valueIndex]);
        const nextY = parseFloat(values[valueIndex + 1]);
        if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) continue;

        points.push({
          x: nextX,
          y: version === 1 ? (nextY * range) + min : nextY,
        });
      }

      existingLines[lineIndex] = { ...line, points };
    }

    node.properties = { ...node.properties, lines: existingLines };
  };

  const applyPresetValueToNode = (
    node: import('../../shared/project-editor').BsbWidgetNodeSnapshot,
    raw: string,
  ): void => {
    if (node.type === 'BSBHSliderBank' || node.type === 'BSBVSliderBank') {
      const sliderValues = raw.split(':');
      const sliderCount = typeof node.properties.numberOfSliders === 'number'
        ? Math.max(1, node.properties.numberOfSliders)
        : Array.isArray(node.properties.sliders)
          ? Math.max(1, node.properties.sliders.length)
          : 1;
      const existingSliders = Array.isArray(node.properties.sliders)
        ? (node.properties.sliders as Array<{ value?: number }>).map((slider) => ({ ...slider }))
        : Array.from({ length: sliderCount }, () => ({ value: node.minimum ?? 0 }));
      const nextSliders = existingSliders.slice(0, sliderCount);

      for (let index = 0; index < Math.min(nextSliders.length, sliderValues.length); index++) {
        const parsed = parsePresetNumber(sliderValues[index]);
        if (parsed === null) continue;
        nextSliders[index] = { ...nextSliders[index], value: parsed };
      }

      node.properties = { ...node.properties, sliders: nextSliders };
      return;
    }

    if (node.type === 'BSBCheckBox') {
      const selected = raw.startsWith('ver2:')
        ? (parseLegacyPresetNumber(raw) ?? 0) > 0
        : raw.toLowerCase() === 'true';
      node.properties = { ...node.properties, selected };
      node.value = selected ? 1 : 0;
      return;
    }

    if (node.type === 'BSBDropdown') {
      let selectedIndex: number | null = null;
      if (raw.startsWith('id:')) {
        const uniqueId = raw.substring(3);
        const items = Array.isArray(node.properties.dropdownItems)
          ? node.properties.dropdownItems as Array<{ uniqueId?: string }>
          : [];
        const index = items.findIndex((item) => item?.uniqueId === uniqueId);
        selectedIndex = index >= 0 ? index : null;
      } else {
        selectedIndex = parseLegacyPresetNumber(raw);
      }

      if (selectedIndex !== null) {
        node.properties = { ...node.properties, selectedIndex };
        node.value = selectedIndex;
      }
      return;
    }

    if (node.type === 'BSBTextField') {
      node.properties = { ...node.properties, textValue: raw };
      return;
    }

    if (node.type === 'BSBValue') {
      const parsed = parseLegacyPresetNumber(raw);
      if (parsed !== null) {
        node.properties = { ...node.properties, defaultValue: parsed };
        node.value = parsed;
      }
      return;
    }

    if (node.type === 'BSBXYController') {
      const parts = raw.split(':');
      let nextX = Number.NaN;
      let nextY = Number.NaN;

      const xMin = typeof node.properties.xMin === 'number' ? node.properties.xMin : 0;
      const xMax = typeof node.properties.xMax === 'number' ? node.properties.xMax : 1;
      const yMin = typeof node.properties.yMin === 'number' ? node.properties.yMin : 0;
      const yMax = typeof node.properties.yMax === 'number' ? node.properties.yMax : 1;

      if (parts.length === 2) {
        const relativeX = parsePresetNumber(parts[0]);
        const relativeY = parsePresetNumber(parts[1]);
        if (relativeX !== null && relativeY !== null) {
          nextX = (relativeX * (xMax - xMin)) + xMin;
          nextY = (relativeY * (yMax - yMin)) + yMin;
        }
      } else if (parts.length >= 3) {
        nextX = parseFloat(parts[1]);
        nextY = parseFloat(parts[2]);
      }

      if (Number.isFinite(nextX) && Number.isFinite(nextY)) {
        node.properties = { ...node.properties, xValue: nextX, yValue: nextY };
      }
      return;
    }

    if (node.type === 'BSBFileSelector') {
      node.properties = { ...node.properties, fileName: raw };
      return;
    }

    if (node.type === 'BSBSubChannelDropdown') {
      node.properties = { ...node.properties, channelOutput: raw };
      return;
    }

    if (node.type === 'BSBLineObject') {
      applyLineObjectPreset(node, raw);
      return;
    }

    if (node.type === 'BSBKnob') {
      if (raw.indexOf(':') < 0) {
        const relative = parsePresetNumber(raw);
        if (relative !== null) {
          node.value = (relative * (node.maximum - node.minimum)) + node.minimum;
        }
      } else {
        const parsed = parsePresetNumber(raw.substring(raw.indexOf(':') + 1));
        if (parsed !== null) {
          node.value = parsed;
        }
      }
      return;
    }

    const parsed = parseLegacyPresetNumber(raw);
    if (parsed !== null) {
      node.value = parsed;
    }
  };

  const cloneWidgetNode = (
    node: import('../../shared/project-editor').BsbWidgetNodeSnapshot,
  ): import('../../shared/project-editor').BsbWidgetNodeSnapshot => ({
    ...node,
    properties: { ...node.properties },
    children: node.children ? [...node.children] : undefined,
  });

  const rebuildWidgetIndexes = (): void => {
    if (!instrument.widgetTree?.children) {
      instrument.objectNames = [];
      instrument.widgets = [];
      return;
    }

    instrument.objectNames = collectObjectNamesFromTree(instrument.widgetTree);
    syncWidgetListFromTree();
  };

  const updateWidgetTreeById = (
    node: import('../../shared/project-editor').BsbWidgetNodeSnapshot,
    widgetId: string,
    updater: (
      nextNode: import('../../shared/project-editor').BsbWidgetNodeSnapshot,
    ) => boolean,
  ): {
    node: import('../../shared/project-editor').BsbWidgetNodeSnapshot;
    changed: boolean;
  } => {
    if (node.id === widgetId) {
      const nextNode = cloneWidgetNode(node);
      return updater(nextNode)
        ? { node: nextNode, changed: true }
        : { node, changed: false };
    }

    if (!node.children) {
      return { node, changed: false };
    }

    let changed = false;
    const nextChildren = node.children.map((child) => {
      const result = updateWidgetTreeById(child, widgetId, updater);
      if (result.changed) {
        changed = true;
      }
      return result.node;
    });

    if (!changed) {
      return { node, changed: false };
    }

    const nextNode = cloneWidgetNode(node);
    nextNode.children = nextChildren;
    return { node: nextNode, changed: true };
  };

  const removeWidgetFromTree = (
    node: import('../../shared/project-editor').BsbWidgetNodeSnapshot,
    widgetId: string,
  ): {
    node: import('../../shared/project-editor').BsbWidgetNodeSnapshot;
    removed: boolean;
  } => {
    if (!node.children || node.children.length === 0) {
      return { node, removed: false };
    }

    const directIndex = node.children.findIndex((child) => child.id === widgetId);
    if (directIndex >= 0) {
      const nextNode = cloneWidgetNode(node);
      const nextChildren = node.children.slice();
      nextChildren.splice(directIndex, 1);
      nextNode.children = nextChildren;
      return { node: nextNode, removed: true };
    }

    let removed = false;
    const nextChildren = node.children.map((child) => {
      const result = removeWidgetFromTree(child, widgetId);
      if (result.removed) {
        removed = true;
      }
      return result.node;
    });

    if (!removed) {
      return { node, removed: false };
    }

    const nextNode = cloneWidgetNode(node);
    nextNode.children = nextChildren;
    return { node: nextNode, removed: true };
  };

  const applyPresetToTree = (
    node: import('../../shared/project-editor').BsbWidgetNodeSnapshot,
    valuesMap: Record<string, string>,
  ): {
    node: import('../../shared/project-editor').BsbWidgetNodeSnapshot;
    changed: boolean;
  } => {
    let nextNode = node;
    let changed = false;

    if (node.objectName && Object.prototype.hasOwnProperty.call(valuesMap, node.objectName)) {
      const raw = valuesMap[node.objectName];
      if (raw !== undefined) {
        nextNode = cloneWidgetNode(node);
        applyPresetValueToNode(nextNode, raw);
        changed = true;
      }
    }

    if (node.children) {
      let childrenChanged = false;
      const nextChildren = node.children.map((child) => {
        const result = applyPresetToTree(child, valuesMap);
        if (result.changed) {
          childrenChanged = true;
        }
        return result.node;
      });

      if (childrenChanged) {
        if (!changed) {
          nextNode = cloneWidgetNode(node);
          changed = true;
        }
        nextNode.children = nextChildren;
      }
    }

    return { node: nextNode, changed };
  };

  switch (patch.type) {
    case 'setEditEnabled':
      instrument.editEnabled = patch.value;
      break;
    case 'selectWidget':
      break;
    case 'updateWidgetProperties': {
      if (!instrument.widgetTree) break;
      const shouldRebuildWidgetIndexes = Object.prototype.hasOwnProperty.call(
        patch.properties,
        'objectName',
      );
      const result = updateWidgetTreeById(instrument.widgetTree, patch.widgetId, (node) => {
        for (const [key, value] of Object.entries(patch.properties)) {
          switch (key) {
            case 'objectName': node.objectName = value as string; break;
            case 'x': node.x = value as number; break;
            case 'y': node.y = value as number; break;
            case 'width': node.width = value as number; break;
            case 'height': node.height = value as number; break;
            case 'value': node.value = value as number; break;
            case 'defaultValue':
              node.properties.defaultValue = value as number;
              if (node.type === 'BSBValue') {
                node.value = value as number;
              }
              break;
            case 'minimum': node.minimum = value as number; break;
            case 'maximum': node.maximum = value as number; break;
            case 'selectedIndex':
              node.properties.selectedIndex = value as number;
              node.value = value as number;
              break;
            case 'sliderWidth':
              node.properties.sliderWidth = value as number;
              if (node.type === 'BSBHSliderBank') {
                syncSliderBankLayout(node);
              } else {
                node.width = (value as number) + (node.properties.valueDisplayEnabled ? 50 : 0);
              }
              break;
            case 'sliderHeight':
              node.properties.sliderHeight = value as number;
              if (node.type === 'BSBVSliderBank') {
                syncSliderBankLayout(node);
              } else {
                node.height = (value as number) + (node.properties.valueDisplayEnabled ? 30 : 0);
              }
              break;
            case 'knobWidth':
              node.properties.knobWidth = value as number;
              node.width = value as number;
              break;
            case 'canvasWidth':
              node.properties.canvasWidth = value as number;
              node.width = value as number;
              break;
            case 'canvasHeight':
              node.properties.canvasHeight = value as number;
              node.height = node.type === 'BSBLineObject'
                ? (value as number) + BSB_LINE_SELECTOR_HEIGHT
                : (value as number);
              break;
            case 'textFieldWidth':
              node.properties.textFieldWidth = value as number;
              node.width = node.type === 'BSBFileSelector'
                ? (value as number) + 30
                : (value as number);
              break;
            case 'numberOfSliders': {
              const nextCount = Math.max(1, value as number);
              const previous = Array.isArray(node.properties.sliders)
                ? node.properties.sliders as Array<{ value?: number }>
                : [];
              node.properties.numberOfSliders = nextCount;
              node.properties.sliders = Array.from(
                { length: nextCount },
                (_unused, index) => previous[index] ?? { value: node.minimum ?? 0 },
              );
              syncSliderBankLayout(node);
              break;
            }
            case 'valueDisplayEnabled':
              node.properties.valueDisplayEnabled = value;
              if (node.type === 'BSBHSlider') {
                const sliderWidth = typeof node.properties.sliderWidth === 'number' ? node.properties.sliderWidth : 150;
                node.width = sliderWidth + (value ? 50 : 0);
              } else if (node.type === 'BSBVSlider') {
                const sliderHeight = typeof node.properties.sliderHeight === 'number' ? node.properties.sliderHeight : 150;
                node.height = sliderHeight + (value ? 30 : 0);
              } else if (node.type === 'BSBHSliderBank' || node.type === 'BSBVSliderBank') {
                syncSliderBankLayout(node);
              }
              break;
            case 'gap':
              node.properties.gap = value as number;
              if (node.type === 'BSBHSliderBank' || node.type === 'BSBVSliderBank') {
                syncSliderBankLayout(node);
              }
              break;
            default: node.properties[key] = value; break;
          }
        }
        return true;
      });
      if (result.changed) {
        instrument.widgetTree = result.node;
        if (shouldRebuildWidgetIndexes) {
          rebuildWidgetIndexes();
        }
      }
      break;
    }
    case 'updateSliderBankValue': {
      if (!instrument.widgetTree) break;
      const result = updateWidgetTreeById(instrument.widgetTree, patch.widgetId, (node) => {
        const sliderCount = typeof node.properties.numberOfSliders === 'number'
          ? Math.max(1, node.properties.numberOfSliders)
          : Array.isArray(node.properties.sliders)
            ? Math.max(1, node.properties.sliders.length)
            : 1;
        const sliders = Array.isArray(node.properties.sliders)
          ? [...(node.properties.sliders as Array<{ value?: number }>)]
          : Array.from({ length: sliderCount }, () => ({ value: node.minimum ?? 0 }));
        if (patch.sliderIndex < 0 || patch.sliderIndex >= sliders.length) {
          return false;
        }
        sliders[patch.sliderIndex] = {
          ...sliders[patch.sliderIndex],
          value: patch.value,
        };
        node.properties.sliders = sliders;
        return true;
      });
      if (result.changed) {
        instrument.widgetTree = result.node;
      }
      break;
    }
    case 'moveWidget': {
      if (!instrument.widgetTree) break;
      const result = updateWidgetTreeById(instrument.widgetTree, patch.widgetId, (node) => {
        node.x = patch.x;
        node.y = patch.y;
        return true;
      });
      if (result.changed) {
        instrument.widgetTree = result.node;
      }
      break;
    }
    case 'resizeWidget': {
      if (!instrument.widgetTree) break;
      const result = updateWidgetTreeById(instrument.widgetTree, patch.widgetId, (node) => {
        node.width = patch.width;
        node.height = patch.height;
        return true;
      });
      if (result.changed) {
        instrument.widgetTree = result.node;
      }
      break;
    }
    case 'updateGridSettings':
      instrument.gridSettings = { ...instrument.gridSettings, ...patch.patch };
      break;
    case 'applyPreset':
      if (instrument.presetGroup) {
        instrument.presetGroup = clonePresetGroupSnapshot(instrument.presetGroup);
        instrument.presetGroup.currentPresetUniqueId = patch.presetUniqueId;
        instrument.presetGroup.currentPresetModified = false;
        const preset = findPresetById(instrument.presetGroup, patch.presetUniqueId);
        if (preset?.values && instrument.widgetTree) {
          const result = applyPresetToTree(instrument.widgetTree, preset.values);
          if (result.changed) {
            instrument.widgetTree = result.node;
          }
        }
      }
      break;
    case 'updatePreset':
      if (instrument.presetGroup) {
        instrument.presetGroup = clonePresetGroupSnapshot(instrument.presetGroup);
        instrument.presetGroup.currentPresetModified = false;
      }
      break;
    case 'addPreset':
      // Optimistic update - actual preset creation happens on main process
      if (instrument.presetGroup) {
        instrument.presetGroup = clonePresetGroupSnapshot(instrument.presetGroup);
        instrument.presetGroup.currentPresetModified = false;
      }
      break;
    case 'addPresetGroup':
      // Optimistic update - actual group creation happens on main process
      if (instrument.presetGroup) {
        instrument.presetGroup = clonePresetGroupSnapshot(instrument.presetGroup);
      }
      break;
    case 'synchronizePresets':
      // Optimistic update - actual sync happens on main process
      if (instrument.presetGroup) {
        instrument.presetGroup = clonePresetGroupSnapshot(instrument.presetGroup);
      }
      break;
    case 'updateEmbeddedOpcodeList':
      instrument.opcodeListText = patch.opcodeList;
      break;
    case 'addWidget': {
      if (!instrument.widgetTree) break;
      const newId = `w${Date.now()}`;
      const newNode: import('../../shared/project-editor').BsbWidgetNodeSnapshot = {
        id: newId,
        type: patch.widgetType,
        objectName: '',
        x: patch.x,
        y: patch.y,
        width: 60,
        height: 24,
        value: 0,
        minimum: 0,
        maximum: 1,
        properties: {},
        children: patch.widgetType === 'BSBGroup' ? [] : undefined,
      };
      const targetId = patch.parentGroupId;
      if (targetId) {
        const result = updateWidgetTreeById(instrument.widgetTree, targetId, (node) => {
          if (node.type !== 'BSBGroup') {
            return false;
          }
          node.children = [...(node.children ?? []), newNode];
          return true;
        });
        if (result.changed) {
          instrument.widgetTree = result.node;
          rebuildWidgetIndexes();
        }
      } else {
        const nextRoot = cloneWidgetNode(instrument.widgetTree);
        nextRoot.children = [...(nextRoot.children ?? []), newNode];
        instrument.widgetTree = nextRoot;
        rebuildWidgetIndexes();
      }
      break;
    }
    case 'removeWidget': {
      if (!instrument.widgetTree) break;
      const result = removeWidgetFromTree(instrument.widgetTree, patch.widgetId);
      if (result.removed) {
        instrument.widgetTree = result.node;
        rebuildWidgetIndexes();
      }
      break;
    }
    case 'addUdo': {
      const udolist = instrument.udolist ? [...instrument.udolist] : [];
      const newUdo = patch.definition
        ? cloneUdoSnapshot(patch.definition)
        : cloneUdoSnapshot(EMPTY_UDO_SNAPSHOT);
      if (patch.index !== undefined && patch.index >= 0 && patch.index <= udolist.length) {
        udolist.splice(patch.index, 0, newUdo);
      } else {
        udolist.push(newUdo);
      }
      instrument.udolist = udolist;
      instrument.opcodeListText = formatUdoListAsOpcodeText(udolist);
      break;
    }
    case 'removeUdo': {
      const removeUdolist = instrument.udolist ? [...instrument.udolist] : [];
      if (patch.index >= 0 && patch.index < removeUdolist.length) {
        removeUdolist.splice(patch.index, 1);
      }
      instrument.udolist = removeUdolist;
      instrument.opcodeListText = formatUdoListAsOpcodeText(removeUdolist);
      break;
    }
    case 'updateUdo': {
      const updateUdolist = instrument.udolist
        ? instrument.udolist.map((udo) => cloneUdoSnapshot(udo))
        : [];
      if (patch.index >= 0 && patch.index < updateUdolist.length) {
        updateUdolist[patch.index] = { ...updateUdolist[patch.index], ...patch.patch };
      }
      instrument.udolist = updateUdolist;
      instrument.opcodeListText = formatUdoListAsOpcodeText(updateUdolist);
      break;
    }
    case 'convertUdoStyle': {
      const convertedUdolist = instrument.udolist
        ? instrument.udolist.map((udo) => cloneUdoSnapshot(udo))
        : [];
      if (patch.index >= 0 && patch.index < convertedUdolist.length) {
        convertedUdolist[patch.index] = convertUdoSnapshotStyle(
          convertedUdolist[patch.index]!,
          patch.style,
        );
      }
      instrument.udolist = convertedUdolist;
      instrument.opcodeListText = formatUdoListAsOpcodeText(convertedUdolist);
      break;
    }
    case 'reorderUdo': {
      const reorderUdolist = instrument.udolist ? [...instrument.udolist] : [];
      if (patch.from >= 0 && patch.from < reorderUdolist.length && patch.to >= 0 && patch.to < reorderUdolist.length) {
        const [moved] = reorderUdolist.splice(patch.from, 1);
        reorderUdolist.splice(patch.to, 0, moved);
      }
      instrument.udolist = reorderUdolist;
      instrument.opcodeListText = formatUdoListAsOpcodeText(reorderUdolist);
      break;
    }
    case 'randomize':
      break;
  }
}

function collectObjectNamesFromTree(node: import('../../shared/project-editor').BsbWidgetNodeSnapshot): string[] {
  const names: string[] = [];
  const visit = (n: import('../../shared/project-editor').BsbWidgetNodeSnapshot): void => {
    if (n.objectName) names.push(n.objectName);
    if (n.children) n.children.forEach(visit);
  };
  if (node.children) node.children.forEach(visit);
  return names.sort();
}

function findPresetById(
  group: import('../../shared/project-editor').PresetGroupSnapshot | undefined,
  uniqueId: string,
): import('../../shared/project-editor').PresetSnapshot | undefined {
  if (!group) return undefined;
  for (const p of group.presets) {
    if (p.uniqueId === uniqueId) return p;
  }
  for (const sub of group.subGroups) {
    const found = findPresetById(sub, uniqueId);
    if (found) return found;
  }
  return undefined;
}

function applyOrchestraPatchSnapshot(
  orchestra: OrchestraSnapshot,
  patch: OrchestraPatch,
): OrchestraSnapshot {
  const next = cloneOrchestraSnapshot(orchestra);

  switch (patch.type) {
    case 'addInstrument': {
      const assignmentId = getNextArrangementId(next.arrangement.rows);
      const instrument = createDefaultInstrumentSnapshot(patch.instrumentType, assignmentId);
      const nextRows = cloneArrangementRowsForMutation(next);
      const nextInstruments = cloneInstrumentsForMutation(next);
      nextRows.push({
        assignmentId,
        enabled: instrument.enabled,
        instrumentName: instrument.name,
        instrumentType: instrument.type,
        instrumentSummary: instrument.type,
        editable: true,
      });
      nextInstruments.push(instrument);
      break;
    }
    case 'removeAssignment': {
      next.arrangement.rows = next.arrangement.rows.filter(
        (row) => row.assignmentId !== patch.assignmentId,
      );
      next.instruments = next.instruments.filter(
        (instrument) => instrument.assignmentId !== patch.assignmentId,
      );
      break;
    }
    case 'duplicateAssignment': {
      const sourceRow = next.arrangement.rows.find(
        (row) => row.assignmentId === patch.sourceAssignmentId,
      );
      const sourceInstrument = next.instruments.find(
        (instrument) => instrument.assignmentId === patch.sourceAssignmentId,
      );
      if (sourceRow && sourceInstrument) {
        const assignmentId = getNextArrangementId(next.arrangement.rows);
        const duplicatedInstrument = cloneInstrumentSnapshot(sourceInstrument);
        duplicatedInstrument.assignmentId = assignmentId;
        const nextRows = cloneArrangementRowsForMutation(next);
        const nextInstruments = cloneInstrumentsForMutation(next);
        nextRows.push({
          ...sourceRow,
          assignmentId,
        });
        nextInstruments.push(duplicatedInstrument);
      }
      break;
    }
    case 'pasteInstrument': {
      const assignmentId = getNextArrangementId(next.arrangement.rows);
      const pastedInstrument = cloneInstrumentSnapshot(patch.instrument);
      pastedInstrument.assignmentId = assignmentId;
      const nextRows = cloneArrangementRowsForMutation(next);
      const nextInstruments = cloneInstrumentsForMutation(next);
      nextRows.push({
        assignmentId,
        enabled: pastedInstrument.enabled,
        instrumentName: pastedInstrument.name,
        instrumentType: pastedInstrument.type,
        instrumentSummary: pastedInstrument.type,
        editable: true,
      });
      nextInstruments.push(pastedInstrument);
      break;
    }
    case 'updateAssignment': {
      const rowIndex = next.arrangement.rows.findIndex(
        (candidate) => candidate.assignmentId === patch.assignmentId,
      );
      const instrumentIndex = next.instruments.findIndex(
        (candidate) => candidate.assignmentId === patch.assignmentId,
      );
      const row = rowIndex >= 0 ? cloneArrangementRowSnapshot(next.arrangement.rows[rowIndex]!) : undefined;
      const instrument = instrumentIndex >= 0
        ? cloneInstrumentSnapshotForMutation(next.instruments[instrumentIndex]!)
        : undefined;

      if (rowIndex >= 0 && row) {
        next.arrangement.rows = next.arrangement.rows.slice();
        next.arrangement.rows[rowIndex] = row;
      }
      if (instrumentIndex >= 0 && instrument) {
        next.instruments = next.instruments.slice();
        next.instruments[instrumentIndex] = instrument;
      }

      if (row) {
        if (patch.enabled !== undefined) {
          row.enabled = patch.enabled;
          if (instrument) {
            instrument.enabled = patch.enabled;
          }
        }

        if (patch.nextAssignmentId && patch.nextAssignmentId.trim()) {
          const nextAssignmentId = patch.nextAssignmentId.trim();
          const duplicate = next.arrangement.rows.some(
            (candidate) =>
              candidate !== row && candidate.assignmentId === nextAssignmentId,
          );
          if (!duplicate && row.assignmentId !== nextAssignmentId) {
            row.assignmentId = nextAssignmentId;
            if (instrument) {
              instrument.assignmentId = nextAssignmentId;
            }
          }
        }
      }
      break;
    }
    case 'replaceInstrument': {
      const rowIndex = next.arrangement.rows.findIndex(
        (candidate) => candidate.assignmentId === patch.assignmentId,
      );
      if (rowIndex >= 0) {
        const row = cloneArrangementRowSnapshot(next.arrangement.rows[rowIndex]!);
        const instrument = createDefaultInstrumentSnapshot(
          patch.instrumentType,
          patch.assignmentId,
          row.enabled,
        );
        next.arrangement.rows = next.arrangement.rows.slice();
        next.arrangement.rows[rowIndex] = row;
        row.instrumentType = instrument.type;
        row.instrumentName = instrument.name;
        row.instrumentSummary = instrument.type;
        const index = next.instruments.findIndex(
          (candidate) => candidate.assignmentId === patch.assignmentId,
        );
        if (index >= 0) {
          next.instruments = next.instruments.slice();
          next.instruments[index] = instrument;
        }
      }
      break;
    }
    case 'convertGenericToBsb': {
      const source = next.instruments.find(
        (candidate) => candidate.assignmentId === patch.assignmentId,
      );
      const rowIndex = next.arrangement.rows.findIndex(
        (candidate) => candidate.assignmentId === patch.assignmentId,
      );
      if (source?.type === 'generic' && rowIndex >= 0) {
        const row = cloneArrangementRowSnapshot(next.arrangement.rows[rowIndex]!);
        const converted: InstrumentSnapshot = {
          assignmentId: source.assignmentId,
          type: 'blueSynthBuilder',
          name: source.name,
          enabled: source.enabled,
          comment: source.comment,
          instrumentText: source.text,
          alwaysOnInstrumentText: '',
          globalOrc: source.globalOrc,
          globalSco: source.globalSco,
          objectNames: [],
          widgets: [],
        };
        next.arrangement.rows = next.arrangement.rows.slice();
        next.arrangement.rows[rowIndex] = row;
        row.instrumentType = converted.type;
        row.instrumentName = converted.name;
        row.instrumentSummary = converted.type;
        const index = next.instruments.findIndex(
          (candidate) => candidate.assignmentId === patch.assignmentId,
        );
        if (index >= 0) {
          next.instruments = next.instruments.slice();
          next.instruments[index] = converted;
        }
      }
      break;
    }
    case 'updateInstrument': {
      updateInstrumentSnapshot(next, patch.assignmentId, patch.patch);
      break;
    }
    case 'updateInstrumentComment': {
      updateInstrumentSnapshot(next, patch.assignmentId, { comment: patch.comment });
      break;
    }
  }

  return next;
}

export const useProjectStore = create<ProjectState & ProjectActions>()((set, get) => {
  storeGet = get;
  storeSet = set;
  return {
  ...buildInitialState(),

  loadProject: async () => {
    set({ isLoading: true });
    try {
      const filePath = await window.blueAPI.openFile();
      if (filePath) {
        // The main process will send project-loaded IPC event
        // which triggers setProjectInfo via useIPCListeners
        return;
      }
      set({ isLoading: false });
    } catch (err: unknown) {
      toast.error(`Failed to open file: ${err instanceof Error ? err.message : String(err)}`);
      set({ isLoading: false });
    }
  },

  saveProject: async () => {
    try {
      const filePath = await window.blueAPI.saveFile();
      if (filePath) {
        set({
          filePath,
          isDirty: false,
        });
      }
    } catch (err: unknown) {
      toast.error(`Save failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  },

  saveProjectAs: async () => {
    try {
      const filePath = await window.blueAPI.saveFileAs();
      if (filePath) {
        set({ filePath, isDirty: false });
      }
    } catch (err: unknown) {
      toast.error(`Save As failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  },

  setProjectInfo: (info) => {
    applyProjectInfoToState(info, false);
  },

  setLoading: (isLoading) => set({ isLoading }),

  markDirty: () => set({ isDirty: true }),

  markClean: () => set({ isDirty: false }),

  clearProject: () => set(buildInitialState()),

  applyProjectDocumentPatch: async (patch) => {
    if (!get().loaded) {
      toast.error('No project is loaded');
      return;
    }

    if (
      patch.globalOrc === undefined &&
      patch.globalSco === undefined &&
      patch.orchestra === undefined &&
      patch.tablesText === undefined &&
      patch.projectUdo === undefined &&
      patch.blueLive === undefined &&
      (!patch.projectProperties || Object.keys(patch.projectProperties).length === 0) &&
      (!patch.transport || Object.keys(patch.transport).length === 0)
    ) {
      return;
    }

    set((state) => {
      const next: ProjectState = {
        ...state,
        isDirty: true,
      };

      if (patch.globalOrc !== undefined) {
        next.globalOrc = patch.globalOrc;
      }

      if (patch.globalSco !== undefined) {
        next.globalSco = patch.globalSco;
      }

      if (patch.orchestra !== undefined) {
        next.orchestra = applyOrchestraPatchSnapshot(state.orchestra, patch.orchestra);
      }

      if (patch.projectProperties) {
        next.projectProperties = mergeProjectProperties(
          state.projectProperties,
          patch.projectProperties,
        );

        if (patch.projectProperties.title !== undefined) {
          next.title = patch.projectProperties.title;
        }
        if (patch.projectProperties.author !== undefined) {
          next.author = patch.projectProperties.author;
        }
        if (patch.projectProperties.sampleRate !== undefined) {
          next.sampleRate = patch.projectProperties.sampleRate;
        }
      }

      if (patch.transport) {
        next.transport = {
          ...state.transport,
          ...patch.transport,
          tempoMap: state.transport.tempoMap,
        };
      }

      if (patch.tablesText !== undefined) {
        next.tablesText = patch.tablesText;
      }

      if (patch.projectUdo !== undefined) {
        next.projectUdos = applyProjectUdoPatchToSnapshot(state.projectUdos, patch.projectUdo);
      }

      if (patch.blueLive !== undefined && state.blueLive) {
        next.blueLive = applyBlueLivePatchToSnapshot(state.blueLive, patch.blueLive);
      }

      return next;
    });

    const realtimeUpdate = buildRealtimeControlUpdate(patch);
    if (realtimeUpdate) {
      void window.blueAPI.sendBsbRealtimeControlUpdate(realtimeUpdate).catch((err: unknown) => {
        toast.error(`Realtime BSB update failed: ${err instanceof Error ? err.message : String(err)}`);
      });
    }

    pendingPatches.push(patch);

    scheduleFlush();
  },

  updateGlobalOrc: async (globalOrc) => {
    await get().applyProjectDocumentPatch({ globalOrc });
  },

  updateGlobalSco: async (globalSco) => {
    await get().applyProjectDocumentPatch({ globalSco });
  },

  updateOrchestra: async (orchestra) => {
    await get().applyProjectDocumentPatch({ orchestra });
  },

  updateProjectProperties: async (patch) => {
    await get().applyProjectDocumentPatch({ projectProperties: patch });
  },

  setLoopRendering: async (loopRendering) => {
    await get().applyProjectDocumentPatch({
      transport: { loopRendering },
    });
  },

  updateTablesText: async (tablesText) => {
    set({ tablesText });
    await get().applyProjectDocumentPatch({ tablesText });
  },

  applyProjectUdoPatch: async (patch) => {
    await get().applyProjectDocumentPatch({ projectUdo: patch });
  },

  applyBlueLivePatch: async (patch) => {
    await get().applyProjectDocumentPatch({ blueLive: patch });
  },

  setGeneratedCsd: (csd: { text: string; title: string } | null) => {
    set({ generatedCsd: csd });
  },

  generateCsdToScreen: async () => {
    await window.blueAPI.generateCsdToScreen();
  },

  generateCsdToDisk: async () => {
    await window.blueAPI.generateCsdToDisk();
  },

  flushPendingPatches: async () => {
    await doFlushAsync();
  },
};
});
