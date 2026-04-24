import { Play, Square } from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import { usePlaybackStore } from '../../stores/playback-store';

export default function PlaybackControls(): React.ReactElement {
  const hasProject = useProjectStore((s) => s.filePath !== null);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const status = usePlaybackStore((s) => s.status);
  const togglePlay = usePlaybackStore((s) => s.togglePlay);
  const stop = usePlaybackStore((s) => s.stop);
  const isStarting = status === 'starting';
  const isStopping = status === 'stopping';
  const isBusy = isStarting || isStopping;

  const handleToggle = async () => {
    if (isBusy) {
      return;
    }

    if (isPlaying) {
      await stop();
    } else {
      await togglePlay();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className={`btn ${isPlaying ? 'btn-primary' : ''}`}
        onClick={handleToggle}
        disabled={!hasProject || isBusy}
      >
        {isPlaying ? (
          <Square className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {isStarting ? 'Starting...' : isStopping ? 'Stopping...' : isPlaying ? 'Stop' : 'Play'}
      </button>
    </div>
  );
}
