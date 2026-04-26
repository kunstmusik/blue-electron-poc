import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  BsbInterfacePatch,
  BsbWidgetNodeSnapshot,
  InstrumentPatch,
} from '../../../../../../shared/project-editor';
import { BSB_WIDGET_RESIZE_META } from './bsb-widget-meta';
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

const BSB_ADDABLE_WIDGETS = [
  { type: 'BSBGroup', label: 'Group' },
  { type: 'BSBKnob', label: 'Knob' },
  { type: 'BSBHSlider', label: 'Horizontal Slider' },
  { type: 'BSBHSliderBank', label: 'Horizontal Slider Bank' },
  { type: 'BSBVSlider', label: 'Vertical Slider' },
  { type: 'BSBVSliderBank', label: 'Vertical Slider Bank' },
  { type: 'BSBCheckBox', label: 'CheckBox' },
  { type: 'BSBLabel', label: 'Label' },
  { type: 'BSBDropdown', label: 'Dropdown List' },
  { type: 'BSBSubChannelDropdown', label: 'SubChannel Dropdown List' },
  { type: 'BSBFileSelector', label: 'File Selector' },
  { type: 'BSBXYController', label: 'XY Controller' },
  { type: 'BSBLineObject', label: 'Line Object' },
  { type: 'BSBTextField', label: 'Text Field' },
  { type: 'BSBValue', label: 'Value' },
];

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

  if (!instrument.widgetTree) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-blue-muted">
        No interface widgets available.
      </div>
    );
  }

  const gridSettings = instrument.gridSettings;
  const resizeCtx = {
    gridSnapEnabled: gridSettings?.snapEnabled && gridSettings?.enabled,
    gridSnapWidth: gridSettings?.width,
    gridSnapHeight: gridSettings?.height,
  };

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
    const meta = BSB_WIDGET_RESIZE_META[node.type];
    const baseProps = {
      node,
      isSelected,
      editEnabled,
      onWidgetSelect,
      resizeMeta: meta,
      gridSnapEnabled: resizeCtx.gridSnapEnabled,
      gridSnapWidth: resizeCtx.gridSnapWidth,
      gridSnapHeight: resizeCtx.gridSnapHeight,
      onBsbInterfacePatch,
    };

    if (node.preservedOnly) {
      return <PreservedWidget key={node.id} {...baseProps} />;
    }

    switch (node.type) {
      case 'BSBHSlider':
        return <BSBHSliderWidget key={node.id} {...baseProps} />;
      case 'BSBVSlider':
        return <BSBVSliderWidget key={node.id} {...baseProps} />;
      case 'BSBKnob':
        return <BSBKnobWidget key={node.id} {...baseProps} />;
      case 'BSBCheckBox':
        return <BSBCheckBoxWidget key={node.id} {...baseProps} />;
      case 'BSBLabel':
        return <BSBLabelWidget key={node.id} {...baseProps} />;
      case 'BSBTextField':
        return <BSBTextFieldWidget key={node.id} {...baseProps} />;
      case 'BSBDropdown':
        return <BSBDropdownWidget key={node.id} {...baseProps} />;
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

  const handleAddWidget = useCallback((widgetType: string, x: number, y: number) => {
    const gs = instrument.gridSettings;
    let snapX = x;
    let snapY = y;
    if (gs?.snapEnabled && gs?.enabled) {
      snapX = Math.floor(x / gs.width) * gs.width;
      snapY = Math.floor(y / gs.height) * gs.height;
    }
    const parentGroupId = groupStack.length > 0 ? groupStack[groupStack.length - 1].id : undefined;
    onBsbInterfacePatch({ type: 'addWidget', widgetType, x: snapX, y: snapY, parentGroupId });
  }, [instrument.gridSettings, groupStack, onBsbInterfacePatch]);

  const handleRemoveWidget = useCallback(() => {
    if (selectedWidgetId) {
      onBsbInterfacePatch({ type: 'removeWidget', widgetId: selectedWidgetId });
      onWidgetSelect(null);
    }
  }, [selectedWidgetId, onBsbInterfacePatch, onWidgetSelect]);

  const contextMenuPos = useRef({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const canvasContent = (
    <div
      ref={canvasRef}
      className="relative flex-1 overflow-auto bg-[#26334c]"
      onClick={() => onWidgetSelect(null)}
      onContextMenu={(e) => {
        if (editEnabled && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          contextMenuPos.current = { x: e.clientX - rect.left + canvasRef.current.scrollLeft, y: e.clientY - rect.top + canvasRef.current.scrollTop };
        }
      }}
    >
      <div className="relative" style={{ minHeight: 400, minWidth: 600 }}>
        {editEnabled && gridSettings?.gridStyle && gridSettings.gridStyle !== 'NONE' && (
          <GridOverlay gridSettings={gridSettings} canvasRef={canvasRef} />
        )}
        {currentChildren.map((child) => renderWidget(child))}
      </div>
    </div>
  );

  return (
    <Tooltip.Provider delayDuration={100} skipDelayDuration={0}>
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
        {editEnabled ? (
          <ContextMenu.Root>
            <ContextMenu.Trigger asChild>{canvasContent}</ContextMenu.Trigger>
            <ContextMenu.Portal>
              <ContextMenu.Content className="editor-context-menu" sideOffset={4}>
                {BSB_ADDABLE_WIDGETS.map((w) => (
                  <ContextMenu.Item
                    key={w.type}
                    className="editor-context-menu__item"
                    onSelect={() => {
                      handleAddWidget(w.type, contextMenuPos.current.x, contextMenuPos.current.y);
                    }}
                  >
                    Add {w.label}
                  </ContextMenu.Item>
                ))}
                {selectedWidgetId && (
                  <>
                    <ContextMenu.Separator className="editor-context-menu__separator" />
                    <ContextMenu.Item
                      className="editor-context-menu__item"
                      onSelect={handleRemoveWidget}
                    >
                      Remove
                    </ContextMenu.Item>
                  </>
                )}
              </ContextMenu.Content>
            </ContextMenu.Portal>
          </ContextMenu.Root>
        ) : (
          <ContextMenu.Root>
            <ContextMenu.Trigger asChild>{canvasContent}</ContextMenu.Trigger>
            <ContextMenu.Portal>
              <ContextMenu.Content className="editor-context-menu" sideOffset={4}>
                <ContextMenu.Item
                  className="editor-context-menu__item"
                  onSelect={() => onBsbInterfacePatch({ type: 'randomize' })}
                >
                  Randomize
                </ContextMenu.Item>
              </ContextMenu.Content>
            </ContextMenu.Portal>
          </ContextMenu.Root>
        )}
      </div>
    </Tooltip.Provider>
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

function GridOverlay({ gridSettings, canvasRef }: { gridSettings: { width: number; height: number; gridStyle: string }; canvasRef: React.RefObject<HTMLDivElement | null> }) {
  const w = Math.max(1, gridSettings.width);
  const h = Math.max(1, gridSettings.height);
  const style = gridSettings.gridStyle;

  const drawGrid = useCallback((canvas: HTMLCanvasElement) => {
    const container = canvasRef.current;
    if (!container) return;
    const cw = Math.max(container.scrollWidth, 2000);
    const ch = Math.max(container.scrollHeight, 2000);
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = 'rgba(80,110,160,0.3)';
    ctx.strokeStyle = 'rgba(80,110,160,0.3)';
    ctx.lineWidth = 1;
    if (style === 'DOT') {
      for (let x = 0; x < cw; x += w) {
        for (let y = 0; y < ch; y += h) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (style === 'LINE') {
      ctx.beginPath();
      for (let x = 0; x < cw; x += w) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, ch);
      }
      for (let y = 0; y < ch; y += h) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(cw, y + 0.5);
      }
      ctx.stroke();
    }
  }, [w, h, style, canvasRef]);

  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasElRef.current) drawGrid(canvasElRef.current);
  }, [drawGrid]);

  return (
    <canvas
      ref={canvasElRef}
      className="pointer-events-none absolute left-0 top-0"
      style={{ zIndex: 0 }}
    />
  );
}
