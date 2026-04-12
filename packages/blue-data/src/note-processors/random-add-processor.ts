/**
 * RandomAddProcessor — adds a random value to a specified p-field.
 * Mirrors the Java RandomAddProcessor class.
 */
import { NoteProcessor } from './note-processor';
import { NoteProcessorException } from './note-processor-exception';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class RandomAddProcessor extends NoteProcessor {
  private _pfield = 4;
  private _min = 0;
  private _max = 1;
  private _seedUsed = false;
  private _seed = 0;

  getPfield(): number { return this._pfield; }
  setPfield(p: number): void { this._pfield = p; }

  getMin(): number { return this._min; }
  setMin(v: number): void { this._min = v; }

  getMax(): number { return this._max; }
  setMax(v: number): void { this._max = v; }

  isSeedUsed(): boolean { return this._seedUsed; }
  setSeedUsed(val: boolean): void { this._seedUsed = val; }

  getSeed(): number { return this._seed; }
  setSeed(val: number): void { this._seed = val; }

  override process(notes: NoteList): NoteList {
    const range = this._max - this._min;
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
      const randVal = Math.random() * range + this._min;
      note.setPField((numVal + randVal).toString(), this._pfield);
    }
    return notes;
  }

  override getDisplayName(): string { return 'RandomAddProcessor'; }

  override deepCopy(): RandomAddProcessor {
    const copy = new RandomAddProcessor();
    copy._pfield = this._pfield;
    copy._min = this._min;
    copy._max = this._max;
    copy._seedUsed = this._seedUsed;
    copy._seed = this._seed;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'RandomAddProcessor');
    elem.addElement('pfield').setText(this._pfield.toString());
    elem.addElement('min').setText(this._min.toString());
    elem.addElement('max').setText(this._max.toString());
    elem.addElement('seedUsed').setText(this._seedUsed.toString());
    elem.addElement('seed').setText(this._seed.toString());
    return elem;
  }

  static loadFromXML(data: Element): RandomAddProcessor {
    const proc = new RandomAddProcessor();
    const pfi = data.getTextString('pfield');
    if (pfi) proc._pfield = parseInt(pfi, 10);
    const mn = data.getTextString('min');
    if (mn) proc._min = parseFloat(mn);
    const mx = data.getTextString('max');
    if (mx) proc._max = parseFloat(mx);
    const su = data.getTextString('seedUsed');
    if (su) proc._seedUsed = su.toLowerCase() === 'true';
    const sd = data.getTextString('seed');
    if (sd) proc._seed = parseInt(sd, 10);
    return proc;
  }
}
