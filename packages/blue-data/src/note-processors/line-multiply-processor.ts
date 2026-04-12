/**
 * LineMultiplyProcessor — multiplies a p-field by a linearly interpolated value.
 */
import { NoteProcessor } from './note-processor';
import { NoteProcessorException } from './note-processor-exception';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class LineMultiplyProcessor extends NoteProcessor {
  private _pfield = 4;
  private _startValue = 1;
  private _endValue = 1;

  getPfield(): number { return this._pfield; }
  setPfield(p: number): void { this._pfield = p; }

  getStartValue(): number { return this._startValue; }
  setStartValue(v: number): void { this._startValue = v; }

  getEndValue(): number { return this._endValue; }
  setEndValue(v: number): void { this._endValue = v; }

  override process(notes: NoteList): NoteList {
    const n = notes.length;
    if (n === 0) return notes;
    for (let i = 0; i < n; i++) {
      const note = notes.getNote(i);
      const oldVal = note.getPField(this._pfield);
      if (oldVal === undefined) {
        throw new NoteProcessorException(`Missing p-field ${this._pfield}`, this._pfield);
      }
      const numVal = parseFloat(oldVal);
      if (isNaN(numVal)) {
        throw new NoteProcessorException(`P-field ${this._pfield} is not a number`, this._pfield);
      }
      const t = n > 1 ? i / (n - 1) : 0;
      const lineVal = this._startValue + t * (this._endValue - this._startValue);
      note.setPField((numVal * lineVal).toString(), this._pfield);
    }
    return notes;
  }

  override getDisplayName(): string { return 'LineMultiplyProcessor'; }

  override deepCopy(): LineMultiplyProcessor {
    const copy = new LineMultiplyProcessor();
    copy._pfield = this._pfield;
    copy._startValue = this._startValue;
    copy._endValue = this._endValue;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'LineMultiplyProcessor');
    elem.addElement('pfield').setText(this._pfield.toString());
    elem.addElement('startValue').setText(this._startValue.toString());
    elem.addElement('endValue').setText(this._endValue.toString());
    return elem;
  }

  static loadFromXML(data: Element): LineMultiplyProcessor {
    const proc = new LineMultiplyProcessor();
    const pfi = data.getTextString('pfield');
    if (pfi) proc._pfield = parseInt(pfi, 10);
    const sv = data.getTextString('startValue');
    if (sv) proc._startValue = parseFloat(sv);
    const ev = data.getTextString('endValue');
    if (ev) proc._endValue = parseFloat(ev);
    return proc;
  }
}
