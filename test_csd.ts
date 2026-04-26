import { BlueSynthBuilder } from './packages/blue-data/src/instruments/blue-synth-builder';
import { Element } from './packages/blue-data/src/serialization/xml-reader';
import { Arrangement } from './packages/blue-data/src/arrangement';
import { CompileData } from './packages/blue-data/src/compile-data';
import { InstrumentAssignment } from './packages/blue-data/src/instruments/instrument-assignment';

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
const arr = new Arrangement();
arr.addInstrument(instrument, "1");

const compileData = new CompileData();

console.log("--- INITIAL ---");
console.log(arr.generateOrchestra(compileData));

console.log("--- APPLY PRESET ---");
instrument.applyPreset('loud1');
console.log(arr.generateOrchestra(compileData));

