/**
 * BlueSynthBuilder — instrument implementation with BSB widget system.
 * Mirrors the Java BlueSynthBuilder class.
 *
 * Generates CSD orchestra code from an instrumentText template
 * with `<objectName>` placeholders replaced by BSB widget values.
 */
import { Element } from '../serialization/xml-reader';
import { ObjRefSaveMap, ObjRefLoadMap } from '../serialization/obj-ref-map';
import { Instrument } from './instrument';
import { BSBCompilationUnit } from './blue-synth-builder/bsb-compilation-unit';
import { BSBGraphicInterface } from './blue-synth-builder/bsb-graphic-interface';
import { Parameter, AutomationCurve } from '../automation/parameter';
import { StringChannel, BSBFileSelector } from './blue-synth-builder/bsb-file-selector';
import { OpcodeList } from '../opcodes/opcode-list';

export class BlueSynthBuilder extends Instrument {
  private _instrumentText = '';
  private _alwaysOnInstrumentText = '';
  private _globalOrc = '';
  private _globalSco = '';
  private _graphicInterface = new BSBGraphicInterface();
  private _parameters: Parameter[] = [];
  private _opcodeList = new OpcodeList();

  constructor(other?: BlueSynthBuilder) {
    super();
    if (other) {
      this._name = other._name;
      this._instrumentText = other._instrumentText;
      this._alwaysOnInstrumentText = other._alwaysOnInstrumentText;
      this._globalOrc = other._globalOrc;
      this._globalSco = other._globalSco;
      this._editEnabled = other._editEnabled;
      // Deep copy graphic interface
      this._graphicInterface = new BSBGraphicInterface();
    }
  }

  private _editEnabled = true;

  getInstrumentText(): string { return this._instrumentText; }
  setInstrumentText(text: string): void { this._instrumentText = text; }

  getAlwaysOnInstrumentText(): string { return this._alwaysOnInstrumentText; }
  setAlwaysOnInstrumentText(text: string): void { this._alwaysOnInstrumentText = text; }

  getGlobalOrc(): string { return this._globalOrc; }
  setGlobalOrc(orc: string): void { this._globalOrc = orc; }

  getGlobalSco(): string { return this._globalSco; }
  setGlobalSco(sco: string): void { this._globalSco = sco; }

  getGraphicInterface(): BSBGraphicInterface { return this._graphicInterface; }
  setGraphicInterface(gi: BSBGraphicInterface): void { this._graphicInterface = gi; }

  isEditEnabled(): boolean { return this._editEnabled; }
  setEditEnabled(enabled: boolean): void { this._editEnabled = enabled; }

  /**
   * Generate the instrument text with all BSB widget values substituted.
   * This is the core compilation step:
   * 1. Collect all widget values into a BSBCompilationUnit
   * 2. Replace all <objectName> tokens with their values
   *
   * @param parameters - Optional parameter list for automation variable lookup.
   *   If provided, widgets with matching parameterName use the parameter's
   *   compilationVarName instead of their raw value.
   */
  generateInstrument(parameters?: Parameter[]): string {
    if (!this._instrumentText) return '';

    const unit = new BSBCompilationUnit();
    this._graphicInterface.collectReplacements(unit, parameters);
    return unit.replaceBSBValues(this._instrumentText);
  }

  generateGlobalOrc(): string | null {
    return this._globalOrc || null;
  }

  generateGlobalSco(): string | null {
    return this._globalSco || null;
  }

  /**
   * Get all automation parameters for this instrument.
   * Used by ParameterHelper to collect parameters from arrangement instruments.
   */
  getParameters(): Parameter[] {
    return [...this._parameters];
  }

  /**
   * Get all string channels from BSBFileSelector widgets.
   * Used by CSD generation to collect string channel init statements.
   */
  getStringChannels(): StringChannel[] {
    return this._collectStringChannels(this._graphicInterface.getRootGroup());
  }

  /**
   * Get the opcode list (UDOs) for this instrument.
   */
  getOpcodeList(): OpcodeList {
    return this._opcodeList;
  }

  /**
   * Recursively collect StringChannels from BSBGroup and its children.
   */
  private _collectStringChannels(group: any): StringChannel[] {
    const channels: StringChannel[] = [];
    if (!group) return channels;

    const getChildren = (group as any).getChildren;
    if (typeof getChildren !== 'function') return channels;

    for (const child of getChildren.call(group) || []) {
      if (child instanceof BSBFileSelector) {
        const sc = child.getStringChannel();
        if (sc) channels.push(sc);
      } else if (typeof (child as any).getChildren === 'function') {
        channels.push(...this._collectStringChannels(child));
      }
    }

    return channels;
  }

  // ─── XML Serialization ───

  saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element('instrument');
    elem.setAttribute('type', 'blue.orchestra.BlueSynthBuilder');
    elem.setAttribute('editEnabled', this._editEnabled.toString());
    if (this._name) elem.addElement('name').setText(this._name);
    if (this._instrumentText) elem.addElement('instrumentText').setText(this._instrumentText);
    if (this._alwaysOnInstrumentText) {
      elem.addElement('alwaysOnInstrumentText').setText(this._alwaysOnInstrumentText);
    }
    if (this._globalOrc) elem.addElement('globalOrc').setText(this._globalOrc);
    if (this._globalSco) elem.addElement('globalSco').setText(this._globalSco);
    // graphicInterface would be saved here
    return elem;
  }

  static async loadFromXML(data: Element, _objRefMap?: ObjRefLoadMap): Promise<BlueSynthBuilder> {
    const bsb = new BlueSynthBuilder();

    const editEnabled = data.getAttribute('editEnabled');
    if (editEnabled !== null) bsb._editEnabled = editEnabled === 'true';

    const name = data.getTextString('name');
    if (name) bsb._name = name;

    const instrText = data.getTextString('instrumentText');
    if (instrText) bsb._instrumentText = instrText;

    const alwaysOnText = data.getTextString('alwaysOnInstrumentText');
    if (alwaysOnText) bsb._alwaysOnInstrumentText = alwaysOnText;

    const globalOrc = data.getTextString('globalOrc');
    if (globalOrc) bsb._globalOrc = globalOrc;

    const globalSco = data.getTextString('globalSco');
    if (globalSco) bsb._globalSco = globalSco;

    // Load graphic interface
    const giElem = data.getElement('graphicInterface');
    if (giElem) {
      await bsb._graphicInterface.loadFromXML(giElem);
    }

    // Load parameters
    const paramListElem = data.getElement('parameterList');
    if (paramListElem) {
      bsb._parameters = BlueSynthBuilder._loadParameters(paramListElem);
    }

    // Load opcode list (UDOs)
    const opcodeListElem = data.getElement('opcodeList');
    console.log(`[BSB] ${bsb._name || 'unknown'}: opcodeList element found: ${!!opcodeListElem}`);
    if (opcodeListElem) {
      bsb._opcodeList = OpcodeList.loadFromXML(opcodeListElem);
      console.log(`[BSB]   Loaded ${bsb._opcodeList.getOpcodes().length} UDOs`);
    }

    return bsb;
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
        if (curve) {
          if (curve === 'CONSTANT') param.setCurve(AutomationCurve.STEP);
          else if (curve === 'LINEAR') param.setCurve(AutomationCurve.LINEAR);
          else if (curve === 'EXPONENTIAL') param.setCurve(AutomationCurve.EXPONENTIAL);
        }

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

  override deepCopy(): BlueSynthBuilder {
    return new BlueSynthBuilder(this);
  }
}
