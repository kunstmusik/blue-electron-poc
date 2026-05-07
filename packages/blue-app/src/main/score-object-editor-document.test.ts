import { describe, expect, it } from 'vitest';
import {
  BlueData,
  PolyObject,
  SoundLayer,
  GenericScore,
  PythonObject,
  JavaScriptObject,
  Comment,
  External,
  AudioFile,
  FrozenSoundObject,
  AudioClip,
  AudioLayerGroup,
  AudioLayer,
  Instance,
  SoundObjectLibrary,
  PatternObject,
  Sound,
} from '@blue/data';
import {
  createScoreObjectEditorDocument,
  type ScoreObjectEditorTargetSnapshot,
  type ScoreObjectLibraryEntryRef,
} from '../shared/project-editor';

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

function makeLibRef(libId: string, objectType: string, index: number = 0): ScoreObjectLibraryEntryRef {
  return { libraryId: libId, libraryIndex: index, objectType };
}

function addLibObject(lib: SoundObjectLibrary, obj: any): string {
  return lib.addObject(obj);
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

describe('createScoreObjectEditorDocument — code-backed types', () => {
  it('returns code editor with csound-score syntax for GenericScore', () => {
    const gs = new GenericScore();
    gs.setName('My Score');
    gs.setScoreText('i1 0 1 440');
    const data = makeDataWithObject(gs);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('GenericScore') });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('csound-score');
      expect(doc!.editor.text).toBe('i1 0 1 440');
    }
    expect(doc!.shared.name).toBe('My Score');
  });

  it('returns code editor with python syntax for PythonObject', () => {
    const po = new PythonObject();
    po.setName('PyObj');
    po.setPythonCode('print("hello")');
    const data = makeDataWithObject(po);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('PythonObject') });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('python');
      expect(doc!.editor.text).toBe('print("hello")');
    }
  });

  it('returns code editor with javascript syntax for JavaScriptObject', () => {
    const js = new JavaScriptObject();
    js.setName('JSObj');
    js.setJavaScriptCode('console.log("hi")');
    const data = makeDataWithObject(js);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('JavaScriptObject') });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('javascript');
      expect(doc!.editor.text).toBe('console.log("hi")');
    }
  });

  it('returns code editor with text syntax for Comment', () => {
    const c = new Comment();
    c.setName('Note');
    c.setText('remember this');
    const data = makeDataWithObject(c);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('Comment') });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('text');
      expect(doc!.editor.text).toBe('remember this');
    }
  });

  it('returns code editor with text syntax for External', () => {
    const ext = new External();
    ext.setName('ExtCmd');
    ext.setText('ls -la');
    const data = makeDataWithObject(ext);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('External') });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.syntax).toBe('text');
      expect(doc!.editor.text).toBe('ls -la');
    }
  });
});

describe('createScoreObjectEditorDocument — file-backed types', () => {
  it('returns file editor for AudioFile', () => {
    const af = new AudioFile();
    af.setName('Sound File');
    const data = makeDataWithObject(af);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('AudioFile') });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('file');
    if (doc!.editor.kind === 'file') {
      expect(doc!.editor.filePath).toBeDefined();
    }
  });

  it('returns file editor for FrozenSoundObject', () => {
    const fso = new FrozenSoundObject();
    fso.setName('Frozen');
    const data = makeDataWithObject(fso);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('FrozenSoundObject') });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('file');
  });
});

describe('createScoreObjectEditorDocument — structured types', () => {
  it('returns structured editor for PatternObject', () => {
    const po = new PatternObject();
    po.setName('Pattern');
    const data = makeDataWithObject(po);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('PatternObject') });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('structured');
    if (doc!.editor.kind === 'structured') {
      expect(doc!.editor.editorFamily).toBe('PatternObject');
    }
  });

  it('returns structured editor for Sound (BSB)', () => {
    const s = new Sound();
    s.setName('BSB Instrument');
    const data = makeDataWithObject(s);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('Sound') });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('structured');
  });
});

