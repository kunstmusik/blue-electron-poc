import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import { getDropdownDisplayWidth } from './utils';
import WidgetWrapper from './WidgetWrapper';

interface BSBDropdownWidgetProps {
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

export default function BSBDropdownWidget({
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
}: BSBDropdownWidgetProps): React.ReactElement {
  const selectedIndex = typeof node.properties.selectedIndex === 'number' ? node.properties.selectedIndex : 0;
  const fontSize = typeof node.properties.fontSize === 'number' ? node.properties.fontSize : 12;
  const itemsRaw = node.properties.dropdownItems;

  const items: Array<{ name?: string; value?: string }> = Array.isArray(itemsRaw) ? itemsRaw as Array<{ name?: string; value?: string }> : [];

  let displayText = node.objectName || 'Dropdown';
  if (items.length > 0) {
    const idx = Math.min(selectedIndex, items.length - 1);
    if (items[idx]?.name) {
      displayText = items[idx].name!;
    }
  }

  const handleItemSelect = (index: number) => {
    onBsbInterfacePatch?.({
      type: 'updateWidgetProperties',
      widgetId: node.id,
      properties: { selectedIndex: index },
    });
  };

  const calculatedWidth = getDropdownDisplayWidth(node);

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} displayWidth={calculatedWidth} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild disabled={items.length === 0}>
          <button
            type="button"
            className="flex h-full w-full items-center justify-between gap-1 rounded border border-blue-border bg-[#111a2d] px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20 outline-none disabled:cursor-default disabled:hover:bg-[#111a2d]"
            style={{ fontFamily: 'Roboto, sans-serif', fontSize, pointerEvents: editEnabled ? 'none' : undefined }}
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown size={12} className="shrink-0" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="z-50 min-w-[150px] rounded-md border border-blue-border bg-[#10192a] p-1 shadow-lg">
            {items.map((item, i) => (
              <DropdownMenu.Item
                key={i}
                className="cursor-pointer px-2 py-1 text-xs text-gray-100 hover:bg-blue-accent/20 outline-none"
                onClick={() => handleItemSelect(i)}
                style={{ fontFamily: 'Roboto, sans-serif', fontSize }}
              >
                {item.name || item.value || `Item ${i}`}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </WidgetWrapper>
  );
}
