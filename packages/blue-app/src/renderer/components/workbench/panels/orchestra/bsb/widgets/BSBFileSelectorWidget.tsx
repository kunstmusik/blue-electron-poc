import React from 'react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';
import WidgetWrapper from './WidgetWrapper';

interface BSBFileSelectorWidgetProps {
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

export default function BSBFileSelectorWidget({
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
}: BSBFileSelectorWidgetProps): React.ReactElement {
  const fileName = typeof node.properties.fileName === 'string' ? node.properties.fileName : '';
  const textFieldWidth = Math.max(10, (typeof node.properties.textFieldWidth === 'number' ? node.properties.textFieldWidth : 100));

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction}>
      <div className="flex h-full items-stretch overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30">
        <div
          className="flex h-full items-center overflow-hidden bg-[#0a0f1a] px-1.5 text-[11px] text-gray-200"
          style={{ width: textFieldWidth }}
        >
          <span className="truncate">{fileName || '(none)'}</span>
        </div>
        <button
          type="button"
          className="flex w-[30px] shrink-0 items-center justify-center border-l border-blue-border/40 text-[9px] text-blue-muted hover:text-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          ...
        </button>
      </div>
    </WidgetWrapper>
  );
}
