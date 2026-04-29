/**
 * TimeContext — provides context for time conversions.
 * Mirrors the Java TimeContext class.
 *
 * Contains TempoMap, MeterMap, sample rate, and SMPTE frame rate.
 */
import { TempoMap } from './tempo-map';
import { MeterMap } from './meter-map';
import { SmpteFrameRate } from './smpte-frame-rate';
import { Element } from '../serialization/xml-reader';

/** Default sample rate. */
const DEFAULT_SAMPLE_RATE = 44100;

export class TimeContext {
  private tempoMap = new TempoMap();
  private meterMap = new MeterMap();
  private sampleRate = DEFAULT_SAMPLE_RATE;
  private smpteFrameRate: SmpteFrameRate = SmpteFrameRate.FPS_30;

  constructor(other?: TimeContext) {
    if (other) {
      this.tempoMap = new TempoMap(other.tempoMap);
      this.meterMap = new MeterMap(other.meterMap);
      this.sampleRate = other.sampleRate;
      this.smpteFrameRate = other.smpteFrameRate;
    }
  }

  // ─── Accessors ───

  getTempoMap(): TempoMap {
    return this.tempoMap;
  }

  setTempoMap(tempoMap: TempoMap): void {
    this.tempoMap = tempoMap;
  }

  getMeterMap(): MeterMap {
    return this.meterMap;
  }

  setMeterMap(meterMap: MeterMap): void {
    this.meterMap = meterMap;
  }

  getSampleRate(): number {
    return this.sampleRate;
  }

  setSampleRate(rate: number): void {
    this.sampleRate = rate;
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
    if (rate === SmpteFrameRate.FPS_29_97_DF) return 29.97;
    if (rate === SmpteFrameRate.FPS_30_DF) return 30;
    return 30;
  }

  /** Get beat duration in seconds (60 / BPM). */
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

  /**
   * Check if this context has the same musical context as another
   * (same tempo map and meter map).
   */
  hasSameMusicalContext(other: TimeContext | null): boolean {
    if (!other) return false;
    if (this === other) return true;
    return this.tempoMap.equals(other.tempoMap) && this.meterMap.equals(other.meterMap);
  }

  // ─── XML Serialization ───

  saveAsXML(): Element {
    const elem = new Element('timeContext');
    elem.addElement(this.tempoMap.saveAsXML().setName('tempoMap'));
    elem.addElement(this.meterMap.saveAsXML().setName('meterMap'));
    elem.addElement('smpteFrameRate').setText(this.smpteFrameRate.toString());
    return elem;
  }

  static loadFromXML(data: Element): TimeContext {
    const ctx = new TimeContext();

    // Load tempo map
    let tempoMapElem = data.getElement('tempoMap');
    if (!tempoMapElem) {
      // Try nested inside meterMap
      const meterMapElem = data.getElement('meterMap');
      if (meterMapElem) tempoMapElem = meterMapElem.getElement('tempoMap');
    }
    if (tempoMapElem) {
      ctx.tempoMap = TempoMap.loadFromXML(tempoMapElem);
    }

    // Also check simple <tempo> element
    const tempoElem = data.getElement('tempo');
    if (tempoElem && ctx.tempoMap.getTempo() === 60) {
      ctx.tempoMap.setTempo(parseFloat(tempoElem.getTextString() ?? '60'));
    }

    // Load meter map
    const meterMapElem = data.getElement('meterMap');
    if (meterMapElem) {
      ctx.meterMap = MeterMap.loadFromXML(meterMapElem);
    }

    // Legacy: ignore <sampleRate> element (not stored per Java design)
    // const sampleRateElem = data.getElement('sampleRate');

    const smpteElem = data.getElement('smpteFrameRate');
    if (smpteElem) {
      const rateStr = smpteElem.getTextString();
      const rate = parseFloat(rateStr ?? '');
      if (!isNaN(rate)) {
        ctx.smpteFrameRate = rate as SmpteFrameRate;
      }
    }

    return ctx;
  }
}
