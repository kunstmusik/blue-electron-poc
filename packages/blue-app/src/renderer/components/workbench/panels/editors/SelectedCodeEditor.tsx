import React, { useEffect, useRef } from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { EditorState, type Extension } from '@codemirror/state';
import { placeholder as editorPlaceholder } from '@codemirror/view';

import { createCsoundEditorExtensions, SELECTED_CSOUND_EDITOR } from './csound-editor-language';
import type { DynamicCsoundCompletionProvider, SelectedCodeEditorProps } from './editor-adapter-types';

const EMPTY_DYNAMIC_COMPLETION_PROVIDERS: DynamicCsoundCompletionProvider[] = [];

const blueCodeMirrorTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      color: '#dbe7ff',
      backgroundColor: '#0d1524',
      fontSize: '13px',
    },
    '.cm-scroller': {
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    },
    '.cm-content': {
      caretColor: '#e94560',
      padding: '14px 16px',
    },
    '.cm-gutters': {
      backgroundColor: '#111c31',
      color: '#73819e',
      borderRight: '1px solid #0f3460',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(233, 69, 96, 0.08)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(233, 69, 96, 0.12)',
      color: '#dbe7ff',
    },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
      backgroundColor: 'rgba(93, 135, 210, 0.38)',
    },
    '&.cm-focused': {
      outline: '1px solid rgba(233, 69, 96, 0.78)',
    },
    '.cm-tooltip': {
      border: '1px solid #405174',
      backgroundColor: '#17233f',
      color: '#edf3ff',
    },
    '.cm-tooltip-autocomplete ul li[aria-selected]': {
      backgroundColor: '#304872',
      color: '#ffffff',
    },
  },
  { dark: true },
);

export default function SelectedCodeEditor({
  value,
  placeholder,
  ariaLabel,
  readOnly = false,
  dynamicCompletionProviders = EMPTY_DYNAMIC_COMPLETION_PROVIDERS,
  onChange,
}: SelectedCodeEditorProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);
  const syncingFromPropsRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const extensions: Extension[] = [
      basicSetup,
      blueCodeMirrorTheme,
      EditorView.lineWrapping,
      editorPlaceholder(placeholder ?? ''),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged || syncingFromPropsRef.current) {
          return;
        }

        void onChangeRef.current(update.state.doc.toString());
      }),
      ...createCsoundEditorExtensions(dynamicCompletionProviders),
    ];

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true), EditorView.editable.of(false));
    }

    const view = new EditorView({
      doc: initialValueRef.current,
      extensions,
      parent: container,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      if (viewRef.current === view) {
        viewRef.current = null;
      }
    };
  }, [dynamicCompletionProviders, readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      return;
    }

    const currentValue = view.state.doc.toString();
    if (currentValue === value) {
      return;
    }

    try {
      syncingFromPropsRef.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
    } finally {
      syncingFromPropsRef.current = false;
    }
  }, [value]);

  return (
    <div
      className="selected-code-editor selected-code-editor--codemirror"
      data-editor-kind={SELECTED_CSOUND_EDITOR.kind}
      data-editor-language={SELECTED_CSOUND_EDITOR.languageId}
      aria-label={ariaLabel}
    >
      <div ref={containerRef} className="selected-code-editor__mount" />
      <pre className="selected-code-editor__ssr-preview" aria-hidden="true">
        {value || placeholder}
      </pre>
    </div>
  );
}
