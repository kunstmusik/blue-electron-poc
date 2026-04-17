import type { TempoMap } from '../time/tempo-map';
import type { AutomationPoint, Parameter } from './parameter';

/**
 * Convert a Blue automation point from project beat time into engine-local
 * elapsed seconds so blue-engine matches Java's realtime parameter updates.
 */
export function automationPointToEngineSeconds(
  pointTime: number,
  renderStartTime: number,
  tempoMap?: TempoMap | null,
): number {
  if (!tempoMap) {
    return pointTime - renderStartTime;
  }

  const renderStartSeconds = tempoMap.beatsToSeconds(renderStartTime);
  return tempoMap.beatsToSeconds(pointTime) - renderStartSeconds;
}

/**
 * Map a parameter's automation points into the time domain expected by
 * blue-engine: elapsed seconds from playback start.
 */
export function getEngineAutomationPoints(
  parameter: Parameter,
  renderStartTime: number,
  tempoMap?: TempoMap | null,
): AutomationPoint[] {
  return parameter.getPoints().map((point) => ({
    time: automationPointToEngineSeconds(point.time, renderStartTime, tempoMap),
    value: point.value,
  }));
}
