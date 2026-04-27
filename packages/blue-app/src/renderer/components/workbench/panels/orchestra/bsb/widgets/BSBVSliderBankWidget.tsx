import React, { useCallback, useEffect, useRef } from 'react';
import { BSB_VALUE_PANEL_HEIGHT, BSB_VALUE_PANEL_WIDTH, getVSliderBankDisplaySize } from '../../../../../../../shared/bsb-widget-layout';
import WidgetWrapper from './WidgetWrapper';
import { ValuePanel, formatValue } from './ValuePanel';
import type { BSBWidgetComponentProps } from './widget-component-props';

type BSBVSliderBankWidgetProps = BSBWidgetComponentProps;

export default function BSBVSliderBankWidget({
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
}: BSBVSliderBankWidgetProps): React.ReactElement {
  const minimum = typeof node.properties.minimum === 'number' ? node.properties.minimum : 0;
  const maximum = typeof node.properties.maximum === 'number' ? node.properties.maximum : 1;
  const gap = typeof node.properties.gap === 'number' ? node.properties.gap : 5;
  const showValue = node.properties.valueDisplayEnabled === true;
  const sliderHeight = typeof node.properties.sliderHeight === 'number' ? node.properties.sliderHeight : 100;
  const sliderCount = typeof node.properties.numberOfSliders === 'number' ? Math.max(1, node.properties.numberOfSliders) : 1;
  const storedSliders = Array.isArray(node.properties.sliders)
    ? (node.properties.sliders as Array<{ value?: number }>)
    : [];
  const sliders = Array.from({ length: Math.max(sliderCount, storedSliders.length, 1) }, (_unused, index) => {
    const slider = storedSliders[index];
    return { value: typeof slider?.value === 'number' ? slider.value : minimum };
  });

  const range = maximum - minimum || 1;
  const displaySize = getVSliderBankDisplaySize(sliders.length, sliderHeight, gap, showValue);
  const sliderRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragRef = useRef<{ sliderIndex: number } | null>(null);

  const updateSliderValue = useCallback((sliderIndex: number, clientY: number) => {
    const element = sliderRefs.current[sliderIndex];
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const pct = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const nextValue = minimum + pct * range;
    onBsbInterfacePatch?.({
      type: 'updateSliderBankValue',
      widgetId: node.id,
      sliderIndex,
      value: nextValue,
    });
  }, [minimum, node.id, onBsbInterfacePatch, range]);

  useEffect(() => {
    if (editEnabled) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragRef.current) return;
      event.preventDefault();
      updateSliderValue(dragRef.current.sliderIndex, event.clientY);
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editEnabled, updateSliderValue]);

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction} displayWidth={displaySize.width} displayHeight={displaySize.height}>
      <div
        className="flex h-full w-full flex-row overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30"
        style={{ gap }}
      >
        {sliders.map((slider, i) => {
          const val = typeof slider.value === 'number' ? slider.value : minimum;
          const pct = Math.max(0, Math.min(1, (val - minimum) / range));
          const displayValue = formatValue(val);
          return (
            <div key={i} className="flex w-12.5 shrink-0 flex-col items-center">
              {showValue && (
                <ValuePanel
                  value={displayValue.length > 7 ? displayValue.substring(0, 7) : displayValue}
                  width={BSB_VALUE_PANEL_WIDTH}
                  height={BSB_VALUE_PANEL_HEIGHT}
                  onCommit={editEnabled ? undefined : (text) => {
                    const parsed = parseFloat(text);
                    if (!Number.isNaN(parsed)) {
                      onBsbInterfacePatch?.({
                        type: 'updateSliderBankValue',
                        widgetId: node.id,
                        sliderIndex: i,
                        value: Math.max(minimum, Math.min(maximum, parsed)),
                      });
                    }
                  }}
                />
              )}
              <div
                ref={(element) => { sliderRefs.current[i] = element; }}
                className="relative w-2.5 shrink-0 rounded-full bg-[#0a0f1a]"
                onMouseDown={(event) => {
                  if (editEnabled) return;
                  event.preventDefault();
                  event.stopPropagation();
                  dragRef.current = { sliderIndex: i };
                  updateSliderValue(i, event.clientY);
                }}
                style={{ cursor: editEnabled ? 'default' : 'pointer', height: sliderHeight }}
              >
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