describe('createScoreObjectEditorDocument — audioClip type', () => {
  it('returns audioClip editor with all fields', () => {
    const data = new BlueData();
    const alg = new AudioLayerGroup();
    const layer = new AudioLayer();
    const clip = new AudioClip();
    clip.setName('My Clip');
    clip.setAudioFile('test.wav');
    clip.setFileStartTime(1.5);
    clip.setFadeIn(0.1);
    clip.setFadeOut(0.2);
    clip.setLooping(null, true);
    layer.push(clip);
    alg.push(layer);
    data.getScore().push(alg);

    const target = makeTimelineTarget('AudioClip', { supportsTimeBehavior: false, supportsRepeatPoint: false, supportsNoteProcessorChain: false });
    const doc = createScoreObjectEditorDocument(data, { target });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('audioClip');
    if (doc!.editor.kind === 'audioClip') {
      expect(doc!.editor.audioFile).toBe('test.wav');
      expect(doc!.editor.fileStartTime).toBeCloseTo(1.5);
      expect(doc!.editor.fadeIn).toBeCloseTo(0.1);
      expect(doc!.editor.fadeOut).toBeCloseTo(0.2);
      expect(doc!.editor.looping).toBe(true);
    }
    expect(doc!.shared.timeBehavior).toBeUndefined();
    expect(doc!.shared.repeatPoint).toBeUndefined();
  });
});

describe('createScoreObjectEditorDocument — Instance and library-backed', () => {
  it('resolves Instance to underlying library object via library ID', () => {
    const data = new BlueData();
    const poly = new PolyObject();
    const layer = new SoundLayer();
    const gs = new GenericScore();
    gs.setName('Library Item');
    gs.setScoreText('i1 0 1 440');
    const lib = data.getSoundObjectLibrary();
    const libId = addLibObject(lib, gs);
    const inst = new Instance();
    inst.setLibraryId(libId);
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
      library: makeLibRef(libId, 'GenericScore'),
      supportsTimeBehavior: true,
      supportsRepeatPoint: true,
      supportsNoteProcessorChain: true,
    };

    const doc = createScoreObjectEditorDocument(data, { target });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('code');
    if (doc!.editor.kind === 'code') {
      expect(doc!.editor.text).toBe('i1 0 1 440');
    }
    expect(doc!.shared.name).toBe('Library Item');
  });

  it('resolves Instance to underlying library object via sourceInstanceLocation', () => {
    const data = new BlueData();
    const poly = new PolyObject();
    const layer = new SoundLayer();
    const gs = new GenericScore();
    gs.setName('Lib Via Loc');
    gs.setScoreText('i1 0 2 330');
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
      supportsTimeBehavior: true,
      supportsRepeatPoint: true,
      supportsNoteProcessorChain: true,
    };

    const doc = createScoreObjectEditorDocument(data, { target });
    expect(doc).not.toBeNull();
    expect(doc!.shared.name).toBe('Lib Via Loc');
  });
});

describe('createScoreObjectEditorDocument — removed target', () => {
  it('returns fallback with removed-target reason for stale location', () => {
    const data = new BlueData();
    const target = makeTimelineTarget('GenericScore');

    const doc = createScoreObjectEditorDocument(data, { target });
    expect(doc).not.toBeNull();
    expect(doc!.editor.kind).toBe('fallback');
    if (doc!.editor.kind === 'fallback') {
      expect(doc!.editor.reason).toBe('removed-target');
    }
  });
});

describe('createScoreObjectEditorDocument — shared properties completeness', () => {
  it('includes timeBehavior and repeatPoint for sound objects', () => {
    const gs = new GenericScore();
    gs.setName('TB Test');
    gs.setScoreText('i1 0 1 440');
    const data = makeDataWithObject(gs);

    const doc = createScoreObjectEditorDocument(data, { target: makeTimelineTarget('GenericScore') });
    expect(doc!.shared.timeBehavior).toBeDefined();
    expect(doc!.shared.repeatPoint).toBeDefined();
    expect(doc!.shared.noteProcessorChain).toBeDefined();
  });

  it('omits timeBehavior and repeatPoint for non-sound-objects (AudioClip)', () => {
    const data = new BlueData();
    const alg = new AudioLayerGroup();
    const layer = new AudioLayer();
    const clip = new AudioClip();
    layer.push(clip);
    alg.push(layer);
    data.getScore().push(alg);

    const target = makeTimelineTarget('AudioClip', { supportsTimeBehavior: false, supportsRepeatPoint: false, supportsNoteProcessorChain: false });
    const doc = createScoreObjectEditorDocument(data, { target });
    expect(doc!.shared.timeBehavior).toBeUndefined();
    expect(doc!.shared.repeatPoint).toBeUndefined();
    expect(doc!.shared.noteProcessorChain).toBeUndefined();
  });
});
