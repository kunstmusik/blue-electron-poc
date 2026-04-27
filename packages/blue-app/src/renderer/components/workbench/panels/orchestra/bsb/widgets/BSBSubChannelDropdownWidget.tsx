import React from 'react';
import { ChevronDown } from 'lucide-react';
import { getDropdownDisplayWidth } from './utils';
import WidgetWrapper from './WidgetWrapper';
import type { BSBWidgetComponentProps } from './widget-component-props';

type BSBSubChannelDropdownWidgetProps = BSBWidgetComponentProps;

export default function BSBSubChannelDropdownWidget({
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
}: BSBSubChannelDropdownWidgetProps): React.ReactElement {
  const channelOutput = typeof node.properties.channelOutput === 'string' ? node.properties.channelOutput : '';
  const displayText = channelOutput || node.objectName || 'Sub Channel';

  const calculatedWidth = getDropdownDisplayWidth(node);

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} displayWidth={calculatedWidth} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction}>
      <button
        type="button"
        disabled
        className="flex h-full w-full items-center justify-between gap-1 rounded border border-blue-border bg-[#111a2d] px-2 py-1 text-[11px] text-gray-200 outline-none disabled:cursor-default"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown size={12} className="shrink-0" />
      </button>
    </WidgetWrapper>
  );
}
