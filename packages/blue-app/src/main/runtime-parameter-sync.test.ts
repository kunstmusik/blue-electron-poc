import { describe, expect, it } from 'vitest';
import { AudioLayer, AudioLayerGroup, BlueData, GenericInstrument } from '@blue/data';
import { createProjectEditorSnapshot } from '../shared/project-editor';
import { syncCompiledRuntimeParameterNames } from './runtime-parameter-sync';

describe('syncCompiledRuntimeParameterNames', () => {
  it('copies compiled mixer level parameter names back to live audio-layer channels', () => {
    const data = new BlueData();
    data.getScore().length = 0;

    const instrument = new GenericInstrument();
    instrument.setName('Lead');
    instrument.setText('aout oscili 0.4, 440');
    data.getArrangement().addInstrument(instrument, '1');

    const audioGroup = new AudioLayerGroup();
    const layer = new AudioLayer();
    layer.setName('Audio A');
    audioGroup.push(layer);
    data.getScore().push(audioGroup);

    createProjectEditorSnapshot(data, '/tmp/test.blue');

    const liveInstrumentChannel = data.getMixer().getChannels().find(
      (channel) => channel.getAssociation() === '1',
    );
    const liveAudioChannel = data.getMixer().getAllSourceChannels().find(
      (channel) => channel.getAssociation() === layer.getUniqueId(),
    );

    expect(liveInstrumentChannel?.getLevelParameter().getCompilationVarName()).toBeNull();
    expect(liveAudioChannel?.getLevelParameter().getCompilationVarName()).toBeNull();

    const render = data.toRealtimePlaybackCSD();
    const sync = syncCompiledRuntimeParameterNames(
      data.getArrangement(),
      data.getMixer(),
      render.parameters,
    );

    expect(sync.liveCount).toBe(sync.compiledCount);
    expect(liveInstrumentChannel?.getLevelParameter().getCompilationVarName()).toMatch(/^gk_blue_auto\d+$/);
    expect(liveAudioChannel?.getLevelParameter().getCompilationVarName()).toMatch(/^gk_blue_auto\d+$/);
  });
});
