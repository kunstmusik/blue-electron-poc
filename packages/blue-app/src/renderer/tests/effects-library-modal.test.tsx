// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Effect } from '@blue/data';
import EffectLibraryModal from '../components/workbench/panels/EffectLibraryModal';
import {
  createLibraryEffectSnapshot,
  type EffectsLibrarySnapshot,
  type MixerPatch,
} from '../../shared/project-editor';

declare global {
  interface Window {
    blueAPI?: {
      getEffectsLibrary?: () => Promise<EffectsLibrarySnapshot>;
      updateEffectsLibrary?: (patch: unknown) => Promise<EffectsLibrarySnapshot>;
      openEffectEditor?: (request: unknown) => Promise<unknown> | unknown;
      getEffectEditorDocument?: (request: unknown) => Promise<unknown>;
    };
  }
}

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface MockProjectState {
  applyProjectDocumentPatch: (patch: { mixer: MixerPatch }) => Promise<void> | void;
}

interface MockUIState {
  effectsLibraryOpen: boolean;
  effectsLibraryTarget: { channelId: string; chain: 'pre' | 'post' } | null;
  closeEffectsLibrary: () => void;
}

const { mockProjectState, mockUIState } = vi.hoisted(() => ({
  mockProjectState: {
    applyProjectDocumentPatch: vi.fn(),
  } satisfies MockProjectState,
  mockUIState: {
    effectsLibraryOpen: false,
    effectsLibraryTarget: null,
    closeEffectsLibrary: vi.fn(),
  } satisfies MockUIState,
}));

vi.mock('../stores/project-store', () => ({
  useProjectStore: (selector: (state: MockProjectState) => unknown) =>
    selector(mockProjectState),
}));

vi.mock('../stores/ui-store', () => ({
  useUIStore: (selector: (state: MockUIState) => unknown) =>
    selector(mockUIState),
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function createLibrarySnapshot(): EffectsLibrarySnapshot {
  const effect = new Effect();
  effect.setName('Delay');
  effect.setComments('Library note');
  effect.setCode('aout = ain * 0.5');

  return {
    loaded: true,
    sourcePath: '/Users/test/.blue/effectsLibrary.xml',
    root: {
      categoryId: 'root',
      name: 'Library',
      categories: [
        {
          categoryId: 'fx',
          name: 'FX',
          categories: [],
          effects: [createLibraryEffectSnapshot(effect, 'fx-1', 'fx')],
        },
      ],
      effects: [],
    },
  };
}

function renderModal(): { container: HTMLDivElement; root: Root } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<EffectLibraryModal />);
  });

  return { container, root };
}

beforeEach(() => {
  mockProjectState.applyProjectDocumentPatch.mockReset();
  mockUIState.closeEffectsLibrary.mockReset();
  mockUIState.effectsLibraryOpen = true;
  mockUIState.effectsLibraryTarget = { channelId: '1', chain: 'pre' };
});

afterEach(() => {
  delete window.blueAPI;
});

describe('EffectLibraryModal', () => {
  it('loads the library and shows the split-pane tree + detail layout', async () => {
    const deferred = createDeferred<EffectsLibrarySnapshot>();
    window.blueAPI = {
      getEffectsLibrary: vi.fn(() => deferred.promise),
      updateEffectsLibrary: vi.fn(),
      openEffectEditor: vi.fn().mockResolvedValue(undefined),
      getEffectEditorDocument: vi.fn().mockResolvedValue(null),
    };

    const { container, root } = renderModal();

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Loading effects library...');

    await act(async () => {
      deferred.resolve(createLibrarySnapshot());
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Effects Library');
    expect(container.textContent).toContain('Target: 1 / pre');
    expect(container.textContent).toContain('Session-only mutations. No writes to `~/.blue`.');

    expect(container.textContent).toContain('Delay');
    expect(container.textContent).toContain('FX');

    const separator = container.querySelector('[role="separator"]');
    expect(separator).toBeTruthy();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('shows Add to Mixer button when target and effect are available', async () => {
    const deferred = createDeferred<EffectsLibrarySnapshot>();
    window.blueAPI = {
      getEffectsLibrary: vi.fn(() => deferred.promise),
      updateEffectsLibrary: vi.fn(),
      openEffectEditor: vi.fn().mockResolvedValue(undefined),
      getEffectEditorDocument: vi.fn().mockResolvedValue(null),
    };

    const { container, root } = renderModal();

    await act(async () => {
      deferred.resolve(createLibrarySnapshot());
      await Promise.resolve();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(window.blueAPI?.getEffectsLibrary).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
