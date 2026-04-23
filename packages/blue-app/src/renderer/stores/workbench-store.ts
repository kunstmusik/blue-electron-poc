import { create } from 'zustand';
import type { DockviewApi } from 'dockview';
import {
  applyAuxiliaryLayout,
  buildDefaultWorkbenchLayout,
  createDefaultAuxiliaryLayoutState,
  createStoredWorkbenchLayout,
  dockAuxiliaryPanel as dockAuxiliaryPanelLayout,
  getAuxiliarySeedGroupIdForPanel,
  hideAllAuxiliarySlideouts as hideAllAuxiliarySlideoutsLayout,
  hideAuxiliarySlideout as hideAuxiliarySlideoutLayout,
  isAuxiliaryPanelId,
  maximizeAuxiliaryGroupLayout,
  mergeBackToSeededGroup as mergeBackToSeededGroupLayout,
  minimizeAuxiliaryPanelLayout,
  minimizeAuxiliaryGroupLayout,
  moveAuxiliaryEdge as moveAuxiliaryEdgeLayout,
  moveGroupToEdge as moveGroupToEdgeLayout,
  movePanelToEdge as movePanelToEdgeLayout,
  parseStoredWorkbenchLayout,
  resetAuxiliaryLayout,
  resizeAuxiliarySlideout as resizeAuxiliarySlideoutLayout,
  restoreAuxiliaryGroupLayout,
  revealAuxiliaryPanel,
  syncAuxiliaryLayoutFromApi,
  toggleMinimizedAuxiliaryPanel,
  type AuxiliaryEdge,
  type AuxiliaryLayoutState,
} from '../components/workbench/auxiliary-layout';
import { getPanel } from '../components/workbench/panel-registry';
import type { NativeMenuCommand } from '../../shared/workbench-menu';

interface WorkbenchState {
  api: DockviewApi | null;
  auxiliary: AuxiliaryLayoutState;
}

interface WorkbenchActions {
  setApi: (api: DockviewApi | null) => void;
  openPanel: (panelId: string) => void;
  focusPanel: (panelId: string) => void;
  toggleAuxiliaryPanel: (panelId: string) => void;
  minimizeAuxiliaryPanel: (panelId: string) => void;
  closePanel: (panelId: string) => void;
  isPanelOpen: (panelId: string) => boolean;
  saveLayout: () => string | null;
  loadLayout: (json: string | null) => void;
  syncAuxiliaryLayout: () => void;
  minimizeAuxiliaryGroup: (groupInstanceId: string) => void;
  maximizeAuxiliaryGroup: (groupInstanceId: string) => void;
  restoreAuxiliaryGroup: (groupInstanceId: string) => void;
  dockAuxiliaryPanel: (panelId: string) => void;
  hideAuxiliarySlideout: (edge: AuxiliaryEdge) => void;
  hideAllAuxiliarySlideouts: () => void;
  resizeAuxiliarySlideout: (panelId: string, size: number) => void;
  getAuxiliaryGroupForPanel: (panelId: string) => string | undefined;
  moveAuxiliaryEdge: (sourceEdge: AuxiliaryEdge, targetEdge: AuxiliaryEdge) => void;
  moveGroupToEdge: (groupInstanceId: string, targetEdge: AuxiliaryEdge) => void;
  movePanelToEdge: (panelId: string, targetEdge: AuxiliaryEdge) => void;
  mergeBackToSeededGroup: (groupInstanceId: string) => void;
  resetLayout: () => void;
  handleNativeMenuCommand: (command: NativeMenuCommand) => void;
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

    minimizeAuxiliaryPanel: (panelId) => {
      const { api, auxiliary } = get();
      if (!api || !isAuxiliaryPanelId(panelId)) return;

      set({
        auxiliary: minimizeAuxiliaryPanelLayout(api, auxiliary, panelId),
      });
    },

    closePanel: (panelId) => {
      const { api } = get();
      if (!api) return;

      if (isAuxiliaryPanelId(panelId)) {
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

    minimizeAuxiliaryGroup: (groupInstanceId) => {
      const { api, auxiliary } = get();
      if (!api) return;

      set({
        auxiliary: minimizeAuxiliaryGroupLayout(api, auxiliary, groupInstanceId),
      });
    },

    maximizeAuxiliaryGroup: (groupInstanceId) => {
      const { api, auxiliary } = get();
      if (!api) return;

      set({
        auxiliary: maximizeAuxiliaryGroupLayout(api, auxiliary, groupInstanceId),
      });
    },

    restoreAuxiliaryGroup: (groupInstanceId) => {
      const { api, auxiliary } = get();
      if (!api) return;

      set({
        auxiliary: restoreAuxiliaryGroupLayout(api, auxiliary, groupInstanceId),
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

    moveAuxiliaryEdge: (sourceEdge, targetEdge) => {
      const { api, auxiliary } = get();
      if (!api) return;

      const next = moveAuxiliaryEdgeLayout(auxiliary, sourceEdge, targetEdge);
      set({ auxiliary: applyAuxiliaryLayout(api, next) });
    },

    getAuxiliaryGroupForPanel: (panelId) => {
      const state = get();
      const instance = state.auxiliary.groups.find((g) =>
        g.panelIds.includes(panelId),
      );
      return instance?.groupInstanceId;
    },

    moveGroupToEdge: (groupInstanceId, targetEdge) => {
      const { api, auxiliary } = get();
      if (!api) return;

      const next = moveGroupToEdgeLayout(auxiliary, groupInstanceId, targetEdge);
      set({ auxiliary: applyAuxiliaryLayout(api, next) });
    },

    movePanelToEdge: (panelId, targetEdge) => {
      const { api, auxiliary } = get();
      if (!api) return;

      const next = movePanelToEdgeLayout(auxiliary, panelId, targetEdge);
      set({ auxiliary: applyAuxiliaryLayout(api, next) });
    },

    mergeBackToSeededGroup: (groupInstanceId) => {
      const { api, auxiliary } = get();
      if (!api) return;

      const next = mergeBackToSeededGroupLayout(auxiliary, groupInstanceId);
      set({ auxiliary: applyAuxiliaryLayout(api, next) });
    },

    resetLayout: () => {
      const { api } = get();
      if (!api) return;

      const fresh = resetAuxiliaryLayout();
      set({ auxiliary: applyAuxiliaryLayout(api, fresh) });
    },

    handleNativeMenuCommand: (command) => {
      switch (command.type) {
        case 'focus-panel':
          get().openPanel(command.panelId);
          return;
        case 'reset-layout':
          get().resetLayout();
          return;
      }
    },
  }),
);
