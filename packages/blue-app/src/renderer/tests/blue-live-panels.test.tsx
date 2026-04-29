// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LiveSpaceTab from '../components/workbench/panels/blue-live/LiveSpaceTab';
import LiveCodeTab from '../components/workbench/panels/blue-live/LiveCodeTab';
import OptionsTab from '../components/workbench/panels/blue-live/OptionsTab';
import { useProjectStore } from '../stores/project-store';
import { createEmptyProjectEditorSnapshot } from '../../shared/project-editor';
import type { BlueLiveProjectSnapshot } from '../../shared/project-editor';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function makeBlueLiveSnapshot(): BlueLiveProjectSnapshot {
  return {
    tempo: 120,
    repeat: 4,
    repeatEnabled: false,
    commandLine: '',
    commandLineEnabled: false,
    commandLineOverride: false,
    liveCodeText: '',
    bins: {
      rows: 2,
      columns: 3,
      cells: [
        [
          { uniqueId: 'obj1', displayName: 'OSC1', enabled: true, keyTrigger: 0, midiTrigger: 0, soundObjectType: 'generic', hasSoundObject: true },
          { uniqueId: 'obj2', displayName: 'OSC2', enabled: false, keyTrigger: 0, midiTrigger: 0, soundObjectType: 'generic', hasSoundObject: true },
        ],
        [
          null,
          { uniqueId: 'obj3', displayName: 'FX1', enabled: false, keyTrigger: 0, midiTrigger: 0, soundObjectType: 'generic', hasSoundObject: true },
        ],
        [
          { uniqueId: 'obj4', displayName: 'SUB1', enabled: true, keyTrigger: 0, midiTrigger: 0, soundObjectType: 'generic', hasSoundObject: true },
          null,
        ],
      ],
    },
    sets: [
      { name: 'Set A', liveObjectIds: ['obj1', 'obj4'] },
      { name: 'Set B', liveObjectIds: ['obj2'] },
    ],
  };
}

function seedProject(blueLive?: BlueLiveProjectSnapshot): void {
  const snapshot = createEmptyProjectEditorSnapshot();
  useProjectStore.getState().setProjectInfo({
    title: 'BlueLive Test',
    author: 'Test',
    sampleRate: '44100',
    version: '2.10.0',
    filePath: '/test.blue',
    loaded: true,
    globalOrc: snapshot.globalOrc,
    globalSco: snapshot.globalSco,
    orchestra: { ...snapshot.orchestra, loaded: true },
    projectProperties: snapshot.projectProperties,
    transport: snapshot.transport,
  });

  if (blueLive) {
    useProjectStore.setState({ blueLive });
  }
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  useProjectStore.getState().clearProject();
});

afterEach(() => {
  act(() => { root.unmount(); });
  container.remove();
});

describe('Blue Live panel tab render tests (T045)', () => {
  it('LiveSpaceTab renders no-project message without project', () => {
    act(() => {
      root.render(<LiveSpaceTab />);
    });
    expect(container.textContent).toContain('No project loaded');
  });

  it('LiveSpaceTab renders grid with project loaded', () => {
    seedProject(makeBlueLiveSnapshot());
    act(() => {
      root.render(<LiveSpaceTab />);
    });
    expect(container.textContent).toContain('Saved Sets');
    expect(container.textContent).toContain('OSC1');
    expect(container.textContent).toContain('FX1');
  });

  it('LiveCodeTab renders no-project message without project', () => {
    act(() => {
      root.render(<LiveCodeTab />);
    });
    expect(container.textContent).toContain('No project loaded');
  });

  it('LiveCodeTab renders editor with project loaded', () => {
    seedProject(makeBlueLiveSnapshot());
    act(() => {
      root.render(<LiveCodeTab />);
    });
    expect(container.textContent).toContain('Live Code');
  });

  it('OptionsTab renders no-project message without project', () => {
    act(() => {
      root.render(<OptionsTab />);
    });
    expect(container.textContent).toContain('No project loaded');
  });

  it('OptionsTab renders form with project loaded', () => {
    seedProject(makeBlueLiveSnapshot());
    act(() => {
      root.render(<OptionsTab />);
    });
    expect(container.textContent).toContain('Command Line');
    expect(container.textContent).toContain('Command Line Enabled');
  });

  it('LiveSpaceTab renders toolbar buttons', () => {
    seedProject(makeBlueLiveSnapshot());
    act(() => {
      root.render(<LiveSpaceTab />);
    });
    const buttons = container.querySelectorAll('button');
    const texts = Array.from(buttons).map((b) => b.textContent);
    expect(texts).toContain('Repeat');
    expect(texts).toContain('Trigger');
  });

  it('LiveSpaceTab renders saved sets', () => {
    seedProject(makeBlueLiveSnapshot());
    act(() => {
      root.render(<LiveSpaceTab />);
    });
    expect(container.textContent).toContain('Set A');
    expect(container.textContent).toContain('Set B');
  });

  it('LiveSpaceTab renders row/column controls', () => {
    seedProject(makeBlueLiveSnapshot());
    act(() => {
      root.render(<LiveSpaceTab />);
    });
    expect(container.textContent).toContain('+Row Top');
    expect(container.textContent).toContain('+Col Left');
  });
});

