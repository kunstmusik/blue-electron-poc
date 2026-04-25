import React, { useMemo } from 'react';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import WidgetWrapper from './WidgetWrapper';

interface BSBGroupWidgetProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string) => void;
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void;
  renderWidget: (node: BsbWidgetNodeSnapshot) => React.ReactNode;
  onDoubleClick?: () => void;
}

export default function BSBGroupWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
  renderWidget,
  onDoubleClick,
}: BSBGroupWidgetProps): React.ReactElement {
  const groupName = typeof node.properties.groupName === 'string' ? node.properties.groupName : '';
  const titleEnabled = node.properties.titleEnabled !== false;
  const bgColor = parseBsbColor(node.properties.backgroundColor, 'rgba(0,0,0,0.2)');
  const borderColor = parseBsbColor(node.properties.borderColor, 'rgb(63,102,150)');
  const labelTextColor = parseBsbColor(node.properties.labelTextColor, 'rgb(255,255,255)');

  const fontName = typeof node.properties['font.name'] === 'string' ? node.properties['font.name'] : 'Roboto';
  const fontSize = typeof node.properties['font.size'] === 'number' ? node.properties['font.size'] : 12;

  const labelH = titleEnabled && groupName ? 20 : 0;

  const displaySize = useMemo(() => {
    let childrenW = 10;
    let childrenH = 10; // Keeping bottom padding at 10 as it looked better
    if (node.children) {
      for (const c of node.children) {
        const cw = getChildDisplayWidth(c);
        const ch = getChildDisplayHeight(c);
        childrenW = Math.max(childrenW, c.x + cw + 10);
        childrenH = Math.max(childrenH, c.y + ch + 10);
      }
    }
    const w = Math.max(node.width, childrenW);
    const h = labelH + Math.max(node.height, childrenH);
    return { width: w, height: h };
  }, [node.width, node.height, node.children, labelH]);

  return (
    <WidgetWrapper
      node={node}
      isSelected={isSelected}
      editEnabled={editEnabled}
      onWidgetSelect={onWidgetSelect}
      onDoubleClick={onDoubleClick}
      displayWidth={displaySize.width}
      displayHeight={displaySize.height}
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

import { getDropdownDisplayWidth } from './utils';

function getChildDisplayWidth(child: BsbWidgetNodeSnapshot): number {
  if (child.type === 'BSBGroup' && child.children && child.children.length > 0) {
    let maxW = 10;
    for (const c of child.children) {
      maxW = Math.max(maxW, c.x + getChildDisplayWidth(c) + 10);
    }
    return Math.max(child.width, maxW);
  }
  if (child.type === 'BSBDropdown' || child.type === 'BSBSubChannelDropdown') {
    return getDropdownDisplayWidth(child);
  }
  return child.width ?? 60;
}

function getChildDisplayHeight(child: BsbWidgetNodeSnapshot): number {
  if (child.type === 'BSBGroup' && child.children && child.children.length > 0) {
    let maxH = 10;
    for (const c of child.children) {
      maxH = Math.max(maxH, c.y + getChildDisplayHeight(c) + 10);
    }
    const titleEnabled = child.properties.titleEnabled !== false;
    const labelH = titleEnabled ? 20 : 0;
    return labelH + Math.max(child.height, maxH);
  }
  return child.height ?? 24;
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
