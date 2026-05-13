import { describe, expect, it } from 'vitest';
import { Element } from '../serialization/xml-reader';
import { BlueSynthBuilder } from './blue-synth-builder';
import { UDOStyle } from '../opcodes/udo-style';

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

  it('updates text field and file selector properties through widget patches', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>String Widgets</name>
      <instrumentText>Smsg sprintf \"%s %s\", \"&lt;textField&gt;\", \"&lt;fileSelect&gt;\"</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBTextField">
          <objectName>textField</objectName>
          <x>0</x><y>0</y>
          <value>hello</value>
          <textFieldWidth>120</textFieldWidth>
        </bsbObject>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBFileSelector">
          <objectName>fileSelect</objectName>
          <x>0</x><y>40</y>
          <fileName>audio/test.wav</fileName>
          <textFieldWidth>150</textFieldWidth>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const widgets = instrument.getGraphicInterface().getRootGroup().getChildren();
    const textField = widgets[0]!;
    const fileSelector = widgets[1]!;

    expect(instrument.updateWidgetProperties(textField.id, { textValue: 'updated text' })).toBe(true);
    expect(instrument.updateWidgetProperties(fileSelector.id, { fileName: 'samples/new.wav' })).toBe(true);

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('<value>updated text</value>');
    expect(savedXml).not.toContain('<textValue>updated text</textValue>');
    expect(savedXml).toContain('<fileName>samples/new.wav</fileName>');
  });

  it('serializes BSBValue defaultValue tags and applies raw preset values', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Value Preset</name>
      <instrumentText>kval = &lt;meter&gt;</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBValue">
          <objectName>meter</objectName>
          <x>0</x><y>0</y>
          <minimum>0</minimum>
          <maximum>1</maximum>
          <defaultValue>0.25</defaultValue>
        </bsbObject>
      </graphicInterface>
      <presetGroup name="Value Presets">
        <preset name="Hot" uniqueId="hot">
          <setting name="meter">0.75</setting>
        </preset>
      </presetGroup>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    expect(instrument.applyPreset('hot')).toBe(true);

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('<defaultValue>0.75</defaultValue>');
    expect(savedXml).not.toContain('<value>0.75</value>');
  });

  it('applies colon-separated slider bank presets to child slider values', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Bank Preset</name>
      <instrumentText>kout = &lt;bank_0&gt; + &lt;bank_1&gt;</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBHSliderBank">
          <objectName>bank</objectName>
          <x>0</x><y>0</y>
          <minimum>0</minimum>
          <maximum>1</maximum>
          <sliderWidth>120</sliderWidth>
          <gap>5</gap>
          <bdresolution>-1</bdresolution>
          <bsbObject type="blue.orchestra.blueSynthBuilder.BSBHSlider">
            <objectName>bank_0</objectName>
            <value>0.2</value>
          </bsbObject>
          <bsbObject type="blue.orchestra.blueSynthBuilder.BSBHSlider">
            <objectName>bank_1</objectName>
            <value>0.7</value>
          </bsbObject>
        </bsbObject>
      </graphicInterface>
      <presetGroup name="Bank Presets">
        <preset name="Alt" uniqueId="alt">
          <setting name="bank">0.15:0.85</setting>
        </preset>
      </presetGroup>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    expect(instrument.applyPreset('alt')).toBe(true);

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('<value>0.15</value>');
    expect(savedXml).toContain('<value>0.85</value>');
  });

  it('updates line object line data through widget patches', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Line Object</name>
      <instrumentText>code</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBLineObject">
          <objectName>curve</objectName>
          <x>0</x><y>0</y>
          <canvasWidth>200</canvasWidth>
          <canvasHeight>120</canvasHeight>
          <lines>
            <line varName="curveA" min="0" max="1" color="#ff0000">
              <linePoint x="0" y="0.25"/>
              <linePoint x="1" y="0.75"/>
            </line>
          </lines>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const widget = instrument.getGraphicInterface().getRootGroup().getChildren()[0]!;

    expect(
      instrument.updateWidgetProperties(widget.id, {
        lines: [
          {
            varName: 'curveA',
            min: 0,
            max: 1,
            color: '#00ff00',
            points: [
              { x: 0, y: 0.2 },
              { x: 0.5, y: 0.5 },
              { x: 1, y: 0.8 },
            ],
          },
        ],
      }),
    ).toBe(true);

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('<lines>');
    expect(savedXml).toContain('<linePoint x="0.5" y="0.5"/>');
  });

  it('parses and saves Java-style BSB line metadata', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Java Line Object</name>
      <instrumentText>code</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBLineObject">
          <objectName>curve</objectName>
          <x>0</x><y>0</y>
          <canvasWidth>200</canvasWidth>
          <canvasHeight>120</canvasHeight>
          <separatorType>COMMA</separatorType>
          <lines>
            <line name="env" varName="line0" version="2" max="1.0" min="0.0" bdresolution="-1" color="-65536" rightBound="false" endPointsLinked="false">
              <linePoint x="0.0" y="0.25"/>
              <linePoint x="1.0" y="0.75"/>
            </line>
          </lines>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const widget = instrument.getGraphicInterface().getRootGroup().getChildren()[0]! as any;
    expect(widget.lines[0].varName).toBe('env');
    expect(widget.lines[0].color).toBe('#ff0000');
    expect(widget.separatorType).toBe('Comma');

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('<separatorType>COMMA</separatorType>');
    expect(savedXml).toContain('line name="env"');
    expect(savedXml).toContain('color="-65536"');
  });

  it('parses legacy text-encoded BSB line points', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Legacy Line Points</name>
      <instrumentText>code</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBLineObject">
          <objectName>curve</objectName>
          <lines>
            <line name="legacy" min="0" max="1" color="#00ff00">
              <points>0,0.1 0.5,0.6 1,0.2</points>
            </line>
          </lines>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const widget = instrument.getGraphicInterface().getRootGroup().getChildren()[0]! as any;

    expect(widget.lines[0].varName).toBe('legacy');
    expect(widget.lines[0].points).toEqual([
      { x: 0, y: 0.1 },
      { x: 0.5, y: 0.6 },
      { x: 1, y: 0.2 },
    ]);
  });

  it('updates slider bank child values through slider bank patches', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>Slider Bank</name>
      <instrumentText>aout = &lt;bank_0&gt; + &lt;bank_1&gt;</instrumentText>
      <graphicInterface>
        <bsbObject type="blue.orchestra.blueSynthBuilder.BSBHSliderBank">
          <objectName>bank</objectName>
          <x>0</x><y>0</y>
          <minimum>0</minimum>
          <maximum>1</maximum>
          <sliderWidth>120</sliderWidth>
          <gap>5</gap>
          <bsbObject type="blue.orchestra.blueSynthBuilder.BSBHSlider">
            <objectName>bank_0</objectName>
            <value>0.2</value>
          </bsbObject>
          <bsbObject type="blue.orchestra.blueSynthBuilder.BSBHSlider">
            <objectName>bank_1</objectName>
            <value>0.7</value>
          </bsbObject>
        </bsbObject>
      </graphicInterface>
      <opcodeList/>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));
    const widget = instrument.getGraphicInterface().getRootGroup().getChildren()[0]!;

    expect(instrument.updateSliderBankValue(widget.id, 1, 0.42)).toBe(true);

    const savedXml = instrument.saveAsXML().toXml();
    expect(savedXml).toContain('<value>0.42</value>');
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

  it('converts instrument UDO styles using the shared utility semantics', () => {
    const xml = `<instrument type="blue.orchestra.BlueSynthBuilder">
      <name>UDO Convert</name>
      <instrumentText>code</instrumentText>
      <graphicInterface/>
      <opcodeList>
        <opcode>
          <opcodeName>saturate</opcodeName>
          <outTypes>a</outTypes>
          <inTypes>ak</inTypes>
          <style>CLASSIC</style>
          <codeBody>aSig, kDrive	xin
aOut = tanh(aSig * kDrive)
xout aOut</codeBody>
        </opcode>
      </opcodeList>
    </instrument>`;

    const instrument = BlueSynthBuilder.loadFromXML(Element.parse(xml));

    expect(instrument.convertUdoStyle(0, UDOStyle.MODERN)).toBe(true);
    let udo = instrument.getOpcodeList().getOpcode(0);
    expect(udo?.getStyle()).toBe(UDOStyle.MODERN);
    expect(udo?.getInputArguments()).toBe('aSig, kDrive');
    expect(udo?.getInTypes()).toBe('');
    expect(udo?.getCode()).not.toContain('xin');

    expect(instrument.convertUdoStyle(0, UDOStyle.CLASSIC)).toBe(true);
    udo = instrument.getOpcodeList().getOpcode(0);
    expect(udo?.getStyle()).toBe(UDOStyle.CLASSIC);
    expect(udo?.getInputArguments()).toBe('');
    expect(udo?.getInTypes()).toBe('ak');
    expect(udo?.getCode()).toContain('aSig, kDrive\txin');
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
