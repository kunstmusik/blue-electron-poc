/**
 * TimeDuration — represents a duration of time with a specific time base.
 * Mirrors the Java TimeDuration class.
 *
 * TimeDuration can be in beats, seconds, or SMPTE frames. Conversion
 * requires a TimeContext.
 */
import { TimeBase } from './time-base';
import { TimeContext } from './time-context';
import { Element } from '../serialization/xml-reader';

export class TimeDuration {
  private readonly _timeBase: TimeBase;
  private readonly _value: number;

  private constructor(timeBase: TimeBase, value: number) {
    this._timeBase = timeBase;
    this._value = value;
  }

  // ─── Factory methods ───

  static beats(value: number): TimeDuration {
    return new TimeDuration(TimeBase.BEATS, value);
  }

  static seconds(value: number): TimeDuration {
    return new TimeDuration(TimeBase.SECONDS, value);
  }

  static fromSeconds(value: number): TimeDuration {
    return new TimeDuration(TimeBase.SECONDS, value);
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
      // seconds → beats: divide by beat duration
      return this._value / context.getBeatDuration();
    }
    return this._value;
  }

  /** Convert to seconds using the provided context. */
  toSeconds(context: TimeContext): number {
    if (this._timeBase === TimeBase.SECONDS) {
      return this._value;
    }
    if (this._timeBase === TimeBase.BEATS) {
      return this._value * context.getBeatDuration();
    }
    return this._value;
  }

  /** Get the raw numeric value. */
  getValue(): number {
    return this._value;
  }

  // ─── XML Serialization ───

  saveAsXML(): Element {
    const elem = new Element('timeDuration');
    elem.setAttribute('type', this._timeBase);
    elem.setText(this._value.toString());
    return elem;
  }

  static loadFromXML(data: Element): TimeDuration {
    const type = data.getAttributeValue('type') as TimeBase | null;
    const value = parseFloat(data.getTextString());

    switch (type) {
      case TimeBase.BEATS:
        return TimeDuration.beats(value);
      case TimeBase.SECONDS:
        return TimeDuration.seconds(value);
      default:
        return TimeDuration.beats(value);
    }
  }
}
