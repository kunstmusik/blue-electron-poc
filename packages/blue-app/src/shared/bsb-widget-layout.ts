export const BSB_VALUE_PANEL_WIDTH = 50;
export const BSB_VALUE_PANEL_HEIGHT = 30;
export const BSB_LINE_SELECTOR_HEIGHT = 28;

export function getHSliderBankDisplaySize(
  sliderCount: number,
  sliderWidth: number,
  gap: number,
  showValue: boolean,
): { width: number; height: number } {
  const count = Math.max(1, sliderCount);
  const width = Math.max(45, sliderWidth) + (showValue ? BSB_VALUE_PANEL_WIDTH : 0);
  const height = BSB_VALUE_PANEL_HEIGHT * count + Math.max(0, gap) * (count - 1);
  return { width, height };
}

export function getVSliderBankDisplaySize(
  sliderCount: number,
  sliderHeight: number,
  gap: number,
  showValue: boolean,
): { width: number; height: number } {
  const count = Math.max(1, sliderCount);
  const width = BSB_VALUE_PANEL_WIDTH * count + Math.max(0, gap) * (count - 1);
  const height = Math.max(45, sliderHeight) + (showValue ? BSB_VALUE_PANEL_HEIGHT : 0);
  return { width, height };
}