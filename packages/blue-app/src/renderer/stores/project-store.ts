import { create } from 'zustand';

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
  setProject: (info: Record<string, string>) => void;
  setLoading: (loading: boolean) => void;
  markDirty: () => void;
  markClean: () => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectState & ProjectActions>()((set) => ({
  title: '',
  author: '',
  sampleRate: '',
  version: '',
  filePath: null,
  isLoading: false,
  isDirty: false,

  setProject: (info) =>
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
