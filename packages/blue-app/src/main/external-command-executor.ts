import type { ExternalCommandExecutor } from '@blue/data';
import { executeExternalTestSync } from './external-executor';

function getCurrentProjectDir(): string | null {
  return null;
}

export function createMainExternalExecutor(getProjectDir: () => string | null): ExternalCommandExecutor {
  return {
    execute(commandLine: string, textBody: string, _projectDir: string | null): string {
      const projectDir = getProjectDir();
      const result = executeExternalTestSync({ commandLine, text: textBody, projectDir });
      if (!result.ok) {
        throw new Error(result.error ?? 'External command failed');
      }
      return result.output;
    },
  };
}
