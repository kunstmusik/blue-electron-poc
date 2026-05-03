/**
 * Electron main process — manages app window, file dialogs, and engine lifecycle.
 */
import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  nativeImage,
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';

import { BlueData, Effect, Send, BSBGroup, BSBWidget } from '@blue/data';
import { openSettingsWindow } from './settings-window';
import { ParameterHelper } from '@blue/data';
import { initializeJavaScriptRuntime } from '@blue/data';
import type { TempoMap } from '@blue/data';
import { EngineBridge } from './engine-bridge';
import { BlueLiveEngineSession } from './blue-live-engine';
import { buildApplicationMenuTemplate } from './application-menu';
import { sweepStaleBlueEngineProcesses } from './engine-process-registry';
import {
  closeEffectEditorWindow,
  closeEffectEditorWindowsForOwner,
  openEffectEditorWindow,
  openEffectInterfaceWindow,
} from './effect-editor-window-manager';
import {
  getMixerEffectsLibrarySession,
} from './mixer-effects-library';
import { cleanupTempCsdSnapshots } from './render-command';
import { getWindowTitle } from '../shared/window-title';
import {
  applyEffectEditablePatchToEffect,
  applyProjectDocumentPatch,
  createProjectEditorSnapshot,
  createEffectEditorSnapshot,
  getMixerChannelSnapshotId,
  getMixerEntrySnapshotId,
  isEmptyProjectDocumentPatch,
  type EffectEditorPatchRequest,
  type EffectEditorRequest,
  type EffectEditablePatch,
  type EffectsLibraryPatch,
  type BlueLiveNoteTriggerRequest,
  type BlueLiveNoteTriggerResult,
  type BsbRealtimeControlUpdate,
  type ProjectDocumentCommitReceipt,
  type ProjectDocumentPatch,
} from '../shared/project-editor';
import { BlueSynthBuilder } from '@blue/data';

let mainWindow: BrowserWindow | null = null;
let currentData: BlueData | null = null;
let currentFilePath: string | null = null;
let currentProjectRevision = 0;
let engineBridge: EngineBridge | null = null;
let blueLiveSession: BlueLiveEngineSession | null = null;
let isQuitting = false;
let pendingQuit = false;
let shutdownPromise: Promise<void> | null = null;
let playbackStartPromise: Promise<boolean> | null = null;
let javaScriptRuntimeReady: Promise<void> | null = null;

// Set application name early (before ready) so macOS menu bar shows "Blue".
// NOTE: In dev mode (running `electron` CLI directly), macOS may still show
// "Electron" in some system UI until the app is packaged. A full dev server
// restart (Ctrl+C then `pnpm run dev` again) is required for this to take
// effect because it is read once at process startup.
app.setName('Blue');
console.log('[main] App name set to:', app.getName());

function getCurrentProjectDocument() {
  if (!currentData) {
    return null;
  }

  return createProjectEditorSnapshot(currentData, currentFilePath);
}

function getProjectMixerChannelBySnapshotId(channelId: string) {
  if (!currentData) {
    return null;
  }

  const mixer = currentData.getMixer();

  if (channelId === 'master') {
    return mixer.getMaster();
  }

  const sourceChannel = mixer.getChannels().find(
    (ch) => ch.getAssociation() === channelId || getMixerChannelSnapshotId(ch) === channelId,
  );
  if (sourceChannel) {
    return sourceChannel;
  }

  const subChannel = mixer.getSubChannels().find(
    (ch) => getMixerChannelSnapshotId(ch) === channelId,
  );
  if (subChannel) {
    return subChannel;
  }

  return null;
}

function getProjectEffectEntryByRequest(request: EffectEditorRequest) {
  if (!currentData || request.ownerType !== 'project' || !request.projectRef) {
    return null;
  }

  const channel = getProjectMixerChannelBySnapshotId(request.projectRef.channelId);
  if (!channel) {
    return null;
  }

  const chain = request.projectRef.chain === 'pre' ? channel.getPreEffects() : channel.getPostEffects();
  const index = chain.findIndex((entry) => getMixerEntrySnapshotId(entry) === request.projectRef?.entryId);
  if (index < 0) {
    return null;
  }

  const entry = chain[index];
  if (!(entry instanceof Effect)) {
    return null;
  }

  return {
    channel,
    chain,
    entry,
    effectId: request.projectRef.entryId,
  };
}

function getProjectEffectEditorSnapshot(request: EffectEditorRequest) {
  const result = getProjectEffectEntryByRequest(request);
  if (!result) {
    return null;
  }

  return createEffectEditorSnapshot(result.entry, result.effectId, 'project', {
    projectRef: request.projectRef,
  });
}

function computeInterfaceBounds(effect: Effect): { maxW: number; maxH: number } {
  let maxW = 1;
  let maxH = 1;
  const gi = effect.getGraphicInterface();
  const rootGroup = gi.getRootGroup();

  const visit = (widgets: BSBWidget[]) => {
    for (const widget of widgets) {
      if (widget instanceof BSBGroup) {
        visit(widget.getChildren());
        continue;
      }
      const ctor = widget.constructor.name;
      const size = getWidgetSize(widget, ctor);
      maxW = Math.max(maxW, widget.x + size.width);
      maxH = Math.max(maxH, widget.y + size.height);
    }
  };

  visit(rootGroup.getChildren());
  return { maxW, maxH };
}

