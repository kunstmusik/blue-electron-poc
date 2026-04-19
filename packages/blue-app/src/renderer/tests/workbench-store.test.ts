import { afterEach, describe, expect, it } from 'vitest';
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
});
