import { Element } from "../../serialization/xml-reader";
import { BSBWidget } from "./bsb-widget";
import { BSBCompilationUnit } from "./bsb-compilation-unit";
import { Parameter } from "../../automation/parameter";
import { BSBKnob } from "./bsb-knob";
import { BSBCheckBox } from "./bsb-check-box";
import { BSBHSlider } from "./bsb-hslider";
import { BSBVSlider } from "./bsb-vslider";
import { BSBHSliderBank } from "./bsb-hslider-bank";
import { BSBVSliderBank } from "./bsb-vslider-bank";
import { BSBValue } from "./bsb-value";
import { BSBDropdown } from "./bsb-dropdown";
import { BSBXYController } from "./bsb-xy-controller";
import { BSBSubChannelDropdown } from "./bsb-subchannel-dropdown";
import { BSBFileSelector } from "./bsb-file-selector";
import { BSBTextField } from "./bsb-text-field";
import { BSBLabel } from "./bsb-label";
import { BSBLineObject } from "./bsb-line-object";
import { loadFontFromXML, saveFontToXML, type BSBFont } from "./bsb-knob";

type BSBWidgetCtor = new () => BSBWidget;

let _registry: Record<string, BSBWidgetCtor> | null = null;

function getRegistry(): Record<string, BSBWidgetCtor> {
  if (!_registry) {
    _registry = {
      "blue.orchestra.blueSynthBuilder.BSBKnob": BSBKnob,
      "blue.orchestra.blueSynthBuilder.BSBCheckBox": BSBCheckBox,
      "blue.orchestra.blueSynthBuilder.BSBHSlider": BSBHSlider,
      "blue.orchestra.blueSynthBuilder.BSBVSlider": BSBVSlider,
      "blue.orchestra.blueSynthBuilder.BSBHSliderBank": BSBHSliderBank,
      "blue.orchestra.blueSynthBuilder.BSBVSliderBank": BSBVSliderBank,
      "blue.orchestra.blueSynthBuilder.BSBValue": BSBValue,
      "blue.orchestra.blueSynthBuilder.BSBDropdown": BSBDropdown,
      "blue.orchestra.blueSynthBuilder.BSBXYController": BSBXYController,
      "blue.orchestra.blueSynthBuilder.BSBSubChannelDropdown":
        BSBSubChannelDropdown,
      "blue.orchestra.blueSynthBuilder.BSBFileSelector": BSBFileSelector,
      "blue.orchestra.blueSynthBuilder.BSBTextField": BSBTextField,
      "blue.orchestra.blueSynthBuilder.BSBLabel": BSBLabel,
      "blue.orchestra.blueSynthBuilder.BSBLineObject": BSBLineObject,
    };
  }
  _registry["blue.orchestra.blueSynthBuilder.BSBGroup"] = BSBGroup;
  return _registry;
}

export function loadBsbWidgetFromXML(data: Element): BSBWidget | null {
  const type = data.getAttribute("type") ?? "";
  const Ctor = getRegistry()[type];
  if (!Ctor) return null;

  const child = new Ctor();
  if (child instanceof BSBGroup) {
    child.loadFromXML(data);
  } else if (
    "loadFromXML" in child &&
    typeof child.loadFromXML === "function"
  ) {
    (child.loadFromXML as (data: Element) => void).call(child, data);
  } else {
    child.loadFromXMLCommon(data);
  }

  return child;
}

export class BSBGroup extends BSBWidget {
  private _children: BSBWidget[] = [];
  groupName = 'Group';
  backgroundColor = 'rgba(0,0,0,0.2)';
  borderColor = '#000000';
  labelTextColor = '#FFFFFF';
  titleEnabled = true;
  width = 20;
  height = 20;
  font: BSBFont = { name: 'Roboto', size: 12, style: 0 };

  getChildren(): BSBWidget[] {
    return [...this._children];
  }

  addChild(widget: BSBWidget): void {
    this._children.push(widget);
  }

  randomize(): void {
    for (const child of this._children) {
      if ('randomize' in child && typeof (child as any).randomize === 'function') {
        (child as any).randomize();
      }
    }
  }

  override collectReplacements(
    unit: BSBCompilationUnit,
    parameters?: Parameter[],
  ): void {
    for (const child of this._children) {
      child.collectReplacements(unit, parameters);
    }
  }

