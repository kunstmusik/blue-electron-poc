import { describe, expect, it, vi } from 'vitest';
import { buildApplicationMenuTemplate } from './application-menu';

function createHandlers() {
  return {
    onNewFile: vi.fn(),
    onOpenFile: vi.fn(),
    onSaveFile: vi.fn(),
    onSaveFileAs: vi.fn(),
    onRequestQuit: vi.fn(),
    onOpenSettings: vi.fn(),
    onFocusPanel: vi.fn(),
    onToggleDevTools: vi.fn(),
    onResetLayout: vi.fn(),
    onPlay: vi.fn(),
    onStop: vi.fn(),
    onGenerateCsdToScreen: vi.fn(),
    onGenerateCsdToDisk: vi.fn(),
  };
}

function getSubmenu(item: any): any[] {
  return Array.isArray(item.submenu) ? item.submenu : [];
}

function getLabels(items: any[]): Array<string | undefined> {
  return items.map((item) => item.label).filter((label): label is string => Boolean(label));
}

describe('application menu template', () => {
  it('builds the macOS Blue menu with the expected order and actions', () => {
    const handlers = createHandlers();
    const template = buildApplicationMenuTemplate({
      hasLoadedProject: true,
      isDarwin: true,
      ...handlers,
    });

    expect(template.map((item) => item.label)).toEqual(['Blue', 'File', 'Edit', 'Project', 'Window']);

    const blueMenu = getSubmenu(template[0]);
    expect(blueMenu.map((item) => item.label)).toContain('About Blue');
    expect(blueMenu.map((item) => item.label)).toContain('Settings...');

    const blueSettings = blueMenu.find((item) => item.label === 'Settings...');
    expect(blueSettings?.accelerator).toBe('Cmd+,');
    blueSettings?.click?.();
    expect(handlers.onOpenSettings).toHaveBeenCalledTimes(1);

    const fileMenu = getSubmenu(template[1]);
    expect(getLabels(fileMenu)).toEqual(['New', 'Open...', 'Save', 'Save As...']);

    const projectMenu = getSubmenu(template[3]);
    expect(projectMenu.find((item) => item.label === 'Play')?.enabled).toBe(true);
    expect(projectMenu.find((item) => item.label === 'Stop')?.enabled).toBe(true);
    projectMenu.find((item) => item.label === 'Play')?.click?.();
    expect(handlers.onPlay).toHaveBeenCalledTimes(1);

    const windowMenu = getSubmenu(template[4]);
    expect(windowMenu.map((item) => item.label).slice(0, 5)).toEqual(['Editors', 'Properties', 'Output', 'REPL', 'Toggle Dev Tools']);
    expect(windowMenu.find((item) => item.label === 'Reset Default Layout')).toBeTruthy();

    const editorsMenu = getSubmenu(windowMenu.find((item) => item.label === 'Editors'));
    expect(editorsMenu.map((item) => item.label).slice(0, 3)).toEqual(['Score', 'Orchestra', 'Global Orchestra']);
    editorsMenu[0]?.click?.();
    expect(handlers.onFocusPanel).toHaveBeenCalledWith('ScoreTopComponent');
  });

  it('builds the non-Darwin File menu with Settings and Quit entries', () => {
    const handlers = createHandlers();
    const template = buildApplicationMenuTemplate({
      hasLoadedProject: false,
      isDarwin: false,
      ...handlers,
    });

    expect(template.map((item) => item.label)).toEqual(['File', 'Edit', 'Project', 'Window']);

    const fileMenu = getSubmenu(template[0]);
    expect(getLabels(fileMenu)).toEqual(['New', 'Open...', 'Save', 'Save As...', 'Settings...', 'Quit']);

    const settingsItem = fileMenu.find((item) => item.label === 'Settings...');
    expect(settingsItem?.accelerator).toBe('CmdOrCtrl+,');
    settingsItem?.click?.();
    expect(handlers.onOpenSettings).toHaveBeenCalledTimes(1);

    const quitItem = fileMenu.find((item) => item.label === 'Quit');
    expect(quitItem?.accelerator).toBe('CmdOrCtrl+Q');
    quitItem?.click?.();
    expect(handlers.onRequestQuit).toHaveBeenCalledTimes(1);

    const projectMenu = getSubmenu(template[2]);
    expect(projectMenu.find((item) => item.label === 'Play')?.enabled).toBe(false);
    expect(projectMenu.find((item) => item.label === 'Generate CSD to Screen')?.enabled).toBe(false);
  });
});