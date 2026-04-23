import type {
  PlaybackClockState,
  PlaybackDisplayState,
  PlaybackStatus,
} from '../../stores/playback-store';
import type {
  TempoMapSnapshot,
  ToolbarProjectTransportSnapshot,
} from '../../../shared/project-editor';

export type ToolbarDisplaySource = 'idle-anchor' | 'engine-authority' | 'interpolated';

export interface ToolbarPlayheadDisplayState {
  primaryText: string;
  secondaryText: string;
  displayBeat: number;
  displaySeconds: number;
  source: ToolbarDisplaySource;
}

export interface ToolbarSelectionDisplayState {
  startText: string;
  endText: string;
  durationText: string;
  hasSelection: boolean;
}

export interface ToolbarPlaybackSnapshot {
  status: PlaybackStatus;
  clock: PlaybackClockState | null;
  display: PlaybackDisplayState;
}

interface TempoMapAdapter {
  beatsToSeconds: (beat: number) => number;
  secondsToBeats: (seconds: number) => number;
}

function normalizeTempoPoints(snapshot: TempoMapSnapshot) {
  return [...snapshot.points].sort((a, b) => a.beat - b.beat);
}

function createTempoMapAdapter(snapshot: TempoMapSnapshot): TempoMapAdapter {
  if (!snapshot.enabled) {
    return {
      beatsToSeconds: (beat) => beat,
      secondsToBeats: (seconds) => seconds,
    };
  }

  const points = normalizeTempoPoints(snapshot);
  if (points.length === 0) {
    return {
      beatsToSeconds: (beat) => beat,
      secondsToBeats: (seconds) => seconds,
    };
  }

  const cumulativeSeconds: number[] = [0];
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const current = points[i];
    const previousSeconds = cumulativeSeconds[i - 1];
    const deltaBeats = current.beat - prev.beat;

    if (deltaBeats <= 0) {
      cumulativeSeconds.push(previousSeconds);
      continue;
    }

    if (prev.curveType === 'constant') {
      cumulativeSeconds.push(previousSeconds + deltaBeats * (60 / prev.tempo));
      continue;
    }

    const factor1 = 60 / prev.tempo;
    const acceleration = (60 / current.tempo - factor1) / deltaBeats;
    cumulativeSeconds.push(previousSeconds + (factor1 * deltaBeats) + (0.5 * acceleration * deltaBeats * deltaBeats));
  }

  const beatsToSeconds = (beat: number): number => {
    let index = 0;
    for (let i = points.length - 1; i >= 0; i -= 1) {
      if (beat >= points[i].beat) {
        index = i;
        break;
      }
    }

    const current = points[index];
    const currentSeconds = cumulativeSeconds[index];

    if (index >= points.length - 1) {
      const deltaBeats = beat - current.beat;
      return currentSeconds + deltaBeats * (60 / current.tempo);
    }

    const next = points[index + 1];
    const deltaBeats = beat - current.beat;

    if (current.curveType === 'constant') {
      return currentSeconds + deltaBeats * (60 / current.tempo);
    }

    const t0 = current.tempo;
    const t1 = next.tempo;
    const segmentBeats = next.beat - current.beat;

    if (t0 === t1 || segmentBeats <= 0) {
      return currentSeconds + deltaBeats * (60 / t0);
    }

    const factor1 = 60 / t0;
    const acceleration = (60 / t1 - factor1) / segmentBeats;
    return currentSeconds + (factor1 * deltaBeats) + (0.5 * acceleration * deltaBeats * deltaBeats);
  };

  const secondsToBeats = (seconds: number): number => {
    let index = 0;
    for (let i = points.length - 1; i >= 0; i -= 1) {
      if (seconds >= cumulativeSeconds[i]) {
        index = i;
        break;
      }
    }

    const current = points[index];
    const currentSeconds = cumulativeSeconds[index];
    const elapsed = seconds - currentSeconds;

    if (index >= points.length - 1) {
      return current.beat + elapsed * (current.tempo / 60);
    }

    const next = points[index + 1];

    if (current.curveType === 'constant') {
      return current.beat + elapsed * (current.tempo / 60);
    }

    const t0 = current.tempo;
    const t1 = next.tempo;
    const segmentBeats = next.beat - current.beat;

    if (t0 === t1 || segmentBeats <= 0) {
      return current.beat + elapsed * (t0 / 60);
    }

    const factor1 = 60 / t0;
    const acceleration = (60 / t1 - factor1) / segmentBeats;
    const discriminant = factor1 * factor1 + 2 * acceleration * elapsed;

    if (acceleration === 0) {
      return current.beat + elapsed / factor1;
    }

    return current.beat + (Math.sqrt(Math.max(0, discriminant)) - factor1) / acceleration;
  };

  return { beatsToSeconds, secondsToBeats };
}

function clampDisplayValue(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }

  return value;
}

export function formatBeatText(beat: number): string {
  return clampDisplayValue(beat).toFixed(2);
}

export function formatClockText(seconds: number): string {
  const safeSeconds = Math.max(0, clampDisplayValue(seconds));
  const totalMilliseconds = Math.round(safeSeconds * 1000);
  const minutes = Math.floor(totalMilliseconds / 60000);
  const remainingMilliseconds = totalMilliseconds % 60000;
  const secs = Math.floor(remainingMilliseconds / 1000);
  const millis = remainingMilliseconds % 1000;

  return `${minutes}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export function buildPlayheadDisplayState(
  transport: ToolbarProjectTransportSnapshot,
  playback: ToolbarPlaybackSnapshot,
): ToolbarPlayheadDisplayState {
  const tempoMap = createTempoMapAdapter(transport.tempoMap);
  const anchorBeat = transport.renderStartTime;
  const anchorSeconds = tempoMap.beatsToSeconds(anchorBeat);
  const hasLiveClock =
    (playback.status === 'playing' || playback.status === 'stopping') &&
    playback.clock !== null;

  if (!hasLiveClock) {
    return {
      primaryText: formatBeatText(anchorBeat),
      secondaryText: formatClockText(anchorSeconds),
      displayBeat: anchorBeat,
      displaySeconds: anchorSeconds,
      source: 'idle-anchor',
    };
  }

  const displaySeconds = anchorSeconds + playback.display.elapsedSeconds;
  const displayBeat = tempoMap.secondsToBeats(displaySeconds);

  return {
    primaryText: formatBeatText(displayBeat),
    secondaryText: formatClockText(displaySeconds),
    displayBeat,
    displaySeconds,
    source: playback.display.source,
  };
}

export function buildSelectionDisplayState(
  transport: ToolbarProjectTransportSnapshot,
): ToolbarSelectionDisplayState {
  if (transport.renderEndTime < 0 || transport.renderEndTime < transport.renderStartTime) {
    return {
      startText: '—',
      endText: '—',
      durationText: '—',
      hasSelection: false,
    };
  }

  const tempoMap = createTempoMapAdapter(transport.tempoMap);
  const startSeconds = tempoMap.beatsToSeconds(transport.renderStartTime);
  const endSeconds = tempoMap.beatsToSeconds(transport.renderEndTime);
  const durationSeconds = Math.max(0, endSeconds - startSeconds);
  const durationBeats = Math.max(0, transport.renderEndTime - transport.renderStartTime);

  return {
    startText: `${formatBeatText(transport.renderStartTime)} / ${formatClockText(startSeconds)}`,
    endText: `${formatBeatText(transport.renderEndTime)} / ${formatClockText(endSeconds)}`,
    durationText: `${formatBeatText(durationBeats)} / ${formatClockText(durationSeconds)}`,
    hasSelection: true,
  };
}
