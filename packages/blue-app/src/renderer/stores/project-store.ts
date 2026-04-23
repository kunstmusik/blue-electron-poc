import { create } from 'zustand';
import { toast } from 'sonner';
import {
  createEmptyProjectEditorSnapshot,
  type ProjectDocumentPatch,
  type ProjectLoadedPayload,
  type ProjectPropertiesSnapshot,
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
  updateProjectProperties: (
    patch: Partial<ProjectPropertiesSnapshot>,
  ) => Promise<void>;
  setLoopRendering: (loopRendering: boolean) => Promise<void>;
}

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
      await window.blueAPI.updateProjectDocument(patch);
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

  updateProjectProperties: async (patch) => {
    await get().applyProjectDocumentPatch({ projectProperties: patch });
  },

  setLoopRendering: async (loopRendering) => {
    await get().applyProjectDocumentPatch({
      transport: { loopRendering },
    });
  },
}));
