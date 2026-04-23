import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDefaultAuxiliaryLayoutState } from '../components/workbench/auxiliary-layout';
import { useWorkbenchStore } from '../stores/workbench-store';

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

afterEach(() => {
  useWorkbenchStore.setState({
    api: null,
    auxiliary: createDefaultAuxiliaryLayoutState(),
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
});
