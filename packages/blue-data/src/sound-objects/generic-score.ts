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
import { initBasicFromXML } from './sound-object-utilities';
import { applyNoteProcessorChain, applyTimeBehavior, getNotes, setScoreStart } from '../utilities/score';

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
    context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    const noteList = getNotes(this._scoreText);

    const processed = applyNoteProcessorChain(noteList, this.getNoteProcessorChain());
    const duration = this.getSubjectiveDuration().toBeats(context);
    const startTime = this.getStartTime().toBeats(context);
    const repeatPoint = this.getRepeatPoint();
    const repeatPointBeats = repeatPoint ? repeatPoint.toBeats(context) : -1;

    applyTimeBehavior(
      processed,
      this.getTimeBehavior(),
      duration,
      repeatPointBeats,
    );
    setScoreStart(processed, startTime);

    return processed;
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
    initBasicFromXML(sObj, data);

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
