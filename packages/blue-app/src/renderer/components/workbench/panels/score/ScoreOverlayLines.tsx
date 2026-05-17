import { useRef, useState, useEffect } from 'react';

interface Props {
  renderStartTime: number;
  renderEndTime: number;
  timePointerBeats: number | null;
  pixelsPerBeat: number;
  children: React.ReactNode;
}

export default function ScoreOverlayLines({
  renderStartTime,
  renderEndTime,
  timePointerBeats,
  pixelsPerBeat,
  children,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlayHeight, setOverlayHeight] = useState<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    if (typeof ResizeObserver === 'undefined') {
      setOverlayHeight(Math.max(parent.clientHeight, el.scrollHeight));
      return;
    }

    const observer = new ResizeObserver(() => {
      setOverlayHeight(Math.max(parent.clientHeight, el.scrollHeight));
    });
    observer.observe(parent);
    observer.observe(el);
    setOverlayHeight(Math.max(parent.clientHeight, el.scrollHeight));

    return () => observer.disconnect();
  }, []);

  const hasRenderEnd = renderEndTime > 0 && renderEndTime > renderStartTime;
  const startPixel = renderStartTime >= 0 ? renderStartTime * pixelsPerBeat : -1;
  const endPixel = hasRenderEnd ? renderEndTime * pixelsPerBeat : -1;
  const pointerPixel = timePointerBeats != null && timePointerBeats >= 0 ? timePointerBeats * pixelsPerBeat : -1;

  return (
    <div ref={containerRef} className="relative">
      {children}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none z-10"
        style={{ height: overlayHeight || undefined }}
      >
        {startPixel >= 0 && hasRenderEnd && (
          <div
            className="absolute top-0 bottom-0 bg-green-500/5"
            style={{ left: startPixel, width: endPixel - startPixel }}
          />
        )}
        {startPixel >= 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-green-400/60"
            style={{ left: startPixel }}
          />
        )}
        {hasRenderEnd && endPixel >= 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400/60"
            style={{ left: endPixel }}
          />
        )}
        {pointerPixel >= 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-orange-500"
            style={{ left: pointerPixel }}
          />
        )}
      </div>
    </div>
  );
}
