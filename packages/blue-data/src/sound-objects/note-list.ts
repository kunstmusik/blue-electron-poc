/**
 * NoteList — collection of Notes with merge and sort operations.
 * Mirrors the Java NoteList class.
 *
 * NoteLists are the output of SoundObject.generateForCSD() and are
 * accumulated during CSD generation to form the final <CsScore> section.
 */
import { Note } from './note';

export class NoteList {
  private _notes: Note[] = [];

  constructor(initial?: Note[]) {
    if (initial) {
      this._notes = [...initial];
    }
  }

  /** Get the number of notes. */
  get length(): number {
    return this._notes.length;
  }

  /** Get a note by index. */
  getNote(index: number): Note {
    return this._notes[index];
  }

  /** Add a note. */
  push(note: Note): void {
    this._notes.push(note);
  }

  /**
   * Merge another NoteList into this one.
   * Notes are added and the list is re-sorted by start time.
   */
  merge(other: NoteList): void {
    for (let i = 0; i < other.length; i++) {
      this._notes.push(other.getNote(i));
    }
    this.sortByStartTime();
  }

  /** Sort notes by start time (ascending). */
  sortByStartTime(): void {
    this._notes.sort((a, b) => a.getStartTime() - b.getStartTime());
  }

  /**
   * Create a deep copy of this note list.
   */
  deepCopy(): NoteList {
    const copy = new NoteList();
    for (const note of this._notes) {
      copy.push(note.deepCopy());
    }
    return copy;
  }

  /** Iterate over notes (for...of). */
  *[Symbol.iterator](): Iterator<Note> {
    for (const note of this._notes) {
      yield note;
    }
  }

  /** Map over notes. */
  map<T>(fn: (note: Note, index: number) => T): T[] {
    return this._notes.map(fn);
  }
}
