import React from 'react';
import type {
  BsbWidgetNodeSnapshot,
  BsbInterfacePatch,
} from '../../../../../../shared/project-editor';

interface BSBPropertySheetProps {
  widget: BsbWidgetNodeSnapshot | null;
  selectedCount?: number;
  editEnabled: boolean;
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void;
}

const TYPE_DISPLAY_NAMES: Record<string, string> = {
  BSBHSlider: 'HSlider',
  BSBVSlider: 'VSlider',
  BSBKnob: 'Knob',
  BSBCheckBox: 'CheckBox',
  BSBDropdown: 'Dropdown',
  BSBLabel: 'Label',
  BSBTextField: 'TextField',
  BSBValue: 'Value',
  BSBXYController: 'XY Controller',
  BSBGroup: 'Group',
  BSBFileSelector: 'File Selector',
  BSBHSliderBank: 'HSlider Bank',
  BSBVSliderBank: 'VSlider Bank',
  BSBLineObject: 'Line Object',
  BSBSubChannelDropdown: 'SubChannel Dropdown',
};

const PROPERTY_ORDER = [
  'objectName',
  'x',
  'y',
  'width',
  'height',
  'value',
  'minimum',
  'maximum',
  'sliderWidth',
  'sliderHeight',
  'knobWidth',
  'textFieldWidth',
  'canvasWidth',
  'canvasHeight',
  'resolution',
  'gap',
  'numberOfSliders',
  'selectedIndex',
  'fontSize',
  'label',
  'groupName',
  'titleEnabled',
  'valueDisplayEnabled',
  'automationAllowed',
  'randomizable',
  'stringChannelEnabled',
  'leadingZero',
  'relativeXValues',
  'locked',
  'separatorType',
  'XMin',
  'XMax',
  'YMin',
  'YMax',
  'defaultValue',
  'fileName',
  'comment',
  'backgroundColor',
  'borderColor',
  'labelTextColor',
  'font.name',
  'font.size',
  'font.style',
  'labelFont.name',
  'labelFont.size',
  'labelFont.style',
];

const BOOLEAN_PROPS = new Set([
  'titleEnabled',
  'valueDisplayEnabled',
  'automationAllowed',
  'randomizable',
  'stringChannelEnabled',
  'leadingZero',
  'relativeXValues',
  'locked',
]);

const NUMBER_PROPS = new Set([
  'x',
  'y',
  'width',
  'height',
  'value',
  'minimum',
  'maximum',
  'sliderWidth',
  'sliderHeight',
  'knobWidth',
  'textFieldWidth',
  'canvasWidth',
  'canvasHeight',
  'resolution',
  'gap',
  'numberOfSliders',
  'selectedIndex',
  'fontSize',
  'XMin',
  'XMax',
  'YMin',
  'YMax',
  'defaultValue',
  'font.size',
  'font.style',
  'labelFont.size',
  'labelFont.style',
]);

const BEANINFO_PROPERTIES: Record<string, string[]> = {
  BSBHSlider: ['objectName', 'x', 'y', 'sliderWidth', 'minimum', 'maximum', 'value', 'resolution', 'valueDisplayEnabled', 'automationAllowed', 'randomizable', 'comment'],
  BSBVSlider: ['objectName', 'x', 'y', 'sliderHeight', 'minimum', 'maximum', 'value', 'resolution', 'valueDisplayEnabled', 'automationAllowed', 'randomizable', 'comment'],
  BSBKnob: ['objectName', 'x', 'y', 'knobWidth', 'minimum', 'maximum', 'value', 'label', 'labelEnabled', 'labelFont', 'valueDisplayEnabled', 'automationAllowed', 'randomizable', 'comment'],
  BSBCheckBox: ['objectName', 'x', 'y', 'label', 'automationAllowed', 'randomizable', 'comment'],
  BSBDropdown: ['objectName', 'x', 'y', 'selectedIndex', 'BSBDropdownItemList', 'fontSize', 'automationAllowed', 'randomizable', 'comment'],
  BSBLabel: ['x', 'y', 'label', 'font'],
  BSBTextField: ['objectName', 'x', 'y', 'textFieldWidth', 'value', 'comment'],
  BSBValue: ['objectName', 'x', 'y', 'minimum', 'maximum', 'defaultValue', 'automationAllowed'],
  BSBXYController: ['objectName', 'x', 'y', 'width', 'height', 'XMin', 'XMax', 'YMin', 'YMax', 'valueDisplayEnabled', 'automationAllowed', 'randomizable', 'comment'],
  BSBGroup: ['x', 'y', 'groupName', 'titleEnabled', 'font', 'backgroundColor', 'borderColor', 'labelTextColor', 'comment'],
  BSBFileSelector: ['objectName', 'x', 'y', 'textFieldWidth', 'stringChannelEnabled', 'fileName', 'comment'],
  BSBHSliderBank: ['objectName', 'x', 'y', 'numberOfSliders', 'sliderWidth', 'minimum', 'maximum', 'resolution', 'gap', 'valueDisplayEnabled', 'automationAllowed', 'randomizable', 'comment'],
  BSBVSliderBank: ['objectName', 'x', 'y', 'numberOfSliders', 'sliderHeight', 'minimum', 'maximum', 'resolution', 'gap', 'valueDisplayEnabled', 'automationAllowed', 'randomizable', 'comment'],
  BSBLineObject: ['objectName', 'x', 'y', 'canvasWidth', 'canvasHeight', 'XMax', 'lines', 'separatorType', 'leadingZero', 'relativeXValues', 'locked', 'comment'],
  BSBSubChannelDropdown: ['objectName', 'x', 'y', 'comment'],
};

