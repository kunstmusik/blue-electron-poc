/**
 * BlueSynthBuilder — instrument implementation with BSB widget system.
 * Mirrors the Java BlueSynthBuilder class.
 *
 * Generates CSD orchestra code from an instrumentText template
 * with `<objectName>` placeholders replaced by BSB widget values.
 */
import { Element } from "../serialization/xml-reader";
import { ObjRefSaveMap, ObjRefLoadMap } from "../serialization/obj-ref-map";
import { Instrument } from "./instrument";
import { BSBCompilationUnit } from "./blue-synth-builder/bsb-compilation-unit";
import { BSBGraphicInterface } from "./blue-synth-builder/bsb-graphic-interface";
import { BSBGroup } from "./blue-synth-builder/bsb-group";
import { BSBWidget } from "./blue-synth-builder/bsb-widget";
import { Parameter, AutomationCurve } from "../automation/parameter";
import { BSBXYController } from "./blue-synth-builder/bsb-xy-controller";
import {
  StringChannel,
  BSBFileSelector,
} from "./blue-synth-builder/bsb-file-selector";
import { OpcodeList } from "../opcodes/opcode-list";
import { PresetGroup } from "./blue-synth-builder/preset-group";
import { Preset } from "./blue-synth-builder/preset";
import { OpcodeDefinition } from "../opcodes/opcode-definition";
import { UDOStyle } from "../opcodes/udo-style";
import { ParameterList } from "../automation/parameter-list";

function parseUdoBlock(
  block: string,
  OpcodeDef: typeof OpcodeDefinition,
  style: typeof UDOStyle,
): OpcodeDefinition | null {
  const lines = block.split("\n").map((l) => l.trim());
  if (lines.length < 3) return null;
  const headerIdx = lines.findIndex((l) => l.startsWith("opcode "));
  if (headerIdx < 0) return null;
  const header = lines[headerIdx];
  const endIdx = lines.findIndex((l, i) => i > headerIdx && l.startsWith("endop"));
  const codeLines = endIdx > headerIdx ? lines.slice(headerIdx + 1, endIdx) : lines.slice(headerIdx + 1);

  const match = header.match(/^opcode\s+(\w+),\s*([^,]*),\s*(.*)$/);
  if (!match) return null;

  const udo = new OpcodeDef();
  udo.setName(match[1]);
  udo.setOutTypes(match[2].trim());
  udo.setInTypes(match[3].trim());
  udo.setStyle(style.MODERN);
  udo.setCode(codeLines.join("\n"));
  return udo;
}

export class BlueSynthBuilder extends Instrument {
  private _instrumentText = "";
  private _alwaysOnInstrumentText = "";
  private _globalOrc = "";
  private _globalSco = "";
  private _graphicInterface = new BSBGraphicInterface();
  private _graphicInterfaceXML: Element | null = null;
  private _parameters: Parameter[] = [];
  private _opcodeList = new OpcodeList();
  private _presetGroup: PresetGroup | null = null;

  constructor(other?: BlueSynthBuilder) {
    super();
    if (other) {
      this._name = other._name;
      this._enabled = other._enabled;
      this._comment = other._comment;
      this._instrumentText = other._instrumentText;
      this._alwaysOnInstrumentText = other._alwaysOnInstrumentText;
      this._globalOrc = other._globalOrc;
      this._globalSco = other._globalSco;
      this._editEnabled = other._editEnabled;
      this._opcodeList = OpcodeList.loadFromXML(other._opcodeList.saveAsXML());
      this._graphicInterfaceXML = other._graphicInterfaceXML
        ? Element.parse(other._graphicInterfaceXML.toXml())
        : null;
      // Deep copy graphic interface
      this._graphicInterface = new BSBGraphicInterface();
      this._graphicInterface.loadFromXML(other._graphicInterface.saveAsXML());
      // Deep copy parameters
      this._parameters = other._parameters.map(p => p.deepCopy() as Parameter);
      // Deep copy preset group
      if (other._presetGroup) {
        this._presetGroup = PresetGroup.loadFromXML(other._presetGroup.saveAsXML());
      }
    }
  }

  private _editEnabled = true;

  getInstrumentText(): string {
    return this._instrumentText;
  }
  setInstrumentText(text: string): void {
    this._instrumentText = text;
  }

  getAlwaysOnInstrumentText(): string {
    return this._alwaysOnInstrumentText;
  }
  setAlwaysOnInstrumentText(text: string): void {
    this._alwaysOnInstrumentText = text;
  }

  getGlobalOrc(): string {
    return this._globalOrc;
  }
  setGlobalOrc(orc: string): void {
    this._globalOrc = orc;
  }

