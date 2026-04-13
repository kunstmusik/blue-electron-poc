import { FolderOpen, Save, SaveAll, Play, Square, Settings } from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import { usePlaybackStore } from '../../stores/playback-store';

export default function MenuBar(): JSX.Element {
  const hasProject = useProjectStore((s) => s.filePath !== null);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const isLoading = useProjectStore((s) => s.isLoading);

  const handleOpen = async () => {
    await window.blueAPI.openFile();
  };

  const handleSave = async () => {
    await window.blueAPI.saveFile();
  };

  const handleSaveAs = async () => {
    await window.blueAPI.saveFileAs();
  };

  const handlePlay = async () => {
    if (isPlaying) {
      window.blueAPI.stopPlayback();
    } else {
      await window.blueAPI.togglePlay();
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-blue-surface border-b border-blue-border h-12 shrink-0">
      {/* Left: App title + project info */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-blue-accent">Blue</h1>
        {hasProject && (
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight">
              {useProjectStore.getState().title || 'Untitled'}
            </span>
            <span className="text-xs text-blue-muted leading-tight">
              {useProjectStore.getState().sampleRate}Hz / stereo
            </span>
          </div>
        )}
      </div>

      {/* Center: Menu buttons */}
      <div className="flex items-center gap-2">
        <button
          className="btn"
          onClick={handleOpen}
          disabled={isLoading}
          title="Open .blue file (Cmd+O)"
        >
          <FolderOpen className="w-4 h-4" />
          Open
        </button>
        <button
          className="btn"
          onClick={handleSave}
          disabled={!hasProject || isLoading}
          title="Save (Cmd+S)"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          className="btn"
          onClick={handleSaveAs}
          disabled={!hasProject || isLoading}
          title="Save As (Cmd+Shift+S)"
        >
          <SaveAll className="w-4 h-4" />
          Save As
        </button>
      </div>

      {/* Right: Playback controls */}
      <div className="flex items-center gap-2">
        <button
          className={`btn ${isPlaying ? 'btn-primary' : ''}`}
          onClick={handlePlay}
          disabled={!hasProject || isLoading}
          title={isPlaying ? 'Stop (Esc)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <Square className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isPlaying ? 'Stop' : 'Play'}
        </button>

        <StatusIndicator />
      </div>
    </header>
  );
}

function StatusIndicator(): JSX.Element {
  const status = usePlaybackStore((s) => s.status);
  const message = usePlaybackStore((s) => s.message);

  const statusClass =
    status === 'playing'
      ? 'status-playing'
      : status === 'error'
        ? 'status-error'
        : 'status-stopped';

  const icon = status === 'playing' ? '▶' : status === 'error' ? '❌' : '⏹';
  const text = message || (status === 'playing' ? 'Playing' : status === 'error' ? 'Error' : 'Stopped');

  return (
    <span className={`status-indicator ${statusClass}`} title={text}>
      {icon} {text}
    </span>
  );
}
