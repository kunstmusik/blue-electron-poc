import type { SnapValueName } from '@blue/data';
import type { ScoreLayerGroupSnapshot } from './types';
import ScoreTimeCanvas from './layer-groups/ScoreTimeCanvas';
import AudioLayerGroupCanvas from './layer-groups/AudioLayerGroupCanvas';
import PatternsLayerGroupCanvas from './layer-groups/PatternsLayerGroupCanvas';

const GROUP_SPACER = 36;

interface Props {
  layerGroups: ScoreLayerGroupSnapshot[];
  activeGroupId: string | null;
  onOpenNested: (groupId: string, label: string) => void;
  pixelsPerBeat: number;
  totalBeats: number;
  snapEnabled: boolean;
  snapValue: SnapValueName;
  tempo: number;
  smpteFrameRate: number;
}

export default function LayerPanel({ layerGroups, activeGroupId, onOpenNested, pixelsPerBeat, totalBeats, snapEnabled, snapValue, tempo, smpteFrameRate }: Props) {
  const visibleGroups = activeGroupId === null
    ? layerGroups
    : layerGroups.filter((g) => g.groupId === activeGroupId);

  if (visibleGroups.length === 0) {
    return (
      <div className="flex items-center justify-center text-blue-muted text-sm" style={{ minHeight: 100 }}>
        {activeGroupId !== null
          ? 'Nested score group not found or empty'
          : 'No score layer groups in this project'}
      </div>
    );
  }

  const contentWidth = totalBeats * pixelsPerBeat;

  return (
    <div style={{ minWidth: contentWidth }}>
      {visibleGroups.map((group, gi) => {
        const spacer = gi < visibleGroups.length - 1 ? (
          <div key={`spacer-${group.groupId}`} style={{ height: GROUP_SPACER }} />
        ) : null;

        switch (group.groupType) {
          case 'polyObject':
            return (
              <div key={group.groupId}>
                <ScoreTimeCanvas
                  group={group}
                  pixelsPerBeat={pixelsPerBeat}
                  snapEnabled={snapEnabled}
                  snapValue={snapValue}
                  tempo={tempo}
                  smpteFrameRate={smpteFrameRate}
                  onDoubleClickObject={(objectId) => onOpenNested(objectId, group.name)}
                />
                {spacer}
              </div>
            );
          case 'audio':
            return (
              <div key={group.groupId}>
                <AudioLayerGroupCanvas group={group} pixelsPerBeat={pixelsPerBeat} />
                {spacer}
              </div>
            );
          case 'patterns':
            return (
              <div key={group.groupId}>
                <PatternsLayerGroupCanvas group={group} pixelsPerBeat={pixelsPerBeat} />
                {spacer}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
