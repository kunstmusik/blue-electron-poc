/**
 * TimeBehavior — determines how a SoundObject's notes are transformed when
 * its parent container is repeated, scaled, or looped.
 * Mirrors the Java TimeBehavior enum.
 */
export enum TimeBehavior {
  /** No time behavior transformation. */
  NONE = 'NONE',
  /** Repeat the notes within the container's duration. */
  REPEAT = 'REPEAT',
  /** Classic repeat — full repeats then partial final cycle. */
  REPEAT_CLASSIC = 'REPEAT_CLASSIC',
  /** Scale the notes proportionally to the container's duration. */
  SCALE = 'SCALE',
  /** Time behavior is not supported for this SoundObject type. */
  NOT_SUPPORTED = 'NOT_SUPPORTED',
}
