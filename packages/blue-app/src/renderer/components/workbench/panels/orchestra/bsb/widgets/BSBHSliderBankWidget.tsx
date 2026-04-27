import React, { useCallback, useEffect, useRef } from 'react';
import { BSB_VALUE_PANEL_HEIGHT, BSB_VALUE_PANEL_WIDTH, getHSliderBankDisplaySize } from '../../../../../../../shared/bsb-widget-layout';
import WidgetWrapper from './WidgetWrapper';
import { ValuePanel, formatValue } from './ValuePanel';
import type { BSBWidgetComponentProps } from './widget-component-props';

type BSBHSliderBankWidgetProps = BSBWidgetComponentProps;

function BSBHSliderBankWidget({
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
  const minimum = typeof node.properties.minimum === 'number' ? node.properties.minimum : 0;
  const maximum = typeof node.properties.maximum === 'number' ? node.properties.maximum : 1;
  const gap = typeof node.properties.gap === 'number' ? node.properties.gap : 5;
  const showValue = node.properties.valueDisplayEnabled === true;
  const sliderWidth = typeof node.properties.sliderWidth === 'number' ? node.properties.sliderWidth : 100;
  const sliderCount = typeof node.properties.numberOfSliders === 'number' ? Math.max(1, node.properties.numberOfSliders) : 1;
  const storedSliders = Array.isArray(node.properties.sliders)
    ? (node.properties.sliders as Array<{ value?: number }>)
    : [];
  const sliders = Array.from({ length: Math.max(sliderCount, storedSliders.length, 1) }, (_unused, index) => {
    const slider = storedSliders[index];
    return { value: typeof slider?.value === 'number' ? slider.value : minimum };
  });

  const range = maximum - minimum || 1;
  const displaySize = getHSliderBankDisplaySize(sliders.length, sliderWidth, gap, showValue);
  const sliderRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragRef = useRef<{ sliderIndex: number } | null>(null);

  const updateSliderValue = useCallback((sliderIndex: number, clientX: number) => {
    const element = sliderRefs.current[sliderIndex];
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
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
      updateSliderValue(dragRef.current.sliderIndex, event.clientX);
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
        className="flex h-full w-full flex-col overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30"
        style={{ gap }}
      >
        {sliders.map((slider, i) => {
          const val = typeof slider.value === 'number' ? slider.value : minimum;
          const pct = Math.max(0, Math.min(1, (val - minimum) / range));
          const displayValue = formatValue(val);
          return (
            <div key={i} className="flex h-7.5 items-center gap-0">
              <div
                ref={(element) => { sliderRefs.current[i] = element; }}
                className="relative h-2.5 shrink-0 self-center rounded-full bg-[#0a0f1a]"
                onMouseDown={(event) => {
                  if (editEnabled) return;
                  event.preventDefault();
                  event.stopPropagation();
                  dragRef.current = { sliderIndex: i };
                  updateSliderValue(i, event.clientX);
                }}
                style={{ cursor: editEnabled ? 'default' : 'pointer', width: sliderWidth }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-blue-accent/50"
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
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
            </div>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}

export default React.memo(BSBHSliderBankWidget);
