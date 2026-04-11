/**
 * NoteList — collection of Notes with merge and sort operations.
 * Mirrors the Java NoteList class.
 *
 * NoteLists are the output of SoundObject.generateForCSD() and are
 * accumulated during CSD generation to form the final <CsScore> section.
 */
import { Note } from './note';

export class NoteList extends Array<Note> {
  constructor(initial?: Note[]) {
    super();
    if (initial) {
      this.push(...initial);
    }
  }

  /**
   * Merge another NoteList into this one.
   * Notes are added and the list is re-sorted by start time.
   */
  merge(other: NoteList): void {
    this.push(...other);
    this.sortByStartTime();
  }

  /** Sort notes by start time (ascending). */
  sortByStartTime(): void {
    this.sort((a, b) => a.getStartTime() - b.getStartTime());
  }

  /**
   * Create a deep copy of this note list.
   */
  deepCopy(): NoteList {
    const copy = new NoteList();
    for (const note of this) {
      copy.push(note.deepCopy());
    }
    return copy;
  }
}
