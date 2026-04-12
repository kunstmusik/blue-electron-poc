/**
 * TimeUtilities — utility functions for time conversions.
 * Mirrors the Java TimeUtilities class.
 */
import { TimePosition } from './time-position';
import { TimeDuration } from './time-duration';
import { TimeBase } from './time-base';
import { TimeContext } from './time-context';

/**
 * Convert beats to a TimePosition using the given base and context.
 */
export function beatsToTimePosition(beats: number, base: TimeBase, _context: TimeContext): TimePosition {
  switch (base) {
    case TimeBase.BEATS:
      return TimePosition.beats(beats);
    case TimeBase.SECONDS:
      return TimePosition.seconds(beats); // beats param is actually seconds here
    case TimeBase.SMPTE:
      return TimePosition.smpte(beats);
  }
}

/**
 * Convert seconds to a TimeDuration using the given base.
 */
export function secondsToDuration(seconds: number, base: TimeBase, context: TimeContext): TimeDuration {
  switch (base) {
    case TimeBase.BEATS:
      return TimeDuration.beats(seconds / context.getBeatDuration());
    case TimeBase.SECONDS:
      return TimeDuration.seconds(seconds);
    case TimeBase.SMPTE:
      return TimeDuration.beats(seconds / context.getBeatDuration());
  }
}
