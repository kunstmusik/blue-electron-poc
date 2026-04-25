import React from 'react';
import type { BsbWidgetNodeSnapshot } from '../../../../../../../shared/project-editor';
import WidgetWrapper from './WidgetWrapper';

interface BSBXYControllerWidgetProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string) => void;
}

export default function BSBXYControllerWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
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

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect}>
      <div className="flex h-full w-full flex-col overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30">
        <div className="relative flex-1 bg-[#0a0f1a]">
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
