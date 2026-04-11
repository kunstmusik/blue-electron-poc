/**
 * GenericScore — a SoundObject containing raw Csound score text.
 * Mirrors the Java GenericScore class.
 *
 * This is the most common SoundObject type — it holds Csound score events
 * as plain text (e.g., "i1 0 2 440 0.5\ni2 3 1 880 0.3").
 *
 * During CSD generation, the text is passed through directly to the score output.
 */
import { AbstractSoundObject } from './abstract-sound-object';
import { SoundObjectException } from './sound-object-exception';
import { NoteList } from './note-list';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap } from '../serialization/obj-ref-map';
import { SoundObject, SoundObjectStatic } from './sound-object';

export class GenericScore extends AbstractSoundObject implements SoundObject {
  private _scoreText = '';

  constructor() {
    super();
    this.setName('GenericScore');
  }

  /** Get the raw score text. */
  getScoreText(): string {
    return this._scoreText;
  }

  /** Set the raw score text. */
  setScoreText(text: string): void {
    this._scoreText = text;
  }

  // ─── SoundObject implementation ───

  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    // GenericScore generates notes by parsing its score text.
    // For Phase 3, we return an empty NoteList — the actual score text
    // goes directly into the CSD <CsScore> section, not through NoteList.
    // This will be handled by Score.toCSD().
    return new NoteList();
  }

  // ─── XML Serialization ───

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'GenericScore');

    // Basic sound object properties
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());

    // GenericScore-specific
    elem.addElement('scoreText').setText(this._scoreText);

    return elem;
  }

  static loadFromXML(data: Element): GenericScore {
    const sObj = new GenericScore();

    sObj.setName(data.getTextString('name') ?? '');

    const startTimeStr = data.getTextString('startTime');
    if (startTimeStr) {
      sObj.setSubjectiveDuration(TimeDuration.beats(parseFloat(startTimeStr)));
    }

    const durationStr = data.getTextString('subjectiveDuration');
    if (durationStr) {
      sObj.setSubjectiveDuration(TimeDuration.beats(parseFloat(durationStr)));
    }

    const tbStr = data.getTextString('timeBehavior');
    if (tbStr && Object.values(TimeBehavior).includes(tbStr as TimeBehavior)) {
      sObj.setTimeBehavior(tbStr as TimeBehavior);
    }

    const colorStr = data.getTextString('backgroundColor');
    if (colorStr) {
      sObj.setBackgroundColor(parseInt(colorStr, 10));
    }

    const scoreText = data.getTextString('scoreText');
    if (scoreText !== null) {
      sObj.setScoreText(scoreText);
    }

    return sObj;
  }

  override deepCopy(): GenericScore {
    const copy = new GenericScore();
    copy.copyFrom(this);
    copy._scoreText = this._scoreText;
    return copy;
  }
}

import { TimeDuration } from '../time/time-duration';
import { TimeBehavior } from './time-behavior';
