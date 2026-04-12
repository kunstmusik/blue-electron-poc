/**
 * TuningProcessor — adjusts pitch values by a tuning offset (in cents or ratio).
 */
import { NoteProcessor } from './note-processor';
import { NoteProcessorException } from './note-processor-exception';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class TuningProcessor extends NoteProcessor {
  private _centsOffset = 0;

  getCentsOffset(): number { return this._centsOffset; }
  setCentsOffset(v: number): void { this._centsOffset = v; }

  override process(notes: NoteList): NoteList {
    const ratio = Math.pow(2, this._centsOffset / 1200);
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
      note.setPField((numVal * ratio).toString(), 4);
    }
    return notes;
  }

  override getDisplayName(): string { return 'TuningProcessor'; }

  override deepCopy(): TuningProcessor {
    const copy = new TuningProcessor();
    copy._centsOffset = this._centsOffset;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'TuningProcessor');
    elem.addElement('centsOffset').setText(this._centsOffset.toString());
    return elem;
  }

  static loadFromXML(data: Element): TuningProcessor {
    const proc = new TuningProcessor();
    const v = data.getTextString('centsOffset');
    if (v) proc._centsOffset = parseFloat(v);
    return proc;
  }
}
