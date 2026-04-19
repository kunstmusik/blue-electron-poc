import type {
  DockviewApi,
  DockviewGroupPanel,
  IDockviewPanel,
  SerializedDockview,
} from 'dockview';
import {
  getDefaultEditorPanels,
  getPanel,
  type PanelMode,
} from './panel-registry';

export type AuxiliaryEdge = 'left' | 'right' | 'bottom';
type AuxiliaryPanelMode = Extract<PanelMode, 'properties' | 'output'>;
export type AuxiliaryGroupId = 'properties-main' | 'output-main';
export type AuxiliaryPanelPresentation = 'docked' | 'minimized' | 'slideout';

interface AuxiliaryGroupDefinition {
  id: AuxiliaryGroupId;
  mode: AuxiliaryPanelMode;
  edge: AuxiliaryEdge;
  dockDirection: 'left' | 'right' | 'below';
  dockviewGroupId: string;
  panelIds: string[];
  defaultActivePanelId: string;
  defaultDockedSize: number;
  defaultSlideoutSize: number;
}

export interface MinimizedTabState {
  groupId: AuxiliaryGroupId;
  panelId: string;
  edge: AuxiliaryEdge;
  order: number;
  isActivePanel: boolean;
}

export interface AuxiliaryGroupSession {
  id: AuxiliaryGroupId;
  edge: AuxiliaryEdge;
  mode: AuxiliaryPanelMode;
  panelIds: string[];
  dockedPanelIds: string[];
  activePanelId: string;
  dockedSize: number;
  slideoutSize: number;
  isMaximized: boolean;
}

export interface AuxiliaryEdgeSlideoutState {
  edge: AuxiliaryEdge;
  openPanelId?: string;
}

export interface AuxiliarySlideoutView {
  edge: AuxiliaryEdge;
  groupId: AuxiliaryGroupId;
  panelId: string;
  size: number;
}

export interface AuxiliaryLayoutState {
  version: 4;
  groups: Record<AuxiliaryGroupId, AuxiliaryGroupSession>;
  slideouts: Record<AuxiliaryEdge, AuxiliaryEdgeSlideoutState>;
}

export interface StoredWorkbenchLayout {
  version: 4;
  dockview: SerializedDockview;
  auxiliary: AuxiliaryLayoutState;
}

interface LegacyAuxiliaryEdgeState {
  panelIds: string[];
  activePanelId: string;
  size?: number;
}

interface LegacyAuxiliaryLayoutStateV2 {
  byEdge?: Partial<Record<'right' | 'bottom', LegacyAuxiliaryEdgeState>>;
}

interface LegacyStoredWorkbenchLayoutV2 {
  version: 2;
  dockview: SerializedDockview;
  auxiliary: LegacyAuxiliaryLayoutStateV2;
}

interface LegacyFloatingBounds {
  width?: number;
  height?: number;
}

interface LegacyAuxiliaryGroupSessionV3 {
  panelIds?: string[];
  activePanelId?: string;
  presentation?: 'docked' | 'minimized' | 'floating' | 'maximized';
  dockedSize?: number;
  floatingBounds?: LegacyFloatingBounds;
}

interface LegacyAuxiliaryLayoutStateV3 {
  version: 3;
  groups: Partial<Record<AuxiliaryGroupId, LegacyAuxiliaryGroupSessionV3>>;
}

interface LegacyStoredWorkbenchLayoutV3 {
  version: 3;
  dockview: SerializedDockview;
  auxiliary: LegacyAuxiliaryLayoutStateV3;
}

const AUXILIARY_GROUP_ORDER: AuxiliaryGroupId[] = [
  'properties-main',
  'output-main',
];

const AUXILIARY_EDGE_ORDER: AuxiliaryEdge[] = ['left', 'right', 'bottom'];

const AUXILIARY_GROUP_DEFINITIONS: Record<
  AuxiliaryGroupId,
  AuxiliaryGroupDefinition
