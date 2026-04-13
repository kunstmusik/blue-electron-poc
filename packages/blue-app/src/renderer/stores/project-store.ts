import { create } from 'zustand';
import { toast } from 'sonner';

interface ProjectState {
  title: string;
  author: string;
  sampleRate: string;
  version: string;
  filePath: string | null;
  isLoading: boolean;
  isDirty: boolean;
}

interface ProjectActions {
  loadProject: () => Promise<void>;
  saveProject: () => Promise<void>;
  saveProjectAs: () => Promise<void>;
  setProjectInfo: (info: Record<string, string>) => void;
  setLoading: (loading: boolean) => void;
  markDirty: () => void;
  markClean: () => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectState & ProjectActions>()((set, get) => ({
  title: '',
  author: '',
  sampleRate: '',
  version: '',
  filePath: null,
  isLoading: false,
  isDirty: false,

  loadProject: async () => {
    set({ isLoading: true });
    try {
      const filePath = await window.blueAPI.openFile();
      if (filePath) {
        // The main process will send project-loaded IPC event
        // which triggers setProjectInfo via useIPCListeners
      }
    } catch (err: unknown) {
      toast.error(`Failed to open file: ${err instanceof Error ? err.message : String(err)}`);
      set({ isLoading: false });
    }
  },

  saveProject: async () => {
    try {
      await window.blueAPI.saveFile();
      set({ isDirty: false });
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

  setProjectInfo: (info) =>
    set({
      title: info.title || 'Untitled',
      author: info.author || '',
      sampleRate: info.sampleRate || '',
      version: info.version || '',
      filePath: info.filePath || null,
      isLoading: false,
      isDirty: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  markDirty: () => set({ isDirty: true }),

  markClean: () => set({ isDirty: false }),

  clearProject: () =>
    set({
      title: '',
      author: '',
      sampleRate: '',
      version: '',
      filePath: null,
      isLoading: false,
      isDirty: false,
    }),
}));
