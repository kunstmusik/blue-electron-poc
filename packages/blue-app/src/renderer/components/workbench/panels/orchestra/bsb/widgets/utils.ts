import type { BsbWidgetNodeSnapshot } from '../../../../../../../shared/project-editor';
import {
  BSB_CANVAS_SCROLL_PADDING,
  BSB_LINE_SELECTOR_HEIGHT,
  BSB_VALUE_PANEL_HEIGHT,
  BSB_VALUE_PANEL_WIDTH,
  BSB_XY_READOUT_HEIGHT,
  estimateTextWidth,
  getHSliderBankDisplaySize,
  getVSliderBankDisplaySize,
} from '../../../../../../../shared/bsb-widget-layout';

let sharedCanvas: HTMLCanvasElement | null = null;

export const BSB_CANVAS_MIN_WIDTH = 600;
export const BSB_CANVAS_MIN_HEIGHT = 400;

export function measureTextWidth(text: string, font: string): number {
  const fontSize = getTextFontSize(font);

  if (typeof document === 'undefined') return estimateTextWidth(text, fontSize);
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
  }
  const ctx = sharedCanvas.getContext('2d');
  if (!ctx) return estimateTextWidth(text, fontSize);
  ctx.font = font;
  return ctx.measureText(text).width;
}

export function getDropdownDisplayWidth(node: BsbWidgetNodeSnapshot): number {
  const fontSize = typeof node.properties.fontSize === 'number' ? node.properties.fontSize : 12;
  const font = `${fontSize}px Roboto, sans-serif`;
  let maxW = 0;

  if (node.type === 'BSBSubChannelDropdown') {
    const channelOutput = typeof node.properties.channelOutput === 'string' ? node.properties.channelOutput : '';
    const text = channelOutput || node.objectName || 'Sub Channel';
    maxW = measureTextWidth(text, font);
  } else {
    const itemsRaw = node.properties.dropdownItems;
    const items: Array<{ name?: string; value?: string }> = Array.isArray(itemsRaw) ? itemsRaw as any : [];
    for (const item of items) {
      const text = item.name || item.value || '';
      maxW = Math.max(maxW, measureTextWidth(text, font));
    }
    if (maxW === 0) {
      const objectName = node.objectName || 'Dropdown';
      maxW = measureTextWidth(objectName, font);
    }
  }

  return Math.max(40, Math.ceil(maxW) + 34);
}

function getTextFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  return match ? Number.parseFloat(match[1]!) : 12;
}

function getFontString(name: string, size: number, style = 0): string {
  const parts: string[] = [];
  if ((style & 1) !== 0) parts.push('bold');
  if ((style & 2) !== 0) parts.push('italic');
  parts.push(`${size}px`);
  const family = name.includes(' ') || name.includes(',') ? `"${name}"` : name;
  parts.push(`${family}, sans-serif`);
  return parts.join(' ');
}