  loadFromXML(data: Element): void {
    this.loadFromXMLCommon(data);
    const gnAttr = data.getAttribute("groupName");
    if (gnAttr) this.groupName = gnAttr;
    const gn = data.getTextString('groupName');
    if (gn !== null) this.groupName = gn;
    const bg = data.getTextString('backgroundColor');
    if (bg) this.backgroundColor = bg;
    const bc = data.getTextString('borderColor');
    if (bc) this.borderColor = bc;
    const ltc = data.getTextString('labelTextColor');
    if (ltc) this.labelTextColor = ltc;
    const te = data.getElement('titleEnabled');
    if (te) this.titleEnabled = te.getTextString() === 'true';
    const w = data.getTextString('width');
    if (w) this.width = parseInt(w, 10);
    const h = data.getTextString('height');
    if (h) this.height = parseInt(h, 10);
    const fontElem = data.getElement('font');
    if (fontElem) this.font = loadFontFromXML(fontElem);
    this._loadChildren(data);
  }

  private _loadChildren(data: Element): void {
    const children = data.getElements("bsbObject");
    while (children.hasMoreElements()) {
      const childElem = children.next();
      const child = loadBsbWidgetFromXML(childElem);
      if (child) {
        this._children.push(child);
      }
    }
  }

  override loadFromXMLCommon(data: Element): void {
    super.loadFromXMLCommon(data);
  }

  saveAsXML(): Element {
    return saveBsbWidgetAsXML(this);
  }
}

const COMMON_WIDGET_FIELDS = new Set([
  'objectName',
  'x',
  'y',
  'comment',
  'automationAllowed',
  'value',
  'minimum',
  'maximum',
  'parameterName',
]);

const SKIPPED_WIDGET_FIELDS = new Set([
  '_children',
  'stringChannel',
  'id',
  'labelFont',
  'font',
  'dropdownItems',
]);

function getWidgetXmlType(widget: BSBWidget): string {
  const constructorName = widget.constructor.name;
  return `blue.orchestra.blueSynthBuilder.${constructorName}`;
}

function addPrimitiveElement(parent: Element, key: string, value: unknown): void {
  if (value === null || value === undefined) return;
  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    typeof value !== 'boolean'
  ) {
    return;
  }
  parent.addElement(key).setText(String(value));
}

export function saveBsbWidgetAsXML(widget: BSBWidget): Element {
  const elem = new Element('bsbObject');
  elem.setAttribute('type', getWidgetXmlType(widget));

  addPrimitiveElement(elem, 'objectName', widget.objectName);
  addPrimitiveElement(elem, 'x', widget.x);
  addPrimitiveElement(elem, 'y', widget.y);
  if (widget.comment) {
    elem.addElement('comment').setText(widget.comment);
  }
  addPrimitiveElement(elem, 'automationAllowed', widget.automationAllowed);
  addPrimitiveElement(elem, 'value', widget.value);
  addPrimitiveElement(elem, 'minimum', widget.minimum);
  addPrimitiveElement(elem, 'maximum', widget.maximum);
  addPrimitiveElement(elem, 'parameterName', widget.parameterName);

  for (const [key, value] of Object.entries(widget as unknown as Record<string, unknown>)) {
    if (COMMON_WIDGET_FIELDS.has(key) || SKIPPED_WIDGET_FIELDS.has(key)) {
      continue;
    }
    addPrimitiveElement(elem, key, value);
  }

  if (widget instanceof BSBKnob) {
    elem.addElement(saveFontToXML(widget.labelFont));
  }
  if (widget instanceof BSBGroup) {
    elem.addElement(saveFontToXML(widget.font));
    for (const child of widget.getChildren()) {
      elem.addElement(saveBsbWidgetAsXML(child));
    }
  }
  if (widget instanceof BSBDropdown && widget.dropdownItems.length > 0) {
    const listElem = elem.addElement('bsbDropdownItemList');
    for (const item of widget.dropdownItems) {
      const itemElem = listElem.addElement('bsbDropdownItem');
      itemElem.setAttribute('uniqueId', item.uniqueId);
      itemElem.addElement('name').setText(item.name);
      itemElem.addElement('value').setText(item.value);
    }
  }

  return elem;
}
