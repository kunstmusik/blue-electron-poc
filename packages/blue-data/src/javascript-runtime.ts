import { getQuickJS, getQuickJSSync } from 'quickjs-emscripten';
import type { QuickJSContext } from 'quickjs-emscripten';
import { CompileData } from './compile-data';

const JAVASCRIPT_COMPILE_STATE_KEY = '__blue_javascript_runtime_context__';
const JAVASCRIPT_RUNTIME_INIT_MESSAGE =
  'QuickJS is not initialized. Await initializeJavaScriptRuntime() before generating score from JavaScriptObject.';

type JavaScriptCompileState = {
  context: QuickJSContext;
};

function getStoredCompileState(
  compileData: CompileData,
): JavaScriptCompileState | undefined {
  const state = compileData.getCompilationVariable(
    JAVASCRIPT_COMPILE_STATE_KEY,
  );

  if (
    state &&
    typeof state === 'object' &&
    'context' in state &&
    state.context !== null &&
    typeof state.context === 'object'
  ) {
    return state as JavaScriptCompileState;
  }

  return undefined;
}

export async function initializeJavaScriptRuntime(): Promise<void> {
  await getQuickJS();
}

export function isJavaScriptRuntimeInitialized(): boolean {
  try {
    getQuickJSSync();
    return true;
  } catch {
    return false;
  }
}

export function getJavaScriptCompileContext(
  compileData: CompileData,
): QuickJSContext {
  const existing = getStoredCompileState(compileData);
  if (existing) {
    return existing.context;
  }

  let quickJS;
  try {
    quickJS = getQuickJSSync();
  } catch {
    throw new Error(JAVASCRIPT_RUNTIME_INIT_MESSAGE);
  }

  const state: JavaScriptCompileState = {
    context: quickJS.newContext(),
  };
  compileData.setCompilationVariable(JAVASCRIPT_COMPILE_STATE_KEY, state);
  return state.context;
}

export function disposeJavaScriptCompileState(compileData: CompileData): void {
  const existing = getStoredCompileState(compileData);
  if (!existing) {
    return;
  }

  compileData.clearCompilationVariable(JAVASCRIPT_COMPILE_STATE_KEY);
  existing.context.dispose();
}