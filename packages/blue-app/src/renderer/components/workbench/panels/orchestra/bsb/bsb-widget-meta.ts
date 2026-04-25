export interface BSBWidgetResizeMeta {
  canResizeWidth: boolean;
  canResizeHeight: boolean;
  minWidth: number;
  minHeight: number;
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
  },
  BSBVSlider: {
    canResizeWidth: false,
    canResizeHeight: true,
    minWidth: 30,
    minHeight: 50,
  },
  BSBKnob: {
    canResizeWidth: true,
    canResizeHeight: true,
    minWidth: 30,
    minHeight: 30,
  },
  BSBCheckBox: NO_RESIZE,
  BSBLabel: NO_RESIZE,
  BSBTextField: {
    canResizeWidth: true,
    canResizeHeight: false,
    minWidth: 50,
    minHeight: 24,
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
  },
  BSBFileSelector: {
    canResizeWidth: true,
    canResizeHeight: false,
    minWidth: 100,
    minHeight: 24,
  },
  BSBLineObject: {
    canResizeWidth: true,
    canResizeHeight: true,
    minWidth: 60,
    minHeight: 40,
  },
  BSBGroup: {
    canResizeWidth: true,
    canResizeHeight: true,
    minWidth: 60,
    minHeight: 40,
  },
  BSBHSliderBank: {
    canResizeWidth: true,
    canResizeHeight: false,
    minWidth: 50,
    minHeight: 30,
  },
  BSBVSliderBank: {
    canResizeWidth: false,
    canResizeHeight: true,
    minWidth: 30,
    minHeight: 50,
  },
};
