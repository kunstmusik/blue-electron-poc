import React, { useEffect, useState } from 'react';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  BsbInterfacePatch,
  BsbWidgetNodeSnapshot,
  InstrumentPatch,
} from '../../../../../../shared/project-editor';
import {
  BSBHSliderWidget,
  BSBVSliderWidget,
  BSBKnobWidget,
  BSBCheckBoxWidget,
  BSBLabelWidget,
  BSBTextFieldWidget,
  BSBDropdownWidget,
  BSBSubChannelDropdownWidget,
  BSBValueWidget,
  BSBXYControllerWidget,
  BSBGroupWidget,
  BSBFileSelectorWidget,
  BSBLineObjectWidget,
  BSBHSliderBankWidget,
  BSBVSliderBankWidget,
  PreservedWidget,
} from './widgets';

interface BSBInterfaceCanvasProps {
  instrument: BlueSynthBuilderInstrumentSnapshot;
  selectedWidgetId: string | null;
  editEnabled: boolean;
  onWidgetSelect: (widgetId: string | null) => void;
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void;
  onInstrumentPatch: (patch: InstrumentPatch) => void | Promise<void>;
}

interface GroupStackEntry {
  id: string;
  name: string;
}

export default function BSBInterfaceCanvas({
  instrument,
  selectedWidgetId,
  editEnabled,
  onWidgetSelect,
  onBsbInterfacePatch,
}: BSBInterfaceCanvasProps): React.ReactElement {
  const [groupStack, setGroupStack] = useState<GroupStackEntry[]>([]);

  useEffect(() => {
    setGroupStack([]);
  }, [instrument]);

  if (!instrument.widgetTree) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-blue-muted">
        No interface widgets available.
      </div>
    );
  }

  const currentChildren = resolveCurrentChildren(instrument.widgetTree, groupStack);

  const enterGroup = (node: BsbWidgetNodeSnapshot) => {
    const groupName = typeof node.properties.groupName === 'string' ? node.properties.groupName : node.type;
    setGroupStack((prev) => [...prev, { id: node.id, name: groupName }]);
    onWidgetSelect(null);
  };

  const navigateTo = (index: number) => {
    setGroupStack((prev) => prev.slice(0, index));
    onWidgetSelect(null);
  };

  const handleDoubleClick = (node: BsbWidgetNodeSnapshot) => {
    if (node.type === 'BSBGroup') {
      enterGroup(node);
    }
  };

  const renderWidget = (node: BsbWidgetNodeSnapshot): React.ReactNode => {
    const isSelected = node.id === selectedWidgetId;
    const baseProps = {
      node,
      isSelected,
      editEnabled,
      onWidgetSelect,
    };

    if (node.preservedOnly) {
      return <PreservedWidget key={node.id} {...baseProps} />;
    }

    switch (node.type) {
      case 'BSBHSlider':
        return <BSBHSliderWidget key={node.id} {...baseProps} onBsbInterfacePatch={onBsbInterfacePatch} />;
      case 'BSBVSlider':
        return <BSBVSliderWidget key={node.id} {...baseProps} onBsbInterfacePatch={onBsbInterfacePatch} />;
      case 'BSBKnob':
        return <BSBKnobWidget key={node.id} {...baseProps} onBsbInterfacePatch={onBsbInterfacePatch} />;
      case 'BSBCheckBox':
        return <BSBCheckBoxWidget key={node.id} {...baseProps} onBsbInterfacePatch={onBsbInterfacePatch} />;
      case 'BSBLabel':
        return <BSBLabelWidget key={node.id} {...baseProps} />;
      case 'BSBTextField':
        return <BSBTextFieldWidget key={node.id} {...baseProps} />;
      case 'BSBDropdown':
        return <BSBDropdownWidget key={node.id} {...baseProps} onBsbInterfacePatch={onBsbInterfacePatch} />;
      case 'BSBSubChannelDropdown':
        return <BSBSubChannelDropdownWidget key={node.id} {...baseProps} />;
      case 'BSBValue':
        return <BSBValueWidget key={node.id} {...baseProps} />;
      case 'BSBXYController':
        return <BSBXYControllerWidget key={node.id} {...baseProps} />;
      case 'BSBGroup':
        return (
          <BSBGroupWidget
            key={node.id}
            {...baseProps}
            onBsbInterfacePatch={onBsbInterfacePatch}
            renderWidget={renderWidget}
            onDoubleClick={editEnabled ? () => handleDoubleClick(node) : undefined}
          />
        );
      case 'BSBFileSelector':
        return <BSBFileSelectorWidget key={node.id} {...baseProps} />;
      case 'BSBLineObject':
        return <BSBLineObjectWidget key={node.id} {...baseProps} />;
      case 'BSBHSliderBank':
        return <BSBHSliderBankWidget key={node.id} {...baseProps} />;
      case 'BSBVSliderBank':
        return <BSBVSliderBankWidget key={node.id} {...baseProps} />;
      default:
        return <PreservedWidget key={node.id} {...baseProps} />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {editEnabled && groupStack.length > 0 && (
        <div className="flex items-center gap-1 border-b border-blue-border bg-[#111a2d] px-2 py-1">
          <BreadcrumbItem label="Root" onClick={() => navigateTo(0)} active={groupStack.length === 0} />
          {groupStack.map((entry, i) => (
            <React.Fragment key={entry.id}>
              <ChevronIcon />
              <BreadcrumbItem
                label={entry.name}
                onClick={() => navigateTo(i + 1)}
                active={i === groupStack.length - 1}
              />
            </React.Fragment>
          ))}
        </div>
      )}
      <div
        className="relative flex-1 overflow-auto bg-[#26334c]"
        onClick={() => onWidgetSelect(null)}
      >
        <div className="relative" style={{ minHeight: 400, minWidth: 600 }}>
          {currentChildren.map((child) => renderWidget(child))}
        </div>
      </div>
    </div>
  );
}

function resolveCurrentChildren(root: BsbWidgetNodeSnapshot, stack: GroupStackEntry[]): BsbWidgetNodeSnapshot[] {
  if (stack.length === 0) return root.children ?? [];

  let current: BsbWidgetNodeSnapshot = root;
  for (const entry of stack) {
    const child = current.children?.find((c) => c.id === entry.id);
    if (!child) return current.children ?? [];
    current = child;
  }
  return current.children ?? [];
}

function BreadcrumbItem({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) {
  return (
    <button
      className={`rounded px-1.5 py-0.5 text-[11px] ${
        active
          ? 'text-gray-300'
          : 'text-blue-muted hover:bg-blue-border hover:text-gray-200'
      }`}
      onClick={(e) => { e.stopPropagation(); if (!active) onClick(); }}
    >
      {label}
    </button>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 8 12" className="h-3 w-2 text-blue-muted">
      <path d="M1 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
