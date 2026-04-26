import React from 'react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import WidgetWrapper from './WidgetWrapper';

interface BSBLineObjectWidgetProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string) => void;
  onBsbInterfacePatch?: (patch: BsbInterfacePatch) => void;
  resizeMeta?: BSBWidgetResizeMeta;
  gridSnapEnabled?: boolean;
  gridSnapWidth?: number;
  gridSnapHeight?: number;
}

interface LinePoint {
  x: number;
  y: number;
}

interface LineData {
  varName: string;
  points: LinePoint[];
}

export default function BSBLineObjectWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
  onBsbInterfacePatch,
  resizeMeta,
  gridSnapEnabled,
  gridSnapWidth,
  gridSnapHeight,
}: BSBLineObjectWidgetProps): React.ReactElement {
  const linesRaw = node.properties.lines;
  const lines: LineData[] = Array.isArray(linesRaw) ? linesRaw as LineData[] : [];
  const w = node.width || 200;
  const h = node.height || 100;

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch}>
      <div className="h-full w-full overflow-hidden rounded border border-blue-border/40 bg-[#0a0f1a]">
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
          {lines.map((line, li) => {
            if (!line.points || line.points.length < 2) return null;
            const pts = line.points.map((p) => {
              const px = p.x * w;
              const py = (1 - p.y) * h;
              return `${px},${py}`;
            });
            return (
              <polyline
                key={li}
                points={pts.join(' ')}
                fill="none"
                stroke="#e94560"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
            );
          })}
          {lines.flatMap((line, li) =>
            line.points?.map((p, pi) => (
              <circle
                key={`${li}-${pi}`}
                cx={p.x * w}
                cy={(1 - p.y) * h}
                r={3}
                fill="#e94560"
                stroke="#0a0f1a"
                strokeWidth={1}
              />
            )) ?? [],
          )}
        </svg>
      </div>
    </WidgetWrapper>
  );
}
