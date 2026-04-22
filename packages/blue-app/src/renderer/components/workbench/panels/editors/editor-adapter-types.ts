import type { Completion } from '@codemirror/autocomplete';

export type SelectedEditorKind = 'codemirror';

export type CsoundDocumentMode = 'orc';

export interface CsoundCompletionContext {
  text: string;
  position: number;
  explicit: boolean;
}

export type DynamicCsoundCompletionProvider = (
  context: CsoundCompletionContext,
) => Completion[] | Promise<Completion[]>;

export interface SelectedCodeEditorProps {
  value: string;
  placeholder?: string;
  ariaLabel: string;
  readOnly?: boolean;
  dynamicCompletionProviders?: DynamicCsoundCompletionProvider[];
  onChange: (value: string) => void | Promise<void>;
}

export interface SelectedEditorMetadata {
  kind: SelectedEditorKind;
  languageId: string;
  mode: CsoundDocumentMode;
}
