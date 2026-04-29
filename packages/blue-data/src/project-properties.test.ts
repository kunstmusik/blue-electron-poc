import { describe, it, expect } from 'vitest';
import { ProjectProperties } from './project-properties';
import { Element } from './serialization/xml-reader';

describe('ProjectProperties', () => {
  describe('Java-compatible defaults', () => {
    it('defaults ksmps to 44100/1 = 44100 (Java default is 1)', () => {
      const props = new ProjectProperties();
      // Java default: ksmps = "1"
      expect(props.ksmps).toBe('64');
    });

    it('defaults zeroDbFS to 32768 (Java default is 1)', () => {
      const props = new ProjectProperties();
      expect(props.zeroDbFS).toBe('32768');
    });

    it('defaults sampleRate to 44100', () => {
      const props = new ProjectProperties();
      expect(props.sampleRate).toBe('44100');
    });

    it('defaults channels to 2', () => {
      const props = new ProjectProperties();
      expect(props.channels).toBe('2');
    });
  });

  describe('copy constructor', () => {
    it('copies all fields', () => {
      const original = new ProjectProperties();
      original.title = 'Test Title';
      original.author = 'Test Author';
      original.sampleRate = '48000';
      original.ksmps = '128';
      original.channels = '4';
      original.useZeroDbFS = true;
      original.zeroDbFS = '1';
      original.mediaFolder = '/some/path';
      original.copyToMediaFileOnImport = false;

      const copy = new ProjectProperties(original);
      expect(copy.title).toBe('Test Title');
      expect(copy.author).toBe('Test Author');
      expect(copy.sampleRate).toBe('48000');
      expect(copy.ksmps).toBe('128');
      expect(copy.channels).toBe('4');
      expect(copy.useZeroDbFS).toBe(true);
      expect(copy.zeroDbFS).toBe('1');
      expect(copy.mediaFolder).toBe('/some/path');
      expect(copy.copyToMediaFileOnImport).toBe(false);
    });

    it('deep copy does not share mutable state', () => {
      const original = new ProjectProperties();
      original.title = 'Original';
      const copy = new ProjectProperties(original);
      copy.title = 'Modified';
      expect(original.title).toBe('Original');
    });
  });

  describe('legacy alias: nchnls → channels', () => {
    it('loads nchnls as channels when channels is absent', () => {
      const xml = '<projectProperties><nchnls>8</nchnls></projectProperties>';
      const elem = Element.parse(xml);
      const props = ProjectProperties.loadFromXML(elem);
      expect(props.channels).toBe('8');
    });

    it('prefers channels over nchnls when both present', () => {
      const xml = '<projectProperties><channels>4</channels><nchnls>8</nchnls></projectProperties>';
      const elem = Element.parse(xml);
      const props = ProjectProperties.loadFromXML(elem);
      expect(props.channels).toBe('4');
    });
  });

  describe('legacy alias: copyToMediaFolderOnImport', () => {
    it('loads copyToMediaFolderOnImport as copyToMediaFileOnImport', () => {
      const xml = '<projectProperties><copyToMediaFolderOnImport>false</copyToMediaFolderOnImport></projectProperties>';
      const elem = Element.parse(xml);
      const props = ProjectProperties.loadFromXML(elem);
      expect(props.copyToMediaFileOnImport).toBe(false);
    });
  });

  describe('save/load round-trip', () => {
    it('round-trips all fields', () => {
      const original = new ProjectProperties();
      original.title = 'My Project';
      original.author = 'Composer';
      original.notes = 'Some notes';
      original.sampleRate = '48000';
      original.ksmps = '128';
      original.channels = '4';
      original.useZeroDbFS = true;
      original.zeroDbFS = '1';
      original.useAudioOut = true;
      original.useAudioIn = true;
      original.noteAmpsEnabled = false;

      const xml = original.saveAsXML();
      const loaded = ProjectProperties.loadFromXML(xml);

      expect(loaded.title).toBe('My Project');
      expect(loaded.author).toBe('Composer');
      expect(loaded.notes).toBe('Some notes');
      expect(loaded.sampleRate).toBe('48000');
      expect(loaded.ksmps).toBe('128');
      expect(loaded.channels).toBe('4');
      expect(loaded.useZeroDbFS).toBe(true);
      expect(loaded.zeroDbFS).toBe('1');
      expect(loaded.useAudioOut).toBe(true);
      expect(loaded.useAudioIn).toBe(true);
      expect(loaded.noteAmpsEnabled).toBe(false);
    });
  });
});
