/**
 * BSBGroup — container for nested BSB widgets.
 * Mirrors the Java BSBGroup class (implements Iterable<BSBObject>).
 *
 * Groups can contain other groups, knobs, sliders, checkboxes, etc.
 * During compilation, collectReplacements() recursively walks all children.
 */
import { Element } from '../../serialization/xml-reader';
import { BSBWidget } from './bsb-widget';
import { BSBCompilationUnit } from './bsb-compilation-unit';

/** Map from XML type attribute to widget constructor */
type BSBWidgetCtor = new () => BSBWidget;

const BSB_WIDGET_REGISTRY: Record<string, BSBWidgetCtor> = {};

// Lazy registration to avoid circular dependency
let registryInitialized = false;
function ensureRegistry(): void {
  if (registryInitialized) return;
  registryInitialized = true;
  // Imports done lazily to avoid circular deps
  const { BSBGroup: G } = require('./bsb-group');
  const { BSBKnob } = require('./bsb-knob');
  const { BSBCheckBox } = require('./bsb-check-box');
  const { BSBHSlider } = require('./bsb-hslider');
  const { BSBVSlider } = require('./bsb-vslider');
  const { BSBHSliderBank } = require('./bsb-hslider-bank');
  const { BSBVSliderBank } = require('./bsb-vslider-bank');
  const { BSBValue } = require('./bsb-value');
  const { BSBDropdown } = require('./bsb-dropdown');
  const { BSBXYController } = require('./bsb-xy-controller');
  const { BSBSubChannelDropdown } = require('./bsb-subchannel-dropdown');
  const { BSBFileSelector } = require('./bsb-file-selector');
  const { BSBTextField } = require('./bsb-text-field');
  const { BSBLabel } = require('./bsb-label');
  const { BSBLineObject } = require('./bsb-line-object');

  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBGroup'] = G;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBKnob'] = BSBKnob;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBCheckBox'] = BSBCheckBox;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBHSlider'] = BSBHSlider;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBVSlider'] = BSBVSlider;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBHSliderBank'] = BSBHSliderBank;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBVSliderBank'] = BSBVSliderBank;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBValue'] = BSBValue;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBDropdown'] = BSBDropdown;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBXYController'] = BSBXYController;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBSubChannelDropdown'] = BSBSubChannelDropdown;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBFileSelector'] = BSBFileSelector;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBTextField'] = BSBTextField;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBLabel'] = BSBLabel;
  BSB_WIDGET_REGISTRY['blue.orchestra.blueSynthBuilder.BSBLineObject'] = BSBLineObject;
}

export class BSBGroup extends BSBWidget {
  private _children: BSBWidget[] = [];

  getChildren(): BSBWidget[] { return [...this._children]; }

  addChild(widget: BSBWidget): void {
    this._children.push(widget);
  }

  override collectReplacements(unit: BSBCompilationUnit): void {
    for (const child of this._children) {
      child.collectReplacements(unit);
    }
  }

  /** Full XML load entry point for groups */
  loadFromXML(data: Element): void {
    ensureRegistry();
    this.loadFromXMLCommon(data);
    this._loadChildren(data);
  }

  /** Load child bsbObject elements */
  private _loadChildren(data: Element): void {
    ensureRegistry();

    const children = data.getElements('bsbObject');
    while (children.hasMoreElements()) {
      const childElem = children.next();
      const type = childElem.getAttribute('type') ?? '';
      const Ctor = BSB_WIDGET_REGISTRY[type];
      if (Ctor) {
        const child = new Ctor();
        if (child instanceof BSBGroup) {
          child.loadFromXML(childElem);
        } else if ('loadFromXML' in child && typeof child.loadFromXML === 'function') {
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
    // For groups, children are loaded in loadFromXML() to ensure
    // the registry is initialized first
  }
}