function getWidgetSize(widget: BSBWidget, ctor: string): { width: number; height: number } {
  const w = widget as any;
  const vde = w.valueDisplayEnabled === true;

  switch (ctor) {
    case 'BSBKnob': {
      const kw = typeof w.knobWidth === 'number' ? w.knobWidth : 60;
      const le = w.labelEnabled === true;
      return { width: kw, height: kw + (le ? 16 : 0) + (vde ? 14 : 0) };
    }
    case 'BSBVSlider': {
      const sh = typeof w.sliderHeight === 'number' ? w.sliderHeight : 150;
      return { width: 50, height: sh + (vde ? 30 : 0) };
    }
    case 'BSBHSlider': {
      const sw = typeof w.sliderWidth === 'number' ? w.sliderWidth : 150;
      return { width: sw + (vde ? 50 : 0), height: 30 };
    }
    case 'BSBXYController': {
      const cw = typeof w.width === 'number' ? w.width : 100;
      const ch = typeof w.height === 'number' ? w.height : 100;
      return { width: cw + (vde ? 50 : 0), height: ch + (vde ? 30 : 0) };
    }
    default:
      return {
        width: typeof w.width === 'number' ? w.width : 50,
        height: typeof w.height === 'number' ? w.height : 24,
      };
  }
}

function applyProjectEffectEditorPatch(request: EffectEditorPatchRequest) {
  if (!currentData) {
    return null;
  }

  if (request.ownerType === 'library') {
    return getMixerEffectsLibrarySession().updateEffect(request.effectId, request.patch);
  }

  const effectEntry = getProjectEffectEntryByRequest(request);
  if (!effectEntry) {
    return null;
  }

  applyEffectEditablePatchToEffect(effectEntry.entry, request.patch);

  if (engineBridge?.isCurrentlyPlaying() && request.patch.bsbInterface) {
    const params = effectEntry.entry.getParameters();
    for (const param of params) {
      const varName = param.getCompilationVarName();
      if (varName) {
        void engineBridge.setChannel(varName, param.getValue(0)).catch(() => {});
      }
    }
  }

  return createEffectEditorSnapshot(effectEntry.entry, effectEntry.effectId, 'project', {
    projectRef: request.projectRef,
  });
}

function maybeCloseRemovedProjectEffectEditors(patch: ProjectDocumentPatch): void {
  if (!patch.mixer || !currentData) {
    return;
  }

  if (patch.mixer.type !== 'removeChainEntry') {
    return;
  }

  const channel = getProjectMixerChannelBySnapshotId(patch.mixer.channelId);
  if (!channel) {
    return;
  }

  const chain = patch.mixer.chain === 'pre' ? channel.getPreEffects() : channel.getPostEffects();
  const { entryId } = patch.mixer;
  const removed = chain.find((entry) => getMixerEntrySnapshotId(entry) === entryId);
  if (!removed || !(removed instanceof Effect)) {
    return;
  }

  closeEffectEditorWindow({
    ownerType: 'project',
    effectId: entryId,
    projectRef: {
      channelId: patch.mixer.channelId,
      chain: patch.mixer.chain,
      entryId,
    },
  });
}

function updateWindowTitle(): void {
  if (mainWindow) {
    mainWindow.setTitle(getWindowTitle(currentFilePath));
  }
}

function getCurrentProjectDirectory(): string | null {
  return currentFilePath ? path.dirname(currentFilePath) : null;
}

function hasLoadedProject(): boolean {
  return Boolean(currentData);
}

async function confirmSaveBeforeReplace(): Promise<boolean> {
  if (!currentData) return true;
  if (!currentFilePath) return true;

  const result = await dialog.showMessageBox(mainWindow!, {
    type: 'question',
    title: 'Save Changes?',
    message: 'Save changes before proceeding?',
    detail: `File: ${path.basename(currentFilePath)}`,
    buttons: ['Save', "Don't Save", 'Cancel'],
    defaultId: 0,
    cancelId: 2,
  });

  if (result.response === 0) {
    doSave(currentFilePath);
    return true;
  }

  if (result.response === 1) {
    return true;
  }

  return false;
}

function rebuildApplicationMenu(): void {
  const menu = Menu.buildFromTemplate(buildApplicationMenuTemplate({
    hasLoadedProject: hasLoadedProject(),
    isDarwin: process.platform === 'darwin',
    onNewFile: () => { void handleNewFile(); },
    onOpenFile: () => { void handleOpenFile(); },
    onSaveFile: () => { void saveFile(); },
    onSaveFileAs: () => { void saveFileAs(); },
    onRequestQuit: () => { void requestQuit(); },
    onOpenSettings: () => {
      if (mainWindow) {
        openSettingsWindow(mainWindow);
      }
    },
    onOpenEffectsLibrary: () => {
      if (mainWindow) {
        mainWindow.webContents.send('native-menu-command', { type: 'open-effects-library' });
      }
    },
    onFocusPanel: (panelId) => {
      if (mainWindow) {
        mainWindow.webContents.send('native-menu-command', { type: 'focus-panel', panelId });
      }
    },
    onToggleDevTools: () => { mainWindow?.webContents.toggleDevTools(); },
    onResetLayout: () => {
      if (mainWindow) {
        mainWindow.webContents.send('native-menu-command', { type: 'reset-layout' });
      }
    },
    onPlay: () => { void togglePlay(); },
    onStop: () => { void stopPlayback(); },
    onGenerateCsdToScreen: () => { void generateCsdToScreen(); },
    onGenerateCsdToDisk: () => { void generateCsdToDisk(); },
  }));

  Menu.setApplicationMenu(menu);
}

