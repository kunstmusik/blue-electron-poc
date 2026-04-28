import { autocompletion } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import { csound } from '@kunstmusik/codemirror-lang-csound';

import { createDynamicCsoundCompletionSource } from './csound-completions';
import { createJavaBlueCsoundCompletionSource } from './csound-java-blue-completions';
import type {
  DynamicCsoundCompletionProvider,
  JavaBlueCsoundCompletionOptions,
  SelectedEditorMetadata,
} from './editor-adapter-types';

export const SELECTED_CSOUND_EDITOR: SelectedEditorMetadata = {
  kind: 'codemirror',
  languageId: 'csound-orc',
  mode: 'orc',
};

export function getSelectedEditorMetadata(
  mode: 'orc' | 'sco' | 'csd' | 'text',
): SelectedEditorMetadata {
  return {
    kind: 'codemirror',
    languageId:
      mode === 'text'
        ? 'plain-text'
        : mode === 'sco'
          ? 'csound-sco'
          : mode === 'csd'
            ? 'csound-csd'
            : 'csound-orc',
    mode,
  };
}

export function createCsoundEditorExtensions(
  dynamicCompletionProviders: DynamicCsoundCompletionProvider[] = [],
  javaBlueCompletionOptions: JavaBlueCsoundCompletionOptions = {},
  mode: 'orc' | 'sco' | 'csd' | 'text' = 'orc',
): Extension[] {
  const extensions: Extension[] = [];
  if (mode !== 'text') {
    extensions.push(csound({ mode }));
  }
  const completionSources = [createJavaBlueCsoundCompletionSource(javaBlueCompletionOptions)];

  if (mode !== 'text' && dynamicCompletionProviders.length > 0) {
    completionSources.push(createDynamicCsoundCompletionSource(dynamicCompletionProviders));
  }

  if (mode !== 'text') {
    extensions.push(
      autocompletion({
        override: completionSources,
      }),
    );
  }

  return extensions;
}