> = {
  'properties-main': {
    id: 'properties-main',
    mode: 'properties',
    edge: 'right',
    dockDirection: 'right',
    dockviewGroupId: 'blue-aux-properties-main',
    panelIds: [
      'SoundObjectPropertiesTopComponent',
      'MidiInputPanelTopComponent',
    ],
    defaultActivePanelId: 'SoundObjectPropertiesTopComponent',
    defaultDockedSize: 360,
    defaultSlideoutSize: 360,
  },
  'output-main': {
    id: 'output-main',
    mode: 'output',
    edge: 'bottom',
    dockDirection: 'below',
    dockviewGroupId: 'blue-aux-output-main',
    panelIds: [
      'ScoreObjectEditorTopComponent',
      'MixerTopComponent',
    ],
    defaultActivePanelId: 'ScoreObjectEditorTopComponent',
    defaultDockedSize: 228,
    defaultSlideoutSize: 228,
  },
};

export function getAuxiliaryGroupDefinition(
  groupId: AuxiliaryGroupId,
): AuxiliaryGroupDefinition {
  return AUXILIARY_GROUP_DEFINITIONS[groupId];
}

export function getAuxiliaryRailLabel(panelId: string): string {
  const descriptor = getPanel(panelId);
  return descriptor?.auxiliaryRailLabel ?? descriptor?.title ?? panelId;
}

export function getAuxiliaryGroupIdForPanel(
  panelId: string,
): AuxiliaryGroupId | undefined {
  const descriptor = getPanel(panelId);
  if (descriptor?.auxiliaryGroupId) {
    return descriptor.auxiliaryGroupId;
  }

  return AUXILIARY_GROUP_ORDER.find((groupId) =>
    AUXILIARY_GROUP_DEFINITIONS[groupId].panelIds.includes(panelId),
  );
}

export function getAuxiliaryEdgeForPanel(
  panelId: string,
): AuxiliaryEdge | undefined {
  const groupId = getAuxiliaryGroupIdForPanel(panelId);
  return groupId ? AUXILIARY_GROUP_DEFINITIONS[groupId].edge : undefined;
}

export function isAuxiliaryPanelId(panelId: string): boolean {
  return getAuxiliaryGroupIdForPanel(panelId) !== undefined;
}

export function getAuxiliaryPanelPresentation(
  state: AuxiliaryLayoutState,
  panelId: string,
): AuxiliaryPanelPresentation | undefined {
  const groupId = getAuxiliaryGroupIdForPanel(panelId);
  if (!groupId) {
    return undefined;
  }

  const session = state.groups[groupId];
  if (session.dockedPanelIds.includes(panelId)) {
    return 'docked';
  }

  return state.slideouts[session.edge].openPanelId === panelId
    ? 'slideout'
    : 'minimized';
}

export function getMinimizedTabsForEdge(
  state: AuxiliaryLayoutState,
  edge: AuxiliaryEdge,
): MinimizedTabState[] {
  const tabs: MinimizedTabState[] = [];
  const activePanelId = state.slideouts[edge].openPanelId;

  for (const groupId of AUXILIARY_GROUP_ORDER) {
    const session = state.groups[groupId];
    if (session.edge !== edge) {
      continue;
    }

    session.panelIds.forEach((panelId, order) => {
      if (session.dockedPanelIds.includes(panelId)) {
        return;
      }

      tabs.push({
        groupId,
        panelId,
        edge,
        order,
        isActivePanel: activePanelId === panelId,
      });
    });
  }

  return tabs;
}

export function getAuxiliarySlideoutForEdge(
  state: AuxiliaryLayoutState,
  edge: AuxiliaryEdge,
): AuxiliarySlideoutView | undefined {
  const openPanelId = state.slideouts[edge].openPanelId;
  if (!openPanelId) {
    return undefined;
  }

  const groupId = getAuxiliaryGroupIdForPanel(openPanelId);
  if (!groupId) {
    return undefined;
  }

  const session = state.groups[groupId];
  if (session.edge !== edge || session.dockedPanelIds.includes(openPanelId)) {
    return undefined;
  }

  return {
    edge,
    groupId,
    panelId: openPanelId,
    size: session.slideoutSize,
  };
}

export function createDefaultAuxiliaryLayoutState(): AuxiliaryLayoutState {
  return {
    version: 4,
    groups: {
      'properties-main': createDefaultGroupSession('properties-main'),
      'output-main': createDefaultGroupSession('output-main'),
    },
    slideouts: {
      left: { edge: 'left' },
      right: { edge: 'right' },
      bottom: { edge: 'bottom' },
    },
  };
}

