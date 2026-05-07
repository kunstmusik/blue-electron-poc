/**
 * TimeBase — enumeration of time units used in Blue.
 * Mirrors the Java TimeBase enum.
 *
 * 8 time bases matching the Java implementation:
 * - BEATS: Csound beats (quarter note = 1 beat)
 * - BBT: Bars.Beats.Ticks (1-based position)
 * - BBST: Bars.Beats.Sixteenths.Ticks (1-based position)
 * - BBF: Bars.Beats.Fraction (1-based position, fraction 0-99 canonical hundredths)
 * - TIME: Hours:Minutes:Seconds.Milliseconds
 * - SMPTE: SMPTE timecode (display only)
 * - SECONDS: Raw seconds
 * - FRAME: Audio sample frame number
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
 * BEATS, BBT, BBST, and BBF all represent positions/durations in musical beats.
 */
export function isBeatBased(timeBase: TimeBase): boolean {
  return (
    timeBase === TimeBase.BEATS ||
    timeBase === TimeBase.BBT ||
    timeBase === TimeBase.BBST ||
    timeBase === TimeBase.BBF
  );
}
