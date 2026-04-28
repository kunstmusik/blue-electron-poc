import { useCallback } from 'react';
import { OpcodeDefinition, parseUDOText } from '@blue/data';
import { Element } from '@blue/data';
import { toast } from 'sonner';
import { useProjectStore } from '../stores/project-store';
import type { UdoDefinitionSnapshot } from '../../shared/project-editor';
import {
  opcodeToUdoSnapshot,
  udoSnapshotToOpcode,
} from '../components/workbench/panels/udo/udo-snapshot-utils';

export function useUdoImportExport() {
  const handleImportBlueUdo = useCallback(async (): Promise<UdoDefinitionSnapshot[]> => {
    const xml = await window.blueAPI.importBlueUdo();
    if (!xml) return [];
    try {
      const root = Element.parse(xml);
      const udo = OpcodeDefinition.loadFromXML(root);
      return [opcodeToUdoSnapshot(udo)];
    } catch (e) {
      toast.error(`Failed to import Blue UDO: ${e instanceof Error ? e.message : String(e)}`);
      return [];
    }
  }, []);

  const handleImportCsoundUdo = useCallback(async (): Promise<UdoDefinitionSnapshot[]> => {
    const text = await window.blueAPI.importCsoundUdo();
    if (!text) return [];
    try {
      const parsed = parseUDOText(text);
      const opcodes = parsed.getOpcodes();
      const imported = opcodes.map((udo) => opcodeToUdoSnapshot(udo));
      if (imported.length === 0) {
        toast.info('No UDO declarations found in the file.');
      }
      return imported;
    } catch (e) {
      toast.error(`Failed to parse UDO file: ${e instanceof Error ? e.message : String(e)}`);
      return [];
    }
  }, []);

  const handleExportBlueUdo = useCallback(async (snap: UdoDefinitionSnapshot) => {
    const opcode = udoSnapshotToOpcode(snap);
    try {
      const xmlText = opcode.saveAsXML().toXml();
      await window.blueAPI.exportBlueUdo(xmlText);
    } catch (e) {
      toast.error(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const handleExportCsoundUdo = useCallback(async (snap: UdoDefinitionSnapshot) => {
    const opcode = udoSnapshotToOpcode(snap);
    try {
      const codeText = opcode.generateCode();
      await window.blueAPI.exportCsoundUdo(codeText, snap.name);
    } catch (e) {
      toast.error(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const handleTestOpcode = useCallback((snap: UdoDefinitionSnapshot) => {
    const opcode = udoSnapshotToOpcode(snap);
    useProjectStore.getState().setGeneratedCsd({
      text: opcode.generateCode(),
      title: 'User-Defined Opcode',
    });
  }, []);

  return {
    handleImportBlueUdo,
    handleImportCsoundUdo,
    handleExportBlueUdo,
    handleExportCsoundUdo,
    handleTestOpcode,
  };
}