export function cloneAuxiliaryLayoutState(
  state: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  return {
    version: 4,
    groups: {
      'properties-main': cloneGroupSession(state.groups['properties-main']),
      'output-main': cloneGroupSession(state.groups['output-main']),
    },
    slideouts: {
      left: { ...state.slideouts.left },
      right: { ...state.slideouts.right },
      bottom: { ...state.slideouts.bottom },
    },
  };
}

export function createStoredWorkbenchLayout(
  dockview: SerializedDockview,
  auxiliary: AuxiliaryLayoutState,
): StoredWorkbenchLayout {
  return {
    version: 4,
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

    if (isLegacyStoredWorkbenchLayoutV3(parsed)) {
      return {
        dockview: parsed.dockview,
        auxiliary: upgradeLegacyAuxiliaryLayoutStateV3(parsed.auxiliary),
      };
    }

    if (isLegacyStoredWorkbenchLayoutV2(parsed)) {
      return {
        dockview: parsed.dockview,
        auxiliary: upgradeLegacyAuxiliaryLayoutStateV2(parsed.auxiliary),
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
  for (const descriptor of getDefaultEditorPanels()) {
    api.addPanel({
      id: descriptor.id,
      component: 'default',
      title: descriptor.title,
    });
  }

  return applyAuxiliaryLayout(api, createDefaultAuxiliaryLayoutState());
}

export function applyAuxiliaryLayout(
  api: DockviewApi,
  state: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  const next = normalizeAuxiliaryLayoutState(state);
  const maximizeQueue: AuxiliaryGroupId[] = [];

  clearLiveAuxiliaryPanels(
    api,
    AUXILIARY_GROUP_ORDER.flatMap((groupId) => next.groups[groupId].panelIds),
  );

  for (const groupId of AUXILIARY_GROUP_ORDER) {
    const session = next.groups[groupId];
    createDockedPresentation(api, session);

    if (session.isMaximized && session.dockedPanelIds.length > 0) {
      maximizeQueue.push(groupId);
    }
  }

  for (const groupId of maximizeQueue) {
    const activeDockedPanelId = getActiveDockedPanelId(next.groups[groupId]);
    if (!activeDockedPanelId) {
      continue;
    }

    focusDockviewPanel(api, activeDockedPanelId);
    api.getPanel(activeDockedPanelId)?.api.maximize();
  }

  return syncAuxiliaryLayoutFromApi(api, next);
}

export function revealAuxiliaryPanel(
  api: DockviewApi,
  state: AuxiliaryLayoutState,
  panelId: string,
): AuxiliaryLayoutState {
  const groupId = getAuxiliaryGroupIdForPanel(panelId);
  if (!groupId) {
    return cloneAuxiliaryLayoutState(state);
  }

  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  const session = next.groups[groupId];
  session.activePanelId = panelId;

  if (session.dockedPanelIds.includes(panelId)) {
    next.slideouts[session.edge].openPanelId = undefined;

    if (!api.getPanel(panelId)) {
      const applied = applyAuxiliaryLayout(api, next);
      focusDockviewPanel(api, panelId);
      return syncAuxiliaryLayoutFromApi(api, applied);
    }

    focusDockviewPanel(api, panelId);
    return syncAuxiliaryLayoutFromApi(api, next);
  }

  next.slideouts[session.edge].openPanelId = panelId;
  return normalizeAuxiliaryLayoutState(next);
}

export function toggleMinimizedAuxiliaryPanel(
  state: AuxiliaryLayoutState,
  panelId: string,
): AuxiliaryLayoutState {
  const groupId = getAuxiliaryGroupIdForPanel(panelId);
  if (!groupId) {
    return cloneAuxiliaryLayoutState(state);
  }

  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  const session = next.groups[groupId];
  session.activePanelId = panelId;

  if (session.dockedPanelIds.includes(panelId)) {
    return normalizeAuxiliaryLayoutState(next);
  }

  next.slideouts[session.edge].openPanelId =
    next.slideouts[session.edge].openPanelId === panelId ? undefined : panelId;

  return normalizeAuxiliaryLayoutState(next);
}

export function hideAuxiliarySlideout(
  state: AuxiliaryLayoutState,
  edge: AuxiliaryEdge,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  next.slideouts[edge].openPanelId = undefined;
  return normalizeAuxiliaryLayoutState(next);
}

export function hideAllAuxiliarySlideouts(
  state: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));

  for (const edge of AUXILIARY_EDGE_ORDER) {
    next.slideouts[edge].openPanelId = undefined;
  }

  return normalizeAuxiliaryLayoutState(next);
}

export function dockAuxiliaryPanel(
  api: DockviewApi,
  state: AuxiliaryLayoutState,
  panelId: string,
): AuxiliaryLayoutState {
  const groupId = getAuxiliaryGroupIdForPanel(panelId);
  if (!groupId) {
    return cloneAuxiliaryLayoutState(state);
  }

  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  const session = next.groups[groupId];
  session.activePanelId = panelId;
  session.isMaximized = false;
  session.dockedPanelIds = sortPanelIdsByDefinition(groupId, [
    ...session.dockedPanelIds,
    panelId,
  ]);
  next.slideouts[session.edge].openPanelId = undefined;

  const applied = applyAuxiliaryLayout(api, next);
  focusDockviewPanel(api, panelId);
  return syncAuxiliaryLayoutFromApi(api, applied);
}

export function resizeAuxiliarySlideout(
  state: AuxiliaryLayoutState,
  panelId: string,
  size: number,
): AuxiliaryLayoutState {
  const groupId = getAuxiliaryGroupIdForPanel(panelId);
  if (!groupId) {
    return cloneAuxiliaryLayoutState(state);
  }

  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  const session = next.groups[groupId];
  session.slideoutSize = clampSlideoutSize(session.edge, size);
  return normalizeAuxiliaryLayoutState(next);
}

export function minimizeAuxiliaryGroupLayout(
  api: DockviewApi,
  state: AuxiliaryLayoutState,
  groupId: AuxiliaryGroupId,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  const session = next.groups[groupId];
  session.dockedPanelIds = [];
  session.isMaximized = false;

  if (
    next.slideouts[session.edge].openPanelId &&
    session.panelIds.includes(next.slideouts[session.edge].openPanelId as string)
  ) {
    next.slideouts[session.edge].openPanelId = undefined;
  }

  return applyAuxiliaryLayout(api, next);
}

export function maximizeAuxiliaryGroupLayout(
  api: DockviewApi,
  state: AuxiliaryLayoutState,
  groupId: AuxiliaryGroupId,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  const session = next.groups[groupId];
  session.dockedPanelIds = [...session.panelIds];
  session.isMaximized = true;
  next.slideouts[session.edge].openPanelId = undefined;

  const applied = applyAuxiliaryLayout(api, next);
  const activeDockedPanelId = getActiveDockedPanelId(applied.groups[groupId]);
  if (activeDockedPanelId) {
    focusDockviewPanel(api, activeDockedPanelId);
  }
  return syncAuxiliaryLayoutFromApi(api, applied);
}

export function restoreAuxiliaryGroupLayout(
  api: DockviewApi,
  state: AuxiliaryLayoutState,
  groupId: AuxiliaryGroupId,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  const session = next.groups[groupId];
  session.dockedPanelIds = [...session.panelIds];
  session.isMaximized = false;
  next.slideouts[session.edge].openPanelId = undefined;

  const applied = applyAuxiliaryLayout(api, next);
  const activeDockedPanelId = getActiveDockedPanelId(applied.groups[groupId]);
  if (activeDockedPanelId) {
    focusDockviewPanel(api, activeDockedPanelId);
  }
  return syncAuxiliaryLayoutFromApi(api, applied);
}

export function syncAuxiliaryLayoutFromApi(
  api: DockviewApi,
  fallback: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(fallback));

  for (const groupId of AUXILIARY_GROUP_ORDER) {
    const session = next.groups[groupId];
    const liveGroup = getLiveAuxiliaryGroup(api, session.panelIds);

    if (!liveGroup) {
      session.dockedPanelIds = [];
      session.isMaximized = false;
      continue;
    }

    const livePanelIds = sortPanelIdsByDefinition(
      groupId,
      liveGroup.panels
        .map((panel) => panel.id)
        .filter((panelId) => session.panelIds.includes(panelId)),
    );

    session.dockedPanelIds = livePanelIds;

    const slideoutPanelId = next.slideouts[session.edge].openPanelId;
    if (
      !slideoutPanelId ||
      getAuxiliaryGroupIdForPanel(slideoutPanelId) !== groupId
    ) {
      session.activePanelId =
        liveGroup.activePanel?.id ?? livePanelIds[0] ?? session.activePanelId;
    }

    if (Number.isFinite(liveGroup.size)) {
      session.dockedSize = liveGroup.size;
    }

    const activeDockedPanelId = getActiveDockedPanelId(session);
    const activeDockedPanel = activeDockedPanelId
      ? api.getPanel(activeDockedPanelId)
      : undefined;
    session.isMaximized = Boolean(activeDockedPanel?.api.isMaximized());
  }

  return normalizeAuxiliaryLayoutState(next);
}

