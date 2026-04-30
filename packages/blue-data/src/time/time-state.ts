/**
 * TimeState — holds the time display state for a score.
 * Mirrors the Java TimeState class.
 *
 * Contains the SMPTE frame rate preference for display.
 */
import { SmpteFrameRate } from './smpte-frame-rate';
import { Element } from '../serialization/xml-reader';

function parseSmpteFrameRate(rateText: string | null | undefined): SmpteFrameRate | null {
  const normalized = rateText?.trim();
  switch (normalized) {
    case '24': return SmpteFrameRate.FPS_24;
    case '25': return SmpteFrameRate.FPS_25;
    case '29.97': return SmpteFrameRate.FPS_29_97;
    case '30': return SmpteFrameRate.FPS_30;
    case '29.97df': return SmpteFrameRate.FPS_29_97_DF;
    case '30df': return SmpteFrameRate.FPS_30_DF;
    default: {
      const rate = parseFloat(normalized ?? '');
      return Number.isNaN(rate) ? null : (rate as SmpteFrameRate);
    }
  }
}

export class TimeState {
  private smpteFrameRate: SmpteFrameRate = SmpteFrameRate.FPS_30;

  constructor(other?: TimeState) {
    if (other) {
      this.smpteFrameRate = other.smpteFrameRate;
    }
  }

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
      const parsedRate = parseSmpteFrameRate(smpteElem.getTextString());
      if (parsedRate !== null) {
        state.smpteFrameRate = parsedRate;
      }
    }

    return state;
  }
}