function getAppIcon(): Electron.NativeImage | undefined {
  const iconFile = (() => {
    if (process.platform === 'darwin') return 'blue.icns';
    if (process.platform === 'win32') return 'blue.ico';
    return 'blueIcon.png';
  })();

  // In dev mode vite-plugin-electron may place __dirname in a temp folder,
  // so we try several candidate roots.
  const candidates = [
    path.join(__dirname, '..', '..', 'assets', iconFile),
    path.join(__dirname, '..', 'assets', iconFile),
    path.join(__dirname, 'assets', iconFile),
    path.join(app.getAppPath(), 'assets', iconFile),
    path.join(process.cwd(), 'assets', iconFile),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log('[main] Using app icon:', p);
      return nativeImage.createFromPath(p);
    }
  }

  console.warn(`[main] App icon not found. Tried:\n${candidates.map((c) => '  - ' + c).join('\n')}`);
  return undefined;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: getWindowTitle(currentFilePath),
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: true,
    },
  });

  mainWindow.webContents.session.setPermissionCheckHandler(
    (_webContents, permission) => (permission as string) === 'local-fonts',
  );
  mainWindow.webContents.session.setPermissionRequestHandler(
    (_webContents, permission, callback) => callback((permission as string) === 'local-fonts'),
  );

  // During development, load from Vite dev server for HMR
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  // Initialize engine bridge
  engineBridge = new EngineBridge(mainWindow);

  let outputBatch: { text: string; type: 'stdout' | 'stderr' }[] = [];
  let outputBatchTimer: ReturnType<typeof setTimeout> | null = null;

  function flushOutputBatch() {
    if (outputBatch.length === 0) return;
    const batch = outputBatch;
    outputBatch = [];
    for (const item of batch) {
      mainWindow?.webContents.send('engine-output', {
        tabName: 'Csound',
        text: item.text,
        type: item.type,
      });
    }
    outputBatchTimer = null;
  }

  engineBridge.setOutputCallback((text, type) => {
    outputBatch.push({ text, type });
    if (!outputBatchTimer) {
      outputBatchTimer = setTimeout(flushOutputBatch, 50);
    }
  });

  // Initialize Blue Live engine session on separate port
  blueLiveSession = new BlueLiveEngineSession(mainWindow, undefined, 5560, 5561);
  let blueLiveOutputBatch: { text: string; type: 'stdout' | 'stderr' }[] = [];
  let blueLiveOutputTimer: ReturnType<typeof setTimeout> | null = null;

  function flushBlueLiveOutputBatch() {
    if (blueLiveOutputBatch.length === 0) return;
    const batch = blueLiveOutputBatch;
    blueLiveOutputBatch = [];
    for (const item of batch) {
      mainWindow?.webContents.send('engine-output', {
        tabName: 'Csound (Blue Live)',
        text: item.text,
        type: item.type,
      });
    }
    blueLiveOutputTimer = null;
  }

  blueLiveSession.setOutputCallback((text, type) => {
    blueLiveOutputBatch.push({ text, type });
    if (!blueLiveOutputTimer) {
      blueLiveOutputTimer = setTimeout(flushBlueLiveOutputBatch, 50);
    }
  });

  rebuildApplicationMenu();
  updateWindowTitle();
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
  if (shutdownPromise) {
    return shutdownPromise;
  }

  const shutdown = (async () => {
    isQuitting = true;

    if (blueLiveSession) {
      try {
        await blueLiveSession.stop();
      } catch {
        // Ignore cleanup errors
      }
    }

    // Gracefully stop engine
    if (engineBridge) {
      try {
        await engineBridge.dispose();
      } catch {
        // Ignore cleanup errors
      }
      engineBridge = null;
    }

    blueLiveSession = null;

    closeEffectEditorWindowsForOwner('project');
    closeEffectEditorWindowsForOwner('library');
    currentData = null;
    currentFilePath = null;
    currentProjectRevision = 0;
    rebuildApplicationMenu();
    await cleanupTempCsdSnapshots();

    app.quit();
  })().finally(() => {
    shutdownPromise = null;
  });

  shutdownPromise = shutdown;
  return shutdown;
}

// ─── File Operations ───

async function handleOpenFile(): Promise<void> {
  if (!(await confirmSaveBeforeReplace())) return;
  await openFile();
}

