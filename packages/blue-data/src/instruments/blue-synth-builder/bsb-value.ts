/**
 * BSBValue — numeric display with editable value.
 * Mirrors the Java BSBValue class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBValue extends BSBWidget {
  precision = 4; // Number of decimal places

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const p = data.getTextString('precision');
    if (p) this.precision = parseInt(p, 10);
  }
}
