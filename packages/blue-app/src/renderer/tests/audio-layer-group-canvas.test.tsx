// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioClip, TimeDuration, TimePosition } from '@blue/data';
import AudioLayerGroupCanvas from '../components/workbench/panels/score/layer-groups/AudioLayerGroupCanvas';
import type {
  AudioLayerGroupSnapshot,
  ScoreLayerGroupSnapshot,
  ScoreRowObjectSnapshot,
} from '../components/workbench/panels/score/types';
import { useProjectStore } from '../stores/project-store';
import { useScoreSelectionStore } from '../stores/score-selection-store';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const originalProjectActions = {
  applyProjectDocumentPatch: useProjectStore.getState().applyProjectDocumentPatch,
  addScoreObjects: useProjectStore.getState().addScoreObjects,
  moveScoreObjects: useProjectStore.getState().moveScoreObjects,
  removeScoreObjects: useProjectStore.getState().removeScoreObjects,
  resizeScoreObjects: useProjectStore.getState().resizeScoreObjects,
};

function createSerializedClipXml(name: string, filePath: string, durationBeats: number): string {
  const clip = new AudioClip();
  clip.setName(name);
  clip.setAudioFile(filePath);
  clip.setAudioDuration(durationBeats);
  clip.setStartTime(TimePosition.beats(0));
  clip.setSubjectiveDuration(TimeDuration.beats(durationBeats));
  clip.setBackgroundColor(0x669966);
  return clip.saveAsXML().toXml();
}

function createAudioItem(
  objectId: string,
  name: string,
  layerIndex: number,
  objectIndex: number,
  startBeats: number,
  durationBeats: number,
  fadeInBeats: number = 0,
  fadeOutBeats: number = 0,
): ScoreRowObjectSnapshot {
  const filePath = `/tmp/${name.replace(/\s+/g, '-').toLowerCase()}.wav`;
  return {
    objectId,
    objectType: 'AudioClip',
    name,
    startBeats,
    durationBeats,
    startTimeBase: 'BEATS',
    durationTimeBase: 'BEATS',
    backgroundColor: 0x669966,
    isContainer: false,
    editorTarget: {
      selectionId: objectId,
      selectedObjectType: 'AudioClip',
      editorObjectType: 'AudioClip',
      ownerKind: 'timeline',
      displayContext: 'timeline',
      location: {
        rootGroupIndex: 0,
        containerPath: [],
        layerIndex,
        objectIndex,
      },
      supportsTimeBehavior: false,
      supportsRepeatPoint: false,
      supportsNoteProcessorChain: false,
    },
    serializedXml: createSerializedClipXml(name, filePath, durationBeats),
    barRenderer: {
      kind: 'audioClip',
      labelLines: [name],
      audioFilePath: filePath,
      waveformKey: `aclp:${filePath}`,
      fileStartTimeBeats: 0,
      audioDurationBeats: durationBeats,
      looping: true,
      fadeInBeats,
      fadeInType: 'LINEAR',
      fadeOutBeats,
      fadeOutType: 'LINEAR',
    },
  };
}

function createAudioGroup(itemsByLayer: ScoreRowObjectSnapshot[][]): AudioLayerGroupSnapshot {
  return {
    groupId: 'audio-group',
    groupType: 'audio',
    name: 'Audio Layer Group',
    layerCount: itemsByLayer.length,
    isOpenableContainer: false,
    layers: itemsByLayer.map((items, index) => ({
      layerId: `audio-group-layer-${index}`,
      name: `Layer ${index + 1}`,
      height: 44,
      muted: false,
      solo: false,
      items,
    })),
  };
}

function createSoundItem(
  objectId: string,
  name: string,
  layerIndex: number,
  objectIndex: number,
  startBeats: number,
  durationBeats: number,
): ScoreRowObjectSnapshot {
  return {
    objectId,
    objectType: 'GenericScore',
    name,
    startBeats,
    durationBeats,
    startTimeBase: 'BEATS',
    durationTimeBase: 'BEATS',
    backgroundColor: 0x336699,
    isContainer: false,
    editorTarget: {
      selectionId: objectId,
      selectedObjectType: 'GenericScore',
      editorObjectType: 'GenericScore',
      ownerKind: 'timeline',
      displayContext: 'timeline',
      location: {
        rootGroupIndex: 0,
        containerPath: [],
        layerIndex,
        objectIndex,
      },
      supportsTimeBehavior: true,
      supportsRepeatPoint: true,
      supportsNoteProcessorChain: true,
    },
    barRenderer: {
      kind: 'fallback',
      labelLines: [name],
      reason: 'unknown-type',
    },
  };
}

