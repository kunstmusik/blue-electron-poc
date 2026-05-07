import { describe, expect, it } from 'vitest';
import {
  BlueData,
  GenericScore,
  AudioClip,
  TimeBehavior,
  TimeDuration,
  TimePosition,
  PolyObject,
  SoundLayer,
  AudioLayerGroup,
  AudioLayer,
} from '@blue/data';
import {
  createScoreObjectEditorDocument,
  createFallbackEditorDocument,
  applyProjectDocumentPatch,
  type ScoreObjectEditorRequest,
  type ScoreObjectEditorTargetSnapshot,
} from '../../shared/project-editor';

function createDataWithGenericScore(): {
  data: BlueData;
  gs: GenericScore;
  target: ScoreObjectEditorTargetSnapshot;
} {
  const data = new BlueData();
  const poly = new PolyObject();
  const layer = new SoundLayer();
  const gs = new GenericScore();
  gs.setName('Test Score');
  gs.setScoreText('i1 0 2 440');
  layer.push(gs);
  poly.push(layer);
  data.getScore().push(poly);

  const target: ScoreObjectEditorTargetSnapshot = {
    selectionId: 'sobj-0-0',
    selectedObjectType: 'GenericScore',
    editorObjectType: 'GenericScore',
    ownerKind: 'timeline',
    displayContext: 'timeline',
    location: { rootGroupIndex: 0, containerPath: [], layerIndex: 0, objectIndex: 0 },
    supportsTimeBehavior: true,
    supportsRepeatPoint: true,
    supportsNoteProcessorChain: true,
  };

  return { data, gs, target };
}

function createDataWithAudioClip(): {
  data: BlueData;
  clip: AudioClip;
  target: ScoreObjectEditorTargetSnapshot;
} {
  const data = new BlueData();
  const alg = new AudioLayerGroup();
  const layer = new AudioLayer();
  const clip = new AudioClip();
  clip.setName('Test Clip');
  clip.setAudioFile('test.wav');
  layer.push(clip);
  alg.push(layer);
  data.getScore().push(alg);

  const target: ScoreObjectEditorTargetSnapshot = {
    selectionId: 'aclp-0-0',
    selectedObjectType: 'AudioClip',
    editorObjectType: 'AudioClip',
    ownerKind: 'timeline',
    displayContext: 'timeline',
    location: { rootGroupIndex: 0, containerPath: [], layerIndex: 0, objectIndex: 0 },
    supportsTimeBehavior: false,
    supportsRepeatPoint: false,
    supportsNoteProcessorChain: false,
  };

  return { data, clip, target };
}

describe('createScoreObjectEditorDocument', () => {
  it('returns a code-backed editor document for a GenericScore with correct syntax, text, and shared properties', () => {
    const { data, gs, target } = createDataWithGenericScore();
    const doc = createScoreObjectEditorDocument(data, { target });

    expect(doc).not.toBeNull();
    expect(doc!.target).toBe(target);
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('csound-score');
      expect(doc!.editor.text).toBe('i1 0 2 440');
      expect(doc!.editor.target).toBe(target);
    }
    expect(doc!.shared.name).toBe('Test Score');
    expect(doc!.shared.backgroundColor).toBe(gs.getBackgroundColor());
    expect(doc!.shared.timeBehavior).toBe(gs.getTimeBehavior());
    expect(doc!.shared.startTime.timeBase).toBe('beats');
    expect(doc!.shared.subjectiveDuration.timeBase).toBe('beats');
  });

  it('returns an audioClip editor document for an AudioClip with correct fields', () => {
    const { data, clip, target } = createDataWithAudioClip();
    const doc = createScoreObjectEditorDocument(data, { target });

    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('audioClip');
    if (doc!.editor.kind === 'audioClip') {
      expect(doc!.editor.audioFile).toBe('test.wav');
      expect(doc!.editor.target).toBe(target);
    }
    expect(doc!.shared.name).toBe('Test Clip');
  });

  it('returns a fallback document for unsupported types', () => {
    const data = new BlueData();
    const poly = new PolyObject();
    const layer = new SoundLayer();
    const gs = new GenericScore();
    layer.push(gs);
    poly.push(layer);
    data.getScore().push(poly);

    const target: ScoreObjectEditorTargetSnapshot = {
      selectionId: 'sobj-0-0',
      selectedObjectType: 'GenericScore',
      editorObjectType: 'FakeUnsupportedType',
      ownerKind: 'timeline',
      displayContext: 'timeline',
      location: { rootGroupIndex: 0, containerPath: [], layerIndex: 0, objectIndex: 0 },
      supportsTimeBehavior: true,
      supportsRepeatPoint: true,
      supportsNoteProcessorChain: true,
    };

    const doc = createScoreObjectEditorDocument(data, { target });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('fallback');
    if (doc!.editor.kind === 'fallback') {
      expect(doc!.editor.reason).toBe('unsupported');
    }
  });
});