export function getWidgetDisplaySize(node: BsbWidgetNodeSnapshot): { width: number; height: number } {
  switch (node.type) {
    case 'BSBHSlider': {
      const sliderWidth = typeof node.properties.sliderWidth === 'number'
        ? node.properties.sliderWidth
        : typeof node.width === 'number'
          ? node.width
          : 150;
      return {
        width: Math.max(45, sliderWidth) + (node.properties.valueDisplayEnabled === true ? BSB_VALUE_PANEL_WIDTH : 0),
        height: BSB_VALUE_PANEL_HEIGHT,
      };
    }
    case 'BSBVSlider': {
      const sliderHeight = typeof node.properties.sliderHeight === 'number'
        ? node.properties.sliderHeight
        : typeof node.height === 'number'
          ? node.height
          : 150;
      return {
        width: BSB_VALUE_PANEL_WIDTH,
        height: Math.max(45, sliderHeight) + (node.properties.valueDisplayEnabled === true ? BSB_VALUE_PANEL_HEIGHT : 0),
      };
    }
    case 'BSBHSliderBank': {
      const sliderCount = Array.isArray(node.properties.sliders)
        ? Math.max(1, node.properties.sliders.length)
        : typeof node.properties.numberOfSliders === 'number'
          ? Math.max(1, node.properties.numberOfSliders)
          : 1;
      const sliderWidth = typeof node.properties.sliderWidth === 'number'
        ? node.properties.sliderWidth
        : typeof node.width === 'number'
          ? node.width
          : 150;
      return getHSliderBankDisplaySize(
        sliderCount,
        sliderWidth,
        typeof node.properties.gap === 'number' ? node.properties.gap : 5,
        node.properties.valueDisplayEnabled === true,
      );
    }
    case 'BSBVSliderBank': {
      const sliderCount = Array.isArray(node.properties.sliders)
        ? Math.max(1, node.properties.sliders.length)
        : typeof node.properties.numberOfSliders === 'number'
          ? Math.max(1, node.properties.numberOfSliders)
          : 1;
      const sliderHeight = typeof node.properties.sliderHeight === 'number'
        ? node.properties.sliderHeight
        : typeof node.height === 'number'
          ? node.height
          : 150;
      return getVSliderBankDisplaySize(
        sliderCount,
        sliderHeight,
        typeof node.properties.gap === 'number' ? node.properties.gap : 5,
        node.properties.valueDisplayEnabled === true,
      );
    }
    case 'BSBKnob': {
      const knobWidth = typeof node.properties.knobWidth === 'number'
        ? node.properties.knobWidth
        : typeof node.width === 'number'
          ? node.width
          : 60;
      const labelEnabled = node.properties.labelEnabled !== false;
      const labelText = labelEnabled && typeof node.properties.label === 'string'
        ? node.properties.label
        : '';
      const labelFontName = typeof node.properties['labelFont.name'] === 'string' ? node.properties['labelFont.name'] : 'Roboto';
      const labelFontSize = typeof node.properties['labelFont.size'] === 'number' ? node.properties['labelFont.size'] : 12;
      const labelFontStyle = typeof node.properties['labelFont.style'] === 'number' ? node.properties['labelFont.style'] : 0;
      const labelWidth = labelEnabled
        ? measureTextWidth(labelText, getFontString(labelFontName, labelFontSize, labelFontStyle))
        : 0;
      const labelHeight = labelEnabled
        ? Math.max(16, Math.ceil(labelFontSize * 1.25))
        : 0;
      const valueHeight = node.properties.valueDisplayEnabled === true ? 14 : 0;
      return {
        width: Math.max(knobWidth, Math.ceil(labelWidth)),
        height: knobWidth + labelHeight + valueHeight,
      };
    }
    case 'BSBXYController': {
      const baseWidth = typeof node.properties.width === 'number'
        ? node.properties.width
        : typeof node.width === 'number'
          ? node.width
          : 100;
      const baseHeight = typeof node.properties.height === 'number'
        ? node.properties.height
        : typeof node.height === 'number'
          ? node.height
          : 80;
      return {
        width: baseWidth,
        height: baseHeight + (node.properties.valueDisplayEnabled === true ? BSB_XY_READOUT_HEIGHT : 0),
      };
    }
    case 'BSBGroup': {
      const titleEnabled = node.properties.titleEnabled !== false;
      const groupName = typeof node.properties.groupName === 'string' ? node.properties.groupName : '';
      const labelHeight = titleEnabled && groupName ? 20 : 0;
      const fontName = typeof node.properties['font.name'] === 'string' ? node.properties['font.name'] : 'Roboto';
      const fontSize = typeof node.properties['font.size'] === 'number' ? node.properties['font.size'] : 12;
      const fontStyle = typeof node.properties['font.style'] === 'number' ? node.properties['font.style'] : 0;
      const titleWidth = titleEnabled && groupName
        ? Math.ceil(measureTextWidth(groupName, getFontString(fontName, fontSize, fontStyle))) + 2
        : 0;

      let childrenWidth = 10;
      let childrenHeight = 10;
      for (const child of node.children ?? []) {
        const childSize = getWidgetDisplaySize(child);
        childrenWidth = Math.max(childrenWidth, child.x + childSize.width);
        childrenHeight = Math.max(childrenHeight, child.y + childSize.height);
      }
      childrenWidth += 10;
      childrenHeight += 10;

      return {
        width: Math.max(1, titleWidth, node.width ?? 20, childrenWidth),
        height: labelHeight + Math.max(1, node.height ?? 20, childrenHeight),
      };
    }
    case 'BSBLabel': {
      const labelText = typeof node.properties.label === 'string' ? node.properties.label : '';
      const fontName = typeof node.properties['font.name'] === 'string' ? node.properties['font.name'] : 'Roboto';
      const fontSize = typeof node.properties['font.size'] === 'number' ? node.properties['font.size'] : 12;
      const fontStyle = typeof node.properties['font.style'] === 'number' ? node.properties['font.style'] : 0;
      return {
        width: Math.max(1, Math.ceil(measureTextWidth(labelText, getFontString(fontName, fontSize, fontStyle))) + 1),
        height: Math.max(16, Math.ceil(fontSize * 1.25)) + 1,
      };
    }
    case 'BSBCheckBox': {
      const labelText = typeof node.properties.label === 'string' ? node.properties.label : '';
      const fontSize = 12;
      return {
        width: Math.max(1, Math.ceil(measureTextWidth(labelText, `${fontSize}px Roboto, sans-serif`)) + 20),
        height: Math.max(20, Math.ceil(fontSize * 1.4)),
      };
    }
    case 'BSBDropdown':
    case 'BSBSubChannelDropdown': {
      const fontSize = typeof node.properties.fontSize === 'number' ? node.properties.fontSize : 12;
      return {
        width: getDropdownDisplayWidth(node),
        height: Math.max(24, fontSize + 8),
      };
    }
    case 'BSBTextField': {
      const textFieldWidth = typeof node.properties.textFieldWidth === 'number'
        ? node.properties.textFieldWidth
        : typeof node.width === 'number'
          ? node.width
          : 100;
      return {
        width: textFieldWidth,
        height: 30,
      };
    }
    case 'BSBFileSelector': {
      const textFieldWidth = typeof node.properties.textFieldWidth === 'number'
        ? node.properties.textFieldWidth
        : typeof node.width === 'number'
          ? node.width - 30
          : 100;
      return {
        width: textFieldWidth + 30,
        height: 30,
      };
    }
    case 'BSBLineObject': {
      const canvasWidth = typeof node.properties.canvasWidth === 'number'
        ? node.properties.canvasWidth
        : typeof node.width === 'number'
          ? node.width
          : 200;
      const canvasHeight = typeof node.properties.canvasHeight === 'number'
        ? node.properties.canvasHeight
        : typeof node.height === 'number'
          ? node.height - BSB_LINE_SELECTOR_HEIGHT
          : 160;
      return {
        width: canvasWidth,
        height: canvasHeight + BSB_LINE_SELECTOR_HEIGHT,
      };
    }
    default:
      return {
        width: typeof node.width === 'number' ? node.width : 60,
        height: typeof node.height === 'number' ? node.height : 24,
      };
  }
}

