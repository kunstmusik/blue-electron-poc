import React from 'react';
import type { BsbWidgetNodeSnapshot } from '../../../../../../../shared/project-editor';

interface WidgetWrapperProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string) => void;
  children: React.ReactNode;
  autoSize?: boolean;
  onDoubleClick?: () => void;
  displayWidth?: number;
  displayHeight?: number;
}

export default function WidgetWrapper({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
  children,
  autoSize = false,
  onDoubleClick,
  displayWidth,
  displayHeight,
}: WidgetWrapperProps): React.ReactElement {
  const w = displayWidth ?? node.width ?? 60;
  const h = displayHeight ?? node.height ?? 24;

  const sizeStyle = autoSize
    ? {}
    : { width: w, height: h };

  return (
    <div
      key={node.id}
      data-widget-id={node.id}
      data-widget-type={node.type}
      className={[
        'absolute cursor-default select-none',
        isSelected && editEnabled ? 'ring-2 ring-blue-accent' : '',
        node.preservedOnly ? 'opacity-60' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        left: node.x,
        top: node.y,
        ...sizeStyle,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (editEnabled) onWidgetSelect(node.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.();
      }}
      title={
        !editEnabled && (node.properties?.comment as string)
          ? (node.properties.comment as string)
          : node.preservedOnly
            ? `[Preserved] ${node.objectName || node.type}`
            : undefined
      }
    >
      {children}
    </div>
  );
}
