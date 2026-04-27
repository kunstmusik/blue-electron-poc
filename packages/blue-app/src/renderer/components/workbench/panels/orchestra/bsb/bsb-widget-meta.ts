export interface BSBWidgetResizeMeta {
  canResizeWidth: boolean;
  canResizeHeight: boolean;
  minWidth: number;
  minHeight: number;
  widthProperty?: string;
  heightProperty?: string;
  editModeConditional?: 'nonInteractive' | 'nonInteractiveWithLabel';
}

const NO_RESIZE: BSBWidgetResizeMeta = {
  canResizeWidth: false,
  canResizeHeight: false,
  minWidth: 0,
  minHeight: 0,
};

export const BSB_WIDGET_RESIZE_META: Record<string, BSBWidgetResizeMeta> = {
  BSBHSlider: {
    canResizeWidth: true,
    canResizeHeight: false,
    minWidth: 50,
    minHeight: 30,
    widthProperty: 'sliderWidth',
  },
  BSBVSlider: {
    canResizeWidth: false,
    canResizeHeight: true,
    minWidth: 30,
    minHeight: 50,
    heightProperty: 'sliderHeight',
  },
  BSBKnob: {
    canResizeWidth: true,
    canResizeHeight: true,
    minWidth: 30,
    minHeight: 30,
    widthProperty: 'knobWidth',
    heightProperty: 'knobWidth',
  },
  BSBCheckBox: NO_RESIZE,
  BSBLabel: NO_RESIZE,
  BSBTextField: {
    canResizeWidth: true,
    canResizeHeight: false,
    minWidth: 50,
    minHeight: 24,
    widthProperty: 'textFieldWidth',
  },
  BSBDropdown: NO_RESIZE,
  BSBSubChannelDropdown: NO_RESIZE,
  BSBValue: {
    ...NO_RESIZE,
    editModeConditional: 'nonInteractive',
  },
  BSBXYController: {
    canResizeWidth: true,
    canResizeHeight: true,
    minWidth: 60,
    minHeight: 60,
    widthProperty: 'width',
    heightProperty: 'height',
  },
  BSBFileSelector: {
    canResizeWidth: true,
    canResizeHeight: false,
    minWidth: 10,
    minHeight: 30,
    widthProperty: 'textFieldWidth',
  },
  BSBLineObject: {
    canResizeWidth: true,
    canResizeHeight: true,
    minWidth: 60,
    minHeight: 40,
    widthProperty: 'canvasWidth',
    heightProperty: 'canvasHeight',
  },
  BSBGroup: {
    canResizeWidth: true,
    canResizeHeight: true,
    minWidth: 60,
    minHeight: 40,
    widthProperty: 'width',
    heightProperty: 'height',
  },
  BSBHSliderBank: {
    canResizeWidth: true,
    canResizeHeight: false,
    minWidth: 50,
    minHeight: 30,
    widthProperty: 'sliderWidth',
  },
  BSBVSliderBank: {
    canResizeWidth: false,
    canResizeHeight: true,
    minWidth: 30,
    minHeight: 50,
    heightProperty: 'sliderHeight',
  },
};
