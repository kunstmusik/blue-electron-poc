/**
 * Test helpers for the Blue Time System unit tests.
 * Provides factories for creating TimeContext instances with known defaults.
 */
import { TimeContext } from '../../src/time/time-context';
import { TempoMap } from '../../src/time/tempo-map';
import { MeterMap } from '../../src/time/meter-map';
import { Meter } from '../../src/time/meter';
import { MeasureMeterPair } from '../../src/time/measure-meter-pair';

/**
 * Create a default TimeContext:
 * - 60 BPM (disabled TempoMap)
 * - 4/4 meter
 * - 44100 Hz sample rate
 */
export function makeDefaultContext(): TimeContext {
  return new TimeContext();
}

/**
 * Create a configurable TimeContext.
 */
export function makeContext(options?: {
  bpm?: number;
  enabled?: boolean;
  meter?: Meter;
  sampleRate?: number;
}): TimeContext {
  const ctx = new TimeContext();

  if (options?.bpm !== undefined || options?.enabled) {
    const tempoMap = new TempoMap();
    if (options.bpm !== undefined) {
      tempoMap.setTempo(options.bpm);
    }
    if (options.enabled) {
      tempoMap.setEnabled(true);
    }
    ctx.setTempoMap(tempoMap);
  }

  if (options?.meter) {
    const meterMap = new MeterMap();
    meterMap.clear();
    meterMap.add(new MeasureMeterPair(1, options.meter));
    ctx.setMeterMap(meterMap);
  }

  if (options?.sampleRate !== undefined) {
    ctx.setSampleRate(options.sampleRate);
  }

  return ctx;
}
