import { FolderOpen, Save, SaveAll, Play, Square } from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import { usePlaybackStore } from '../../stores/playback-store';
import { useUIStore } from '../../stores/ui-store';
import WindowMenu from '../workbench/WindowMenu';

export default function MenuBar(): JSX.Element {
  const hasProject = useProjectStore((s) => s.filePath !== null);
  const isLoading = useProjectStore((s) => s.isLoading);
  const title = useProjectStore((s) => s.title);
  const sampleRate = useProjectStore((s) => s.sampleRate);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const status = usePlaybackStore((s) => s.status);
  const message = usePlaybackStore((s) => s.message);
  const activePanel = useUIStore((s) => s.activePanel);

  const openFile = useProjectStore((s) => s.loadProject);
  const saveProject = useProjectStore((s) => s.saveProject);
  const saveProjectAs = useProjectStore((s) => s.saveProjectAs);
  const togglePlay = usePlaybackStore((s) => s.togglePlay);
  const stopPlayback = usePlaybackStore((s) => s.stop);

  const handlePlay = async () => {
    await togglePlay();
  };

  const handleStop = () => {
    stopPlayback();
  };

  const statusClass =
    status === 'playing'
      ? 'status-playing'
      : status === 'error'
        ? 'status-error'
        : 'status-stopped';

  const icon = status === 'playing' ? '▶' : status === 'error' ? '❌' : '⏹';
  const statusText = message || (status === 'playing' ? 'Playing' : status === 'error' ? 'Error' : 'Stopped');

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-blue-surface border-b border-blue-border h-12 shrink-0">
      {/* Left: App title + project info */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-blue-accent">Blue</h1>
        {hasProject && (
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight">{title || 'Untitled'}</span>
            <span className="text-xs text-blue-muted leading-tight">{sampleRate}Hz / stereo</span>
          </div>
        )}
      </div>

      {/* Center: Menu buttons */}
      <div className="flex items-center gap-2">
        <button className="btn" onClick={openFile} disabled={isLoading} title="Open .blue file (Cmd+O)">
          <FolderOpen className="w-4 h-4" />
          Open
        </button>
        <button className="btn" onClick={saveProject} disabled={!hasProject || isLoading} title="Save (Cmd+S)">
          <Save className="w-4 h-4" />
          Save
        </button>
        <button className="btn" onClick={saveProjectAs} disabled={!hasProject || isLoading} title="Save As (Cmd+Shift+S)">
          <SaveAll className="w-4 h-4" />
          Save As
        </button>
        {activePanel === 'project' && <WindowMenu />}
      </div>

      {/* Right: Playback controls */}
      <div className="flex items-center gap-2">
        {isPlaying ? (
          <button className="btn btn-primary" onClick={handleStop} disabled={!hasProject} title="Stop (Esc)">
            <Square className="w-4 h-4" />
            Stop
          </button>
        ) : (
          <button className="btn" onClick={handlePlay} disabled={!hasProject || isLoading} title="Play (Space)">
            <Play className="w-4 h-4" />
            Play
          </button>
        )}

        <span className={`status-indicator ${statusClass}`} title={statusText}>
          {icon} {statusText}
        </span>
      </div>
    </header>
  );
}
