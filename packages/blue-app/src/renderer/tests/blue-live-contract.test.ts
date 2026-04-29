import { describe, expect, it } from 'vitest';
import { BlueData } from '@blue/data';
import {
  applyProjectDocumentPatch,
  createBlueLiveProjectSnapshot,
  createProjectEditorSnapshot,
} from '../../shared/project-editor';

function createProjectWithLiveData(): BlueData {
  const data = new BlueData();
  const ld = data.getLiveData();
  ld.setCommandLine('-d -odac');
  ld.setCommandLineEnabled(true);
  ld.setCommandLineOverride(false);
  ld.setTempo(120);
  ld.setRepeat(4);
  ld.setRepeatEnabled(true);
  ld.setLiveCodeText('prints "hello\\n"');
  return data;
}

describe('Blue Live snapshot/patch contract', () => {
  it('creates a Blue Live snapshot from LiveData', () => {
    const data = createProjectWithLiveData();
    const liveData = data.getLiveData();
    const snap = createBlueLiveProjectSnapshot(liveData);

    expect(snap.commandLine).toBe('-d -odac');
    expect(snap.commandLineEnabled).toBe(true);
    expect(snap.commandLineOverride).toBe(false);
    expect(snap.tempo).toBe(120);
    expect(snap.repeat).toBe(4);
    expect(snap.repeatEnabled).toBe(true);
    expect(snap.liveCodeText).toBe('prints "hello\\n"');
  });

  it('includes Blue Live snapshot in project snapshot', () => {
    const data = createProjectWithLiveData();
    const snapshot = createProjectEditorSnapshot(data, '/tmp/test.blue');

    expect(snapshot.blueLive).toBeDefined();
    expect(snapshot.blueLive!.commandLine).toBe('-d -odac');
    expect(snapshot.blueLive!.tempo).toBe(120);
  });

  it('applies updateOptions patch', () => {
    const data = createProjectWithLiveData();
    applyProjectDocumentPatch(data, {
      blueLive: { type: 'updateOptions', patch: { commandLine: '--new-flag', commandLineEnabled: false } },
    });
    const snap = createBlueLiveProjectSnapshot(data.getLiveData());

    expect(snap.commandLine).toBe('--new-flag');
    expect(snap.commandLineEnabled).toBe(false);
    expect(snap.commandLineOverride).toBe(false);
  });

  it('applies updateTempoRepeat patch', () => {
    const data = createProjectWithLiveData();
    applyProjectDocumentPatch(data, {
      blueLive: { type: 'updateTempoRepeat', patch: { tempo: 140, repeatEnabled: false } },
    });
    const snap = createBlueLiveProjectSnapshot(data.getLiveData());

    expect(snap.tempo).toBe(140);
    expect(snap.repeat).toBe(4);
    expect(snap.repeatEnabled).toBe(false);
  });

  it('applies updateLiveCodeText patch', () => {
    const data = createProjectWithLiveData();
    applyProjectDocumentPatch(data, {
      blueLive: { type: 'updateLiveCodeText', text: 'instr 1\\naout oscili p4, p5\\nendin' },
    });
    const snap = createBlueLiveProjectSnapshot(data.getLiveData());

    expect(snap.liveCodeText).toBe('instr 1\\naout oscili p4, p5\\nendin');
  });

  it('applies grid insertRow and removeRow patches', () => {
    const data = new BlueData();
    const ld = data.getLiveData();
    const bins = ld.getLiveObjectBins();

    expect(bins.getRowCount()).toBe(8);

    applyProjectDocumentPatch(data, { blueLive: { type: 'insertRow', index: 1 } });
    let snap = createBlueLiveProjectSnapshot(ld);
    expect(snap.bins.rows).toBe(9);

    applyProjectDocumentPatch(data, { blueLive: { type: 'removeRow', index: 0 } });
    snap = createBlueLiveProjectSnapshot(ld);
    expect(snap.bins.rows).toBe(8);
  });

  it('applies grid insertColumn and removeColumn patches', () => {
    const data = new BlueData();
    const ld = data.getLiveData();
    const bins = ld.getLiveObjectBins();

    expect(bins.getColumnCount()).toBe(1);

    applyProjectDocumentPatch(data, { blueLive: { type: 'insertColumn', index: 1 } });
    let snap = createBlueLiveProjectSnapshot(ld);
    expect(snap.bins.columns).toBe(2);

    applyProjectDocumentPatch(data, { blueLive: { type: 'removeColumn', index: 0 } });
    snap = createBlueLiveProjectSnapshot(ld);
    expect(snap.bins.columns).toBe(1);
  });

  it('applies captureEnabledSet and renameSet patches', () => {
    const data = new BlueData();
    const ld = data.getLiveData();
    const bins = ld.getLiveObjectBins();
    const obj = bins.getLiveObject(0, 0);
    if (obj) obj.setEnabled(true);

    applyProjectDocumentPatch(data, { blueLive: { type: 'captureEnabledSet' } });
    let snap = createBlueLiveProjectSnapshot(ld);
    expect(snap.sets).toHaveLength(1);
    expect(snap.sets[0].name).toBe('Set 1');

    applyProjectDocumentPatch(data, { blueLive: { type: 'renameSet', index: 0, name: 'My Set' } });
    snap = createBlueLiveProjectSnapshot(ld);
    expect(snap.sets[0].name).toBe('My Set');
  });

  it('applies removeSet patch', () => {
    const data = new BlueData();
    const ld = data.getLiveData();

    applyProjectDocumentPatch(data, { blueLive: { type: 'captureEnabledSet' } });
    applyProjectDocumentPatch(data, { blueLive: { type: 'captureEnabledSet' } });
    let snap = createBlueLiveProjectSnapshot(ld);
    expect(snap.sets).toHaveLength(2);

    applyProjectDocumentPatch(data, { blueLive: { type: 'removeSet', index: 0 } });
    snap = createBlueLiveProjectSnapshot(ld);
    expect(snap.sets).toHaveLength(1);
    expect(snap.sets[0].name).toBe('Set 2');
  });

  it('applies moveSet patch', () => {
    const data = new BlueData();
    const ld = data.getLiveData();

    applyProjectDocumentPatch(data, { blueLive: { type: 'captureEnabledSet' } });
    applyProjectDocumentPatch(data, { blueLive: { type: 'captureEnabledSet' } });

    applyProjectDocumentPatch(data, { blueLive: { type: 'renameSet', index: 0, name: 'A' } });
    applyProjectDocumentPatch(data, { blueLive: { type: 'renameSet', index: 1, name: 'B' } });

    applyProjectDocumentPatch(data, { blueLive: { type: 'moveSet', from: 0, to: 1 } });
    const snap = createBlueLiveProjectSnapshot(ld);
    expect(snap.sets[0].name).toBe('B');
    expect(snap.sets[1].name).toBe('A');
  });

  it('round-trips through snapshot then back through patches', () => {
    const data = createProjectWithLiveData();
    const original = createBlueLiveProjectSnapshot(data.getLiveData());

    const data2 = createProjectWithLiveData();
    applyProjectDocumentPatch(data2, {
      blueLive: { type: 'updateOptions', patch: { commandLine: original.commandLine, commandLineEnabled: original.commandLineEnabled } },
    });
    applyProjectDocumentPatch(data2, {
      blueLive: { type: 'updateTempoRepeat', patch: { tempo: original.tempo, repeat: original.repeat, repeatEnabled: original.repeatEnabled } },
    });
    applyProjectDocumentPatch(data2, {
      blueLive: { type: 'updateLiveCodeText', text: original.liveCodeText },
    });

    const restored = createBlueLiveProjectSnapshot(data2.getLiveData());
    expect(restored.commandLine).toBe(original.commandLine);
    expect(restored.tempo).toBe(original.tempo);
    expect(restored.repeat).toBe(original.repeat);
    expect(restored.liveCodeText).toBe(original.liveCodeText);
  });
});
