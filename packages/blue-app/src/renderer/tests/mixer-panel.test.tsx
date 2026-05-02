// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BlueData, Channel, GenericInstrument } from '@blue/data';
import MixerPanel from '../components/workbench/panels/MixerPanel';
import {
  createEmptyMixerSnapshot,
  createProjectEditorSnapshot,
  type MixerPatch,
  type MixerSnapshot,
} from '../../shared/project-editor';

declare global {
  interface Window {
    blueAPI?: {
      openEffectEditor?: (request: unknown) => Promise<unknown> | unknown;
      openEffectInterface?: (request: unknown) => Promise<unknown> | unknown;
      getEffectsLibrary?: () => Promise<unknown>;
    };
  }
}

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface MockProjectState {
  loaded: boolean;
  mixer: MixerSnapshot;
  applyProjectDocumentPatch: (patch: { mixer: MixerPatch }) => Promise<void> | void;
}

interface MockUIState {
  openEffectsLibrary: (target?: { channelId: string; chain: 'pre' | 'post' }) => void;
}

const { mockProjectState, mockUIState } = vi.hoisted(() => ({
  mockProjectState: {
    loaded: false,
    mixer: {} as MixerSnapshot,
    applyProjectDocumentPatch: vi.fn(),
  } satisfies MockProjectState,
  mockUIState: {
    openEffectsLibrary: vi.fn(),
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

function seedLoadedProject(): void {
  const data = new BlueData();

  const instrument = new GenericInstrument();
  instrument.setName('Lead');
  data.getArrangement().addInstrument(instrument, '1');

  const channel = new Channel();
  channel.setName('Lead Channel');
  channel.setAssociation('1');
  data.getMixer().getChannels().splice(0, 0, channel);

  const snapshot = createProjectEditorSnapshot(data, '/test.blue');
  mockProjectState.loaded = true;
  mockProjectState.mixer = snapshot.mixer!;
}

function renderPanel(): { container: HTMLDivElement; root: Root } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<MixerPanel />);
  });

  return { container, root };
}

beforeEach(() => {
  mockProjectState.loaded = false;
  mockProjectState.mixer = createEmptyMixerSnapshot();
  mockProjectState.applyProjectDocumentPatch.mockReset();
  mockUIState.openEffectsLibrary.mockReset();
  window.blueAPI = {
    openEffectEditor: vi.fn().mockResolvedValue(undefined),
    openEffectInterface: vi.fn().mockResolvedValue(undefined),
    getEffectsLibrary: vi.fn().mockResolvedValue({ root: { categories: [], effects: [] } }),
    sendMixerRealtimeLevelUpdate: vi.fn().mockResolvedValue(undefined),
  };
});

afterEach(() => {
  delete window.blueAPI;
});

describe('MixerPanel', () => {
  it('renders the unloaded empty state', () => {
    const { container, root } = renderPanel();

    expect(container.textContent).toContain('No project loaded');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders mixer strips for loaded project', async () => {
    seedLoadedProject();

    const { container, root } = renderPanel();

    expect(container.textContent).toContain('Lead Channel');
    expect(container.textContent).toContain('Master');
    expect(container.textContent).toContain('Add Subchannel');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
