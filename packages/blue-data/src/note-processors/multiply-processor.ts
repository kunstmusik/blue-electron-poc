/**
 * MultiplyProcessor — multiplies specified p-fields by a value.
 * Mirrors the Java MultiplyProcessor class.
 */
import { NoteProcessor } from './note-processor';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class MultiplyProcessor extends NoteProcessor {
  private _pFieldIndex = 4;
  private _value = 1;

  getPFieldIndex(): number { return this._pFieldIndex; }
  setPFieldIndex(idx: number): void { this._pFieldIndex = idx; }

  getValue(): number { return this._value; }
  setValue(v: number): void { this._value = v; }

  override process(notes: NoteList): NoteList {
    const result = new NoteList();
    for (let i = 0; i < notes.length; i++) {
      const note = notes.getNote(i);
      const newNote = note.deepCopy();
      const oldVal = newNote.getPField(this._pFieldIndex);
      if (oldVal !== undefined) {
        newNote.setPField((parseFloat(oldVal) * this._value).toString(), this._pFieldIndex);
      }
      result.push(newNote);
    }
    return result;
  }

  override getDisplayName(): string {
    return `MultiplyProcessor(p${this._pFieldIndex} *= ${this._value})`;
  }

  override deepCopy(): MultiplyProcessor {
    const copy = new MultiplyProcessor();
    copy._pFieldIndex = this._pFieldIndex;
    copy._value = this._value;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'MultiplyProcessor');
    elem.addElement('pFieldIndex').setText(this._pFieldIndex.toString());
    elem.addElement('value').setText(this._value.toString());
    return elem;
  }

  static loadFromXML(data: Element): MultiplyProcessor {
    const proc = new MultiplyProcessor();
    const pfi = data.getTextString('pFieldIndex');
    if (pfi) proc._pFieldIndex = parseInt(pfi, 10);
    const v = data.getTextString('value');
    if (v) proc._value = parseFloat(v);
    return proc;
  }
}
