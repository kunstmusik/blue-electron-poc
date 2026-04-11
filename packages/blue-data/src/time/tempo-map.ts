/**
 * TempoMap — manages tempo changes over time.
 * Mirrors the Java TempoMap class.
 *
 * For Phase 2, this is a basic implementation with a single tempo.
 * Full tempo map with changes will be implemented as needed.
 */
export class TempoMap {
  private tempoBpm = 60.0;

  /** Get the current tempo in BPM. */
  getTempo(): number {
    return this.tempoBpm;
  }

  /** Set the tempo in BPM. */
  setTempo(bpm: number): void {
    this.tempoBpm = bpm;
  }

  /** Get beat duration in seconds (60 / BPM). */
  getBeatDuration(): number {
    return 60.0 / this.tempoBpm;
  }

  /** Convert beats to seconds. */
  beatsToSeconds(beats: number): number {
    return beats * this.getBeatDuration();
  }

  /** Convert seconds to beats. */
  secondsToBeats(seconds: number): number {
    return seconds / this.getBeatDuration();
  }
}
