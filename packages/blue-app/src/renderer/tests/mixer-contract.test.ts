import { describe, expect, it } from 'vitest';
import { BlueData, Channel, Effect, GenericInstrument } from '@blue/data';
import {
  applyProjectDocumentPatch,
  createProjectEditorSnapshot,
  getMixerChannelSnapshotId,
  getMixerEntrySnapshotId,
} from '../../shared/project-editor';

function createMixerProject(): {
  data: BlueData;
  channel: Channel;
  effect: Effect;
} {
  const data = new BlueData();

  const instrument = new GenericInstrument();
  instrument.setName('Lead');
  data.getArrangement().addInstrument(instrument, '1');

  const channel = new Channel();
  channel.setName('Lead Channel');
  channel.setAssociation('1');
  data.getMixer().getChannels().splice(0, 0, channel);

  const effect = new Effect();
  effect.setName('Warmth');
  effect.setComments('Original note');
  effect.setCode('aout = ain');
  channel.getPreEffects().splice(0, 0, effect);

  return { data, channel, effect };
}

describe('Mixer contract', () => {
  it('captures mixer state and effect comments in the project snapshot', () => {
    const { data } = createMixerProject();
    const snapshot = createProjectEditorSnapshot(data, '/tmp/test.blue');

    expect(snapshot.mixer).toBeDefined();
    expect(snapshot.mixer?.channels).toHaveLength(1);
    expect(snapshot.mixer?.channels[0]?.preChain[0]).toEqual(
      expect.objectContaining({
        kind: 'effect',
        name: 'Warmth',
        comments: 'Original note',
      }),
    );
  });

  it('applies mixer patches to the canonical BlueData mixer and effect model', () => {
    const { data, channel, effect } = createMixerProject();
    const channelId = getMixerChannelSnapshotId(channel);
    const entryId = getMixerEntrySnapshotId(effect);

    expect(
      applyProjectDocumentPatch(data, {
        mixer: {
          type: 'setMixerEnabled',
          value: false,
        },
      }),
    ).toBe(true);
    expect(data.getMixer().isEnabled()).toBe(false);

    expect(
      applyProjectDocumentPatch(data, {
        mixer: {
          type: 'updateEffect',
          channelId,
          chain: 'pre',
          entryId,
          patch: {
            comments: 'Updated note',
          },
        },
      }),
    ).toBe(true);

    expect(effect.getComments()).toBe('Updated note');

    const snapshot = createProjectEditorSnapshot(data, '/tmp/test.blue');
    expect(snapshot.mixer?.channels[0]?.preChain[0]).toEqual(
      expect.objectContaining({
        kind: 'effect',
        comments: 'Updated note',
      }),
    );
  });
});
