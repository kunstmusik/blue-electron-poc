/**
 * BSBTextField — text input field.
 * Extends BSBObject directly (not automatable).
 * Contributes its text value as a replacement.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';

export class BSBTextField extends BSBWidget {
  textFieldValue = '';

  override collectReplacements(unit: import('./bsb-compilation-unit').BSBCompilationUnit): void {
    unit.addReplacementValue(this.objectName, this.textFieldValue);
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const text = data.getTextString('textFieldValue');
    if (text) this.textFieldValue = text;
  }
}