function createSoundGroup(itemsByLayer: ScoreRowObjectSnapshot[][]): ScoreLayerGroupSnapshot {
  return {
    groupId: 'sound-group',
    groupType: 'polyObject',
    name: 'SoundObject Layer Group',
    layerCount: itemsByLayer.length,
    isOpenableContainer: true,
    layers: itemsByLayer.map((items, index) => ({
      layerId: `sound-group-layer-${index}`,
      name: `Layer ${index + 1}`,
      height: 44,
      muted: false,
      solo: false,
      items,
    })),
  };
}

function renderCanvas(group: AudioLayerGroupSnapshot, allLayerGroups: ScoreLayerGroupSnapshot[] = [group]): {
  container: HTMLDivElement;
  root: Root;
  surface: HTMLDivElement;
} {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = createRoot(container);
  act(() => {
    root.render(
      <AudioLayerGroupCanvas
        group={group}
        allLayerGroups={allLayerGroups}
        pixelsPerBeat={25}
        snapEnabled
        snapValue="BEAT"
        tempo={120}
        smpteFrameRate={30}
        meterMap={{ entries: [{ measure: 0, numBeats: 4, beatLength: 4, startBeat: 0 }] }}
      />,
    );
  });

  const surface = container.querySelector('[data-group-id="audio-group"]') as HTMLDivElement;
  Object.defineProperty(surface, 'getBoundingClientRect', {
    value: () => ({
      left: 0,
      top: 0,
      right: 400,
      bottom: 88,
      width: 400,
      height: 88,
      x: 0,
      y: 0,
      toJSON: () => undefined,
    }),
  });

  return { container, root, surface };
}

function openContextMenu(target: HTMLElement, clientX: number, clientY: number): void {
  const PointerEventCtor = window.PointerEvent ?? MouseEvent;
  target.dispatchEvent(new PointerEventCtor('pointerdown', { bubbles: true, button: 2, clientX, clientY }));
  target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2, clientX, clientY }));
}

function clickMenuItem(item: HTMLElement): void {
  const PointerEventCtor = window.PointerEvent ?? MouseEvent;
  item.dispatchEvent(new PointerEventCtor('pointermove', { bubbles: true }));
  item.dispatchEvent(new PointerEventCtor('pointerdown', { bubbles: true, button: 0 }));
  item.dispatchEvent(new PointerEventCtor('pointerup', { bubbles: true, button: 0 }));
  item.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }));
}

function dispatchDragEvent(
  target: HTMLElement,
  type: 'dragover' | 'drop',
  clientX: number,
  clientY: number,
  dataTransfer: DataTransfer,
): void {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY });
  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
  target.dispatchEvent(event);
}

function dispatchMouseEvent(
  target: EventTarget,
  type: string,
  clientX: number,
  clientY: number,
  init: MouseEventInit = {},
): void {
  target.dispatchEvent(new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX,
    clientY,
    ...init,
  }));
}

beforeEach(() => {
  useProjectStore.setState({
    applyProjectDocumentPatch: vi.fn().mockResolvedValue(undefined),
    addScoreObjects: vi.fn(),
    moveScoreObjects: vi.fn(),
    removeScoreObjects: vi.fn(),
    resizeScoreObjects: vi.fn(),
    audioClipEditorPreviewByObjectId: {},
  } as Partial<ReturnType<typeof useProjectStore.getState>>);
  useScoreSelectionStore.getState().clearSelection();
  useScoreSelectionStore.getState().clearClipboard();
});

