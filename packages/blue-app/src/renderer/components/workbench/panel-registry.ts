export type PanelMode = 'editor' | 'properties' | 'output';

export interface PanelDescriptor {
  id: string;
  title: string;
  mode: PanelMode;
  openAtStartup: boolean;
  position?: number;
  icon?: string;
  auxiliaryGroupId?: 'properties-main' | 'output-main';
  auxiliaryRailLabel?: string;
}

export const PANEL_REGISTRY: PanelDescriptor[] = [
  { id: 'ScoreTopComponent', title: 'Score', mode: 'editor', openAtStartup: true, icon: '♪' },
  { id: 'OrchestraTopComponent', title: 'Orchestra', mode: 'editor', openAtStartup: true, position: 200, icon: '🎻' },
  { id: 'GlobalOrchestraTopComponent', title: 'Global Orchestra', mode: 'editor', openAtStartup: true },
  { id: 'GlobalScoreTopComponent', title: 'Global Score', mode: 'editor', openAtStartup: true },
  { id: 'TablesTopComponent', title: 'Tables', mode: 'editor', openAtStartup: true },
  { id: 'UserDefinedOpcodeTopComponent', title: 'UDOs', mode: 'editor', openAtStartup: true, position: 300 },
  { id: 'ProjectPropertiesTopComponent', title: 'Project Properties', mode: 'editor', openAtStartup: true },
  { id: 'BlueLiveTopComponent', title: 'Blue Live', mode: 'editor', openAtStartup: true, position: 800, icon: '🔴' },
  { id: 'ScratchPadTopComponent', title: 'Scratch Pad', mode: 'editor', openAtStartup: false },

  {
    id: 'SoundObjectPropertiesTopComponent',
    title: 'Sound Object Properties',
    mode: 'properties',
    openAtStartup: false,
    auxiliaryGroupId: 'properties-main',
    auxiliaryRailLabel: 'Properties',
  },
  { id: 'SoundObjectLibraryTopComponent', title: 'Sound Object Library', mode: 'properties', openAtStartup: false },
  { id: 'MarkersTopComponent', title: 'Markers', mode: 'properties', openAtStartup: false },
  { id: 'AudioFilePlayerTopComponent', title: 'Audio File Player', mode: 'properties', openAtStartup: false },
  {
    id: 'MidiInputPanelTopComponent',
    title: 'MIDI Input',
    mode: 'properties',
    openAtStartup: false,
    auxiliaryGroupId: 'properties-main',
    auxiliaryRailLabel: 'MIDI Input',
  },

  {
    id: 'ScoreObjectEditorTopComponent',
    title: 'Score Object Editor',
    mode: 'output',
    openAtStartup: false,
    auxiliaryGroupId: 'output-main',
    auxiliaryRailLabel: 'Score Editor',
  },
  {
    id: 'MixerTopComponent',
    title: 'Mixer',
    mode: 'output',
    openAtStartup: false,
    position: 200,
    icon: '🎛',
    auxiliaryGroupId: 'output-main',
    auxiliaryRailLabel: 'Mixer',
  },
  { id: 'VirtualKeyboardTopComponent', title: 'Virtual Keyboard', mode: 'output', openAtStartup: false, position: 800, icon: '🎹' },
  { id: 'JavaScriptConsoleTopComponent', title: 'JavaScript Console', mode: 'output', openAtStartup: false },
  { id: 'JythonConsoleTopComponent', title: 'Jython Console', mode: 'output', openAtStartup: false },
  { id: 'ClojureConsoleTopComponent', title: 'Clojure Console', mode: 'output', openAtStartup: false },
  { id: 'BlueFileManagerTopComponent', title: 'File Manager', mode: 'output', openAtStartup: false },
];

export const PANEL_MAP = new Map(PANEL_REGISTRY.map((p) => [p.id, p]));

export function getPanel(id: string): PanelDescriptor | undefined {
  return PANEL_MAP.get(id);
}

export function getPanelsByMode(mode: PanelMode): PanelDescriptor[] {
  return PANEL_REGISTRY.filter((p) => p.mode === mode);
}

export function getDefaultEditorPanels(): PanelDescriptor[] {
  return getPanelsByMode('editor').filter((p) => p.openAtStartup);
}

export function isAuxiliaryEligiblePanel(panelId: string): boolean {
  return PANEL_MAP.has(panelId);
}
