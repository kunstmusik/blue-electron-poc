/**
 * Renderer script — handles UI updates and IPC communication with main process.
 */

// Type declarations for the exposed API
interface BlueAPI {
  openFile: () => Promise<string | null>;
  saveFile: () => Promise<string | null>;
  saveFileAs: () => Promise<string | null>;
  togglePlay: () => Promise<boolean>;
  stopPlayback: () => void;
  getProjectInfo: () => Promise<Record<string, string> | null>;
  onProjectLoaded: (callback: (info: Record<string, string>) => void) => void;
  onPlaybackStatus: (callback: (status: Record<string, string>) => void) => void;
  onPlaybackError: (callback: (error: string) => void) => void;
  onSaveComplete: (callback: (info: Record<string, string>) => void) => void;
  onSaveError: (callback: (error: string) => void) => void;
}

declare const window: Window & { blueAPI: BlueAPI };

// DOM elements
const welcomeScreen = document.getElementById('welcome-screen')!;
const projectView = document.getElementById('project-view')!;
const projectInfo = document.getElementById('project-info')!;
const projectTitleEl = document.getElementById('project-title')!;
const projectMetaEl = document.getElementById('project-meta')!;
const btnOpen = document.getElementById('btn-open')!;
const btnSave = document.getElementById('btn-save')!;
const btnPlay = document.getElementById('btn-play')!;
const btnOpenWelcome = document.getElementById('btn-open-welcome')!;
const statusIndicator = document.getElementById('status-indicator')!;
const messageArea = document.getElementById('message-area')!;

// Detail elements
const detailTitle = document.getElementById('detail-title')!;
const detailAuthor = document.getElementById('detail-author')!;
const detailSR = document.getElementById('detail-sr')!;
const detailKsmps = document.getElementById('detail-ksmps')!;
const detailNchnls = document.getElementById('detail-nchnls')!;
const detailVersion = document.getElementById('detail-version')!;
const detailFile = document.getElementById('detail-file')!;

let isPlaying = false;

function showProject(info: Record<string, string>): void {
  welcomeScreen.classList.add('hidden');
  projectView.classList.remove('hidden');
  projectInfo.classList.remove('hidden');
  btnSave.disabled = false;
  btnPlay.disabled = false;

  projectTitleEl.textContent = info.title || 'Untitled';
  projectMetaEl.textContent = `${info.sampleRate || '?'}Hz / ${info.nchnls || '?'}ch`;

  detailTitle.textContent = info.title || 'Untitled';
  detailAuthor.textContent = info.author || '(none)';
  detailSR.textContent = info.sampleRate || '?';
  detailKsmps.textContent = info.ksmps || '?';
  detailNchnls.textContent = info.nchnls || '?';
  detailVersion.textContent = info.version || '?';
  detailFile.textContent = info.filePath || '(unsaved)';
}

function setStatus(status: string, message: string): void {
  statusIndicator.className = `status-${status}`;
  const icon = status === 'playing' ? '▶' : status === 'error' ? '❌' : '⏹';
  const text = message || (status === 'playing' ? 'Playing' : status === 'error' ? 'Error' : 'Stopped');
  statusIndicator.textContent = `${icon} ${text}`;

  btnPlay.textContent = status === 'playing' ? '⏹ Stop' : '▶ Play';
  isPlaying = status === 'playing';
}

function showMessage(message: string, type: 'info' | 'error' = 'info'): void {
  const div = document.createElement('div');
  div.className = `message message-${type}`;
  div.textContent = message;
  messageArea.appendChild(div);
  // Auto-remove after 5 seconds
  setTimeout(() => div.remove(), 5000);
}

// Event listeners
btnOpen.addEventListener('click', async () => {
  await window.blueAPI.openFile();
});

btnOpenWelcome.addEventListener('click', async () => {
  await window.blueAPI.openFile();
});

btnSave.addEventListener('click', async () => {
  await window.blueAPI.saveFile();
});

btnPlay.addEventListener('click', async () => {
  if (isPlaying) {
    window.blueAPI.stopPlayback();
  } else {
    const playing = await window.blueAPI.togglePlay();
    if (playing) {
      setStatus('playing', 'Playing (engine stub)');
    }
  }
});

// IPC event handlers
window.blueAPI.onProjectLoaded((info) => {
  showProject(info);
  showMessage(`Loaded: ${info.title}`, 'info');
});

window.blueAPI.onPlaybackStatus((status) => {
  setStatus(status.status, status.message);
});

window.blueAPI.onPlaybackError((error) => {
  setStatus('error', error);
  showMessage(error, 'error');
});

window.blueAPI.onSaveComplete(() => {
  showMessage('File saved successfully', 'info');
});

window.blueAPI.onSaveError((error) => {
  showMessage(`Save error: ${error}`, 'error');
});

// Signal that renderer is ready
window.blueAPI.onProjectLoaded(() => {}); // Just to ensure API is connected