afterEach(() => {
  useProjectStore.setState(originalProjectActions as Partial<ReturnType<typeof useProjectStore.getState>>);
  useProjectStore.setState({ audioClipEditorPreviewByObjectId: {} } as Partial<ReturnType<typeof useProjectStore.getState>>);
  useScoreSelectionStore.getState().clearSelection();
  useScoreSelectionStore.getState().clearClipboard();
  document.body.innerHTML = '';
});

describe('AudioLayerGroupCanvas', () => {
  it('creates audio clips from dropped files on the target audio layer', async () => {
    const group = createAudioGroup([[], []]);
    const { root, surface } = renderCanvas(group);
    const addScoreObjects = useProjectStore.getState().addScoreObjects as unknown as ReturnType<typeof vi.fn>;

    const file = new File(['wave'], 'drop.wav', { type: 'audio/wav' }) as File & { path?: string };
    file.path = '/tmp/drop.wav';
    const dataTransfer = {
      files: [file],
      getData: vi.fn().mockReturnValue(''),
    } as unknown as DataTransfer;

    await act(async () => {
      dispatchDragEvent(surface, 'dragover', 100, 50, dataTransfer);
      dispatchDragEvent(surface, 'drop', 100, 50, dataTransfer);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(addScoreObjects).toHaveBeenCalledTimes(1);
    expect(addScoreObjects).toHaveBeenCalledWith([
      expect.objectContaining({
        groupId: 'audio-group',
        layerIndex: 1,
        objectType: 'AudioClip',
        name: 'drop.wav',
        startBeats: 4,
        serializedXml: expect.stringContaining('/tmp/drop.wav'),
        barRenderer: expect.objectContaining({
          kind: 'audioClip',
          audioFilePath: '/tmp/drop.wav',
        }),
      }),
    ]);

    act(() => {
      root.unmount();
    });
  });

  it('shows the Java parity menu items and selects the clicked layer', () => {
    const group = createAudioGroup([
      [
        createAudioItem('audio-1', 'Kick', 0, 0, 0, 2),
        createAudioItem('audio-2', 'Snare', 0, 1, 3, 1),
      ],
      [createAudioItem('audio-3', 'Hat', 1, 0, 1, 1)],
    ]);
    const { root, surface } = renderCanvas(group);

    act(() => {
      openContextMenu(surface, 10, 10);
    });

    const menuItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    expect(menuItems.map((item) => item.textContent?.trim())).toEqual([
      'Paste',
      'Select Layer',
      'Select All Before',
      'Select All After',
    ]);

    const selectLayerItem = menuItems.find((item) => item.textContent?.includes('Select Layer'));
    expect(selectLayerItem).toBeTruthy();

    act(() => {
      clickMenuItem(selectLayerItem!);
    });

    expect([...useScoreSelectionStore.getState().selectedObjectIds]).toEqual(['audio-1', 'audio-2']);

    act(() => {
      root.unmount();
    });
  });

  it('shows fade curve options when right-clicking inside the fade region', () => {
    const group = createAudioGroup([
      [createAudioItem('audio-1', 'Kick', 0, 0, 0, 2, 0.5, 0)],
    ]);
    const { root, surface } = renderCanvas(group);
    const applyProjectDocumentPatch = useProjectStore.getState().applyProjectDocumentPatch as unknown as ReturnType<typeof vi.fn>;

    act(() => {
      openContextMenu(surface, 8, 10);
    });

    const menuItems = Array.from(document.body.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    expect(menuItems.map((item) => item.textContent?.trim())).toEqual([
      'Linear',
      'Constant Power',
      'Symmetric',
      'Fast',
      'Slow',
    ]);

    const constantPowerItem = menuItems.find((item) => item.textContent?.trim() === 'Constant Power');
    expect(constantPowerItem).toBeTruthy();

    act(() => {
      clickMenuItem(constantPowerItem!);
    });

    expect(applyProjectDocumentPatch).toHaveBeenCalledWith({
      score: {
        type: 'updateTypeSpecificEditor',
        target: group.layers[0]!.items[0]!.editorTarget,
        patch: { fadeInType: 'CONSTANT_POWER' },
      },
    });

    act(() => {
      root.unmount();
    });
  });

  it('shows fade handles on rollover without requiring selection', () => {
    const group = createAudioGroup([
      [createAudioItem('audio-1', 'Kick', 0, 0, 0, 2, 0.5, 0.5)],
    ]);
    const { container, root, surface } = renderCanvas(group);

    expect(container.querySelector('[data-fade-handle="in"]')).toBeNull();
    expect(container.querySelector('[data-fade-handle="out"]')).toBeNull();

    act(() => {
      dispatchMouseEvent(surface, 'mousemove', 10, 10);
    });

    expect(container.querySelector('[data-fade-handle="in"]')).toBeTruthy();
    expect(container.querySelector('[data-fade-handle="out"]')).toBeTruthy();

    act(() => {
      dispatchMouseEvent(surface, 'mousemove', 120, 10);
    });

    expect(container.querySelector('[data-fade-handle="in"]')).toBeNull();
    expect(container.querySelector('[data-fade-handle="out"]')).toBeNull();

    act(() => {
      root.unmount();
    });
  });

  it('pastes audio clipboard entries into the current layer using snapped time', () => {
    const group = createAudioGroup([[], []]);
    const { root, surface } = renderCanvas(group);
    const addScoreObjects = useProjectStore.getState().addScoreObjects as unknown as ReturnType<typeof vi.fn>;

    act(() => {
      useScoreSelectionStore.getState().copySelected([
        {
          objectId: 'clip-1',
          objectType: 'AudioClip',
          name: 'Clipboard Clip',
          startBeats: 1.5,
          durationBeats: 2,
          startTimeBase: 'BEATS',
          durationTimeBase: 'BEATS',
          backgroundColor: 0x669966,
          isContainer: false,
          layerIndex: 0,
          groupId: 'source-audio-group',
          serializedXml: createSerializedClipXml('Clipboard Clip', '/tmp/clipboard.wav', 2),
        },
      ]);
    });

    act(() => {
      openContextMenu(surface, 81, 10);
    });

    const pasteItem = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
      .find((item) => item.textContent?.trim() === 'Paste') as HTMLElement | undefined;

    expect(pasteItem).toBeTruthy();

    act(() => {
      clickMenuItem(pasteItem!);
    });

    expect(addScoreObjects).toHaveBeenCalledWith([
      expect.objectContaining({
        groupId: 'audio-group',
        layerIndex: 0,
        objectType: 'AudioClip',
        startBeats: 3,
        serializedXml: expect.stringContaining('/tmp/clipboard.wav'),
        barRenderer: expect.objectContaining({
          kind: 'audioClip',
          audioFilePath: '/tmp/clipboard.wav',
        }),
      }),
    ]);

    act(() => {
      root.unmount();
    });
  });

  it('pastes audio clipboard entries on cmd-click in an empty audio layer', () => {
    const group = createAudioGroup([[], []]);
    useScoreSelectionStore.getState().copySelected([
      {
        objectId: 'clip-1',
        objectType: 'AudioClip',
        name: 'Clipboard Clip',
        startBeats: 1.5,
        durationBeats: 2,
        startTimeBase: 'BEATS',
        durationTimeBase: 'BEATS',
        backgroundColor: 0x669966,
        isContainer: false,
        layerIndex: 0,
        groupId: 'audio-group',
        serializedXml: createSerializedClipXml('Clipboard Clip', '/tmp/clipboard.wav', 2),
      },
    ]);
    const { root, surface } = renderCanvas(group);
    const addScoreObjects = useProjectStore.getState().addScoreObjects as unknown as ReturnType<typeof vi.fn>;

    act(() => {
      dispatchMouseEvent(surface, 'mousedown', 81, 54, { metaKey: true });
    });

    expect(addScoreObjects).toHaveBeenCalledWith([
      expect.objectContaining({
        groupId: 'audio-group',
        layerIndex: 1,
        objectType: 'AudioClip',
        startBeats: 3,
        serializedXml: expect.stringContaining('/tmp/clipboard.wav'),
      }),
    ]);

    act(() => {
      root.unmount();
    });
  });

  it('rejects cmd-click paste when the translated audio target layer cannot accept the copied object', () => {
    const soundGroup = createSoundGroup([[createSoundItem('sound-1', 'Sine', 0, 0, 0, 2)]]);
    const group = createAudioGroup([[]]);
    useScoreSelectionStore.getState().copySelected([
      {
        objectId: 'sound-1',
        objectType: 'GenericScore',
        name: 'Sine',
        startBeats: 0,
        durationBeats: 2,
        startTimeBase: 'BEATS',
        durationTimeBase: 'BEATS',
        backgroundColor: 0x336699,
        isContainer: false,
        layerIndex: 0,
        groupId: 'sound-group',
      },
    ]);
    const { root, surface } = renderCanvas(group, [soundGroup, group]);
    const addScoreObjects = useProjectStore.getState().addScoreObjects as unknown as ReturnType<typeof vi.fn>;

    act(() => {
      dispatchMouseEvent(surface, 'mousedown', 81, 10, { metaKey: true });
    });

    expect(addScoreObjects).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
  });

  it('starts a selection marquee from an audio layer and selects across layer groups', async () => {
    const soundGroup = createSoundGroup([[createSoundItem('sound-1', 'Sine', 0, 0, 1, 1)]]);
    const group = createAudioGroup([[createAudioItem('audio-1', 'Kick', 0, 0, 2, 1)]]);
    const { root, surface } = renderCanvas(group, [soundGroup, group]);

    await act(async () => {
      dispatchMouseEvent(surface, 'mousedown', 0, 10);
      dispatchMouseEvent(window, 'mousemove', 80, -70);
      dispatchMouseEvent(window, 'mouseup', 80, -70);
      await Promise.resolve();
    });

    expect([...useScoreSelectionStore.getState().selectedObjectIds]).toEqual(['sound-1', 'audio-1']);

    act(() => {
      root.unmount();
    });
  });

  it('toggles audio clip selection with shift-click', () => {
    const group = createAudioGroup([
      [
        createAudioItem('audio-1', 'Kick', 0, 0, 0, 2),
        createAudioItem('audio-2', 'Snare', 0, 1, 3, 1),
      ],
    ]);
    const { root, surface } = renderCanvas(group);

    act(() => {
      dispatchMouseEvent(surface, 'mousedown', 10, 10);
    });

    expect([...useScoreSelectionStore.getState().selectedObjectIds]).toEqual(['audio-1']);

    act(() => {
      dispatchMouseEvent(surface, 'mousedown', 80, 10, { shiftKey: true });
    });

    expect([...useScoreSelectionStore.getState().selectedObjectIds]).toEqual(['audio-1', 'audio-2']);

    act(() => {
      dispatchMouseEvent(surface, 'mousedown', 10, 10, { shiftKey: true });
    });

    expect([...useScoreSelectionStore.getState().selectedObjectIds]).toEqual(['audio-2']);

    act(() => {
      root.unmount();
    });
  });

  it('moves selected audio clips and commits the canonical move patch on mouseup', async () => {
    const group = createAudioGroup([
      [createAudioItem('audio-1', 'Kick', 0, 0, 0, 2)],
      [],
    ]);
    const { root, surface } = renderCanvas(group);
    const moveScoreObjects = useProjectStore.getState().moveScoreObjects as unknown as ReturnType<typeof vi.fn>;
    const applyProjectDocumentPatch = useProjectStore.getState().applyProjectDocumentPatch as unknown as ReturnType<typeof vi.fn>;

    act(() => {
      dispatchMouseEvent(surface, 'mousedown', 10, 10);
    });

    await act(async () => {
      dispatchMouseEvent(window, 'mousemove', 60, 50);
      dispatchMouseEvent(window, 'mouseup', 60, 50);
      await Promise.resolve();
    });

    expect(moveScoreObjects).toHaveBeenCalledWith([
      expect.objectContaining({
        objectId: 'audio-1',
        targetStartBeats: 2,
        targetLayerIndex: 1,
        targetGroupId: 'audio-group',
      }),
    ]);
    expect(applyProjectDocumentPatch).toHaveBeenCalledWith({
      score: {
        type: 'moveScoreObjects',
        moves: [
          expect.objectContaining({
            targetStartBeats: 2,
            targetLayerIndex: 1,
            targetGroupId: 'audio-group',
          }),
        ],
      },
    });

    act(() => {
      root.unmount();
    });
  });

  it('moves selected objects across audio and soundObject layer groups from an audio-origin drag', async () => {
    const firstAudioGroup = createAudioGroup([
      [createAudioItem('audio-1', 'Kick', 0, 0, 0, 2)],
    ]);
    const secondAudioGroup = createAudioGroup([
      [createAudioItem('audio-2', 'Hat', 0, 0, 1, 2)],
    ]);
    secondAudioGroup.groupId = 'audio-group-2';
    secondAudioGroup.layers[0]!.layerId = 'audio-group-2-layer-0';
    const soundGroup = createSoundGroup([
      [createSoundItem('sound-1', 'Sine', 0, 0, 2, 2)],
    ]);

    useScoreSelectionStore.getState().setSelection([
      { objectId: 'audio-1', editorTarget: firstAudioGroup.layers[0]!.items[0]!.editorTarget },
      { objectId: 'audio-2', editorTarget: secondAudioGroup.layers[0]!.items[0]!.editorTarget },
      { objectId: 'sound-1', editorTarget: soundGroup.layers[0]!.items[0]!.editorTarget },
    ]);

    const { root, surface } = renderCanvas(firstAudioGroup, [firstAudioGroup, secondAudioGroup, soundGroup]);
    const moveScoreObjects = useProjectStore.getState().moveScoreObjects as unknown as ReturnType<typeof vi.fn>;

    await act(async () => {
      dispatchMouseEvent(surface, 'mousedown', 10, 10);
      dispatchMouseEvent(window, 'mousemove', 60, 10);
      dispatchMouseEvent(window, 'mouseup', 60, 10);
      await Promise.resolve();
    });

    expect(moveScoreObjects).toHaveBeenCalledWith([
      expect.objectContaining({
        objectId: 'audio-1',
        targetStartBeats: 2,
        targetLayerIndex: 0,
        targetGroupId: 'audio-group',
      }),
      expect.objectContaining({
        objectId: 'audio-2',
        targetStartBeats: 3,
        targetLayerIndex: 0,
        targetGroupId: 'audio-group-2',
      }),
      expect.objectContaining({
        objectId: 'sound-1',
        targetStartBeats: 4,
        targetLayerIndex: 0,
        targetGroupId: 'sound-group',
      }),
    ]);

    act(() => {
      root.unmount();
    });
  });

  it('resizes selected audio clips from the right edge and commits shared properties', async () => {
    const group = createAudioGroup([
      [createAudioItem('audio-1', 'Kick', 0, 0, 0, 2)],
    ]);
    const { root, surface } = renderCanvas(group);
    const resizeScoreObjects = useProjectStore.getState().resizeScoreObjects as unknown as ReturnType<typeof vi.fn>;
    const applyProjectDocumentPatch = useProjectStore.getState().applyProjectDocumentPatch as unknown as ReturnType<typeof vi.fn>;

    act(() => {
      dispatchMouseEvent(surface, 'mousedown', 10, 10);
      dispatchMouseEvent(window, 'mouseup', 10, 10);
      dispatchMouseEvent(surface, 'mousemove', 10, 10);
    });

    await act(async () => {
      dispatchMouseEvent(surface, 'mousedown', 49, 10);
      dispatchMouseEvent(window, 'mousemove', 74, 10);
      dispatchMouseEvent(window, 'mouseup', 74, 10);
      await Promise.resolve();
    });

    expect(resizeScoreObjects).toHaveBeenCalledWith([
      expect.objectContaining({
        objectId: 'audio-1',
        targetStartBeats: 0,
        targetDurationBeats: 3,
      }),
    ]);
    expect(applyProjectDocumentPatch).toHaveBeenCalledWith({
      score: {
        type: 'updateSharedProperties',
        target: group.layers[0]!.items[0]!.editorTarget,
        patch: {
          startTime: { value: 0, timeBase: 'BEATS' },
          subjectiveDuration: { value: 3, timeBase: 'BEATS' },
        },
      },
    });

    act(() => {
      root.unmount();
    });
  });

  it('resizes selected objects across audio and soundObject layer groups from an audio edge drag', async () => {
    const firstAudioGroup = createAudioGroup([
      [createAudioItem('audio-1', 'Kick', 0, 0, 0, 2)],
    ]);
    const secondAudioGroup = createAudioGroup([
      [createAudioItem('audio-2', 'Hat', 0, 0, 1, 2)],
    ]);
    secondAudioGroup.groupId = 'audio-group-2';
    secondAudioGroup.layers[0]!.layerId = 'audio-group-2-layer-0';
    const soundGroup = createSoundGroup([
      [createSoundItem('sound-1', 'Sine', 0, 0, 2, 2)],
    ]);

    useScoreSelectionStore.getState().setSelection([
      { objectId: 'audio-1', editorTarget: firstAudioGroup.layers[0]!.items[0]!.editorTarget },
      { objectId: 'audio-2', editorTarget: secondAudioGroup.layers[0]!.items[0]!.editorTarget },
      { objectId: 'sound-1', editorTarget: soundGroup.layers[0]!.items[0]!.editorTarget },
    ]);

    const { root, surface } = renderCanvas(firstAudioGroup, [firstAudioGroup, secondAudioGroup, soundGroup]);
    const resizeScoreObjects = useProjectStore.getState().resizeScoreObjects as unknown as ReturnType<typeof vi.fn>;

    await act(async () => {
      dispatchMouseEvent(surface, 'mousedown', 49, 10);
      dispatchMouseEvent(window, 'mousemove', 74, 10);
      dispatchMouseEvent(window, 'mouseup', 74, 10);
      await Promise.resolve();
    });

    expect(resizeScoreObjects).toHaveBeenCalledWith([
      expect.objectContaining({
        objectId: 'audio-1',
        targetStartBeats: 0,
        targetDurationBeats: 3,
      }),
      expect.objectContaining({
        objectId: 'audio-2',
        targetStartBeats: 1,
        targetDurationBeats: 3,
      }),
      expect.objectContaining({
        objectId: 'sound-1',
        targetStartBeats: 2,
        targetDurationBeats: 3,
      }),
    ]);

    act(() => {
      root.unmount();
    });
  });

  it('stops audio-origin left resize for all selected objects when any selected object reaches beat zero', async () => {
    const firstAudioGroup = createAudioGroup([
      [createAudioItem('audio-1', 'Kick', 0, 0, 1, 2)],
    ]);
    const secondAudioGroup = createAudioGroup([
      [createAudioItem('audio-2', 'Hat', 0, 0, 3, 2)],
    ]);
    secondAudioGroup.groupId = 'audio-group-2';
    secondAudioGroup.layers[0]!.layerId = 'audio-group-2-layer-0';
    const soundGroup = createSoundGroup([
      [createSoundItem('sound-1', 'Sine', 0, 0, 4, 2)],
    ]);

    useScoreSelectionStore.getState().setSelection([
      { objectId: 'audio-1', editorTarget: firstAudioGroup.layers[0]!.items[0]!.editorTarget },
      { objectId: 'audio-2', editorTarget: secondAudioGroup.layers[0]!.items[0]!.editorTarget },
      { objectId: 'sound-1', editorTarget: soundGroup.layers[0]!.items[0]!.editorTarget },
    ]);

    const { root, surface } = renderCanvas(firstAudioGroup, [firstAudioGroup, secondAudioGroup, soundGroup]);
    const resizeScoreObjects = useProjectStore.getState().resizeScoreObjects as unknown as ReturnType<typeof vi.fn>;

    await act(async () => {
      dispatchMouseEvent(surface, 'mousedown', 26, 10);
      dispatchMouseEvent(window, 'mousemove', -50, 10);
      dispatchMouseEvent(window, 'mouseup', -50, 10);
      await Promise.resolve();
    });

    expect(resizeScoreObjects).toHaveBeenCalledWith([
      expect.objectContaining({
        objectId: 'audio-1',
        targetStartBeats: 0,
        targetDurationBeats: 3,
      }),
      expect.objectContaining({
        objectId: 'audio-2',
        targetStartBeats: 2,
        targetDurationBeats: 3,
      }),
      expect.objectContaining({
        objectId: 'sound-1',
        targetStartBeats: 3,
        targetDurationBeats: 3,
      }),
    ]);

    act(() => {
      root.unmount();
    });
  });

  it('shows selected fade handles and commits audio clip fade edits', async () => {
    const group = createAudioGroup([
      [createAudioItem('audio-1', 'Kick', 0, 0, 0, 2, 0, 0.5)],
    ]);
    const { root, surface } = renderCanvas(group);
    const applyProjectDocumentPatch = useProjectStore.getState().applyProjectDocumentPatch as unknown as ReturnType<typeof vi.fn>;

    await act(async () => {
      dispatchMouseEvent(surface, 'mousedown', 10, 10);
      dispatchMouseEvent(window, 'mouseup', 10, 10);
      dispatchMouseEvent(surface, 'mousemove', 10, 10);
      await Promise.resolve();
    });

    const fadeInHandle = surface.querySelector('[data-fade-handle="in"]') as HTMLDivElement | null;
    const fadeOutHandle = surface.querySelector('[data-fade-handle="out"]') as HTMLDivElement | null;
    expect(fadeInHandle).toBeTruthy();
    expect(fadeOutHandle).toBeTruthy();
    expect(fadeInHandle!.style.top).toBe('2px');
    expect(fadeInHandle!.style.left).toBe('0px');
    expect(fadeOutHandle!.style.top).toBe('2px');
    expect(fadeOutHandle!.style.left).toBe('32px');

    await act(async () => {
      dispatchMouseEvent(fadeInHandle!, 'mousedown', 0, 10);
      dispatchMouseEvent(window, 'mousemove', 13, 10);
      dispatchMouseEvent(window, 'mouseup', 13, 10);
      await Promise.resolve();
    });

    expect(applyProjectDocumentPatch).toHaveBeenCalledWith({
      score: {
        type: 'updateTypeSpecificEditor',
        target: group.layers[0]!.items[0]!.editorTarget,
        patch: expect.objectContaining({
          fadeIn: expect.closeTo(0.26, 1),
        }),
      },
    });

    act(() => {
      root.unmount();
    });
  });

  it('alt-drag slip-edits the audio file start instead of moving the clip', async () => {
    const group = createAudioGroup([
      [createAudioItem('audio-1', 'Kick', 0, 0, 0, 2)],
    ]);
    const { root, surface } = renderCanvas(group);
    const moveScoreObjects = useProjectStore.getState().moveScoreObjects as unknown as ReturnType<typeof vi.fn>;
    const applyProjectDocumentPatch = useProjectStore.getState().applyProjectDocumentPatch as unknown as ReturnType<typeof vi.fn>;

    await act(async () => {
      dispatchMouseEvent(surface, 'mousedown', 10, 10, { altKey: true });
      dispatchMouseEvent(window, 'mousemove', 35, 10, { altKey: true });
      dispatchMouseEvent(window, 'mouseup', 35, 10, { altKey: true });
      await Promise.resolve();
    });

    expect(moveScoreObjects).not.toHaveBeenCalled();
    expect(applyProjectDocumentPatch).toHaveBeenCalledWith({
      score: {
        type: 'updateTypeSpecificEditor',
        target: group.layers[0]!.items[0]!.editorTarget,
        patch: expect.objectContaining({
          fileStartTime: expect.closeTo(0.5, 6),
        }),
      },
    });

    act(() => {
      root.unmount();
    });
  });

  it('publishes live file-start previews for the audio clip editor during alt-drag', async () => {
    const group = createAudioGroup([
      [createAudioItem('audio-1', 'Kick', 0, 0, 0, 2)],
    ]);
    const { root, surface } = renderCanvas(group);

    await act(async () => {
      dispatchMouseEvent(surface, 'mousedown', 10, 10, { altKey: true });
      dispatchMouseEvent(window, 'mousemove', 35, 10, { altKey: true });
      await Promise.resolve();
    });

    expect(
      useProjectStore.getState().audioClipEditorPreviewByObjectId['audio-1']?.fileStartTime,
    ).toBeCloseTo(0.5, 6);

    await act(async () => {
      dispatchMouseEvent(window, 'mouseup', 35, 10, { altKey: true });
      await Promise.resolve();
    });

    act(() => {
      root.unmount();
    });
  });
});
