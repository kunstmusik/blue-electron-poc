/**
 * Preload script — exposes safe IPC bridges to the renderer process.
 */
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('blueAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: () => ipcRenderer.invoke('save-file'),
  saveFileAs: () => ipcRenderer.invoke('save-file-as'),

  // Playback
  togglePlay: () => ipcRenderer.invoke('toggle-play'),
  stopPlayback: () => ipcRenderer.invoke('stop-playback'),

  // Project info
  getProjectInfo: () => ipcRenderer.invoke('get-project-info'),

  // Event listeners
  onProjectLoaded: (callback: (info: unknown) => void) => {
    ipcRenderer.on('project-loaded', (_event, info) => callback(info));
  },
  onPlaybackStatus: (callback: (status: unknown) => void) => {
    ipcRenderer.on('playback-status', (_event, status) => callback(status));
  },
  onPlaybackError: (callback: (error: string) => void) => {
    ipcRenderer.on('playback-error', (_event, error) => callback(error));
  },
  onSaveComplete: (callback: (info: unknown) => void) => {
    ipcRenderer.on('save-complete', (_event, info) => callback(info));
  },
  onSaveError: (callback: (error: string) => void) => {
    ipcRenderer.on('save-error', (_event, error) => callback(error));
  },
});
