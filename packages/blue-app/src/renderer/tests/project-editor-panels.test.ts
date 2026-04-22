import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectPropertiesSnapshot } from '../../shared/project-editor';
import GlobalOrchestraPanel from '../components/workbench/panels/GlobalOrchestraPanel';
import GlobalScorePanel from '../components/workbench/panels/GlobalScorePanel';
import ProjectPropertiesPanel from '../components/workbench/panels/ProjectPropertiesPanel';
import { createDynamicCsoundCompletionSource } from '../components/workbench/panels/editors/csound-completions';

interface MockProjectState {
  loaded: boolean;
  title: string;
  globalOrc: string;
  globalSco: string;
  projectProperties: ProjectPropertiesSnapshot;
  updateGlobalOrc: (value: string) => void | Promise<void>;
  updateGlobalSco: (value: string) => void | Promise<void>;
  updateProjectProperties: (
    patch: Partial<ProjectPropertiesSnapshot>,
  ) => void | Promise<void>;
}

const { mockProjectState } = vi.hoisted(() => {
  const projectProperties: ProjectPropertiesSnapshot = {
    title: '',
    author: '',
    notes: '',
    sampleRate: '44100',
    ksmps: '64',
    nchnls: '2',
    useZeroDbFS: false,
    zeroDbFS: '32768',
    diskSampleRate: '44100',
    diskKsmps: '64',
    diskChannels: '2',
    diskUseZeroDbFS: false,
    diskZeroDbFS: '32768',
    useAudioOut: true,
    useAudioIn: false,
    useMidiIn: false,
    useMidiOut: false,
    noteAmpsEnabled: true,
    outOfRangeEnabled: true,
    warningsEnabled: true,
    benchmarkEnabled: true,
    advancedSettings: '',
    completeOverride: false,
    fileName: '',
    askOnRender: false,
    diskNoteAmpsEnabled: true,
    diskOutOfRangeEnabled: true,
    diskWarningsEnabled: true,
    diskBenchmarkEnabled: true,
    diskAdvancedSettings: '',
    diskCompleteOverride: false,
    diskAlwaysRenderEntireProject: false,
    mediaFolder: '',
    copyToMediaFileOnImport: true,
  };

  return {
    mockProjectState: {
      loaded: false,
      title: '',
      globalOrc: '',
      globalSco: '',
      projectProperties,
      updateGlobalOrc: vi.fn(),
      updateGlobalSco: vi.fn(),
      updateProjectProperties: vi.fn(),
    } satisfies MockProjectState,
  };
});

vi.mock('../stores/project-store', () => ({
  useProjectStore: (selector: (state: MockProjectState) => unknown) =>
    selector(mockProjectState),
}));

beforeEach(() => {
  mockProjectState.loaded = false;
  mockProjectState.title = '';
  mockProjectState.globalOrc = '';
  mockProjectState.globalSco = '';
  mockProjectState.projectProperties = {
    ...mockProjectState.projectProperties,
    title: '',
    author: '',
    notes: '',
    sampleRate: '44100',
    ksmps: '64',
    nchnls: '2',
  };
  vi.clearAllMocks();
});

describe('Project editor panels', () => {
  it('shows the global orchestra empty state when unloaded', () => {
    const html = renderToStaticMarkup(createElement(GlobalOrchestraPanel));

    expect(html).toContain('No project loaded');
    expect(html).toContain('Open a project to edit the global orchestra text.');
  });

  it('renders the global orchestra editor when loaded', () => {
    mockProjectState.loaded = true;
    mockProjectState.title = 'Loaded Project';
    mockProjectState.globalOrc = 'instr 1\n  out 0\nendin';

    const html = renderToStaticMarkup(createElement(GlobalOrchestraPanel));

    expect(html).toContain('data-editor-kind="codemirror"');
    expect(html).toContain('data-editor-language="csound-orc"');
    expect(html).toContain('aria-label="Global Orchestra Csound editor"');
    expect(html).toContain('instr 1');
    expect(html).not.toContain('textarea');
  });

  it('adapts dynamic Csound completions for the selected editor', async () => {
    const source = createDynamicCsoundCompletionSource([
      (context) => [
        {
          label: `project_${context.text.length}_${context.position}`,
          type: 'function',
          detail: context.explicit ? 'explicit' : 'implicit',
        },
      ],
    ]);
    const result = source({
      explicit: true,
      pos: 4,
      state: {
        doc: {
          toString: () => 'instr 1\nendin',
        },
      },
      matchBefore: () => ({ from: 0, to: 4, text: 'proj' }),
    } as never);

    const resolved = result instanceof Promise ? await result : result;

    expect(resolved?.from).toBe(0);
    expect(resolved?.options).toEqual([
      {
        label: 'project_13_4',
        type: 'function',
        detail: 'explicit',
      },
    ]);
  });

  it('shows the project properties empty state when unloaded', () => {
    const html = renderToStaticMarkup(createElement(ProjectPropertiesPanel));

    expect(html).toContain('No project loaded');
    expect(html).toContain('Open a project to edit project information, render settings, and media paths.');
  });

  it('renders the built-in project properties tabs when loaded', () => {
    mockProjectState.loaded = true;
    mockProjectState.title = 'Loaded Project';
    mockProjectState.projectProperties = {
      ...mockProjectState.projectProperties,
      title: 'Loaded Project',
      author: 'Composer',
      sampleRate: '48000',
      ksmps: '32',
    };

    const html = renderToStaticMarkup(createElement(ProjectPropertiesPanel));

    expect(html).toContain('Project Information');
    expect(html).toContain('Realtime');
    expect(html).toContain('Disk Render');
    expect(html).toContain('Media');
    expect(html).not.toContain('Project Properties');
  });

  it('renders the global score editor when loaded', () => {
    mockProjectState.loaded = true;
    mockProjectState.title = 'Loaded Project';
    mockProjectState.globalSco = 'e';

    const html = renderToStaticMarkup(createElement(GlobalScorePanel));

    expect(html).not.toContain('Global Score');
    expect(html).toContain('textarea');
  });
});