describe('createFallbackEditorDocument', () => {
  it('creates a proper fallback with the given reason and message', () => {
    const doc = createFallbackEditorDocument('no-selection', 'Nothing selected');

    expect(doc.editor.kind).toBe('fallback');
    if (doc.editor.kind === 'fallback') {
      expect(doc.editor.reason).toBe('no-selection');
      expect(doc.editor.message).toBe('Nothing selected');
    }
    expect(doc.target.selectionId).toBe('');
    expect(doc.target.ownerKind).toBe('timeline');
    expect(doc.shared.name).toBe('');
    expect(doc.shared.startTime.value).toBe(0);
    expect(doc.shared.subjectiveDuration.value).toBe(0);
    expect(doc.shared.backgroundColor).toBe(0);
  });
});

describe('Score patches — updateSharedProperties', () => {
  it('updates name, backgroundColor, startTime, and subjectiveDuration correctly on a GenericScore', () => {
    const { data, gs, target } = createDataWithGenericScore();

    expect(
      applyProjectDocumentPatch(data, {
        score: {
          type: 'updateSharedProperties',
          target,
          patch: {
            name: 'Renamed Score',
            backgroundColor: 0xff0000,
            startTime: { value: 5.0, timeBase: 'beats' },
            subjectiveDuration: { value: 8.0, timeBase: 'beats' },
          },
        },
      }),
    ).toBe(true);

    expect(gs.getName()).toBe('Renamed Score');
    expect(gs.getBackgroundColor()).toBe(0xff0000);
    const context = data.getScore().getTimeContext();
    expect(gs.getStartTime().toBeats(context)).toBeCloseTo(5.0);
    expect(gs.getSubjectiveDuration().toBeats(context)).toBeCloseTo(8.0);
  });
});

describe('Score patches — updateSoundObjectBehavior', () => {
  it('updates timeBehavior and repeatPoint', () => {
    const { data, gs, target } = createDataWithGenericScore();

    expect(
      applyProjectDocumentPatch(data, {
        score: {
          type: 'updateSoundObjectBehavior',
          target,
          patch: {
            timeBehavior: 'REPEAT',
            repeatPoint: { value: 3.5, timeBase: 'beats' },
          },
        },
      }),
    ).toBe(true);

    expect(gs.getTimeBehavior()).toBe('REPEAT');
    const context = data.getScore().getTimeContext();
    expect(gs.getRepeatPoint()!.toBeats(context)).toBeCloseTo(3.5);
  });
});

describe('Score patches — updateTypeSpecificEditor', () => {
  it('updates code text for GenericScore', () => {
    const { data, gs, target } = createDataWithGenericScore();

    expect(
      applyProjectDocumentPatch(data, {
        score: {
          type: 'updateTypeSpecificEditor',
          target,
          patch: { text: 'i2 0 1 880' },
        },
      }),
    ).toBe(true);

    expect(gs.getScoreText()).toBe('i2 0 1 880');
  });
});
