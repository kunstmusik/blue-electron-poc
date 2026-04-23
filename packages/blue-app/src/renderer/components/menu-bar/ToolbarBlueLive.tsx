import React from 'react';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useWorkbenchStore } from '../../stores/workbench-store';

function ToolbarTextButton({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick?: () => void | Promise<void>;
  children: ReactNode;
}): JSX.Element {
  return (
    <button
      type="button"
      className={clsx('toolbar-text-button', active && 'is-active')}
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

export default function ToolbarBlueLive(): JSX.Element {
  const openPanel = useWorkbenchStore((s) => s.openPanel);
  const isBlueLiveOpen = useWorkbenchStore((s) => s.isPanelOpen('BlueLiveTopComponent'));
  const isMidiInputOpen = useWorkbenchStore((s) => s.isPanelOpen('MidiInputPanelTopComponent'));

  return (
    <div className="toolbar-group" aria-label="Blue Live controls">
      <ToolbarTextButton
        title="Open Blue Live panel"
        active={isBlueLiveOpen}
        onClick={() => openPanel('BlueLiveTopComponent')}
      >
        Blue Live
      </ToolbarTextButton>
      <ToolbarTextButton
        title="Recompile is not wired in this slice"
        disabled
      >
        Recompile
      </ToolbarTextButton>
      <ToolbarTextButton
        title="All Notes Off is not wired in this slice"
        disabled
      >
        All Notes Off
      </ToolbarTextButton>
      <ToolbarTextButton
        title="Open MIDI Input panel"
        active={isMidiInputOpen}
        onClick={() => openPanel('MidiInputPanelTopComponent')}
      >
        MIDI Input
      </ToolbarTextButton>
    </div>
  );
}
