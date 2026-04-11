/**
 * GenericInstrument — an instrument defined by raw Csound orchestra text.
 * Mirrors the Java GenericInstrument class.
 */
import { Instrument } from './instrument';
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap } from '../serialization/obj-ref-map';
import { DeepCopyable } from '../deep-copyable';

export class GenericInstrument extends Instrument implements DeepCopyable<GenericInstrument> {
  private _text = '';
  private _globalOrc = '';
  private _globalSco = '';

  constructor() {
    super();
    this.setName('GenericInstrument');
  }

  getText(): string {
    return this._text;
  }

  setText(text: string): void {
    this._text = text;
  }

  override generateGlobalOrc(): string | null {
    return this._globalOrc || null;
  }

  override generateGlobalSco(): string | null {
    return this._globalSco || null;
  }

  override generateInstrument(): string {
    return this._text;
  }

  // ─── XML ───

  saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('genericInstrument');
    elem.setAttribute('name', this._name);
    elem.setAttribute('enabled', this._enabled.toString());
    elem.addElement('text').setText(this._text);
    if (this._globalOrc) elem.addElement('globalOrc').setText(this._globalOrc);
    if (this._globalSco) elem.addElement('globalSco').setText(this._globalSco);
    return elem;
  }

  static loadFromXML(data: Element): GenericInstrument {
    const instr = new GenericInstrument();
    instr.setName(data.getAttribute('name') ?? '');
    instr.setEnabled(data.getAttribute('enabled') !== 'false');
    instr.setText(data.getTextString('text') ?? '');
    const go = data.getTextString('globalOrc');
    if (go) (instr as any)._globalOrc = go;
    const gs = data.getTextString('globalSco');
    if (gs) (instr as any)._globalSco = gs;
    return instr;
  }

  deepCopy(): GenericInstrument {
    const copy = new GenericInstrument();
    copy._name = this._name;
    copy._enabled = this._enabled;
    copy._text = this._text;
    copy._globalOrc = this._globalOrc;
    copy._globalSco = this._globalSco;
    return copy;
  }
}
