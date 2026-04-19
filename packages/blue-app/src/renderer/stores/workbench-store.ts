import { create } from 'zustand';
import type { DockviewApi } from 'dockview';
import {
  buildDefaultWorkbenchLayout,
  captureAuxiliaryLayoutFromApi,
  createDefaultAuxiliaryLayoutState,
  createStoredWorkbenchLayout,
  ensureAuxiliaryPanelSelection,
  ensureAuxiliaryPrototype,
  getAuxiliaryEdgeForPanel,
  isAuxiliaryPanelId,
  parseStoredWorkbenchLayout,
  type AuxiliaryLayoutState,
} from '../components/workbench/auxiliary-layout';
import { getPanel } from '../components/workbench/panel-registry';

interface WorkbenchState {
  api: DockviewApi | null;
  auxiliary: AuxiliaryLayoutState;
}

interface WorkbenchActions {
  setApi: (api: DockviewApi | null) => void;
  openPanel: (panelId: string) => void;
  focusPanel: (panelId: string) => void;
  closePanel: (panelId: string) => void;
  isPanelOpen: (panelId: string) => boolean;
  saveLayout: () => string | null;
  loadLayout: (json: string | null) => void;
  syncAuxiliaryLayout: () => void;
}

export const useWorkbenchStore = create<WorkbenchState & WorkbenchActions>()((set, get) => ({
  api: null,
  auxiliary: createDefaultAuxiliaryLayoutState(),

  setApi: (api) => set({ api }),

  openPanel: (panelId) => {
    const { api, auxiliary } = get();
    if (!api) return;

    const descriptor = getPanel(panelId);
    if (!descriptor) return;

    if (isAuxiliaryPanelId(panelId)) {
      const nextAuxiliary = ensureAuxiliaryPanelSelection(api, auxiliary, panelId);
      const panel = api.getPanel(panelId);
      if (panel) {
        panel.api.focus();
        panel.api.setActive();
      }
      set({
        auxiliary: captureAuxiliaryLayoutFromApi(api, nextAuxiliary),
      });
      return;
    }

    const existing = api.getPanel(panelId);
    if (existing) {
      existing.api.focus();
      existing.api.setActive();
      return;
    }
    api.addPanel({
      id: panelId,
      component: 'default',
      title: descriptor.title,
    });
  },

  focusPanel: (panelId) => {
    const { api } = get();
    if (!api) return;

    if (isAuxiliaryPanelId(panelId)) {
      get().openPanel(panelId);
      return;
    }

    const panel = api.getPanel(panelId);
    if (panel) {
      panel.api.focus();
      panel.api.setActive();
    }
  },

  closePanel: (panelId) => {
    const { api } = get();
    if (!api) return;

    if (getAuxiliaryEdgeForPanel(panelId)) {
      return;
    }

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
    const { api, auxiliary } = get();
    if (!api) return null;
    const nextAuxiliary = captureAuxiliaryLayoutFromApi(api, auxiliary);
    set({ auxiliary: nextAuxiliary });
    return JSON.stringify(
      createStoredWorkbenchLayout(api.toJSON(), nextAuxiliary),
    );
  },

  loadLayout: (json) => {
    const { api } = get();
    if (!api) return;

    api.clear();
    const parsed = parseStoredWorkbenchLayout(json);

    if (parsed.dockview) {
      try {
        api.fromJSON(parsed.dockview);
        set({
          auxiliary: ensureAuxiliaryPrototype(api, parsed.auxiliary),
        });
        return;
      } catch {
        api.clear();
      }
    }

    set({ auxiliary: buildDefaultWorkbenchLayout(api) });
  },

  syncAuxiliaryLayout: () => {
    const { api, auxiliary } = get();
    if (!api) return;

    set({
      auxiliary: captureAuxiliaryLayoutFromApi(api, auxiliary),
    });
  },
}));
