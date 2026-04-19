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

export type AuxiliaryEdge = 'right' | 'bottom';
type AuxiliaryPanelMode = Extract<PanelMode, 'properties' | 'output'>;
export type AuxiliaryGroupId = 'properties-main' | 'output-main';
export type AuxiliaryPresentation = 'docked' | 'minimized' | 'floating' | 'maximized';
type NonMinimizedPresentation = Exclude<AuxiliaryPresentation, 'minimized'>;

interface AuxiliaryGroupDefinition {
  id: AuxiliaryGroupId;
  mode: AuxiliaryPanelMode;
  edge: AuxiliaryEdge;
  dockDirection: 'right' | 'below';
  dockviewGroupId: string;
  panelIds: string[];
  defaultActivePanelId: string;
  defaultDockedSize: number;
  defaultFloatingBounds: AuxiliaryFloatingBounds;
}

export interface AuxiliaryFloatingBounds {
  x: number;
  y: number;
  width: number;
  height: number;
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
  activePanelId: string;
  presentation: AuxiliaryPresentation;
  lastNonMinimizedPresentation: NonMinimizedPresentation;
  dockedSize: number;
  floatingBounds: AuxiliaryFloatingBounds;
  dockviewGroupId?: string;
}

export interface AuxiliaryLayoutState {
  version: 3;
  groups: Record<AuxiliaryGroupId, AuxiliaryGroupSession>;
}

export interface StoredWorkbenchLayout {
  version: 3;
  dockview: SerializedDockview;
  auxiliary: AuxiliaryLayoutState;
}

interface LegacyAuxiliaryEdgeState {
  panelIds: string[];
  activePanelId: string;
  size?: number;
}

interface LegacyAuxiliaryLayoutState {
  byEdge?: Partial<Record<AuxiliaryEdge, LegacyAuxiliaryEdgeState>>;
}

interface LegacyStoredWorkbenchLayout {
  version: 2;
  dockview: SerializedDockview;
  auxiliary: LegacyAuxiliaryLayoutState;
}

const AUXILIARY_GROUP_ORDER: AuxiliaryGroupId[] = [
  'properties-main',
  'output-main',
];

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
    defaultFloatingBounds: {
      x: 120,
      y: 96,
      width: 420,
      height: 620,
    },
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
    defaultFloatingBounds: {
      x: 96,
      y: 220,
      width: 760,
      height: 320,
    },
  },
};

const FALLBACK_FLOATING_BOUNDS: AuxiliaryFloatingBounds = {
  x: 64,
  y: 64,
  width: 420,
  height: 320,
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
  return getAuxiliaryGroupIdForPanel(panelId)
    ? AUXILIARY_GROUP_DEFINITIONS[
        getAuxiliaryGroupIdForPanel(panelId) as AuxiliaryGroupId
      ].edge
    : undefined;
}

export function isAuxiliaryPanelId(panelId: string): boolean {
  return getAuxiliaryGroupIdForPanel(panelId) !== undefined;
}

export function getMinimizedTabsForEdge(
  state: AuxiliaryLayoutState,
  edge: AuxiliaryEdge,
): MinimizedTabState[] {
  const tabs: MinimizedTabState[] = [];

  for (const groupId of AUXILIARY_GROUP_ORDER) {
    const session = state.groups[groupId];
    if (session.edge !== edge || session.presentation !== 'minimized') {
      continue;
    }

    session.panelIds.forEach((panelId, order) => {
      tabs.push({
        groupId,
        panelId,
        edge,
        order,
        isActivePanel: panelId === session.activePanelId,
      });
    });
  }

  return tabs;
}

export function createDefaultAuxiliaryLayoutState(): AuxiliaryLayoutState {
  return {
    version: 3,
    groups: {
      'properties-main': createDefaultGroupSession('properties-main'),
      'output-main': createDefaultGroupSession('output-main'),
    },
  };
}

export function cloneAuxiliaryLayoutState(
  state: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  return {
    version: 3,
    groups: {
      'properties-main': cloneGroupSession(state.groups['properties-main']),
      'output-main': cloneGroupSession(state.groups['output-main']),
    },
  };
}

