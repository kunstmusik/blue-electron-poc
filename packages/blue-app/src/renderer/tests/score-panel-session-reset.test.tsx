// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScorePanel from '../components/workbench/panels/ScorePanel';
import { __testClearPendingPatches, useProjectStore } from '../stores/project-store';
import { createEmptyProjectEditorSnapshot } from '../../shared/project-editor';

declare global {
  interface Window {
    blueAPI?: {
      commitProjectDocumentPatches: (
        patches: unknown[],
      ) => Promise<{ revision: number; sessionId: number }>;
    };
  }
}

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { mockResetSession, mockScorePathState } = vi.hoisted(() => {
  const mockResetSession = vi.fn();

  return {
    mockResetSession,
    mockScorePathState: {
      session: {
        activeGroupId: null,
        segments: [{ groupId: null, label: 'Root' }],
        scrollByGroupId: {},
      },
      scrollContainerRef: { current: null },
      navigateToGroup: vi.fn(),
      navigateToRoot: vi.fn(),
      navigateToSegment: vi.fn(),
      resetSession: mockResetSession,
    },
  };
});

vi.mock('../components/workbench/panels/score/useScorePathState', () => ({
  useScorePathState: () => mockScorePathState,
}));

function seedLoadedProject(): void {
  const snapshot = createEmptyProjectEditorSnapshot();

  useProjectStore.getState().setProjectInfo({
    title: 'Test Project',
    author: 'Test Author',
    sampleRate: '44100',
    version: '2.10.0',
    filePath: '/path/to/test.blue',
    sessionId: 1,
    loaded: true,
    globalOrc: snapshot.globalOrc,
    globalSco: snapshot.globalSco,
    orchestra: { ...snapshot.orchestra, loaded: true },
    projectProperties: snapshot.projectProperties,
    transport: snapshot.transport,
    score: snapshot.score,
  });
}

function renderPanel(): { container: HTMLDivElement; root: Root } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<ScorePanel />);
  });

  return { container, root };
}

beforeEach(() => {
  useProjectStore.getState().clearProject();
  mockResetSession.mockClear();
  window.blueAPI = {
    commitProjectDocumentPatches: vi.fn().mockResolvedValue({ revision: 1, sessionId: 1 }),
  };
});

afterEach(() => {
  __testClearPendingPatches();
  useProjectStore.getState().clearProject();
  delete window.blueAPI;
});

describe('ScorePanel session resets', () => {
  it('keeps the navigation session when the score time state changes', async () => {
    seedLoadedProject();

    const { container, root } = renderPanel();

    expect(mockResetSession).toHaveBeenCalledTimes(1);

    await act(async () => {
      await useProjectStore.getState().applyProjectDocumentPatch({
        score: {
          type: 'updateTimeState',
          patch: { snapEnabled: false },
        },
      });
    });

    expect(mockResetSession).toHaveBeenCalledTimes(1);

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
