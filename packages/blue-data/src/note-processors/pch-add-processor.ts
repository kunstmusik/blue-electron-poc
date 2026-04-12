/**
 * PchAddProcessor — adds a value to the pitch p-field (p4, frequency-based).
 */
import { NoteProcessor } from './note-processor';
import { NoteProcessorException } from './note-processor-exception';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class PchAddProcessor extends NoteProcessor {
  private _value = 0;

  getValue(): number { return this._value; }
  setValue(v: number): void { this._value = v; }

  override process(notes: NoteList): NoteList {
    for (let i = 0; i < notes.length; i++) {
      const note = notes.getNote(i);
      const oldVal = note.getPField(4);
      if (oldVal === undefined) {
        throw new NoteProcessorException('Missing p-field 4', 4);
      }
      const numVal = parseFloat(oldVal);
      if (isNaN(numVal)) {
        throw new NoteProcessorException('P-field 4 is not a number', 4);
      }
      note.setPField((numVal + this._value).toString(), 4);
    }
    return notes;
  }

  override getDisplayName(): string { return 'PchAddProcessor'; }

  override deepCopy(): PchAddProcessor {
    const copy = new PchAddProcessor();
    copy._value = this._value;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'PchAddProcessor');
    elem.addElement('value').setText(this._value.toString());
    return elem;
  }

  static loadFromXML(data: Element): PchAddProcessor {
    const proc = new PchAddProcessor();
    const v = data.getTextString('value');
    if (v) proc._value = parseFloat(v);
    return proc;
  }
}
