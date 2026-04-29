import { BrowserWindow } from 'electron';
import * as path from 'path';

let settingsWindow: BrowserWindow | null = null;

export function openSettingsWindow(mainWindow: BrowserWindow): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  const useSheetModal = process.platform !== 'darwin';

  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Settings',
    parent: mainWindow,
    // On macOS, modal child windows render as sheets (no normal title bar controls).
    // Keep this as a regular child window on macOS so native title bar + close button stay visible.
    modal: useSheetModal,
    frame: true,
    titleBarStyle: 'default',
    show: false,
    minimizable: false,
    maximizable: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    const devBase = process.env.VITE_DEV_SERVER_URL.replace(/\/$/, '');
    settingsWindow.loadURL(`${devBase}/settings.html`);
  } else {
    settingsWindow.loadFile(path.join(__dirname, '..', 'renderer', 'settings.html'));
  }
}

export function closeSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
    settingsWindow = null;
  }
}
