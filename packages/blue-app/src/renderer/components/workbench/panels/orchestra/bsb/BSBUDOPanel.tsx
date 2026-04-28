import React, { useCallback } from 'react';

import type {
  BlueSynthBuilderInstrumentSnapshot,
  InstrumentPatch,
  UdoDefinitionSnapshot,
} from '../../../../../../shared/project-editor';
import UdoWorkspacePanel from '../../udo/UdoWorkspacePanel';

interface BSBUDOPanelProps {
  instrument: BlueSynthBuilderInstrumentSnapshot;
  onInstrumentPatch: (patch: InstrumentPatch) => void | Promise<void>;
}

export default function BSBUDOPanel({
  instrument,
  onInstrumentPatch,
}: BSBUDOPanelProps): React.ReactElement {
  const udolist = instrument.udolist ?? [];

  const handleInsertUdos = useCallback(
    (definitions: UdoDefinitionSnapshot[], index?: number) => {
      definitions.forEach((definition, offset) => {
        void onInstrumentPatch({
          bsbInterface: {
            type: 'addUdo',
            index: index === undefined ? undefined : index + offset,
            definition,
          },
        });
      });
    },
    [onInstrumentPatch],
  );

  const handleRemoveIndices = useCallback(
    (indices: number[]) => {
      [...indices]
        .sort((left, right) => right - left)
        .forEach((index) => {
          void onInstrumentPatch({
            bsbInterface: { type: 'removeUdo', index },
          });
        });
    },
    [onInstrumentPatch],
  );

  const handleReorder = useCallback(
    (from: number, to: number) => {
      void onInstrumentPatch({
        bsbInterface: { type: 'reorderUdo', from, to },
      });
    },
    [onInstrumentPatch],
  );

  const handleUpdateUdo = useCallback(
    (index: number, patch: Partial<UdoDefinitionSnapshot>) => {
      void onInstrumentPatch({
        bsbInterface: { type: 'updateUdo', index, patch },
      });
    },
    [onInstrumentPatch],
  );

  const handleConvertStyle = useCallback(
    (index: number, style: 'CLASSIC' | 'MODERN') => {
      void onInstrumentPatch({
        bsbInterface: { type: 'convertUdoStyle', index, style },
      });
    },
    [onInstrumentPatch],
  );

  return (
    <div className="flex h-full flex-col bg-[#0a0f1a]">
      <UdoWorkspacePanel
        udos={udolist}
        resetKey={instrument.assignmentId}
        onInsertUdos={handleInsertUdos}
        onRemoveIndices={handleRemoveIndices}
        onReorder={handleReorder}
        onUpdateUdo={handleUpdateUdo}
        onConvertStyle={handleConvertStyle}
      />
    </div>
  );
}
