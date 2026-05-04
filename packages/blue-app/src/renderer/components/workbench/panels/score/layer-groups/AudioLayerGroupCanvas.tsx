import type { AudioLayerGroupSnapshot, ScoreLayerSnapshot, ScoreRowObjectSnapshot } from '../types';
import { DEFAULT_ROW_HEIGHT } from '../types';

interface Props {
  group: AudioLayerGroupSnapshot;
  pixelsPerBeat: number;
}

function colorToCSS(argb: number): string {
  const rgb = argb & 0x00FFFFFF;
  return `#${rgb.toString(16).padStart(6, '0')}`;
}

export default function AudioLayerGroupCanvas({ group, pixelsPerBeat }: Props) {
  return (
    <div data-group-id={group.groupId}>
      {group.layers.map((layer: ScoreLayerSnapshot) => (
        <div
          key={layer.layerId}
          className="relative border-b border-blue-border/15 bg-blue-surface/5"
          style={{ height: layer.height || DEFAULT_ROW_HEIGHT }}
        >
          {layer.items.map((item: ScoreRowObjectSnapshot) => {
            const left = item.startBeats * pixelsPerBeat;
            const width = Math.max(item.durationBeats * pixelsPerBeat, 4);
            return (
              <div
                key={item.objectId}
                className="absolute top-[1px] bottom-[1px] rounded-sm px-1 text-[10px] text-white truncate flex items-center"
                style={{
                  left,
                  width,
                  backgroundColor: colorToCSS(item.backgroundColor),
                }}
                title={item.name}
              >
                {item.name}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
