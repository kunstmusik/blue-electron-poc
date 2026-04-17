import { create } from 'zustand';
import type { DockviewApi } from 'dockview';

interface WorkbenchState {
  api: DockviewApi | null;
}

interface WorkbenchActions {
  setApi: (api: DockviewApi | null) => void;
  openPanel: (panelId: string) => void;
  focusPanel: (panelId: string) => void;
  closePanel: (panelId: string) => void;
  isPanelOpen: (panelId: string) => boolean;
  saveLayout: () => string | null;
  loadLayout: (json: string) => void;
}

export const useWorkbenchStore = create<WorkbenchState & WorkbenchActions>()((set, get) => ({
  api: null,

  setApi: (api) => set({ api }),

  openPanel: (panelId) => {
    const { api } = get();
    if (!api) return;
    const existing = api.getPanel(panelId);
    if (existing) {
      existing.api.focus();
      existing.api.setActive();
      return;
    }
    api.addPanel({
      id: panelId,
      component: 'default',
      title: panelId,
    });
  },

  focusPanel: (panelId) => {
    const { api } = get();
    if (!api) return;
    const panel = api.getPanel(panelId);
    if (panel) {
      panel.api.focus();
      panel.api.setActive();
    }
  },

  closePanel: (panelId) => {
    const { api } = get();
    if (!api) return;
    const panel = api.getPanel(panelId);
    if (panel) {
      api.removePanel(panel);
    }
  },

  isPanelOpen: (panelId) => {
    const { api } = get();
    if (!api) return false;
    return api.getPanel(panelId) != null;
  },

  saveLayout: () => {
    const { api } = get();
    if (!api) return null;
    return JSON.stringify(api.toJSON());
  },

  loadLayout: (json) => {
    const { api } = get();
    if (!api) return;
    try {
      api.fromJSON(JSON.parse(json));
    } catch {
      // Layout restore failed; will use default layout
    }
  },
}));