function createDockedPresentation(
  api: DockviewApi,
  session: AuxiliaryGroupSession,
): DockviewGroupPanel | undefined {
  if (session.dockedPanelIds.length === 0) {
    return undefined;
  }

  const definition = AUXILIARY_GROUP_DEFINITIONS[session.id];
  const anchorPanel = getAnchorPanel(api);

  if (!anchorPanel) {
    return undefined;
  }

  const group = api.addGroup({
    id: definition.dockviewGroupId,
    referencePanel: anchorPanel,
    direction: definition.dockDirection,
    locked: true,
    ...(definition.edge === 'bottom'
      ? { initialHeight: session.dockedSize }
      : { initialWidth: session.dockedSize }),
  }) as DockviewGroupPanel;

  const activeDockedPanelId = getActiveDockedPanelId(session);

  group.locked = true;
  group.api.setHeaderPosition('top');
  mountDockedPanelsIntoGroup(api, group, session, activeDockedPanelId);

  if (activeDockedPanelId) {
    focusDockviewPanel(api, activeDockedPanelId);
  }

  return group;
}

function mountDockedPanelsIntoGroup(
  api: DockviewApi,
  group: DockviewGroupPanel,
  session: AuxiliaryGroupSession,
  activeDockedPanelId: string | undefined,
) {
  session.dockedPanelIds.forEach((panelId, index) => {
    const descriptor = getPanel(panelId);
    if (!descriptor) {
      return;
    }

    api.addPanel({
      id: panelId,
      component: 'default',
      title: descriptor.title,
      position: {
        referenceGroup: group,
        direction: 'within',
        index,
      },
      inactive:
        activeDockedPanelId !== undefined && panelId !== activeDockedPanelId,
    });
  });
}

