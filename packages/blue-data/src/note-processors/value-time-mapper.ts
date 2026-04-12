/**
 * ValueTimeMapper — maps a p-field value to a time offset.
 * Mirrors the Java ValueTimeMapper class.
 */
import { NoteProcessor } from './note-processor';
import { NoteProcessorException } from './note-processor-exception';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class ValueTimeMapper extends NoteProcessor {
  private _pfield = 4;
  private _scaleFactor = 1;

  getPfield(): number { return this._pfield; }
  setPfield(p: number): void { this._pfield = p; }

  getScaleFactor(): number { return this._scaleFactor; }
  setScaleFactor(v: number): void { this._scaleFactor = v; }

  override process(notes: NoteList): NoteList {
    for (let i = 0; i < notes.length; i++) {
      const note = notes.getNote(i);
      const val = note.getPField(this._pfield);
      if (val === undefined) {
        throw new NoteProcessorException(`Missing p-field ${this._pfield}`, this._pfield);
      }
      const numVal = parseFloat(val);
      if (isNaN(numVal)) {
        throw new NoteProcessorException(`P-field ${this._pfield} is not a number`, this._pfield);
      }
      note.setStartTime(note.getStartTime() + numVal * this._scaleFactor);
    }
    return notes;
  }

  override getDisplayName(): string { return 'ValueTimeMapper'; }

  override deepCopy(): ValueTimeMapper {
    const copy = new ValueTimeMapper();
    copy._pfield = this._pfield;
    copy._scaleFactor = this._scaleFactor;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'ValueTimeMapper');
    elem.addElement('pfield').setText(this._pfield.toString());
    elem.addElement('scaleFactor').setText(this._scaleFactor.toString());
    return elem;
  }

  static loadFromXML(data: Element): ValueTimeMapper {
    const proc = new ValueTimeMapper();
    const pfi = data.getTextString('pfield');
    if (pfi) proc._pfield = parseInt(pfi, 10);
    const sf = data.getTextString('scaleFactor');
    if (sf) proc._scaleFactor = parseFloat(sf);
    return proc;
  }
}
