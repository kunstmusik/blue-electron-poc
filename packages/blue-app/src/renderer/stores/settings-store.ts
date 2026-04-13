import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

interface SettingsState {
  enginePath: string;
  recentFiles: string[];
  windowBounds: { x: number; y: number; width: number; height: number } | null;
}

interface SettingsActions {
  openFile: () => Promise<void>;
  openRecentFile: (path: string) => Promise<void>;
  setEnginePath: (path: string) => void;
  addRecentFile: (path: string) => void;
  removeRecentFile: (path: string) => void;
  setWindowBounds: (bounds: SettingsState['windowBounds']) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, get) => ({
      enginePath: 'blue-engine',
      recentFiles: [],
      windowBounds: null,

      openFile: async () => {
        try {
          const filePath = await window.blueAPI.openFile();
          if (filePath) {
            get().addRecentFile(filePath);
          }
        } catch (err: unknown) {
          toast.error(`Failed to open: ${err instanceof Error ? err.message : String(err)}`);
        }
      },

      openRecentFile: async (path: string) => {
        // IPC open dialog — if user picks same file, it loads
        // For direct recent file open, we'd need a separate IPC call
        // For now, trigger the open dialog
        get().openFile();
      },

      setEnginePath: (enginePath) => set({ enginePath }),

      addRecentFile: (path: string) =>
        set((state) => {
          const files = [path, ...state.recentFiles.filter((f) => f !== path)].slice(0, 10);
          return { recentFiles: files };
        }),

      removeRecentFile: (path: string) =>
        set((state) => ({
          recentFiles: state.recentFiles.filter((f) => f !== path),
        })),

      setWindowBounds: (windowBounds) => set({ windowBounds }),
    }),
    {
      name: 'blue-settings',
      partialize: (state) => ({
        recentFiles: state.recentFiles,
        windowBounds: state.windowBounds,
        enginePath: state.enginePath,
      }),
    },
  ),
);
