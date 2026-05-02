import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  BsbInterfacePatch,
  BsbWidgetNodeSnapshot,
  GridSettingsSnapshot,
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
import { getCanvasDisplaySize } from './widgets/utils';

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
  selectedWidgetIds: Set<string>;
  editEnabled: boolean;
  onWidgetSelect: (widgetId: string | null, shiftKey?: boolean) => void;
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void;
  onInstrumentPatch: (patch: InstrumentPatch) => void | Promise<void>;
}

interface GroupStackEntry {
  id: string;
  name: string;
}

interface MarqueeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}

export interface BsbCanvasClipboard {
  widgets: BsbWidgetNodeSnapshot[];
  originX: number;
  originY: number;
}

export function isGridSnapEnabled(gridSettings: Pick<GridSettingsSnapshot, 'snapEnabled'> | null | undefined): boolean {
  return gridSettings?.snapEnabled === true;
}

export function getNextMarqueeSelection(
  currentSelection: Set<string>,
  intersectingIds: Iterable<string>,
  shiftKey: boolean,
): Set<string> {
  if (!shiftKey) {
    return new Set(intersectingIds);
  }

  const next = new Set(currentSelection);
  for (const id of intersectingIds) {
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
  }
  return next;
}

export function createCanvasClipboard(selectedWidgets: BsbWidgetNodeSnapshot[]): BsbCanvasClipboard | null {
  if (selectedWidgets.length === 0) {
    return null;
  }

  return {
    widgets: selectedWidgets.map((widget) => JSON.parse(JSON.stringify(widget)) as BsbWidgetNodeSnapshot),
    originX: Math.min(...selectedWidgets.map((widget) => widget.x)),
    originY: Math.min(...selectedWidgets.map((widget) => widget.y)),
  };
}

export function buildPastedWidgets(
  clipboard: BsbCanvasClipboard | null,
  targetX: number,
  targetY: number,
  snapEnabled: boolean,
  gridWidth?: number,
  gridHeight?: number,
): BsbWidgetNodeSnapshot[] {
  if (!clipboard) {
    return [];
  }

  let offsetX = targetX - clipboard.originX;
  let offsetY = targetY - clipboard.originY;

  if (snapEnabled && gridWidth && gridHeight) {
    const snapX = Math.floor(targetX / gridWidth) * gridWidth;
    const snapY = Math.floor(targetY / gridHeight) * gridHeight;
    offsetX = snapX - clipboard.originX;
    offsetY = snapY - clipboard.originY;
  }

  return clipboard.widgets.map((widget) => {
    const clone = JSON.parse(JSON.stringify(widget)) as BsbWidgetNodeSnapshot;
    clone.x = (clone.x ?? 0) + offsetX;
    clone.y = (clone.y ?? 0) + offsetY;
    delete clone.id;
    return clone;
  });
}

