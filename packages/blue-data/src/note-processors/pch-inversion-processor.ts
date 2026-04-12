/**
 * PchInversionProcessor — inverts pitch values around a center pitch.
 */
import { NoteProcessor } from './note-processor';
import { NoteProcessorException } from './note-processor-exception';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class PchInversionProcessor extends NoteProcessor {
  private _centerPitch = 0;

  getCenterPitch(): number { return this._centerPitch; }
  setCenterPitch(v: number): void { this._centerPitch = v; }

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
      note.setPField((2 * this._centerPitch - numVal).toString(), 4);
    }
    return notes;
  }

  override getDisplayName(): string { return 'PchInversionProcessor'; }

  override deepCopy(): PchInversionProcessor {
    const copy = new PchInversionProcessor();
    copy._centerPitch = this._centerPitch;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'PchInversionProcessor');
    elem.addElement('centerPitch').setText(this._centerPitch.toString());
    return elem;
  }

  static loadFromXML(data: Element): PchInversionProcessor {
    const proc = new PchInversionProcessor();
    const v = data.getTextString('centerPitch');
    if (v) proc._centerPitch = parseFloat(v);
    return proc;
  }
}
