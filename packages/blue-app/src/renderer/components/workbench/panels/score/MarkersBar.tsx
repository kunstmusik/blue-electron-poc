import type { MarkerSnapshot } from '../../../../../shared/project-editor';

interface Props {
  markers: MarkerSnapshot[];
  totalBeats: number;
  pixelsPerBeat: number;
  rowVisible: boolean;
}

export default function MarkersBar({ markers, totalBeats, pixelsPerBeat, rowVisible }: Props) {
  if (!rowVisible) return null;

  return (
    <div className="relative h-5 border-b border-blue-border/30 overflow-hidden" style={{ minWidth: totalBeats * pixelsPerBeat }}>
      {markers.map((marker, i) => {
        const left = marker.time * pixelsPerBeat;
        return (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex items-center"
            style={{ left }}
          >
            <div className="relative flex items-center h-full">
              <div
                className="absolute bottom-0 w-0 h-0"
                style={{
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: '6px solid #f59e0b',
                  left: -4,
                }}
              />
              <span
                className="ml-1 text-[9px] text-amber-400 whitespace-nowrap cursor-pointer hover:text-amber-300"
                style={{ marginTop: 2 }}
              >
                {marker.name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