function clearLiveAuxiliaryPanels(api: DockviewApi, panelIds: string[]) {
  for (const panelId of unique(panelIds)) {
    api.getPanel(panelId)?.api.close();
  }
}

function getLiveAuxiliaryGroup(
  api: DockviewApi,
  panelIds: string[],
): DockviewGroupPanel | undefined {
  for (const panelId of panelIds) {
    const panel = api.getPanel(panelId);
    if (panel) {
      return panel.group as DockviewGroupPanel;
    }
  }

  return undefined;
}

function getAnchorPanel(api: DockviewApi): IDockviewPanel | undefined {
  for (const descriptor of getDefaultEditorPanels()) {
    const panel = api.getPanel(descriptor.id);
    if (panel) {
      return panel;
    }
  }

  return api.panels[0];
}

function focusDockviewPanel(api: DockviewApi, panelId: string) {
  const panel = api.getPanel(panelId);
  if (!panel) {
    return;
  }

  panel.api.setActive();
  panel.group.focus();
}

function normalizeAuxiliaryLayoutState(
  state: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  const next = createDefaultAuxiliaryLayoutState();

  for (const groupId of AUXILIARY_GROUP_ORDER) {
    const definition = AUXILIARY_GROUP_DEFINITIONS[groupId];
    const fallback = next.groups[groupId];
    const candidate = state.groups?.[groupId];

    if (!candidate) {
      continue;
    }

    const panelIds = sortPanelIdsByDefinition(
      groupId,
      asStringArray(candidate.panelIds),
    );
    if (panelIds.length > 0) {
      fallback.panelIds = panelIds;
    }

    const dockedPanelIds = Array.isArray(candidate.dockedPanelIds)
      ? sortPanelIdsByDefinition(groupId, asStringArray(candidate.dockedPanelIds))
      : [...fallback.panelIds];

    fallback.dockedPanelIds = dockedPanelIds.filter((panelId) =>
      fallback.panelIds.includes(panelId),
    );

    fallback.activePanelId = fallback.panelIds.includes(candidate.activePanelId)
      ? candidate.activePanelId
      : fallback.dockedPanelIds[0] ?? fallback.panelIds[0];

    if (Number.isFinite(candidate.dockedSize)) {
      fallback.dockedSize = candidate.dockedSize;
    }

    if (Number.isFinite(candidate.slideoutSize)) {
      fallback.slideoutSize = clampSlideoutSize(
        definition.edge,
        candidate.slideoutSize,
      );
    }

    fallback.isMaximized = Boolean(candidate.isMaximized);
  }

  for (const edge of AUXILIARY_EDGE_ORDER) {
    const openPanelId =
      typeof state.slideouts?.[edge]?.openPanelId === 'string'
        ? state.slideouts[edge].openPanelId
        : undefined;

    if (!openPanelId) {
      continue;
    }

    const groupId = getAuxiliaryGroupIdForPanel(openPanelId);
    if (!groupId) {
      continue;
    }

    const session = next.groups[groupId];
    if (session.edge !== edge || session.dockedPanelIds.includes(openPanelId)) {
      continue;
    }

    next.slideouts[edge].openPanelId = openPanelId;
    session.activePanelId = openPanelId;
  }

  return next;
}

