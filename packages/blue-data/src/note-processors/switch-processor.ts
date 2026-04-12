/**
 * SwitchProcessor — swaps values between two p-fields.
 */
import { NoteProcessor } from './note-processor';
import { NoteProcessorException } from './note-processor-exception';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class SwitchProcessor extends NoteProcessor {
  private _pfield1 = 4;
  private _pfield2 = 5;

  getPfield1(): number { return this._pfield1; }
  setPfield1(p: number): void { this._pfield1 = p; }

  getPfield2(): number { return this._pfield2; }
  setPfield2(p: number): void { this._pfield2 = p; }

  override process(notes: NoteList): NoteList {
    for (let i = 0; i < notes.length; i++) {
      const note = notes.getNote(i);
      const val1 = note.getPField(this._pfield1);
      const val2 = note.getPField(this._pfield2);
      if (val1 === undefined) {
        throw new NoteProcessorException(`Missing p-field ${this._pfield1}`, this._pfield1);
      }
      if (val2 === undefined) {
        throw new NoteProcessorException(`Missing p-field ${this._pfield2}`, this._pfield2);
      }
      note.setPField(val2, this._pfield1);
      note.setPField(val1, this._pfield2);
    }
    return notes;
  }

  override getDisplayName(): string { return 'SwitchProcessor'; }

  override deepCopy(): SwitchProcessor {
    const copy = new SwitchProcessor();
    copy._pfield1 = this._pfield1;
    copy._pfield2 = this._pfield2;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'SwitchProcessor');
    elem.addElement('pfield1').setText(this._pfield1.toString());
    elem.addElement('pfield2').setText(this._pfield2.toString());
    return elem;
  }

  static loadFromXML(data: Element): SwitchProcessor {
    const proc = new SwitchProcessor();
    const p1 = data.getTextString('pfield1');
    if (p1) proc._pfield1 = parseInt(p1, 10);
    const p2 = data.getTextString('pfield2');
    if (p2) proc._pfield2 = parseInt(p2, 10);
    return proc;
  }
}
