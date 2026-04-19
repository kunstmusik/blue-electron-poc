import { create } from 'zustand';
import type { DockviewApi } from 'dockview';
import {
  applyAuxiliaryLayout,
  buildDefaultWorkbenchLayout,
  createDefaultAuxiliaryLayoutState,
  createStoredWorkbenchLayout,
  dockAuxiliaryPanel as dockAuxiliaryPanelLayout,
  getAuxiliaryEdgeForPanel,
  getAuxiliaryGroupIdForPanel,
  hideAllAuxiliarySlideouts as hideAllAuxiliarySlideoutsLayout,
  hideAuxiliarySlideout as hideAuxiliarySlideoutLayout,
  isAuxiliaryPanelId,
  maximizeAuxiliaryGroupLayout,
  minimizeAuxiliaryGroupLayout,
  parseStoredWorkbenchLayout,
  resizeAuxiliarySlideout as resizeAuxiliarySlideoutLayout,
  revealAuxiliaryPanel,
  restoreAuxiliaryGroupLayout,
  syncAuxiliaryLayoutFromApi,
  toggleMinimizedAuxiliaryPanel,
  type AuxiliaryEdge,
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
  toggleAuxiliaryPanel: (panelId: string) => void;
  closePanel: (panelId: string) => void;
  isPanelOpen: (panelId: string) => boolean;
  saveLayout: () => string | null;
  loadLayout: (json: string | null) => void;
  syncAuxiliaryLayout: () => void;
  minimizeAuxiliaryGroup: (groupId: AuxiliaryGroupId) => void;
  maximizeAuxiliaryGroup: (groupId: AuxiliaryGroupId) => void;
  restoreAuxiliaryGroup: (groupId: AuxiliaryGroupId) => void;
  dockAuxiliaryPanel: (panelId: string) => void;
  hideAuxiliarySlideout: (edge: AuxiliaryEdge) => void;
  hideAllAuxiliarySlideouts: () => void;
  resizeAuxiliarySlideout: (panelId: string, size: number) => void;
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
          auxiliary: revealAuxiliaryPanel(api, auxiliary, panelId),
        });
        return;
      }

      const existing = api.getPanel(panelId);
      if (existing) {
        existing.api.setActive();
        existing.group.focus();
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
        set({
          auxiliary: revealAuxiliaryPanel(
            api,
            get().auxiliary,
            panelId,
          ),
        });
        return;
      }

      const panel = api.getPanel(panelId);
      if (panel) {
        panel.api.setActive();
        panel.group.focus();
      }
    },

    toggleAuxiliaryPanel: (panelId) => {
      if (!isAuxiliaryPanelId(panelId)) {
        get().openPanel(panelId);
        return;
      }

      set((state) => ({
        auxiliary: toggleMinimizedAuxiliaryPanel(state.auxiliary, panelId),
      }));
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

    dockAuxiliaryPanel: (panelId) => {
      const { api, auxiliary } = get();
      if (!api) return;

      set({
        auxiliary: dockAuxiliaryPanelLayout(api, auxiliary, panelId),
      });
    },

    hideAuxiliarySlideout: (edge) => {
      set((state) => ({
        auxiliary: hideAuxiliarySlideoutLayout(state.auxiliary, edge),
      }));
    },

    hideAllAuxiliarySlideouts: () => {
      set((state) => ({
        auxiliary: hideAllAuxiliarySlideoutsLayout(state.auxiliary),
      }));
    },

    resizeAuxiliarySlideout: (panelId, size) => {
      set((state) => ({
        auxiliary: resizeAuxiliarySlideoutLayout(state.auxiliary, panelId, size),
      }));
    },

    getAuxiliaryGroupForPanel: (panelId) => getAuxiliaryGroupIdForPanel(panelId),
  }),
);
