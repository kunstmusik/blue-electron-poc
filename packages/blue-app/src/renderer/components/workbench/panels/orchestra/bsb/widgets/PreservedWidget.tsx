import React from 'react';
import type { BsbWidgetNodeSnapshot } from '../../../../../../../shared/project-editor';
import WidgetWrapper from './WidgetWrapper';

interface PreservedWidgetProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string) => void;
}

export default function PreservedWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
}: PreservedWidgetProps): React.ReactElement {
  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect}>
      <div className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30 text-[10px] text-blue-muted">
        {node.objectName || node.type}
        <span className="ml-1 text-yellow-500">[?]</span>
      </div>
    </WidgetWrapper>
  );
}
