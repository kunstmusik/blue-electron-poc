import { AbstractSoundObject } from './abstract-sound-object';
import { SoundObjectException } from './sound-object-exception';
import { NoteList } from './note-list';
import { Note } from './note';
import { TimeContext } from '../time/time-context';
import { CompileData } from '../compile-data';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { SoundObject } from './sound-object';
import { initBasicFromXML } from './sound-object-utilities';
import { applyNoteProcessorChain, applyTimeBehavior, setScoreStart } from '../utilities/score';

function parseScoreText(scoreText: string): NoteList {
  const notes = new NoteList();
  const lines = scoreText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 3) continue;
    const note = new Note();
    let instr = parts[0];
    if (instr.startsWith('i') || instr.startsWith('I')) {
      instr = instr.substring(1);
    }
    note.setPField(instr, 1);
    note.setStartTime(parseFloat(parts[1]));
    note.setSubjectiveDuration(parseFloat(parts[2]));
    for (let i = 3; i < parts.length; i++) {
      note.setPField(parts[i], i + 1);
    }
    notes.push(note);
  }
  return notes;
}

let vmModule: typeof import('vm') | null = null;

try {
  vmModule = require('vm');
} catch {
  // vm not available (browser environment)
}

type VmContext = { context: Record<string, unknown>; isVm: boolean };

const sharedContextCache = new WeakMap<object, VmContext>();

function getSharedContext(compilerData: CompileData): VmContext {
  const existing = sharedContextCache.get(compilerData);
  if (existing) return existing;

  let context: VmContext;
  if (vmModule) {
    const sandbox: Record<string, unknown> = {};
    const vmContext = vmModule.createContext(sandbox);
    context = { context: vmContext as Record<string, unknown>, isVm: true };
  } else {
    context = { context: {}, isVm: false };
  }
  sharedContextCache.set(compilerData, context);
  return context;
}

function executeInContext(code: string, ctx: VmContext): void {
  if (ctx.isVm && vmModule) {
    vmModule.runInContext(code, ctx.context as import('vm').Context);
  } else {
    const fn = new Function(code);
    fn.call(ctx.context);
  }
}

function executeJavaScriptCode(
  code: string,
  duration: number,
  compileData: CompileData,
): string {
  try {
    const ctx = getSharedContext(compileData);

    executeInContext(`var blueDuration = ${duration}; var score = '';`, ctx);
    executeInContext(code, ctx);

    return String(ctx.context.score ?? '');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new SoundObjectException(`JavaScript execution error: ${msg}`, e as Error);
  }
}

export class JavaScriptObject extends AbstractSoundObject {
  private _javaScriptCode = '';
  private _onLoadProcessable = false;

  constructor() {
    super();
    this.setName('JavaScriptObject');
  }

  getJavaScriptCode(): string { return this._javaScriptCode; }
  setJavaScriptCode(code: string): void { this._javaScriptCode = code; }

  isOnLoadProcessable(): boolean { return this._onLoadProcessable; }
  setOnLoadProcessable(val: boolean): void { this._onLoadProcessable = val; }

  override generateForCSD(
    context: TimeContext,
    compileData: CompileData,
    _startTime: number,
    _endTime: number,
  ): NoteList {
    const duration = this._subjectiveDuration.toBeats(context);
    const scoreText = executeJavaScriptCode(this._javaScriptCode, duration, compileData);
    const noteList = parseScoreText(scoreText);
    const processed = applyNoteProcessorChain(noteList, this.getNoteProcessorChain());
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

  // ─── XML ───

  override saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('soundObject');
    elem.setAttribute('type', 'JavaScriptObject');

    elem.addElement('name').setText(this._name);
    elem.addElement('startTime').setText(this._startTime.getValue().toString());
    elem.addElement('subjectiveDuration').setText(this._subjectiveDuration.getValue().toString());
    elem.addElement('timeBehavior').setText(this._timeBehavior);
    elem.addElement('backgroundColor').setText(this._backgroundColor.toString());
    elem.addElement('javaScriptCode').setText(this._javaScriptCode);
    elem.setAttribute('onLoadProcessable', this._onLoadProcessable.toString());

    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): JavaScriptObject {
    const obj = new JavaScriptObject();
    initBasicFromXML(obj, data);

    const code = data.getTextString('javaScriptCode');
    if (code !== null) obj.setJavaScriptCode(code);

    const olp = data.getAttribute('onLoadProcessable');
    if (olp) obj.setOnLoadProcessable(olp.toLowerCase() === 'true');

    return obj;
  }

  override deepCopy(): SoundObject {
    const copy = new JavaScriptObject();
    copy.copyFrom(this);
    copy._javaScriptCode = this._javaScriptCode;
    copy._onLoadProcessable = this._onLoadProcessable;
    return copy;
  }
}
