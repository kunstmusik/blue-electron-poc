/**
 * Note — represents a single Csound note with p-fields.
 * Mirrors the Java Note class.
 *
 * Csound notes are text-based: "i1 0 2 440 0.5" where:
 *   p1 = instrument, p2 = start time, p3 = duration, p4+ = parameters
 *
 * Notes are built by SoundObjects during CSD generation and collected
 * into NoteLists for the final score output.
 */
export class Note {
  private _pFields = new Map<number, string>();
  private _startTime = 0;
  private _subjectiveDuration = 0;

  constructor() {}

  /** Create a note with the specified number of p-fields. */
  static createNote(numPFields: number): Note {
    const note = new Note();
    return note;
  }

  /** Get start time (p2). */
  getStartTime(): number {
    return this._startTime;
  }

  /** Set start time (p2). */
  setStartTime(time: number): void {
    this._startTime = time;
  }

  /** Get subjective duration (p3). */
  getSubjectiveDuration(): number {
    return this._subjectiveDuration;
  }

  /** Set subjective duration (p3). */
  setSubjectiveDuration(duration: number): void {
    this._subjectiveDuration = duration;
  }

  /** Get a p-field value. */
  getPField(index: number): string | undefined {
    return this._pFields.get(index);
  }

  /** Set a p-field value. Index is 1-based (p1 = instrument). */
  setPField(value: string, index: number): void {
    this._pFields.set(index, value);
  }

  /** Get all p-fields as a map. */
  getPFields(): Map<number, string> {
    return new Map(this._pFields);
  }

  /** Convert this note to Csound score text. */
  toScoreText(): string {
    const parts: string[] = [];
    // p1 (instrument)
    parts.push(this._pFields.get(1) ?? '0');
    // p2 (start time)
    parts.push(this._startTime.toString());
    // p3 (duration)
    parts.push(this._subjectiveDuration.toString());
    // p4+ (parameters)
    for (let i = 4; ; i++) {
      const val = this._pFields.get(i);
      if (val === undefined) break;
      parts.push(val);
    }
    return parts.join(' ');
  }

  /** Create a deep copy of this note. */
  deepCopy(): Note {
    const note = new Note();
    note._startTime = this._startTime;
    note._subjectiveDuration = this._subjectiveDuration;
    for (const [k, v] of this._pFields) {
      note._pFields.set(k, v);
    }
    return note;
  }
}
