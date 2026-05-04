import type { PatternsLayerGroupSnapshot, ScoreLayerSnapshot } from '../types';
import { DEFAULT_ROW_HEIGHT } from '../types';

interface Props {
  group: PatternsLayerGroupSnapshot;
  pixelsPerBeat: number;
}

export default function PatternsLayerGroupCanvas({ group, pixelsPerBeat }: Props) {
  return (
    <div data-group-id={group.groupId}>
      {group.layers.map((layer: ScoreLayerSnapshot) => (
        <div
          key={layer.layerId}
          className="relative border-b border-blue-border/15 bg-blue-surface/5"
          style={{ height: layer.height || DEFAULT_ROW_HEIGHT }}
        >
        </div>
      ))}
    </div>
  );
}
