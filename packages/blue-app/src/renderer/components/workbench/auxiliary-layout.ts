import type {
  DockviewApi,
  DockviewGroupPanel,
  SerializedDockview,
} from 'dockview';
import {
  getDefaultEditorPanels,
  getPanel,
  type PanelMode,
} from './panel-registry';

export type AuxiliaryEdge = 'right' | 'bottom';
type AuxiliaryPanelMode = Extract<PanelMode, 'properties' | 'output'>;

interface AuxiliaryEdgeDefinition {
  edge: AuxiliaryEdge;
  groupId: string;
  mode: AuxiliaryPanelMode;
  direction: 'right' | 'below';
  defaultPanelIds: string[];
  defaultActivePanelId: string;
  initialSize: number;
}

export interface AuxiliaryEdgeState {
  panelIds: string[];
  activePanelId: string;
  size?: number;
}

export interface AuxiliaryLayoutState {
  byEdge: Record<AuxiliaryEdge, AuxiliaryEdgeState>;
}

export interface StoredWorkbenchLayout {
  version: 2;
  dockview: SerializedDockview;
  auxiliary: AuxiliaryLayoutState;
}

const AUXILIARY_EDGE_DEFINITIONS: Record<AuxiliaryEdge, AuxiliaryEdgeDefinition> = {
  right: {
    edge: 'right',
    groupId: 'blue-aux-right',
    mode: 'properties',
    direction: 'right',
    defaultPanelIds: [
      'SoundObjectPropertiesTopComponent',
      'MidiInputPanelTopComponent',
    ],
    defaultActivePanelId: 'SoundObjectPropertiesTopComponent',
    initialSize: 360,
  },
  bottom: {
    edge: 'bottom',
    groupId: 'blue-aux-bottom',
    mode: 'output',
    direction: 'below',
    defaultPanelIds: [
      'ScoreObjectEditorTopComponent',
      'MixerTopComponent',
    ],
    defaultActivePanelId: 'ScoreObjectEditorTopComponent',
    initialSize: 228,
  },
};

const AUXILIARY_RAIL_LABELS: Record<string, string> = {
  SoundObjectPropertiesTopComponent: 'Properties',
  MidiInputPanelTopComponent: 'MIDI Input',
  ScoreObjectEditorTopComponent: 'Score Editor',
  MixerTopComponent: 'Mixer',
};

export function getAuxiliaryEdgeDefinition(
  edge: AuxiliaryEdge,
): AuxiliaryEdgeDefinition {
  return AUXILIARY_EDGE_DEFINITIONS[edge];
}

export function getAuxiliaryRailLabel(panelId: string): string {
  return AUXILIARY_RAIL_LABELS[panelId] ?? getPanel(panelId)?.title ?? panelId;
}

export function getAuxiliaryEdgeForPanel(
  panelId: string,
): AuxiliaryEdge | undefined {
  const descriptor = getPanel(panelId);
  if (!descriptor) {
    return undefined;
  }

  if (descriptor.mode === 'properties') {
    return 'right';
  }

  if (descriptor.mode === 'output') {
    return 'bottom';
  }

  return undefined;
}

export function isAuxiliaryPanelId(panelId: string): boolean {
  return getAuxiliaryEdgeForPanel(panelId) !== undefined;
}

export function cloneAuxiliaryLayoutState(
  state: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  return {
    byEdge: {
      right: {
        ...state.byEdge.right,
        panelIds: [...state.byEdge.right.panelIds],
      },
      bottom: {
        ...state.byEdge.bottom,
        panelIds: [...state.byEdge.bottom.panelIds],
      },
    },
  };
}

export function createDefaultAuxiliaryLayoutState(): AuxiliaryLayoutState {
  return {
    byEdge: {
      right: {
        panelIds: [...AUXILIARY_EDGE_DEFINITIONS.right.defaultPanelIds],
        activePanelId:
          AUXILIARY_EDGE_DEFINITIONS.right.defaultActivePanelId,
        size: AUXILIARY_EDGE_DEFINITIONS.right.initialSize,
      },
      bottom: {
        panelIds: [...AUXILIARY_EDGE_DEFINITIONS.bottom.defaultPanelIds],
        activePanelId:
          AUXILIARY_EDGE_DEFINITIONS.bottom.defaultActivePanelId,
        size: AUXILIARY_EDGE_DEFINITIONS.bottom.initialSize,
      },
    },
  };
}

export function recordAuxiliaryPanelSelection(
  state: AuxiliaryLayoutState,
  panelId: string,
): AuxiliaryLayoutState {
  const edge = getAuxiliaryEdgeForPanel(panelId);
  if (!edge) {
    return cloneAuxiliaryLayoutState(state);
  }

  const next = cloneAuxiliaryLayoutState(state);
  const edgeState = next.byEdge[edge];

  if (!edgeState.panelIds.includes(panelId)) {
    edgeState.panelIds.push(panelId);
  }

  edgeState.activePanelId = panelId;
  return next;
}

export function createStoredWorkbenchLayout(
  dockview: SerializedDockview,
  auxiliary: AuxiliaryLayoutState,
): StoredWorkbenchLayout {
  return {
    version: 2,
    dockview,
    auxiliary: cloneAuxiliaryLayoutState(auxiliary),
  };
}

