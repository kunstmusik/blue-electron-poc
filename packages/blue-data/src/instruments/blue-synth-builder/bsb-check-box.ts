/**
 * BSBCheckBox — binary on/off control.
 * Mirrors the Java BSBCheckBox class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';

export class BSBCheckBox extends BSBWidget {
  label = 'label';
  selected = false;
  randomizable = true;

  override collectReplacements(unit: BSBCompilationUnit): void {
    unit.addReplacementValue(this.objectName, this.selected ? '1' : '0');
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const lbl = data.getTextString('label');
    if (lbl !== null) this.label = lbl;
    const sel = data.getTextString('selected');
    if (sel !== null) this.selected = sel === 'true';
    const rand = data.getElement('randomizable');
    if (rand) this.randomizable = rand.getTextString() === 'true';
  }
}
