/**
 * FrozenSoundObject — a sound object that has been "frozen" into an audio file.
 * Mirrors the Java FrozenSoundObject class.
 *
 * Phase 11: Data preservation (load/save XML). Full frozen sound object
 * CSD generation requires the frozen wave file rendering system.
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
import { TimePosition } from '../time/time-position';

export class FrozenSoundObject extends AbstractSoundObject {
  private _frozenSoundObject: SoundObject | null = null;
  private _frozenWaveFileName = '';
  private _numChannels = 0;

  constructor(other?: FrozenSoundObject) {
    super();
    if (other) {
      this.copyFrom(other);
      this._frozenWaveFileName = other._frozenWaveFileName;
      this._numChannels = other._numChannels;
      // Note: _frozenSoundObject is deep-copied like Java
      this._frozenSoundObject = other._frozenSoundObject?.deepCopy() ?? null;
    }
  }

  getFrozenSoundObject(): SoundObject | null { return this._frozenSoundObject; }
  setFrozenSoundObject(sObj: SoundObject | null): void { this._frozenSoundObject = sObj; }

  getFrozenWaveFileName(): string { return this._frozenWaveFileName; }
  setFrozenWaveFileName(name: string): void { this._frozenWaveFileName = name; }

  getNumChannels(): number { return this._numChannels; }
  setNumChannels(n: number): void { this._numChannels = n; }


  override getTimeBehavior(): TimeBehavior {
    return TimeBehavior.NOT_SUPPORTED;
  }

  override generateForCSD(
    _context: TimeContext,
    _compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    console.warn('FrozenSoundObject.generateForCSD skipped: requires frozen wave file rendering');
    return new NoteList();
  }

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'FrozenSoundObject');
    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('frozenWaveFileName').setText(this._frozenWaveFileName);
    elem.addElement('numChannels').setText(this._numChannels.toString());
    return elem;
  }

  static loadFromXML(data: Element, objRefMap?: ObjRefLoadMap): FrozenSoundObject {
    const obj = new FrozenSoundObject();
    obj.setName(data.getTextString('name') ?? 'FrozenSoundObject');

    const startStr = data.getTextString('startTime');
    if (startStr) obj._startTime = TimePosition.beats(parseFloat(startStr));

    const dur = data.getTextString('subjectiveDuration');
    if (dur) obj._subjectiveDuration = TimeDuration.beats(parseFloat(dur));

    const tb = data.getTextString('timeBehavior');
    if (tb && Object.values(TimeBehavior).includes(tb as TimeBehavior)) {
      obj._timeBehavior = tb as TimeBehavior;
    }

    const color = data.getTextString('backgroundColor');
    if (color) obj._backgroundColor = parseInt(color, 10);

    const frozenFile = data.getTextString('frozenWaveFileName');
    if (frozenFile !== null) obj._frozenWaveFileName = frozenFile;

    const channels = data.getTextString('numChannels');
    if (channels) obj._numChannels = parseInt(channels, 10);

    // The frozen sound object reference would be resolved from objRefMap
    // if it was stored with an ID — for now, it's preserved as null

    return obj;
  }

  override deepCopy(): SoundObject {
    return new FrozenSoundObject(this);
  }
}
