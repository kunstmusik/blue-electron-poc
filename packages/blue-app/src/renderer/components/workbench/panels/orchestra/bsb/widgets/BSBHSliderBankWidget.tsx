import React from 'react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import WidgetWrapper from './WidgetWrapper';

interface BSBHSliderBankWidgetProps {
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
  onWidgetAction?: (action: string) => void;
}

export default function BSBHSliderBankWidget({
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
  onWidgetAction,
}: BSBHSliderBankWidgetProps): React.ReactElement {
  const sliders: Array<{ value?: number }> = Array.isArray(node.properties.sliders)
    ? (node.properties.sliders as Array<{ value?: number }>)
    : [];
  const minimum = typeof node.properties.minimum === 'number' ? node.properties.minimum : 0;
  const maximum = typeof node.properties.maximum === 'number' ? node.properties.maximum : 1;
  const gap = typeof node.properties.gap === 'number' ? node.properties.gap : 4;
  const showValue = node.properties.valueDisplayEnabled === true;

  const range = maximum - minimum || 1;

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction}>
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30"
        style={{ gap }}
      >
        {sliders.map((slider, i) => {
          const val = typeof slider.value === 'number' ? slider.value : 0;
          const pct = Math.max(0, Math.min(1, (val - minimum) / range));
          return (
            <div key={i} className="flex flex-1 items-center gap-1 px-1">
              <div className="relative h-2.5 flex-1 self-center rounded-full bg-[#0a0f1a]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-blue-accent/50"
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
              {showValue && (
                <span className="shrink-0 text-right font-mono text-[8px] text-blue-muted" style={{ minWidth: 28 }}>
                  {val.toFixed(2)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}
