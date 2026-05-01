/**
 * Preload script — exposes safe IPC bridges to the renderer process.
 */
import { clipboard, contextBridge, ipcRenderer } from 'electron';
import type {
  BsbRealtimeControlUpdate,
  BlueLiveNoteTriggerRequest,
  BlueLiveNoteTriggerResult,
  ProjectDocumentCommitReceipt,
  ProjectDocumentPatch,
  ProjectEditorSnapshot,
  ProjectLoadedPayload,
  PlaybackClockSnapshot,
} from '../shared/project-editor';
import type { NativeMenuCommand } from '../shared/workbench-menu';
import type { EngineOutputPayload } from '../shared/io-provider';

contextBridge.exposeInMainWorld('blueAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke('open-file'),
  openFilePath: (filePath: string) => ipcRenderer.invoke('open-file-path', filePath),
  newFile: () => ipcRenderer.invoke('new-file'),
  openBsbFileSelector: (currentValue?: string) => ipcRenderer.invoke('open-bsb-file-selector', currentValue),
  setBsbFileSelectorPath: (filePath: string) => ipcRenderer.invoke('set-bsb-file-selector-path', filePath),
  copyBsbFileSelectorToMediaFolder: (currentValue?: string) => ipcRenderer.invoke('copy-bsb-file-selector-to-media-folder', currentValue),
  saveFile: () => ipcRenderer.invoke('save-file'),
  saveFileAs: () => ipcRenderer.invoke('save-file-as'),

  // Project document
  getProjectDocument: () =>
    ipcRenderer.invoke('get-project-document') as Promise<ProjectEditorSnapshot | null>,
  updateProjectDocument: (patch: ProjectDocumentPatch) =>
    ipcRenderer.invoke('update-project-document', patch) as Promise<ProjectEditorSnapshot | null>,
  commitProjectDocumentPatches: (patches: ProjectDocumentPatch[]) =>
    ipcRenderer.invoke('commit-project-document-patches', patches) as Promise<ProjectDocumentCommitReceipt>,
  sendBsbRealtimeControlUpdate: (update: BsbRealtimeControlUpdate) =>
    ipcRenderer.invoke('send-bsb-realtime-control-update', update) as Promise<void>,

  // Clipboard
  readClipboardText: () => Promise.resolve(clipboard.readText()),
  writeClipboardText: (text: string) => {
    return Promise.resolve().then(() => {
      clipboard.writeText(text);
    });
  },

  // Playback
  togglePlay: () => ipcRenderer.invoke('toggle-play'),
  stopPlayback: () => ipcRenderer.invoke('stop-playback'),

  // Project info
  getProjectInfo: () => ipcRenderer.invoke('get-project-info'),

  // CSD generation
  generateCsdToScreen: () => ipcRenderer.invoke('generate-csd-to-screen'),
  generateCsdToDisk: () => ipcRenderer.invoke('generate-csd-to-disk'),

  // UDO import/export
  importBlueUdo: () => ipcRenderer.invoke('import-blue-udo'),
  importCsoundUdo: () => ipcRenderer.invoke('import-csound-udo'),
  exportBlueUdo: (xmlText: string) => ipcRenderer.invoke('export-blue-udo', xmlText),
  exportCsoundUdo: (codeText: string, udoName: string) => ipcRenderer.invoke('export-csound-udo', codeText, udoName),

  // Event listeners
  onProjectLoaded: (callback: (info: ProjectLoadedPayload) => void) => {
    ipcRenderer.on('project-loaded', (_event, info) => callback(info as ProjectLoadedPayload));
  },
  onPlaybackStatus: (callback: (status: unknown) => void) => {
    ipcRenderer.on('playback-status', (_event, status) => callback(status));
  },
  onPlaybackClock: (callback: (clock: PlaybackClockSnapshot) => void) => {
    ipcRenderer.on('playback-clock', (_event, clock) => callback(clock as PlaybackClockSnapshot));
  },
  onPlaybackError: (callback: (error: string) => void) => {
    ipcRenderer.on('playback-error', (_event, error) => callback(error));
  },
  onNativeMenuCommand: (callback: (command: NativeMenuCommand) => void) => {
    ipcRenderer.on('native-menu-command', (_event, command) => callback(command as NativeMenuCommand));
  },
  onSaveComplete: (callback: (info: unknown) => void) => {
    ipcRenderer.on('save-complete', (_event, info) => callback(info));
  },
  onSaveError: (callback: (error: string) => void) => {
    ipcRenderer.on('save-error', (_event, error) => callback(error));
  },

  onEngineOutput: (callback: (payload: EngineOutputPayload) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: unknown) => callback(payload as EngineOutputPayload);
    ipcRenderer.on('engine-output', handler);
    return () => { ipcRenderer.removeListener('engine-output', handler); };
  },
  onEngineOutputSelect: (callback: (payload: { tabName: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: unknown) => callback(payload as { tabName: string });
    ipcRenderer.on('engine-output-select', handler);
    return () => { ipcRenderer.removeListener('engine-output-select', handler); };
  },
  onEngineOutputReset: (callback: (payload: { tabName: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: unknown) => callback(payload as { tabName: string });
    ipcRenderer.on('engine-output-reset', handler);
    return () => { ipcRenderer.removeListener('engine-output-reset', handler); };
  },
  onGeneratedCsd: (callback: (csdText: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, csdText: unknown) => callback(csdText as string);
    ipcRenderer.on('generated-csd', handler);
    return () => { ipcRenderer.removeListener('generated-csd', handler); };
  },
  onGeneratedCsdError: (callback: (error: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, error: unknown) => callback(error as string);
    ipcRenderer.on('generated-csd-error', handler);
    return () => { ipcRenderer.removeListener('generated-csd-error', handler); };
  },

  // Blue Live
  toggleBlueLive: () => ipcRenderer.invoke('blue-live:toggle'),
  stopBlueLive: () => ipcRenderer.invoke('blue-live:stop'),
  recompileBlueLive: () => ipcRenderer.invoke('blue-live:recompile'),
  sendBlueLiveAllNotesOff: () => ipcRenderer.invoke('blue-live:all-notes-off'),
  triggerBlueLiveNote: (request: BlueLiveNoteTriggerRequest) =>
    ipcRenderer.invoke('blue-live:trigger-note', request) as Promise<BlueLiveNoteTriggerResult>,
  getBlueLiveStatus: () => ipcRenderer.invoke('blue-live:get-status'),
  onBlueLiveStatus: (callback: (snapshot: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, snapshot: unknown) => callback(snapshot);
    ipcRenderer.on('blue-live-status', handler);
    return () => { ipcRenderer.removeListener('blue-live-status', handler); };
  },

  // Settings
  openSettingsWindow: () => ipcRenderer.invoke('settings:open'),

  // Evaluate Code
  evaluateCode: (request: { editorKind: string; text: string; sourcePanelId: string }) =>
    ipcRenderer.invoke('engine:evaluate-code', request),
});
