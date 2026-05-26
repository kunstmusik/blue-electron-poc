import { describe, expect, it } from 'vitest';
import {
  BlueData,
  GenericScore,
  PolyObject,
  SoundLayer,
  TimePosition,
} from '@blue/data';
import { testScoreObject } from './score-object-test';
import type { ScoreObjectEditorTargetSnapshot } from '../shared/project-editor';

function makeTarget(
  objectType: string,
  location: ScoreObjectEditorTargetSnapshot['location'],
): ScoreObjectEditorTargetSnapshot {
  return {
    selectionId: 'sobj-test',
    selectedObjectType: objectType,
    editorObjectType: objectType,
    ownerKind: 'timeline',
    displayContext: 'timeline',
    location,
    supportsTimeBehavior: true,
    supportsRepeatPoint: true,
    supportsNoteProcessorChain: true,
  };
}

describe('testScoreObject', () => {
  it('uses the canonical generateForCSD path for GenericScore', async () => {
    const data = new BlueData();
    const root = data.getScore()[0] as PolyObject;
    const layer = root[0];
    const score = new GenericScore();
    score.setScoreText('i1 0 1 440');
    score.setStartTime(TimePosition.beats(2));
    layer.push(score);

    const result = await testScoreObject(data, {
      target: makeTarget('GenericScore', {
        rootGroupIndex: 0,
        containerPath: [],
        layerIndex: 0,
        objectIndex: layer.length - 1,
      }),
    });

    expect(result.ok).toBe(true);
    expect(result.output).toContain('i1\t2.0\t4\t440');
  });

  it('resolves nested score object targets before testing', async () => {
    const data = new BlueData();
    const root = data.getScore()[0] as PolyObject;
    const rootLayer = root[0];
    const nested = new PolyObject();
    const nestedLayer = new SoundLayer();
    const score = new GenericScore();
    score.setScoreText('i2 0 1 880');

    nestedLayer.push(score);
    nested.push(nestedLayer);
    rootLayer.push(nested);

    const result = await testScoreObject(data, {
      target: makeTarget('GenericScore', {
        rootGroupIndex: 0,
        containerPath: [{ layerIndex: 0, objectIndex: rootLayer.length - 1 }],
        layerIndex: 0,
        objectIndex: 0,
      }),
    });

    expect(result.ok).toBe(true);
    expect(result.output).toContain('i2\t0.0\t4\t880');
  });
});