function createDefaultGroupSession(
  groupId: AuxiliaryGroupId,
): AuxiliaryGroupSession {
  const definition = AUXILIARY_GROUP_DEFINITIONS[groupId];
  return {
    id: definition.id,
    edge: definition.edge,
    mode: definition.mode,
    panelIds: [...definition.panelIds],
    dockedPanelIds: [...definition.panelIds],
    activePanelId: definition.defaultActivePanelId,
    dockedSize: definition.defaultDockedSize,
    slideoutSize: definition.defaultSlideoutSize,
    isMaximized: false,
  };
}

function cloneGroupSession(session: AuxiliaryGroupSession): AuxiliaryGroupSession {
  return {
    ...session,
    panelIds: [...session.panelIds],
    dockedPanelIds: [...session.dockedPanelIds],
  };
}

function getActiveDockedPanelId(
  session: AuxiliaryGroupSession,
): string | undefined {
  return session.dockedPanelIds.includes(session.activePanelId)
    ? session.activePanelId
    : session.dockedPanelIds[0];
}

function upgradeLegacyAuxiliaryLayoutStateV2(
  legacy: LegacyAuxiliaryLayoutStateV2,
): AuxiliaryLayoutState {
  const next = createDefaultAuxiliaryLayoutState();

  const right = legacy.byEdge?.right;
  if (right) {
    const session = next.groups['properties-main'];
    const panelIds = sortPanelIdsByDefinition(
      'properties-main',
      right.panelIds ?? [],
    );
    if (panelIds.length > 0) {
      session.panelIds = panelIds;
      session.dockedPanelIds = [...panelIds];
    }
    session.activePanelId = session.panelIds.includes(right.activePanelId)
      ? right.activePanelId
      : session.dockedPanelIds[0] ?? session.panelIds[0];
    if (Number.isFinite(right.size)) {
      session.dockedSize = right.size;
      session.slideoutSize = clampSlideoutSize(session.edge, right.size);
    }
  }

  const bottom = legacy.byEdge?.bottom;
  if (bottom) {
    const session = next.groups['output-main'];
    const panelIds = sortPanelIdsByDefinition('output-main', bottom.panelIds ?? []);
    if (panelIds.length > 0) {
      session.panelIds = panelIds;
      session.dockedPanelIds = [...panelIds];
    }
    session.activePanelId = session.panelIds.includes(bottom.activePanelId)
      ? bottom.activePanelId
      : session.dockedPanelIds[0] ?? session.panelIds[0];
    if (Number.isFinite(bottom.size)) {
      session.dockedSize = bottom.size;
      session.slideoutSize = clampSlideoutSize(session.edge, bottom.size);
    }
  }

  return next;
}

