import { describe, expect, it } from 'vitest';
import {
  createDefaultAuxiliaryLayoutState,
  createStoredWorkbenchLayout,
  parseStoredWorkbenchLayout,
  recordAuxiliaryPanelSelection,
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
  it('parses the versioned workbench envelope and preserves auxiliary metadata', () => {
    const auxiliary = createDefaultAuxiliaryLayoutState();
    auxiliary.byEdge.right.activePanelId = 'MidiInputPanelTopComponent';

    const stored = createStoredWorkbenchLayout(legacyDockview, auxiliary);
    const parsed = parseStoredWorkbenchLayout(JSON.stringify(stored));

    expect(parsed.dockview).toEqual(legacyDockview);
    expect(parsed.auxiliary.byEdge.right.activePanelId).toBe(
      'MidiInputPanelTopComponent',
    );
  });

  it('treats legacy raw dockview JSON as a valid layout and seeds default auxiliary rails', () => {
    const parsed = parseStoredWorkbenchLayout(JSON.stringify(legacyDockview));

    expect(parsed.dockview).toEqual(legacyDockview);
    expect(parsed.auxiliary.byEdge.right.panelIds).toEqual([
      'SoundObjectPropertiesTopComponent',
      'MidiInputPanelTopComponent',
    ]);
    expect(parsed.auxiliary.byEdge.bottom.panelIds).toEqual([
      'ScoreObjectEditorTopComponent',
      'MixerTopComponent',
    ]);
  });

  it('routes newly opened properties panels onto the right auxiliary edge', () => {
    const next = recordAuxiliaryPanelSelection(
      createDefaultAuxiliaryLayoutState(),
      'MarkersTopComponent',
    );

    expect(next.byEdge.right.panelIds).toContain('MarkersTopComponent');
    expect(next.byEdge.right.activePanelId).toBe('MarkersTopComponent');
    expect(next.byEdge.bottom.activePanelId).toBe(
      'ScoreObjectEditorTopComponent',
    );
  });

  it('routes newly opened output panels onto the bottom auxiliary edge', () => {
    const next = recordAuxiliaryPanelSelection(
      createDefaultAuxiliaryLayoutState(),
      'VirtualKeyboardTopComponent',
    );

    expect(next.byEdge.bottom.panelIds).toContain('VirtualKeyboardTopComponent');
    expect(next.byEdge.bottom.activePanelId).toBe(
      'VirtualKeyboardTopComponent',
    );
    expect(next.byEdge.right.activePanelId).toBe(
      'SoundObjectPropertiesTopComponent',
    );
  });
});
