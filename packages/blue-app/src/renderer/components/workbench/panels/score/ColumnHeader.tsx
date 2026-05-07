import type { ScoreTimeStateSnapshot, MarkerSnapshot, MeterSnapshot, TempoMapSnapshot } from '../../../../../shared/project-editor';
import { TimeBase } from '@blue/data';
import MeterRegionBar from './MeterRegionBar';
import MarkersBar from './MarkersBar';

interface Props {
  timeState: ScoreTimeStateSnapshot;
  markers: MarkerSnapshot[];
  meters: MeterSnapshot[];
  tempoMap: TempoMapSnapshot;
  totalBeats: number;
  pixelsPerBeat: number;
}

export default function ColumnHeader({ timeState, markers, meters, tempoMap, totalBeats, pixelsPerBeat }: Props) {
  const contentWidth = totalBeats * pixelsPerBeat;
  const tempo = tempoMap.points.length > 0 ? tempoMap.points[0].tempo : 60;
  const smpteFrameRate = timeState.smpteFrameRate || 24;

  return (
    <div className="sticky top-0 z-10 bg-[#1a1a2e] border-b border-blue-border/40 overflow-hidden" style={{ minWidth: contentWidth }}>
      {timeState.tempoRowVisible && (
        <div className={`h-5 border-b border-blue-border/20 flex items-center px-2 text-[9px] overflow-hidden ${tempoMap.enabled ? 'text-green-400' : 'text-blue-muted'}`} style={{ minWidth: contentWidth }}>
          {tempoMap.points.length === 1
            ? `${tempoMap.points[0].tempo} BPM`
            : `${tempoMap.points[0].tempo} → ${tempoMap.points[tempoMap.points.length - 1].tempo} BPM (${tempoMap.points.length} pts)`}
        </div>
      )}

      <MeterRegionBar meters={meters} totalBeats={totalBeats} pixelsPerBeat={pixelsPerBeat} rowVisible={timeState.meterRowVisible} />
      <MarkersBar markers={markers} totalBeats={totalBeats} pixelsPerBeat={pixelsPerBeat} rowVisible={timeState.markersRowVisible} />

      <TimeBar
        timeDisplay={timeState.primaryTimeDisplay}
        totalBeats={totalBeats}
        pixelsPerBeat={pixelsPerBeat}
        tempo={tempo}
        meters={meters}
        smpteFrameRate={smpteFrameRate}
      />

      {timeState.secondaryRulerEnabled && (
        <TimeBar
          timeDisplay={timeState.secondaryTimeDisplay}
          totalBeats={totalBeats}
          pixelsPerBeat={pixelsPerBeat}
          tempo={tempo}
          meters={meters}
          smpteFrameRate={smpteFrameRate}
          secondary
        />
      )}
    </div>
  );
}

interface Mark { x: number; label?: string; type: 'major' | 'minor' }

