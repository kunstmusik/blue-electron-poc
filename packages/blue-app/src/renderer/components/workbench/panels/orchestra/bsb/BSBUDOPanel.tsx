import React, { useState, useCallback, useEffect } from 'react';
import type {
  BlueSynthBuilderInstrumentSnapshot,
  InstrumentPatch,
  UdoDefinitionSnapshot,
} from '../../../../../../shared/project-editor';
import SplitPane from '../SplitPane';
import UDOTable from './UDOTable';
import UDOEditor from './UDOEditor';

interface BSBUDOPanelProps {
  instrument: BlueSynthBuilderInstrumentSnapshot;
  onInstrumentPatch: (patch: InstrumentPatch) => void | Promise<void>;
}

export default function BSBUDOPanel({
  instrument,
  onInstrumentPatch,
}: BSBUDOPanelProps): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [clipboard, setClipboard] = useState<UdoDefinitionSnapshot | null>(null);

  const udolist = instrument.udolist ?? [];

  const handleSelectIndex = useCallback((index: number | null) => {
    setSelectedIndex(index);
  }, []);

  useEffect(() => {
    setSelectedIndex(null);
  }, [instrument]);

  const handleAddUdo = useCallback(() => {
    void onInstrumentPatch({
      bsbInterface: { type: 'addUdo' },
    });
  }, [onInstrumentPatch]);

  const handleImportUdo = useCallback(() => {
    alert('Import UDO functionality - to be implemented');
  }, []);

  const handleRemoveUdo = useCallback(
    (index: number) => {
      void onInstrumentPatch({
        bsbInterface: { type: 'removeUdo', index },
      });
    },
    [onInstrumentPatch],
  );

  const handleCopyUdo = useCallback(
    (index: number) => {
      if (udolist[index]) {
        setClipboard(udolist[index]);
      }
    },
    [udolist],
  );

  const handleCutUdo = useCallback(
    (index: number) => {
      if (udolist[index]) {
        setClipboard(udolist[index]);
        void onInstrumentPatch({
          bsbInterface: { type: 'removeUdo', index },
        });
      }
    },
    [udolist, onInstrumentPatch],
  );

  const handlePasteUdo = useCallback(() => {
    if (clipboard) {
      void onInstrumentPatch({
        bsbInterface: { type: 'addUdo', definition: clipboard },
      });
    }
  }, [clipboard, onInstrumentPatch]);

  const handleExportUdo = useCallback(
    (index: number) => {
      const udo = udolist[index];
      if (udo) {
        alert(`Export UDO: ${udo.name}\n\nExport functionality - to be implemented`);
      }
    },
    [udolist],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      void onInstrumentPatch({
        bsbInterface: { type: 'reorderUdo', from: index, to: index - 1 },
      });
    },
    [onInstrumentPatch],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      void onInstrumentPatch({
        bsbInterface: { type: 'reorderUdo', from: index, to: index + 1 },
      });
    },
    [onInstrumentPatch],
  );

  const handleUpdateUdo = useCallback(
    (patch: Partial<UdoDefinitionSnapshot>) => {
      if (selectedIndex !== null) {
        void onInstrumentPatch({
          bsbInterface: { type: 'updateUdo', index: selectedIndex, patch },
        });
      }
    },
    [selectedIndex, onInstrumentPatch],
  );

  const handleTestOpcode = useCallback(() => {
    const selectedUdo = selectedIndex !== null ? udolist[selectedIndex] : null;
    if (selectedUdo) {
      alert(`Test Opcode: ${selectedUdo.name}\n\nGenerated code preview:\nopcode ${selectedUdo.name}...`);
    }
  }, [selectedIndex, udolist]);

  const selectedUdo = selectedIndex !== null ? udolist[selectedIndex] : null;

  return (
    <div className="flex h-full flex-col bg-[#0a0f1a]">
      <SplitPane
        orientation="vertical"
        initialSplit={0.4}
        minFirstSize={200}
        minSecondSize={300}
        ariaLabel="UDO panel split"
        first={
          <UDOTable
            udolist={udolist}
            selectedIndex={selectedIndex}
            onSelectIndex={handleSelectIndex}
            onAddUdo={handleAddUdo}
            onImportUdo={handleImportUdo}
            onRemoveUdo={handleRemoveUdo}
            onCopyUdo={handleCopyUdo}
            onCutUdo={handleCutUdo}
            onPasteUdo={handlePasteUdo}
            onExportUdo={handleExportUdo}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            hasClipboard={clipboard !== null}
          />
        }
        second={
          <UDOEditor
            udo={selectedUdo}
            onUpdateUdo={handleUpdateUdo}
            onTestOpcode={handleTestOpcode}
          />
        }
      />
    </div>
  );
}
