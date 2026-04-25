/**
 * BSBLabel — static text label.
 * Does not contribute replacement values — visual only.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';
import { loadFontFromXML, type BSBFont } from './bsb-knob';

export class BSBLabel extends BSBWidget {
  label = '';
  font: BSBFont = { name: 'Roboto', size: 12, style: 0 };

  override collectReplacements(_unit: BSBCompilationUnit): void {
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const text = data.getTextString('label');
    if (text !== null) this.label = text;
    const fontElem = data.getElement('font');
    if (fontElem) this.font = loadFontFromXML(fontElem);
  }
}
