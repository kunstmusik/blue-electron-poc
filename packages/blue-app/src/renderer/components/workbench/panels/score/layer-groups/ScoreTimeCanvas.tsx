import { useRef, useCallback, useState, useEffect } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { PolyObjectLayerGroupSnapshot, ScoreLayerSnapshot, ScoreRowObjectSnapshot } from '../types';
import { DEFAULT_ROW_HEIGHT } from '../types';
import { useScoreSelectionStore, type ScoreObjectClipboardEntry } from '../../../../../stores/score-selection-store';
import { useProjectStore } from '../../../../../stores/project-store';
import { snapValueToBeats } from '@blue/data';
import type { SnapValueName } from '@blue/data';

interface Props {
  group: PolyObjectLayerGroupSnapshot;
  pixelsPerBeat: number;
  snapEnabled: boolean;
  snapValue: SnapValueName;
  tempo: number;
  smpteFrameRate: number;
  onDoubleClickObject?: (objectId: string) => void;
}

function argbToRGB(argb: number): number {
  return argb & 0x00FFFFFF;
}

function rgbToCSS(rgb: number): string {
  return `#${rgb.toString(16).padStart(6, '0')}`;
}

function colorToCSS(argb: number): string {
  return rgbToCSS(argbToRGB(argb));
}

function brighten(rgb: number, factor: number): number {
  const r = Math.min(255, Math.round(((rgb >> 16) & 0xFF) * factor));
  const g = Math.min(255, Math.round(((rgb >> 8) & 0xFF) * factor));
  const b = Math.min(255, Math.round((rgb & 0xFF) * factor));
  return (r << 16) | (g << 8) | b;
}

function darken(rgb: number, factor: number): number {
  const r = Math.max(0, Math.round(((rgb >> 16) & 0xFF) * factor));
  const g = Math.max(0, Math.round(((rgb >> 8) & 0xFF) * factor));
  const b = Math.max(0, Math.round((rgb & 0xFF) * factor));
  return (r << 16) | (g << 8) | b;
}

function textColorForBackground(argb: number): string {
  const r = (argb >> 16) & 0xFF;
  const g = (argb >> 8) & 0xFF;
  const b = argb & 0xFF;
  return (r + g + b) > 128 * 3 ? '#000000' : '#ffffff';
}

function findItemOnLayer(layer: ScoreLayerSnapshot, xBeats: number): ScoreRowObjectSnapshot | null {
  for (let i = layer.items.length - 1; i >= 0; i--) {
    const item = layer.items[i];
    if (xBeats >= item.startBeats && xBeats <= item.startBeats + item.durationBeats) {
      return item;
    }
  }
  return null;
}

function findLayerAtY(
  layers: ScoreLayerSnapshot[],
  localY: number,
): { layer: ScoreLayerSnapshot; index: number; yOffset: number } | null {
  let yOff = 0;
  for (let i = 0; i < layers.length; i++) {
    const h = layers[i].height || DEFAULT_ROW_HEIGHT;
    if (localY >= yOff && localY < yOff + h) {
      return { layer: layers[i], index: i, yOffset: yOff };
    }
    yOff += h;
  }
  return null;
}

function collectAllItemIds(group: PolyObjectLayerGroupSnapshot): string[] {
  const ids: string[] = [];
  for (const layer of group.layers) {
    for (const item of layer.items) {
      ids.push(item.objectId);
    }
  }
  return ids;
}

type GestureMode = 'none' | 'marquee' | 'move' | 'resizeLeft' | 'resizeRight';

const RESIZE_EDGE_PX = 5;
const DEFAULT_SOBJ_BG = 0xFF404040;
const DEFAULT_SOBJ_DURATION = 4.0;

