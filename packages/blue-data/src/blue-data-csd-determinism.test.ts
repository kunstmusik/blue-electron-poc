import { describe, expect, it } from 'vitest';
import { BlueData } from './blue-data';
import { Arrangement } from './arrangement';
import { GenericInstrument } from './instruments/generic-instrument';
import { Tables } from './tables';

class DeterministicTableInstrument extends GenericInstrument {
  override generateFTables(tables: unknown): void {
    if (!(tables instanceof Tables)) {
      return;
    }

    const num = tables.getOpenFTableNumber();
    const current = tables.getTables();
    const line = `f ${num} 0 32 10 1`;
    tables.setTables(current ? `${current}\n${line}` : line);
  }

  override deepCopy(): GenericInstrument {
    const copy = new DeterministicTableInstrument();
    copy.setName(this.getName());
    copy.setText(this.getText());
    copy.setGlobalOrc(this.getGlobalOrc());
    copy.setGlobalSco(this.getGlobalSco());
    return copy;
  }
}

function extractScoreEvents(csd: string): string[] {
  const match = csd.match(/<CsScore>([\s\S]*?)<\/CsScore>/);
  if (!match) {
    return [];
  }
  return match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('i'));
}

describe('BlueData deterministic render parity', () => {
  it('keeps source-id and ftable ordering stable across repeated runs', () => {
    const data = new BlueData();
    data.getGlobalOrcSco().setGlobalOrc('gi_reserved ftgen 1, 0, 1024, 10, 1');
    data.setRenderEndTime(16);

    const arrangement = new Arrangement();
    const tableInstrument = new DeterministicTableInstrument();
    tableInstrument.setName('Deterministic');
    tableInstrument.setText('aout oscili 0.1, 440\nblueMixerOut aout, aout');
    arrangement.addInstrument(tableInstrument, '4');
    data.setArrangement(arrangement);

    const first = data.toCSD();
    const second = data.toCSD();

    expect(second).toBe(first);
    expect(first).toContain('f 2 0 32 10 1');
    expect(first).not.toContain('f 1 0 32 10 1');

    const firstEvents = extractScoreEvents(first);
    const secondEvents = extractScoreEvents(second);
    expect(secondEvents).toEqual(firstEvents);
  });
});
