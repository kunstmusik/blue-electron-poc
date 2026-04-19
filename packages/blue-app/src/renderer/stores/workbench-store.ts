import { create } from 'zustand';
import type { DockviewApi } from 'dockview';
import {
  applyAuxiliaryLayout,
  buildDefaultWorkbenchLayout,
  createDefaultAuxiliaryLayoutState,
  createStoredWorkbenchLayout,
  focusAuxiliaryPanel,
  getAuxiliaryEdgeForPanel,
  getAuxiliaryGroupIdForPanel,
  isAuxiliaryPanelId,
  maximizeAuxiliaryGroupLayout,
  minimizeAuxiliaryGroupLayout,
  parseStoredWorkbenchLayout,
  restoreAuxiliaryGroupLayout,
  syncAuxiliaryLayoutFromApi,
  type AuxiliaryGroupId,
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
  minimizeAuxiliaryGroup: (groupId: AuxiliaryGroupId) => void;
  maximizeAuxiliaryGroup: (groupId: AuxiliaryGroupId) => void;
  restoreAuxiliaryGroup: (groupId: AuxiliaryGroupId) => void;
  getAuxiliaryGroupForPanel: (panelId: string) => AuxiliaryGroupId | undefined;
}

export const useWorkbenchStore = create<WorkbenchState & WorkbenchActions>()(
  (set, get) => ({
    api: null,
    auxiliary: createDefaultAuxiliaryLayoutState(),

    setApi: (api) => set({ api }),

    openPanel: (panelId) => {
      const { api, auxiliary } = get();
      if (!api) return;

      const descriptor = getPanel(panelId);
      if (!descriptor) return;

      if (isAuxiliaryPanelId(panelId)) {
        set({
          auxiliary: focusAuxiliaryPanel(api, auxiliary, panelId),
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

      const nextAuxiliary = syncAuxiliaryLayoutFromApi(api, auxiliary);
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
            auxiliary: applyAuxiliaryLayout(api, parsed.auxiliary),
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
        auxiliary: syncAuxiliaryLayoutFromApi(api, auxiliary),
      });
    },

    minimizeAuxiliaryGroup: (groupId) => {
      const { api, auxiliary } = get();
      if (!api) return;

      set({
        auxiliary: minimizeAuxiliaryGroupLayout(api, auxiliary, groupId),
      });
    },

    maximizeAuxiliaryGroup: (groupId) => {
      const { api, auxiliary } = get();
      if (!api) return;

      set({
        auxiliary: maximizeAuxiliaryGroupLayout(api, auxiliary, groupId),
      });
    },

    restoreAuxiliaryGroup: (groupId) => {
      const { api, auxiliary } = get();
      if (!api) return;

      set({
        auxiliary: restoreAuxiliaryGroupLayout(api, auxiliary, groupId),
      });
    },

    getAuxiliaryGroupForPanel: (panelId) => getAuxiliaryGroupIdForPanel(panelId),
  }),
);
