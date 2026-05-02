import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  closeEffectEditorWindow,
  closeEffectEditorWindowsForOwner,
  openEffectEditorWindow,
} from './effect-editor-window-manager';

const electronMock = vi.hoisted(() => {
  const instances: MockBrowserWindow[] = [];

  class MockBrowserWindow {
    options: Record<string, unknown>;
    destroyed = false;
    focus = vi.fn();
    show = vi.fn();
    loadURL = vi.fn();
    once = vi.fn((event: string, handler: () => void) => {
      if (event === 'ready-to-show') {
        this.readyToShowHandler = handler;
      }
    });
    on = vi.fn((event: string, handler: () => void) => {
      if (event === 'closed') {
        this.closedHandler = handler;
      }
    });
    close = vi.fn(() => {
      this.destroyed = true;
      this.closedHandler?.();
    });
    isDestroyed = vi.fn(() => this.destroyed);

    private readyToShowHandler?: () => void;
    private closedHandler?: () => void;

    constructor(options: Record<string, unknown>) {
      this.options = options;
      instances.push(this);
    }

    triggerReadyToShow(): void {
      this.readyToShowHandler?.();
    }
  }

  return { instances, MockBrowserWindow };
});

vi.mock('electron', () => ({
  BrowserWindow: electronMock.MockBrowserWindow,
}));

beforeEach(() => {
  closeEffectEditorWindowsForOwner('project');
  closeEffectEditorWindowsForOwner('library');
  electronMock.instances.length = 0;
  process.env.VITE_DEV_SERVER_URL = 'http://localhost:5173/';
});

afterEach(() => {
  closeEffectEditorWindowsForOwner('project');
  closeEffectEditorWindowsForOwner('library');
  delete process.env.VITE_DEV_SERVER_URL;
  vi.clearAllMocks();
});

describe('effect editor window manager', () => {
  it('reuses the same project window when the effect is reopened', () => {
    const mainWindow = { isDestroyed: vi.fn(() => false) } as never;
    const request = {
      ownerType: 'project' as const,
      effectId: 'effect-1',
      projectRef: {
        channelId: 'channel-1',
        chain: 'pre' as const,
        entryId: 'effect-1',
      },
    };

    openEffectEditorWindow(mainWindow, request);
    expect(electronMock.instances).toHaveLength(1);

    const firstWindow = electronMock.instances[0]!;
    expect(String(firstWindow.loadURL.mock.calls[0]?.[0])).toContain('effect-editor.html');

    openEffectEditorWindow(mainWindow, request);
    expect(firstWindow.focus).toHaveBeenCalledTimes(1);
    expect(electronMock.instances).toHaveLength(1);
  });

  it('keeps project and library editor windows separate', () => {
    const mainWindow = { isDestroyed: vi.fn(() => false) } as never;
    const projectRequest = {
      ownerType: 'project' as const,
      effectId: 'effect-1',
      projectRef: {
        channelId: 'channel-1',
        chain: 'pre' as const,
        entryId: 'effect-1',
      },
    };
    const libraryRequest = {
      ownerType: 'library' as const,
      effectId: 'effect-1',
      libraryRef: {
        libraryEffectId: 'effect-1',
      },
    };

    openEffectEditorWindow(mainWindow, projectRequest);
    openEffectEditorWindow(mainWindow, libraryRequest);

    expect(electronMock.instances).toHaveLength(2);

    closeEffectEditorWindowsForOwner('project');
    expect(electronMock.instances[0]?.close).toHaveBeenCalledTimes(1);
    expect(electronMock.instances[1]?.close).not.toHaveBeenCalled();

    closeEffectEditorWindow(libraryRequest);
    expect(electronMock.instances[1]?.close).toHaveBeenCalledTimes(1);
  });
});
