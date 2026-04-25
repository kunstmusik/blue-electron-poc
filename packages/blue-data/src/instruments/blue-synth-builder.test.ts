import { describe, expect, it } from 'vitest';
import { Element } from '../serialization/xml-reader';
import { BlueSynthBuilder } from './blue-synth-builder';

describe('BlueSynthBuilder', () => {
  it('preserves loaded graphic interface XML and opcode lists', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Builder</name>
      <comment>builder comment</comment>
      <instrumentText>aout oscili &lt;amp&gt;, 440</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>amp</objectName>
          <x>10</x>
          <y>20</y>
          <value>0.5</value>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const savedXml = instrument.saveAsXML().toXml();

    expect(instrument.getName()).toBe('Builder');
    expect(instrument.getComment()).toBe('builder comment');
    expect(savedXml).toContain('<graphicInterface>');
    expect(savedXml).toContain('blue.orchestra.blueSynthBuilder.BSBKnob');
    expect(savedXml).toContain('<objectName>amp</objectName>');
    expect(savedXml).toContain('<opcodeList/>');
  });

  it('updates loaded widget values and serializes the edited interface', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Builder</name>
      <instrumentText>aout oscili &lt;amp&gt;, 440</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>amp</objectName>
          <x>10</x>
          <y>20</y>
          <value>0.5</value>
          <minimum>0</minimum>
          <maximum>1</maximum>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    expect(instrument.updateWidgetValue('amp', 0.75)).toBe(true);

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('<objectName>amp</objectName>');
    expect(savedXml).toContain('<value>0.75</value>');
  });

  it('loads and saves preset groups with round-trip fidelity', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Preset Test</name>
      <instrumentText>aout oscili &lt;amp&gt;, 440</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>amp</objectName>
          <x>10</x><y>20</y>
          <value>0.5</value>
          <minimum>0</minimum><maximum>1</maximum>
        </bsbObject>
      </graphicInterface>
      <presetGroup name="My Presets" currentPresetUniqueId="p1">
        <preset name="Default" uniqueId="p1">
          <setting name="amp">ver2:0.8</setting>
        </preset>
      </presetGroup>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const pg = instrument.getPresetGroup();
    expect(pg).not.toBeNull();
    expect(pg!.getPresetGroupName()).toBe('My Presets');
    expect(pg!.getPresets()).toHaveLength(1);
    expect(pg!.getPresets()[0].getValue('amp')).toBe('ver2:0.8');

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('name="My Presets"');
    expect(savedXml).toContain('ver2:0.8');

    const reloaded = BlueSynthBuilder.loadFromXML(Element.parse(savedXml));
    expect(reloaded.getPresetGroup()!.getPresets()[0].getValue('amp')).toBe('ver2:0.8');
  });

  it('applies presets to update widget values', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Preset Apply</name>
      <instrumentText>aout oscili &lt;amp&gt;, 440</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>amp</objectName>
          <x>10</x><y>20</y>
          <value>0.5</value>
          <minimum>0</minimum><maximum>1</maximum>
        </bsbObject>
      </graphicInterface>
      <presetGroup name="Presets">
        <preset name="Loud" uniqueId="loud1">
          <setting name="amp">ver2:0.9</setting>
        </preset>
      </presetGroup>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    expect(instrument.applyPreset('loud1')).toBe(true);

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('<value>0.9</value>');
    expect(instrument.getPresetGroup()!.getCurrentPresetUniqueId()).toBe('loud1');
  });

  it('loads grid settings and editEnabled from graphic interface', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder" editEnabled="false">
      <name>Grid Test</name>
      <instrumentText>code</instrumentText>
      <graphicInterface editEnabled="false">
        <gridSettings>
          <width>20</width>
          <height>20</height>
          <gridStyle>LINE</gridStyle>
          <snapGridEnabled>false</snapGridEnabled>
        </gridSettings>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>k1</objectName>
          <x>0</x><y>0</y>
          <value>0</value>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    expect(instrument.isEditEnabled()).toBe(false);
    expect(instrument.getGraphicInterface().isEditEnabled()).toBe(false);

    const gs = instrument.getGraphicInterface().getGridSettings();
    expect(gs.width).toBe(20);
    expect(gs.height).toBe(20);
    expect(gs.gridStyle).toBe('LINE');
    expect(gs.snapEnabled).toBe(false);
    expect(gs.enabled).toBe(true);
  });

  it('updates widget properties via updateWidgetProperties', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Prop Test</name>
      <instrumentText>aout oscili &lt;gain&gt;, 440</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>gain</objectName>
          <x>10</x><y>20</y>
          <value>0.5</value>
          <minimum>0</minimum><maximum>1</maximum>
          <knobWidth>60</knobWidth>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const rootGroup = instrument.getGraphicInterface().getRootGroup();
    const widget = rootGroup.getChildren()[0]!;
    expect(widget).toBeDefined();

    expect(instrument.updateWidgetProperties(widget.id, { objectName: 'volume', x: 50 })).toBe(true);
    expect(widget.objectName).toBe('volume');
    expect(widget.x).toBe(50);
  });

  it('preserves preset group when performing widget edits', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Preserve Test</name>
      <instrumentText>code</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>amp</objectName>
          <x>0</x><y>0</y><value>0.5</value>
        </bsbObject>
      </graphicInterface>
      <presetGroup name="Presets">
        <preset name="A" uniqueId="pa">
          <setting name="amp">ver2:0.8</setting>
        </preset>
      </presetGroup>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const widget = instrument.getGraphicInterface().getRootGroup().getChildren()[0]!;
    instrument.updateWidgetProperties(widget.id, { value: 0.3 });

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('name="Presets"');
    expect(savedXml).toContain('ver2:0.8');
  });

  it('round-trips opcode list text', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>UDO Test</name>
      <instrumentText>code</instrumentText>
      <graphicInterface/>
      <opcodeList>
        <opcode name="myUDO">
          <signature>k,k</signature>
          <code>  xout a + b</code>
        </opcode>
      </opcodeList>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const text = instrument.getOpcodeListText();
    expect(text.length).toBeGreaterThan(0);

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('<opcodeList>');
  });

  it('preserves graphic interface XML through edit cycles', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Preserve</name>
      <instrumentText>aout oscili &lt;amp&gt;, 440</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>amp</objectName>
          <x>10</x><y>20</y>
          <value>0.5</value>
          <minimum>0</minimum><maximum>1</maximum>
          <knobWidth>60</knobWidth>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    instrument.updateWidgetValue('amp', 0.9);

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('BSBKnob');
    expect(savedXml).toContain('amp');
    expect(savedXml).toContain('0.9');
    expect(savedXml).toContain('knobWidth');
  });

  it('preserves preset data when performing interface edits', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Preserve Presets</name>
      <instrumentText>code</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBKnob">
          <objectName>k1</objectName>
          <x>0</x><y>0</y><value>0.5</value>
        </bsbObject>
      </graphicInterface>
      <presetGroup name="Bank">
        <preset name="A" uniqueId="pa">
          <setting name="k1">ver2:0.8</setting>
        </preset>
        <presetGroup name="Sub">
          <preset name="B" uniqueId="pb">
            <setting name="k1">ver2:0.3</setting>
          </preset>
        </presetGroup>
      </presetGroup>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const widget = instrument.getGraphicInterface().getRootGroup().getChildren()[0]!;
    instrument.updateWidgetProperties(widget.id, { objectName: 'k1_renamed' });

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('name="Bank"');
    expect(savedXml).toContain('name="Sub"');
    expect(savedXml).toContain('ver2:0.8');
    expect(savedXml).toContain('ver2:0.3');
  });
});
