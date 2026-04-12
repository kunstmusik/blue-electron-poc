/**
 * Electron main process — manages app window, file dialogs, and engine lifecycle.
 */
import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { BlueData } from '@blue/data';

let mainWindow: BrowserWindow | null = null;
let currentData: BlueData | null = null;
let currentFilePath: string | null = null;
let engineProcess: import('child_process').ChildProcess | null = null;
let isPlaying = false;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  // Build menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'Open...', accelerator: 'CmdOrCtrl+O', click: () => openFile() },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => saveFile() },
        { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => saveFileAs() },
        { type: 'separator' },
        { role: 'quit' },
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
    const data = BlueData.loadFromString(xml);
    currentData = data;
    currentFilePath = filePath;

    // Send project info to renderer
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
  } catch (err: unknown) {
    if (mainWindow) {
      mainWindow.webContents.send('save-error', err instanceof Error ? err.message : String(err));
    }
  }
}

function togglePlay(): void {
  if (isPlaying) {
    stopPlayback();
    return;
  }
  startPlayback();
}

function startPlayback(): void {
  if (!currentData) return;

  try {
    // Generate CSD
    const csd = currentData.toCSD();

    // For Phase 12: stub — just show status
    isPlaying = true;
    if (mainWindow) {
      mainWindow.webContents.send('playback-status', { status: 'playing', message: 'Engine stub — CSD generated' });
    }

    // Log CSD for debugging
    console.log('=== Generated CSD ===');
    console.log(csd.substring(0, 500) + '...');
    console.log('=====================');
  } catch (err: unknown) {
    if (mainWindow) {
      mainWindow.webContents.send('playback-error', err instanceof Error ? err.message : String(err));
    }
  }
}

function stopPlayback(): void {
  isPlaying = false;
  if (mainWindow) {
    mainWindow.webContents.send('playback-status', { status: 'stopped' });
  }
}

// IPC handlers
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
  return isPlaying;
});

ipcMain.handle('stop-playback', () => {
  stopPlayback();
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

ipcMain.on('playback-ready', () => {
  // Renderer signals it's ready
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