export default function ScoreTimeCanvas({
  group,
  pixelsPerBeat,
  snapEnabled,
  snapValue,
  tempo,
  smpteFrameRate,
  onDoubleClickObject,
}: Props) {
  const selectedObjectIds = useScoreSelectionStore((s) => s.selectedObjectIds);
  const select = useScoreSelectionStore((s) => s.select);
  const clearSelection = useScoreSelectionStore((s) => s.clearSelection);
  const setSelection = useScoreSelectionStore((s) => s.setSelection);
  const copySelected = useScoreSelectionStore((s) => s.copySelected);
  const clipboard = useScoreSelectionStore((s) => s.clipboard);
  const moveScoreObjects = useProjectStore((s) => s.moveScoreObjects);
  const removeScoreObjects = useProjectStore((s) => s.removeScoreObjects);
  const addScoreObjects = useProjectStore((s) => s.addScoreObjects);
  const setScoreObjectColor = useProjectStore((s) => s.setScoreObjectColor);
  const resizeScoreObjects = useProjectStore((s) => s.resizeScoreObjects);

  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ xBeats: number; layerIndex: number } | null>(null);
  const [contextMenuOnObject, setContextMenuOnObject] = useState(false);
  const [marquee, setMarquee] = useState<{
    startX: number; startY: number; endX: number; endY: number;
  } | null>(null);
  const gestureRef = useRef<{
    mode: GestureMode;
    startClientX: number;
    startClientY: number;
    startBeats: number;
    additive: boolean;
    originalPositions: Array<{ objectId: string; startBeats: number; durationBeats: number }>;
  } | null>(null);
  const [cursorOverride, setCursorOverride] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const snapBeats = snapEnabled
    ? snapValueToBeats(snapValue, tempo, smpteFrameRate, 44100, pixelsPerBeat)
    : 0;

  const snapBeatValueMove = useCallback((beats: number): number => {
    if (!snapEnabled || snapBeats <= 0) return beats;
    return Math.round(beats / snapBeats) * snapBeats;
  }, [snapEnabled, snapBeats]);

  const snapBeatValueStart = useCallback((beats: number): number => {
    if (!snapEnabled || snapBeats <= 0) return beats;
    return Math.floor(beats / snapBeats) * snapBeats;
  }, [snapEnabled, snapBeats]);

  const toLocalXY = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) return;

    const { x, y } = toLocalXY(e.clientX, e.clientY);
    const xBeats = x / pixelsPerBeat;
    const hit = findLayerAtY(group.layers, y);
    if (!hit) return;

    const item = findItemOnLayer(hit.layer, xBeats);

    const isMeta = e.metaKey || e.ctrlKey;
    if (isMeta && !item && clipboard.length > 0) {
      const minLayerIdx = Math.min(...clipboard.map((c) => c.layerIndex));
      const minStart = Math.min(...clipboard.map((c) => c.startBeats));
      const offsetBeats = snapBeatValueStart(xBeats) - minStart;
      const objects = clipboard.map((entry) => ({
        ...entry,
        startBeats: entry.startBeats + offsetBeats,
        layerIndex: hit.index + (entry.layerIndex - minLayerIdx),
      }));
      addScoreObjects(objects);
      return;
    }

    if (!item) {
      if (e.shiftKey) {
        gestureRef.current = {
          mode: 'marquee', startClientX: e.clientX, startClientY: e.clientY,
          startBeats: 0, additive: true, originalPositions: [],
        };
      } else {
        clearSelection();
        gestureRef.current = {
          mode: 'marquee', startClientX: e.clientX, startClientY: e.clientY,
          startBeats: 0, additive: false, originalPositions: [],
        };
      }
      setMarquee(null);
      return;
    }

    if (e.shiftKey) {
      select(item.objectId, true);
      return;
    }

    if (!selectedObjectIds.has(item.objectId)) {
      select(item.objectId, false);
    }

    const itemLeft = item.startBeats * pixelsPerBeat;
    const itemWidth = item.durationBeats * pixelsPerBeat;
    const localX = x - itemLeft;
    const onLeftEdge = localX > 0 && localX < RESIZE_EDGE_PX;
    const onRightEdge = localX > itemWidth - RESIZE_EDGE_PX && localX < itemWidth;

    const origPositions: Array<{ objectId: string; startBeats: number; durationBeats: number }> = [];
    for (const layer of group.layers) {
      for (const obj of layer.items) {
        if (selectedObjectIds.has(obj.objectId) || obj.objectId === item.objectId) {
          origPositions.push({ objectId: obj.objectId, startBeats: obj.startBeats, durationBeats: obj.durationBeats });
        }
      }
    }

    if (onLeftEdge || onRightEdge) {
      gestureRef.current = {
        mode: onLeftEdge ? 'resizeLeft' : 'resizeRight',
        startClientX: e.clientX,
        startClientY: e.clientY,
        startBeats: xBeats,
        additive: false,
        originalPositions: origPositions,
      };
    } else {
      gestureRef.current = {
        mode: 'move',
        startClientX: e.clientX,
        startClientY: e.clientY,
        startBeats: xBeats,
        additive: false,
        originalPositions: origPositions,
      };
    }
  }, [toLocalXY, pixelsPerBeat, group.layers, select, clearSelection, selectedObjectIds, clipboard, snapBeatValueStart, addScoreObjects]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!gestureRef.current) {
      const { x, y } = toLocalXY(e.clientX, e.clientY);
      const xBeats = x / pixelsPerBeat;
      const hit = findLayerAtY(group.layers, y);
      if (hit) {
        const item = findItemOnLayer(hit.layer, xBeats);
        if (item) {
          setTooltip(`${item.name} (${item.objectType}) @ beat ${item.startBeats.toFixed(2)}, dur ${item.durationBeats.toFixed(2)}`);
          if (selectedObjectIds.has(item.objectId)) {
            const itemLeft = item.startBeats * pixelsPerBeat;
            const itemWidth = item.durationBeats * pixelsPerBeat;
            const localX = x - itemLeft;
            if (localX > 0 && localX < RESIZE_EDGE_PX) {
              setCursorOverride('w-resize');
            } else if (localX > itemWidth - RESIZE_EDGE_PX && localX < itemWidth) {
              setCursorOverride('e-resize');
            } else {
              setCursorOverride('move');
            }
          } else {
            setCursorOverride(null);
          }
        } else {
          setTooltip(null);
          setCursorOverride(null);
        }
      } else {
        setTooltip(null);
        setCursorOverride(null);
      }
      return;
    }
    const g = gestureRef.current;

    if (g.mode === 'marquee') {
      const start = toLocalXY(g.startClientX, g.startClientY);
      const end = toLocalXY(e.clientX, e.clientY);
      setMarquee({ startX: start.x, startY: start.y, endX: end.x, endY: end.y });
    } else if (g.mode === 'move') {
      const { x } = toLocalXY(e.clientX, e.clientY);
      const currentBeats = x / pixelsPerBeat;
      const rawDelta = currentBeats - g.startBeats;
      const snappedDelta = snapBeatValueMove(rawDelta);
      const minOriginal = Math.min(...g.originalPositions.map((p) => p.startBeats));
      const clampedDelta = Math.max(-minOriginal, snappedDelta);
      const moves = g.originalPositions.map((pos) => ({
        objectId: pos.objectId,
        targetStartBeats: pos.startBeats + clampedDelta,
      }));
      moveScoreObjects(moves);
    } else if (g.mode === 'resizeRight' || g.mode === 'resizeLeft') {
      const { x } = toLocalXY(e.clientX, e.clientY);
      const currentBeats = x / pixelsPerBeat;
      const rawDelta = currentBeats - g.startBeats;
      const snappedDelta = snapBeatValueMove(rawDelta);

      if (g.mode === 'resizeRight') {
        const resizes = g.originalPositions.map((pos) => ({
          objectId: pos.objectId,
          targetStartBeats: pos.startBeats,
          targetDurationBeats: Math.max(0.25, pos.durationBeats + snappedDelta),
        }));
        resizeScoreObjects(resizes);
      } else {
        const resizes = g.originalPositions.map((pos) => {
          const shift = Math.min(pos.startBeats, Math.max(-pos.startBeats, snappedDelta));
          return {
            objectId: pos.objectId,
            targetStartBeats: pos.startBeats + shift,
            targetDurationBeats: Math.max(0.25, pos.durationBeats - shift),
          };
        });
        resizeScoreObjects(resizes);
      }
    }
  }, [toLocalXY, pixelsPerBeat, group.layers, selectedObjectIds, moveScoreObjects, resizeScoreObjects, snapBeatValueMove]);

  const handleMouseUp = useCallback(() => {
    if (!gestureRef.current) {
      setMarquee(null);
      return;
    }
    const g = gestureRef.current;

    if (g.mode === 'marquee' && marquee) {
      const left = Math.min(marquee.startX, marquee.endX);
      const right = Math.max(marquee.startX, marquee.endX);
      const top = Math.min(marquee.startY, marquee.endY);
      const bottom = Math.max(marquee.startY, marquee.endY);

      const startBeats = left / pixelsPerBeat;
      const endBeats = right / pixelsPerBeat;

      const hitIds: string[] = [];
      if (!g.additive) {
        clearSelection();
      }
      let yOff = 0;
      for (const layer of group.layers) {
        const h = layer.height || DEFAULT_ROW_HEIGHT;
        const layerTop = yOff;
        const layerBottom = yOff + h;
        if (layerBottom > top && layerTop < bottom) {
          for (const item of layer.items) {
            const itemEnd = item.startBeats + item.durationBeats;
            if (item.startBeats < endBeats && itemEnd > startBeats) {
              hitIds.push(item.objectId);
            }
          }
        }
        yOff += h;
      }
      if (hitIds.length > 0) {
        setSelection(hitIds);
      }
    }

    gestureRef.current = null;
    setMarquee(null);
  }, [marquee, pixelsPerBeat, group.layers, clearSelection, setSelection]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const { x, y } = toLocalXY(e.clientX, e.clientY);
    const xBeats = x / pixelsPerBeat;
    const hit = findLayerAtY(group.layers, y);
    if (!hit) return;
    const item = findItemOnLayer(hit.layer, xBeats);
    if (item && item.isContainer && onDoubleClickObject) {
      onDoubleClickObject(item.objectId);
    }
  }, [toLocalXY, pixelsPerBeat, group.layers, onDoubleClickObject]);

  const getSelectedEntries = useCallback((): ScoreObjectClipboardEntry[] => {
    const entries: ScoreObjectClipboardEntry[] = [];
    for (const layer of group.layers) {
      const idx = group.layers.indexOf(layer);
      for (const item of layer.items) {
        if (selectedObjectIds.has(item.objectId)) {
          entries.push({ ...item, layerIndex: idx, groupId: group.groupId });
        }
      }
    }
    return entries;
  }, [group, selectedObjectIds]);

  const handleCopy = useCallback(() => {
    const entries = getSelectedEntries();
    if (entries.length > 0) copySelected(entries);
  }, [getSelectedEntries, copySelected]);

  const handleCut = useCallback(() => {
    const entries = getSelectedEntries();
    if (entries.length > 0) {
      copySelected(entries);
      removeScoreObjects(selectedObjectIds);
      clearSelection();
    }
  }, [getSelectedEntries, copySelected, removeScoreObjects, selectedObjectIds, clearSelection]);

  const handleRemove = useCallback(() => {
    if (selectedObjectIds.size > 0) {
      removeScoreObjects(selectedObjectIds);
      clearSelection();
    }
  }, [selectedObjectIds, removeScoreObjects, clearSelection]);

  const handleContextMenuPaste = useCallback(() => {
    if (clipboard.length === 0 || !contextMenuPos) return;
    const minLayerIdx = Math.min(...clipboard.map((c) => c.layerIndex));
    const minStart = Math.min(...clipboard.map((c) => c.startBeats));
    const offsetBeats = snapBeatValueStart(contextMenuPos.xBeats) - minStart;
    const objects = clipboard.map((entry) => ({
      ...entry,
      startBeats: entry.startBeats + offsetBeats,
      layerIndex: contextMenuPos.layerIndex + (entry.layerIndex - minLayerIdx),
    }));
    addScoreObjects(objects);
  }, [clipboard, contextMenuPos, snapBeatValueStart, addScoreObjects]);

  const handleAlignLeft = useCallback(() => {
    const entries = getSelectedEntries();
    if (entries.length < 2) return;
    const minStart = Math.min(...entries.map((e) => e.startBeats));
    const moves = entries.map((e) => ({
      objectId: e.objectId,
      targetStartBeats: minStart,
    }));
    moveScoreObjects(moves);
  }, [getSelectedEntries, moveScoreObjects]);

  const handleAlignCenter = useCallback(() => {
    const entries = getSelectedEntries();
    if (entries.length < 2) return;
    const centers = entries.map((e) => e.startBeats + e.durationBeats / 2);
    const mid = (Math.min(...centers) + Math.max(...centers)) / 2;
    const moves = entries.map((e) => ({
      objectId: e.objectId,
      targetStartBeats: Math.max(0, mid - e.durationBeats / 2),
    }));
    moveScoreObjects(moves);
  }, [getSelectedEntries, moveScoreObjects]);

  const handleAlignRight = useCallback(() => {
    const entries = getSelectedEntries();
    if (entries.length < 2) return;
    const maxEnd = Math.max(...entries.map((e) => e.startBeats + e.durationBeats));
    const moves = entries.map((e) => ({
      objectId: e.objectId,
      targetStartBeats: Math.max(0, maxEnd - e.durationBeats),
    }));
    moveScoreObjects(moves);
  }, [getSelectedEntries, moveScoreObjects]);

  const handleFollowTheLeader = useCallback(() => {
    const entries = getSelectedEntries();
    if (entries.length < 2) return;
    const sorted = [...entries].sort((a, b) => a.startBeats - b.startBeats);
    let cursor = sorted[0].startBeats;
    const moves = sorted.map((e) => {
      const target = cursor;
      cursor += e.durationBeats;
      return { objectId: e.objectId, targetStartBeats: target };
    });
    moveScoreObjects(moves);
  }, [getSelectedEntries, moveScoreObjects]);

  const handleReverse = useCallback(() => {
    const entries = getSelectedEntries();
    if (entries.length < 2) return;
    const sorted = [...entries].sort((a, b) => a.startBeats - b.startBeats);
    const reversed = [...sorted].reverse();
    const moves = sorted.map((orig, i) => {
      const rev = reversed[i];
      return { objectId: orig.objectId, targetStartBeats: rev.startBeats };
    });
    moveScoreObjects(moves);
  }, [getSelectedEntries, moveScoreObjects]);

  const handleSelectAll = useCallback(() => {
    setSelection(collectAllItemIds(group));
  }, [group, setSelection]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      }
      if (mod && e.key === 'x') {
        e.preventDefault();
        handleCut();
      }
      if (mod && e.key === 'v') {
        e.preventDefault();
        handleContextMenuPaste();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectIds.size > 0) {
        e.preventDefault();
        handleRemove();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCopy, handleCut, handleRemove, handleContextMenuPaste, selectedObjectIds]);

  const marqueeStyle = marquee ? {
    left: Math.min(marquee.startX, marquee.endX),
    top: Math.min(marquee.startY, marquee.endY),
    width: Math.abs(marquee.endX - marquee.startX),
    height: Math.abs(marquee.endY - marquee.startY),
  } : null;

  const menuItemClass = 'px-3 py-1 text-[12px] text-blue-text outline-none cursor-pointer rounded-sm data-[highlighted]:bg-[rgba(86,119,182,0.46)]';
  const subMenuClass = 'min-w-[160px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50';
  const menuClass = 'min-w-[220px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50';
  const sepClass = 'h-px bg-blue-border/30 my-1';

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          ref={containerRef}
          data-group-id={group.groupId}
          className="relative select-none"
          title={tooltip ?? undefined}
          style={{ cursor: cursorOverride ?? 'default' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onContextMenu={(e) => {
            const { x, y } = toLocalXY(e.clientX, e.clientY);
            const xBeats = x / pixelsPerBeat;
            const hit = findLayerAtY(group.layers, y);
            const item = hit ? findItemOnLayer(hit.layer, xBeats) : null;
            setContextMenuPos(hit ? { xBeats, layerIndex: hit.index } : null);
            setContextMenuOnObject(!!item);
          }}
        >
          {group.layers.map((layer: ScoreLayerSnapshot) => (
            <div
              key={layer.layerId}
              className="relative"
              style={{
                height: layer.height || DEFAULT_ROW_HEIGHT,
                backgroundColor: '#000000',
                borderBottom: '1px solid rgba(64,64,64,0.6)',
              }}
            >
              <SnapLinesLayer
                snapEnabled={snapEnabled}
                snapBeats={snapBeats}
                pixelsPerBeat={pixelsPerBeat}
                height={layer.height || DEFAULT_ROW_HEIGHT}
              />
              {layer.items.map((item: ScoreRowObjectSnapshot) => {
                const left = item.startBeats * pixelsPerBeat;
                const width = Math.max(item.durationBeats * pixelsPerBeat, 4);
                const isSelected = selectedObjectIds.has(item.objectId);
                const rgb = argbToRGB(item.backgroundColor);

                let barBg: string;
                let borderLight: string;
                let borderDark: string;
                let fg: string;
                let headerBg: string | null = null;

                if (isSelected) {
                  const brighter = brighten(rgb, 1.4);
                  barBg = rgbToCSS(brighter);
                  borderLight = '#ffffff';
                  borderDark = '#ffffff';
                  fg = '#ffffff';
                  headerBg = rgbToCSS(darken(rgb, 0.4));
                } else {
                  barBg = `linear-gradient(180deg, ${rgbToCSS(brighten(rgb, 1.2))} 0%, ${colorToCSS(item.backgroundColor)} 6px)`;
                  borderLight = rgbToCSS(brighten(rgb, 1.5));
                  borderDark = rgbToCSS(darken(rgb, 0.5));
                  fg = textColorForBackground(item.backgroundColor);
                }

                const barHeight = (layer.height || DEFAULT_ROW_HEIGHT);
                const showText = barHeight >= 20;

                return (
                  <div
                    key={item.objectId}
                    className="absolute overflow-hidden"
                    style={{
                      left,
                      width,
                      top: 1,
                      height: barHeight - 2,
                      background: barBg,
                      borderTop: `1px solid ${borderLight}`,
                      borderLeft: `1px solid ${borderLight}`,
                      borderBottom: `1px solid ${borderDark}`,
                      borderRight: `1px solid ${borderDark}`,
                      zIndex: isSelected ? 2 : 1,
                      pointerEvents: 'none',
                    }}
                  >
                    {headerBg && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 1,
                          left: 0,
                          right: 0,
                          height: 16,
                          backgroundColor: headerBg,
                        }}
                      />
                    )}
                    {showText && (
                      <span
                        className="absolute truncate font-bold"
                        style={{
                          left: 5,
                          top: 1,
                          right: 2,
                          height: 16,
                          lineHeight: '16px',
                          fontSize: 11,
                          color: fg,
                        }}
                      >
                        {item.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {marqueeStyle && (
            <div
              className="absolute pointer-events-none"
              style={{
                ...marqueeStyle,
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                zIndex: 10,
              }}
            />
          )}
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className={menuClass}>
          {contextMenuOnObject && selectedObjectIds.size > 0 ? (
            <ObjectContextMenu
              menuItemClass={menuItemClass}
              subMenuClass={subMenuClass}
              sepClass={sepClass}
              onAlignLeft={handleAlignLeft}
              onAlignCenter={handleAlignCenter}
              onAlignRight={handleAlignRight}
              onCopy={handleCopy}
              onCut={handleCut}
              onRemove={handleRemove}
              onFollowTheLeader={handleFollowTheLeader}
              onReverse={handleReverse}
              onSetColor={() => setScoreObjectColor(selectedObjectIds, 0x336699)}
            />
          ) : (
            <EmptyAreaContextMenu
              menuItemClass={menuItemClass}
              sepClass={sepClass}
              clipboard={clipboard}
              contextMenuPos={contextMenuPos}
              group={group}
              onPaste={handleContextMenuPaste}
              snapBeatValue={snapBeatValueStart}
              addScoreObjects={addScoreObjects}
            />
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

function ObjectContextMenu({ menuItemClass, subMenuClass, sepClass, onAlignLeft, onAlignCenter, onAlignRight, onCopy, onCut, onRemove, onFollowTheLeader, onReverse, onSetColor }: {
  menuItemClass: string;
  subMenuClass: string;
  sepClass: string;
  onAlignLeft: () => void;
  onAlignCenter: () => void;
  onAlignRight: () => void;
  onCopy: () => void;
  onCut: () => void;
  onRemove: () => void;
  onFollowTheLeader: () => void;
  onReverse: () => void;
  onSetColor: () => void;
}) {
  const ni = () => alert('Not yet implemented');
  return (
    <>
      <ContextMenu.Item className={menuItemClass} onSelect={ni}>
        Add to Project SoundObject Library
      </ContextMenu.Item>
      <ContextMenu.Separator className={sepClass} />
      <ContextMenu.Item className={menuItemClass} onSelect={ni}>
        Freeze/Unfreeze ScoreObjects
      </ContextMenu.Item>
      <ContextMenu.Separator className={sepClass} />
      <ContextMenu.Item className={menuItemClass} onSelect={ni}>
        Convert to PolyObject
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItemClass} onSelect={ni}>
        Convert to ObjectBuilder
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItemClass} onSelect={ni}>
        Replace with SoundObject in Buffer
      </ContextMenu.Item>
      <ContextMenu.Separator className={sepClass} />
      <ContextMenu.Item className={menuItemClass} onSelect={onFollowTheLeader}>
        Follow the Leader
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItemClass} onSelect={onReverse}>
        Reverse
      </ContextMenu.Item>
      <ContextMenu.Sub>
        <ContextMenu.SubTrigger className={`flex items-center justify-between ${menuItemClass}`}>
          Align
          <span className="text-[10px] opacity-60 ml-2">▸</span>
        </ContextMenu.SubTrigger>
        <ContextMenu.Portal>
          <ContextMenu.SubContent className={subMenuClass}>
            <ContextMenu.Item className={menuItemClass} onSelect={onAlignLeft}>Align Left</ContextMenu.Item>
            <ContextMenu.Item className={menuItemClass} onSelect={onAlignCenter}>Align Center</ContextMenu.Item>
            <ContextMenu.Item className={menuItemClass} onSelect={onAlignRight}>Align Right</ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Portal>
      </ContextMenu.Sub>
      <ContextMenu.Item className={menuItemClass} onSelect={ni}>
        Shift…
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItemClass} onSelect={ni}>
        Set Subjective Time to Objective Time
      </ContextMenu.Item>
      <ContextMenu.Separator className={sepClass} />
      <ContextMenu.Item className={menuItemClass} onSelect={onCut}>
        Cut<span className="float-right text-blue-muted text-[10px] ml-4">⌘X</span>
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItemClass} onSelect={onCopy}>
        Copy<span className="float-right text-blue-muted text-[10px] ml-4">⌘C</span>
      </ContextMenu.Item>
      <ContextMenu.Separator className={sepClass} />
      <ContextMenu.Item className={menuItemClass} onSelect={onRemove}>
        Remove<span className="float-right text-blue-muted text-[10px] ml-4">Del</span>
      </ContextMenu.Item>
      <ContextMenu.Separator className={sepClass} />
      <ContextMenu.Item className={menuItemClass} onSelect={onSetColor}>
        Set Color…
      </ContextMenu.Item>
      <ContextMenu.Separator className={sepClass} />
      <ContextMenu.Item className={menuItemClass} onSelect={ni}>
        Export…
      </ContextMenu.Item>
    </>
  );
}

function EmptyAreaContextMenu({ menuItemClass, sepClass, clipboard, contextMenuPos, group, onPaste, snapBeatValue, addScoreObjects }: {
  menuItemClass: string;
  sepClass: string;
  clipboard: ScoreObjectClipboardEntry[];
  contextMenuPos: { xBeats: number; layerIndex: number } | null;
  group: PolyObjectLayerGroupSnapshot;
  onPaste: () => void;
  snapBeatValue: (b: number) => number;
  addScoreObjects: (objects: Array<{ layerIndex: number; groupId: string; name: string; startBeats: number; durationBeats: number; backgroundColor: number; objectType: string; isContainer: boolean }>) => void;
}) {
  const ni = () => alert('Not yet implemented');

  const handleAddSobj = (typeName: string) => {
    if (contextMenuPos == null) return;
    const isContainer = typeName === 'PolyObject';
    addScoreObjects([{
      layerIndex: contextMenuPos.layerIndex,
      groupId: group.groupId,
      name: typeName,
      startBeats: snapBeatValue(contextMenuPos.xBeats),
      durationBeats: DEFAULT_SOBJ_DURATION,
      backgroundColor: DEFAULT_SOBJ_BG,
      objectType: typeName,
      isContainer,
    }]);
  };

  const addSobjTypes = [
    { name: 'AudioFile', pos: 10 },
    { name: 'Comment', pos: 20 },
    { name: 'External', pos: 30 },
    { name: 'GenericScore', pos: 40 },
    { name: 'JMask', pos: 50 },
    { name: 'LineObject', pos: 60 },
    { name: 'ObjectBuilder', pos: 70 },
    { name: 'PatternObject', pos: 80 },
    { name: 'PianoRoll', pos: 90 },
    { name: 'PolyObject', pos: 100 },
    { name: 'PythonObject', pos: 110 },
    { name: 'JavaScriptObject', pos: 120 },
    { name: 'Sound', pos: 130 },
    { name: 'TrackerObject', pos: 140 },
    { name: 'ZakLineObject', pos: 150 },
  ];

  return (
    <>
      <ContextMenu.Sub>
        <ContextMenu.SubTrigger className={`flex items-center justify-between ${menuItemClass}`}>
          Add SoundObject
          <span className="text-[10px] opacity-60 ml-2">▸</span>
        </ContextMenu.SubTrigger>
        <ContextMenu.Portal>
          <ContextMenu.SubContent className="min-w-[160px] bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50">
            {addSobjTypes.map((t) => (
              <ContextMenu.Item
                key={t.name}
                className={menuItemClass}
                onSelect={() => handleAddSobj(t.name)}
              >
                {t.name}
              </ContextMenu.Item>
            ))}
          </ContextMenu.SubContent>
        </ContextMenu.Portal>
      </ContextMenu.Sub>
      <ContextMenu.Separator className={sepClass} />
      {clipboard.length > 0 && (
        <>
          <ContextMenu.Item className={menuItemClass} onSelect={onPaste}>
            Paste<span className="float-right text-blue-muted text-[10px] ml-4">⌘V</span>
          </ContextMenu.Item>
          <ContextMenu.Item className={menuItemClass} onSelect={() => ni()}>
            Paste as PolyObject
          </ContextMenu.Item>
          <ContextMenu.Item className={menuItemClass} onSelect={() => ni()}>
            Paste BSB as Sound
          </ContextMenu.Item>
          <ContextMenu.Separator className={sepClass} />
        </>
      )}
      <ContextMenu.Item className={menuItemClass} onSelect={() => ni()}>
        Select Layer
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItemClass} onSelect={() => ni()}>
        Select All Before
      </ContextMenu.Item>
      <ContextMenu.Item className={menuItemClass} onSelect={() => ni()}>
        Select All After
      </ContextMenu.Item>
      <ContextMenu.Separator className={sepClass} />
      <ContextMenu.Item className={menuItemClass} onSelect={() => ni()}>
        Import…
      </ContextMenu.Item>
    </>
  );
}

function SnapLinesLayer({ snapEnabled, snapBeats, pixelsPerBeat, height }: {
  snapEnabled: boolean;
  snapBeats: number;
  pixelsPerBeat: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const width = parent.scrollWidth || 2000;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (!snapEnabled || snapBeats <= 0) return;

    ctx.strokeStyle = 'rgba(64, 64, 64, 1)';
    ctx.lineWidth = 1;

    const maxBeat = width / pixelsPerBeat;
    for (let beat = 0; beat <= maxBeat; beat += snapBeats) {
      const x = Math.round(beat * pixelsPerBeat) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }, [snapEnabled, snapBeats, pixelsPerBeat, height]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: '100%', height }}
    />
  );
}
