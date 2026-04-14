/**
 * Electron main process — manages app window, file dialogs, and engine lifecycle.
 */
import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { BlueData } from '@blue/data';
import { EngineBridge } from './engine-bridge';

let mainWindow: BrowserWindow | null = null;
let currentData: BlueData | null = null;
let currentFilePath: string | null = null;
let engineBridge: EngineBridge | null = null;
let isQuitting = false;
let pendingQuit = false;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true,
    },
  });

  // During development, load from Vite dev server for HMR
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  // Initialize engine bridge
  engineBridge = new EngineBridge(mainWindow);

  // Build menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'Open...', accelerator: 'CmdOrCtrl+O', click: () => openFile() },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => saveFile() },
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => saveFileAs() },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : undefined,
          click: () => requestQuit(),
        },
      ],
    },
    {
      label: 'Playback',
      submenu: [
        { label: 'Play', accelerator: 'Space', click: () => togglePlay() },
        { label: 'Stop', accelerator: 'Escape', click: () => stopPlayback() },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

/**
 * Request app exit — shows save prompt if project is dirty.
 */
async function requestQuit(): Promise<void> {
  isQuitting = true;

  // Stop engine first
  if (engineBridge && engineBridge.isCurrentlyPlaying()) {
    await engineBridge.stopPlayback();
  }

  if (currentData && currentFilePath) {
    // Ask user to save before quitting
    const result = await dialog.showMessageBox(mainWindow!, {
      type: 'question',
      title: 'Save Before Quit?',
      message: 'Would you like to save the project before exiting?',
      detail: currentFilePath
        ? `File: ${path.basename(currentFilePath)}`
        : 'This project has not been saved yet.',
      buttons: ['Save', "Don't Save", 'Cancel'],
      defaultId: 0,
      cancelId: 2,
    });

    if (result.response === 0) {
      // Save → Quit
      if (currentFilePath) {
        doSave(currentFilePath);
      } else {
        await saveFileAs();
        // If user cancels the save dialog, abort quit
        if (!currentFilePath) {
          isQuitting = false;
          return;
        }
      }
      // Save complete → proceed with quit
      pendingQuit = true;
    } else if (result.response === 1) {
      // Don't Save → Quit immediately
      doQuit();
    } else {
      // Cancel → Abort quit
      isQuitting = false;
    }
  } else {
    // No project loaded → quit immediately
    doQuit();
  }
}

/**
 * Actually quit the app — clean up engine and exit.
 */
async function doQuit(): Promise<void> {
  isQuitting = true;

  // Gracefully stop engine
  if (engineBridge) {
    try {
      await engineBridge.stopPlayback();
    } catch {
      // Ignore cleanup errors
    }
    engineBridge.dispose();
    engineBridge = null;
  }

  currentData = null;
  currentFilePath = null;

  app.quit();
}

// ─── File Operations ───

async function openFile(): Promise<void> {
  if (!mainWindow) return;

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Blue Project',
    filters: [{ name: 'Blue Project', extensions: ['blue'] }],
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) return;

  const filePath = result.filePaths[0];
  try {
    const xml = fs.readFileSync(filePath, 'utf-8');
    const data = await BlueData.loadFromString(xml);
    currentData = data;
    currentFilePath = filePath;

    mainWindow.webContents.send('project-loaded', {
      title: data.getProjectProperties().title || path.basename(filePath),
      author: data.getProjectProperties().author,
      sampleRate: data.getProjectProperties().sampleRate,
      version: data.getVersion(),
      filePath,
    });
  } catch (err: unknown) {
    await dialog.showErrorBox(
      'Error Loading File',
      `Failed to load ${path.basename(filePath)}:\n${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

async function saveFile(): Promise<void> {
  if (!currentData || !currentFilePath) {
    return saveFileAs();
  }
  doSave(currentFilePath);
}

async function saveFileAs(): Promise<void> {
  if (!mainWindow || !currentData) return;

  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Blue Project',
    defaultPath: currentFilePath ?? 'project.blue',
    filters: [{ name: 'Blue Project', extensions: ['blue'] }],
  });

  if (result.canceled || !result.filePath) return;

  currentFilePath = result.filePath;
  doSave(currentFilePath);
}

function doSave(filePath: string): void {
  if (!currentData) return;
  try {
    const xml = currentData.saveToString();
    fs.writeFileSync(filePath, xml, 'utf-8');
    if (mainWindow) {
      mainWindow.webContents.send('save-complete', { filePath });
    }
    // If we were waiting to quit after save, do it now
    if (pendingQuit) {
      pendingQuit = false;
      doQuit();
    }
  } catch (err: unknown) {
    if (mainWindow) {
      mainWindow.webContents.send('save-error', err instanceof Error ? err.message : String(err));
    }
    // If save failed during quit, still quit
    if (pendingQuit) {
      pendingQuit = false;
      doQuit();
    }
  }
}

// ─── Playback ───

function togglePlay(): void {
  if (!engineBridge || !currentData) return;

  if (engineBridge.isCurrentlyPlaying()) {
    stopPlayback();
    return;
  }

  startPlayback();
}

async function startPlayback(): Promise<void> {
  if (!engineBridge || !currentData || !mainWindow) return;

  try {
    const csd = currentData.toCSD();
    const success = await engineBridge.playCSD(csd);

    if (!success) {
      mainWindow.webContents.send('playback-status', {
        status: 'error',
        message: 'Failed to start playback',
      });
    }
  } catch (err: unknown) {
    mainWindow.webContents.send('playback-error', err instanceof Error ? err.message : String(err));
  }
}

async function stopPlayback(): Promise<void> {
  if (!engineBridge) return;
  await engineBridge.stopPlayback();
}

// ─── IPC Handlers ───

ipcMain.handle('open-file', async () => {
  await openFile();
  return currentFilePath;
});

ipcMain.handle('save-file', async () => {
  await saveFile();
  return currentFilePath;
});

ipcMain.handle('save-file-as', async () => {
  await saveFileAs();
  return currentFilePath;
});

ipcMain.handle('toggle-play', () => {
  togglePlay();
  return engineBridge?.isCurrentlyPlaying() ?? false;
});

ipcMain.handle('stop-playback', async () => {
  await stopPlayback();
});

ipcMain.handle('get-project-info', () => {
  if (!currentData) return null;
  return {
    title: currentData.getProjectProperties().title,
    author: currentData.getProjectProperties().author,
    sampleRate: currentData.getProjectProperties().sampleRate,
    ksmps: currentData.getProjectProperties().ksmps,
    nchnls: currentData.getProjectProperties().nchnls,
    version: currentData.getVersion(),
  };
});

// ─── App Lifecycle ───

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Intercept Cmd+Q and window close buttons
app.on('before-quit', (event: Electron.Event) => {
  if (!isQuitting) {
    event.preventDefault();
    requestQuit();
  }
});

app.on('window-all-closed', () => {
  if (!isQuitting) {
    requestQuit();
  } else {
    doQuit();
  }
});
