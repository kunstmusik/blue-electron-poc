import React, { createContext, useContext } from 'react';
import type { BsbInterfacePatch } from '../../../../../../shared/project-editor';
import type { BSBWidgetResizeMeta } from '../bsb-widget-meta';

export interface ResizeContextValue {
  gridSnapEnabled?: boolean;
  gridSnapWidth?: number;
  gridSnapHeight?: number;
  getResizeMeta: (type: string) => BSBWidgetResizeMeta | undefined;
  onBsbInterfacePatch: (patch: BsbInterfacePatch) => void;
}

const ResizeContext = createContext<ResizeContextValue | null>(null);

export function ResizeProvider({ value, children }: { value: ResizeContextValue; children: React.ReactNode }) {
  return <ResizeContext.Provider value={value}>{children}</ResizeContext.Provider>;
}

export function useResizeContext(): ResizeContextValue | null {
  return useContext(ResizeContext);
}
