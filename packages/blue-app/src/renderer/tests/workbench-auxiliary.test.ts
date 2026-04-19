import { beforeEach, describe, expect, it } from 'vitest';
import {
  clampFloatingBounds,
  createDefaultAuxiliaryLayoutState,
  createStoredWorkbenchLayout,
  getAuxiliaryGroupIdForPanel,
  getMinimizedTabsForEdge,
  isAuxiliaryPanelId,
  parseStoredWorkbenchLayout,
} from '../components/workbench/auxiliary-layout';

const legacyDockview = {
  grid: {
    root: { type: 'branch' },
    height: 900,
    width: 1400,
    orientation: 'horizontal',
  },
  panels: {},
  activeGroup: 'group-1',
} as any;

describe('workbench auxiliary layout helpers', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        innerWidth: 1280,
        innerHeight: 800,
      },
    });
  });

  it('parses the versioned workbench envelope and preserves auxiliary metadata', () => {
    const auxiliary = createDefaultAuxiliaryLayoutState();
    auxiliary.groups['properties-main'].presentation = 'floating';
    auxiliary.groups['properties-main'].activePanelId =
      'MidiInputPanelTopComponent';

    const stored = createStoredWorkbenchLayout(legacyDockview, auxiliary);
    const parsed = parseStoredWorkbenchLayout(JSON.stringify(stored));

    expect(parsed.dockview).toEqual(legacyDockview);
    expect(parsed.auxiliary.groups['properties-main'].presentation).toBe(
      'floating',
    );
    expect(parsed.auxiliary.groups['properties-main'].activePanelId).toBe(
      'MidiInputPanelTopComponent',
    );
  });

  it('upgrades the legacy version 2 envelope into the group-based state model', () => {
    const legacy = {
      version: 2,
      dockview: legacyDockview,
      auxiliary: {
        byEdge: {
          right: {
            panelIds: [
              'SoundObjectPropertiesTopComponent',
              'MidiInputPanelTopComponent',
            ],
            activePanelId: 'MidiInputPanelTopComponent',
            size: 420,
          },
          bottom: {
            panelIds: [
              'ScoreObjectEditorTopComponent',
              'MixerTopComponent',
            ],
            activePanelId: 'MixerTopComponent',
            size: 260,
          },
        },
      },
    };

    const parsed = parseStoredWorkbenchLayout(JSON.stringify(legacy));

    expect(parsed.auxiliary.groups['properties-main'].activePanelId).toBe(
      'MidiInputPanelTopComponent',
    );
    expect(parsed.auxiliary.groups['properties-main'].dockedSize).toBe(420);
    expect(parsed.auxiliary.groups['output-main'].activePanelId).toBe(
      'MixerTopComponent',
    );
    expect(parsed.auxiliary.groups['output-main'].dockedSize).toBe(260);
  });

  it('limits the parity slice to the prototype auxiliary panels', () => {
    expect(getAuxiliaryGroupIdForPanel('SoundObjectPropertiesTopComponent')).toBe(
      'properties-main',
    );
    expect(getAuxiliaryGroupIdForPanel('ScoreObjectEditorTopComponent')).toBe(
      'output-main',
    );
    expect(getAuxiliaryGroupIdForPanel('MarkersTopComponent')).toBeUndefined();
    expect(isAuxiliaryPanelId('VirtualKeyboardTopComponent')).toBe(false);
  });

  it('derives minimized edge tabs from minimized group sessions', () => {
    const state = createDefaultAuxiliaryLayoutState();
    state.groups['properties-main'].presentation = 'minimized';
    state.groups['properties-main'].activePanelId = 'MidiInputPanelTopComponent';

    const tabs = getMinimizedTabsForEdge(state, 'right');

    expect(tabs.map((tab) => tab.panelId)).toEqual([
      'SoundObjectPropertiesTopComponent',
      'MidiInputPanelTopComponent',
    ]);
    expect(tabs.find((tab) => tab.panelId === 'MidiInputPanelTopComponent')?.isActivePanel).toBe(
      true,
    );
  });

  it('clamps invalid floating bounds into the current viewport', () => {
    const bounds = clampFloatingBounds({
      x: -300,
      y: 1200,
      width: 4000,
      height: 1200,
    });

    expect(bounds.x).toBe(0);
    expect(bounds.y).toBe(0);
    expect(bounds.width).toBe(1280);
    expect(bounds.height).toBe(800);
  });
});
