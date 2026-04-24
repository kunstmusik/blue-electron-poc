import React from 'react';

export default function BSBUDOPanel(): JSX.Element {
  return (
    <div className="flex h-full min-h-0 flex-col bg-blue-bg p-4">
      <div className="rounded-lg border border-blue-border bg-blue-surface/50 px-4 py-3">
        <div className="text-sm font-medium text-gray-100">UDO</div>
        <div className="mt-1 text-sm text-blue-muted">
          UDO editing is deferred in this slice. Embedded opcode-list editing remains a follow-on task.
        </div>
      </div>
    </div>
  );
}