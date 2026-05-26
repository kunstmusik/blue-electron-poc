import {
  BlueData,
  CompileData,
  JavaScriptObject,
  setJavaScriptSession,
  type JavaScriptSession,
  type NoteList,
  type TimeContext,
} from '@blue/data';
import {
  resolveEditorTarget,
  type ScoreObjectEditorRequest,
  type ScoreObjectTestResult,
} from '../shared/project-editor';

interface GenerateForCsdObject {
  generateForCSD(
    context: TimeContext,
    compileData: CompileData,
    startTime: number,
    endTime: number,
  ): NoteList;
}

export interface ScoreObjectTestOptions {
  ensureJavaScriptEngine?: () => Promise<void>;
  javaScriptSession?: JavaScriptSession | null;
}

function canGenerateForCSD(value: unknown): value is GenerateForCsdObject {
  return typeof (value as { generateForCSD?: unknown } | null)?.generateForCSD === 'function';
}

export async function testScoreObject(
  data: BlueData | null,
  request: ScoreObjectEditorRequest,
  options: ScoreObjectTestOptions = {},
): Promise<ScoreObjectTestResult> {
  if (!data) {
    return { ok: false, output: '', error: 'No project loaded.' };
  }

  const resolved = resolveEditorTarget(data, request.target);
  if (!resolved) {
    return { ok: false, output: '', error: 'Selected object not found.' };
  }

  const { sObj } = resolved;
  if (!canGenerateForCSD(sObj)) {
    return { ok: false, output: '', error: 'Selected object cannot generate score.' };
  }

  if (sObj instanceof JavaScriptObject) {
    await options.ensureJavaScriptEngine?.();
  }

  try {
    const compileData = CompileData.createEmptyCompileData();
    if (sObj instanceof JavaScriptObject && options.javaScriptSession) {
      setJavaScriptSession(compileData, options.javaScriptSession);
    }

    const noteList = sObj.generateForCSD(
      data.getScore().getTimeContext(),
      compileData,
      0.0,
      -1.0,
    );

    return { ok: true, output: noteList.toScoreText() };
  } catch (err) {
    return { ok: false, output: '', error: err instanceof Error ? err.message : String(err) };
  }
}
