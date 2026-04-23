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

export function createCsoundEditorExtensions(
  dynamicCompletionProviders: DynamicCsoundCompletionProvider[] = [],
  javaBlueCompletionOptions: JavaBlueCsoundCompletionOptions = {},
): Extension[] {
  const extensions: Extension[] = [csound({ mode: 'orc' })];
  const completionSources = [createJavaBlueCsoundCompletionSource(javaBlueCompletionOptions)];

  if (dynamicCompletionProviders.length > 0) {
    completionSources.push(createDynamicCsoundCompletionSource(dynamicCompletionProviders));
  }

  extensions.push(
    autocompletion({
      override: completionSources,
    }),
  );

  return extensions;
}