function BSBInterfaceCanvas({
  instrument,
  selectedWidgetIds,
  editEnabled,
  onWidgetSelect,
  onBsbInterfacePatch,
}: BSBInterfaceCanvasProps): React.ReactElement {
  const [groupStack, setGroupStack] = useState<GroupStackEntry[]>([]);
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [clipboard, setClipboard] = useState<BsbCanvasClipboard | null>(null);
  const canvasInnerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const scrollMemory = useRef<Map<string, { scrollLeft: number; scrollTop: number }>>(new Map());
  const marqueeDragged = useRef(false);

  const gridSettings = instrument.gridSettings;
  const snapToGrid = isGridSnapEnabled(gridSettings);
  const resizeCtx = {
    gridSnapEnabled: snapToGrid,
    gridSnapWidth: gridSettings?.width,
    gridSnapHeight: gridSettings?.height,
  };

  const currentChildren = resolveCurrentChildren(instrument.widgetTree, groupStack);
  const canvasSize = getCanvasDisplaySize(
    currentChildren,
    viewportSize.width,
    viewportSize.height,
    editEnabled ? undefined : 10,
  );

  const parentGroupId = groupStack.length > 0 ? groupStack[groupStack.length - 1].id : undefined;

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;

    const measure = () => {
      const width = Math.ceil(element.clientWidth);
      const height = Math.ceil(element.clientHeight);
      setViewportSize((previous) => (
        previous.width === width && previous.height === height
          ? previous
          : { width, height }
      ));
    };

    measure();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleWidgetAction = useCallback((action: string) => {
    const selIds = selectedWidgetIds;
    if (selIds.size === 0) return;
    const selected = currentChildren.filter(c => selIds.has(c.id));
    const ww = (s: BsbWidgetNodeSnapshot) => s.width ?? 60;
    const wh = (s: BsbWidgetNodeSnapshot) => s.height ?? 24;

    switch (action) {
      case 'copy': {
        setClipboard(createCanvasClipboard(selected));
        break;
      }
      case 'cut': {
        setClipboard(createCanvasClipboard(selected));
        for (const id of selIds) {
          onBsbInterfacePatch({ type: 'removeWidget', widgetId: id });
        }
        onWidgetSelect(null);
        break;
      }
      case 'make-group': {
        onBsbInterfacePatch({ type: 'makeGroup', widgetIds: [...selIds], parentGroupId });
        break;
      }
      case 'break-group': {
        const groupId = [...selIds][0];
        if (groupId) onBsbInterfacePatch({ type: 'breakGroup', widgetId: groupId });
        break;
      }
      case 'align-left': {
        const target = Math.min(...selected.map(s => s.x));
        for (const s of selected) {
          if (s.x !== target) onBsbInterfacePatch({ type: 'updateWidgetProperties', widgetId: s.id, properties: { x: target } });
        }
        break;
      }
      case 'align-right': {
        const target = Math.max(...selected.map(s => s.x + ww(s)));
        for (const s of selected) {
          const nx = target - ww(s);
          if (s.x !== nx) onBsbInterfacePatch({ type: 'updateWidgetProperties', widgetId: s.id, properties: { x: nx } });
        }
        break;
      }
      case 'align-top': {
        const target = Math.min(...selected.map(s => s.y));
        for (const s of selected) {
          if (s.y !== target) onBsbInterfacePatch({ type: 'updateWidgetProperties', widgetId: s.id, properties: { y: target } });
        }
        break;
      }
      case 'align-bottom': {
        const target = Math.max(...selected.map(s => s.y + wh(s)));
        for (const s of selected) {
          const ny = target - wh(s);
          if (s.y !== ny) onBsbInterfacePatch({ type: 'updateWidgetProperties', widgetId: s.id, properties: { y: ny } });
        }
        break;
      }
      case 'align-center-h': {
        const left = Math.min(...selected.map(s => s.x));
        const right = Math.max(...selected.map(s => s.x + ww(s)));
        const center = (left + right) / 2;
        for (const s of selected) {
          onBsbInterfacePatch({ type: 'updateWidgetProperties', widgetId: s.id, properties: { x: Math.round(center - ww(s) / 2) } });
        }
        break;
      }
      case 'align-center-v': {
        const top = Math.min(...selected.map(s => s.y));
        const bottom = Math.max(...selected.map(s => s.y + wh(s)));
        const center = (top + bottom) / 2;
        for (const s of selected) {
          onBsbInterfacePatch({ type: 'updateWidgetProperties', widgetId: s.id, properties: { y: Math.round(center - wh(s) / 2) } });
        }
        break;
      }
      case 'distribute-h': {
        if (selected.length < 3) break;
        const sorted = [...selected].sort((a, b) => (a.x + ww(a) / 2) - (b.x + ww(b) / 2));
        const firstC = sorted[0].x + ww(sorted[0]) / 2;
        const lastC = sorted[sorted.length - 1].x + ww(sorted[sorted.length - 1]) / 2;
        const spacing = (lastC - firstC) / (sorted.length - 1);
        for (let i = 1; i < sorted.length - 1; i++) {
          const target = Math.round(firstC + spacing * i - ww(sorted[i]) / 2);
          onBsbInterfacePatch({ type: 'updateWidgetProperties', widgetId: sorted[i].id, properties: { x: Math.max(0, target) } });
        }
        break;
      }
      case 'distribute-v': {
        if (selected.length < 3) break;
        const sorted = [...selected].sort((a, b) => (a.y + wh(a) / 2) - (b.y + wh(b) / 2));
        const firstC = sorted[0].y + wh(sorted[0]) / 2;
        const lastC = sorted[sorted.length - 1].y + wh(sorted[sorted.length - 1]) / 2;
        const spacing = (lastC - firstC) / (sorted.length - 1);
        for (let i = 1; i < sorted.length - 1; i++) {
          const target = Math.round(firstC + spacing * i - wh(sorted[i]) / 2);
          onBsbInterfacePatch({ type: 'updateWidgetProperties', widgetId: sorted[i].id, properties: { y: Math.max(0, target) } });
        }
        break;
      }
    }
  }, [currentChildren, selectedWidgetIds, onBsbInterfacePatch, onWidgetSelect, parentGroupId]);

  const getWidgetPosition = useCallback((id: string) => {
    const find = (nodes: BsbWidgetNodeSnapshot[]): { x: number; y: number } | undefined => {
      for (const n of nodes) {
        if (n.id === id) return { x: n.x, y: n.y };
        if (n.children) {
          const found = find(n.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return find(currentChildren);
  }, [currentChildren]);

  // Arrow key movement for selected widgets
  useEffect(() => {
    if (!editEnabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      if (selectedWidgetIds.size === 0) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      const stepX = snapToGrid ? gridSettings.width : 1;
      const stepY = snapToGrid ? gridSettings.height : 1;
      const dx = e.key === 'ArrowLeft' ? -stepX : e.key === 'ArrowRight' ? stepX : 0;
      const dy = e.key === 'ArrowUp' ? -stepY : e.key === 'ArrowDown' ? stepY : 0;
      for (const widgetId of selectedWidgetIds) {
        const pos = getWidgetPosition(widgetId);
        if (!pos) continue;
        const nx = Math.max(0, pos.x + dx);
        const ny = Math.max(0, pos.y + dy);
        onBsbInterfacePatch({ type: 'updateWidgetProperties', widgetId, properties: { x: nx, y: ny } });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editEnabled, selectedWidgetIds, snapToGrid, gridSettings, onBsbInterfacePatch, getWidgetPosition]);

  const enterGroup = (node: BsbWidgetNodeSnapshot) => {
    if (canvasRef.current) {
      const key = groupStack.map(e => e.id).join('/');
      scrollMemory.current.set(key, { scrollLeft: canvasRef.current.scrollLeft, scrollTop: canvasRef.current.scrollTop });
    }
    const groupName = typeof node.properties.groupName === 'string' ? node.properties.groupName : node.type;
    setGroupStack((prev) => [...prev, { id: node.id, name: groupName }]);
    onWidgetSelect(null);
    requestAnimationFrame(() => {
      if (canvasRef.current) {
        canvasRef.current.scrollLeft = 0;
        canvasRef.current.scrollTop = 0;
      }
    });
  };

  const navigateTo = (index: number) => {
    if (canvasRef.current) {
      const currentKey = groupStack.map(e => e.id).join('/');
      scrollMemory.current.set(currentKey, { scrollLeft: canvasRef.current.scrollLeft, scrollTop: canvasRef.current.scrollTop });
    }
    const targetKey = groupStack.slice(0, index).map(e => e.id).join('/');
    setGroupStack((prev) => prev.slice(0, index));
    onWidgetSelect(null);
    requestAnimationFrame(() => {
      if (canvasRef.current) {
        const saved = scrollMemory.current.get(targetKey);
        if (saved) {
          canvasRef.current.scrollLeft = saved.scrollLeft;
          canvasRef.current.scrollTop = saved.scrollTop;
        } else {
          canvasRef.current.scrollLeft = 0;
          canvasRef.current.scrollTop = 0;
        }
      }
    });
  };

  const handleDoubleClick = (node: BsbWidgetNodeSnapshot) => {
    if (node.type === 'BSBGroup') {
      enterGroup(node);
    }
  };

  const renderWidget = (node: BsbWidgetNodeSnapshot): React.ReactNode => {
    const isSelected = selectedWidgetIds.has(node.id);
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
      ...(isSelected
        ? {
            selectedWidgetIds,
            getWidgetPosition,
            onWidgetAction: handleWidgetAction,
          }
        : {}),
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
    if (isGridSnapEnabled(gs)) {
      snapX = Math.floor(x / gs.width) * gs.width;
      snapY = Math.floor(y / gs.height) * gs.height;
    }
    const parentGroupId = groupStack.length > 0 ? groupStack[groupStack.length - 1].id : undefined;
    onBsbInterfacePatch({ type: 'addWidget', widgetType, x: snapX, y: snapY, parentGroupId });
  }, [instrument.gridSettings, groupStack, onBsbInterfacePatch]);

  const contextMenuPos = useRef({ x: 0, y: 0 });

  const canPaste = clipboard !== null && clipboard.widgets.length > 0;

  const handlePaste = useCallback(() => {
    if (!clipboard) return;
    const gs = instrument.gridSettings;
    const widgets = buildPastedWidgets(
      clipboard,
      contextMenuPos.current.x,
      contextMenuPos.current.y,
      isGridSnapEnabled(gs),
      gs?.width,
      gs?.height,
    );
    const pgId = groupStack.length > 0 ? groupStack[groupStack.length - 1].id : undefined;
    onBsbInterfacePatch({ type: 'pasteWidgets', widgetData: JSON.stringify(widgets), parentGroupId: pgId });
  }, [clipboard, groupStack, onBsbInterfacePatch, instrument.gridSettings]);

  // Marquee selection handlers
  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (!editEnabled || e.button !== 0) return;
    // Don't start marquee if clicking on a widget (widgets stop propagation on mousedown when selected,
    // but unselected widgets let it through; check target)
    const target = e.target as HTMLElement;
    if (target.closest('[data-widget-id]')) return;

    const rect = canvasInnerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMarquee({ startX: x, startY: y, currentX: x, currentY: y, active: false });
  };

  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (!marquee) return;
    const rect = canvasInnerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - marquee.startX;
    const dy = y - marquee.startY;
    const active = marquee.active || Math.abs(dx) > 3 || Math.abs(dy) > 3;
    setMarquee({ ...marquee, currentX: x, currentY: y, active });
  };

  const onCanvasMouseUp = (e: React.MouseEvent) => {
    if (!marquee) return;
    if (marquee.active) {
      marqueeDragged.current = true;
      const minX = Math.min(marquee.startX, marquee.currentX);
      const minY = Math.min(marquee.startY, marquee.currentY);
      const maxX = Math.max(marquee.startX, marquee.currentX);
      const maxY = Math.max(marquee.startY, marquee.currentY);
      const ids = new Set<string>();
      for (const child of currentChildren) {
        const cw = child.width ?? 60;
        const ch = child.height ?? 24;
        const intersects =
          child.x < maxX &&
          child.x + cw > minX &&
          child.y < maxY &&
          child.y + ch > minY;
        if (intersects) {
          ids.add(child.id);
        }
      }
      const nextSelection = getNextMarqueeSelection(selectedWidgetIds, ids, e.shiftKey);
      onWidgetSelect(null);
      for (const id of nextSelection) {
        onWidgetSelect(id, true);
      }
    } else {
      // Simple click on background - clear selection (handled via click, see below)
    }
    setMarquee(null);
  };

  const onCanvasClick = (e: React.MouseEvent) => {
    if (marqueeDragged.current) {
      marqueeDragged.current = false;
      return;
    }
    const target = e.target as HTMLElement;
    if (!target.closest('[data-widget-id]')) {
      onWidgetSelect(null);
    }
  };

  const marqueeStyle: React.CSSProperties | undefined = marquee
    ? {
        position: 'absolute',
        left: Math.min(marquee.startX, marquee.currentX),
        top: Math.min(marquee.startY, marquee.currentY),
        width: Math.abs(marquee.currentX - marquee.startX),
        height: Math.abs(marquee.currentY - marquee.startY),
        border: '1px dashed rgba(233, 69, 96, 0.8)',
        background: 'rgba(233, 69, 96, 0.08)',
        zIndex: 50,
        pointerEvents: 'none',
      }
    : undefined;

  const canvasContent = (
    <div
      ref={canvasRef}
      className="relative flex-1 overflow-auto bg-[#26334c]"
      onClick={onCanvasClick}
      onContextMenu={(e) => {
        if (editEnabled && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          contextMenuPos.current = { x: e.clientX - rect.left + canvasRef.current.scrollLeft, y: e.clientY - rect.top + canvasRef.current.scrollTop };
        }
      }}
    >
      <div
        ref={canvasInnerRef}
        className="relative"
        style={{ minHeight: editEnabled ? 400 : canvasSize.height, minWidth: editEnabled ? 600 : canvasSize.width, width: canvasSize.width, height: canvasSize.height }}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
      >
        {editEnabled && gridSettings?.gridStyle && gridSettings.gridStyle !== 'NONE' && (
          <GridOverlay gridSettings={gridSettings} canvasWidth={canvasSize.width} canvasHeight={canvasSize.height} />
        )}
        {currentChildren.map((child) => renderWidget(child))}
        {marquee && marquee.active && (
          <div style={marqueeStyle} />
        )}
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
                <ContextMenu.Item className="editor-context-menu__item" onSelect={handlePaste} disabled={!canPaste}>
                  Paste
                </ContextMenu.Item>
                <ContextMenu.Separator className="editor-context-menu__separator" />
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

export default React.memo(BSBInterfaceCanvas);

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

function GridOverlay({
  gridSettings,
  canvasWidth,
  canvasHeight,
}: {
  gridSettings: { width: number; height: number; gridStyle: string };
  canvasWidth: number;
  canvasHeight: number;
}) {
  const w = Math.max(1, gridSettings.width);
  const h = Math.max(1, gridSettings.height);
  const style = gridSettings.gridStyle;

  const drawGrid = useCallback((canvas: HTMLCanvasElement) => {
    const cw = Math.max(canvasWidth, 2000);
    const ch = Math.max(canvasHeight, 2000);
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
  }, [w, h, style, canvasWidth, canvasHeight]);

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