export function createStoredWorkbenchLayout(
  dockview: SerializedDockview,
  auxiliary: AuxiliaryLayoutState,
): StoredWorkbenchLayout {
  return {
    version: 3,
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

    if (isLegacyStoredWorkbenchLayout(parsed)) {
      return {
        dockview: parsed.dockview,
        auxiliary: upgradeLegacyAuxiliaryLayoutState(parsed.auxiliary),
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

  for (const groupId of AUXILIARY_GROUP_ORDER) {
    if (next.groups[groupId].presentation === 'maximized') {
      maximizeQueue.push(groupId);
      applyAuxiliaryGroupPresentation(api, {
        ...next.groups[groupId],
        presentation: 'docked',
      });
      continue;
    }

    applyAuxiliaryGroupPresentation(api, next.groups[groupId]);
  }

  for (const groupId of maximizeQueue) {
    focusDockviewPanel(api, next.groups[groupId].activePanelId);
    api.getPanel(next.groups[groupId].activePanelId)?.api.maximize();
  }

  return syncAuxiliaryLayoutFromApi(api, next);
}

export function focusAuxiliaryPanel(
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

  if (session.presentation === 'minimized') {
    session.presentation = 'floating';
    session.lastNonMinimizedPresentation = 'floating';
    const applied = applyAuxiliaryLayout(api, next);
    focusDockviewPanel(api, panelId);
    return syncAuxiliaryLayoutFromApi(api, applied);
  }

  if (!api.getPanel(panelId)) {
    const applied = applyAuxiliaryLayout(api, next);
    focusDockviewPanel(api, panelId);
    return syncAuxiliaryLayoutFromApi(api, applied);
  }

  focusDockviewPanel(api, panelId);
  return syncAuxiliaryLayoutFromApi(api, next);
}

export function minimizeAuxiliaryGroupLayout(
  api: DockviewApi,
  state: AuxiliaryLayoutState,
  groupId: AuxiliaryGroupId,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  const session = next.groups[groupId];

  if (session.presentation !== 'minimized') {
    session.lastNonMinimizedPresentation = session.presentation;
  }

  session.presentation = 'minimized';
  return applyAuxiliaryLayout(api, next);
}

export function maximizeAuxiliaryGroupLayout(
  api: DockviewApi,
  state: AuxiliaryLayoutState,
  groupId: AuxiliaryGroupId,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  const session = next.groups[groupId];
  session.presentation = 'maximized';
  session.lastNonMinimizedPresentation = 'maximized';
  const applied = applyAuxiliaryLayout(api, next);
  focusDockviewPanel(api, applied.groups[groupId].activePanelId);
  return syncAuxiliaryLayoutFromApi(api, applied);
}

export function restoreAuxiliaryGroupLayout(
  api: DockviewApi,
  state: AuxiliaryLayoutState,
  groupId: AuxiliaryGroupId,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(state));
  const session = next.groups[groupId];
  session.presentation = 'docked';
  session.lastNonMinimizedPresentation = 'docked';
  const applied = applyAuxiliaryLayout(api, next);
  focusDockviewPanel(api, applied.groups[groupId].activePanelId);
  return syncAuxiliaryLayoutFromApi(api, applied);
}

export function syncAuxiliaryLayoutFromApi(
  api: DockviewApi,
  fallback: AuxiliaryLayoutState,
): AuxiliaryLayoutState {
  const next = cloneAuxiliaryLayoutState(normalizeAuxiliaryLayoutState(fallback));
  const serialized = api.toJSON();

  for (const groupId of AUXILIARY_GROUP_ORDER) {
    const session = next.groups[groupId];
    const liveGroup = getLiveAuxiliaryGroup(api, session.panelIds);

    if (!liveGroup) {
      session.dockviewGroupId = undefined;
      continue;
    }

    const livePanelIds = liveGroup.panels
      .map((panel) => panel.id)
      .filter((panelId) =>
        AUXILIARY_GROUP_DEFINITIONS[groupId].panelIds.includes(panelId),
      );

    if (livePanelIds.length > 0) {
      session.panelIds = livePanelIds;
    }

    session.activePanelId =
      liveGroup.activePanel?.id ?? livePanelIds[0] ?? session.activePanelId;
    session.dockviewGroupId = liveGroup.id;

    const activePanel =
      api.getPanel(session.activePanelId) ?? liveGroup.panels[0];

    if (activePanel?.api.isMaximized()) {
      session.presentation = 'maximized';
      session.lastNonMinimizedPresentation = 'maximized';
    } else if (activePanel?.api.location.type === 'floating') {
      session.presentation = 'floating';
      session.lastNonMinimizedPresentation = 'floating';
    } else {
      session.presentation = 'docked';
      session.lastNonMinimizedPresentation = 'docked';
      if (Number.isFinite(liveGroup.size)) {
        session.dockedSize = liveGroup.size;
      }
    }

    const floatingBounds = getFloatingBoundsForPanelIds(
      serialized,
      session.panelIds,
    );
    if (floatingBounds) {
      session.floatingBounds = floatingBounds;
    }
  }

  return normalizeAuxiliaryLayoutState(next);
}

export function clampFloatingBounds(
  bounds: Partial<AuxiliaryFloatingBounds> | undefined,
): AuxiliaryFloatingBounds {
  const viewportWidth =
    typeof window === 'undefined' ? 1440 : Math.max(window.innerWidth, 480);
  const viewportHeight =
    typeof window === 'undefined' ? 900 : Math.max(window.innerHeight, 320);

  const width = clampNumber(bounds?.width ?? FALLBACK_FLOATING_BOUNDS.width, {
    minimum: 280,
    maximum: viewportWidth,
  });
  const height = clampNumber(bounds?.height ?? FALLBACK_FLOATING_BOUNDS.height, {
    minimum: 180,
    maximum: viewportHeight,
  });
  const x = clampNumber(bounds?.x ?? FALLBACK_FLOATING_BOUNDS.x, {
    minimum: 0,
    maximum: Math.max(0, viewportWidth - width),
  });
  const y = clampNumber(bounds?.y ?? FALLBACK_FLOATING_BOUNDS.y, {
    minimum: 0,
    maximum: Math.max(0, viewportHeight - height),
  });

  return { x, y, width, height };
}

function applyAuxiliaryGroupPresentation(
  api: DockviewApi,
  session: AuxiliaryGroupSession,
) {
  clearLiveAuxiliaryPanels(api, session.panelIds);

  if (session.presentation === 'minimized') {
    session.dockviewGroupId = undefined;
    return;
  }

  if (session.presentation === 'floating') {
    const group = createFloatingPresentation(api, session);
    session.dockviewGroupId = group?.id;
    return;
  }

  const group = createDockedPresentation(api, session);
  session.dockviewGroupId = group?.id;
}

function createDockedPresentation(
  api: DockviewApi,
  session: AuxiliaryGroupSession,
): DockviewGroupPanel | undefined {
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
    ...(definition.edge === 'right'
      ? { initialWidth: session.dockedSize }
      : { initialHeight: session.dockedSize }),
  }) as DockviewGroupPanel;

  group.locked = true;
  group.api.setHeaderPosition('top');
  mountAuxiliaryPanelsIntoGroup(api, group, session);
  focusDockviewPanel(api, session.activePanelId);
  return group;
}

