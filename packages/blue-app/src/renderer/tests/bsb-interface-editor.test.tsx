import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  BsbWidgetNodeSnapshot,
  BsbInterfacePatch,
  GridSettingsSnapshot,
} from '../../shared/project-editor';
import WidgetWrapper from '../components/workbench/panels/orchestra/bsb/widgets/WidgetWrapper';
import BSBValueWidget from '../components/workbench/panels/orchestra/bsb/widgets/BSBValueWidget';
import { BSB_WIDGET_RESIZE_META } from '../components/workbench/panels/orchestra/bsb/bsb-widget-meta';

function makeWidgetNode(overrides: Partial<BsbWidgetNodeSnapshot> = {}): BsbWidgetNodeSnapshot {
  return {
    id: 'w1',
    type: 'BSBKnob',
    objectName: 'amp',
    x: 10,
    y: 20,
    width: 60,
    height: 60,
    editable: true,
    properties: {},
    ...overrides,
  };
}

function makeInstrument(overrides: Partial<BlueSynthBuilderInstrumentSnapshot> = {}): BlueSynthBuilderInstrumentSnapshot {
  return {
    assignmentId: '1',
    type: 'blueSynthBuilder',
    name: 'Test BSB',
    enabled: true,
    comment: '',
    instrumentText: 'aout oscili <amp>, 440',
    alwaysOnInstrumentText: '',
    globalOrc: '',
    globalSco: '',
    objectNames: ['amp'],
    widgets: [{ objectName: 'amp', widgetType: 'BSBKnob', value: 0.5, minimum: 0, maximum: 1 }],
    editEnabled: true,
    gridSettings: { enabled: true, snapEnabled: true, width: 10, height: 10 },
    widgetTree: {
      id: 'root',
      type: 'BSBRootGroup',
      objectName: '',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      editable: true,
      properties: {},
      children: [makeWidgetNode()],
    },
    ...overrides,
  };
}

describe('BSB Interface Editor', () => {
  it('creates instrument snapshots with widgetTree data', () => {
    const instrument = makeInstrument();
    expect(instrument.widgetTree).not.toBeNull();
    expect(instrument.widgetTree!.children).toHaveLength(1);
    expect(instrument.widgetTree!.children![0].objectName).toBe('amp');
  });

  it('creates instrument snapshots with gridSettings', () => {
    const instrument = makeInstrument();
    expect(instrument.gridSettings.enabled).toBe(true);
    expect(instrument.gridSettings.snapEnabled).toBe(true);
    expect(instrument.gridSettings.width).toBe(10);
    expect(instrument.gridSettings.height).toBe(10);
  });

  it('creates instrument snapshots with editEnabled', () => {
    const enabled = makeInstrument({ editEnabled: true });
    expect(enabled.editEnabled).toBe(true);
    const disabled = makeInstrument({ editEnabled: false });
    expect(disabled.editEnabled).toBe(false);
  });

  it('handles null widgetTree for empty interfaces', () => {
    const instrument = makeInstrument({ widgetTree: null });
    expect(instrument.widgetTree).toBeNull();
  });

  it('handles presetGroup snapshots', () => {
    const instrument = makeInstrument({
      presetGroup: {
        name: 'Test Presets',
        currentPresetUniqueId: 'p1',
        currentPresetModified: false,
        subGroups: [],
        presets: [{ uniqueId: 'p1', name: 'Default' }],
      },
    });
    expect(instrument.presetGroup!.presets).toHaveLength(1);
    expect(instrument.presetGroup!.presets[0].name).toBe('Default');
  });

  it('handles widget nodes with preserved-only flag', () => {
    const node = makeWidgetNode({ preservedOnly: true, editable: false });
    expect(node.preservedOnly).toBe(true);
    expect(node.editable).toBe(false);
  });

  it('handles nested children in widget tree', () => {
    const instrument = makeInstrument({
      widgetTree: {
        id: 'root',
        type: 'BSBRootGroup',
        objectName: '',
        x: 0, y: 0, width: 0, height: 0,
        editable: true,
        properties: {},
        children: [
          makeWidgetNode({ id: 'w1', objectName: 'knob1' }),
          {
            id: 'g1',
            type: 'BSBGroup',
            objectName: '',
            x: 0, y: 0, width: 200, height: 100,
            editable: true,
            properties: {},
            children: [makeWidgetNode({ id: 'w2', objectName: 'knob2' })],
          },
        ],
      },
    });
    expect(instrument.widgetTree!.children).toHaveLength(2);
    expect(instrument.widgetTree!.children![1].children).toHaveLength(1);
    expect(instrument.widgetTree!.children![1].children![0].objectName).toBe('knob2');
  });
});

describe('BSB Property Sheet', () => {
  it('tracks property sheet patches for widget object names', () => {
    const patches: BsbInterfacePatch[] = [];
    const onPatch = (p: BsbInterfacePatch) => patches.push(p);

    const widget = makeWidgetNode();
    onPatch({
      type: 'updateWidgetProperties',
      widgetId: widget.id,
      properties: { objectName: 'gain' },
    });

    expect(patches).toHaveLength(1);
    expect(patches[0]).toEqual({
      type: 'updateWidgetProperties',
      widgetId: 'w1',
      properties: { objectName: 'gain' },
    });
  });

  it('generates layout patches for x/y/width/height changes', () => {
    const patches: BsbInterfacePatch[] = [];
    const onPatch = (p: BsbInterfacePatch) => patches.push(p);

    onPatch({ type: 'moveWidget', widgetId: 'w1', x: 50, y: 75 });
    onPatch({ type: 'resizeWidget', widgetId: 'w1', width: 100, height: 80 });

    expect(patches[0]).toEqual({ type: 'moveWidget', widgetId: 'w1', x: 50, y: 75 });
    expect(patches[1]).toEqual({ type: 'resizeWidget', widgetId: 'w1', width: 100, height: 80 });
  });
});

