import React from 'react';
import type { BsbWidgetNodeSnapshot } from '../../../../../../../shared/project-editor';
import WidgetWrapper from './WidgetWrapper';
import { getWidgetDisplaySize } from './utils';
import type { BSBWidgetPatchComponentProps } from './widget-component-props';

interface BSBGroupWidgetProps extends BSBWidgetPatchComponentProps {
  renderWidget: (node: BsbWidgetNodeSnapshot) => React.ReactNode;
  onDoubleClick?: () => void;
}

export default function BSBGroupWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
  onBsbInterfacePatch,
  renderWidget,
  onDoubleClick,
  resizeMeta,
  gridSnapEnabled,
  gridSnapWidth,
  gridSnapHeight,
  selectedWidgetIds,
  getWidgetPosition,
  onWidgetAction,
}: BSBGroupWidgetProps): React.ReactElement {
  const groupName = typeof node.properties.groupName === 'string' ? node.properties.groupName : '';
  const titleEnabled = node.properties.titleEnabled !== false;
  const bgColor = parseBsbColor(node.properties.backgroundColor, 'rgba(0,0,0,0.2)');
  const borderColor = parseBsbColor(node.properties.borderColor, 'rgb(63,102,150)');
  const labelTextColor = parseBsbColor(node.properties.labelTextColor, 'rgb(255,255,255)');

  const fontName = typeof node.properties['font.name'] === 'string' ? node.properties['font.name'] : 'Roboto';
  const fontSize = typeof node.properties['font.size'] === 'number' ? node.properties['font.size'] : 12;

  const displaySize = getWidgetDisplaySize(node);

  return (
    <WidgetWrapper
      node={node}
      isSelected={isSelected}
      editEnabled={editEnabled}
      onWidgetSelect={onWidgetSelect}
      onDoubleClick={onDoubleClick}
      displayWidth={displaySize.width}
      displayHeight={displaySize.height}
      resizeMeta={resizeMeta}
      gridSnapEnabled={gridSnapEnabled}
      gridSnapWidth={gridSnapWidth}
      gridSnapHeight={gridSnapHeight}
      onBsbInterfacePatch={onBsbInterfacePatch}
      selectedWidgetIds={selectedWidgetIds}
      getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction}
     
    >
      <div
        className="flex h-full w-full flex-col"
        style={{ borderRadius: 0, position: 'relative', boxSizing: 'border-box' }}
      >
        {titleEnabled && groupName && (
          <div
            className="flex w-full items-center justify-center truncate px-1 shrink-0"
            style={{
              backgroundColor: borderColor,
              color: labelTextColor,
              fontFamily: `'${fontName}', Roboto, sans-serif`,
              fontSize,
              height: 20,
              lineHeight: '20px',
            }}
          >
            {groupName}
          </div>
        )}
        <div
          className="relative flex-1"
          style={{
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            boxSizing: 'border-box',
          }}
        >
          {node.children?.map((child) => renderWidget(child))}
          {editEnabled && (
            <div
              className="absolute inset-0"
              style={{ zIndex: 10, cursor: 'default' }}
            />
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
}

function parseBsbColor(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string' || !raw) return fallback;

  if (raw.startsWith('0x') || raw.startsWith('0X')) {
    const hex = raw.slice(2);
    if (hex.length === 8) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const a = parseInt(hex.substring(6, 8), 16) / 255;
      return `rgba(${r},${g},${b},${a.toFixed(3)})`;
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgb(${r},${g},${b})`;
    }
  }

  if (raw.startsWith('#') || raw.startsWith('rgb')) return raw;

  return fallback;
}
