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

export class BSBGroup extends BSBWidget {
  private _children: BSBWidget[] = [];

  getChildren(): BSBWidget[] {
    return [...this._children];
  }

  addChild(widget: BSBWidget): void {
    this._children.push(widget);
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
    this._loadChildren(data);
  }

  private _loadChildren(data: Element): void {
    const registry = getRegistry();
    const children = data.getElements("bsbObject");
    while (children.hasMoreElements()) {
      const childElem = children.next();
      const type = childElem.getAttribute("type") ?? "";
      const Ctor = registry[type];
      if (Ctor) {
        const child = new Ctor();
        if (child instanceof BSBGroup) {
          child.loadFromXML(childElem);
        } else if (
          "loadFromXML" in child &&
          typeof child.loadFromXML === "function"
        ) {
          (child.loadFromXML as (data: Element) => void).call(child, childElem);
        } else {
          child.loadFromXMLCommon(childElem);
        }
        this._children.push(child);
      }
    }
  }

  override loadFromXMLCommon(data: Element): void {
    super.loadFromXMLCommon(data);
  }
}
