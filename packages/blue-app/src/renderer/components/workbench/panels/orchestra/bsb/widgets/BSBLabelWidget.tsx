import React from 'react';
import WidgetWrapper from './WidgetWrapper';
import type { BSBWidgetComponentProps } from './widget-component-props';

type BSBLabelWidgetProps = BSBWidgetComponentProps;

export default function BSBLabelWidget({
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
}: BSBLabelWidgetProps): React.ReactElement {
  const labelText = typeof node.properties.label === 'string' ? node.properties.label : '';
  const fontName = typeof node.properties['font.name'] === 'string' ? node.properties['font.name'] : 'Roboto';
  const fontSize = typeof node.properties['font.size'] === 'number' ? node.properties['font.size'] : 12;
  const fontStyle = typeof node.properties['font.style'] === 'number' ? node.properties['font.style'] : 0;
  const fontWeight = (fontStyle & 1) ? 'bold' : 'normal';
  const fontItalic = (fontStyle & 2) ? 'italic' : 'normal';

  return (
    <WidgetWrapper node={node} isSelected={isSelected} editEnabled={editEnabled} onWidgetSelect={onWidgetSelect} autoSize resizeMeta={resizeMeta} gridSnapEnabled={gridSnapEnabled} gridSnapWidth={gridSnapWidth} gridSnapHeight={gridSnapHeight} onBsbInterfacePatch={onBsbInterfacePatch} selectedWidgetIds={selectedWidgetIds} getWidgetPosition={getWidgetPosition} onWidgetAction={onWidgetAction}>
      <div
        className="flex items-center whitespace-nowrap"
        style={{
          fontFamily: `'${fontName}', Roboto, sans-serif`,
          fontSize: `${fontSize}px`,
          fontWeight,
          fontStyle: fontItalic,
          color: 'rgb(240,240,255)',
        }}
      >
        <span className="truncate">{labelText}</span>
      </div>
    </WidgetWrapper>
  );
}
