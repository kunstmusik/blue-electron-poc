/**
 * TimeWarpProcessor — applies a time warp function to note start times.
 */
import { NoteProcessor } from './note-processor';
import { NoteList } from '../sound-objects/note-list';
import { Element } from '../serialization/xml-reader';

export class TimeWarpProcessor extends NoteProcessor {
  private _warpFunction = 'linear';
  private _warpAmount = 1;

  getWarpFunction(): string { return this._warpFunction; }
  setWarpFunction(fn: string): void { this._warpFunction = fn; }

  getWarpAmount(): number { return this._warpAmount; }
  setWarpAmount(v: number): void { this._warpAmount = v; }

  override process(notes: NoteList): NoteList {
    if (notes.length === 0) return notes;

    const lastNote = notes.getNote(notes.length - 1);
    const totalTime = lastNote.getStartTime() + lastNote.getSubjectiveDuration();

    for (let i = 0; i < notes.length; i++) {
      const note = notes.getNote(i);
      const t = totalTime > 0 ? note.getStartTime() / totalTime : 0;
      let warpedT: number;

      switch (this._warpFunction) {
        case 'exponential':
          warpedT = Math.pow(t, this._warpAmount);
          break;
        case 'logarithmic':
          warpedT = Math.log(1 + t * this._warpAmount) / Math.log(1 + this._warpAmount);
          break;
        case 'sine':
          warpedT = Math.sin(t * Math.PI / 2);
          break;
        default: // linear
          warpedT = t;
      }

      note.setStartTime(warpedT * totalTime);
    }
    return notes;
  }

  override getDisplayName(): string { return 'TimeWarpProcessor'; }

  override deepCopy(): TimeWarpProcessor {
    const copy = new TimeWarpProcessor();
    copy._warpFunction = this._warpFunction;
    copy._warpAmount = this._warpAmount;
    return copy;
  }

  saveAsXML(): Element {
    const elem = new Element('noteProcessor');
    elem.setAttribute('type', 'TimeWarpProcessor');
    elem.addElement('warpFunction').setText(this._warpFunction);
    elem.addElement('warpAmount').setText(this._warpAmount.toString());
    return elem;
  }

  static loadFromXML(data: Element): TimeWarpProcessor {
    const proc = new TimeWarpProcessor();
    const fn = data.getTextString('warpFunction');
    if (fn) proc._warpFunction = fn;
    const amt = data.getTextString('warpAmount');
    if (amt) proc._warpAmount = parseFloat(amt);
    return proc;
  }
}
