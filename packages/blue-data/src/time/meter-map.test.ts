import { describe, expect, it } from 'vitest';
import { MeterMap } from './meter-map';

describe('MeterMap BBF conversion', () => {
  it('formats canonical hundredths with two-digit rounding semantics', () => {
    const meterMap = new MeterMap();

    expect(meterMap.beatsToBBF(0.05)).toEqual({ bar: 1, beat: 1, fraction: 5 });
    expect(meterMap.beatsToBBF(0.5)).toEqual({ bar: 1, beat: 1, fraction: 50 });
  });

  it('carries rounding overflow to the next beat', () => {
    const meterMap = new MeterMap();

    expect(meterMap.beatsToBBF(0.9994)).toEqual({ bar: 1, beat: 2, fraction: 0 });
  });
});