function createFloatingPresentation(
  api: DockviewApi,
  session: AuxiliaryGroupSession,
): DockviewGroupPanel | undefined {
  const [firstPanelId] = session.panelIds;
  const descriptor = getPanel(firstPanelId);
  if (!descriptor) {
    return undefined;
  }

  const bounds = clampFloatingBounds(session.floatingBounds);
  api.addPanel({
    id: firstPanelId,
    component: 'default',
    title: descriptor.title,
    floating: {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    },
    inactive: firstPanelId !== session.activePanelId,
  });

  const group = api.getPanel(firstPanelId)?.group as DockviewGroupPanel | undefined;
  if (!group) {
    return undefined;
  }

  group.locked = true;
  group.api.setHeaderPosition('top');
  mountAuxiliaryPanelsIntoGroup(api, group, session, firstPanelId);
  focusDockviewPanel(api, session.activePanelId);
  return group;
}

function mountAuxiliaryPanelsIntoGroup(
  api: DockviewApi,
  group: DockviewGroupPanel,
  session: AuxiliaryGroupSession,
  skipFirstPanelId?: string,
) {
  session.panelIds.forEach((panelId, index) => {
    if (panelId === skipFirstPanelId) {
      return;
    }

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
      inactive: panelId !== session.activePanelId,
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

    const panelIds = unique(
      (candidate.panelIds ?? []).filter((panelId) =>
        definition.panelIds.includes(panelId),
      ),
    );

    if (panelIds.length > 0) {
      fallback.panelIds = panelIds;
    }

    fallback.activePanelId = fallback.panelIds.includes(candidate.activePanelId)
      ? candidate.activePanelId
      : fallback.panelIds[0];

    fallback.presentation = isAuxiliaryPresentation(candidate.presentation)
      ? candidate.presentation
      : fallback.presentation;

    fallback.lastNonMinimizedPresentation = isNonMinimizedPresentation(
      candidate.lastNonMinimizedPresentation,
    )
      ? candidate.lastNonMinimizedPresentation
      : fallback.lastNonMinimizedPresentation;

    if (fallback.presentation !== 'minimized') {
      fallback.lastNonMinimizedPresentation = fallback.presentation;
    }

    if (Number.isFinite(candidate.dockedSize)) {
      fallback.dockedSize = candidate.dockedSize;
    }

    fallback.floatingBounds = clampFloatingBounds(candidate.floatingBounds);

    if (typeof candidate.dockviewGroupId === 'string') {
      fallback.dockviewGroupId = candidate.dockviewGroupId;
    }
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
    activePanelId: definition.defaultActivePanelId,
    presentation: 'docked',
    lastNonMinimizedPresentation: 'docked',
    dockedSize: definition.defaultDockedSize,
    floatingBounds: clampFloatingBounds(definition.defaultFloatingBounds),
  };
}

function cloneGroupSession(session: AuxiliaryGroupSession): AuxiliaryGroupSession {
  return {
    ...session,
    panelIds: [...session.panelIds],
    floatingBounds: { ...session.floatingBounds },
  };
}

function upgradeLegacyAuxiliaryLayoutState(
  legacy: LegacyAuxiliaryLayoutState,
): AuxiliaryLayoutState {
  const next = createDefaultAuxiliaryLayoutState();

  const right = legacy.byEdge?.right;
  if (right) {
    const session = next.groups['properties-main'];
    const panelIds = unique(
      right.panelIds.filter((panelId) =>
        AUXILIARY_GROUP_DEFINITIONS['properties-main'].panelIds.includes(panelId),
      ),
    );
    if (panelIds.length > 0) {
      session.panelIds = panelIds;
    }
    session.activePanelId = session.panelIds.includes(right.activePanelId)
      ? right.activePanelId
      : session.panelIds[0];
    if (Number.isFinite(right.size)) {
      session.dockedSize = right.size;
    }
  }

  const bottom = legacy.byEdge?.bottom;
  if (bottom) {
    const session = next.groups['output-main'];
    const panelIds = unique(
      bottom.panelIds.filter((panelId) =>
        AUXILIARY_GROUP_DEFINITIONS['output-main'].panelIds.includes(panelId),
      ),
    );
    if (panelIds.length > 0) {
      session.panelIds = panelIds;
    }
    session.activePanelId = session.panelIds.includes(bottom.activePanelId)
      ? bottom.activePanelId
      : session.panelIds[0];
    if (Number.isFinite(bottom.size)) {
      session.dockedSize = bottom.size;
    }
  }

  return next;
}

function getFloatingBoundsForPanelIds(
  dockview: SerializedDockview,
  panelIds: string[],
): AuxiliaryFloatingBounds | undefined {
  const signature = unique(panelIds).sort().join('|');

  for (const floatingGroup of dockview.floatingGroups ?? []) {
    const views = unique(floatingGroup.data.views ?? []).sort().join('|');
    if (views !== signature) {
      continue;
    }

    return anchoredBoxToFloatingBounds(floatingGroup.position);
  }

  return undefined;
}

function anchoredBoxToFloatingBounds(
  bounds: Record<string, unknown>,
): AuxiliaryFloatingBounds {
  const viewportWidth =
    typeof window === 'undefined' ? 1440 : Math.max(window.innerWidth, 480);
  const viewportHeight =
    typeof window === 'undefined' ? 900 : Math.max(window.innerHeight, 320);

  const width = asFiniteNumber(bounds.width, FALLBACK_FLOATING_BOUNDS.width);
  const height = asFiniteNumber(bounds.height, FALLBACK_FLOATING_BOUNDS.height);
  const x = 'left' in bounds
    ? asFiniteNumber(bounds.left, FALLBACK_FLOATING_BOUNDS.x)
    : viewportWidth -
        asFiniteNumber(bounds.right, viewportWidth - FALLBACK_FLOATING_BOUNDS.x) -
        width;
  const y = 'top' in bounds
    ? asFiniteNumber(bounds.top, FALLBACK_FLOATING_BOUNDS.y)
    : viewportHeight -
        asFiniteNumber(
          bounds.bottom,
          viewportHeight - FALLBACK_FLOATING_BOUNDS.y,
        ) -
        height;

  return clampFloatingBounds({ x, y, width, height });
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

function asFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function isStoredWorkbenchLayout(
  value: unknown,
): value is StoredWorkbenchLayout {
  return (
    isRecord(value) &&
    value.version === 3 &&
    isSerializedDockview(value.dockview) &&
    isAuxiliaryLayoutState(value.auxiliary)
  );
}

function isLegacyStoredWorkbenchLayout(
  value: unknown,
): value is LegacyStoredWorkbenchLayout {
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
  return isRecord(value) && value.version === 3 && isRecord(value.groups);
}

function isSerializedDockview(value: unknown): value is SerializedDockview {
  return isRecord(value) && isRecord(value.grid) && isRecord(value.panels);
}

function isAuxiliaryPresentation(
  value: unknown,
): value is AuxiliaryPresentation {
  return (
    value === 'docked' ||
    value === 'minimized' ||
    value === 'floating' ||
    value === 'maximized'
  );
}

function isNonMinimizedPresentation(
  value: unknown,
): value is NonMinimizedPresentation {
  return value === 'docked' || value === 'floating' || value === 'maximized';
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}
