import React from 'react';
import type { JSX } from 'react';
import ToolbarBlueLive from './ToolbarBlueLive';
import ToolbarDisplays from './ToolbarDisplays';
import ToolbarTransport from './ToolbarTransport';

export default function MainToolbar(): React.ReactElement {
  return (
    <header className="toolbar-shell">
      <ToolbarTransport />
      <ToolbarDisplays />
      <ToolbarBlueLive />
    </header>
  );
}
