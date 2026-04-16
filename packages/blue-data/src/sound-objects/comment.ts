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
import { initBasicFromXML } from './sound-object-utilities';

export class Comment extends AbstractSoundObject {
  private _commentText = '';

  constructor(other?: Comment) {
    super();
    if (other) {
      this.copyFrom(other);
      this._commentText = other._commentText;
    }
  }

  getText(): string { return this._commentText; }
  setText(text: string): void { this._commentText = text; }


  override getTimeBehavior(): TimeBehavior {
    return TimeBehavior.NOT_SUPPORTED;
  }

  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'Comment');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('commentText').setText(this._commentText);
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): Comment {
    const obj = new Comment();
    initBasicFromXML(obj, data);

    const text = data.getTextString('commentText');
    if (text !== null) obj._commentText = text;

    return obj;
  }

  override deepCopy(): SoundObject {
    return new Comment(this);
  }
}
