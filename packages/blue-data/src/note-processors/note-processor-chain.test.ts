import { describe, expect, it } from 'vitest';
import { Element } from '../serialization/xml-reader';
import { NoteProcessorChain } from './note-processor-chain';
import { UnsupportedProcessor } from './unsupported-processor';

describe('NoteProcessorChain', () => {
  it('treats ValueTimeMapper XML as unsupported instead of a chain processor', () => {
    const xml = Element.parse(`
      <noteProcessorChain>
        <noteProcessor type="blue.noteProcessor.ValueTimeMapper">
          <timeMap>
            <point beat="0" value="0" />
          </timeMap>
        </noteProcessor>
      </noteProcessorChain>
    `);

    const chain = NoteProcessorChain.loadFromXML(xml);

    expect(chain.getProcessors()).toHaveLength(1);
    expect(chain.getProcessors()[0]).toBeInstanceOf(UnsupportedProcessor);
    expect(chain.saveAsXML().toXml()).toBe(xml.toXml());
  });
});
