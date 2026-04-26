import React from 'react';
import { SkipBack, SkipForward, Rewind, Play, Square, Repeat } from 'lucide-react';
import clsx from 'clsx';
import { usePlaybackStore } from '../../stores/playback-store';
import { useProjectStore } from '../../stores/project-store';

function ToolbarIconButton({
  active,
  disabled,
  title,
  children,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactElement;
  onClick?: () => void | Promise<void>;
}): React.ReactElement {
  return (
    <button
      type="button"
      className={clsx('toolbar-icon-button', active && 'is-active')}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      onClick={() => {
        void onClick?.();
      }}
    >
      {children}
    </button>
  );
}

export default function ToolbarTransport(): React.ReactElement {
  const hasProject = useProjectStore((s) => s.filePath !== null);
  const isLoading = useProjectStore((s) => s.isLoading);
  const loopRendering = useProjectStore((s) => s.transport.loopRendering);
  const setLoopRendering = useProjectStore((s) => s.setLoopRendering);
  const flushPatches = useProjectStore((s) => s.flushPendingPatches);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const status = usePlaybackStore((s) => s.status);
  const followPlayback = usePlaybackStore((s) => s.followPlayback);
  const toggleFollowPlayback = usePlaybackStore((s) => s.toggleFollowPlayback);
  const togglePlay = usePlaybackStore((s) => s.togglePlay);
  const stopPlayback = usePlaybackStore((s) => s.stop);

  const isBusy = status === 'starting' || status === 'stopping';
  const canControl = hasProject && !isLoading;
  const showStop = isPlaying || status === 'stopping';

  const handlePlay = async () => {
    await flushPatches();
    await togglePlay();
  };

  return (
    <div className="toolbar-group" aria-label="Transport controls">
      <ToolbarIconButton
        title="Previous marker (not available yet)"
        disabled
      >
        <SkipBack className="h-4 w-4" aria-hidden="true" />
      </ToolbarIconButton>
      <ToolbarIconButton
        title="Next marker (not available yet)"
        disabled
      >
        <SkipForward className="h-4 w-4" aria-hidden="true" />
      </ToolbarIconButton>
      <ToolbarIconButton
        title="Rewind (not available yet)"
        disabled
      >
        <Rewind className="h-4 w-4" aria-hidden="true" />
      </ToolbarIconButton>
      {showStop ? (
        <ToolbarIconButton
          title={status === 'stopping' ? 'Stopping playback...' : 'Stop playback'}
          active
          disabled={!canControl || isBusy}
          onClick={stopPlayback}
        >
          <Square className="h-4 w-4" aria-hidden="true" />
        </ToolbarIconButton>
      ) : (
        <ToolbarIconButton
          title={status === 'starting' ? 'Starting playback...' : 'Play'}
          disabled={!canControl || isBusy}
          onClick={handlePlay}
        >
          <Play className="h-4 w-4" aria-hidden="true" />
        </ToolbarIconButton>
      )}
      <ToolbarIconButton
        title={followPlayback ? 'Follow playback on' : 'Follow playback off'}
        active={followPlayback}
        disabled={!hasProject}
        onClick={toggleFollowPlayback}
      >
        <span className="font-mono text-sm font-semibold leading-none">F</span>
      </ToolbarIconButton>
      <ToolbarIconButton
        title={loopRendering ? 'Loop rendering on' : 'Loop rendering off'}
        active={loopRendering}
        disabled={!hasProject || isLoading}
        onClick={() => setLoopRendering(!loopRendering)}
      >
        <Repeat className="h-4 w-4" aria-hidden="true" />
      </ToolbarIconButton>
    </div>
  );
}
