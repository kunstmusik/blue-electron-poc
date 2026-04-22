import { autocompletion } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import { csound } from '@kunstmusik/codemirror-lang-csound';

import { createDynamicCsoundCompletionSource } from './csound-completions';
import type { DynamicCsoundCompletionProvider, SelectedEditorMetadata } from './editor-adapter-types';

export const SELECTED_CSOUND_EDITOR: SelectedEditorMetadata = {
  kind: 'codemirror',
  languageId: 'csound-orc',
  mode: 'orc',
};

export function createCsoundEditorExtensions(
  dynamicCompletionProviders: DynamicCsoundCompletionProvider[] = [],
): Extension[] {
  const extensions: Extension[] = [csound({ mode: 'orc' })];

  if (dynamicCompletionProviders.length > 0) {
    extensions.push(
      autocompletion({
        override: [createDynamicCsoundCompletionSource(dynamicCompletionProviders)],
      }),
    );
  }

  return extensions;
}
