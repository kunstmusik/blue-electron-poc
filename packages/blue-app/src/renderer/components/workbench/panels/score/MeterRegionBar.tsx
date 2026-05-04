import type { MeterSnapshot } from '../../../../../shared/project-editor';

interface Props {
  meters: MeterSnapshot[];
  totalBeats: number;
  pixelsPerBeat: number;
  rowVisible: boolean;
}

const METER_COLORS = [
  'rgba(59, 130, 246, 0.15)',
  'rgba(168, 85, 247, 0.15)',
  'rgba(59, 130, 246, 0.12)',
  'rgba(168, 85, 247, 0.12)',
];

export default function MeterRegionBar({ meters, totalBeats, pixelsPerBeat, rowVisible }: Props) {
  if (!rowVisible || meters.length === 0) return null;

  const regions: Array<{ startBeat: number; endBeat: number; label: string; color: string }> = [];
  for (let i = 0; i < meters.length; i++) {
    const meter = meters[i];
    const nextMeter = meters[i + 1];
    const startBeat = (meter.measure - 1) * meter.numBeats;
    const endBeat = nextMeter ? (nextMeter.measure - 1) * nextMeter.numBeats : totalBeats;
    regions.push({
      startBeat,
      endBeat,
      label: `${meter.numBeats}/${meter.beatLength}`,
      color: METER_COLORS[i % METER_COLORS.length],
    });
  }

  return (
    <div className="relative h-5 border-b border-blue-border/30 overflow-hidden" style={{ minWidth: totalBeats * pixelsPerBeat }}>
      {regions.map((region, i) => {
        const left = region.startBeat * pixelsPerBeat;
        const width = (region.endBeat - region.startBeat) * pixelsPerBeat;
        return (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex items-center border-r border-blue-border/20"
            style={{ left, width, backgroundColor: region.color }}
          >
            <span className="px-1 text-[9px] text-blue-muted whitespace-nowrap overflow-hidden">
              {region.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
