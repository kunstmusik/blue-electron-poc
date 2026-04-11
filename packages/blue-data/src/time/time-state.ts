/**
 * TimeState — holds the time display state for a score.
 * Mirrors the Java TimeState class.
 *
 * Contains the SMPTE frame rate preference for display.
 */
import { SmpteFrameRate } from './smpte-frame-rate';
import { Element } from '../serialization/xml-reader';

export class TimeState {
  private smpteFrameRate: SmpteFrameRate = SmpteFrameRate.FPS_30;

  getSmpteFrameRate(): SmpteFrameRate {
    return this.smpteFrameRate;
  }

  setSmpteFrameRate(rate: SmpteFrameRate): void {
    this.smpteFrameRate = rate;
  }

  // ─── XML Serialization ───

  saveAsXML(): Element {
    const elem = new Element('timeState');
    elem.addElement('smpteFrameRate').setText(this.smpteFrameRate.toString());
    return elem;
  }

  static loadFromXML(data: Element): TimeState {
    const state = new TimeState();

    const smpteElem = data.getElement('smpteFrameRate');
    if (smpteElem) {
      const rateStr = smpteElem.getTextString();
      const rate = parseFloat(rateStr);
      if (!isNaN(rate)) {
        state.smpteFrameRate = rate as SmpteFrameRate;
      }
    }

    return state;
  }
}
