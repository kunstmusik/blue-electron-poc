import React from 'react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import WidgetWrapper from './WidgetWrapper';

interface BSBValueWidgetProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string) => void;
  onBsbInterfacePatch?: (patch: BsbInterfacePatch) => void;
  resizeMeta?: BSBWidgetResizeMeta;
  gridSnapEnabled?: boolean;
  gridSnapWidth?: number;
  gridSnapHeight?: number;
}

export default function BSBValueWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
  onBsbInterfacePatch,
  resizeMeta,
  gridSnapEnabled,
  gridSnapWidth,
  gridSnapHeight,
}: BSBValueWidgetProps): React.ReactElement {
  if (editEnabled) {
    return (
      <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch}>
        <div className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30 text-[10px] text-blue-muted">
          {node.objectName || 'BSBValue'}
        </div>
      </WidgetWrapper>
    );
  }

  const value = typeof node.properties.value === 'number' ? node.properties.value : 0;

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded border border-blue-border/40 bg-[#0a0f1a]">
        <span className="font-mono text-[12px] text-blue-accent">{value.toFixed(4)}</span>
      </div>
    </WidgetWrapper>
  );
}
