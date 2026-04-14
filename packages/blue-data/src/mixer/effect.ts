/**
 * Effect — a mixer effect with BSB-like code compilation.
 * Mirrors the Java Effect class.
 *
 * Effects have code with `<objectName>` placeholders (like BSB instruments),
 * a graphic interface with widgets, and a parameterList.
 * During CSD generation, effects produce UDOs (blueEffectN).
 */
import { Element } from '../serialization/xml-reader';
import { BlueDataObject } from '../blue-data-object';
import { Parameter, AutomationCurve } from '../automation/parameter';
import { BSBGraphicInterface } from '../instruments/blue-synth-builder/bsb-graphic-interface';
import { BSBCompilationUnit } from '../instruments/blue-synth-builder/bsb-compilation-unit';

export class Effect implements BlueDataObject {
  private _name = '';
  private _enabled = true;
  private _numIns = 2;
  private _numOuts = 2;
  private _code = '';
  private _graphicInterface = new BSBGraphicInterface();
  private _parameters: Parameter[] = [];

  getName(): string { return this._name; }
  setName(name: string): void { this._name = name; }

  isEnabled(): boolean { return this._enabled; }
  setEnabled(enabled: boolean): void { this._enabled = enabled; }

  getNumIns(): number { return this._numIns; }
  setNumIns(n: number): void { this._numIns = n; }

  getNumOuts(): number { return this._numOuts; }
  setNumOuts(n: number): void { this._numOuts = n; }

  getCode(): string { return this._code; }
  setCode(code: string): void { this._code = code; }

  getGraphicInterface(): BSBGraphicInterface { return this._graphicInterface; }

  getParameters(): Parameter[] { return [...this._parameters]; }

  /**
   * Generate a UDO from this effect's code.
   * The effect code is compiled (BSB widget replacement) then wrapped in:
   *   opcode blueEffectN,aa,aa ; EffectName
   *   ain1,ain2 xin
   *   <compiled code>
   *   xout aout1,aout2
   *   endop
   */
  generateUDO(effectId: number, parameters?: Parameter[]): string {
    if (!this._code) return '';

    // Compile BSB widget replacements
    const unit = new BSBCompilationUnit();
    this._graphicInterface.collectReplacements(unit, parameters);
    let compiledCode = unit.replaceBSBValues(this._code);

    // If GI didn't load (async), fall back to parameter-based replacement
    if (compiledCode.includes('<')) {
      compiledCode = this.compileWithParameters(compiledCode, parameters);
    }

    const inTypes = 'a'.repeat(this._numIns);
    const outTypes = 'a'.repeat(this._numOuts);

    const inArgs = [];
    for (let i = 0; i < this._numIns; i++) inArgs.push(`ain${i + 1}`);
    const outArgs = [];
    for (let i = 0; i < this._numOuts; i++) outArgs.push(`aout${i + 1}`);

    const lines: string[] = [];
    lines.push(`opcode blueEffect${effectId},${outTypes},${inTypes} ; ${this._name}`);
    lines.push('');
    lines.push(`${inArgs.join(',')}\txin`);
    lines.push('');
    lines.push(compiledCode);
    lines.push('');
    lines.push(`xout\t${outArgs.join(',')}`);
    lines.push('');
    lines.push('');
    lines.push('\tendop');

    return lines.join('\n');
  }

  /**
   * Compile effect code using its own parameter list as fallback.
   * Replaces `<paramName>` tokens with parameter values or compilation variable names.
   */
  private compileWithParameters(code: string, externalParams?: Parameter[]): string {
    let result = code;

    // First try external parameters (for compilation variable names)
    if (externalParams) {
      for (const param of externalParams) {
        const name = param.getName();
        const varName = param.getCompilationVarName();
        if (name && varName) {
          result = result.replaceAll(`<${name}>`, varName);
        }
      }
    }

    // Fall back to this effect's own parameters for remaining tokens
    for (const param of this._parameters) {
      const name = param.getName();
      const varName = param.getCompilationVarName();
      if (name && varName) {
        result = result.replaceAll(`<${name}>`, varName);
      } else if (name) {
        result = result.replaceAll(`<${name}>`, param.getFixedValue().toString());
      }
    }

    return result;
  }

