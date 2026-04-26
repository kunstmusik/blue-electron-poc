import React, { useCallback } from 'react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import WidgetWrapper from './WidgetWrapper';

interface BSBKnobWidgetProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string, shiftKey?: boolean) => void;
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void;
  resizeMeta?: BSBWidgetResizeMeta;
  gridSnapEnabled?: boolean;
  gridSnapWidth?: number;
  gridSnapHeight?: number;
  selectedWidgetIds?: Set<string>;
  getWidgetPosition?: (id: string) => { x: number; y: number } | undefined;
}

const VALUE_HEIGHT = 14;
const TRACK_BG = 'rgba(255,255,255,0.08)';
const TRACK_FILL = 'rgb(63,102,150)';
const TRACK_FILL_BRIGHT = 'rgb(96,142,192)';

export default function BSBKnobWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
  onBsbInterfacePatch,
  resizeMeta,
  gridSnapEnabled,
  gridSnapWidth,
  gridSnapHeight,
  selectedWidgetIds,
  getWidgetPosition,
}: BSBKnobWidgetProps): React.ReactElement {
  const value = node.value;
  const minimum = node.minimum;
  const maximum = node.maximum;
  const showLabel = node.properties.labelEnabled === true;
  const labelText = typeof node.properties.label === 'string' ? node.properties.label : '';
  const showValue = node.properties.valueDisplayEnabled === true;
  const knobSize = node.width || 60;

  const labelFontName = typeof node.properties['labelFont.name'] === 'string' ? node.properties['labelFont.name'] : 'Roboto';
  const labelFontSize = typeof node.properties['labelFont.size'] === 'number' ? node.properties['labelFont.size'] : 12;

  const range = maximum - minimum || 1;
  const knobVal = Math.max(0, Math.min(1, (value - minimum) / range));

  const strVal = formatValue(value);
  const displayVal = strVal.length > 7 ? strVal.substring(0, 7) : strVal;

  const labelH = showLabel ? 16 : 0;
  const valueH = showValue ? VALUE_HEIGHT : 0;
  const totalH = knobSize + labelH + valueH;

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition}>
      <div className="flex flex-col items-center" style={{ width: knobSize, height: totalH }}>
        {showLabel && (
          <div
            className="flex w-full items-center justify-center overflow-hidden"
            style={{ height: labelH, fontFamily: `'${labelFontName}', Roboto, sans-serif`, fontSize: labelFontSize, color: 'rgb(240,240,255)' }}
          >
            <span className="truncate">{labelText}</span>
          </div>
        )}
        <KnobSVG size={knobSize} value={knobVal} />
        {showValue && (
          <div
            className="flex items-center justify-center"
            style={{ height: valueH, width: knobSize, fontFamily: 'Roboto, sans-serif', fontSize: 11, color: 'rgb(240,240,255)' }}
          >
            {displayVal}
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}

function KnobSVG({ size, value }: { size: number; value: number }): React.ReactElement {
  const trackWidth = Math.max(4, size / 10);
  const trackR = size / 2 - trackWidth / 2;
  const cx = size / 2;
  const cy = size / 2;

  const startAngle = 135;
  const totalSweep = 270;
  const valueSweep = totalSweep * value;

  const knobR = size / 2 - trackWidth - 2;

  const rotation = Math.PI * 2.0 * (-0.625 + value * 0.75);
  const notchAdj = size / 18;
  const notchW = 2 * notchAdj;
  const knobCenterSize = (size - 2) * 0.65;
  const notchLen = knobCenterSize / 2 + notchW;
  const middle = (size - 2) / 2;

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  function rot(x: number, y: number): [number, number] {
    return [cx + x * cos - y * sin, cy + x * sin + y * cos];
  }

  const [rx1, ry1] = rot(-notchAdj, -notchAdj);
  const [rx2, ry2] = rot(-notchAdj + notchLen, -notchAdj);
  const [rx3, ry3] = rot(-notchAdj + notchLen, -notchAdj + notchW);
  const [rx4, ry4] = rot(-notchAdj, -notchAdj + notchW);

  return (
    <svg width={size} height={size} className="block">
      <circle cx={cx} cy={cy} r={trackR} fill="none" stroke={TRACK_BG} strokeWidth={trackWidth} />
      <circle
        cx={cx}
        cy={cy}
        r={trackR}
        fill="none"
        stroke={TRACK_FILL}
        strokeWidth={trackWidth}
        strokeDasharray={`${(2 * Math.PI * trackR)}`}
        strokeDashoffset={`${2 * Math.PI * trackR * (1 - valueSweep / totalSweep)}`}
        transform={`rotate(${startAngle + 90} ${cx} ${cy})`}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={knobR} fill="rgb(30,40,60)" />
      <circle cx={cx} cy={cy} r={knobR} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
      <polygon
        points={`${rx1},${ry1} ${rx2},${ry2} ${rx3},${ry3} ${rx4},${ry4}`}
        fill={TRACK_FILL}
        stroke="rgb(16,16,16)"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <circle
        cx={cx + (knobR - 4) * Math.sin(totalSweep * value * Math.PI / 180 + (startAngle - 90) * Math.PI / 180)}
        cy={cy - (knobR - 4) * Math.cos(totalSweep * value * Math.PI / 180 + (startAngle - 90) * Math.PI / 180)}
        r={3}
        fill={TRACK_FILL_BRIGHT}
      />
    </svg>
  );
}

function formatValue(v: number): string {
  const s = v.toFixed(4);
  const trimmed = s.replace(/\.?0+$/, '');
  return trimmed === '' ? '0' : trimmed;
}
