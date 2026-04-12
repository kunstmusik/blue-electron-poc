/**
 * EqualsProcessor — filters notes where a p-field equals a specific value.
 */
import { NoteProcessor } from './note-processor';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class EqualsProcessor extends NoteProcessor {
  private _pfield = 4;
  private _value = '';

  getPfield(): number { return this._pfield; }
  setPfield(p: number): void { this._pfield = p; }

  getValue(): string { return this._value; }
  setValue(v: string): void { this._value = v; }

  override process(notes: NoteList): NoteList {
    const result = new NoteList();
    for (let i = 0; i < notes.length; i++) {
      const note = notes.getNote(i);
      const val = note.getPField(this._pfield);
      if (val === this._value) {
        result.push(note.deepCopy());
      }
    }
    return result;
  }

  override getDisplayName(): string { return 'EqualsProcessor'; }

  override deepCopy(): EqualsProcessor {
    const copy = new EqualsProcessor();
    copy._pfield = this._pfield;
    copy._value = this._value;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'EqualsProcessor');
    elem.addElement('pfield').setText(this._pfield.toString());
    elem.addElement('value').setText(this._value);
    return elem;
  }

  static loadFromXML(data: Element): EqualsProcessor {
    const proc = new EqualsProcessor();
    const pfi = data.getTextString('pfield');
    if (pfi) proc._pfield = parseInt(pfi, 10);
    const v = data.getTextString('value');
    if (v !== null) proc._value = v;
    return proc;
  }
}