export default function BSBPropertySheet({
  widget,
  selectedCount,
  editEnabled,
  onBsbInterfacePatch,
}: BSBPropertySheetProps): React.ReactElement {
  if (!widget) {
    return (
      <div className="p-3 text-xs text-blue-muted">
        {selectedCount && selectedCount > 1
          ? `${selectedCount} widgets selected.`
          : 'Select a widget to edit its properties.'}
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

  const allowed = BEANINFO_PROPERTIES[widget.type];
  const allowedSet = allowed ? new Set(allowed) : null;

  const updateProperty = (key: string, value: string | number | boolean | null) => {
    onBsbInterfacePatch({
      type: 'updateWidgetProperties',
      widgetId: widget.id,
      properties: { [key]: value },
    });
  };

  const merged: Map<string, unknown> = new Map();

  const topFields: [string, unknown][] = [
    ['objectName', widget.objectName],
    ['x', widget.x],
    ['y', widget.y],
    ['width', widget.width],
    ['height', widget.height],
    ['value', widget.value],
    ['minimum', widget.minimum],
    ['maximum', widget.maximum],
  ];
  for (const [k, v] of topFields) {
    if (allowedSet && !allowedSet.has(k)) continue;
    merged.set(k, v);
  }

  if (widget.properties) {
    for (const [k, v] of Object.entries(widget.properties)) {
      if (k === 'dropdownItems') continue;
      if (merged.has(k)) continue;
      if (allowedSet && !allowedSet.has(k) && !k.startsWith('labelFont.') && !k.startsWith('font.')) continue;
      if (v !== undefined && v !== null) merged.set(k, v);
    }
  }

  const sortedEntries = Array.from(merged.entries()).sort((a, b) => {
    const ai = PROPERTY_ORDER.indexOf(a[0]);
    const bi = PROPERTY_ORDER.indexOf(b[0]);
    const ao = ai === -1 ? PROPERTY_ORDER.length : ai;
    const bo = bi === -1 ? PROPERTY_ORDER.length : bi;
    return ao - bo;
  });

  const typeName = TYPE_DISPLAY_NAMES[widget.type] || widget.type;

  return (
    <div className="space-y-2 p-3">
      <div className="mb-2 border-b border-blue-border pb-1 text-[10px] uppercase tracking-[0.16em] text-blue-muted">
        {typeName}
      </div>

      {sortedEntries.map(([key, rawVal]) => {
        if (BOOLEAN_PROPS.has(key)) {
          return (
            <PropertyRow key={key} label={formatLabel(key)}>
              <input
                type="checkbox"
                className="accent-blue-accent"
                checked={!!rawVal}
                onChange={(e) => updateProperty(key, e.target.checked)}
              />
            </PropertyRow>
          );
        }

        const isNumber = NUMBER_PROPS.has(key) || typeof rawVal === 'number';
        const displayVal = String(rawVal);

        return (
          <PropertyRow key={key} label={formatLabel(key)}>
            <input
              className="w-full rounded border border-blue-border bg-[#111a2d] px-2 py-1 text-xs text-gray-100 outline-none focus:border-blue-accent"
              type={isNumber ? 'number' : 'text'}
              value={displayVal}
              onChange={(e) => {
                const v = e.target.value;
                if (isNumber) {
                  updateProperty(key, v === '' ? 0 : parseFloat(v));
                } else {
                  updateProperty(key, v);
                }
              }}
            />
          </PropertyRow>
        );
      })}

      {widget.properties?.dropdownItems != null && (
        <DropdownItemsEditor
          items={widget.properties.dropdownItems as Array<{ name?: string; value?: string }>}
          onUpdate={(items) => updateProperty('dropdownItems', items)}
        />
      )}

      <div className="mt-2 border-t border-blue-border pt-2 text-[10px] text-blue-muted">
        Type: {widget.type}
      </div>
    </div>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="grid grid-cols-[80px_1fr] items-center gap-2">
      <label className="truncate text-[11px] text-blue-muted">{label}</label>
      {children}
    </div>
  );
}

function formatLabel(key: string): string {
  if (key === 'objectName') return 'Object Name';
  if (key === 'groupName') return 'Group Name';
  if (key === 'textFieldWidth') return 'Field Width';
  if (key === 'sliderWidth') return 'Slider Width';
  if (key === 'sliderHeight') return 'Slider Height';
  if (key === 'knobWidth') return 'Knob Width';
  if (key === 'canvasWidth') return 'Canvas Width';
  if (key === 'canvasHeight') return 'Canvas Height';
  if (key === 'numberOfSliders') return 'Num Sliders';
  if (key === 'selectedIndex') return 'Selected Index';
  if (key === 'fontSize') return 'Font Size';
  if (key === 'valueDisplayEnabled') return 'Value Display';
  if (key === 'automationAllowed') return 'Automation';
  if (key === 'stringChannelEnabled') return 'String Channel';
  if (key === 'leadingZero') return 'Leading Zero';
  if (key === 'relativeXValues') return 'Relative X';
  if (key === 'separatorType') return 'Separator';
  if (key === 'defaultValue') return 'Default';
  if (key === 'fileName') return 'File Name';
  if (key === 'titleEnabled') return 'Title Enabled';
  if (key.startsWith('font.')) return 'Font ' + key.split('.')[1];
  if (key.startsWith('labelFont.')) return 'Label Font ' + key.split('.')[1];
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function DropdownItemsEditor({
  items,
  onUpdate,
}: {
  items: Array<{ name?: string; value?: string }>;
  onUpdate: (items: Array<{ name: string; value: string }>) => void;
}): React.ReactElement | null {
  if (!Array.isArray(items)) return null;

  return (
    <div className="mt-2 border-t border-blue-border pt-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-blue-muted">Dropdown Items</span>
        <button
          className="rounded bg-blue-accent px-2 py-0.5 text-[10px] text-white hover:opacity-80"
          onClick={() => onUpdate([...items.map(normalizeItem), { name: 'New Item', value: String(items.length) }])}
        >
          + Add
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="mb-1 grid grid-cols-[1fr_1fr_auto] items-center gap-1">
          <input
            className="w-full rounded border border-blue-border bg-[#111a2d] px-1 py-0.5 text-[10px] text-gray-100 outline-none focus:border-blue-accent"
            value={item.name ?? ''}
            placeholder="Name"
            onChange={(e) => {
              const next = items.map(normalizeItem);
              next[i] = { ...next[i], name: e.target.value };
              onUpdate(next);
            }}
          />
          <input
            className="w-full rounded border border-blue-border bg-[#111a2d] px-1 py-0.5 text-[10px] text-gray-100 outline-none focus:border-blue-accent"
            value={item.value ?? ''}
            placeholder="Value"
            onChange={(e) => {
              const next = items.map(normalizeItem);
              next[i] = { ...next[i], value: e.target.value };
              onUpdate(next);
            }}
          />
          <span className="flex gap-0.5">
            <button
              className="text-[10px] text-blue-muted hover:text-white"
              onClick={() => {
                if (i === 0) return;
                const next = items.map(normalizeItem);
                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                onUpdate(next);
              }}
              title="Move up"
            >
              &#9650;
            </button>
            <button
              className="text-[10px] text-blue-muted hover:text-white"
              onClick={() => {
                if (i >= items.length - 1) return;
                const next = items.map(normalizeItem);
                [next[i], next[i + 1]] = [next[i + 1], next[i]];
                onUpdate(next);
              }}
              title="Move down"
            >
              &#9660;
            </button>
            <button
              className="text-[10px] text-red-400 hover:text-red-300"
              onClick={() => onUpdate(items.filter((_, idx) => idx !== i).map(normalizeItem))}
              title="Remove"
            >
              &#10005;
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}

function normalizeItem(item: { name?: string; value?: string }): { name: string; value: string } {
  return { name: item.name ?? '', value: item.value ?? '' };
}