export function parseStoredWorkbenchLayout(serialized: string | null): {
  dockview?: SerializedDockview;
  auxiliary: AuxiliaryLayoutState;
} {
  const fallback = createDefaultAuxiliaryLayoutState();

  if (!serialized) {
    return { auxiliary: fallback };
  }

  try {
    const parsed = JSON.parse(serialized) as unknown;

    if (isStoredWorkbenchLayout(parsed)) {
      return {
        dockview: parsed.dockview,
        auxiliary: normalizeAuxiliaryLayoutState(parsed.auxiliary),
      };
    }

    if (isSerializedDockview(parsed)) {
      return {
        dockview: parsed,
        auxiliary: fallback,
      };
    }
  } catch {
    return { auxiliary: fallback };
  }

  return { auxiliary: fallback };
}

export function buildDefaultWorkbenchLayout(
  api: DockviewApi,
): AuxiliaryLayoutState {
  const editors = getDefaultEditorPanels();
  const initialState = createDefaultAuxiliaryLayoutState();

  for (const descriptor of editors) {
    api.addPanel({
      id: descriptor.id,
      component: 'default',
      title: descriptor.title,
    });
  }

  return ensureAuxiliaryPrototype(api, initialState);
}

export function ensureAuxiliaryPrototype(
  api: DockviewApi,
  auxiliary: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  const normalized = normalizeAuxiliaryLayoutState(auxiliary);
  const anchorPanel = getAnchorPanel(api);

  if (!anchorPanel) {
    return normalized;
  }

  for (const edge of ['right', 'bottom'] as const) {
    const definition = AUXILIARY_EDGE_DEFINITIONS[edge];
    const edgeState = normalized.byEdge[edge];
    let group = api.getGroup(definition.groupId) as DockviewGroupPanel | undefined;

    if (!group) {
      group = api.addGroup({
        id: definition.groupId,
        referencePanel: anchorPanel,
        direction: definition.direction,
        hideHeader: true,
        locked: true,
        ...(edge === 'right'
          ? { initialWidth: edgeState.size ?? definition.initialSize }
          : { initialHeight: edgeState.size ?? definition.initialSize }),
      });
    }

    group.locked = true;

    for (const [index, panelId] of edgeState.panelIds.entries()) {
      const descriptor = getPanel(panelId);
      if (!descriptor) {
        continue;
      }

      const existingPanel = api.getPanel(panelId);

      if (!existingPanel) {
        api.addPanel({
          id: panelId,
          component: 'default',
          title: descriptor.title,
          position: {
            referenceGroup: group,
            direction: 'within',
            index,
          },
          inactive: panelId !== edgeState.activePanelId,
        });
        continue;
      }

      if (
        existingPanel.group.id !== group.id ||
        group.panels[index]?.id !== panelId
      ) {
        existingPanel.api.moveTo({
          group,
          position: 'center',
          index,
          skipSetActive: true,
        });
      }
    }

    const activePanelId = edgeState.panelIds.includes(edgeState.activePanelId)
      ? edgeState.activePanelId
      : edgeState.panelIds[0];

    api.getPanel(activePanelId)?.api.setActive();
  }

  return captureAuxiliaryLayoutFromApi(api, normalized);
}

export function ensureAuxiliaryPanelSelection(
  api: DockviewApi,
  auxiliary: AuxiliaryLayoutState,
  panelId: string,
): AuxiliaryLayoutState {
  return ensureAuxiliaryPrototype(
    api,
    recordAuxiliaryPanelSelection(auxiliary, panelId),
  );
}

export function captureAuxiliaryLayoutFromApi(
  api: DockviewApi,
  fallback: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(fallback);

  for (const edge of ['right', 'bottom'] as const) {
    const definition = AUXILIARY_EDGE_DEFINITIONS[edge];
    const group = api.getGroup(definition.groupId) as DockviewGroupPanel | undefined;

    if (!group || group.panels.length === 0) {
      continue;
    }

    const panelIds = group.panels.map((panel) => panel.id);
    next.byEdge[edge] = {
      panelIds,
      activePanelId: group.activePanel?.id ?? panelIds[0],
      size: group.size,
    };
  }

  return normalizeAuxiliaryLayoutState(next);
}

function getAnchorPanel(api: DockviewApi) {
  for (const descriptor of getDefaultEditorPanels()) {
    const panel = api.getPanel(descriptor.id);
    if (panel) {
      return panel;
    }
  }

  return api.panels[0];
}

function normalizeAuxiliaryLayoutState(
  state: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  const fallback = createDefaultAuxiliaryLayoutState();
  const next = cloneAuxiliaryLayoutState(fallback);

  for (const edge of ['right', 'bottom'] as const) {
    const definition = AUXILIARY_EDGE_DEFINITIONS[edge];
    const candidate = state.byEdge?.[edge];

    if (!candidate) {
      continue;
    }

    const panelIds = unique(
      candidate.panelIds.filter((panelId) => {
        const descriptor = getPanel(panelId);
        return descriptor?.mode === definition.mode;
      }),
    );

    if (panelIds.length > 0) {
      next.byEdge[edge].panelIds = panelIds;
    }

    next.byEdge[edge].activePanelId = panelIds.includes(candidate.activePanelId)
      ? candidate.activePanelId
      : next.byEdge[edge].panelIds[0];

    if (typeof candidate.size === 'number' && Number.isFinite(candidate.size)) {
      next.byEdge[edge].size = candidate.size;
    }
  }

  return next;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function isStoredWorkbenchLayout(
  value: unknown,
): value is StoredWorkbenchLayout {
  return (
    isRecord(value) &&
    value.version === 2 &&
    isSerializedDockview(value.dockview) &&
    isRecord(value.auxiliary)
  );
}

function isSerializedDockview(value: unknown): value is SerializedDockview {
  return (
    isRecord(value) &&
    isRecord(value.grid) &&
    isRecord(value.panels)
  );
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}
