import { ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { getSnapValue, type SnapValueName, type SnapCategory } from '@blue/data';
import type { ScorePathSegment } from './types';

type ScoreMode = 'score' | 'singleLine' | 'multiLine';

interface Props {
  mode: ScoreMode;
  onModeChange: (mode: ScoreMode) => void;
  pathSegments: ScorePathSegment[];
  onNavigateToSegment: (index: number) => void;
  onNavigateToRoot: () => void;
  snapEnabled: boolean;
  snapValue: SnapValueName;
  onSnapToggle: (enabled: boolean) => void;
  onSnapValueChange: (value: SnapValueName) => void;
  onRulerConfig: () => void;
}

const MODE_OPTIONS: { value: ScoreMode; label: string }[] = [
  { value: 'score', label: 'Score' },
  { value: 'singleLine', label: 'Single Line' },
  { value: 'multiLine', label: 'Multi Line' },
];

const SNAP_GROUPS: { label: string; category: SnapCategory; values: SnapValueName[] }[] = [
  { label: 'Musical', category: 'MUSICAL', values: ['BAR', 'HALF', 'BEAT', 'EIGHTH', 'SIXTEENTH', 'THIRTY_SECOND', 'SIXTY_FOURTH'] },
  { label: 'Triplets', category: 'TRIPLET', values: ['QUARTER_TRIPLET', 'EIGHTH_TRIPLET', 'SIXTEENTH_TRIPLET'] },
  { label: 'Time', category: 'TIME', values: ['ONE_SECOND', 'HUNDRED_MS', 'TEN_MS', 'ONE_MS'] },
  { label: 'SMPTE', category: 'SMPTE', values: ['FRAME'] },
  { label: 'Samples', category: 'SAMPLE', values: ['SAMPLE'] },
];

export default function ScoreToolbar({
  mode,
  onModeChange,
  pathSegments,
  onNavigateToSegment,
  onNavigateToRoot,
  snapEnabled,
  snapValue,
  onSnapToggle,
  onSnapValueChange,
  onRulerConfig,
}: Props) {
  const snapDef = getSnapValue(snapValue);

  return (
    <div className="flex items-center h-7 px-2 bg-blue-surface border-b border-blue-border/40 text-xs select-none shrink-0">
      {/* Mode selection toggle group */}
      <div className="flex items-center mr-2 border border-blue-border/40 rounded overflow-hidden">
        {MODE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`px-2 py-0.5 text-[11px] transition-colors cursor-pointer ${
              mode === opt.value
                ? 'bg-blue-accent/20 text-blue-text font-medium'
                : 'bg-transparent text-blue-muted hover:bg-blue-hover hover:text-blue-text'
            }`}
            onClick={() => onModeChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Breadcrumb navigation path (inline) */}
      <div className="flex items-center gap-1 overflow-x-auto min-w-0">
        {pathSegments.map((segment, i) => (
          <span key={segment.groupId ?? 'root'} className="flex items-center gap-1 whitespace-nowrap">
            {i > 0 && <span className="text-blue-muted">/</span>}
            <button
              className={`px-1 py-0.5 rounded text-[11px] cursor-pointer ${
                i === pathSegments.length - 1
                  ? 'font-medium bg-blue-surface/80 text-blue-text'
                  : 'text-blue-muted hover:bg-blue-hover hover:text-blue-text'
              }`}
              onClick={() => (i === 0 ? onNavigateToRoot() : onNavigateToSegment(i))}
            >
              {segment.label}
            </button>
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Snap button with dropdown */}
      <div className="flex items-stretch mr-1.5 h-[22px]">
        <button
          className={`px-1.5 text-[11px] border rounded-l transition-colors cursor-pointer flex items-center ${
            snapEnabled
              ? 'bg-blue-accent/20 text-blue-text border-blue-accent/40'
              : 'bg-transparent text-blue-muted border-blue-border/40 hover:bg-blue-hover'
          }`}
          onClick={() => onSnapToggle(!snapEnabled)}
          title="Toggle snap on/off"
        >
          Snap: {snapDef.displayName}
        </button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={`px-1 border border-l-0 rounded-r transition-colors cursor-pointer flex items-center ${
                snapEnabled
                  ? 'bg-blue-accent/20 text-blue-text border-blue-accent/40'
                  : 'bg-transparent text-blue-muted border-blue-border/40 hover:bg-blue-hover'
              }`}
              title="Configure snap value"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[140px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50"
              sideOffset={4}
              align="start"
            >
              {SNAP_GROUPS.map((group) => (
                <DropdownMenu.Sub key={group.label}>
                  <DropdownMenu.SubTrigger className="flex items-center justify-between px-3 py-1 text-[11px] text-blue-text rounded-sm outline-none cursor-pointer w-full data-[highlighted]:bg-[rgba(86,119,182,0.46)]">
                    {group.label}
                    <ChevronDown className="w-3 h-3 ml-2 rotate-[-90deg]" />
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      className="min-w-[120px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50"
                      sideOffset={-2}
                      alignOffset={-4}
                    >
                      {group.values.map((name) => {
                        const def = getSnapValue(name);
                        return (
                          <DropdownMenu.Item
                            key={name}
                            className={`px-3 py-1 text-[11px] outline-none cursor-pointer rounded-sm data-[highlighted]:bg-[rgba(86,119,182,0.46)] ${
                              snapValue === name
                                ? 'bg-blue-accent/20 text-blue-text font-medium'
                                : 'text-blue-text'
                            }`}
                            onSelect={() => onSnapValueChange(name)}
                          >
                            {def.displayName}
                          </DropdownMenu.Item>
                        );
                      })}
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
              ))}
              <DropdownMenu.Separator className="h-px bg-blue-border/30 my-1" />
              <DropdownMenu.Item
                className={`px-3 py-1 text-[11px] outline-none cursor-pointer rounded-sm data-[highlighted]:bg-[rgba(86,119,182,0.46)] ${
                  snapValue === 'AUTO'
                    ? 'bg-blue-accent/20 text-blue-text font-medium'
                    : 'text-blue-text'
                }`}
                onSelect={() => onSnapValueChange('AUTO')}
              >
                Auto
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Ruler config button */}
      <button
        className="px-2 py-0.5 text-[11px] border border-blue-border/40 rounded bg-blue-surface hover:bg-blue-hover text-blue-text cursor-pointer transition-colors"
        onClick={onRulerConfig}
        title="Ruler configuration"
      >
        Ruler
      </button>
    </div>
  );
}
