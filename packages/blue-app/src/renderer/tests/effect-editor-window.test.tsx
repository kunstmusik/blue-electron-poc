// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Effect } from '@blue/data';
import EffectEditorPage from '../components/effect-editor/EffectEditorPage';
import {
  createEffectEditorSnapshot,
  type EffectEditorSnapshot,
  type EffectEditorPatchRequest,
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
  default: ({ instrument }: { instrument: { name: string } }) => (
    <div data-testid="bsb-interface-editor">{instrument.name}</div>
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
  }) => (
    <div>
      <label>
        <span>{ariaLabel}</span>
        <textarea aria-label={ariaLabel} value={value} readOnly />
      </label>
      <button type="button" onClick={() => onChange('aout = ain * 0.5')}>
        Apply code
      </button>
    </div>
  ),
}));

vi.mock('../components/workbench/panels/udo/UdoWorkspacePanel', () => ({
  default: () => <div data-testid="udo-workspace-panel" />,
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

  return createEffectEditorSnapshot(effect, 'fx-1', 'library', {
    libraryRef: { libraryEffectId: 'fx-1' },
  });
}

function renderPage(): { container: HTMLDivElement; root: Root } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<EffectEditorPage />);
  });

  return { container, root };
}

beforeEach(() => {
  const snapshot = createLoadedSnapshot();
  let currentSnapshot = snapshot;

  window.history.replaceState({}, '', '/effect-editor.html?ownerType=library&effectId=fx-1&libraryEffectId=fx-1');
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

describe('EffectEditorPage', () => {
  it('loads the effect editor shell and shows the loaded snapshot', async () => {
    const { container, root } = renderPage();

    await act(async () => {
      await Promise.resolve();
    });

    expect(window.blueAPI.openEffectEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: 'library',
        effectId: 'fx-1',
        libraryRef: { libraryEffectId: 'fx-1' },
      }),
    );
    expect(document.title).toBe('Delay - Effect Editor');
    expect(container.textContent).toContain('Interface');
    expect(container.textContent).toContain('Code');
    expect(container.textContent).toContain('UDO');
    expect(container.textContent).toContain('Comments');
    expect(container.querySelector('[data-testid="bsb-interface-editor"]')).toBeTruthy();
    const effectNameInput = container.querySelector(
      'input[aria-label="Effect name"]',
    ) as HTMLInputElement | null;
    expect(effectNameInput?.value).toBe('Delay');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('shows a close action when the effect editor document cannot be loaded', async () => {
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => undefined);
    window.blueAPI.getEffectEditorDocument = vi.fn().mockResolvedValue(null);

    const { container, root } = renderPage();

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Unable to load effect editor document');

    await act(async () => {
      const button = Array.from(container.querySelectorAll('button')).find(
        (candidate) => candidate.textContent === 'Close Window',
      ) as HTMLButtonElement | undefined;
      button?.click();
      await Promise.resolve();
    });

    expect(closeSpy).toHaveBeenCalledOnce();

    closeSpy.mockRestore();
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('routes code edits back through the effect editor bridge', async () => {
    const { container, root } = renderPage();

    await act(async () => {
      await Promise.resolve();
    });

    const codeTab = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Code',
    ) as HTMLButtonElement | undefined;

    await act(async () => {
      codeTab?.click();
      await Promise.resolve();
    });

    const codeEditor = container.querySelector('textarea[aria-label="Effect code editor"]') as HTMLTextAreaElement | null;
    expect(codeEditor).toBeTruthy();

    await act(async () => {
      const applyButton = Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent === 'Apply code',
      ) as HTMLButtonElement | undefined;
      applyButton?.click();
      await Promise.resolve();
    });

    expect(window.blueAPI.updateEffectEditorDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerType: 'library',
        effectId: 'fx-1',
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
});
