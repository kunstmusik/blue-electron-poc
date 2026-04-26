import React, { useCallback } from 'react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import WidgetWrapper from './WidgetWrapper';

interface BSBCheckBoxWidgetProps {
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

export default function BSBCheckBoxWidget({
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
}: BSBCheckBoxWidgetProps): React.ReactElement {
  const selected = node.properties.selected === true;
  const labelText = typeof node.properties.label === 'string' ? node.properties.label : node.objectName;

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (editEnabled) {
      onWidgetSelect(node.id);
      return;
    }
    onBsbInterfacePatch({
      type: 'updateWidgetProperties',
      widgetId: node.id,
      properties: { selected: !selected },
    });
  }, [editEnabled, selected, node.id, onWidgetSelect, onBsbInterfacePatch]);

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} autoSize resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition}>
      <div
        className="flex items-center gap-1.5 whitespace-nowrap"
        style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, cursor: editEnabled ? 'default' : 'pointer' }}
        onClick={handleToggle}
      >
        <svg width={13} height={13} className="shrink-0">
          <rect x={0} y={0} width={12} height={12} rx={2} ry={2} fill="rgb(38,51,76)" stroke="rgb(63,102,150)" strokeWidth={1} />
          {selected && (
            <path d="M2 6l3 3 5-5" fill="none" stroke="rgb(240,240,255)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
        <span className="text-[12px]" style={{ color: 'rgb(240,240,255)' }}>{labelText}</span>
      </div>
    </WidgetWrapper>
  );
}
