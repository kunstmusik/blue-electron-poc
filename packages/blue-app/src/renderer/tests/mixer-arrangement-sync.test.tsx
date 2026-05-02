import { describe, expect, it } from 'vitest';
import { BlueData, Channel, GenericInstrument } from '@blue/data';
import {
  createMixerSnapshot,
  createOrchestraSnapshot,
  reconcileMixerSnapshotWithArrangement,
} from '../../shared/project-editor';

function createArrangementProject(): BlueData {
  const data = new BlueData();

  const lead = new GenericInstrument();
  lead.setName('Lead');
  data.getArrangement().addInstrument(lead, '1');

  const pad = new GenericInstrument();
  pad.setName('Pad');
  data.getArrangement().addInstrument(pad, '2');

  const channel = new Channel();
  channel.setName('Lead Channel');
  channel.setAssociation('1');
  data.getMixer().getChannels().splice(0, 0, channel);

  return data;
}

describe('Mixer arrangement synchronization', () => {
  it('reconciles mixer channels to the current arrangement rows', () => {
    const data = createArrangementProject();
    const reconciled = reconcileMixerSnapshotWithArrangement(
      createMixerSnapshot(data.getMixer()),
      createOrchestraSnapshot(data),
    );

    expect(reconciled.channels).toHaveLength(2);
    expect(reconciled.channels[0]?.association).toBe('1');
    expect(reconciled.channels[0]?.name).toBe('Lead Channel');
    expect(reconciled.channels[1]?.association).toBe('2');
    expect(reconciled.channels[1]?.name).toBe('Pad');
    expect(reconciled.master.name).toBe('Master');
  });
});
