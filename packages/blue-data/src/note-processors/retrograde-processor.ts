/**
 * RetrogradeProcessor — reverses the order of notes (temporal retrograde).
 */
import { NoteProcessor } from './note-processor';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class RetrogradeProcessor extends NoteProcessor {
  override process(notes: NoteList): NoteList {
    // Sort by start time first
    notes.sortByStartTime();
    const n = notes.length;
    if (n === 0) return notes;

    const lastNote = notes.getNote(n - 1);
    const totalTime = lastNote.getStartTime() + lastNote.getSubjectiveDuration();

    for (let i = 0; i < n; i++) {
      const note = notes.getNote(i);
      note.setStartTime(totalTime - (note.getStartTime() + note.getSubjectiveDuration()));
    }
    return notes;
  }

  override getDisplayName(): string { return 'RetrogradeProcessor'; }

  override deepCopy(): RetrogradeProcessor {
    return new RetrogradeProcessor();
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'RetrogradeProcessor');
    return elem;
  }

  static loadFromXML(_data: Element): RetrogradeProcessor {
    return new RetrogradeProcessor();
  }
}
