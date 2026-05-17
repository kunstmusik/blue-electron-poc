import { useRef, useCallback, useState, useEffect, type RefObject } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import type { MarkerSnapshot } from '../../../../../shared/project-editor';
import { useProjectStore } from '../../../../stores/project-store';
import type { SnapValueName } from '@blue/data';
import { snapValueToBeats } from '@blue/data';

const AUTO_SCROLL_EDGE_THRESHOLD = 24;
const AUTO_SCROLL_MAX_STEP = 32;

interface Props {
  markers: MarkerSnapshot[];
  totalBeats: number;
  pixelsPerBeat: number;
  rowVisible: boolean;
  snapEnabled: boolean;
  snapValue: SnapValueName;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  rootTimelineOnly: boolean;
  tempo: number;
  smpteFrameRate: number;
  sampleRate: number;
}

type DragState =
  | {
      type: 'marker';
      sourceIndex: number;
      startMouseBeats: number;
      startMarkerBeats: number;
    }
  | { type: 'render-start' }
  | null;

export default function MarkersBar({ markers, totalBeats, pixelsPerBeat, rowVisible, snapEnabled, snapValue, scrollContainerRef, rootTimelineOnly, tempo, smpteFrameRate, sampleRate }: Props) {
  const applyPatch = useProjectStore((s) => s.applyProjectDocumentPatch);
  const rowRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState>(null);
  const [draggingSourceIndex, setDraggingSourceIndex] = useState<number | null>(null);

  const snapBeats = useCallback((beats: number, shiftHeld: boolean) => {
    if (!snapEnabled || shiftHeld) return beats;
    const sv = snapValueToBeats(
      snapValue,
      tempo,
      smpteFrameRate,
      sampleRate,
      pixelsPerBeat,
    );
    if (sv <= 0) return beats;
    return Math.round(beats / sv) * sv;
  }, [snapEnabled, snapValue, tempo, smpteFrameRate, sampleRate, pixelsPerBeat]);

  const xToBeats = useCallback((clientX: number) => {
    const element = rowRef.current;
    if (!element) return 0;

    const rect = element.getBoundingClientRect();
    const x = Math.max(0, clientX - rect.left);
    return x / pixelsPerBeat;
  }, [pixelsPerBeat]);

  const autoScroll = useCallback((clientX: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let delta = 0;

    if (clientX < rect.left + AUTO_SCROLL_EDGE_THRESHOLD) {
      delta = clientX - (rect.left + AUTO_SCROLL_EDGE_THRESHOLD);
    } else if (clientX > rect.right - AUTO_SCROLL_EDGE_THRESHOLD) {
      delta = clientX - (rect.right - AUTO_SCROLL_EDGE_THRESHOLD);
    }

    if (delta === 0) return;

    const step = Math.sign(delta) * Math.min(
      AUTO_SCROLL_MAX_STEP,
      Math.max(6, Math.abs(delta) * 0.35),
    );

    const nextScrollLeft = Math.max(0, container.scrollLeft + step);
    if (nextScrollLeft !== container.scrollLeft) {
      container.scrollLeft = nextScrollLeft;
    }
  }, [scrollContainerRef]);

  const clearDrag = useCallback(() => {
    dragStateRef.current = null;
    setDraggingSourceIndex(null);
  }, []);

  const applyDragUpdate = useCallback((clientX: number, shiftHeld: boolean) => {
    const dragState = dragStateRef.current;
    if (!dragState || !rootTimelineOnly) return;

    autoScroll(clientX);

    if (dragState.type === 'marker') {
      const currentMouseBeats = xToBeats(clientX);
      const draggedBeats = dragState.startMarkerBeats + (currentMouseBeats - dragState.startMouseBeats);
      const beats = Math.max(0, snapBeats(draggedBeats, shiftHeld));
      applyPatch({
        score: { type: 'updateMarker', sourceIndex: dragState.sourceIndex, patch: { timeBeats: beats } },
      });
      return;
    }

    const beats = Math.max(0, snapBeats(xToBeats(clientX), shiftHeld));

    applyPatch({
      transport: { renderStartTime: beats, renderEndTime: -1 },
    });
  }, [rootTimelineOnly, autoScroll, snapBeats, xToBeats, applyPatch]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (dragStateRef.current) {
        applyDragUpdate(event.clientX, event.shiftKey);
      }
    };

    const onMouseUp = () => {
      if (dragStateRef.current) {
        clearDrag();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [applyDragUpdate, clearDrag]);

  const startMarkerDrag = useCallback((sourceIndex: number, clientX: number, startMarkerBeats: number) => {
    if (!rootTimelineOnly) return;
    dragStateRef.current = {
      type: 'marker',
      sourceIndex,
      startMouseBeats: xToBeats(clientX),
      startMarkerBeats,
    };
    setDraggingSourceIndex(sourceIndex);
  }, [rootTimelineOnly, xToBeats]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!rootTimelineOnly || e.button !== 0) return;

    e.preventDefault();

    if (e.shiftKey) {
      const beats = Math.max(0, snapBeats(xToBeats(e.clientX), false));
      const sourceIndex = markers.length;
      applyPatch({
        score: { type: 'addMarker', timeBeats: beats },
      });
      dragStateRef.current = {
        type: 'marker',
        sourceIndex,
        startMouseBeats: beats,
        startMarkerBeats: beats,
      };
      setDraggingSourceIndex(sourceIndex);
    } else {
      const beats = Math.max(0, snapBeats(xToBeats(e.clientX), e.shiftKey));
      applyPatch({
        transport: { renderStartTime: beats, renderEndTime: -1 },
      });
      dragStateRef.current = { type: 'render-start' };
    }
  }, [rootTimelineOnly, snapBeats, xToBeats, markers.length, applyPatch]);

  if (!rowVisible) return null;

  return (
    <div
      ref={rowRef}
      className="relative h-5 border-b border-[#3a3a3a] bg-black overflow-visible cursor-crosshair select-none"
      style={{ minWidth: totalBeats * pixelsPerBeat }}
      onMouseDown={handleMouseDown}
    >
      {markers.map((marker) => (
        <MarkerWidget
          key={`${marker.sourceIndex}-${marker.name}`}
          marker={marker}
          sourceIndex={marker.sourceIndex}
          pixelsPerBeat={pixelsPerBeat}
          onStartDrag={startMarkerDrag}
          isDragging={draggingSourceIndex === marker.sourceIndex}
        />
      ))}
    </div>
  );
}

