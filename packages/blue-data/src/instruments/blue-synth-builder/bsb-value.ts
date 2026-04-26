/**
 * BSBValue — numeric display with editable value.
 * Mirrors the Java BSBValue class.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';
import { formatBlueNumber } from '../../utilities/number-format';

export class BSBValue extends BSBWidget {
  defaultValue = 0;

  override getPresetValue(): string {
    return `ver2:${this.defaultValue}`;
  }

  override setPresetValue(val: string): void {
    const parsed = parseFloat(val.replace(/^ver2:/, ""));
    if (Number.isFinite(parsed)) {
      this.setValue(parsed);
    }
  }

  override setValue(val: number): void {
    this.value = val;
    this.defaultValue = val;
  }

  override collectReplacements(
    unit: BSBCompilationUnit,
    parameters?: import('../../automation/parameter').Parameter[],
  ): void {
    if (this.objectName && parameters) {
      const param = parameters.find(p => p.getName() === this.objectName);
      if (param && param.getCompilationVarName()) {
        unit.addReplacementValue(this.objectName, param.getCompilationVarName()!);
        return;
      }
    }
    unit.addReplacementValue(this.objectName, formatBlueNumber(this.defaultValue));
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const dv = data.getTextString('defaultValue');
    if (dv) this.defaultValue = parseFloat(dv);
    const min = data.getTextString('minimum');
    if (min) this.minimum = parseFloat(min);
    const max = data.getTextString('maximum');
    if (max) this.maximum = parseFloat(max);
  }
}
