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
import { Parameter } from '../../automation/parameter';

/** Map from XML type attribute to widget constructor */
type BSBWidgetCtor = new () => BSBWidget;

const BSB_WIDGET_REGISTRY: Record<string, BSBWidgetCtor> = {};

// Lazy registration to avoid circular dependency
let registryInitialized = false;
async function ensureRegistry(): Promise<void> {
  if (registryInitialized) return;
  registryInitialized = true;
  // Dynamic imports to avoid circular deps
  const { BSBGroup: G } = await import('./bsb-group');
  const { BSBKnob } = await import('./bsb-knob');
  const { BSBCheckBox } = await import('./bsb-check-box');
  const { BSBHSlider } = await import('./bsb-hslider');
  const { BSBVSlider } = await import('./bsb-vslider');
  const { BSBHSliderBank } = await import('./bsb-hslider-bank');
  const { BSBVSliderBank } = await import('./bsb-vslider-bank');
  const { BSBValue } = await import('./bsb-value');
  const { BSBDropdown } = await import('./bsb-dropdown');
  const { BSBXYController } = await import('./bsb-xy-controller');
  const { BSBSubChannelDropdown } = await import('./bsb-subchannel-dropdown');
  const { BSBFileSelector } = await import('./bsb-file-selector');
  const { BSBTextField } = await import('./bsb-text-field');
  const { BSBLabel } = await import('./bsb-label');
  const { BSBLineObject } = await import('./bsb-line-object');

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

  override collectReplacements(unit: BSBCompilationUnit, parameters?: Parameter[]): void {
    for (const child of this._children) {
      child.collectReplacements(unit, parameters);
    }
  }

  /** Full XML load entry point for groups */
  async loadFromXML(data: Element): Promise<void> {
    await ensureRegistry();
    this.loadFromXMLCommon(data);
    await this._loadChildren(data);
  }

  /** Load child bsbObject elements */
  private async _loadChildren(data: Element): Promise<void> {
    await ensureRegistry();

    const children = data.getElements('bsbObject');
    while (children.hasMoreElements()) {
      const childElem = children.next();
      const type = childElem.getAttribute('type') ?? '';
      const Ctor = BSB_WIDGET_REGISTRY[type];
      if (Ctor) {
        const child = new Ctor();
        if (child instanceof BSBGroup) {
          await child.loadFromXML(childElem);
        } else if ('loadFromXML' in child && typeof child.loadFromXML === 'function') {
          (child.loadFromXML as (data: Element) => void | Promise<void>).call(child, childElem);
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
