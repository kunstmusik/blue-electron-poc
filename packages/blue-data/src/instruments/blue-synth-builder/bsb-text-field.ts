/**
 * BSBTextField — text input field.
 * Extends BSBObject directly (not automatable).
 * Contributes its text value as a replacement.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';

export class BSBTextField extends BSBWidget {
  textValue = '';
  textFieldWidth = 100;

  override collectReplacements(unit: BSBCompilationUnit): void {
    unit.addReplacementValue(this.objectName, this.textValue);
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const text = data.getTextString('value');
    if (text !== null) this.textValue = text;
    const tw = data.getTextString('textFieldWidth');
    if (tw) this.textFieldWidth = parseInt(tw, 10);
  }
}
