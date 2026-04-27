import type { BsbWidgetNodeSnapshot } from '../../../../../../../shared/project-editor';

let sharedCanvas: HTMLCanvasElement | null = null;

export const BSB_CANVAS_MIN_WIDTH = 600;
export const BSB_CANVAS_MIN_HEIGHT = 400;
export const BSB_CANVAS_SCROLL_PADDING = 10;

export function measureTextWidth(text: string, font: string): number {
  if (typeof document === 'undefined') return 0;
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
  }
  const ctx = sharedCanvas.getContext('2d');
  if (!ctx) return 0;
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

  // Java JComboBox adds about 28px for arrow and padding. We use 34px to match the Radix styling footprint perfectly.
  return Math.max(40, Math.ceil(maxW) + 34);
}

export function getWidgetDisplaySize(node: BsbWidgetNodeSnapshot): { width: number; height: number } {
  if (node.type === 'BSBGroup') {
    const titleEnabled = node.properties.titleEnabled !== false;
    const groupName = typeof node.properties.groupName === 'string' ? node.properties.groupName : '';
    const labelHeight = titleEnabled && groupName ? 20 : 0;

    let childrenWidth = BSB_CANVAS_SCROLL_PADDING;
    let childrenHeight = BSB_CANVAS_SCROLL_PADDING;

    for (const child of node.children ?? []) {
      const childSize = getWidgetDisplaySize(child);
      childrenWidth = Math.max(childrenWidth, child.x + childSize.width + BSB_CANVAS_SCROLL_PADDING);
      childrenHeight = Math.max(childrenHeight, child.y + childSize.height + BSB_CANVAS_SCROLL_PADDING);
    }

    return {
      width: Math.max(node.width ?? 0, childrenWidth),
      height: labelHeight + Math.max(node.height ?? 0, childrenHeight),
    };
  }

  if (node.type === 'BSBDropdown' || node.type === 'BSBSubChannelDropdown') {
    return {
      width: getDropdownDisplayWidth(node),
      height: node.height ?? 24,
    };
  }

  return {
    width: node.width ?? 60,
    height: node.height ?? 24,
  };
}

export function getCanvasDisplaySize(
  children: BsbWidgetNodeSnapshot[],
  viewportWidth = 0,
  viewportHeight = 0,
): { width: number; height: number } {
  let maxWidth = 1;
  let maxHeight = 1;

  for (const child of children) {
    const childSize = getWidgetDisplaySize(child);
    maxWidth = Math.max(maxWidth, child.x + childSize.width);
    maxHeight = Math.max(maxHeight, child.y + childSize.height);
  }

  const contentWidth = maxWidth + BSB_CANVAS_SCROLL_PADDING;
  const contentHeight = maxHeight + BSB_CANVAS_SCROLL_PADDING;

  return {
    width: Math.max(BSB_CANVAS_MIN_WIDTH, Math.ceil(viewportWidth), contentWidth),
    height: Math.max(BSB_CANVAS_MIN_HEIGHT, Math.ceil(viewportHeight), contentHeight),
  };
}
