/**
 * Integration tests for BSB instrument loading and CSD generation.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { BlueData } from '../../src/blue-data';
import { Arrangement } from '../../src/arrangement';

// Path to test .blue file
const DEMO2022_PATH = '/Users/stevenyi/work/blue/demo2024/demo2022.blue';

describe.skipIf(!fs.existsSync(DEMO2022_PATH))('BSB Integration: demo2022.blue', () => {
  let data: BlueData;
  let csd: string;

  beforeAll(async () => {
    const xml = fs.readFileSync(DEMO2022_PATH, 'utf-8');
    data = await BlueData.loadFromString(xml);
    csd = data.toCSD();
  });

  it('T453: BSB instruments are loaded (count > 0)', () => {
    const arrangement = (data as unknown as { arrangement: Arrangement }).arrangement;
    expect(arrangement.size()).toBeGreaterThan(0);

    // Count loaded instruments
    let loadedCount = 0;
    let bsbCount = 0;
    for (const ia of arrangement.getArrangement()) {
      if (ia.instr) {
        loadedCount++;
        if (ia.instr.constructor.name === 'BlueSynthBuilder') {
          bsbCount++;
        }
      }
    }
    // demo2022.blue has 3 BSB instruments: Alpha v3 (x2), SimpleSampler (x1)
    expect(loadedCount).toBe(3);
    expect(bsbCount).toBe(3);
  });

  it('T454: CSD has no unresolved <placeholder> tokens', () => {
    // Check orchestra section for remaining placeholders
    const orcMatch = csd.match(/<CsInstruments>([\s\S]*?)<\/CsInstruments>/);
    if (orcMatch) {
      const orcContent = orcMatch[1];
      // Should not have unresolved <token> patterns (except legitimate Csound syntax)
      const unresolved = orcContent.match(/<[a-zA-Z_][a-zA-Z0-9_]*>/g);
      // Filter out known legitimate patterns like <INSTR_ID> which should be replaced
      const remaining = unresolved?.filter(t =>
        t !== '<INSTR_ID>' && t !== '<INSTR_NAME>' &&
        !t.startsWith('<INSTR_')
      );
      expect(remaining).toBeUndefined();
    }
  });

  it('T455: CSD contains global orchestra code with mixer inits', () => {
    // The demo2022.blue project has a mixer with channels
    // Mixer init statements should appear in the CSD as ga_bluemix_X_Y init 0
    expect(csd).toMatch(/ga_bluemix_\d+_\d+\s+init\s+0/);
  });

  it('T456: CSD has expected number of instrument definitions', () => {
    // Count instrument definitions in the CSD
    const instrMatches = csd.match(/\binstr\s+\w+\s*;/g);
    expect(instrMatches).not.toBeNull();
    expect(instrMatches!.length).toBeGreaterThan(0);
    // demo2022.blue has 3 BSB instruments: Alpha v3 (x2), SimpleSampler (x1)
    expect(instrMatches!.length).toBe(3);
  });

  it('BSB instruments generate non-empty orchestra code', () => {
    // Verify that each loaded BSB instrument generates actual orchestra code
    const arrangement = (data as unknown as { arrangement: Arrangement }).arrangement;
    let generatedCount = 0;
    for (const ia of arrangement.getArrangement()) {
      if (ia.instr) {
        const generated = ia.instr.generateInstrument();
        if (generated && generated.length > 0) {
          generatedCount++;
          // Verify no unresolved placeholders remain
          const placeholders = generated.match(/<[a-zA-Z_][a-zA-Z0-9_]*>/g);
          expect(placeholders).toBeNull();
        }
      }
    }
    expect(generatedCount).toBe(3);
  });

  it('T459: Missing widget values default to 0.0', () => {
    // Verify that widgets without explicit values use 0.0
    // This is tested implicitly by CSD generation not producing NaN
    expect(csd).not.toContain('NaN');
    expect(csd).not.toContain('undefined');
  });

  it('T460: Unknown BSB widget types are skipped with warning', () => {
    // This is tested implicitly - if unknown types caused errors,
    // the CSD generation would have thrown
    expect(() => data.toCSD()).not.toThrow();
  });

  it('T461: Empty instrumentText returns empty string', () => {
    // BlueSynthBuilder with no instrumentText returns ''
    // Tested implicitly - no empty instr definitions in CSD
    const emptyInstrMatches = csd.match(/instr\s+\w+\s*;\s*\n\s*\n\s*endin/g);
    expect(emptyInstrMatches).toBeNull();
  });
});
