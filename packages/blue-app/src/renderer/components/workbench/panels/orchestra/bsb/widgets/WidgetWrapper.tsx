import React, { useCallback, useRef, useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { BsbWidgetNodeSnapshot, BsbInterfacePatch } from '../../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';

const HANDLE_SIZE = 5;

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
  resizeMeta?: BSBWidgetResizeMeta;
  gridSnapEnabled?: boolean;
  gridSnapWidth?: number;
  gridSnapHeight?: number;
  onBsbInterfacePatch?: (patch: BsbInterfacePatch) => void;
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
  resizeMeta,
  gridSnapEnabled,
  gridSnapWidth,
  gridSnapHeight,
  onBsbInterfacePatch,
}: WidgetWrapperProps): React.ReactElement {
  const w = displayWidth ?? node.width ?? 60;
  const h = displayHeight ?? node.height ?? 24;
  const moveDragRef = useRef<{ startX: number; startY: number; originClientX: number; originClientY: number } | null>(null);
  const moveParamsRef = useRef({ nodeId: node.id, nodeX: node.x, nodeY: node.y, gridSnapEnabled, gridSnapWidth, gridSnapHeight, onBsbInterfacePatch });
  moveParamsRef.current = { nodeId: node.id, nodeX: node.x, nodeY: node.y, gridSnapEnabled, gridSnapWidth, gridSnapHeight, onBsbInterfacePatch };

  const moveRafRef = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const md = moveDragRef.current;
      if (!md) return;
      e.preventDefault();
      cancelAnimationFrame(moveRafRef.current);
      moveRafRef.current = requestAnimationFrame(() => {
        const md2 = moveDragRef.current;
        if (!md2) return;
        const { nodeId: id, gridSnapEnabled: snap, gridSnapWidth: gw, gridSnapHeight: gh, onBsbInterfacePatch: patch } = moveParamsRef.current;
        let dx = e.clientX - md2.originClientX;
        let dy = e.clientY - md2.originClientY;
        if (snap && gw) dx = Math.round(dx / gw) * gw;
        if (snap && gh) dy = Math.round(dy / gh) * gh;
        const nx = Math.max(0, md2.startX + dx);
        const ny = Math.max(0, md2.startY + dy);
        patch?.({ type: 'updateWidgetProperties', widgetId: id, properties: { x: nx, y: ny } });
      });
    };
    const onUp = () => {
      cancelAnimationFrame(moveRafRef.current);
      moveDragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(moveRafRef.current);
    };
  }, []);

  const sizeStyle = autoSize ? {} : { width: w, height: h };

  const showHandles = editEnabled && isSelected && resizeMeta && onBsbInterfacePatch &&
    (resizeMeta.canResizeWidth || resizeMeta.canResizeHeight);

  const tooltipText =
    !editEnabled && (node.properties?.comment as string)
      ? (node.properties.comment as string)
      : node.preservedOnly
        ? `[Preserved] ${node.objectName || node.type}`
        : undefined;

  const widgetDiv = (
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
      onMouseDown={(e) => {
        if (!editEnabled || !isSelected || e.button !== 0) return;
        e.stopPropagation();
        moveDragRef.current = { startX: node.x, startY: node.y, originClientX: e.clientX, originClientY: e.clientY };
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.();
      }}
    >
      {children}
      {showHandles && resizeMeta!.canResizeWidth && (
        <>
          <ResizeHandle edge="right" containerW={w} containerH={h} nodeId={node.id} minSize={resizeMeta!.minWidth} propertyKey={resizeMeta!.widthProperty ?? 'width'} startValue={typeof node.properties[resizeMeta!.widthProperty ?? 'width'] === 'number' ? node.properties[resizeMeta!.widthProperty ?? 'width'] as number : node.width ?? 60} gridSnapEnabled={gridSnapEnabled} gridSnapSize={gridSnapWidth} onPatch={onBsbInterfacePatch!} />
          <ResizeHandle edge="left" containerW={w} containerH={h} nodeId={node.id} nodeX={node.x} minSize={resizeMeta!.minWidth} propertyKey={resizeMeta!.widthProperty ?? 'width'} startValue={typeof node.properties[resizeMeta!.widthProperty ?? 'width'] === 'number' ? node.properties[resizeMeta!.widthProperty ?? 'width'] as number : node.width ?? 60} gridSnapEnabled={gridSnapEnabled} gridSnapSize={gridSnapWidth} onPatch={onBsbInterfacePatch!} />
        </>
      )}
      {showHandles && resizeMeta!.canResizeHeight && (
        <>
          <ResizeHandle edge="bottom" containerW={w} containerH={h} nodeId={node.id} minSize={resizeMeta!.minHeight} propertyKey={resizeMeta!.heightProperty ?? 'height'} startValue={typeof node.properties[resizeMeta!.heightProperty ?? 'height'] === 'number' ? node.properties[resizeMeta!.heightProperty ?? 'height'] as number : node.height ?? 24} gridSnapEnabled={gridSnapEnabled} gridSnapSize={gridSnapHeight} onPatch={onBsbInterfacePatch!} />
          <ResizeHandle edge="top" containerW={w} containerH={h} nodeId={node.id} nodeY={node.y} minSize={resizeMeta!.minHeight} propertyKey={resizeMeta!.heightProperty ?? 'height'} startValue={typeof node.properties[resizeMeta!.heightProperty ?? 'height'] === 'number' ? node.properties[resizeMeta!.heightProperty ?? 'height'] as number : node.height ?? 24} gridSnapEnabled={gridSnapEnabled} gridSnapSize={gridSnapHeight} onPatch={onBsbInterfacePatch!} />
        </>
      )}
    </div>
  );

  if (!tooltipText) return widgetDiv;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {widgetDiv}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bsb-tooltip-content"
          sideOffset={4}
          side="top"
          align="center"
        >
          {tooltipText}
          <Tooltip.Arrow className="bsb-tooltip-arrow" width={10} height={5} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

