/**
 * RotateProcessor — rotates notes by shifting their start times.
 */
import { NoteProcessor } from './note-processor';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class RotateProcessor extends NoteProcessor {
  private _rotateAmount = 0;

  getRotateAmount(): number { return this._rotateAmount; }
  setRotateAmount(v: number): void { this._rotateAmount = v; }

  override process(notes: NoteList): NoteList {
    for (let i = 0; i < notes.length; i++) {
      const note = notes.getNote(i);
      note.setStartTime(note.getStartTime() + this._rotateAmount);
    }
    return notes;
  }

  override getDisplayName(): string { return 'RotateProcessor'; }

  override deepCopy(): RotateProcessor {
    const copy = new RotateProcessor();
    copy._rotateAmount = this._rotateAmount;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'RotateProcessor');
    elem.addElement('rotateAmount').setText(this._rotateAmount.toString());
    return elem;
  }

  static loadFromXML(data: Element): RotateProcessor {
    const proc = new RotateProcessor();
    const v = data.getTextString('rotateAmount');
    if (v) proc._rotateAmount = parseFloat(v);
    return proc;
  }
}
