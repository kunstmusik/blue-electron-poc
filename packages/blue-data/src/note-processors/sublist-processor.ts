/**
 * SubListProcessor — extracts a sub-list of notes by index range.
 */
import { NoteProcessor } from './note-processor';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class SubListProcessor extends NoteProcessor {
  private _startIndex = 0;
  private _endIndex = -1; // -1 means end of list

  getStartIndex(): number { return this._startIndex; }
  setStartIndex(v: number): void { this._startIndex = v; }

  getEndIndex(): number { return this._endIndex; }
  setEndIndex(v: number): void { this._endIndex = v; }

  override process(notes: NoteList): NoteList {
    const start = Math.max(0, this._startIndex);
    const end = this._endIndex < 0 ? notes.length : Math.min(notes.length, this._endIndex);
    const result = new NoteList();
    for (let i = start; i < end; i++) {
      result.push(notes.getNote(i).deepCopy());
    }
    return result;
  }

  override getDisplayName(): string { return 'SubListProcessor'; }

  override deepCopy(): SubListProcessor {
    const copy = new SubListProcessor();
    copy._startIndex = this._startIndex;
    copy._endIndex = this._endIndex;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'SubListProcessor');
    elem.addElement('startIndex').setText(this._startIndex.toString());
    elem.addElement('endIndex').setText(this._endIndex.toString());
    return elem;
  }

  static loadFromXML(data: Element): SubListProcessor {
    const proc = new SubListProcessor();
    const s = data.getTextString('startIndex');
    if (s) proc._startIndex = parseInt(s, 10);
    const e = data.getTextString('endIndex');
    if (e) proc._endIndex = parseInt(e, 10);
    return proc;
  }
}
