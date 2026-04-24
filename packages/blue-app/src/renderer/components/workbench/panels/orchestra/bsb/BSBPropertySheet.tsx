import React from 'react';
import type {
  BsbWidgetNodeSnapshot,
  BsbInterfacePatch,
} from '../../../../../../shared/project-editor';

interface BSBPropertySheetProps {
  widget: BsbWidgetNodeSnapshot | null;
  editEnabled: boolean;
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void;
}

export default function BSBPropertySheet({
  widget,
  editEnabled,
  onBsbInterfacePatch,
}: BSBPropertySheetProps): React.ReactElement {
  if (!widget) {
    return (
      <div className="p-3 text-xs text-blue-muted">
        Select a widget to edit its properties.
      </div>
    );
  }

  if (!editEnabled) {
    return (
      <div className="p-3 text-xs text-blue-muted">
        Enable edit mode to edit widget properties.
      </div>
    );
  }

  if (widget.preservedOnly) {
    return (
      <div className="p-3 text-xs text-yellow-400">
        This widget type ({widget.type}) is preserved but not fully editable in this version.
      </div>
    );
  }

  const updateProperty = (key: string, value: string | number | boolean | null) => {
    onBsbInterfacePatch({
      type: 'updateWidgetProperties',
      widgetId: widget.id,
      properties: { [key]: value },
    });
  };

  return (
    <div className="space-y-2 p-3">
      <div className="mb-2 border-b border-blue-border pb-1 text-[10px] uppercase tracking-[0.16em] text-blue-muted">
        Properties
      </div>

      <PropertyField label="Object Name" value={widget.objectName} onChange={(v) => updateProperty('objectName', v)} />
      <PropertyField label="X" value={String(widget.x)} onChange={(v) => updateProperty('x', parseInt(v, 10) || 0)} type="number" />
      <PropertyField label="Y" value={String(widget.y)} onChange={(v) => updateProperty('y', parseInt(v, 10) || 0)} type="number" />
      <PropertyField label="Width" value={String(widget.width)} onChange={(v) => updateProperty('width', parseInt(v, 10) || 60)} type="number" />
      <PropertyField label="Height" value={String(widget.height)} onChange={(v) => updateProperty('height', parseInt(v, 10) || 24)} type="number" />

      {widget.properties && Object.entries(widget.properties).map(([key, value]) => (
        <PropertyField key={key} label={key} value={String(value ?? '')} onChange={(v) => updateProperty(key, v)} />
      ))}

      <div className="mt-2 border-t border-blue-border pt-2 text-[10px] text-blue-muted">
        Type: {widget.type}
      </div>
    </div>
  );
}

function PropertyField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}): React.ReactElement {
  return (
    <div className="grid grid-cols-[80px_1fr] items-center gap-2">
      <label className="truncate text-[11px] text-blue-muted">{label}</label>
      <input
        className="w-full rounded border border-blue-border bg-[#111a2d] px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-accent"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
