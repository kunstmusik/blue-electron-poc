import { useEffect, useRef } from 'react';
import { snapValueToBeats } from '@blue/data';
import type { SnapValueName } from '@blue/data';
import type { MeterMapSnapshot } from '../../../../../shared/project-editor';
import { deriveSnapLineBeats } from './snap-grid-utils';

interface Props {
  snapEnabled: boolean;
  snapValue: SnapValueName;
  meterMap?: MeterMapSnapshot;
  tempo: number;
  smpteFrameRate: number;
  pixelsPerBeat: number;
  totalBeats: number;
  height: number;
}

export default function SnapGridOverlay({
  snapEnabled,
  snapValue,
  meterMap,
  tempo,
  smpteFrameRate,
  pixelsPerBeat,
  totalBeats,
  height,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = totalBeats * pixelsPerBeat;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (!snapEnabled) return;

    const snapBeats = snapValueToBeats(snapValue, tempo, smpteFrameRate, 44100, pixelsPerBeat);
    if (snapBeats <= 0) return;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;

    const maxBeat = totalBeats;
    for (const beat of deriveSnapLineBeats(snapValue, snapBeats, meterMap, maxBeat)) {
      const x = Math.round(beat * pixelsPerBeat) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }, [snapEnabled, snapValue, meterMap, tempo, smpteFrameRate, pixelsPerBeat, totalBeats, height]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      style={{ width: totalBeats * pixelsPerBeat, height }}
    />
  );
}