  getGlobalSco(): string {
    return this._globalSco;
  }
  setGlobalSco(sco: string): void {
    this._globalSco = sco;
  }

  getGraphicInterface(): BSBGraphicInterface {
    return this._graphicInterface;
  }
  setGraphicInterface(gi: BSBGraphicInterface): void {
    this._graphicInterface = gi;
    this._graphicInterfaceXML = null;
  }

  isEditEnabled(): boolean {
    return this._editEnabled;
  }
  setEditEnabled(enabled: boolean): void {
    this._editEnabled = enabled;
  }

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
    if (!this._instrumentText) return "";

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

  setOpcodeList(opcodeList: OpcodeList): void {
    this._opcodeList = opcodeList;
  }

  getOpcodeListText(): string {
    return this._opcodeList.toString();
  }

  setOpcodeListText(text: string): void {
    const lines = text.split("\n");
    const newList = new OpcodeList();
    let current: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("opcode") && trimmed.includes(",") && !current.some((l) => l.trim().startsWith("opcode"))) {
        if (current.length > 0) {
          const udo = parseUdoBlock(current.join("\n"), OpcodeDefinition, UDOStyle);
          if (udo) newList.addOpcode(udo);
        }
        current = [line];
      } else {
        current.push(line);
      }
    }
    if (current.length > 0) {
      const udo = parseUdoBlock(current.join("\n"), OpcodeDefinition, UDOStyle);
      if (udo) newList.addOpcode(udo);
    }
    this._opcodeList = newList;
  }

  /**
   * Get all UDO definitions as a structured array.
   */
  getUdoList(): OpcodeDefinition[] {
    return this._opcodeList.getOpcodes();
  }

  /**
   * Add a new UDO at the specified index (or append if index is out of bounds).
   */
  addUdo(index?: number, definition?: OpcodeDefinition): boolean {
    const udo = definition ?? new OpcodeDefinition();
    if (index === undefined || index < 0 || index > this._opcodeList.size()) {
      this._opcodeList.addOpcode(udo);
    } else {
      this._opcodeList.addOpcodeAt(index, udo);
    }
    this._graphicInterfaceXML = null;
    return true;
  }

  /**
   * Remove the UDO at the specified index.
   */
  removeUdo(index: number): boolean {
    const result = this._opcodeList.removeOpcodeAt(index);
    if (result) {
      this._graphicInterfaceXML = null;
    }
    return result;
  }

  /**
   * Update a UDO at the specified index with partial properties.
   */
  updateUdo(index: number, patch: Partial<{
    name: string;
    style: UDOStyle;
    outTypes: string;
    inTypes: string;
    inputArguments: string;
    code: string;
    comments: string;
  }>): boolean {
    const udo = this._opcodeList.getOpcode(index);
    if (!udo) return false;

    if (patch.name !== undefined) udo.setName(patch.name);
    if (patch.style !== undefined) udo.setStyle(patch.style);
    if (patch.outTypes !== undefined) udo.setOutTypes(patch.outTypes);
    if (patch.inTypes !== undefined) udo.setInTypes(patch.inTypes);
    if (patch.inputArguments !== undefined) udo.setInputArguments(patch.inputArguments);
    if (patch.code !== undefined) udo.setCode(patch.code);
    if (patch.comments !== undefined) udo.setComments(patch.comments);

    this._graphicInterfaceXML = null;
    return true;
  }

  /**
   * Reorder a UDO from one index to another.
   */
  reorderUdo(fromIndex: number, toIndex: number): boolean {
    if (fromIndex === toIndex) return true;
    const udo = this._opcodeList.getOpcode(fromIndex);
    if (!udo) return false;

    this._opcodeList.removeOpcodeAt(fromIndex);
    this._opcodeList.addOpcodeAt(toIndex, udo);
    this._graphicInterfaceXML = null;
    return true;
  }

  getPresetGroup(): PresetGroup | null {
    return this._presetGroup;
  }

  setPresetGroup(group: PresetGroup | null): void {
    this._presetGroup = group;
  }

  applyPreset(presetUniqueId: string): boolean {
    console.log('applyPreset in BSB:', presetUniqueId);
    if (!this._presetGroup) return false;
    const preset = this._presetGroup.findPresetByUniqueId(presetUniqueId);
    if (!preset) {
      console.log('preset not found');
      return false;
    }

    const valuesMap = preset.getValuesMap();
    console.log('valuesMap size:', valuesMap.size);
    let updatedCount = 0;
    const visit = (widgets: BSBWidget[]): void => {
      for (const widget of widgets) {
        const val = valuesMap.get(widget.objectName);
        if (val !== undefined) {
          console.log(`Updating widget ${widget.objectName} to ${val}`);
          if (typeof widget.setPresetValue === 'function') {
            widget.setPresetValue(val);
          } else {
            const parsed = parseFloat(val.replace(/^ver2:/, ""));
            if (Number.isFinite(parsed)) {
              widget.value = parsed;
            }
          }

          // Sync with parameter(s) if they exist
          if (widget instanceof BSBXYController) {
            const px = this._parameters.find(p => p.getName() === `${widget.objectName}X`);
            const py = this._parameters.find(p => p.getName() === `${widget.objectName}Y`);
            if (px) px.setFixedValue(widget.xValue);
            if (py) py.setFixedValue(widget.yValue);
          } else {
            const param = this._parameters.find(p => p.getName() === widget.objectName);
            if (param) {
              param.setFixedValue(widget.value);
            }
          }

          updatedCount++;
        }
        if (widget instanceof BSBGroup) {
          visit(widget.getChildren());
        }
      }
    };
    visit(this._graphicInterface.getRootGroup().getChildren());
    console.log('updated widgets:', updatedCount);
    this._graphicInterfaceXML = null;
    this._presetGroup.setCurrentPresetUniqueId(presetUniqueId);
    this._presetGroup.setCurrentPresetModified(false);
    return true;
  }

  updateWidgetProperties(
    widgetId: string,
    properties: Record<string, string | number | boolean | null>,
  ): boolean {
    const widget = this._graphicInterface.findWidgetById(widgetId);
    if (!widget) return false;

    for (const [key, value] of Object.entries(properties)) {
      switch (key) {
        case "objectName":
          if (typeof value === "string") widget.objectName = value;
          break;
        case "x":
          if (typeof value === "number") widget.x = value;
          break;
        case "y":
          if (typeof value === "number") widget.y = value;
          break;
        case "value":
          if (typeof value === "number") {
            widget.setValue(value);
            if (widget.objectName) {
              const param = this._parameters.find(p => p.getName() === widget.objectName);
              if (param) {
                param.setFixedValue(value);
              }
            }
          }
          break;
        case "selected":
          if (typeof value === "boolean") {
            widget.setValue(value ? 1 : 0);
            if (widget.objectName) {
              const param = this._parameters.find(p => p.getName() === widget.objectName);
              if (param) {
                param.setFixedValue(value ? 1 : 0);
              }
            }
          }
          break;
        case "selectedIndex":
          if (typeof value === "number") {
            widget.setValue(value);
            if (widget.objectName) {
              const param = this._parameters.find(p => p.getName() === widget.objectName);
              if (param) {
                param.setFixedValue(value);
              }
            }
          }
          break;
        case "xValue":
          if (typeof value === "number") {
            (widget as unknown as Record<string, unknown>)["xValue"] = value;
            const xName = widget.objectName + "X";
            const px = this._parameters.find(p => p.getName() === xName);
            if (px) px.setFixedValue(value);
          }
          break;
        case "yValue":
          if (typeof value === "number") {
            (widget as unknown as Record<string, unknown>)["yValue"] = value;
            const yName = widget.objectName + "Y";
            const py = this._parameters.find(p => p.getName() === yName);
            if (py) py.setFixedValue(value);
          }
          break;
        case "minimum":
          if (typeof value === "number") widget.minimum = value;
          break;
        case "maximum":
          if (typeof value === "number") widget.maximum = value;
          break;
        default:
          if (key in widget) {
            (widget as unknown as Record<string, unknown>)[key] = value;
          }
          break;
      }
    }
    this._graphicInterfaceXML = null;
    return true;
  }

  invalidateGraphicInterfaceCache(): void {
    this._graphicInterfaceXML = null;
  }

  setBsbEditEnabled(enabled: boolean): void {
    this._graphicInterface.setEditEnabled(enabled);
    this._editEnabled = enabled;
    this._graphicInterfaceXML = null;
  }

  setBsbGridSettings(settings: Partial<import("./blue-synth-builder/bsb-graphic-interface").GridSettingsData>): void {
    this._graphicInterface.setGridSettings(settings);
    this._graphicInterfaceXML = null;
  }

  updateWidgetValue(objectName: string, value: number): boolean {
    const widget = this.findWidgetByObjectName(objectName);
    if (!widget || widget.value === value) {
      return false;
    }

    widget.setValue(value);

    // Sync with parameter if it exists
    const param = this._parameters.find(p => p.getName() === objectName);
    if (param) {
      param.setFixedValue(value);
    }

    this._graphicInterfaceXML = null;
    return true;
  }

  private findWidgetByObjectName(objectName: string): BSBWidget | null {
    const visit = (widget: BSBWidget): BSBWidget | null => {
      if (widget.objectName === objectName) {
        return widget;
      }

      if (widget instanceof BSBGroup) {
        for (const child of widget.getChildren()) {
          const found = visit(child);
          if (found) return found;
        }
      }

      return null;
    };

    return visit(this._graphicInterface.getRootGroup());
  }

  /**
   * Recursively collect StringChannels from BSBGroup and its children.
   */
  private _collectStringChannels(group: any): StringChannel[] {
    const channels: StringChannel[] = [];
    if (!group) return channels;

    const getChildren = (group as any).getChildren;
    if (typeof getChildren !== "function") return channels;

    for (const child of getChildren.call(group) || []) {
      if (child instanceof BSBFileSelector) {
        const sc = child.getStringChannel();
        if (sc) channels.push(sc);
      } else if (typeof (child as any).getChildren === "function") {
        channels.push(...this._collectStringChannels(child));
      }
    }

    return channels;
  }

  // ─── XML Serialization ───

  saveAsXML(_objRefMap?: ObjRefSaveMap): Element {
    const elem = new Element("instrument");
    elem.setAttribute("type", "blue.orchestra.BlueSynthBuilder");
    elem.setAttribute("editEnabled", this._editEnabled.toString());
    elem.addElement("name").setText(this._name);
    elem.addElement("comment").setText(this._comment);
    elem.addElement("globalOrc").setText(this._globalOrc || "");
    elem.addElement("globalSco").setText(this._globalSco || "");
    elem.addElement("instrumentText").setText(this._instrumentText || "");
    elem.addElement("alwaysOnInstrumentText").setText(this._alwaysOnInstrumentText || "");
    if (this._graphicInterfaceXML) {
      elem.addElement(Element.parse(this._graphicInterfaceXML.toXml()));
    } else {
      elem.addElement(this._graphicInterface.saveAsXML());
    }
    const plist = new ParameterList();
    plist.push(...this._parameters);
    elem.addElement(plist.saveAsXML());
    if (this._presetGroup) {
      elem.addElement(this._presetGroup.saveAsXML());
    }
    elem.addElement(this._opcodeList.saveAsXML());
    return elem;
  }

  static loadFromXML(
    data: Element,
    _objRefMap?: ObjRefLoadMap,
  ): BlueSynthBuilder {
    const bsb = new BlueSynthBuilder();

    const editEnabled = data.getAttribute("editEnabled");
    if (editEnabled !== null) bsb._editEnabled = editEnabled === "true";

    const name = data.getTextString("name");
    if (name) bsb._name = name;

    const comment = data.getTextString("comment");
    if (comment) bsb._comment = comment;

    const instrText = data.getTextString("instrumentText");
    if (instrText) bsb._instrumentText = instrText;

    const alwaysOnText = data.getTextString("alwaysOnInstrumentText");
    if (alwaysOnText) bsb._alwaysOnInstrumentText = alwaysOnText;

    const globalOrc = data.getTextString("globalOrc");
    if (globalOrc) bsb._globalOrc = globalOrc;

    const globalSco = data.getTextString("globalSco");
    if (globalSco) bsb._globalSco = globalSco;

    // Load graphic interface
    const giElem = data.getElement("graphicInterface");
    if (giElem) {
      bsb._graphicInterfaceXML = Element.parse(giElem.toXml());
      bsb._graphicInterface.loadFromXML(giElem);
    }

    // Load preset group
    const presetGroupElem = data.getElement("presetGroup");
    if (presetGroupElem) {
      bsb._presetGroup = PresetGroup.loadFromXML(presetGroupElem);
    }

    // Load parameters
    const paramListElem = data.getElement("parameterList");
    if (paramListElem) {
      bsb._parameters = BlueSynthBuilder._loadParameters(paramListElem);
    }

    // Load opcode list (UDOs)
    const opcodeListElem = data.getElement("opcodeList");
    console.log(
      `[BSB] ${bsb._name || "unknown"}: opcodeList element found: ${!!opcodeListElem}`,
    );
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
    const paramElems = data.getElements("parameter");

    while (paramElems.hasMoreElements()) {
      const elem = paramElems.next();
      parameters.push(Parameter.loadFromXML(elem));
    }

    return parameters;
  }

  override deepCopy(): BlueSynthBuilder {
    return new BlueSynthBuilder(this);
  }
}