async function handleNewFile(): Promise<void> {
  if (!(await confirmSaveBeforeReplace())) return;
  await newFile();
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
    const data = await BlueData.loadFromString(xml);

    // Stop Blue Live when switching projects
    if (blueLiveSession && blueLiveSession.isRunning()) {
      await blueLiveSession.stop();
    }
    closeEffectEditorWindowsForOwner('project');

    currentData = data;
    currentFilePath = filePath;
    currentProjectRevision = 0;
    rebuildApplicationMenu();
    updateWindowTitle();

    // Debug: log arrangement IDs and UDOs
    const arr = data.getArrangement();
    console.log(`[App] Loaded project with ${arr.size()} instrument assignments:`);
    for (let i = 0; i < arr.size(); i++) {
      const ia = arr.getArrangement()[i];
      console.log(`[App]   Instrument ${ia.arrangementId}: enabled=${ia.enabled}, instr=${ia.instr?.constructor.name ?? 'null'}`);
      if (ia.instr && typeof (ia.instr as any).getOpcodeList === 'function') {
        const udoCount = (ia.instr as any).getOpcodeList().getOpcodes().length;
        console.log(`[App]     UDOs in instrument: ${udoCount}`);
        if (udoCount > 0) {
          const firstUdo = (ia.instr as any).getOpcodeList().getOpcodes()[0];
          console.log(`[App]     First UDO: ${firstUdo.getName()} (${firstUdo.getCode()?.length || 0} chars)`);
        }
      }
    }

    mainWindow.webContents.send('project-loaded', {
      ...createProjectEditorSnapshot(data, filePath),
      title: data.getProjectProperties().title || path.basename(filePath),
      author: data.getProjectProperties().author,
      sampleRate: data.getProjectProperties().sampleRate,
    });
  } catch (err: unknown) {
    await dialog.showErrorBox(
      'Error Loading File',
      `Failed to load ${path.basename(filePath)}:\n${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

async function openFilePath(filePath: string): Promise<void> {
  if (!mainWindow) return;

  try {
    const xml = fs.readFileSync(filePath, 'utf-8');
    const data = await BlueData.loadFromString(xml);

    if (blueLiveSession && blueLiveSession.isRunning()) {
      await blueLiveSession.stop();
    }
    closeEffectEditorWindowsForOwner('project');

    currentData = data;
    currentFilePath = filePath;
    currentProjectRevision = 0;
    rebuildApplicationMenu();
    updateWindowTitle();

    mainWindow.webContents.send('project-loaded', {
      ...createProjectEditorSnapshot(data, filePath),
      title: data.getProjectProperties().title || path.basename(filePath),
      author: data.getProjectProperties().author,
      sampleRate: data.getProjectProperties().sampleRate,
    });
  } catch (err: unknown) {
    await dialog.showErrorBox(
      'Error Loading File',
      `Failed to load ${path.basename(filePath)}:\n${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

async function newFile(): Promise<void> {
  if (!mainWindow) return;

  if (blueLiveSession && blueLiveSession.isRunning()) {
    await blueLiveSession.stop();
  }
  closeEffectEditorWindowsForOwner('project');

  const data = new BlueData();
  currentData = data;
  currentFilePath = null;
  currentProjectRevision = 0;
  rebuildApplicationMenu();
  updateWindowTitle();

  mainWindow.webContents.send('project-loaded', {
    ...createProjectEditorSnapshot(data, null),
    title: 'Untitled',
    author: '',
    sampleRate: '44100',
  });
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

function normalizeBsbSelectedPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  if (!currentFilePath) {
    return normalized;
  }

  const projectDir = path.dirname(currentFilePath);
  const relativePath = path.relative(projectDir, filePath);
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.startsWith('..')) {
    return normalized;
  }

  return relativePath.replace(/\\/g, '/');
}

function resolveBsbDefaultPath(currentValue?: string): string | undefined {
  if (!currentValue || currentValue.trim().length === 0) {
    return currentFilePath ? path.dirname(currentFilePath) : undefined;
  }

  if (path.isAbsolute(currentValue)) {
    return currentValue;
  }

  if (!currentFilePath) {
    return currentValue;
  }

  return path.resolve(path.dirname(currentFilePath), currentValue);
}

async function openBsbFileSelector(currentValue?: string): Promise<string | null> {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select File',
    properties: ['openFile'],
    defaultPath: resolveBsbDefaultPath(currentValue),
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return normalizeBsbSelectedPath(result.filePaths[0]);
}

async function normalizeBsbFileSelectorPath(filePath: string): Promise<string | null> {
  if (!filePath || filePath.trim().length === 0) {
    return null;
  }

  return normalizeBsbSelectedPath(filePath);
}

async function copyBsbFileSelectorToMediaFolder(currentValue?: string): Promise<string | null> {
  if (!currentData || !currentFilePath || !currentValue || currentValue.trim().length === 0) {
    return null;
  }

  const projectDir = path.dirname(currentFilePath);
  const sourceFile = path.isAbsolute(currentValue)
    ? currentValue
    : path.resolve(projectDir, currentValue);

  if (!fs.existsSync(sourceFile) || !fs.statSync(sourceFile).isFile()) {
    return null;
  }

  const mediaFolder = currentData.getProjectProperties().mediaFolder?.trim() ?? '';
  const targetDir = path.isAbsolute(mediaFolder)
    ? mediaFolder
    : path.resolve(projectDir, mediaFolder.length > 0 ? mediaFolder : 'media');
  fs.mkdirSync(targetDir, { recursive: true });

  const targetFile = path.join(targetDir, path.basename(sourceFile));
  if (path.resolve(targetFile) !== path.resolve(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
  }

  return normalizeBsbSelectedPath(targetFile);
}

function doSave(filePath: string): void {
  if (!currentData) return;
  try {
    const xml = currentData.saveToString();
    fs.writeFileSync(filePath, xml, 'utf-8');
    updateWindowTitle();
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

function notifyNoProjectLoaded(channel: 'playback-error' | 'generated-csd-error'): void {
  mainWindow?.webContents.send(channel, 'No project loaded');
}

async function ensureJavaScriptRuntime(): Promise<void> {
  if (!javaScriptRuntimeReady) {
    javaScriptRuntimeReady = initializeJavaScriptRuntime().catch((err: unknown) => {
      javaScriptRuntimeReady = null;
      throw err;
    });
  }

  await javaScriptRuntimeReady;
}

// ─── Playback ───

async function togglePlay(): Promise<boolean> {
  if (!engineBridge) return false;
  if (!currentData) {
    notifyNoProjectLoaded('playback-error');
    return false;
  }

  if (playbackStartPromise) {
    return playbackStartPromise;
  }

  if (engineBridge.isCurrentlyPlaying()) {
    await stopPlayback();
    return false;
  }

  playbackStartPromise = startPlayback().finally(() => {
    playbackStartPromise = null;
  });

  return playbackStartPromise;
}

async function startPlayback(): Promise<boolean> {
  if (!engineBridge || !currentData || !mainWindow) return false;

  try {
    mainWindow.webContents.send('playback-status', {
      status: 'starting',
      message: 'Preparing playback...',
    });

    mainWindow.webContents.send('engine-output-reset', { tabName: 'Csound' });
    mainWindow.webContents.send('engine-output-select', { tabName: 'Csound' });

    await ensureJavaScriptRuntime();

    const csd = currentData.toCSD();

    // Collect automation parameters
    const arrangement = currentData.getArrangement();
    const mixer = currentData.getMixer();
    let parameters: any[] | undefined;
    const automationTiming = {
      renderStartTime: currentData.getRenderStartTime(),
      sampleRate: Number(currentData.getProjectProperties().sampleRate) || 44100,
      ksmps: Number(currentData.getProjectProperties().ksmps) || 64,
      tempoMap: currentData.getScore().getTimeContext().getTempoMap(),
    };
    if (arrangement && mixer) {
      parameters = ParameterHelper.getAllParameters(arrangement, mixer);
      ParameterHelper.assignParameterNames(parameters);
    }

    const success = await engineBridge.playCSD(
      csd,
      parameters,
      automationTiming,
      getCurrentProjectDirectory(),
    );

    if (!success) {
      mainWindow.webContents.send('playback-status', {
        status: 'error',
        message: 'Failed to start playback',
      });
      return false;
    }

    return true;
  } catch (err: unknown) {
    mainWindow.webContents.send('playback-error', err instanceof Error ? err.message : String(err));
    return false;
  }
}

async function stopPlayback(): Promise<void> {
  if (!engineBridge) return;
  await engineBridge.stopPlayback();
}

async function generateCsdToScreen(): Promise<void> {
  if (!mainWindow) return;
  if (!currentData) {
    notifyNoProjectLoaded('generated-csd-error');
    return;
  }
  try {
    await ensureJavaScriptRuntime();
    const csdText = currentData.toCSD();
    mainWindow.webContents.send('generated-csd', csdText);
  } catch (err) {
    mainWindow?.webContents.send('generated-csd-error', err instanceof Error ? err.message : String(err));
  }
}

async function generateCsdToDisk(): Promise<void> {
  if (!mainWindow) return;
  if (!currentData) {
    notifyNoProjectLoaded('generated-csd-error');
    return;
  }
  try {
    await ensureJavaScriptRuntime();
    const csdText = currentData.toCSD();
    const projectBase = currentFilePath
      ? path.basename(currentFilePath, '.blue')
      : 'generated';
    const projectDir = currentFilePath
      ? path.dirname(currentFilePath)
      : undefined;
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: projectDir ? path.join(projectDir, `${projectBase}.csd`) : `${projectBase}.csd`,
      filters: [{ name: 'CSD Files', extensions: ['csd'] }],
    });
    if (result.canceled || !result.filePath) return;
    let filePath = result.filePath;
    if (!filePath.endsWith('.csd')) {
      filePath += '.csd';
    }
    await fs.promises.writeFile(filePath, csdText, 'utf-8');
    mainWindow.webContents.send('save-complete', { filePath });
  } catch (err) {
    mainWindow?.webContents.send('generated-csd-error', err instanceof Error ? err.message : String(err));
  }
}

// ─── IPC Handlers ───

ipcMain.handle('open-file', async () => {
  await openFile();
  return currentFilePath;
});

ipcMain.handle('open-file-path', async (_event, filePath: string) => {
  if (!(await confirmSaveBeforeReplace())) return currentFilePath;
  await openFilePath(filePath);
  return currentFilePath;
});

ipcMain.handle('new-file', async () => {
  await newFile();
  return currentFilePath;
});

ipcMain.handle('open-bsb-file-selector', async (_event, currentValue?: string) => {
  return openBsbFileSelector(currentValue);
});

ipcMain.handle('set-bsb-file-selector-path', async (_event, filePath: string) => {
  return normalizeBsbFileSelectorPath(filePath);
});

ipcMain.handle('copy-bsb-file-selector-to-media-folder', async (_event, currentValue?: string) => {
  return copyBsbFileSelectorToMediaFolder(currentValue);
});

ipcMain.handle('save-file', async () => {
  await saveFile();
  return currentFilePath;
});

ipcMain.handle('save-file-as', async () => {
  await saveFileAs();
  return currentFilePath;
});

ipcMain.handle('toggle-play', async () => {
  return togglePlay();
});

ipcMain.handle('stop-playback', async () => {
  await stopPlayback();
});

ipcMain.handle('generate-csd-to-screen', async () => {
  await generateCsdToScreen();
});

ipcMain.handle('generate-csd-to-disk', async () => {
  await generateCsdToDisk();
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

ipcMain.handle('import-blue-udo', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'Blue UDO File', extensions: ['blueUDO'] }],
    properties: ['openFile'],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const xml = await fs.promises.readFile(result.filePaths[0], 'utf-8');
  return xml;
});

ipcMain.handle('import-csound-udo', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'Csound File', extensions: ['udo', 'orc', 'csd'] }],
    properties: ['openFile'],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const text = await fs.promises.readFile(result.filePaths[0], 'utf-8');
  return text;
});

