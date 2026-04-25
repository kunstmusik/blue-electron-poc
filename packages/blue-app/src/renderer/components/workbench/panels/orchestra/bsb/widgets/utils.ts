import type { BsbWidgetNodeSnapshot } from '../../../../../../../shared/project-editor';

let sharedCanvas: HTMLCanvasElement | null = null;

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
