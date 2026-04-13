/**
 * BlueSynthBuilder — instrument implementation with BSB widget system.
 * Mirrors the Java BlueSynthBuilder class.
 *
 * Generates CSD orchestra code from an instrumentText template
 * with `<objectName>` placeholders replaced by BSB widget values.
 */
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { BSBCompilationUnit } from './blue-synth-builder/bsb-compilation-unit';
import { BSBGraphicInterface } from './blue-synth-builder/bsb-graphic-interface';

/**
 * Interface for BSB instruments (implements the Instrument contract).
 */
export interface BSBInstrument {
  generateInstrument(): string;
  generateGlobalOrc(): string | null;
  generateGlobalSco(): string | null;
  getName(): string;
}

export class BlueSynthBuilder implements BSBInstrument {
  private _name = '';
  private _instrumentText = '';
  private _alwaysOnInstrumentText = '';
  private _globalOrc = '';
  private _globalSco = '';
  private _graphicInterface = new BSBGraphicInterface();
  private _editEnabled = true;

  constructor(other?: BlueSynthBuilder) {
    if (other) {
      this._name = other._name;
      this._instrumentText = other._instrumentText;
      this._alwaysOnInstrumentText = other._alwaysOnInstrumentText;
      this._globalOrc = other._globalOrc;
      this._globalSco = other._globalSco;
      this._editEnabled = other._editEnabled;
      // Deep copy graphic interface
      this._graphicInterface = new BSBGraphicInterface();
    }
  }

  getName(): string { return this._name; }
  setName(name: string): void { this._name = name; }

  getInstrumentText(): string { return this._instrumentText; }
  setInstrumentText(text: string): void { this._instrumentText = text; }

  getAlwaysOnInstrumentText(): string { return this._alwaysOnInstrumentText; }
  setAlwaysOnInstrumentText(text: string): void { this._alwaysOnInstrumentText = text; }

  getGlobalOrc(): string { return this._globalOrc; }
  setGlobalOrc(orc: string): void { this._globalOrc = orc; }

  getGlobalSco(): string { return this._globalSco; }
  setGlobalSco(sco: string): void { this._globalSco = sco; }

  getGraphicInterface(): BSBGraphicInterface { return this._graphicInterface; }
  setGraphicInterface(gi: BSBGraphicInterface): void { this._graphicInterface = gi; }

  isEditEnabled(): boolean { return this._editEnabled; }
  setEditEnabled(enabled: boolean): void { this._editEnabled = enabled; }

  /**
   * Generate the instrument text with all BSB widget values substituted.
   * This is the core compilation step:
   * 1. Collect all widget values into a BSBCompilationUnit
   * 2. Replace all <objectName> tokens with their values
   */
  generateInstrument(): string {
    if (!this._instrumentText) return '';

    const unit = new BSBCompilationUnit();
    this._graphicInterface.collectReplacements(unit);
    return unit.replaceBSBValues(this._instrumentText);
  }

  generateGlobalOrc(): string | null {
    return this._globalOrc || null;
  }

  generateGlobalSco(): string | null {
    return this._globalSco || null;
  }

  // ─── XML Serialization ───

  saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('instrument');
    elem.setAttribute('type', 'blue.orchestra.BlueSynthBuilder');
    elem.setAttribute('editEnabled', this._editEnabled.toString());
    if (this._name) elem.addElement('name').setText(this._name);
    if (this._instrumentText) elem.addElement('instrumentText').setText(this._instrumentText);
    if (this._alwaysOnInstrumentText) {
      elem.addElement('alwaysOnInstrumentText').setText(this._alwaysOnInstrumentText);
    }
    if (this._globalOrc) elem.addElement('globalOrc').setText(this._globalOrc);
    if (this._globalSco) elem.addElement('globalSco').setText(this._globalSco);
    // graphicInterface would be saved here
    return elem;
  }

  static loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): BlueSynthBuilder {
    const bsb = new BlueSynthBuilder();

    const editEnabled = data.getAttribute('editEnabled');
    if (editEnabled !== null) bsb._editEnabled = editEnabled === 'true';

    const name = data.getTextString('name');
    if (name) bsb._name = name;

    const instrText = data.getTextString('instrumentText');
    if (instrText) bsb._instrumentText = instrText;

    const alwaysOnText = data.getTextString('alwaysOnInstrumentText');
    if (alwaysOnText) bsb._alwaysOnInstrumentText = alwaysOnText;

    const globalOrc = data.getTextString('globalOrc');
    if (globalOrc) bsb._globalOrc = globalOrc;

    const globalSco = data.getTextString('globalSco');
    if (globalSco) bsb._globalSco = globalSco;

    // Load graphic interface
    const giElem = data.getElement('graphicInterface');
    if (giElem) {
      bsb._graphicInterface.loadFromXML(giElem);
    }

    return bsb;
  }
}