ipcMain.handle('export-blue-udo', async (_event, xmlText: string) => {
  if (!mainWindow) return;
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'Blue UDO File', extensions: ['blueUDO'] }],
  });
  if (result.canceled || !result.filePath) return;
  let filePath = result.filePath;
  if (!filePath.endsWith('.blueUDO')) filePath += '.blueUDO';
  await fs.promises.writeFile(filePath, xmlText, 'utf-8');
});

ipcMain.handle('export-csound-udo', async (_event, codeText: string, udoName: string) => {
  if (!mainWindow) return;
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `${udoName}.udo`,
    filters: [{ name: 'Csound UDO File', extensions: ['udo', 'inc'] }],
  });
  if (result.canceled || !result.filePath) return;
  await fs.promises.writeFile(result.filePath, codeText, 'utf-8');
});

// ─── Blue Live IPC Handlers ───

ipcMain.handle('blue-live:toggle', async () => {
  if (!blueLiveSession || !currentData) {
    return { status: 'idle', running: false, sessionId: 0, message: 'No project loaded' };
  }
  if (blueLiveSession.isRunning()) {
    return blueLiveSession.stop();
  }
  currentProjectRevision++;
  mainWindow?.webContents.send('engine-output-reset', { tabName: 'Csound (Blue Live)' });
  mainWindow?.webContents.send('engine-output-select', { tabName: 'Csound (Blue Live)' });
  return blueLiveSession.start(currentData, currentProjectRevision, getCurrentProjectDirectory());
});

