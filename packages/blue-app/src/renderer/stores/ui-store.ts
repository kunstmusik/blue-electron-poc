import { create } from 'zustand';

export type ActivePanel = 'welcome' | 'project';
export type EffectsLibraryTarget = {
  channelId: string;
  chain: 'pre' | 'post';
} | null;

interface UIState {
  activePanel: ActivePanel;
  selectedLayer: string | null;
  zoom: number;
  effectsLibraryOpen: boolean;
  effectsLibraryTarget: EffectsLibraryTarget;
}

interface UIActions {
  setActivePanel: (panel: ActivePanel) => void;
  selectLayer: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  openEffectsLibrary: (target?: Exclude<EffectsLibraryTarget, null>) => void;
  closeEffectsLibrary: () => void;
  setEffectsLibraryTarget: (target: EffectsLibraryTarget) => void;
}

export const useUIStore = create<UIState & UIActions>()((set) => ({
  activePanel: 'welcome',
  selectedLayer: null,
  zoom: 100,
  effectsLibraryOpen: false,
  effectsLibraryTarget: null,

  setActivePanel: (activePanel) => set({ activePanel }),

  selectLayer: (selectedLayer) => set({ selectedLayer }),

  setZoom: (zoom) => set({ zoom }),

  openEffectsLibrary: (target) =>
    set((state) => ({
      effectsLibraryOpen: true,
      effectsLibraryTarget: target ?? state.effectsLibraryTarget,
    })),

  closeEffectsLibrary: () => set({ effectsLibraryOpen: false }),

  setEffectsLibraryTarget: (effectsLibraryTarget) => set({ effectsLibraryTarget }),
}));