  saveAsXML(): Element {
    const elem = new Element('effect');
    elem.addElement('name').setText(this._name);
    elem.addElement('enabled').setText(this._enabled.toString());
    elem.addElement('numIns').setText(this._numIns.toString());
    elem.addElement('numOuts').setText(this._numOuts.toString());
    if (this._code) elem.addElement('code').setText(this._code);
    // graphicInterface would be saved here if needed
    return elem;
  }

  static loadFromXML(data: Element): Effect {
    const effect = new Effect();

    const name = data.getTextString('name');
    if (name) effect._name = name;

    const enabled = data.getTextString('enabled');
    if (enabled !== null) effect._enabled = enabled !== 'false';

    // Also check attribute format
    const enabledAttr = data.getAttribute('enabled');
    if (enabledAttr !== null) effect._enabled = enabledAttr !== 'false';

    const numIns = data.getTextString('numIns');
    if (numIns) effect._numIns = parseInt(numIns, 10);

    const numOuts = data.getTextString('numOuts');
    if (numOuts) effect._numOuts = parseInt(numOuts, 10);

    const code = data.getTextString('code');
    if (code) effect._code = code;

    // Load graphic interface (BSB widgets for parameter knobs)
    const giElem = data.getElement('graphicInterface');
    if (giElem) {
      // Load async but we need sync — BSBGraphicInterface.loadFromXML is async
      // We'll call it and let it resolve (widgets may not fully load for effects,
      // but we primarily need the widget objectNames for BSB compilation)
      effect._graphicInterface.loadFromXML(giElem).catch(() => {});
    }

    // Load parameter list
    const paramListElem = data.getElement('parameterList');
    if (paramListElem) {
      effect._parameters = Effect._loadParameters(paramListElem);
    }

    return effect;
  }

  /**
   * Load parameters from <parameterList> XML.
   */
  private static _loadParameters(data: Element): Parameter[] {
    const parameters: Parameter[] = [];
    const paramElems = data.getElements('parameter');

    while (paramElems.hasMoreElements()) {
      const elem = paramElems.next();
      const param = new Parameter();

      const name = elem.getAttribute('name');
      if (name) param.setName(name);

      const value = elem.getAttribute('value');
      if (value) param.setFixedValue(parseFloat(value));

      const min = elem.getAttribute('min');
      const max = elem.getAttribute('max');
      if (min) param.setMinimum(parseFloat(min));
      if (max) param.setMaximum(parseFloat(max));

      const autoEnabled = elem.getAttribute('automationEnabled');
      if (autoEnabled !== null) param.setAutomationEnabled(autoEnabled === 'true');

      // Load line/points if present
      const lineElem = elem.getElement('line');
      if (lineElem) {
        const curve = lineElem.getAttribute('curveType');
        if (curve === 'CONSTANT') param.setCurve(AutomationCurve.STEP);
        else if (curve === 'LINEAR') param.setCurve(AutomationCurve.LINEAR);

        const points = lineElem.getElements('linePoint');
        while (points.hasMoreElements()) {
          const pt = points.next();
          const x = parseFloat(pt.getAttribute('x') ?? '0');
          const y = parseFloat(pt.getAttribute('y') ?? '0');
          param.addPoint(x, y);
        }
      }

      parameters.push(param);
    }

    return parameters;
  }

  deepCopy(): BlueDataObject {
    const copy = new Effect();
    copy._name = this._name;
    copy._enabled = this._enabled;
    copy._numIns = this._numIns;
    copy._numOuts = this._numOuts;
    copy._code = this._code;
    return copy;
  }
}
