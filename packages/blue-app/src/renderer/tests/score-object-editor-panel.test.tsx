import { describe, expect, it } from 'vitest';
import {
  BlueData,
  GenericScore,
  PythonObject,
  JavaScriptObject,
  Comment,
  External,
  AudioClip,
  AudioLayerGroup,
  AudioLayer,
  PolyObject,
  SoundLayer,
  Instance,
  SoundObjectLibrary,
  PatternObject,
  Sound,
  AudioFile,
  FrozenSoundObject,
  LineObject,
  ZakLineObject,
  PianoRoll,
  TrackerObject,
  NotationObject,
  JMask,
  TimeBehavior,
  TimeDuration,
  NoteProcessorChain,
} from '@blue/data';
import {
  createScoreObjectEditorDocument,
  applyProjectDocumentPatch,
  type ScoreObjectEditorTargetSnapshot,
  type ScoreObjectLibraryEntryRef,
} from '../../shared/project-editor';

function makeLibRef(libId: string, objectType: string, index: number = 0): ScoreObjectLibraryEntryRef {
  return { libraryId: libId, libraryIndex: index, objectType };
}

function addLibObject(lib: SoundObjectLibrary, obj: any): string {
  return lib.addObject(obj);
}

function makeTimelineTarget(
  objectType: string,
  overrides?: Partial<ScoreObjectEditorTargetSnapshot>,
): ScoreObjectEditorTargetSnapshot {
  return {
    selectionId: 'sobj-0-0',
    selectedObjectType: objectType,
    editorObjectType: objectType,
    ownerKind: 'timeline',
    displayContext: 'timeline',
    location: { rootGroupIndex: 0, containerPath: [], layerIndex: 0, objectIndex: 0 },
    supportsTimeBehavior: true,
    supportsRepeatPoint: true,
    supportsNoteProcessorChain: true,
    ...overrides,
  };
}

function makeDataWithObject(obj: any): BlueData {
  const data = new BlueData();
  const poly = new PolyObject();
  const layer = new SoundLayer();
  layer.push(obj);
  poly.push(layer);
  data.getScore().push(poly);
  return data;
}

describe('Code-backed editor document creation (T026)', () => {
  it('GenericScore produces code editor with csound-score syntax and editable text', () => {
    const gs = new GenericScore();
    gs.setName('Score');
    gs.setScoreText('i1 0 1 440');
    const data = makeDataWithObject(gs);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('GenericScore') });
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('csound-score');
      expect(doc!.editor.text).toBe('i1 0 1 440');
    }
  });

  it('PythonObject produces code editor with python syntax', () => {
    const po = new PythonObject();
    po.setPythonCode('print("test")');
    const data = makeDataWithObject(po);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('PythonObject') });
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('python');
    }
  });

  it('JavaScriptObject produces code editor with javascript syntax', () => {
    const js = new JavaScriptObject();
    js.setJavaScriptCode('console.log("test");');
    const data = makeDataWithObject(js);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('JavaScriptObject') });
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('javascript');
    }
  });

  it('Comment produces code editor with text syntax', () => {
    const c = new Comment();
    c.setText('A comment');
    const data = makeDataWithObject(c);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('Comment') });
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('text');
    }
  });

  it('External produces code editor with text syntax', () => {
    const ext = new External();
    ext.setText('external command text');
    const data = makeDataWithObject(ext);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('External') });
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('text');
    }
  });
});

