/**
 * Comment — a non-generating SoundObject for score annotations.
 * Mirrors the Java Comment class.
 */
import { AbstractSoundObject } from './abstract-sound-object';
import { NoteList } from './note-list';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';
import { TimeBehavior } from './time-behavior';
import { TimeDuration } from '../time/time-duration';

export class Comment extends AbstractSoundObject {
  private _text = '';

  getText(): string { return this._text; }
  setText(text: string): void { this._text = text; }

  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    // Comments don't generate notes
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'Comment');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('text').setText(this._text);
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): Comment {
    const obj = new Comment();
    obj.setName(data.getTextString('name') ?? 'Comment');
    const dur = data.getTextString('subjectiveDuration');
    if (dur) obj.setSubjectiveDuration(TimeDuration.beats(parseFloat(dur)));
    const text = data.getTextString('text');
    if (text !== null) obj.setText(text);
    return obj;
  }

  override deepCopy(): SoundObject {
    const copy = new Comment();
    copy.copyFrom(this);
    copy._text = this._text;
    return copy;
  }
}