function TimeBar({ timeDisplay, totalBeats, pixelsPerBeat, tempo, meters, smpteFrameRate, secondary }: {
  timeDisplay: string;
  totalBeats: number;
  pixelsPerBeat: number;
  tempo: number;
  meters: MeterSnapshot[];
  smpteFrameRate: number;
  secondary?: boolean;
}) {
  const marks = computeMarks(timeDisplay, totalBeats, pixelsPerBeat, tempo, meters, smpteFrameRate);
  const ROW_HEIGHT = 20;

  return (
    <div
      className={`relative overflow-hidden border-b border-blue-border/20 ${secondary ? 'bg-[#16162a]' : 'bg-[#1a1a2e]'}`}
      style={{ height: ROW_HEIGHT, minWidth: totalBeats * pixelsPerBeat }}
    >
      {marks.map((mark, i) => (
        <div
          key={i}
          className="absolute left-0 right-0"
          style={{
            position: 'absolute',
            left: mark.x,
            top: mark.type === 'major' ? 0 : ROW_HEIGHT * 0.5,
            height: mark.type === 'major' ? ROW_HEIGHT : ROW_HEIGHT * 0.5,
            borderLeft: `1px solid ${mark.type === 'major' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {mark.type === 'major' && mark.label && (
            <span className="absolute top-px left-1 text-[10px] text-blue-muted whitespace-nowrap select-none">
              {mark.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function computeMarks(
  timeDisplay: string,
  totalBeats: number,
  pixelsPerBeat: number,
  tempo: number,
  meters: MeterSnapshot[],
  smpteFrameRate: number,
): Mark[] {
  switch (timeDisplay) {
    case TimeBase.TIME:
    case TimeBase.SECONDS:
      return computeTimeMarks(totalBeats, pixelsPerBeat, tempo, timeDisplay);
    case TimeBase.SMPTE:
      return computeSmpteMarks(totalBeats, pixelsPerBeat, tempo, smpteFrameRate);
    case TimeBase.FRAME:
      return computeSamplesMarks(totalBeats, pixelsPerBeat, tempo);
    case TimeBase.BBT:
    case TimeBase.BBST:
    case TimeBase.BBF:
      return computeMeasureMarks(totalBeats, pixelsPerBeat, meters);
    default:
      return computeBeatsMarks(totalBeats, pixelsPerBeat);
  }
}

function beatsToSeconds(beats: number, tempo: number): number {
  return beats * 60.0 / tempo;
}

function secondsToBeats(seconds: number, tempo: number): number {
  return seconds * tempo / 60.0;
}

function niceNum(x: number, round: boolean): number {
  if (x === 0) return 0;
  const exp = Math.floor(Math.log10(Math.abs(x)));
  const f = x / Math.pow(10, exp);
  let nf: number;
  if (round) {
    nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  } else {
    nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  }
  return nf * Math.pow(10, exp);
}

function computeBeatsMarks(totalBeats: number, pixelsPerBeat: number): Mark[] {
  const majorBeatUnit = calcMajorBeatUnit(pixelsPerBeat);
  const minorBeatUnit = majorBeatUnit / 2;
  const marks: Mark[] = [];

  for (let beat = 0; beat <= totalBeats; beat += minorBeatUnit) {
    const isMajor = Math.abs(beat / majorBeatUnit - Math.round(beat / majorBeatUnit)) < 0.001;
    marks.push({
      x: beat * pixelsPerBeat,
      label: isMajor ? formatBeat(beat) : undefined,
      type: isMajor ? 'major' : 'minor',
    });
  }
  return marks;
}

function calcMajorBeatUnit(pixelTime: number): number {
  const minMajorWidth = 100;
  const v = Math.log(pixelTime / minMajorWidth) / Math.log(2);
  return 1.0 / Math.pow(2, Math.floor(v));
}

function formatBeat(beats: number): string {
  if (beats === Math.floor(beats)) return String(Math.round(beats));
  return beats.toFixed(1);
}

function computeTimeMarks(totalBeats: number, pixelsPerBeat: number, tempo: number, format: string): Mark[] {
  const approxWidth = totalBeats * pixelsPerBeat;
  const startBeat = 0;
  const endBeat = totalBeats;
  const startSeconds = beatsToSeconds(startBeat, tempo);
  const endSeconds = beatsToSeconds(endBeat, tempo);

  const nticks = Math.max(approxWidth / 80, 2);
  const range = niceNum(endSeconds - startSeconds, false);
  const d = niceNum(range / (nticks - 1), true);
  const minorD = d / 2;
  const graphMin = Math.floor(startSeconds / minorD) * minorD;
  const nfrac = Math.max(-Math.floor(Math.log10(d)), 0);

  const marks: Mark[] = [];
  const beatDuration = endBeat - startBeat;

  for (let seconds = graphMin; seconds < endSeconds + 0.5 * minorD; seconds += minorD) {
    if (seconds < 0) continue;
    const beatPos = secondsToBeats(seconds, tempo);
    const x = (beatDuration > 0) ? ((beatPos - startBeat) / beatDuration) * approxWidth : 0;
    if (x >= 0 && x <= approxWidth) {
      const isMajor = Math.abs(seconds / d - Math.round(seconds / d)) < 0.001;
      marks.push({
        x,
        label: isMajor
          ? (format === TimeBase.SECONDS
              ? formatSecondsWithPrecision(seconds, nfrac)
              : formatTimeWithPrecision(seconds, nfrac))
          : undefined,
        type: isMajor ? 'major' : 'minor',
      });
    }
  }
  return marks;
}

function formatTimeWithPrecision(seconds: number, nfrac: number): string {
  const totalSecs = Math.floor(seconds);
  const minutes = totalSecs / 60;
  const secs = totalSecs % 60;

  if (minutes >= 60) {
    const hours = minutes / 60;
    const remMinutes = minutes % 60;
    if (nfrac > 0) {
      const frac = Math.round((seconds - totalSecs) * Math.pow(10, nfrac));
      return `${hours}:${String(remMinutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(frac).padStart(nfrac, '0')}`;
    }
    return `${hours}:${String(remMinutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  if (nfrac > 0) {
    const frac = Math.round((seconds - totalSecs) * Math.pow(10, nfrac));
    return `${minutes}:${String(secs).padStart(2, '0')}.${String(frac).padStart(nfrac, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatSecondsWithPrecision(seconds: number, nfrac: number): string {
  const scale = Math.max(1, Math.min(nfrac, 6));
  const text = seconds.toFixed(scale);
  return text.includes('.') ? text : text + '.0';
}

function computeSmpteMarks(totalBeats: number, pixelsPerBeat: number, tempo: number, frameRate: number): Mark[] {
  const approxWidth = totalBeats * pixelsPerBeat;
  const startSeconds = 0;
  const endSeconds = beatsToSeconds(totalBeats, tempo);
  const frameDuration = 1.0 / frameRate;

  const pixelsPerSecond = (endSeconds > 0) ? approxWidth / endSeconds : 1;
  const minSecPerLabel = 80 / pixelsPerSecond;

  const increments = [
    frameDuration, 2 * frameDuration, 5 * frameDuration, 10 * frameDuration,
    0.5, 1, 2, 5, 10, 30, 60, 120, 300, 600,
  ];
  let increment = increments[increments.length - 1];
  for (const inc of increments) {
    if (minSecPerLabel <= inc) { increment = inc; break; }
  }
  const minorIncrement = increment / 2;

  const alignedStart = Math.floor(startSeconds / minorIncrement) * minorIncrement;
  const marks: Mark[] = [];
  const beatDuration = totalBeats;

  for (let sec = alignedStart; sec <= endSeconds + increment * 0.5; sec += minorIncrement) {
    if (sec < 0) continue;
    const beatPos = secondsToBeats(sec, tempo);
    const x = (beatDuration > 0) ? (beatPos / beatDuration) * approxWidth : 0;
    if (x >= 0 && x <= approxWidth) {
      const isMajor = Math.abs(sec / increment - Math.round(sec / increment)) < 0.001;
      marks.push({
        x,
        label: isMajor ? formatSmpteLabel(sec, frameRate) : undefined,
        type: isMajor ? 'major' : 'minor',
      });
    }
  }
  return marks;
}

function formatSmpteLabel(seconds: number, frameRate: number): string {
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  let frames = Math.floor((seconds - totalSecs) * frameRate);
  const maxFrames = Math.floor(frameRate) - 1;
  if (frames > maxFrames) frames = maxFrames;
  if (frames < 0) frames = 0;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}

function computeSamplesMarks(totalBeats: number, pixelsPerBeat: number, tempo: number): Mark[] {
  const sampleRate = 44100;
  const approxWidth = totalBeats * pixelsPerBeat;
  const startSeconds = 0;
  const endSeconds = beatsToSeconds(totalBeats, tempo);
  const startSample = startSeconds * sampleRate;
  const endSample = endSeconds * sampleRate;

  const nticks = Math.max(approxWidth / 80, 2);
  const range = niceNum(endSample - startSample, false);
  const d = niceNum(range / (nticks - 1), true);
  const minorD = d / 2;
  const graphMin = Math.floor(startSample / minorD) * minorD;
  const nfrac = Math.max(-Math.floor(Math.log10(d)), 0);

  const marks: Mark[] = [];
  const beatDuration = totalBeats;

  for (let sample = graphMin; sample < endSample + 0.5 * minorD; sample += minorD) {
    if (sample < 0) continue;
    const seconds = sample / sampleRate;
    const beatPos = secondsToBeats(seconds, tempo);
    const x = (beatDuration > 0) ? (beatPos / beatDuration) * approxWidth : 0;
    if (x >= 0 && x <= approxWidth) {
      const isMajor = Math.abs(sample / d - Math.round(sample / d)) < 0.001;
      marks.push({
        x,
        label: isMajor ? formatSampleCount(sample, nfrac) : undefined,
        type: isMajor ? 'major' : 'minor',
      });
    }
  }
  return marks;
}

function formatSampleCount(samples: number, nfrac: number): string {
  const abs = Math.abs(samples);
  if (abs >= 1_000_000) {
    const val = samples / 1_000_000;
    return val === Math.floor(val) ? `${Math.round(val)}M` : `${val.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const val = samples / 1_000;
    return val === Math.floor(val) ? `${Math.round(val)}k` : `${val.toFixed(1)}k`;
  }
  if (nfrac === 0 || samples === Math.floor(samples)) return String(Math.round(samples));
  return samples.toFixed(Math.min(nfrac, 3));
}

function computeMeasureMarks(totalBeats: number, pixelsPerBeat: number, meters: MeterSnapshot[]): Mark[] {
  const firstMeter = meters.length > 0 ? meters[0] : { measure: 1, numBeats: 4, beatLength: 4 };
  const beatsPerMeasure = firstMeter.numBeats * (4.0 / firstMeter.beatLength);
  const pixelsPerMeasure = beatsPerMeasure * pixelsPerBeat;

  const minLabelSpacing = 60;
  let measureGrouping = 1;
  let showBeats = false;

  if (pixelsPerMeasure < minLabelSpacing) {
    while (measureGrouping * pixelsPerMeasure < minLabelSpacing) {
      measureGrouping *= 2;
      if (measureGrouping > 256) break;
    }
  } else if (pixelsPerBeat >= minLabelSpacing) {
    showBeats = true;
  }

  const marks: Mark[] = [];
  let currentMeasure = 1;

  while (true) {
    const measureStartBeat = getMeasureStartBeat(meters, currentMeasure);
    if (measureStartBeat > totalBeats + beatsPerMeasure) break;

    const x = measureStartBeat * pixelsPerBeat;
    if (x >= -50 && x <= totalBeats * pixelsPerBeat + 50) {
      marks.push({ x, label: String(currentMeasure), type: 'major' });

      if (showBeats && measureGrouping === 1) {
        const meter = getMeterAtMeasure(meters, currentMeasure);
        const beatDur = 4.0 / meter.beatLength;
        for (let beat = 2; beat <= meter.numBeats; beat++) {
          const beatPos = measureStartBeat + (beat - 1) * beatDur;
          if (beatPos > totalBeats) break;
          const beatX = beatPos * pixelsPerBeat;
          marks.push({ x: beatX, label: `${currentMeasure}|${beat}`, type: 'minor' });
        }
      } else if (!showBeats && measureGrouping === 1) {
        const meter = getMeterAtMeasure(meters, currentMeasure);
        const beatDur = 4.0 / meter.beatLength;
        for (let beat = 2; beat <= meter.numBeats; beat++) {
          const beatPos = measureStartBeat + (beat - 1) * beatDur;
          if (beatPos > totalBeats) break;
          marks.push({ x: beatPos * pixelsPerBeat, type: 'minor' });
        }
      }
    }

    currentMeasure += measureGrouping;
  }

  return marks;
}

function getMeasureStartBeat(meters: MeterSnapshot[], measureNumber: number): number {
  if (measureNumber <= 1) return 0;

  const firstMeter = meters.length > 0 ? meters[0] : { measure: 1, numBeats: 4, beatLength: 4 };
  const beatsPerMeasure = firstMeter.numBeats * (4.0 / firstMeter.beatLength);
  return (measureNumber - 1) * beatsPerMeasure;
}

function getMeterAtMeasure(meters: MeterSnapshot[], _measureNumber: number): MeterSnapshot {
  return meters.length > 0 ? meters[0] : { measure: 1, numBeats: 4, beatLength: 4 };
}
