import { describe, it, expect } from 'vitest';
import { Element } from '../../src/serialization/xml-reader';
import { GlobalOrcSco } from '../../src/global-orc-sco';

/**
 * Migration test: loads a pre-2.3.0 .blue file format and verifies
 * that the upgrade system correctly migrates the data.
 *
 * Pre-2.3.0 files had:
 * - Tempo as a root-level element (not inside Score)
 * - Root PolyObject as a direct child (not inside Score)
 * - Pattern layers with patternLayer children directly under patternsLayerGroup
 *   (not nested under a patternLayers element)
 */
describe('Migration: old file formats', () => {
  it('loads pre-2.3.0 file with tempo at root level', async () => {
    const { BlueData } = await import('../../src/blue-data');

    const oldXml = `<?xml version="1.0" encoding="UTF-8"?>
<blueData version="2.2.5">
  <tempo>
    <smpteFrameRate>30</smpteFrameRate>
  </tempo>
  <projectProperties>
    <title>Old Tempo Project</title>
    <sampleRate>44100</sampleRate>
    <ksmps>64</ksmps>
  </projectProperties>
  <soundObject>
    <soundLayer name="Layer 1">
      <soundObject type="GenericScore">
        <name>My Score</name>
        <scoreText>i1 0 2</scoreText>
      </soundObject>
    </soundLayer>
  </soundObject>
</blueData>`;

    // Should not throw
    const data = await BlueData.loadFromString(oldXml);
    expect(data.getVersion()).toBe('2.2.5');
    expect(data.getProjectProperties().title).toBe('Old Tempo Project');
  });

  it('loads pre-2.1.10 file without 0dbfs properties', async () => {
    const { BlueData } = await import('../../src/blue-data');

    const oldXml = `<?xml version="1.0" encoding="UTF-8"?>
<blueData version="2.1.5">
  <projectProperties>
    <title>Pre 0dbfs Project</title>
    <sampleRate>44100</sampleRate>
  </projectProperties>
  <globalOrcSco>
    <globalOrc>sr = 44100
kr = 4410
0dbfs = 65536
nchnls = 2</globalOrc>
  </globalOrcSco>
</blueData>`;

    const data = await BlueData.loadFromString(oldXml);
    const props = data.getProjectProperties();

    // 2.1.10 upgrader should have extracted 0dbfs
    expect(props.useZeroDbFS).toBe(true);
    expect(props.zeroDbFS).toBe('65536');
    expect(props.diskUseZeroDbFS).toBe(true);
    expect(props.diskZeroDbFS).toBe('65536');
  });

  it('loads minimal .blue file', async () => {
    const { BlueData } = await import('../../src/blue-data');

    const minimalXml = `<?xml version="1.0" encoding="UTF-8"?>
<blueData version="2.9.0">
  <projectProperties>
    <title>Minimal</title>
  </projectProperties>
</blueData>`;

    const data = await BlueData.loadFromString(minimalXml);
    expect(data.getVersion()).toBe('2.9.0');
    expect(data.getProjectProperties().title).toBe('Minimal');
    // Default values should be set
    expect(data.getProjectProperties().sampleRate).toBe('44100');
    expect(data.getProjectProperties().ksmps).toBe('64');
  });

  it('migration, async', async () => {
    const { BlueData } = await import('../../src/blue-data');

    const oldXml = `<?xml version="1.0" encoding="UTF-8"?>
<blueData version="2.1.5">
  <globalOrcSco>
    <globalOrc>sr = 44100
0dbfs = 32768
nchnls = 2</globalOrc>
    <globalSco>e</globalSco>
  </globalOrcSco>
  <projectProperties>
    <title>Migrated Project</title>
    <sampleRate>44100</sampleRate>
    <ksmps>64</ksmps>
    <nchnls>2</nchnls>
  </projectProperties>
</blueData>`;

    // Load (applies migration)
    const data = await BlueData.loadFromString(oldXml);

    // Save
    const savedXml = data.saveToString();

    // Reload
    const reloaded = await BlueData.loadFromString(savedXml);

    // Verify 0dbfs properties preserved
    const props = reloaded.getProjectProperties();
    expect(props.useZeroDbFS).toBe(true);
    expect(props.zeroDbFS).toBe('32768');
  });
});

describe('XML structure compatibility', () => {
  it('parses XML with attributes on nested elements', () => {
    const xml = `<?xml version="1.0"?>
<blueData version="2.9.0">
  <projectProperties>
    <title>Test</title>
  </projectProperties>
  <arrangement>
    <instrumentAssignment id="1" enabled="true"/>
    <instrumentAssignment id="2" enabled="false"/>
  </arrangement>
  <tables>
    <fTable name="f1">f 1 0 1024 10 1</fTable>
  </tables>
</blueData>`;

    const root = Element.parse(xml);
    expect(root.getAttribute('version')).toBe('2.9.0');

    const arr = root.getElement('arrangement');
    const items = arr!.getElements('instrumentAssignment');
    expect(items.size).toBe(2);

    const first = items.toArray()[0];
    expect(first.getAttribute('id')).toBe('1');
    expect(first.getAttribute('enabled')).toBe('true');
  });

  it('handles XML special characters in text content', () => {
    const gos = new GlobalOrcSco();
    gos.setGlobalOrc('sr = 44100\n; use <instr> tags\nkr = 4410');

    const xml = gos.saveAsXML();
    const xmlStr = xml.toXml();
    expect(xmlStr).toContain('&lt;instr&gt;');

    const reloaded = GlobalOrcSco.loadFromXML(xml);
    expect(reloaded.getGlobalOrc()).toBe(gos.getGlobalOrc());
  });
});
