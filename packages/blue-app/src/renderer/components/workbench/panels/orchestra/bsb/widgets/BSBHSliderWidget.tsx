import React, { useCallback, useRef, useEffect } from 'react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import WidgetWrapper from './WidgetWrapper';

interface BSBHSliderWidgetProps {
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
const SLIDER_HEIGHT = 30;
const TRACK_H = 4;
const THUMB_R = 7;

export default function BSBHSliderWidget({
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
}: BSBHSliderWidgetProps): React.ReactElement {
  const sliderWidth = typeof node.properties.sliderWidth === 'number' ? node.properties.sliderWidth : 150;
  const value = node.value;
  const minimum = node.minimum;
  const maximum = node.maximum;
  const showValue = node.properties.valueDisplayEnabled === true;

  const totalWidth = sliderWidth + (showValue ? VALUE_PANEL_WIDTH : 0);
  const range = maximum - minimum || 1;
  const pct = Math.max(0, Math.min(1, (value - minimum) / range));

  const strVal = formatValue(value);
  const displayVal = strVal.length > 7 ? strVal.substring(0, 7) : strVal;

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const paramsRef = useRef({ sliderWidth, minimum, range, nodeId: node.id });
  paramsRef.current = { sliderWidth, minimum, range, nodeId: node.id };
  const patchRef = useRef(onBsbInterfacePatch);
  patchRef.current = onBsbInterfacePatch;

  useEffect(() => {
    if (editEnabled) return;
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !svgRef.current) return;
      e.preventDefault();
      const { sliderWidth: sw, minimum: min, range: r, nodeId } = paramsRef.current;
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const trackStart = THUMB_R;
      const trackEnd = sw - THUMB_R;
      const newPct = Math.max(0, Math.min(1, (x - trackStart) / (trackEnd - trackStart)));
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
    const { sliderWidth: sw, minimum: min, range: r, nodeId } = paramsRef.current;
    const rect = svgRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const trackStart = THUMB_R;
    const trackEnd = sw - THUMB_R;
    const newPct = Math.max(0, Math.min(1, (x - trackStart) / (trackEnd - trackStart)));
    const newVal = min + newPct * r;
    patchRef.current({
      type: 'updateWidgetProperties',
      widgetId: nodeId,
      properties: { value: newVal },
    });
  }, [editEnabled]);

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition}>
      <div className="flex" style={{ width: totalWidth, height: SLIDER_HEIGHT }}>
        <svg
          ref={svgRef}
          width={sliderWidth}
          height={SLIDER_HEIGHT}
          className="block"
          style={{ cursor: editEnabled ? 'default' : 'pointer' }}
          onMouseDown={handleMouseDown}
        >
          <rect
            x={THUMB_R}
            y={SLIDER_HEIGHT / 2 - TRACK_H / 2}
            width={sliderWidth - 2 * THUMB_R}
            height={TRACK_H}
            rx={2}
            ry={2}
            fill="rgb(63,102,150)"
          />
          <rect
            x={THUMB_R}
            y={SLIDER_HEIGHT / 2 - TRACK_H / 2}
            width={(sliderWidth - 2 * THUMB_R) * pct}
            height={TRACK_H}
            rx={2}
            ry={2}
            fill="rgb(102,177,253)"
          />
          <circle
            cx={THUMB_R + (sliderWidth - 2 * THUMB_R) * pct}
            cy={SLIDER_HEIGHT / 2}
            r={THUMB_R}
            fill="rgb(102,177,253)"
          />
          <circle
            cx={THUMB_R + (sliderWidth - 2 * THUMB_R) * pct}
            cy={SLIDER_HEIGHT / 2}
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

interface ValuePanelProps {
  value: string;
  width: number;
  height: number;
  onCommit?: (text: string) => void;
}

export function ValuePanel({ value, width, height, onCommit }: ValuePanelProps): React.ReactElement {
  const [editing, setEditing] = React.useState(false);
  const [editText, setEditText] = React.useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = useCallback(() => {
    if (!onCommit) return;
    setEditText(value);
    setEditing(true);
  }, [onCommit, value]);

  const commit = useCallback(() => {
    setEditing(false);
    onCommit?.(editText);
  }, [editText, onCommit]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <div className="relative shrink-0" style={{ width, height }}>
        <input
          ref={inputRef}
          className="h-full w-full rounded border border-blue-accent bg-[#111a2d] px-1 text-center font-mono text-[11px] text-gray-100 outline-none"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
          onBlur={commit}
        />
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className="block shrink-0"
      onDoubleClick={startEdit}
      style={{ cursor: onCommit ? 'text' : 'default' }}
    >
      <rect x={0} y={0} width={width} height={height} rx={6} ry={6} fill="rgb(20,29,45)" />
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgb(240,240,255)"
        fontFamily="Roboto, sans-serif"
        fontSize={11}
      >
        {value}
      </text>
    </svg>
  );
}

export function formatValue(v: number): string {
  const s = v.toFixed(4);
  const trimmed = s.replace(/\.?0+$/, '');
  return trimmed === '' ? '0' : trimmed;
}
