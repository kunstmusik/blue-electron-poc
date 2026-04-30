import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openSettingsWindow, closeSettingsWindow } from './settings-window';

const electronMock = vi.hoisted(() => {
  const instances: MockBrowserWindow[] = [];

  class MockBrowserWindow {
    options: Record<string, unknown>;
    destroyed = false;
    focus = vi.fn();
    show = vi.fn();
    loadURL = vi.fn();
    loadFile = vi.fn();
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
  closeSettingsWindow();
  electronMock.instances.length = 0;
  delete process.env.VITE_DEV_SERVER_URL;
});

afterEach(() => {
  closeSettingsWindow();
  vi.clearAllMocks();
});

describe('settings window lifecycle', () => {
  it('creates a modal child window with the expected presentation', () => {
    const mainWindow = {} as never;
    openSettingsWindow(mainWindow);

    expect(electronMock.instances).toHaveLength(1);
    const settingsWindow = electronMock.instances[0];

    expect(settingsWindow.options.parent).toBe(mainWindow);
    expect(settingsWindow.options.title).toBe('Settings');
    expect(settingsWindow.options.show).toBe(false);
    expect(settingsWindow.options.frame).toBe(true);
    expect(settingsWindow.options.titleBarStyle).toBe('default');
    expect(settingsWindow.options.minimizable).toBe(false);
    expect(settingsWindow.options.maximizable).toBe(false);
    expect(settingsWindow.options.resizable).toBe(true);
    expect(settingsWindow.options.modal).toBe(process.platform !== 'darwin');
    expect(String(settingsWindow.loadFile.mock.calls[0]?.[0])).toContain('settings.html');

    settingsWindow.triggerReadyToShow();
    expect(settingsWindow.show).toHaveBeenCalledTimes(1);
  });

  it('focuses the existing window on repeat open and recreates after close', () => {
    const mainWindow = {} as never;
    openSettingsWindow(mainWindow);
    const firstWindow = electronMock.instances[0];

    openSettingsWindow(mainWindow);
    expect(firstWindow.focus).toHaveBeenCalledTimes(1);
    expect(electronMock.instances).toHaveLength(1);

    closeSettingsWindow();
    expect(firstWindow.close).toHaveBeenCalledTimes(1);

    openSettingsWindow(mainWindow);
    expect(electronMock.instances).toHaveLength(2);
  });
});
