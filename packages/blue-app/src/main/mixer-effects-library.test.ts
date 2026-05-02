import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { Effect } from '@blue/data';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  MixerEffectsLibrarySession,
  getDefaultEffectsLibraryPath,
} from './mixer-effects-library';

function createEffectXml(): string {
  const effect = new Effect();
  effect.setName('Delay');
  effect.setComments('Original library note');
  effect.setCode('aout = ain');
  return effect.saveAsXML().toXml();
}

describe('mixer effects library session', () => {
  let tempDir: string;
  let libraryPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blue-effects-library-'));
    libraryPath = path.join(tempDir, 'effectsLibrary.xml');
    const xml = `<effectsLibrary><effectCategory categoryName="FX">${createEffectXml()}</effectCategory></effectsLibrary>`;
    fs.writeFileSync(libraryPath, xml, 'utf8');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('defaults to the user library path under ~/.blue', () => {
    expect(getDefaultEffectsLibraryPath()).toContain(path.join('.blue', 'effectsLibrary.xml'));
  });

  it('loads library content and keeps in-memory updates off disk', () => {
    const before = fs.readFileSync(libraryPath, 'utf8');
    const session = new MixerEffectsLibrarySession({ libraryPath });
    const snapshot = session.getSnapshot();

    expect(snapshot.loaded).toBe(true);
    expect(snapshot.root.name).toBe('FX');
    expect(snapshot.root.effects).toHaveLength(1);

    const effectId = snapshot.root.effects[0]!.libraryEffectId;
    const updated = session.updateEffect(effectId, {
      comments: 'Updated note',
      code: 'aout = ain * 0.5',
    });

    expect(updated?.comments).toBe('Updated note');
    expect(fs.readFileSync(libraryPath, 'utf8')).toBe(before);

    const editorSnapshot = session.getEffectEditorSnapshot({
      ownerType: 'library',
      effectId,
      libraryRef: { libraryEffectId: effectId },
    });
    expect(editorSnapshot?.comments).toBe('Updated note');
    expect(editorSnapshot?.code).toContain('0.5');
  });

  it('applies library patches in memory without persisting them', () => {
    const session = new MixerEffectsLibrarySession({ libraryPath });
    const snapshot = session.getSnapshot();
    const effectId = snapshot.root.effects[0]!.libraryEffectId;

    const next = session.applyPatch({
      type: 'duplicateEffect',
      effectId,
    });

    expect(next.root.effects).toHaveLength(2);
    expect(fs.readFileSync(libraryPath, 'utf8')).toContain('Original library note');
  });
});