describe('AudioClip editor document creation and mutation (T026)', () => {
  function makeAudioClipData() {
    const data = new BlueData();
    const alg = new AudioLayerGroup();
    const layer = new AudioLayer();
    const clip = new AudioClip();
    clip.setName('Test Clip');
    clip.setAudioFile('sound.wav');
    clip.setFileStartTime(0.5);
    clip.setFadeIn(0.1);
    clip.setFadeOut(0.2);
    clip.setLooping(null, true);
    layer.push(clip);
    alg.push(layer);
    data.getScore().push(alg);

    const target = makeTimelineTarget('AudioClip', {
      supportsTimeBehavior: false,
      supportsRepeatPoint: false,
      supportsNoteProcessorChain: false,
    });

    return { data, clip, target };
  }

  it('creates audioClip editor document with all fields', () => {
    const { data, target } = makeAudioClipData();
    const doc = createScoreObjectEditorDocument(data, { target });

    expect(doc!.editor.kind).toBe('audioClip');
    if (doc!.editor.kind === 'audioClip') {
      expect(doc!.editor.audioFile).toBe('sound.wav');
      expect(doc!.editor.fileStartTime).toBeCloseTo(0.5);
      expect(doc!.editor.fadeIn).toBeCloseTo(0.1);
      expect(doc!.editor.fadeOut).toBeCloseTo(0.2);
      expect(doc!.editor.looping).toBe(true);
    }
  });

  it('applies updateTypeSpecificEditor patch for audioFile', () => {
    const { data, clip, target } = makeAudioClipData();

    applyProjectDocumentPatch(data, {
      score: {
        type: 'updateTypeSpecificEditor',
        target,
        patch: { audioFile: 'new-sound.wav' },
      },
    });

    expect(clip.getAudioFile()).toBe('new-sound.wav');
  });

  it('applies updateTypeSpecificEditor patch for fade values', () => {
    const { data, clip, target } = makeAudioClipData();

    applyProjectDocumentPatch(data, {
      score: {
        type: 'updateTypeSpecificEditor',
        target,
        patch: { fadeIn: 0.5, fadeOut: 0.8 },
      },
    });

    expect(clip.getFadeIn()).toBeCloseTo(0.5);
    expect(clip.getFadeOut()).toBeCloseTo(0.8);
  });

  it('applies updateTypeSpecificEditor patch for looping', () => {
    const { data, clip, target } = makeAudioClipData();
    expect(clip.isLooping()).toBe(true);

    applyProjectDocumentPatch(data, {
      score: {
        type: 'updateTypeSpecificEditor',
        target,
        patch: { looping: false },
      },
    });

    expect(clip.isLooping()).toBe(false);
  });
});

describe('Instance and library-backed routing (T027)', () => {
  it('resolves Instance to underlying library GenericScore', () => {
    const data = new BlueData();
    const poly = new PolyObject();
    const layer = new SoundLayer();
    const gs = new GenericScore();
    gs.setName('Lib Score');
    gs.setScoreText('i1 0 1 440');
    const lib = data.getSoundObjectLibrary();
    const libId = addLibObject(lib, gs);
    const inst = new Instance();
    inst.setLibraryId(libId);
    inst.setSoundObject(gs);
    layer.push(inst);
    poly.push(layer);
    data.getScore().push(poly);

    const target: ScoreObjectEditorTargetSnapshot = {
      selectionId: 'sobj-0-0',
      selectedObjectType: 'Instance',
      editorObjectType: 'GenericScore',
      ownerKind: 'library',
      displayContext: 'instance',
      sourceInstanceLocation: { rootGroupIndex: 0, containerPath: [], layerIndex: 0, objectIndex: 0 },
      library: makeLibRef(libId, 'GenericScore', 0),
      supportsTimeBehavior: true,
      supportsRepeatPoint: true,
      supportsNoteProcessorChain: true,
    };

    const doc = createScoreObjectEditorDocument(data, { target });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.text).toBe('i1 0 1 440');
      expect(doc!.editor.syntax).toBe('csound-score');
    }
    expect(doc!.shared.name).toBe('Lib Score');
  });

  it('mutates library-backed object via updateSharedProperties patch', () => {
    const data = new BlueData();
    const poly = new PolyObject();
    const layer = new SoundLayer();
    const gs = new GenericScore();
    gs.setName('Original');
    gs.setScoreText('i1 0 1 440');
    const lib = data.getSoundObjectLibrary();
    const libId = addLibObject(lib, gs);
    const inst = new Instance();
    inst.setLibraryId(libId);
    inst.setSoundObject(gs);
    layer.push(inst);
    poly.push(layer);
    data.getScore().push(poly);

    const target: ScoreObjectEditorTargetSnapshot = {
      selectionId: 'sobj-0-0',
      selectedObjectType: 'Instance',
      editorObjectType: 'GenericScore',
      ownerKind: 'library',
      displayContext: 'instance',
      library: makeLibRef(libId, 'GenericScore', 0),
      supportsTimeBehavior: true,
      supportsRepeatPoint: true,
      supportsNoteProcessorChain: true,
    };

    applyProjectDocumentPatch(data, {
      score: {
        type: 'updateSharedProperties',
        target,
        patch: { name: 'Renamed Library Score' },
      },
    });

    expect(gs.getName()).toBe('Renamed Library Score');
  });

  it('returns fallback when library ID is invalid', () => {
    const data = new BlueData();
    const target: ScoreObjectEditorTargetSnapshot = {
      selectionId: 'sobj-0-0',
      selectedObjectType: 'Instance',
      editorObjectType: 'GenericScore',
      ownerKind: 'library',
      displayContext: 'instance',
      library: { libraryId: 'nonexistent-id' },
      supportsTimeBehavior: true,
      supportsRepeatPoint: true,
      supportsNoteProcessorChain: true,
    };

    const doc = createScoreObjectEditorDocument(data, { target });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('fallback');
    if (doc!.editor.kind === 'fallback') {
      expect(doc!.editor.reason).toBe('removed-target');
    }
  });
});
