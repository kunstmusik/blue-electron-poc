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
  type ArrangementRowSnapshot,
  type InstrumentPatch,
  type InstrumentSnapshot,
  type ProjectDocumentPatch,
  type ProjectLoadedPayload,
  type ProjectPropertiesSnapshot,
  type OrchestraPatch,
  type OrchestraSnapshot,
  type SupportedNewInstrumentType,
  type ToolbarProjectTransportSnapshot,
} from '../../shared/project-editor';

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
}

let latestProjectPatchRequestId = 0;

function buildInitialState(): ProjectState {
  const snapshot = createEmptyProjectEditorSnapshot();

  return {
    title: '',
    author: '',
    sampleRate: '',
    version: '',
    filePath: snapshot.filePath,
    isLoading: false,
    isDirty: false,
    loaded: snapshot.loaded,
    globalOrc: snapshot.globalOrc,
    globalSco: snapshot.globalSco,
    orchestra: snapshot.orchestra,
    projectProperties: snapshot.projectProperties,
    transport: snapshot.transport,
  };
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

function syncSummaryFromProperties(
  properties: ProjectPropertiesSnapshot,
): Pick<ProjectState, 'title' | 'author' | 'sampleRate'> {
  return {
    title: properties.title,
    author: properties.author,
    sampleRate: properties.sampleRate,
  };
}

function cloneInstrumentSnapshot(instrument: InstrumentSnapshot): InstrumentSnapshot {
  return structuredClone(instrument);
}

function cloneOrchestraSnapshot(orchestra: OrchestraSnapshot): OrchestraSnapshot {
  return {
    ...orchestra,
    arrangement: {
      rows: orchestra.arrangement.rows.map((row) => ({ ...row })),
    },
    instruments: orchestra.instruments.map((instrument) => cloneInstrumentSnapshot(instrument)),
    temporaryLibrary: {
      ...orchestra.temporaryLibrary,
    },
  };
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
  const instrument = orchestra.instruments.find((candidate) => candidate.assignmentId === assignmentId);
  const row = orchestra.arrangement.rows.find((candidate) => candidate.assignmentId === assignmentId);

  if (!instrument) {
    return;
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
  switch (patch.type) {
    case 'setEditEnabled':
      instrument.editEnabled = patch.value;
      break;
    case 'selectWidget':
      break;
    case 'updateWidgetProperties': {
      if (!instrument.widgetTree) break;
      const updateNode = (node: import('../../shared/project-editor').BsbWidgetNodeSnapshot): boolean => {
        if (node.id === patch.widgetId) {
          for (const [key, value] of Object.entries(patch.properties)) {
            switch (key) {
              case 'objectName': node.objectName = value as string; break;
              case 'x': node.x = value as number; break;
              case 'y': node.y = value as number; break;
              case 'width': node.width = value as number; break;
              case 'height': node.height = value as number; break;
              default: node.properties[key] = value; break;
            }
          }
          if (patch.properties.objectName !== undefined) {
            instrument.objectNames = collectObjectNamesFromTree(instrument.widgetTree);
            instrument.widgets = instrument.widgets.map((w) =>
              w.objectName === patch.properties.objectName ? { ...w, objectName: patch.properties.objectName as string } : w
            );
          }
          return true;
        }
        if (node.children) {
          for (const child of node.children) {
            if (updateNode(child)) return true;
          }
        }
        return false;
      };
      updateNode(instrument.widgetTree);
      break;
    }
    case 'moveWidget': {
      if (!instrument.widgetTree) break;
      const moveNode = (node: import('../../shared/project-editor').BsbWidgetNodeSnapshot): boolean => {
        if (node.id === patch.widgetId) {
          node.x = patch.x;
          node.y = patch.y;
          return true;
        }
        if (node.children) {
          for (const child of node.children) {
            if (moveNode(child)) return true;
          }
        }
        return false;
      };
      moveNode(instrument.widgetTree);
      break;
    }
    case 'resizeWidget': {
      if (!instrument.widgetTree) break;
      const resizeNode = (node: import('../../shared/project-editor').BsbWidgetNodeSnapshot): boolean => {
        if (node.id === patch.widgetId) {
          node.width = patch.width;
          node.height = patch.height;
          return true;
        }
        if (node.children) {
          for (const child of node.children) {
            if (resizeNode(child)) return true;
          }
        }
        return false;
      };
      resizeNode(instrument.widgetTree);
      break;
    }
    case 'updateGridSettings':
      instrument.gridSettings = { ...instrument.gridSettings, ...patch.patch };
      break;
    case 'applyPreset':
      if (instrument.presetGroup) {
        instrument.presetGroup.currentPresetUniqueId = patch.presetUniqueId;
        instrument.presetGroup.currentPresetModified = false;
      }
      break;
    case 'updatePreset':
      if (instrument.presetGroup) {
        instrument.presetGroup.currentPresetModified = false;
      }
      break;
    case 'addPreset':
      // Optimistic update - actual preset creation happens on main process
      if (instrument.presetGroup) {
        instrument.presetGroup.currentPresetModified = false;
      }
      break;
    case 'addPresetGroup':
      // Optimistic update - actual group creation happens on main process
      break;
    case 'synchronizePresets':
      // Optimistic update - actual sync happens on main process
      break;
    case 'updateEmbeddedOpcodeList':
      instrument.opcodeListText = patch.opcodeList;
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

function applyOrchestraPatchSnapshot(
  orchestra: OrchestraSnapshot,
  patch: OrchestraPatch,
): OrchestraSnapshot {
  const next = cloneOrchestraSnapshot(orchestra);

  switch (patch.type) {
    case 'addInstrument': {
      const assignmentId = getNextArrangementId(next.arrangement.rows);
      const instrument = createDefaultInstrumentSnapshot(patch.instrumentType, assignmentId);
      next.arrangement.rows.push({
        assignmentId,
        enabled: instrument.enabled,
        instrumentName: instrument.name,
        instrumentType: instrument.type,
        instrumentSummary: instrument.type,
        editable: true,
      });
      next.instruments.push(instrument);
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
        next.arrangement.rows.push({
          ...sourceRow,
          assignmentId,
        });
        next.instruments.push(duplicatedInstrument);
      }
      break;
    }
    case 'pasteInstrument': {
      const assignmentId = getNextArrangementId(next.arrangement.rows);
      const pastedInstrument = cloneInstrumentSnapshot(patch.instrument);
      pastedInstrument.assignmentId = assignmentId;
      next.arrangement.rows.push({
        assignmentId,
        enabled: pastedInstrument.enabled,
        instrumentName: pastedInstrument.name,
        instrumentType: pastedInstrument.type,
        instrumentSummary: pastedInstrument.type,
        editable: true,
      });
      next.instruments.push(pastedInstrument);
      break;
    }
    case 'updateAssignment': {
      const row = next.arrangement.rows.find(
        (candidate) => candidate.assignmentId === patch.assignmentId,
      );
      const instrument = next.instruments.find(
        (candidate) => candidate.assignmentId === patch.assignmentId,
      );
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
      const row = next.arrangement.rows.find(
        (candidate) => candidate.assignmentId === patch.assignmentId,
      );
      if (row) {
        const instrument = createDefaultInstrumentSnapshot(
          patch.instrumentType,
          patch.assignmentId,
          row.enabled,
        );
        row.instrumentType = instrument.type;
        row.instrumentName = instrument.name;
        row.instrumentSummary = instrument.type;
        const index = next.instruments.findIndex(
          (candidate) => candidate.assignmentId === patch.assignmentId,
        );
        if (index >= 0) {
          next.instruments[index] = instrument;
        }
      }
      break;
    }
    case 'convertGenericToBsb': {
      const source = next.instruments.find(
        (candidate) => candidate.assignmentId === patch.assignmentId,
      );
      const row = next.arrangement.rows.find(
        (candidate) => candidate.assignmentId === patch.assignmentId,
      );
      if (source?.type === 'generic' && row) {
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
        row.instrumentType = converted.type;
        row.instrumentName = converted.name;
        row.instrumentSummary = converted.type;
        const index = next.instruments.findIndex(
          (candidate) => candidate.assignmentId === patch.assignmentId,
        );
        if (index >= 0) {
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

export const useProjectStore = create<ProjectState & ProjectActions>()((set, get) => ({
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
    if (!info) {
      set(buildInitialState());
      return;
    }

    set((state) => {
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
        isDirty: false,
        globalOrc: info.globalOrc ?? state.globalOrc,
        globalSco: info.globalSco ?? state.globalSco,
        orchestra: info.orchestra ?? state.orchestra,
        projectProperties: nextProjectProperties,
        transport: nextTransport,
      };
    });
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
      (!patch.projectProperties || Object.keys(patch.projectProperties).length === 0) &&
      (!patch.transport || Object.keys(patch.transport).length === 0)
    ) {
      return;
    }

    const requestId = ++latestProjectPatchRequestId;

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

      return next;
    });

    try {
      const snapshot = await window.blueAPI.updateProjectDocument(patch);
      if (snapshot && requestId === latestProjectPatchRequestId) {
        get().setProjectInfo(snapshot);
        set({ isDirty: true });
      }
    } catch (err: unknown) {
      toast.error(`Project update failed: ${err instanceof Error ? err.message : String(err)}`);
    }
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
}));
