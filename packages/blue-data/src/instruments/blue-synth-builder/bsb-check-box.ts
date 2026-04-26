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

  override getPresetValue(): string {
    return `ver2:${this.selected ? 1 : 0}`;
  }

  override setPresetValue(val: string): void {
    if (val.startsWith("ver2:")) {
      const parsed = parseFloat(val.substring(5));
      if (Number.isFinite(parsed)) {
        this.setValue(parsed);
      }
    } else {
      // Legacy Java Blue: "true" or "false"
      this.setValue(val.toLowerCase() === "true" ? 1 : 0);
    }
  }

  override setValue(val: number): void {
    this.value = val;
    this.selected = val > 0;
  }

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

  randomize(): void {
    if (!this.randomizable) return;
    this.selected = Math.random() >= 0.5;
  }
}
