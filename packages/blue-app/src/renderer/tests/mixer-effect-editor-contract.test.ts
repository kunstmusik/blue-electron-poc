// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Effect } from '@blue/data';
import EffectEditorPage from '../components/effect-editor/EffectEditorPage';
import {
  createEffectEditorSnapshot,
  type EffectEditorPatchRequest,
  type EffectEditorSnapshot,
} from '../../shared/project-editor';

declare global {
  interface Window {
    blueAPI: {
      getEffectEditorDocument: (request: unknown) => Promise<EffectEditorSnapshot | null>;
      updateEffectEditorDocument: (request: EffectEditorPatchRequest) => Promise<EffectEditorSnapshot | null>;
      openEffectEditor: (request: unknown) => Promise<unknown> | unknown;
    };
  }
}

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('../components/workbench/panels/orchestra/bsb/BSBInterfaceEditor', () => ({
  default: ({
    instrument,
    onInstrumentPatch,
  }: {
    instrument: { name: string };
    onInstrumentPatch: (patch: { bsbInterface: { type: 'setEditEnabled'; value: boolean } }) => void;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'bsb-interface-editor' },
      React.createElement('span', null, instrument.name),
      React.createElement(
        'button',
        {
          type: 'button',
          onClick: () => onInstrumentPatch({ bsbInterface: { type: 'setEditEnabled', value: false } }),
        },
        'Toggle edit mode',
      ),
    ),
}));

vi.mock('../components/workbench/panels/editors/SelectedCodeEditor', () => ({
  default: ({
    value,
    onChange,
    ariaLabel,
  }: {
    value: string;
    onChange: (value: string) => void;
    ariaLabel: string;
  }) =>
    React.createElement(
      'div',
      null,
      React.createElement(
        'label',
        null,
        React.createElement('span', null, ariaLabel),
        React.createElement('textarea', { 'aria-label': ariaLabel, value, readOnly: true }),
      ),
      React.createElement(
        'button',
        { type: 'button', onClick: () => onChange('aout = ain * 0.5') },
        'Apply code',
      ),
    ),
}));

vi.mock('../components/workbench/panels/udo/UdoWorkspacePanel', () => ({
  default: () => React.createElement('div', { 'data-testid': 'udo-workspace-panel' }),
}));

vi.mock('../hooks/use-udo-callbacks', () => ({
  useUdoCallbacks: () => ({}),
}));

function createLoadedSnapshot(code = 'aout = ain'): EffectEditorSnapshot {
  const effect = new Effect();
  effect.setName('Delay');
  effect.setComments('Original note');
  effect.setCode(code);
  effect.setEnabled(true);
  effect.setNumIns(1);
  effect.setNumOuts(1);

  return createEffectEditorSnapshot(effect, 'fx-1', 'project', {
    projectRef: {
      channelId: 'channel-1',
      chain: 'pre',
      entryId: 'fx-1',
    },
  });
}

function renderPage(): { container: HTMLDivElement; root: Root } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(React.createElement(EffectEditorPage));
  });

  return { container, root };
}

beforeEach(() => {
  window.history.replaceState(
    {},
    '',
    '/effect-editor.html?ownerType=project&effectId=fx-1&channelId=channel-1&chain=pre&entryId=fx-1',
  );

  const snapshot = createLoadedSnapshot();
  let currentSnapshot = snapshot;

  window.blueAPI = {
    getEffectEditorDocument: vi.fn().mockImplementation(async () => currentSnapshot),
    updateEffectEditorDocument: vi.fn().mockImplementation(async (request: EffectEditorPatchRequest) => {
      currentSnapshot = {
        ...currentSnapshot,
        ...request.patch,
      } as EffectEditorSnapshot;
      return currentSnapshot;
    }),
    openEffectEditor: vi.fn().mockResolvedValue(undefined),
  };
});

afterEach(() => {
  window.history.replaceState({}, '', '/');
  delete window.blueAPI;
});

describe('project effect editor contract', () => {
  it('round-trips code edits for a project-owned effect through the projectRef bridge', async () => {
    const { container, root } = renderPage();

    await act(async () => {
      await Promise.resolve();
    });

    expect(window.blueAPI.openEffectEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: 'project',
        effectId: 'fx-1',
        projectRef: {
          channelId: 'channel-1',
          chain: 'pre',
          entryId: 'fx-1',
        },
      }),
    );
    expect(window.blueAPI.getEffectEditorDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: 'project',
        effectId: 'fx-1',
        projectRef: {
          channelId: 'channel-1',
          chain: 'pre',
          entryId: 'fx-1',
        },
      }),
    );
    expect(document.title).toBe('Delay - Effect Editor');

    const codeTab = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Code',
    ) as HTMLButtonElement | undefined;

    await act(async () => {
      codeTab?.click();
      await Promise.resolve();
    });

    const applyButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Apply code',
    ) as HTMLButtonElement | undefined;

    await act(async () => {
      applyButton?.click();
      await Promise.resolve();
    });

    expect(window.blueAPI.updateEffectEditorDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: 'project',
        effectId: 'fx-1',
        projectRef: {
          channelId: 'channel-1',
          chain: 'pre',
          entryId: 'fx-1',
        },
        patch: expect.objectContaining({
          code: 'aout = ain * 0.5',
        }),
      }),
    );

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('round-trips interface edits for a project-owned effect through the same bridge', async () => {
    const { container, root } = renderPage();

    await act(async () => {
      await Promise.resolve();
    });

    const toggleButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Toggle edit mode',
    ) as HTMLButtonElement | undefined;

    await act(async () => {
      toggleButton?.click();
      await Promise.resolve();
    });

    expect(window.blueAPI.updateEffectEditorDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: 'project',
        effectId: 'fx-1',
        projectRef: {
          channelId: 'channel-1',
          chain: 'pre',
          entryId: 'fx-1',
        },
        patch: expect.objectContaining({
          bsbInterface: {
            type: 'setEditEnabled',
            value: false,
          },
        }),
      }),
    );

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});