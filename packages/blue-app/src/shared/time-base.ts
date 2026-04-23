/**
 * TimeBase enumeration used by the renderer and app-side tests.
 * Mirrors the values exposed by `@blue/data` without pulling the package
 * into the browser runtime.
 */
export enum TimeBase {
  BEATS = 'BEATS',
  BBT = 'BBT',
  BBST = 'BBST',
  BBF = 'BBF',
  TIME = 'TIME',
  SMPTE = 'SMPTE',
  SECONDS = 'SECONDS',
  FRAME = 'FRAME',
}

/**
 * Returns true for beat-based time bases that use MeterMap for conversion.
 */
export function isBeatBased(timeBase: TimeBase): boolean {
  return (
    timeBase === TimeBase.BEATS ||
    timeBase === TimeBase.BBT ||
    timeBase === TimeBase.BBST ||
    timeBase === TimeBase.BBF
  );
}
