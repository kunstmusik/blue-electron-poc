/**
 * GlobalOrcSco — holds global orchestra and score code for CSD generation.
 * Mirrors the Java GlobalOrcSco class.
 *
 * Global orc/sco is code that applies to the entire CSD, not tied to any
 * specific instrument or sound object.
 */
import { Element } from './serialization/xml-reader';

export class GlobalOrcSco {
  private _globalOrc = '';
  private _globalSco = '';

  constructor(other?: GlobalOrcSco) {
    if (other) {
      this._globalOrc = other._globalOrc;
      this._globalSco = other._globalSco;
    }
  }

  getGlobalOrc(): string {
    return this._globalOrc;
  }

  setGlobalOrc(orc: string): void {
    this._globalOrc = orc;
  }

  getGlobalSco(): string {
    return this._globalSco;
  }

  setGlobalSco(sco: string): void {
    this._globalSco = sco;
  }

  // ─── XML ───

  saveAsXML(): Element {
    const elem = new Element('globalOrcSco');
    if (this._globalOrc) elem.addElement('globalOrc').setText(this._globalOrc);
    if (this._globalSco) elem.addElement('globalSco').setText(this._globalSco);
    return elem;
  }

  static loadFromXML(data: Element): GlobalOrcSco {
    const gos = new GlobalOrcSco();
    const orc = data.getTextString('globalOrc');
    if (orc) gos._globalOrc = orc;
    const sco = data.getTextString('globalSco');
    if (sco) gos._globalSco = sco;
    return gos;
  }
}
