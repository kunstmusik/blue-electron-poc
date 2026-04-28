import React, { useCallback } from 'react';

import type {
  ProjectUdoPatch,
  UdoDefinitionSnapshot,
} from '../../../../shared/project-editor';
import { useProjectStore } from '../../../stores/project-store';
import UdoWorkspacePanel from './udo/UdoWorkspacePanel';

export default function UserDefinedOpcodePanel(): React.ReactElement {
  const projectUdos = useProjectStore((state) => state.projectUdos);
  const loaded = useProjectStore((state) => state.loaded);
  const filePath = useProjectStore((state) => state.filePath);
  const applyProjectUdoPatch = useProjectStore((state) => state.applyProjectUdoPatch);

  const dispatch = useCallback(
    (patch: ProjectUdoPatch) => {
      void applyProjectUdoPatch(patch);
    },
    [applyProjectUdoPatch],
  );

  const handleInsertUdos = useCallback(
    (definitions: UdoDefinitionSnapshot[], index?: number) => {
      definitions.forEach((definition, offset) => {
        dispatch({
          type: 'add',
          index: index === undefined ? undefined : index + offset,
          definition,
        });
      });
    },
    [dispatch],
  );

  const handleRemoveIndices = useCallback(
    (indices: number[]) => {
      [...indices]
        .sort((left, right) => right - left)
        .forEach((index) => {
          dispatch({ type: 'remove', index });
        });
    },
    [dispatch],
  );

  const handleReorder = useCallback(
    (from: number, to: number) => {
      dispatch({ type: 'reorder', from, to });
    },
    [dispatch],
  );

  const handleUpdateUdo = useCallback(
    (index: number, patch: Partial<UdoDefinitionSnapshot>) => {
      dispatch({ type: 'update', index, patch });
    },
    [dispatch],
  );

  const handleConvertStyle = useCallback(
    (index: number, style: 'CLASSIC' | 'MODERN') => {
      dispatch({ type: 'convertStyle', index, style });
    },
    [dispatch],
  );

  if (!loaded) {
    return (
      <div className="workbench-panel-shell">
        <div className="workbench-panel-shell__content">
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No project loaded
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workbench-panel-shell">
      <div className="workbench-panel-shell__content flex h-full min-h-0 flex-col">
        <UdoWorkspacePanel
          udos={projectUdos}
          resetKey={filePath ?? 'project-udo'}
          onInsertUdos={handleInsertUdos}
          onRemoveIndices={handleRemoveIndices}
          onReorder={handleReorder}
          onUpdateUdo={handleUpdateUdo}
          onConvertStyle={handleConvertStyle}
        />
      </div>
    </div>
  );
}
