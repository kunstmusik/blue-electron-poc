import React, { useCallback, useRef, useEffect } from 'react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import WidgetWrapper from './WidgetWrapper';
import { ValuePanel, formatValue } from './BSBHSliderWidget';

interface BSBVSliderWidgetProps {
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

const VALUE_PANEL_WIDTH = 50;
const VALUE_PANEL_HEIGHT = 30;
const SLIDER_WIDTH = 50;
const TRACK_W = 4;
const THUMB_R = 7;

export default function BSBVSliderWidget({
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
}: BSBVSliderWidgetProps): React.ReactElement {
  const sliderHeight = typeof node.properties.sliderHeight === 'number' ? node.properties.sliderHeight : 150;
  const value = node.value;
  const minimum = node.minimum;
  const maximum = node.maximum;
  const showValue = node.properties.valueDisplayEnabled === true;

  const totalHeight = sliderHeight + (showValue ? VALUE_PANEL_HEIGHT : 0);
  const range = maximum - minimum || 1;
  const pct = Math.max(0, Math.min(1, (value - minimum) / range));

  const strVal = formatValue(value);
  const displayVal = strVal.length > 7 ? strVal.substring(0, 7) : strVal;

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const paramsRef = useRef({ sliderHeight, minimum, range, nodeId: node.id });
  paramsRef.current = { sliderHeight, minimum, range, nodeId: node.id };
  const patchRef = useRef(onBsbInterfacePatch);
  patchRef.current = onBsbInterfacePatch;

  useEffect(() => {
    if (editEnabled) return;
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !svgRef.current) return;
      e.preventDefault();
      const { sliderHeight: sh, minimum: min, range: r, nodeId } = paramsRef.current;
      const rect = svgRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const trackStart = THUMB_R;
      const trackEnd = sh - THUMB_R;
      const newPct = 1 - Math.max(0, Math.min(1, (y - trackStart) / (trackEnd - trackStart)));
      const newVal = min + newPct * r;
      patchRef.current({
        type: 'updateWidgetProperties',
        widgetId: nodeId,
        properties: { value: newVal },
      });
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [editEnabled]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (editEnabled) return;
    e.preventDefault();
    dragging.current = true;
    const { sliderHeight: sh, minimum: min, range: r, nodeId } = paramsRef.current;
    const rect = svgRef.current!.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const trackStart = THUMB_R;
    const trackEnd = sh - THUMB_R;
    const newPct = 1 - Math.max(0, Math.min(1, (y - trackStart) / (trackEnd - trackStart)));
    const newVal = min + newPct * r;
    patchRef.current({
      type: 'updateWidgetProperties',
      widgetId: nodeId,
      properties: { value: newVal },
    });
  }, [editEnabled]);

  const trackX = SLIDER_WIDTH / 2 - TRACK_W / 2;
  const thumbCy = sliderHeight - THUMB_R - (sliderHeight - 2 * THUMB_R) * pct;

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition}>
      <div className="flex flex-col" style={{ width: SLIDER_WIDTH, height: totalHeight }}>
        <svg
          ref={svgRef}
          width={SLIDER_WIDTH}
          height={sliderHeight}
          className="block"
          style={{ cursor: editEnabled ? 'default' : 'pointer' }}
          onMouseDown={handleMouseDown}
        >
          <rect
            x={trackX}
            y={THUMB_R}
            width={TRACK_W}
            height={sliderHeight - 2 * THUMB_R}
            rx={2}
            ry={2}
            fill="rgb(63,102,150)"
          />
          <rect
            x={trackX}
            y={thumbCy}
            width={TRACK_W}
            height={sliderHeight - THUMB_R - thumbCy}
            rx={2}
            ry={2}
            fill="rgb(102,177,253)"
          />
          <circle
            cx={SLIDER_WIDTH / 2}
            cy={thumbCy}
            r={THUMB_R}
            fill="rgb(102,177,253)"
          />
          <circle
            cx={SLIDER_WIDTH / 2}
            cy={thumbCy}
            r={THUMB_R - 2}
            fill="rgb(38,51,76)"
          />
        </svg>
        {showValue && (
          <ValuePanel
            value={displayVal}
            width={VALUE_PANEL_WIDTH}
            height={VALUE_PANEL_HEIGHT}
            onCommit={(v) => {
              const parsed = parseFloat(v);
              if (!isNaN(parsed)) {
                onBsbInterfacePatch({
                  type: 'updateWidgetProperties',
                  widgetId: node.id,
                  properties: { value: Math.max(minimum, Math.min(maximum, parsed)) },
                });
              }
            }}
          />
        )}
      </div>
    </WidgetWrapper>
  );
}
