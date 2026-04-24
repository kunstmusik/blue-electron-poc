/**
 * BSBWidget — abstract base for all BlueSynthBuilder widgets.
 * Mirrors the Java BSBObject class.
 *
 * Each widget contributes a replacement value during compilation:
 *   objectName → value (or automation variable name)
 */
import { Element } from '../../serialization/xml-reader';
import { BSBCompilationUnit } from './bsb-compilation-unit';
import { Parameter } from '../../automation/parameter';
import { formatBlueNumber } from '../../utilities/number-format';

export abstract class BSBWidget {
  objectName = '';
  x = 0;
  y = 0;
  value = 0;
  minimum = 0;
  maximum = 1;
  parameterName: string | null = null;
  id = ''; // Links to automation parameter

  /**
   * Collect this widget's replacement value into the compilation unit.
   * Looks up the parameter by this widget's objectName in the parameters list.
   * If found with a compilationVarName, uses that (e.g. "gk_blue_auto0");
   * otherwise uses the raw numeric value.
   *
   * This matches the Java BSBObject.setupForCompilation() logic:
   *   Parameter param = parameters.getParameter(this.getObjectName());
   *   if (param != null && param.getCompilationVarName() != null) {
   *       compilationUnit.addReplacementValue(getObjectName(), param.getCompilationVarName());
   *   }
   */
  collectReplacements(unit: BSBCompilationUnit, parameters?: Parameter[]): void {
    if (this.objectName && parameters) {
      const param = parameters.find(p => p.getName() === this.objectName);
      if (param && param.getCompilationVarName()) {
        unit.addReplacementValue(this.objectName, param.getCompilationVarName()!);
        return;
      }
    }
    unit.addReplacementValue(this.objectName, formatBlueNumber(this.value));
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
