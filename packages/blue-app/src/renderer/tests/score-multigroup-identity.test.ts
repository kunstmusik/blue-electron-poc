import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  AudioLayerGroup,
  BlueData,
  GenericScore,
  PatternsLayerGroup,
  PolyObject,
  SoundLayer,
  TimePosition,
} from '@blue/data';
import { applyProjectDocumentPatch, createProjectEditorSnapshot } from '../../shared/project-editor';
import { useProjectStore, __testClearPendingPatches } from '../stores/project-store';
import { useScoreSelectionStore } from '../stores/score-selection-store';

function createLayer(name: string, startBeats: number): SoundLayer {
  const layer = new SoundLayer();
  const score = new GenericScore();
  score.setName(name);
  score.setScoreText(`i1 ${startBeats} 2 440`);
  score.setStartTime(TimePosition.beats(startBeats));
  layer.push(score);
  return layer;
}

function createMultiGroupSnapshot() {
  const data = new BlueData();
  data.getScore().length = 0;

  const groupA = new PolyObject();
  groupA.setName('Group A');
  groupA.push(createLayer('A Layer 0', 0));
  groupA.push(createLayer('A Layer 1', 2));

  const groupB = new PolyObject();
  groupB.setName('Group B');
  groupB.push(createLayer('B Layer 0', 4));
  groupB.push(createLayer('B Layer 1', 6));

  data.getScore().push(groupA);
  data.getScore().push(groupB);

  return createProjectEditorSnapshot(data, null);
}

function getAllItems(snapshot: ReturnType<typeof createMultiGroupSnapshot>) {
  return snapshot.score.layerGroups.flatMap((group) =>
    group.layers.flatMap((layer) => layer.items));
}

beforeEach(() => {
  __testClearPendingPatches();
  useProjectStore.getState().clearProject();
  useScoreSelectionStore.getState().clearSelection();
});

afterEach(() => {
  __testClearPendingPatches();
  useProjectStore.getState().clearProject();
  useScoreSelectionStore.getState().clearSelection();
});

describe('score multigroup object identity', () => {
  it('keeps selection scoped to one object when multiple groups share layer and item indexes', () => {
    const snapshot = createMultiGroupSnapshot();
    const groupBItem = snapshot.score.layerGroups[1]!.layers[0]!.items[0]!;

    useScoreSelectionStore.getState().setSelection([
      { objectId: groupBItem.objectId, editorTarget: groupBItem.editorTarget },
    ]);

    const selectedItems = getAllItems(snapshot).filter((item) =>
      useScoreSelectionStore.getState().selectedObjectIds.has(item.objectId));

    expect(selectedItems).toHaveLength(1);
    expect(selectedItems[0]!.name).toBe('B Layer 0');
  });

  it('moves only the targeted object during optimistic score updates', () => {
    const snapshot = createMultiGroupSnapshot();
    useProjectStore.getState().setProjectInfo(snapshot);

    const initialGroups = useProjectStore.getState().score.layerGroups;
    const stationary = initialGroups[0]!.layers[0]!.items[0]!;
    const moving = initialGroups[1]!.layers[0]!.items[0]!;
    const targetGroupId = initialGroups[1]!.groupId;

    useProjectStore.getState().moveScoreObjects([
      {
        objectId: moving.objectId,
        targetStartBeats: 9,
        targetLayerIndex: 0,
        targetGroupId,
      },
    ]);

    const updatedGroups = useProjectStore.getState().score.layerGroups;

    expect(updatedGroups[0]!.layers[0]!.items).toHaveLength(1);
    expect(updatedGroups[0]!.layers[0]!.items[0]!.objectId).toBe(stationary.objectId);
    expect(updatedGroups[0]!.layers[0]!.items[0]!.startBeats).toBe(stationary.startBeats);

    expect(updatedGroups[1]!.layers[0]!.items).toHaveLength(1);
    expect(updatedGroups[1]!.layers[0]!.items[0]!.objectId).toBe(moving.objectId);
    expect(updatedGroups[1]!.layers[0]!.items[0]!.startBeats).toBe(9);
  });

  it('removes only the targeted object during optimistic score updates', () => {
    const snapshot = createMultiGroupSnapshot();
    useProjectStore.getState().setProjectInfo(snapshot);

    const initialGroups = useProjectStore.getState().score.layerGroups;
    const stationary = initialGroups[0]!.layers[1]!.items[0]!;
    const removed = initialGroups[1]!.layers[1]!.items[0]!;

    useProjectStore.getState().removeScoreObjects(new Set([removed.objectId]));

    const updatedGroups = useProjectStore.getState().score.layerGroups;

    expect(updatedGroups[0]!.layers[1]!.items).toHaveLength(1);
    expect(updatedGroups[0]!.layers[1]!.items[0]!.objectId).toBe(stationary.objectId);

    expect(updatedGroups[1]!.layers[1]!.items).toHaveLength(0);
  });

  it('persists layer renames through canonical score patches', () => {
    const data = new BlueData();
    data.getScore().length = 0;

    const group = new PolyObject(true);
    const layer = new SoundLayer();
    layer.setName('Original Layer');
    group.push(layer);
    data.getScore().push(group);

    const snapshot = createProjectEditorSnapshot(data, null);
    const groupId = snapshot.score.layerGroups[0]!.groupId;

    applyProjectDocumentPatch(data, {
      score: {
        type: 'renameLayer',
        groupId,
        layerIndex: 0,
        name: 'Renamed Layer',
      },
    });

    expect((data.getScore()[0] as PolyObject)[0]!.getName()).toBe('Renamed Layer');
    expect(createProjectEditorSnapshot(data, null).score.layerGroups[0]!.layers[0]!.name)
      .toBe('Renamed Layer');
  });

  it('moves the targeted root layer group when non-PolyObject groups are present', () => {
    const data = new BlueData();
    data.getScore().length = 0;

    const audio = new AudioLayerGroup();
    audio.setName('Audio');
    const poly = new PolyObject(true);
    poly.setName('Poly');
    const patterns = new PatternsLayerGroup();
    patterns.setName('Patterns');

    data.getScore().push(audio);
    data.getScore().push(poly);
    data.getScore().push(patterns);

    const snapshot = createProjectEditorSnapshot(data, null);
    const polyGroupId = snapshot.score.layerGroups[1]!.groupId;

    applyProjectDocumentPatch(data, {
      score: {
        type: 'moveLayerGroup',
        groupId: polyGroupId,
        targetIndex: 0,
      },
    });

    const updated = createProjectEditorSnapshot(data, null);
    expect(updated.score.layerGroups.map((group) => group.name)).toEqual([
      'Poly',
      'Audio',
      'Patterns',
    ]);
  });
});
