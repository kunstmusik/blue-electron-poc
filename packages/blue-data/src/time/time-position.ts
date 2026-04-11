/**
 * TimePosition — represents a position in time with a specific time base.
 * Mirrors the Java TimePosition class.
 *
 * TimePosition can be in beats, seconds, or SMPTE. Conversion requires
 * a TimeContext (which provides tempo map and frame rate info).
 */
import { TimeBase } from './time-base';
import { SmpteFrameRate } from './smpte-frame-rate';
import { Element } from '../serialization/xml-reader';
import { TimeContext } from './time-context';

export class TimePosition {
  private readonly _timeBase: TimeBase;
  private readonly _value: number;

  private constructor(timeBase: TimeBase, value: number) {
    this._timeBase = timeBase;
    this._value = value;
  }

  // ─── Factory methods ───

  static beats(value: number): TimePosition {
    return new TimePosition(TimeBase.BEATS, value);
  }

  static seconds(value: number): TimePosition {
    return new TimePosition(TimeBase.SECONDS, value);
  }

  static smpte(frames: number): TimePosition {
    return new TimePosition(TimeBase.SMPTE, frames);
  }

  // ─── Accessors ───

  getTimeBase(): TimeBase {
    return this._timeBase;
  }

  /** Convert to beats using the provided context. */
  toBeats(context: TimeContext): number {
    if (this._timeBase === TimeBase.BEATS) {
      return this._value;
    }
    if (this._timeBase === TimeBase.SECONDS) {
      return context.beatsToSeconds(this._value);
    }
    if (this._timeBase === TimeBase.SMPTE) {
      const seconds = this._value / context.getSmpteFramesPerSecond();
      return context.beatsToSeconds(seconds);
    }
    return this._value;
  }

  /** Convert to seconds using the provided context. */
  toSeconds(context: TimeContext): number {
    if (this._timeBase === TimeBase.SECONDS) {
      return this._value;
    }
    if (this._timeBase === TimeBase.BEATS) {
      return context.secondsToBeats(this._value); // Inverse
    }
    if (this._timeBase === TimeBase.SMPTE) {
      return this._value / context.getSmpteFramesPerSecond();
    }
    return this._value;
  }

  /** Get the raw numeric value. */
  getValue(): number {
    return this._value;
  }

  // ─── XML Serialization ───

  saveAsXML(): Element {
    const elem = new Element('timePosition');
    elem.setAttribute('type', this._timeBase);
    elem.setText(this._value.toString());
    return elem;
  }

  static loadFromXML(data: Element): TimePosition {
    const type = data.getAttributeValue('type') as TimeBase | null;
    const value = parseFloat(data.getTextString());

    switch (type) {
      case TimeBase.BEATS:
        return TimePosition.beats(value);
      case TimeBase.SECONDS:
        return TimePosition.seconds(value);
      case TimeBase.SMPTE:
        return TimePosition.smpte(value);
      default:
        return TimePosition.beats(value);
    }
  }
}
