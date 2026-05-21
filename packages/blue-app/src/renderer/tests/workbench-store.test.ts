import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDefaultAuxiliaryLayoutState } from '../components/workbench/auxiliary-layout';
import { useWorkbenchStore } from '../stores/workbench-store';
import { useUIStore } from '../stores/ui-store';
import { usePlaybackStore } from '../stores/playback-store';
import { useProjectStore } from '../stores/project-store';

const dockviewSnapshot = {
  grid: {
    root: { type: 'branch' },
    width: 1400,
    height: 900,
    orientation: 'horizontal',
  },
  panels: {},
  activeGroup: 'group-1',
} as any;

const dockviewApiStub = {
  getPanel: () => undefined,
  toJSON: () => dockviewSnapshot,
} as any;

const originalAddMarkerAtTime = useProjectStore.getState().addMarkerAtTime;

const markerMenuTransport = {
  renderStartTime: 8,
  renderEndTime: -1,
  loopRendering: false,
  tempoMap: {
    enabled: false,
    points: [{ beat: 0, tempo: 60, curveType: 'constant' }],
  },
  meterMap: {
    entries: [{ measure: 1, numBeats: 4, beatLength: 4, startBeat: 0 }],
  },
  sampleRate: 44100,
  smpteFrameRate: 24,
};

afterEach(() => {
  useWorkbenchStore.setState({
    api: null,
    auxiliary: createDefaultAuxiliaryLayoutState(),
  });
  useUIStore.setState({
    effectsLibraryOpen: false,
    effectsLibraryTarget: null,
  });
  usePlaybackStore.getState().reset();
  useProjectStore.setState({
    addMarkerAtTime: originalAddMarkerAtTime,
  });
});

describe('workbench store layout persistence', () => {
  it('serializes layout without mutating auxiliary state', () => {
    const auxiliary = createDefaultAuxiliaryLayoutState();

    useWorkbenchStore.setState({
      api: dockviewApiStub,
      auxiliary,
    });

    const serialized = useWorkbenchStore.getState().saveLayout();

    expect(serialized).not.toBeNull();
    expect(useWorkbenchStore.getState().auxiliary).toBe(auxiliary);
  });

  it('serializes with version 5 envelope', () => {
    useWorkbenchStore.setState({
      api: dockviewApiStub,
      auxiliary: createDefaultAuxiliaryLayoutState(),
    });

    const serialized = useWorkbenchStore.getState().saveLayout();
    const parsed = JSON.parse(serialized!);

    expect(parsed.version).toBe(5);
    expect(Array.isArray(parsed.auxiliary.groups)).toBe(true);
    expect(parsed.auxiliary.version).toBe(5);
  });
});

describe('workbench store move and reset actions', () => {
  it('finds the group instance ID for a panel', () => {
    useWorkbenchStore.setState({
      api: dockviewApiStub,
      auxiliary: createDefaultAuxiliaryLayoutState(),
    });

    const groupInstanceId = useWorkbenchStore
      .getState()
      .getAuxiliaryGroupForPanel('SoundObjectPropertiesTopComponent');

    expect(groupInstanceId).toBe('properties-main');
  });

  it('returns undefined for non-auxiliary panels', () => {
    useWorkbenchStore.setState({
      api: dockviewApiStub,
      auxiliary: createDefaultAuxiliaryLayoutState(),
    });

    const groupInstanceId = useWorkbenchStore
      .getState()
      .getAuxiliaryGroupForPanel('ScoreTopComponent');

    expect(groupInstanceId).toBeUndefined();
  });
});

describe('workbench store native menu commands', () => {
  it('routes focus-panel commands through openPanel', () => {
    const openPanel = vi.fn();
    useWorkbenchStore.setState({
      openPanel: openPanel as never,
      resetLayout: vi.fn() as never,
    });

    useWorkbenchStore.getState().handleNativeMenuCommand({
      type: 'focus-panel',
      panelId: 'ScoreTopComponent',
    });

    expect(openPanel).toHaveBeenCalledWith('ScoreTopComponent');
  });

  it('routes reset-layout commands through resetLayout', () => {
    const resetLayout = vi.fn();
    useWorkbenchStore.setState({
      openPanel: vi.fn() as never,
      resetLayout: resetLayout as never,
    });

    useWorkbenchStore.getState().handleNativeMenuCommand({
      type: 'reset-layout',
    });

    expect(resetLayout).toHaveBeenCalledOnce();
  });

  it('routes open-effects-library commands through the UI store', () => {
    useWorkbenchStore.setState({
      openPanel: vi.fn() as never,
      resetLayout: vi.fn() as never,
    });

    useWorkbenchStore.getState().handleNativeMenuCommand({
      type: 'open-effects-library',
    });

    expect(useUIStore.getState().effectsLibraryOpen).toBe(true);
  });

  it('adds menu-created markers at render start when idle', () => {
    const addMarkerAtTime = vi.fn();
    useProjectStore.setState({
      transport: markerMenuTransport,
      addMarkerAtTime: addMarkerAtTime as never,
    });

    useWorkbenchStore.getState().handleNativeMenuCommand({
      type: 'add-marker',
    });

    expect(addMarkerAtTime).toHaveBeenCalledWith(8);
  });

  it('adds menu-created markers at the live playhead while playing', () => {
    const addMarkerAtTime = vi.fn();
    useProjectStore.setState({
      transport: { ...markerMenuTransport, renderStartTime: 99 },
      addMarkerAtTime: addMarkerAtTime as never,
    });
    usePlaybackStore.setState({
      status: 'playing',
      isPlaying: true,
      clock: {
        sessionId: 1,
        sampleFrames: 0,
        sequence: 1,
        sampleRate: 44100,
        ksmps: 64,
        receivedAtMs: 0,
      },
      display: {
        sampleFrames: 88200,
        elapsedSeconds: 2,
        source: 'engine-authority',
      },
      transportAnchor: markerMenuTransport,
    });

    useWorkbenchStore.getState().handleNativeMenuCommand({
      type: 'add-marker',
    });

    expect(addMarkerAtTime).toHaveBeenCalledWith(10);
  });
});