ipcMain.handle('blue-live:stop', async () => {
  if (!blueLiveSession) {
    return { status: 'idle', running: false, sessionId: 0 };
  }
  return blueLiveSession.stop();
});

ipcMain.handle('blue-live:recompile', async () => {
  if (!blueLiveSession || !currentData) {
    return { status: 'idle', running: false, sessionId: 0, message: 'No project loaded' };
  }
  currentProjectRevision++;
  mainWindow?.webContents.send('engine-output-reset', { tabName: 'Csound (Blue Live)' });
  mainWindow?.webContents.send('engine-output-select', { tabName: 'Csound (Blue Live)' });
  return blueLiveSession.recompile(currentData, currentProjectRevision, getCurrentProjectDirectory());
});

ipcMain.handle('blue-live:all-notes-off', async () => {
  if (!blueLiveSession) {
    return { ok: false, message: 'Blue Live not initialized' };
  }
  return blueLiveSession.sendAllNotesOff();
});

ipcMain.handle('blue-live:trigger-note', async (_event, request: BlueLiveNoteTriggerRequest): Promise<BlueLiveNoteTriggerResult> => {
  if (!blueLiveSession || !currentData) {
    return { ok: false, message: 'No project loaded' };
  }

  return blueLiveSession.triggerNote(request);
});

ipcMain.handle('blue-live:get-status', async () => {
  if (!blueLiveSession) {
    return { status: 'idle', running: false, sessionId: 0 };
  }
  return blueLiveSession.getStatus();
});

// ─── Settings IPC Handler ───

ipcMain.handle('settings:open', async () => {
  if (!mainWindow) return;
  openSettingsWindow(mainWindow);
});

ipcMain.handle('open-effect-editor', async (_event, request: EffectEditorRequest) => {
  openEffectEditorWindow(mainWindow, request);
});

ipcMain.handle('open-effect-interface', async (_event, request: EffectEditorRequest) => {
  let interfaceWidth: number | undefined;
  let interfaceHeight: number | undefined;

  if (request.ownerType === 'project' && request.projectRef) {
    const effectEntry = getProjectEffectEntryByRequest(request);
    if (effectEntry) {
      const bounds = computeInterfaceBounds(effectEntry.entry);
      if (bounds.maxW > 1 || bounds.maxH > 1) {
        interfaceWidth = bounds.maxW + 10;
        interfaceHeight = bounds.maxH + 10;
      }
    }
  }

  openEffectInterfaceWindow(mainWindow, request, interfaceWidth, interfaceHeight);
});

ipcMain.handle('get-effect-editor-document', (_event, request: EffectEditorRequest) => {
  if (request.ownerType === 'library') {
    return getMixerEffectsLibrarySession().getEffectEditorSnapshot(request);
  }

  return getProjectEffectEditorSnapshot(request);
});

ipcMain.handle('update-effect-editor-document', (_event, request: EffectEditorPatchRequest) => {
  return applyProjectEffectEditorPatch(request);
});

ipcMain.handle('get-effects-library', () => {
  return getMixerEffectsLibrarySession().getSnapshot();
});

ipcMain.handle('reload-effects-library', () => {
  return getMixerEffectsLibrarySession().reload();
});

ipcMain.handle('update-effects-library', (_event, patch: EffectsLibraryPatch) => {
  const session = getMixerEffectsLibrarySession();
  const snapshot = session.applyPatch(patch);

  if (patch.type === 'removeEffect') {
    closeEffectEditorWindow({
      ownerType: 'library',
      effectId: patch.effectId,
      libraryRef: { libraryEffectId: patch.effectId },
    });
  }

  return snapshot;
});

// ─── Evaluate Code IPC Handler ───

