import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  enginePath: string;
  recentFiles: string[];
  windowBounds: { x: number; y: number; width: number; height: number } | null;
}

interface SettingsActions {
  setEnginePath: (path: string) => void;
  addRecentFile: (path: string) => void;
  removeRecentFile: (path: string) => void;
  setWindowBounds: (bounds: SettingsState['windowBounds']) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      enginePath: 'blue-engine',
      recentFiles: [],
      windowBounds: null,

      setEnginePath: (enginePath) => set({ enginePath }),

      addRecentFile: (path) =>
        set((state) => {
          const files = [path, ...state.recentFiles.filter((f) => f !== path)].slice(0, 10);
          return { recentFiles: files };
        }),

      removeRecentFile: (path) =>
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
