import { Play, Square } from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import { usePlaybackStore } from '../../stores/playback-store';

export default function PlaybackControls(): JSX.Element {
  const hasProject = useProjectStore((s) => s.filePath !== null);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const togglePlay = usePlaybackStore((s) => s.togglePlay);
  const stop = usePlaybackStore((s) => s.stop);

  const handleToggle = async () => {
    if (isPlaying) {
      stop();
    } else {
      await togglePlay();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        className={`btn ${isPlaying ? 'btn-primary' : ''}`}
        onClick={handleToggle}
        disabled={!hasProject}
      >
        {isPlaying ? (
          <Square className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {isPlaying ? 'Stop' : 'Play'}
      </button>
    </div>
  );
}
