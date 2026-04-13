/**
 * BSBWidget — abstract base for all BlueSynthBuilder widgets.
 * Mirrors the Java BSBObject class.
 *
 * Each widget contributes a replacement value during compilation:
 *   objectName → value (or automation variable name)
 */
import { Element } from '../../serialization/xml-reader';
import { BSBCompilationUnit } from './bsb-compilation-unit';

export abstract class BSBWidget {
  objectName = '';
  x = 0;
  y = 0;
  value = 0;
  minimum = 0;
  maximum = 1;
  parameterName: string | null = null; // Links to automation parameter

  /**
   * Collect this widget's replacement value into the compilation unit.
   * If parameterName is set, uses the automation variable name;
   * otherwise uses the raw numeric value.
   */
  collectReplacements(unit: BSBCompilationUnit): void {
    const replacementValue = this.parameterName ?? this.value.toString();
    unit.addReplacementValue(this.objectName, replacementValue);
  }

  /**
   * Load widget properties from XML.
   * Subclasses override to load type-specific properties.
   */
  loadFromXMLCommon(data: Element): void {
    const objName = data.getTextString('objectName');
    if (objName) this.objectName = objName;
    const x = data.getTextString('x');
    if (x) this.x = parseInt(x, 10);
    const y = data.getTextString('y');
    if (y) this.y = parseInt(y, 10);
    const val = data.getTextString('value');
    if (val) this.value = parseFloat(val);
    const min = data.getTextString('minimum');
    if (min) this.minimum = parseFloat(min);
    const max = data.getTextString('maximum');
    if (max) this.maximum = parseFloat(max);
    const param = data.getTextString('parameterName');
    if (param) this.parameterName = param;
  }
}
