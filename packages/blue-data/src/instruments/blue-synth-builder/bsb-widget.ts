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
  comment = '';
  automationAllowed = true;
  value = 0;
  minimum = 0;
  maximum = 1;
  parameterName: string | null = null;
  id = '';

  getPresetValue(): string {
    return `ver2:${this.value}`;
  }

  setPresetValue(val: string): void {
    const parsed = parseFloat(val.replace(/^ver2:/, ""));
    if (Number.isFinite(parsed)) {
      this.setValue(parsed);
    }
  }

  /**
   * Set the numeric value of this widget. 
   * Subclasses should override this to sync internal state (e.g. selected, selectedIndex).
   */
  setValue(val: number): void {
    this.value = val;
  }

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
  static loadCommonFromXML(widget: BSBWidget, data: Element): void {
    const objName = data.getTextString('objectName');
    if (objName) widget.objectName = objName;
    const x = data.getTextString('x');
    if (x) widget.x = parseInt(x, 10);
    const y = data.getTextString('y');
    if (y) widget.y = parseInt(y, 10);
    const comment = data.getTextString('comment');
    if (comment) widget.comment = comment;
    const autoAllowedElem = data.getElement('automationAllowed');
    if (autoAllowedElem) {
      widget.automationAllowed = autoAllowedElem.getTextString() === 'true';
    } else {
      widget.automationAllowed = false;
    }
    const val = data.getTextString('value');
    if (val) widget.value = parseFloat(val);
    const min = data.getTextString('minimum');
    if (min) widget.minimum = parseFloat(min);
    const max = data.getTextString('maximum');
    if (max) widget.maximum = parseFloat(max);
    const param = data.getTextString('parameterName');
    if (param) widget.parameterName = param;
  }

  loadFromXMLCommon(data: Element): void {
    BSBWidget.loadCommonFromXML(this, data);
  }
}
