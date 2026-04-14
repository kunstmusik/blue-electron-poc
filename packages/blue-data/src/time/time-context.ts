/**
 * TimeContext — provides context for time conversions.
 * Mirrors the Java TimeContext class.
 *
 * Contains the TempoMap and SMPTE frame rate used for converting between
 * beats, seconds, and SMPTE frames.
 */
import { TempoMap } from './tempo-map';
import { SmpteFrameRate } from './smpte-frame-rate';
import { Element } from '../serialization/xml-reader';

export class TimeContext {
  private tempoMap = new TempoMap();
  private smpteFrameRate: SmpteFrameRate = SmpteFrameRate.FPS_30;

  // ─── Accessors ───

  getTempoMap(): TempoMap {
    return this.tempoMap;
  }

  setTempoMap(tempoMap: TempoMap): void {
    this.tempoMap = tempoMap;
  }

  getSmpteFrameRate(): SmpteFrameRate {
    return this.smpteFrameRate;
  }

  setSmpteFrameRate(rate: SmpteFrameRate): void {
    this.smpteFrameRate = rate;
  }

  /** Get SMPTE frames per second as a number. */
  getSmpteFramesPerSecond(): number {
    const rate = this.smpteFrameRate;
    if (typeof rate === 'number') return rate;
    // Drop-frame rates
    if (rate === SmpteFrameRate.FPS_29_97_DF) return 29.97;
    if (rate === SmpteFrameRate.FPS_30_DF) return 30;
    return 30;
  }

  /** Get beat duration in seconds. */
  getBeatDuration(): number {
    return this.tempoMap.getBeatDuration();
  }

  /** Convert beats to seconds. */
  beatsToSeconds(beats: number): number {
    return this.tempoMap.beatsToSeconds(beats);
  }

  /** Convert seconds to beats. */
  secondsToBeats(seconds: number): number {
    return this.tempoMap.secondsToBeats(seconds);
  }

  // ─── XML Serialization ───

  saveAsXML(): Element {
    const elem = new Element('timeContext');
    elem.addElement('tempo').setText(this.tempoMap.getTempo().toString());
    elem.addElement('smpteFrameRate').setText(this.smpteFrameRate.toString());
    return elem;
  }

  static loadFromXML(data: Element): TimeContext {
    const ctx = new TimeContext();

    // Load simple <tempo> element
    const tempoElem = data.getElement('tempo');
    if (tempoElem) {
      ctx.tempoMap.setTempo(parseFloat(tempoElem.getTextString()));
    }

    // Load <tempoMap> with <tempoPoint> elements
    // TempoMap may be directly inside timeContext or nested inside meterMap
    let tempoMapElem = data.getElement('tempoMap');
    if (!tempoMapElem) {
      const meterMap = data.getElement('meterMap');
      if (meterMap) tempoMapElem = meterMap.getElement('tempoMap');
    }
    if (tempoMapElem) {
      const enabled = tempoMapElem.getTextString('enabled');
      if (enabled !== 'false') {
        const points = tempoMapElem.getElements('tempoPoint');
        if (points.hasMoreElements()) {
          const firstPoint = points.next();
          const tempo = firstPoint.getAttribute('tempo');
          if (tempo) ctx.tempoMap.setTempo(parseFloat(tempo));
        }
      }
    }

    const smpteElem = data.getElement('smpteFrameRate');
    if (smpteElem) {
      const rateStr = smpteElem.getTextString();
      const rate = parseFloat(rateStr);
      if (!isNaN(rate)) {
        ctx.smpteFrameRate = rate as SmpteFrameRate;
      }
    }

    return ctx;
  }
}
