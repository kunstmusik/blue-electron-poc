import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { ArrangementRowSnapshot } from '../../../../../../shared/project-editor';

const columnHelper = createColumnHelper<ArrangementRowSnapshot>();

export interface ArrangementColumnActions {
  onToggleEnabled: (row: ArrangementRowSnapshot) => void;
  onCommitAssignmentId: (row: ArrangementRowSnapshot, assignmentId: string) => void;
}

export function createArrangementColumns({
  onToggleEnabled,
  onCommitAssignmentId,
}: ArrangementColumnActions) {
  return [
    columnHelper.accessor('enabled', {
      header: 'Use',
      cell: (info) => (
        <input
          aria-label={info.getValue() ? 'Disable assignment' : 'Enable assignment'}
          checked={info.getValue()}
          type="checkbox"
          onChange={() => onToggleEnabled(info.row.original)}
          onClick={(event) => event.stopPropagation()}
        />
      ),
    }),
    columnHelper.accessor('assignmentId', {
      header: 'ID',
      cell: (info) => (
        <input
          className="w-full rounded border border-blue-border bg-[#0d1524] px-1 py-0.5 font-mono text-xs text-gray-100 outline-none focus:border-blue-accent"
          defaultValue={info.getValue()}
          aria-label="Instrument ID"
          onClick={(event) => event.stopPropagation()}
          onBlur={(event) =>
            onCommitAssignmentId(info.row.original, event.currentTarget.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
        />
      ),
    }),
    columnHelper.accessor('instrumentName', {
      header: 'Instrument',
      cell: (info) => info.getValue() || '(unnamed)',
    }),
    columnHelper.accessor('instrumentType', {
      header: 'Type',
      cell: (info) => info.getValue(),
    }),
  ];
}
