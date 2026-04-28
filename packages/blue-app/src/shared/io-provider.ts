export type OutputType = 'output' | 'error';

export interface OutputLine {
  id: number;
  text: string;
  type: 'stdout' | 'stderr';
}

export interface OutputTab {
  id: string;
  name: string;
  lines: OutputLine[];
  lineCounter: number;
  colorOverrides: Partial<Record<OutputType, string>>;
  isClosed: boolean;
  pendingText: string;
}

export interface OutputWriter {
  write(text: string): void;
  println(text: string): void;
  reset(): void;
}

export interface InputOutput {
  readonly name: string;
  readonly out: OutputWriter;
  readonly err: OutputWriter;
  select(): void;
  close(): void;
  setColor(type: OutputType, color: string): void;
}

export interface IOProvider {
  getIO(name: string, newIO?: boolean): InputOutput;
}

export interface EngineOutputPayload {
  tabName: string;
  text: string;
  type: 'stdout' | 'stderr';
}
