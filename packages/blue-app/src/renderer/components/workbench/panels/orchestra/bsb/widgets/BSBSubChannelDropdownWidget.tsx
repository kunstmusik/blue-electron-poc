import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import { getDropdownDisplayWidth } from './utils';
import WidgetWrapper from './WidgetWrapper';

interface BSBSubChannelDropdownWidgetProps {
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
}: BSBSubChannelDropdownWidgetProps): React.ReactElement {
  const channelOutput = typeof node.properties.channelOutput === 'string' ? node.properties.channelOutput : '';
  const displayText = channelOutput || node.objectName || 'Sub Channel';

  const calculatedWidth = getDropdownDisplayWidth(node);

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} displayWidth={calculatedWidth} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition}>
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