function MarkerWidget({ marker, sourceIndex, pixelsPerBeat, onStartDrag, isDragging }: {
  marker: MarkerSnapshot;
  sourceIndex: number;
  pixelsPerBeat: number;
  onStartDrag: (sourceIndex: number, clientX: number, startMarkerBeats: number) => void;
  isDragging: boolean;
}) {
  const applyPatch = useProjectStore((s) => s.applyProjectDocumentPatch);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(marker.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const left = marker.time * pixelsPerBeat;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    onStartDrag(sourceIndex, e.clientX, marker.time);
  }, [onStartDrag, sourceIndex, marker.time]);

  const beginRename = useCallback(() => {
    setRenameValue(marker.name);
    setRenaming(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [marker.name]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    beginRename();
  }, [beginRename]);

  const commitRename = useCallback(() => {
    setRenaming(false);
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== marker.name) {
      applyPatch({
        score: { type: 'updateMarker', sourceIndex, patch: { name: trimmed } },
      });
    }
  }, [renameValue, marker.name, sourceIndex, applyPatch]);

  const handleRemove = useCallback(() => {
    applyPatch({
      score: { type: 'removeMarker', sourceIndex },
    });
  }, [sourceIndex, applyPatch]);

  const ctxItemClass =
    "px-3 py-1 text-[12px] text-blue-text outline-none cursor-pointer rounded-sm data-[highlighted]:bg-[rgba(86,119,182,0.46)]";

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          className="absolute top-0 h-5 flex items-stretch overflow-visible"
          style={{ left, zIndex: isDragging ? 20 : 10 }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          <div
            className="inline-flex w-max max-w-none items-center h-5 border border-[rgba(253,190,11,1.0)] bg-[rgba(255,200,0,0.7)] pr-[3px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0 left-0 top-0 absolute">
              <polygon
                points="0,0 0,10 10,0"
                fill="#ffd68a"
                stroke="#fdbe0b"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
            {renaming ? (
              <input
                ref={inputRef}
                className="ml-1 h-4 rounded-sm border border-orange-500/60 bg-white/40 px-1 text-[12px] leading-none text-black outline-none"
                style={{ width: Math.max(72, renameValue.length * 8) }}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setRenaming(false);
                }}
                onBlur={commitRename}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="ml-1 text-[12px] leading-none text-black whitespace-nowrap select-none"
                title={`${marker.name} [${marker.time.toFixed(2)}]`}
              >
                {marker.name}
              </span>
            )}
          </div>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-40 bg-[#1e1e3a] border border-blue-border/50 rounded shadow-lg py-1 z-50">
          <ContextMenu.Item className={ctxItemClass} onSelect={handleRemove}>
            Remove
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