function getWidgetCanvasBoundsSize(node: BsbWidgetNodeSnapshot): { width: number; height: number } {
  const displaySize = getWidgetDisplaySize(node);
  if (node.type !== 'BSBGroup') return displaySize;

  let width = displaySize.width;
  let height = displaySize.height;
  for (const child of node.children ?? []) {
    const childSize = getWidgetCanvasBoundsSize(child);
    width = Math.max(width, child.x + childSize.width + BSB_CANVAS_SCROLL_PADDING);
    height = Math.max(height, child.y + childSize.height + BSB_CANVAS_SCROLL_PADDING);
  }
  return { width, height };
}

export function getCanvasDisplaySize(
  children: BsbWidgetNodeSnapshot[],
  viewportWidth = 0,
  viewportHeight = 0,
  minOverride?: number,
): { width: number; height: number } {
  let maxWidth = 1;
  let maxHeight = 1;

  for (const child of children) {
    const childSize = getWidgetCanvasBoundsSize(child);
    maxWidth = Math.max(maxWidth, child.x + childSize.width);
    maxHeight = Math.max(maxHeight, child.y + childSize.height);
  }

  const contentWidth = maxWidth + BSB_CANVAS_SCROLL_PADDING;
  const contentHeight = maxHeight + BSB_CANVAS_SCROLL_PADDING;
  const minW = minOverride ?? BSB_CANVAS_MIN_WIDTH;
  const minH = minOverride ?? BSB_CANVAS_MIN_HEIGHT;

  return {
    width: Math.max(minW, Math.ceil(viewportWidth), contentWidth),
    height: Math.max(minH, Math.ceil(viewportHeight), contentHeight),
  };
}
