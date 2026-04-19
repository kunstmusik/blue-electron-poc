import { describe, expect, it } from 'vitest';
import {
  createDefaultAuxiliaryLayoutState,
  createStoredWorkbenchLayout,
  dockAuxiliaryPanel,
  getAuxiliaryGroupIdForPanel,
  getAuxiliaryPanelPresentation,
  getAuxiliarySlideoutForEdge,
  getMinimizedTabsForEdge,
  hideAuxiliarySlideout,
  isAuxiliaryPanelId,
  parseStoredWorkbenchLayout,
  resizeAuxiliarySlideout,
  toggleMinimizedAuxiliaryPanel,
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

function createDockviewApiStub() {
  const livePanels = new Map<string, any>();
  const group = {
    id: 'aux-properties',
    size: 360,
    panels: [] as any[],
    activePanel: undefined as any,
    focus: () => undefined,
    api: { setHeaderPosition: () => undefined },
    locked: true,
  };

  function insertPanel(panel: any, index: number) {
    const panels = [...group.panels];
    panels.splice(index, 0, panel);
    group.panels = panels;
  }

  return {
    panels: [{ id: 'ScoreTopComponent' }],
    addGroup: () => group,
    addPanel: ({
      id,
      inactive,
      position,
    }: {
      id: string;
      inactive?: boolean;
      position?: { index?: number };
    }) => {
      const panel = {
        id,
        api: {
          setActive: () => {
            group.activePanel = panel;
          },
          isMaximized: () => false,
          close: () => {
            livePanels.delete(id);
            group.panels = group.panels.filter((entry) => entry.id !== id);
            if (group.activePanel?.id === id) {
              group.activePanel = group.panels[0];
            }
          },
        },
        group,
      };

      livePanels.set(id, panel);
      insertPanel(panel, position?.index ?? group.panels.length);

      if (!inactive || !group.activePanel) {
        group.activePanel = panel;
      }

      return panel;
    },
    getPanel: (id: string) => livePanels.get(id),
    toJSON: () => legacyDockview,
  } as any;
}

describe('workbench auxiliary layout helpers', () => {
  it('parses the versioned workbench envelope and preserves per-tool metadata', () => {
    const auxiliary = createDefaultAuxiliaryLayoutState();
    auxiliary.groups['properties-main'].dockedPanelIds = [
      'MidiInputPanelTopComponent',
    ];
    auxiliary.groups['properties-main'].activePanelId =
      'SoundObjectPropertiesTopComponent';
    auxiliary.slideouts.right.openPanelId = 'SoundObjectPropertiesTopComponent';

    const stored = createStoredWorkbenchLayout(legacyDockview, auxiliary);
    const parsed = parseStoredWorkbenchLayout(JSON.stringify(stored));

    expect(parsed.dockview).toEqual(legacyDockview);
    expect(parsed.auxiliary.groups['properties-main'].dockedPanelIds).toEqual([
      'MidiInputPanelTopComponent',
    ]);
    expect(parsed.auxiliary.slideouts.right.openPanelId).toBe(
      'SoundObjectPropertiesTopComponent',
    );
  });

  it('upgrades the legacy version 3 group model into docked subsets plus slideouts', () => {
    const legacy = {
      version: 3,
      dockview: legacyDockview,
      auxiliary: {
        version: 3,
        groups: {
          'properties-main': {
            panelIds: [
              'SoundObjectPropertiesTopComponent',
              'MidiInputPanelTopComponent',
            ],
            activePanelId: 'MidiInputPanelTopComponent',
            presentation: 'floating',
            dockedSize: 380,
            floatingBounds: { width: 420 },
          },
        },
      },
    };

    const parsed = parseStoredWorkbenchLayout(JSON.stringify(legacy));

    expect(parsed.auxiliary.groups['properties-main'].dockedPanelIds).toEqual(
      [],
    );
    expect(parsed.auxiliary.groups['properties-main'].slideoutSize).toBe(420);
    expect(parsed.auxiliary.slideouts.right.openPanelId).toBe(
      'MidiInputPanelTopComponent',
    );
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

  it('derives minimized edge tabs and the active slideout panel from per-tool state', () => {
    const state = createDefaultAuxiliaryLayoutState();
    state.groups['properties-main'].dockedPanelIds = ['MidiInputPanelTopComponent'];
    state.slideouts.right.openPanelId = 'SoundObjectPropertiesTopComponent';

    const tabs = getMinimizedTabsForEdge(state, 'right');
    const slideout = getAuxiliarySlideoutForEdge(state, 'right');

    expect(tabs.map((tab) => tab.panelId)).toEqual([
      'SoundObjectPropertiesTopComponent',
    ]);
    expect(tabs[0]?.isActivePanel).toBe(true);
    expect(slideout?.panelId).toBe('SoundObjectPropertiesTopComponent');
    expect(getAuxiliaryPanelPresentation(state, 'MidiInputPanelTopComponent')).toBe(
      'docked',
    );
    expect(
      getAuxiliaryPanelPresentation(state, 'SoundObjectPropertiesTopComponent'),
    ).toBe('slideout');
  });

  it('toggles minimized tabs open and closed without mutating docked tools', () => {
    const state = createDefaultAuxiliaryLayoutState();
    state.groups['properties-main'].dockedPanelIds = ['MidiInputPanelTopComponent'];

    const opened = toggleMinimizedAuxiliaryPanel(
      state,
      'SoundObjectPropertiesTopComponent',
    );
    const closed = toggleMinimizedAuxiliaryPanel(
      opened,
      'SoundObjectPropertiesTopComponent',
    );

    expect(opened.slideouts.right.openPanelId).toBe(
      'SoundObjectPropertiesTopComponent',
    );
    expect(opened.groups['properties-main'].dockedPanelIds).toEqual([
      'MidiInputPanelTopComponent',
    ]);
    expect(closed.slideouts.right.openPanelId).toBeUndefined();
  });

  it('docks a single slid-out tool without restoring the whole group', () => {
    const state = createDefaultAuxiliaryLayoutState();
    state.groups['properties-main'].dockedPanelIds = ['MidiInputPanelTopComponent'];
    state.slideouts.right.openPanelId = 'SoundObjectPropertiesTopComponent';

    const api = createDockviewApiStub();

    const next = dockAuxiliaryPanel(
      api,
      state,
      'SoundObjectPropertiesTopComponent',
    );

    expect(next.groups['properties-main'].dockedPanelIds).toEqual([
      'SoundObjectPropertiesTopComponent',
      'MidiInputPanelTopComponent',
    ]);
    expect(next.slideouts.right.openPanelId).toBeUndefined();
  });

  it('updates slideout sizing and clearing independently of Dockview state', () => {
    const state = createDefaultAuxiliaryLayoutState();
    state.groups['properties-main'].dockedPanelIds = ['MidiInputPanelTopComponent'];
    state.slideouts.right.openPanelId = 'SoundObjectPropertiesTopComponent';

    const resized = resizeAuxiliarySlideout(
      state,
      'SoundObjectPropertiesTopComponent',
      512,
    );
    const hidden = hideAuxiliarySlideout(resized, 'right');

    expect(resized.groups['properties-main'].slideoutSize).toBe(512);
    expect(hidden.slideouts.right.openPanelId).toBeUndefined();
  });
});
