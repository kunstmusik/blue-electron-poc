/**
 * RandomMultiplyProcessor — multiplies a specified p-field by a random value.
 * Mirrors the Java RandomMultiplyProcessor class.
 */
import { NoteProcessor } from './note-processor';
import { NoteProcessorException } from './note-processor-exception';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class RandomMultiplyProcessor extends NoteProcessor {
  private _pfield = 4;
  private _min = 0.5;
  private _max = 1.5;

  getPfield(): number { return this._pfield; }
  setPfield(p: number): void { this._pfield = p; }

  getMin(): number { return this._min; }
  setMin(v: number): void { this._min = v; }

  getMax(): number { return this._max; }
  setMax(v: number): void { this._max = v; }

  override process(notes: NoteList): NoteList {
    for (let i = 0; i < notes.length; i++) {
      const note = notes.getNote(i);
      const oldVal = note.getPField(this._pfield);
      if (oldVal === undefined) {
        throw new NoteProcessorException(`Missing p-field ${this._pfield}`, this._pfield);
      }
      const numVal = parseFloat(oldVal);
      if (isNaN(numVal)) {
        throw new NoteProcessorException(`P-field ${this._pfield} is not a number`, this._pfield);
      }
      const randVal = Math.random() * (this._max - this._min) + this._min;
      note.setPField((numVal * randVal).toString(), this._pfield);
    }
    return notes;
  }

  override getDisplayName(): string { return 'RandomMultiplyProcessor'; }

  override deepCopy(): RandomMultiplyProcessor {
    const copy = new RandomMultiplyProcessor();
    copy._pfield = this._pfield;
    copy._min = this._min;
    copy._max = this._max;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'RandomMultiplyProcessor');
    elem.addElement('pfield').setText(this._pfield.toString());
    elem.addElement('min').setText(this._min.toString());
    elem.addElement('max').setText(this._max.toString());
    return elem;
  }

  static loadFromXML(data: Element): RandomMultiplyProcessor {
    const proc = new RandomMultiplyProcessor();
    const pfi = data.getTextString('pfield');
    if (pfi) proc._pfield = parseInt(pfi, 10);
    const mn = data.getTextString('min');
    if (mn) proc._min = parseFloat(mn);
    const mx = data.getTextString('max');
    if (mx) proc._max = parseFloat(mx);
    return proc;
  }
}
