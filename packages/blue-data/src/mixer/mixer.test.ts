import { describe, it, expect } from 'vitest';
import { Mixer } from './mixer';
import { Element } from '../serialization/xml-reader';

describe('Mixer', () => {
  describe('default state', () => {
    it('is enabled by default', () => {
      const mixer = new Mixer();
      expect(mixer.isEnabled()).toBe(true);
    });

    it('has master channel named Master', () => {
      const mixer = new Mixer();
      expect(mixer.getMaster().getName()).toBe('Master');
    });
  });

  describe('Java-format enabled child element', () => {
    it('loads <enabled>false</enabled> child element (Java format)', () => {
      const xml = '<mixer><enabled>false</enabled></mixer>';
      const mixer = Mixer.loadFromXML(Element.parse(xml));
      expect(mixer.isEnabled()).toBe(false);
    });

    it('loads <enabled>true</enabled> child element (Java format)', () => {
      const xml = '<mixer><enabled>true</enabled></mixer>';
      const mixer = Mixer.loadFromXML(Element.parse(xml));
      expect(mixer.isEnabled()).toBe(true);
    });

    it('loading an empty mixer element keeps it enabled', () => {
      const xml = '<mixer></mixer>';
      const mixer = Mixer.loadFromXML(Element.parse(xml));
      expect(mixer.isEnabled()).toBe(true);
    });
  });

  describe('saveAsXML writes Java-format output', () => {
    it('writes enabled as child element, not attribute', () => {
      const mixer = new Mixer();
      mixer.setEnabled(true);
      const xml = mixer.saveAsXML().toXml();
      expect(xml).toContain('<enabled>true</enabled>');
      expect(xml).not.toMatch(/enabled="true"/);
    });

    it('writes enabled=false as child element', () => {
      const mixer = new Mixer();
      mixer.setEnabled(false);
      const xml = mixer.saveAsXML().toXml();
      expect(xml).toContain('<enabled>false</enabled>');
      expect(xml).not.toMatch(/enabled="false"/);
    });
  });

  describe('save/load round-trip', () => {
    it('preserves enabled state', () => {
      const mixer = new Mixer();
      mixer.setEnabled(false);
      const xml = mixer.saveAsXML();
      const loaded = Mixer.loadFromXML(xml);
      expect(loaded.isEnabled()).toBe(false);
    });

    it('round-trips through Java-format XML', () => {
      const javaXml = '<mixer><enabled>false</enabled><extraRenderTime>0</extraRenderTime></mixer>';
      const loaded = Mixer.loadFromXML(Element.parse(javaXml));
      expect(loaded.isEnabled()).toBe(false);
      const saved = loaded.saveAsXML().toXml();
      expect(saved).toContain('<enabled>false</enabled>');
    });

    it('loads source channels from Java channelListGroups without losing them to empty flat lists', () => {
      const javaXml = [
        '<mixer>',
        '  <enabled>true</enabled>',
        '  <channelListGroups>',
        '    <channelList association="group-1" listName="Audio Layer Group">',
        '      <channel association="layer-1">',
        '        <name>Channel</name>',
        '        <outChannel>Master</outChannel>',
        '        <level>0.0</level>',
        '        <muted>false</muted>',
        '        <solo>false</solo>',
        '        <effectsChain bin="pre"/>',
        '        <effectsChain bin="post"/>',
        '      </channel>',
        '    </channelList>',
        '  </channelListGroups>',
        '  <channelList listName="Orchestra" list="channels"/>',
        '  <channelList listName="SubChannels" list="subChannels"/>',
        '  <channel>',
        '    <name>Master</name>',
        '    <outChannel>Master</outChannel>',
        '    <level>0.0</level>',
        '    <muted>false</muted>',
        '    <solo>false</solo>',
        '    <effectsChain bin="pre"/>',
        '    <effectsChain bin="post"/>',
        '  </channel>',
        '</mixer>',
      ].join('\n');

      const loaded = Mixer.loadFromXML(Element.parse(javaXml));

      expect(loaded.getChannels()).toHaveLength(1);
      expect(loaded.getChannels()[0]?.getAssociation()).toBe('layer-1');
      expect(loaded.getChannels()[0]?.getOutChannel()).toBe('Master');
    });
  });

  describe('deepCopy', () => {
    it('creates independent copy', () => {
      const original = new Mixer();
      const copy = original.deepCopy() as Mixer;
      expect(copy).not.toBe(original);
      expect(copy.isEnabled()).toBe(original.isEnabled());
    });

    it('mutation does not leak', () => {
      const original = new Mixer();
      original.setEnabled(true);
      const copy = original.deepCopy() as Mixer;
      copy.setEnabled(false);
      expect(original.isEnabled()).toBe(true);
    });
  });
});