function upgradeLegacyAuxiliaryLayoutStateV3(
  legacy: LegacyAuxiliaryLayoutStateV3,
): AuxiliaryLayoutState {
  const next = createDefaultAuxiliaryLayoutState();

  for (const groupId of AUXILIARY_GROUP_ORDER) {
    const candidate = legacy.groups?.[groupId];
    if (!candidate) {
      continue;
    }

    const session = next.groups[groupId];
    const panelIds = sortPanelIdsByDefinition(groupId, candidate.panelIds ?? []);
    if (panelIds.length > 0) {
      session.panelIds = panelIds;
    }

    session.activePanelId = session.panelIds.includes(candidate.activePanelId)
      ? candidate.activePanelId
      : session.panelIds[0];

    if (Number.isFinite(candidate.dockedSize)) {
      session.dockedSize = candidate.dockedSize;
    }

    const slideoutSize =
      session.edge === 'bottom'
        ? candidate.floatingBounds?.height
        : candidate.floatingBounds?.width;
    if (Number.isFinite(slideoutSize)) {
      session.slideoutSize = clampSlideoutSize(session.edge, slideoutSize);
    }

    switch (candidate.presentation) {
      case 'minimized':
        session.dockedPanelIds = [];
        break;
      case 'floating':
        session.dockedPanelIds = [];
        next.slideouts[session.edge].openPanelId = session.activePanelId;
        break;
      case 'maximized':
        session.dockedPanelIds = [...session.panelIds];
        session.isMaximized = true;
        break;
      default:
        session.dockedPanelIds = [...session.panelIds];
        break;
    }
  }

  return normalizeAuxiliaryLayoutState(next);
}

function clampSlideoutSize(edge: AuxiliaryEdge, value: number): number {
  const viewportWidth =
    typeof window === 'undefined' ? 1440 : Math.max(window.innerWidth, 480);
  const viewportHeight =
    typeof window === 'undefined' ? 900 : Math.max(window.innerHeight, 320);

  if (edge === 'bottom') {
    return clampNumber(value, {
      minimum: 180,
      maximum: Math.max(180, viewportHeight - 96),
    });
  }

  return clampNumber(value, {
    minimum: 240,
    maximum: Math.max(240, viewportWidth - 120),
  });
}

function clampNumber(
  value: number,
  options: { minimum: number; maximum: number },
): number {
  if (!Number.isFinite(value)) {
    return options.minimum;
  }

  return Math.min(Math.max(value, options.minimum), options.maximum);
}

function sortPanelIdsByDefinition(
  groupId: AuxiliaryGroupId,
  panelIds: string[],
): string[] {
  const order = AUXILIARY_GROUP_DEFINITIONS[groupId].panelIds;
  return unique(panelIds).filter((panelId) => order.includes(panelId)).sort(
    (left, right) => order.indexOf(left) - order.indexOf(right),
  );
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function isStoredWorkbenchLayout(
  value: unknown,
): value is StoredWorkbenchLayout {
  return (
    isRecord(value) &&
    value.version === 4 &&
    isSerializedDockview(value.dockview) &&
    isAuxiliaryLayoutState(value.auxiliary)
  );
}

function isLegacyStoredWorkbenchLayoutV3(
  value: unknown,
): value is LegacyStoredWorkbenchLayoutV3 {
  return (
    isRecord(value) &&
    value.version === 3 &&
    isSerializedDockview(value.dockview) &&
    isRecord(value.auxiliary)
  );
}

function isLegacyStoredWorkbenchLayoutV2(
  value: unknown,
): value is LegacyStoredWorkbenchLayoutV2 {
  return (
    isRecord(value) &&
    value.version === 2 &&
    isSerializedDockview(value.dockview) &&
    isRecord(value.auxiliary)
  );
}

function isAuxiliaryLayoutState(
  value: unknown,
): value is AuxiliaryLayoutState {
  return (
    isRecord(value) &&
    value.version === 4 &&
    isRecord(value.groups) &&
    isRecord(value.slideouts)
  );
}

function isSerializedDockview(value: unknown): value is SerializedDockview {
  return isRecord(value) && isRecord(value.grid) && isRecord(value.panels);
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}
