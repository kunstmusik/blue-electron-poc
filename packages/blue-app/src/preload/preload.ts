/**
 * Preload script — exposes safe IPC bridges to the renderer process.
 */
import { clipboard, contextBridge, ipcRenderer } from 'electron';
import type {
  ProjectDocumentPatch,
  ProjectEditorSnapshot,
  ProjectLoadedPayload,
  PlaybackClockSnapshot,
} from '../shared/project-editor';
import type { NativeMenuCommand } from '../shared/workbench-menu';

contextBridge.exposeInMainWorld('blueAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke('open-file'),
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
});