interface ResizeHandleProps {
  edge: 'right' | 'bottom' | 'left' | 'top';
  containerW: number;
  containerH: number;
  nodeId: string;
  nodeX?: number;
  nodeY?: number;
  minSize: number;
  propertyKey: string;
  startValue: number;
  gridSnapEnabled?: boolean;
  gridSnapSize?: number;
  onPatch: (patch: BsbInterfacePatch) => void;
}

function ResizeHandle({
  edge,
  containerW,
  containerH,
  nodeId,
  nodeX,
  nodeY,
  minSize,
  propertyKey,
  startValue,
  gridSnapEnabled,
  gridSnapSize,
  onPatch,
}: ResizeHandleProps): React.ReactElement {
  const dragState = useRef<{ startClient: number; startVal: number; startPos: number } | null>(null);
  const rafRef = useRef(0);
  const paramsRef = useRef({ nodeId, nodeX, nodeY, minSize, gridSnapEnabled, gridSnapSize, propertyKey });
  paramsRef.current = { nodeId, nodeX, nodeY, minSize, gridSnapEnabled, gridSnapSize, propertyKey };
  const patchRef = useRef(onPatch);
  patchRef.current = onPatch;

  const isHorizontal = edge === 'right' || edge === 'left';

  const handleStyle: React.CSSProperties = (() => {
    switch (edge) {
      case 'right': return { position: 'absolute', right: 0, top: containerH / 2 - HANDLE_SIZE / 2, width: HANDLE_SIZE, height: HANDLE_SIZE, cursor: 'e-resize', zIndex: 20 };
      case 'left': return { position: 'absolute', left: 0, top: containerH / 2 - HANDLE_SIZE / 2, width: HANDLE_SIZE, height: HANDLE_SIZE, cursor: 'w-resize', zIndex: 20 };
      case 'bottom': return { position: 'absolute', bottom: 0, left: containerW / 2 - HANDLE_SIZE / 2, width: HANDLE_SIZE, height: HANDLE_SIZE, cursor: 's-resize', zIndex: 20 };
      case 'top': return { position: 'absolute', top: 0, left: containerW / 2 - HANDLE_SIZE / 2, width: HANDLE_SIZE, height: HANDLE_SIZE, cursor: 'n-resize', zIndex: 20 };
    }
  })();

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const ds = dragState.current;
      if (!ds) return;
      e.preventDefault();
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const ds2 = dragState.current;
        if (!ds2) return;
        const { nodeId: id, minSize: ms, gridSnapEnabled: snap, gridSnapSize: gs, propertyKey: pk } = paramsRef.current;
        const client = isHorizontal ? e.clientX : e.clientY;
        let delta = client - ds2.startClient;
        if (snap && gs) delta = Math.round(delta / gs) * gs;

        if (edge === 'right' || edge === 'bottom') {
          const newSize = Math.max(ms, ds2.startVal + delta);
          patchRef.current({ type: 'updateWidgetProperties', widgetId: id, properties: { [pk]: newSize } });
        } else {
          const newSize = Math.max(ms, ds2.startVal - delta);
          const newPos = ds2.startPos + delta;
          if (newPos >= 0) {
            patchRef.current({ type: 'updateWidgetProperties', widgetId: id, properties: { [pk]: newSize, [isHorizontal ? 'x' : 'y']: newPos } });
          }
        }
      });
    };
    const onMouseUp = () => {
      cancelAnimationFrame(rafRef.current);
      dragState.current = null;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [edge, isHorizontal]);

  return (
    <div
      style={{ ...handleStyle, backgroundColor: '#00ff00' }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        dragState.current = { startClient: isHorizontal ? e.clientX : e.clientY, startVal: startValue, startPos: edge === 'left' ? (nodeX ?? 0) : edge === 'top' ? (nodeY ?? 0) : 0 };
      }}
      onClick={(e) => e.stopPropagation()}
    />
  );
}


