import { type MenuItemConstructorOptions } from 'electron';
import { getPanelsByMode, type PanelMode } from '../shared/workbench-menu';

export interface ApplicationMenuTemplateOptions {
  hasLoadedProject: boolean;
  isDarwin: boolean;
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onSaveFileAs: () => void;
  onRequestQuit: () => void;
  onOpenSettings: () => void;
  onFocusPanel: (panelId: string) => void;
  onToggleDevTools: () => void;
  onResetLayout: () => void;
  onPlay: () => void;
  onStop: () => void;
  onGenerateCsdToScreen: () => void;
  onGenerateCsdToDisk: () => void;
}

function buildWorkbenchMenuItems(
  mode: PanelMode,
  onFocusPanel: (panelId: string) => void,
): MenuItemConstructorOptions[] {
  return getPanelsByMode(mode).map((panel) => ({
    label: panel.title,
    click: () => onFocusPanel(panel.id),
  }));
}

function buildProjectMenuTemplate(options: ApplicationMenuTemplateOptions): MenuItemConstructorOptions[] {
  const enabled = options.hasLoadedProject;

  return [
    {
      label: 'Play',
      enabled,
      click: () => options.onPlay(),
    },
    {
      label: 'Stop',
      enabled,
      click: () => options.onStop(),
    },
    { type: 'separator' },
    {
      label: 'Generate CSD to Screen',
      accelerator: options.isDarwin ? 'Cmd+Shift+G' : 'Ctrl+Shift+G',
      enabled,
      click: () => options.onGenerateCsdToScreen(),
    },
    {
      label: 'Generate CSD to Disk…',
      accelerator: options.isDarwin ? 'Cmd+G' : 'Ctrl+G',
      enabled,
      click: () => options.onGenerateCsdToDisk(),
    },
  ];
}

function buildWindowMenuTemplate(options: ApplicationMenuTemplateOptions): MenuItemConstructorOptions[] {
  return [
    { label: 'Editors', submenu: buildWorkbenchMenuItems('editor', options.onFocusPanel) },
    { label: 'Properties', submenu: buildWorkbenchMenuItems('properties', options.onFocusPanel) },
    { label: 'Output', submenu: buildWorkbenchMenuItems('output', options.onFocusPanel) },
    { label: 'REPL', submenu: buildWorkbenchMenuItems('repl', options.onFocusPanel) },
    {
      label: 'Toggle Dev Tools',
      accelerator: options.isDarwin ? 'Cmd+Alt+I' : 'Ctrl+Shift+I',
      click: () => options.onToggleDevTools(),
    },
    { type: 'separator' as const },
    {
      label: 'Reset Default Layout',
      click: () => options.onResetLayout(),
    },
  ];
}

export function buildApplicationMenuTemplate(
  options: ApplicationMenuTemplateOptions,
): MenuItemConstructorOptions[] {
  const template: MenuItemConstructorOptions[] = [];

  if (options.isDarwin) {
    template.push({
      label: 'Blue',
      submenu: [
        { label: 'About Blue', click: () => { /* deferred */ } },
        { type: 'separator' },
        {
          label: 'Settings...',
          accelerator: 'Cmd+,',
          click: () => options.onOpenSettings(),
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        {
          label: 'Quit Blue',
          accelerator: 'Cmd+Q',
          click: () => options.onRequestQuit(),
        },
      ],
    });
  }

  template.push({
    label: 'File',
    submenu: [
      { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => options.onNewFile() },
      { label: 'Open...', accelerator: 'CmdOrCtrl+O', click: () => options.onOpenFile() },
      { type: 'separator' },
      { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => options.onSaveFile() },
      { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => options.onSaveFileAs() },
      ...(options.isDarwin
        ? []
        : [
            { type: 'separator' as const },
            {
              label: 'Settings...',
              accelerator: 'CmdOrCtrl+,',
              click: () => options.onOpenSettings(),
            },
            { type: 'separator' as const },
            {
              label: 'Quit',
              accelerator: 'CmdOrCtrl+Q',
              click: () => options.onRequestQuit(),
            },
          ]),
    ],
  });

  template.push({
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
    ],
  });

  template.push({
    label: 'Project',
    submenu: buildProjectMenuTemplate(options),
  });

  template.push({
    label: 'Window',
    submenu: buildWindowMenuTemplate(options),
  });

  return template;
}
