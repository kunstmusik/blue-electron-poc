import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { Effect, Element } from '@blue/data';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MixerEffectsLibrarySession } from './mixer-effects-library';

function makeEffectXml(name: string, code: string, comments: string = ''): string {
  const effect = new Effect();
  effect.setName(name);
  effect.setCode(code);
  if (comments) effect.setComments(comments);
  return effect.saveAsXML().toXml();
}

function makeLibraryXml(rootName: string, effectXmlEntries: string[]): string {
  return `<effectsLibrary><effectCategory categoryName="${rootName}" isRoot="true">${effectXmlEntries.join('')}</effectCategory></effectsLibrary>`;
}

describe('MixerEffectsLibrarySession import/export/reload', () => {
  let tempDir: string;
  let libraryPath: string;

  const reverbEffectXml = makeEffectXml('Reverb', 'aout = aout + ain * 0.3', 'Hall reverb');

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blue-fx-lib-test-'));
    libraryPath = path.join(tempDir, 'effectsLibrary.xml');
    const xml = makeLibraryXml('Test Library', [reverbEffectXml]);
    fs.writeFileSync(libraryPath, xml, 'utf8');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('can be created with a custom path', () => {
    const session = new MixerEffectsLibrarySession({ libraryPath });
    const snapshot = session.getSnapshot();
    expect(snapshot.sourcePath).toBe(libraryPath);
    expect(snapshot.loaded).toBe(true);
  });

  it('returns a snapshot with root category', () => {
    const session = new MixerEffectsLibrarySession({ libraryPath });
    const snapshot = session.getSnapshot();
    expect(snapshot.root.name).toBe('Test Library');
    expect(snapshot.root.categories).toEqual([]);
    expect(snapshot.root.effects).toHaveLength(1);
    expect(snapshot.root.effects[0]!.name).toBe('Reverb');
  });

  it('importEffectFromXml adds an effect to root category', () => {
    const session = new MixerEffectsLibrarySession({ libraryPath });
    const delayXml = makeEffectXml('Delay', 'aout = ain', 'Simple delay');
    const snapshot = session.importEffectFromXml(delayXml);
    expect(snapshot.root.effects).toHaveLength(2);
    expect(snapshot.root.effects[1]!.name).toBe('Delay');
  });

  it('importEffectFromXml adds to a specific category', () => {
    const session = new MixerEffectsLibrarySession({ libraryPath });
    const afterAdd = session.applyPatch({
      type: 'addCategory',
      name: 'Modulation',
    });
    const subCategory = afterAdd.root.categories[0]!;
    expect(subCategory.name).toBe('Modulation');

    const chorusXml = makeEffectXml('Chorus', 'aout = ain', 'Chorus effect');
    const snapshot = session.importEffectFromXml(chorusXml, subCategory.categoryId);
    expect(snapshot.root.categories[0]!.effects).toHaveLength(1);
    expect(snapshot.root.categories[0]!.effects[0]!.name).toBe('Chorus');
  });

  it('exportEffectToXml returns the effect XML', () => {
    const session = new MixerEffectsLibrarySession({ libraryPath });
    const snapshot = session.getSnapshot();
    const effectId = snapshot.root.effects[0]!.libraryEffectId;
    const xml = session.exportEffectToXml(effectId);
    expect(xml).not.toBeNull();
    expect(xml).toContain('Reverb');
    expect(xml).toContain('aout = aout + ain * 0.3');
  });

  it('exportEffectToXml returns null for non-existent effect', () => {
    const session = new MixerEffectsLibrarySession({ libraryPath });
    const xml = session.exportEffectToXml('non-existent-id');
    expect(xml).toBeNull();
  });

  it('reload re-reads from disk and replaces session state', () => {
    const session = new MixerEffectsLibrarySession({ libraryPath });

    const delayXml = makeEffectXml('Delay', 'aout = ain', 'Delay');
    session.importEffectFromXml(delayXml);
    expect(session.getSnapshot().root.effects).toHaveLength(2);

    const updatedXml = makeLibraryXml('Updated Library', [reverbEffectXml, delayXml]);
    fs.writeFileSync(libraryPath, updatedXml, 'utf8');

    const snapshot = session.reload();
    expect(snapshot.root.name).toBe('Updated Library');
    expect(snapshot.root.effects).toHaveLength(2);
    expect(snapshot.root.effects.map((e) => e.name)).toEqual(['Reverb', 'Delay']);
  });

  it('session mutations are lost after reload', () => {
    const session = new MixerEffectsLibrarySession({ libraryPath });

    session.importEffectFromXml(makeEffectXml('Flanger', 'aout = ain', 'Flanger'));
    session.applyPatch({ type: 'addCategory', name: 'Dynamics' });
    expect(session.getSnapshot().root.effects).toHaveLength(2);
    expect(session.getSnapshot().root.categories).toHaveLength(1);

    const snapshot = session.reload();
    expect(snapshot.root.effects).toHaveLength(1);
    expect(snapshot.root.effects[0]!.name).toBe('Reverb');
    expect(snapshot.root.categories).toHaveLength(0);
  });
});
