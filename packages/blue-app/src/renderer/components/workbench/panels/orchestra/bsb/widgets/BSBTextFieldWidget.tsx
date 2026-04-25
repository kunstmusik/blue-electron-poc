import React from 'react';
import type { BsbWidgetNodeSnapshot } from '../../../../../../../shared/project-editor';
import WidgetWrapper from './WidgetWrapper';

interface BSBTextFieldWidgetProps {
  node: BsbWidgetNodeSnapshot;
  isSelected: boolean;
  editEnabled: boolean;
  onWidgetSelect: (id: string) => void;
}

export default function BSBTextFieldWidget({
  node,
  isSelected,
  editEnabled,
  onWidgetSelect,
}: BSBTextFieldWidgetProps): React.ReactElement {
  const textValue = typeof node.properties.textValue === 'string' ? node.properties.textValue : '';

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect}>
      <div className="flex h-full w-full items-center overflow-hidden rounded border border-blue-border/40 bg-blue-surface/30">
        <div className="h-full flex-1 overflow-hidden bg-[#0a0f1a] text-[11px] text-gray-200">
          <span className="block truncate leading-6">{textValue}</span>
        </div>
      </div>
    </WidgetWrapper>
  );
}
