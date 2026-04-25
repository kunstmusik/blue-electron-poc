import React from 'react';
import type { BsbWidgetNodeSnapshot } from '../../../../../../../shared/project-editor';
import WidgetWrapper from './WidgetWrapper';

interface BSBFileSelectorWidgetProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string) => void;
}

export default function BSBFileSelectorWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
}: BSBFileSelectorWidgetProps): React.ReactElement {
  const fileName = typeof node.properties.fileName === 'string' ? node.properties.fileName : '';

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect}>
      <div className="flex h-full w-full items-stretch overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30">
        <div className="flex h-full flex-1 items-center overflow-hidden bg-[#0a0f1a] px-1.5 text-[11px] text-gray-200">
          <span className="truncate">{fileName || '(none)'}</span>
        </div>
        <button
          type="button"
          className="flex items-center border-l border-blue-border/40 px-2 text-[9px] text-blue-muted hover:text-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          ...
        </button>
      </div>
    </WidgetWrapper>
  );
}
