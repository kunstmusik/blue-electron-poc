import { describe, expect, it } from 'vitest';
import { BlueData } from './blue-data';
import { Arrangement } from './arrangement';
import { Channel } from './mixer/channel';
import { GenericInstrument } from './instruments/generic-instrument';

describe('BlueData CSD render copy safety', () => {
  it('does not mutate the live arrangement or mixer state during render', () => {
    const data = new BlueData();

    const arrangement = new Arrangement();
    const activeInstrument = new GenericInstrument();
    activeInstrument.setName('Active');
    activeInstrument.setText('aout oscili p4, p5');
    arrangement.addInstrument(activeInstrument, '1');

    const disabledInstrument = new GenericInstrument();
    disabledInstrument.setName('Disabled');
    disabledInstrument.setText('aout oscili p4, p5');
    arrangement.addInstrument(disabledInstrument, '2');
    arrangement.getArrangement()[1]!.enabled = false;

    data.setArrangement(arrangement);

    const channel = new Channel();
    channel.setName('Bus');
    data.getMixer().getChannels().push(channel);

    const liveLevelParameter = channel.getLevelParameter();
    expect(liveLevelParameter.getCompilationVarName()).toBeNull();

    const firstRender = data.toCSD();
    const secondRender = data.toCSD();

    expect(secondRender).toBe(firstRender);
    expect(data.getArrangement().size()).toBe(2);
    expect(data.getArrangement().getArrangement()[1]!.enabled).toBe(false);
    expect(liveLevelParameter.getCompilationVarName()).toBeNull();
  });
});