describe('Live Space grid action tests (T046)', () => {
  it('setCellEnabled patch toggles enabled on a cell', () => {
    seedProject(makeBlueLiveSnapshot());
    const before = useProjectStore.getState().blueLive!;
    expect(before.bins.cells[0][0]!.enabled).toBe(true);

    useProjectStore.getState().applyBlueLivePatch({ type: 'setCellEnabled', column: 0, row: 0, enabled: false });

    const after = useProjectStore.getState().blueLive!;
    expect(after.bins.cells[0][0]!.enabled).toBe(false);
  });

  it('insertRow adds a row of null cells', () => {
    seedProject(makeBlueLiveSnapshot());
    const before = useProjectStore.getState().blueLive!;
    expect(before.bins.rows).toBe(2);

    useProjectStore.getState().applyBlueLivePatch({ type: 'insertRow', index: 0 });

    const after = useProjectStore.getState().blueLive!;
    expect(after.bins.rows).toBe(3);
    expect(after.bins.cells[0].length).toBe(3);
  });

  it('removeRow removes the last row', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'removeRow', index: 1 });

    const after = useProjectStore.getState().blueLive!;
    expect(after.bins.rows).toBe(1);
  });

  it('insertColumn adds a column of null cells', () => {
    seedProject(makeBlueLiveSnapshot());
    const before = useProjectStore.getState().blueLive!;
    expect(before.bins.columns).toBe(3);

    useProjectStore.getState().applyBlueLivePatch({ type: 'insertColumn', index: 0 });

    const after = useProjectStore.getState().blueLive!;
    expect(after.bins.columns).toBe(4);
  });

  it('removeColumn removes the last column', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'removeColumn', index: 2 });

    const after = useProjectStore.getState().blueLive!;
    expect(after.bins.columns).toBe(2);
  });

  it('moveSet reorders saved sets', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'moveSet', from: 0, to: 1 });

    const after = useProjectStore.getState().blueLive!;
    expect(after.sets[0].name).toBe('Set B');
    expect(after.sets[1].name).toBe('Set A');
  });

  it('removeSet removes a saved set', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'removeSet', index: 0 });

    const after = useProjectStore.getState().blueLive!;
    expect(after.sets).toHaveLength(1);
    expect(after.sets[0].name).toBe('Set B');
  });
});

describe('Live Code editor persistence tests (T047)', () => {
  it('updateLiveCodeText patch persists to store', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'updateLiveCodeText', text: 'instr 1\n  out aSignal\nendin' });

    const after = useProjectStore.getState().blueLive!;
    expect(after.liveCodeText).toBe('instr 1\n  out aSignal\nendin');
  });

  it('updateLiveCodeText with empty string', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'updateLiveCodeText', text: '' });

    const after = useProjectStore.getState().blueLive!;
    expect(after.liveCodeText).toBe('');
  });
});

describe('Options tab patch tests (T048)', () => {
  it('updateOptions patch for commandLine', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'updateOptions', patch: { commandLine: '-b512' } });

    const after = useProjectStore.getState().blueLive!;
    expect(after.commandLine).toBe('-b512');
  });

  it('updateOptions patch for commandLineEnabled', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'updateOptions', patch: { commandLineEnabled: true } });

    const after = useProjectStore.getState().blueLive!;
    expect(after.commandLineEnabled).toBe(true);
  });

  it('updateOptions patch for commandLineOverride', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'updateOptions', patch: { commandLineOverride: true } });

    const after = useProjectStore.getState().blueLive!;
    expect(after.commandLineOverride).toBe(true);
  });

  it('updateTempoRepeat patch for tempo', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'updateTempoRepeat', patch: { tempo: 140 } });

    const after = useProjectStore.getState().blueLive!;
    expect(after.tempo).toBe(140);
  });

  it('updateTempoRepeat patch for repeat', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'updateTempoRepeat', patch: { repeat: 8 } });

    const after = useProjectStore.getState().blueLive!;
    expect(after.repeat).toBe(8);
  });

  it('updateTempoRepeat patch for repeatEnabled', () => {
    seedProject(makeBlueLiveSnapshot());
    useProjectStore.getState().applyBlueLivePatch({ type: 'updateTempoRepeat', patch: { repeatEnabled: true } });

    const after = useProjectStore.getState().blueLive!;
    expect(after.repeatEnabled).toBe(true);
  });
});

describe('Blue Live trigger routing tests (T049)', () => {
  it('trigger button shows the not yet implemented alert', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    seedProject(makeBlueLiveSnapshot());
    act(() => {
      root.render(<LiveSpaceTab />);
    });

    const buttons = container.querySelectorAll('button');
    const triggerBtn = Array.from(buttons).find((b) => b.textContent === 'Trigger');
    expect(triggerBtn).toBeTruthy();
    triggerBtn!.click();
    expect(alertSpy).toHaveBeenCalledWith('not yet implemented');

    alertSpy.mockRestore();
  });
});
