import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import type { BSBWidgetComponentProps } from './widget-component-props';

type BSBValueWidgetProps = BSBWidgetComponentProps;

function BSBValueWidget({
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
}: BSBValueWidgetProps): React.ReactElement {
  if (editEnabled) {
    return (
      <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction}>
        <div className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30 text-[10px] text-blue-muted">
          {node.objectName || 'BSBValue'}
        </div>
      </WidgetWrapper>
    );
  }

  const value = typeof node.properties.defaultValue === 'number'
    ? node.properties.defaultValue
    : typeof node.properties.value === 'number'
      ? node.properties.value
      : node.value;

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded border border-blue-border/40 bg-[#0a0f1a]">
        <span className="font-mono text-[12px] text-blue-accent">{value.toFixed(4)}</span>
      </div>
    </WidgetWrapper>
  );
}

export default React.memo(BSBValueWidget);
