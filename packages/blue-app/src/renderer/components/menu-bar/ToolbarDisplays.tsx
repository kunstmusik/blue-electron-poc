import React, { forwardRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { Check, ChevronRight } from 'lucide-react';
import { usePlaybackStore } from '../../stores/playback-store';
import { useProjectStore } from '../../stores/project-store';
import {
  buildPlayheadDisplayState,
  buildSelectionDisplayState,
  DEFAULT_PLAYHEAD_PRIMARY_MODE,
  DEFAULT_PLAYHEAD_SECONDARY_MODE,
  TOOLBAR_TIME_DISPLAY_FORMATS,
  getTimeDisplayFormatMenuLabel,
  type ToolbarDisplayMode,
} from './toolbar-formatters';

const ToolbarDisplayCard = forwardRef<HTMLElement, ComponentPropsWithoutRef<'section'> & {
  title: string;
}>(
  ({ title, children, className = '', ...props }, ref): JSX.Element => (
    <section
      ref={ref}
      className={`toolbar-display-card ${className}`.trim()}
      {...props}
    >
      <div className="toolbar-display-label mb-0.5">{title}</div>
      {children}
    </section>
  ),
);

ToolbarDisplayCard.displayName = 'ToolbarDisplayCard';

function ContextMenuCheckItem({
  checked,
  onSelect,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <ContextMenu.CheckboxItem
      className="toolbar-context-menu__item"
      checked={checked}
      onCheckedChange={(nextChecked) => {
        if (nextChecked) {
          onSelect();
        }
      }}
    >
      <ContextMenu.ItemIndicator className="toolbar-context-menu__item-indicator">
        <Check size={12} strokeWidth={2.5} />
      </ContextMenu.ItemIndicator>
      {children}
    </ContextMenu.CheckboxItem>
  );
}

function ToolbarFormatSubmenu({
  label,
  mode,
  onModeChange,
  portalContainer,
  includeOff = false,
  offLabel = 'Off',
}: {
  label: string;
  mode: ToolbarDisplayMode;
  onModeChange: (mode: ToolbarDisplayMode) => void;
  portalContainer?: HTMLElement;
  includeOff?: boolean;
  offLabel?: string;
}): JSX.Element {
  return (
    <ContextMenu.Sub>
      <ContextMenu.SubTrigger className="toolbar-context-menu__item">
        <span>{label}</span>
        <ChevronRight size={12} style={{ marginLeft: 'auto', flexShrink: 0 }} />
      </ContextMenu.SubTrigger>
      {portalContainer ? (
        <ContextMenu.Portal container={portalContainer}>
          <ContextMenu.SubContent
            className="toolbar-context-menu"
            sideOffset={6}
            alignOffset={-4}
          >
            {includeOff ? (
              <ContextMenuCheckItem checked={mode === 'off'} onSelect={() => onModeChange('off')}>
                {offLabel}
              </ContextMenuCheckItem>
            ) : null}

            {includeOff ? (
              <ContextMenu.Separator className="toolbar-context-menu__separator" />
            ) : null}

            <ContextMenuCheckItem checked={mode === 'sync'} onSelect={() => onModeChange('sync')}>
              Sync to {label === 'Primary' ? 'Primary' : 'Secondary'} Ruler
            </ContextMenuCheckItem>

            <ContextMenu.Separator className="toolbar-context-menu__separator" />

            {TOOLBAR_TIME_DISPLAY_FORMATS.map((format) => (
              <ContextMenuCheckItem
                key={format}
                checked={mode === format}
                onSelect={() => onModeChange(format)}
              >
                {getTimeDisplayFormatMenuLabel(format)}
              </ContextMenuCheckItem>
            ))}
          </ContextMenu.SubContent>
        </ContextMenu.Portal>
      ) : null}
    </ContextMenu.Sub>
  );
}

function ToolbarPlayheadMenu({
  children,
  primaryMode,
  secondaryMode,
  onPrimaryModeChange,
  onSecondaryModeChange,
}: {
  children: ReactNode;
  primaryMode: ToolbarDisplayMode;
  secondaryMode: ToolbarDisplayMode;
  onPrimaryModeChange: (mode: ToolbarDisplayMode) => void;
  onSecondaryModeChange: (mode: ToolbarDisplayMode) => void;
}): JSX.Element {
  const portalContainer = typeof document !== 'undefined' ? document.body : undefined;

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      {portalContainer ? (
        <ContextMenu.Portal container={portalContainer}>
          <ContextMenu.Content
            className="toolbar-context-menu"
            sideOffset={6}
            align="start"
          >
            <ToolbarFormatSubmenu
              label="Primary"
              mode={primaryMode}
              onModeChange={onPrimaryModeChange}
              portalContainer={portalContainer}
            />

            <ContextMenu.Separator className="toolbar-context-menu__separator" />

            <ToolbarFormatSubmenu
              label="Secondary"
              mode={secondaryMode}
              onModeChange={onSecondaryModeChange}
              portalContainer={portalContainer}
              includeOff
            />
          </ContextMenu.Content>
        </ContextMenu.Portal>
      ) : null}
    </ContextMenu.Root>
  );
}

export default function ToolbarDisplays(): JSX.Element {
  const transport = useProjectStore((s) => s.transport);
  const status = usePlaybackStore((s) => s.status);
  const clock = usePlaybackStore((s) => s.clock);
  const display = usePlaybackStore((s) => s.display);
  const [primaryMode, setPrimaryMode] = useState<ToolbarDisplayMode>(DEFAULT_PLAYHEAD_PRIMARY_MODE);
  const [secondaryMode, setSecondaryMode] = useState<ToolbarDisplayMode>(DEFAULT_PLAYHEAD_SECONDARY_MODE);

  const playhead = buildPlayheadDisplayState(transport, {
    status,
    clock,
    display,
  }, {
    primaryMode,
    secondaryMode,
  });
  const selection = buildSelectionDisplayState(transport);

  const playheadCard = (
    <ToolbarDisplayCard title="Playhead" className="w-[236px]">
      <div className="toolbar-display-values toolbar-display-values--playhead">
        <div className="toolbar-display-main toolbar-display-main--playhead">{playhead.primaryText}</div>
        {playhead.secondaryText ? (
          <div className="toolbar-display-secondary toolbar-display-secondary--playhead">
            {playhead.secondaryText}
          </div>
        ) : null}
      </div>
    </ToolbarDisplayCard>
  );

  return (
    <div className="toolbar-displays flex flex-1 min-w-0 items-center justify-center">
      <div className="toolbar-displays__inner">
        <ToolbarPlayheadMenu
          primaryMode={primaryMode}
          secondaryMode={secondaryMode}
          onPrimaryModeChange={setPrimaryMode}
          onSecondaryModeChange={setSecondaryMode}
        >
          {playheadCard}
        </ToolbarPlayheadMenu>

        <ToolbarDisplayCard title="Selection" className="w-[328px]">
          <div className="toolbar-display-values toolbar-display-values--selection">
            <div className="toolbar-display-secondary toolbar-display-secondary--selection">
              {selection.startText}
            </div>
            <div className="toolbar-display-secondary toolbar-display-secondary--selection">
              {selection.endText}
            </div>
            <div className="toolbar-display-secondary toolbar-display-secondary--selection">
              {selection.durationText}
            </div>
          </div>
        </ToolbarDisplayCard>
      </div>
    </div>
  );
}
