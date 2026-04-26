import React, { useCallback, useRef } from 'react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import WidgetWrapper from './WidgetWrapper';

interface BSBXYControllerWidgetProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string, shiftKey?: boolean) => void;
  onBsbInterfacePatch?: (patch: BsbInterfacePatch) => void;
  resizeMeta?: BSBWidgetResizeMeta;
  gridSnapEnabled?: boolean;
  gridSnapWidth?: number;
  gridSnapHeight?: number;
  selectedWidgetIds?: Set<string>;
  getWidgetPosition?: (id: string) => { x: number; y: number } | undefined;
}

export default function BSBXYControllerWidget({
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
}: BSBXYControllerWidgetProps): React.ReactElement {
  const xValue = typeof node.properties.xValue === 'number' ? node.properties.xValue : 0;
  const yValue = typeof node.properties.yValue === 'number' ? node.properties.yValue : 0;
  const xMin = typeof node.properties.xMin === 'number' ? node.properties.xMin : 0;
  const xMax = typeof node.properties.xMax === 'number' ? node.properties.xMax : 1;
  const yMin = typeof node.properties.yMin === 'number' ? node.properties.yMin : 0;
  const yMax = typeof node.properties.yMax === 'number' ? node.properties.yMax : 1;
  const showValue = node.properties.valueDisplayEnabled === true;

  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  const xPct = Math.max(0, Math.min(1, (xValue - xMin) / xRange));
  const yPct = Math.max(0, Math.min(1, (yValue - yMin) / yRange));

  const padRef = useRef<HTMLDivElement | null>(null);
  const patchRef = useRef(onBsbInterfacePatch);
  patchRef.current = onBsbInterfacePatch;
  const paramsRef = useRef({ nodeId: node.id, xMin, xMax, yMin, yMax, xRange, yRange });
  paramsRef.current = { nodeId: node.id, xMin, xMax, yMin, yMax, xRange, yRange };

  const updateFromPointer = useCallback((clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const { nodeId, xMin: xn, xRange: xr, yMin: yn, yRange: yr } = paramsRef.current;
    patchRef.current?.({
      type: 'updateWidgetProperties',
      widgetId: nodeId,
      properties: { xValue: xn + px * xr, yValue: yn + py * yr },
    });
  }, []);

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition}>
      <div className="flex h-full w-full flex-col overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30">
        <div
          ref={padRef}
          className="relative flex-1 bg-[#0a0f1a]"
          style={{ cursor: editEnabled ? 'default' : 'crosshair' }}
          onMouseDown={editEnabled ? undefined : (e) => {
            e.stopPropagation();
            updateFromPointer(e.clientX, e.clientY);
            const onMove = (ev: MouseEvent) => { ev.preventDefault(); updateFromPointer(ev.clientX, ev.clientY); };
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        >
          <div
            className="absolute h-px w-full bg-blue-border/20"
            style={{ top: `${yPct * 100}%` }}
          />
          <div
            className="absolute h-full w-px bg-blue-border/20"
            style={{ left: `${xPct * 100}%` }}
          />
          <div
            className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-accent"
            style={{ left: `${xPct * 100}%`, top: `${yPct * 100}%` }}
          />
        </div>
        {showValue && (
          <div className="flex items-center justify-center gap-2 border-t border-blue-border/20 px-1 py-0.5 text-[9px] text-blue-muted">
            <span>x: {xValue.toFixed(2)}</span>
            <span>y: {yValue.toFixed(2)}</span>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
}
