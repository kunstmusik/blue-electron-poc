import React, { useMemo } from 'react';
import { usePlaybackStore } from '../../stores/playback-store';
import { useProjectStore } from '../../stores/project-store';
import {
  buildPlayheadDisplayState,
  buildSelectionDisplayState,
} from './toolbar-formatters';

function ToolbarDisplayCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: JSX.Element;
  className?: string;
}): JSX.Element {
  return (
    <section className={`toolbar-display-card ${className}`.trim()}>
      <div className="toolbar-display-label mb-1">{title}</div>
      {children}
    </section>
  );
}

export default function ToolbarDisplays(): JSX.Element {
  const transport = useProjectStore((s) => s.transport);
  const playback = usePlaybackStore((s) => ({
    status: s.status,
    clock: s.clock,
    display: s.display,
  }));

  const playhead = useMemo(
    () => buildPlayheadDisplayState(transport, playback),
    [playback, transport],
  );
  const selection = useMemo(
    () => buildSelectionDisplayState(transport),
    [transport],
  );

  return (
    <div className="flex flex-1 min-w-0 items-center justify-center gap-3">
      <ToolbarDisplayCard title="Playhead" className="w-[220px]">
        <div className="flex flex-col gap-1">
          <div className="toolbar-display-main">{playhead.primaryText}</div>
          <div className="toolbar-display-secondary">{playhead.secondaryText}</div>
        </div>
      </ToolbarDisplayCard>

      <ToolbarDisplayCard title="Selection" className="w-[360px]">
        <dl className="grid grid-cols-3 gap-3">
          <div className="min-w-0">
            <dt className="toolbar-display-label">Start</dt>
            <dd className="toolbar-display-secondary truncate">{selection.startText}</dd>
          </div>
          <div className="min-w-0">
            <dt className="toolbar-display-label">End</dt>
            <dd className="toolbar-display-secondary truncate">{selection.endText}</dd>
          </div>
          <div className="min-w-0">
            <dt className="toolbar-display-label">Duration</dt>
            <dd className="toolbar-display-secondary truncate">{selection.durationText}</dd>
          </div>
        </dl>
      </ToolbarDisplayCard>
    </div>
  );
}