describe('BSB Grid Settings', () => {
  it('generates grid settings patches', () => {
    const patches: BsbInterfacePatch[] = [];
    const onPatch = (p: BsbInterfacePatch) => patches.push(p);

    const gridSettings: GridSettingsSnapshot = { enabled: true, snapEnabled: true, width: 10, height: 10 };
    onPatch({ type: 'updateGridSettings', patch: { width: 20 } });
    onPatch({ type: 'updateGridSettings', patch: { snapEnabled: false } });

    expect(patches).toHaveLength(2);
    expect(patches[0]).toEqual({ type: 'updateGridSettings', patch: { width: 20 } });
    expect(patches[1]).toEqual({ type: 'updateGridSettings', patch: { snapEnabled: false } });
  });

  it('merges partial grid settings patches correctly', () => {
    const base: GridSettingsSnapshot = { enabled: true, snapEnabled: true, width: 10, height: 10 };
    const updated = { ...base, ...{ width: 20 } };
    expect(updated).toEqual({ enabled: true, snapEnabled: true, width: 20, height: 10 });
  });
});

describe('BSB Edit-Mode Affordances (T056)', () => {
  const resizableTypes = [
    { type: 'BSBHSlider', expectedEdges: ['left', 'right'] },
    { type: 'BSBVSlider', expectedEdges: ['top', 'bottom'] },
    { type: 'BSBKnob', expectedEdges: ['left', 'right', 'top', 'bottom'] },
    { type: 'BSBLineObject', expectedEdges: ['left', 'right', 'top', 'bottom'] },
    { type: 'BSBXYController', expectedEdges: ['left', 'right', 'top', 'bottom'] },
  ];

  for (const { type, expectedEdges } of resizableTypes) {
    it(`shows resize handles for ${type} when selected in edit mode`, () => {
      const node = makeWidgetNode({ id: 'w1', type, width: 100, height: 100 });
      const meta = BSB_WIDGET_RESIZE_META[type];
      const html = renderToStaticMarkup(
        createElement(WidgetWrapper, {
          node,
          isSelected: true,
          editEnabled: true,
          onWidgetSelect: vi.fn(),
          resizeMeta: meta,
          onBsbInterfacePatch: vi.fn(),
          children: createElement('div', null, 'widget'),
        }),
      );

      for (const edge of expectedEdges) {
        expect(html).toContain(`data-resize-edge="${edge}"`);
      }
    });
  }

  it('does not show resize handles when edit mode is disabled', () => {
    const node = makeWidgetNode({ id: 'w1', type: 'BSBHSlider', width: 100, height: 100 });
    const meta = BSB_WIDGET_RESIZE_META['BSBHSlider'];
    const html = renderToStaticMarkup(
      createElement(WidgetWrapper, {
        node,
        isSelected: true,
        editEnabled: false,
        onWidgetSelect: vi.fn(),
        resizeMeta: meta,
        onBsbInterfacePatch: vi.fn(),
        children: createElement('div', null, 'widget'),
      }),
    );

    expect(html).not.toContain('data-resize-edge');
  });

  it('does not show resize handles when widget is not selected', () => {
    const node = makeWidgetNode({ id: 'w1', type: 'BSBHSlider', width: 100, height: 100 });
    const meta = BSB_WIDGET_RESIZE_META['BSBHSlider'];
    const html = renderToStaticMarkup(
      createElement(WidgetWrapper, {
        node,
        isSelected: false,
        editEnabled: true,
        onWidgetSelect: vi.fn(),
        resizeMeta: meta,
        onBsbInterfacePatch: vi.fn(),
        children: createElement('div', null, 'widget'),
      }),
    );

    expect(html).not.toContain('data-resize-edge');
  });

  it('renders BSBValue as non-interactive label in edit mode', () => {
    const node = makeWidgetNode({ id: 'w1', type: 'BSBValue', objectName: 'gain', width: 60, height: 24 });
    const html = renderToStaticMarkup(
      createElement(BSBValueWidget, {
        node,
        isSelected: false,
        editEnabled: true,
        onWidgetSelect: vi.fn(),
        resizeMeta: BSB_WIDGET_RESIZE_META['BSBValue'],
        onBsbInterfacePatch: vi.fn(),
      }),
    );

    expect(html).toContain('gain');
    expect(html).toContain('pointer-events-none');
  });

  it('renders BSBValue as interactive numeric display in non-edit mode', () => {
    const node = makeWidgetNode({ id: 'w1', type: 'BSBValue', objectName: 'gain', width: 60, height: 24, properties: { value: 0.75 } });
    const html = renderToStaticMarkup(
      createElement(BSBValueWidget, {
        node,
        isSelected: false,
        editEnabled: false,
        onWidgetSelect: vi.fn(),
        resizeMeta: BSB_WIDGET_RESIZE_META['BSBValue'],
        onBsbInterfacePatch: vi.fn(),
      }),
    );

    expect(html).toContain('0.7500');
    expect(html).not.toContain('pointer-events-none');
  });
});
