import React from 'react';
import type { BsbWidgetNodeSnapshot } from '../../../../../../../shared/project-editor';
import WidgetWrapper from './WidgetWrapper';

interface BSBVSliderBankWidgetProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string) => void;
}

export default function BSBVSliderBankWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
}: BSBVSliderBankWidgetProps): React.ReactElement {
  const sliders: Array<{ value?: number }> = Array.isArray(node.properties.sliders)
    ? (node.properties.sliders as Array<{ value?: number }>)
    : [];
  const minimum = typeof node.properties.minimum === 'number' ? node.properties.minimum : 0;
  const maximum = typeof node.properties.maximum === 'number' ? node.properties.maximum : 1;
  const gap = typeof node.properties.gap === 'number' ? node.properties.gap : 4;
  const showValue = node.properties.valueDisplayEnabled === true;

  const range = maximum - minimum || 1;

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect}>
      <div
        className="flex h-full w-full flex-row overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30"
        style={{ gap }}
      >
        {sliders.map((slider, i) => {
          const val = typeof slider.value === 'number' ? slider.value : 0;
          const pct = Math.max(0, Math.min(1, (val - minimum) / range));
          return (
            <div key={i} className="flex w-6 flex-col items-center">
              {showValue && (
                <span className="font-mono text-[7px] text-blue-muted">{val.toFixed(1)}</span>
              )}
              <div className="relative w-2.5 flex-1 rounded-full bg-[#0a0f1a]">
                <div
                  className="absolute inset-x-0 bottom-0 rounded-full bg-blue-accent/50"
                  style={{ height: `${pct * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}