ipcMain.handle('engine:evaluate-code', async (_event, request: { editorKind: string; text: string; sourcePanelId: string }) => {
  const trimmed = request.text?.trim();
  if (!trimmed) {
    return { routedTo: 'none', ok: false, message: 'No text selected' };
  }

  if (blueLiveSession?.isRunning()) {
    if (request.editorKind === 'orc') {
      return { ...await blueLiveSession.evaluateOrchestra(trimmed), routedTo: 'blueLive' as const };
    } else {
      return { ...await blueLiveSession.sendScore(trimmed), routedTo: 'blueLive' as const };
    }
  }

  if (engineBridge?.isCurrentlyPlaying()) {
    const client = engineBridge.getClient();
    if (!client) {
      return { routedTo: 'none', ok: false, message: 'Realtime engine not connected' };
    }
    try {
      if (request.editorKind === 'orc') {
        const resp = await client.compileOrc(trimmed);
        return { routedTo: 'realtime', ok: resp.ok, message: resp.ok ? undefined : resp.message };
      } else {
        const resp = await client.readScore(trimmed);
        return { routedTo: 'realtime', ok: resp.ok, message: resp.ok ? undefined : resp.message };
      }
    } catch (err) {
      return { routedTo: 'realtime', ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  }

  return { routedTo: 'none', ok: false, message: 'No engine running' };
});

/**
 * Synchronize real-time parameter changes to the running engine.
 */
async function syncEngineWithProjectPatch(data: BlueData, patch: ProjectDocumentPatch) {
  if (!engineBridge || !engineBridge.isCurrentlyPlaying()) return;

  if (patch.mixer) {
    const mixerPatch = patch.mixer;

    if (mixerPatch.type === 'updateChannel') {
      const channel = getProjectMixerChannelBySnapshotId(mixerPatch.channelId);
      if (channel) {
        const levelParam = channel.getLevelParameter();
        const varName = levelParam.getCompilationVarName();
        if (varName && mixerPatch.patch.level !== undefined) {
          await engineBridge.setChannel(varName, mixerPatch.patch.level);
        }
      }
    }
  }

  if (patch.orchestra) {
    const arrangement = data.getArrangement();
    const orchestraPatch = patch.orchestra;

    if (orchestraPatch.type === 'updateInstrument') {
      const instrument = arrangement.getInstrumentById(orchestraPatch.assignmentId);
      if (instrument instanceof BlueSynthBuilder) {
        // 1. Individual widget updates
        if (orchestraPatch.patch.bsbWidgetValues) {
          const params = instrument.getParameters();
          for (const [objectName, value] of Object.entries(orchestraPatch.patch.bsbWidgetValues)) {
            const param = params.find((p) => p.getName() === objectName);
            if (param && param.getCompilationVarName()) {
              await engineBridge.setChannel(param.getCompilationVarName()!, value);
            }
          }
        }

        // 2. BSB Interface patches (like presets)
        if (orchestraPatch.patch.bsbInterface) {
          const bsbPatch = orchestraPatch.patch.bsbInterface;
          if (bsbPatch.type === 'applyPreset') {
            // Preset applied: sync ALL parameters for this instrument to the engine
            const params = instrument.getParameters();
            for (const param of params) {
              const varName = param.getCompilationVarName();
              if (varName) {
                await engineBridge.setChannel(varName, param.getFixedValue());
              }
            }
          } else if (bsbPatch.type === 'updateWidgetProperties') {
            const widget = instrument.getGraphicInterface().findWidgetById(bsbPatch.widgetId);
            if (widget && widget.objectName) {
              const props = bsbPatch.properties;
              if (typeof props.value === 'number') {
                const param = instrument.getParameters().find(p => p.getName() === widget.objectName);
                if (param && param.getCompilationVarName()) {
                  await engineBridge.setChannel(param.getCompilationVarName()!, props.value);
                }
              }
              if (typeof props.selected === 'boolean') {
                const param = instrument.getParameters().find(p => p.getName() === widget.objectName);
                if (param && param.getCompilationVarName()) {
                  await engineBridge.setChannel(param.getCompilationVarName()!, props.selected ? 1 : 0);
                }
              }
              if (typeof props.selectedIndex === 'number') {
                const param = instrument.getParameters().find(p => p.getName() === widget.objectName);
                if (param && param.getCompilationVarName()) {
                  await engineBridge.setChannel(param.getCompilationVarName()!, props.selectedIndex);
                }
              }
              if (typeof props.xValue === 'number') {
                const px = instrument.getParameters().find(p => p.getName() === widget.objectName + 'X');
                if (px && px.getCompilationVarName()) {
                  await engineBridge.setChannel(px.getCompilationVarName()!, props.xValue);
                }
              }
              if (typeof props.yValue === 'number') {
                const py = instrument.getParameters().find(p => p.getName() === widget.objectName + 'Y');
                if (py && py.getCompilationVarName()) {
                  await engineBridge.setChannel(py.getCompilationVarName()!, props.yValue);
                }
              }
            }
          } else if (bsbPatch.type === 'updateSliderBankValue') {
            const widget = instrument.getGraphicInterface().findWidgetById(bsbPatch.widgetId);
            if (widget?.objectName) {
              const param = instrument.getParameters().find(
                (candidate) => candidate.getName() === `${widget.objectName}_${bsbPatch.sliderIndex}`,
              );
              if (param?.getCompilationVarName()) {
                await engineBridge.setChannel(param.getCompilationVarName()!, bsbPatch.value);
              }
            }
          }
        }
      }
    }
  }
}

async function syncEngineWithRealtimeControlUpdate(
  data: BlueData,
  update: BsbRealtimeControlUpdate,
) {
  if (!engineBridge || !engineBridge.isCurrentlyPlaying()) return;

  const arrangement = data.getArrangement();
  const instrument = arrangement.getInstrumentById(update.assignmentId);
  if (!(instrument instanceof BlueSynthBuilder)) return;

  const widget = instrument.getGraphicInterface().findWidgetById(update.widgetId);
  if (!widget?.objectName) return;

  const findParameter = (name: string) => {
    return instrument.getParameters().find((candidate) => candidate.getName() === name);
  };

  switch (update.kind) {
    case 'value': {
      const value = typeof update.payload.value === 'number' ? update.payload.value : null;
      if (value === null) break;
      const param = findParameter(widget.objectName);
      if (param?.getCompilationVarName()) {
        await engineBridge.setChannel(param.getCompilationVarName()!, value);
      }
      break;
    }
    case 'selected': {
      const selected = typeof update.payload.selected === 'boolean' ? update.payload.selected : null;
      if (selected === null) break;
      const param = findParameter(widget.objectName);
      if (param?.getCompilationVarName()) {
        await engineBridge.setChannel(param.getCompilationVarName()!, selected ? 1 : 0);
      }
      break;
    }
    case 'selectedIndex': {
      const selectedIndex = typeof update.payload.selectedIndex === 'number' ? update.payload.selectedIndex : null;
      if (selectedIndex === null) break;
      const param = findParameter(widget.objectName);
      if (param?.getCompilationVarName()) {
        await engineBridge.setChannel(param.getCompilationVarName()!, selectedIndex);
      }
      break;
    }
    case 'xy': {
      const nextX = typeof update.payload.xValue === 'number' ? update.payload.xValue : null;
      const nextY = typeof update.payload.yValue === 'number' ? update.payload.yValue : null;
      if (nextX !== null) {
        const px = findParameter(`${widget.objectName}X`);
        if (px?.getCompilationVarName()) {
          await engineBridge.setChannel(px.getCompilationVarName()!, nextX);
        }
      }
      if (nextY !== null) {
        const py = findParameter(`${widget.objectName}Y`);
        if (py?.getCompilationVarName()) {
          await engineBridge.setChannel(py.getCompilationVarName()!, nextY);
        }
      }
      break;
    }
    case 'sliderBank': {
      const sliderIndex = typeof update.payload.sliderIndex === 'number' ? update.payload.sliderIndex : null;
      const value = typeof update.payload.value === 'number' ? update.payload.value : null;
      if (sliderIndex === null || value === null) break;
      const param = findParameter(`${widget.objectName}_${sliderIndex}`);
      if (param?.getCompilationVarName()) {
        await engineBridge.setChannel(param.getCompilationVarName()!, value);
      }
      break;
    }
  }
}

ipcMain.handle('get-project-document', () => {
  return getCurrentProjectDocument();
});

ipcMain.handle('commit-project-document-patches', (_event, patches: ProjectDocumentPatch[]) => {
  if (!currentData) {
    throw new Error('No project loaded');
  }

  if (!Array.isArray(patches) || patches.length === 0) {
    throw new Error('Empty project document patch batch');
  }

  for (const patch of patches) {
    maybeCloseRemovedProjectEffectEditors(patch);
    applyProjectDocumentPatch(currentData, patch);
    if (engineBridge && engineBridge.isCurrentlyPlaying()) {
      void syncEngineWithProjectPatch(currentData, patch).catch((error) => {
        console.error('[main] Failed to sync engine with project patch:', error);
      });
    }
  }

  currentProjectRevision += 1;
  const receipt: ProjectDocumentCommitReceipt = { revision: currentProjectRevision };
  return receipt;
});

ipcMain.handle('send-bsb-realtime-control-update', (_event, update: BsbRealtimeControlUpdate) => {
  if (!currentData) {
    return;
  }

  void syncEngineWithRealtimeControlUpdate(currentData, update).catch((error) => {
    console.error('[main] Failed to sync realtime BSB control update:', error);
  });
});

ipcMain.handle('send-mixer-realtime-level-update', (_event, update: import('../shared/project-editor').MixerRealtimeLevelUpdate) => {
  if (!currentData || !engineBridge || !engineBridge.isCurrentlyPlaying()) {
    return;
  }

  const channel = getProjectMixerChannelBySnapshotId(update.channelId);
  if (!channel) return;

  const varName = channel.getLevelParameter().getCompilationVarName();
  if (varName) {
    void engineBridge.setChannel(varName, update.level).catch(() => {});
  }
});

ipcMain.handle('send-effect-realtime-update', (_event, update: import('../shared/project-editor').EffectRealtimeUpdate) => {
  if (!currentData || !engineBridge || !engineBridge.isCurrentlyPlaying() || !update.bsbWidgetValues) {
    return;
  }

  const effectEntry = getProjectEffectEntryByRequest({
    ownerType: 'project',
    effectId: update.entryId,
    projectRef: { channelId: update.channelId, chain: update.chain, entryId: update.entryId },
  });
  if (!effectEntry) return;

  const params = effectEntry.entry.getParameters();
  for (const [objectName, value] of Object.entries(update.bsbWidgetValues)) {
    const param = params.find((p) => p.getName() === objectName);
    if (param?.getCompilationVarName()) {
      void engineBridge.setChannel(param.getCompilationVarName()!, value).catch(() => {});
    }
  }
});

ipcMain.handle('update-project-document', (_event, patch) => {
  if (!currentData) {
    throw new Error('No project loaded');
  }

  if (!patch || isEmptyProjectDocumentPatch(patch)) {
    throw new Error('Empty project document patch');
  }

  maybeCloseRemovedProjectEffectEditors(patch);
  applyProjectDocumentPatch(currentData, patch);

  // Sync with engine in real-time if playing
  if (engineBridge && engineBridge.isCurrentlyPlaying()) {
    void syncEngineWithProjectPatch(currentData, patch);
  }

  return getCurrentProjectDocument();
});

// ─── App Lifecycle ───

app.whenReady().then(async () => {
  try {
    const report = await sweepStaleBlueEngineProcesses();
    if (report.inspected > 0 || report.removed > 0 || report.terminated > 0) {
      console.log(
        `[main] Blue engine startup sweep: inspected=${report.inspected}, removed=${report.removed}, terminated=${report.terminated}, kept=${report.kept}`,
      );
    }
  } catch (error: unknown) {
    console.warn(`[main] Blue engine startup sweep failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (process.platform === 'darwin' && app.dock) {
    const dockIcon = getAppIcon();
    if (dockIcon) {
      app.dock.setIcon(dockIcon);
    }
  }

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
    void doQuit();
  }
});

process.once('SIGINT', () => {
  void doQuit();
});

process.once('SIGTERM', () => {
  void doQuit();
});
