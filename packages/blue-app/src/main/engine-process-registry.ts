import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const execFileAsync = promisify(execFile);

export type EngineSessionKind = 'realtime' | 'blue-live';

export interface EngineProcessManifest {
  version: 1;
  kind: EngineSessionKind;
  pid: number;
  ownerPid: number;
  enginePath: string;
  spawnArgs: string[];
  controlEndpoint: string;
  pubEndpoint: string;
  shmName: string;
  startedAt: number;
}

export interface EngineProcessSweepPlan {
  action: 'keep' | 'remove' | 'terminate';
  reason: string;
}

export interface EngineProcessSweepReport {
  inspected: number;
  removed: number;
  terminated: number;
  kept: number;
}

const registryDir = path.join(os.tmpdir(), 'blue-electron', 'engine-processes');

function getManifestFileName(manifest: Pick<EngineProcessManifest, 'kind' | 'ownerPid' | 'pid' | 'startedAt'>): string {
  return [
    'blue-engine',
    manifest.kind,
    String(manifest.ownerPid),
    String(manifest.pid),
    String(manifest.startedAt),
  ].join('-') + '.json';
}

export function getEngineProcessRegistryDir(): string {
  return registryDir;
}

export function getEngineProcessManifestPath(manifest: Pick<EngineProcessManifest, 'kind' | 'ownerPid' | 'pid' | 'startedAt'>): string {
  return path.join(registryDir, getManifestFileName(manifest));
}

export function matchesTrackedEngineCommandLine(
  commandLine: string,
  manifest: Pick<EngineProcessManifest, 'enginePath' | 'spawnArgs' | 'shmName'>,
): boolean {
  const normalized = commandLine.trim();
  if (!normalized) {
    return false;
  }

  const expectedParts = new Set<string>([
    manifest.enginePath,
    path.basename(manifest.enginePath),
    manifest.shmName,
    ...manifest.spawnArgs.filter((part) => part.trim().length > 0),
  ]);

  for (const part of expectedParts) {
    if (!part) {
      continue;
    }
    if (!normalized.includes(part)) {
      return false;
    }
  }

  return normalized.includes('blue-engine');
}

export function planEngineProcessSweep(
  manifest: EngineProcessManifest,
  state: {
    ownerAlive: boolean;
    engineAlive: boolean;
    commandLine: string | null;
  },
): EngineProcessSweepPlan {
  if (!state.engineAlive) {
    return { action: 'remove', reason: 'engine process already exited' };
  }

  if (state.ownerAlive) {
    return { action: 'keep', reason: 'owner process still running' };
  }

  if (state.commandLine && !matchesTrackedEngineCommandLine(state.commandLine, manifest)) {
    return { action: 'remove', reason: 'process command line no longer matches tracked engine' };
  }

  return { action: 'terminate', reason: 'stale engine with dead owner process' };
}

export async function registerEngineProcess(manifest: EngineProcessManifest): Promise<string> {
  await fs.promises.mkdir(registryDir, { recursive: true });
  const filePath = getEngineProcessManifestPath(manifest);
  const tempPath = `${filePath}.tmp`;
  await fs.promises.writeFile(tempPath, JSON.stringify(manifest, null, 2), 'utf-8');
  await fs.promises.rename(tempPath, filePath);
  return filePath;
}

export async function removeEngineProcessRecord(filePath: string | null | undefined): Promise<void> {
  if (!filePath) {
    return;
  }

  try {
    await fs.promises.unlink(filePath);
  } catch {
    // Ignore missing or already-cleaned registry files.
  }
}

export async function sweepStaleBlueEngineProcesses(): Promise<EngineProcessSweepReport> {
  const report: EngineProcessSweepReport = {
    inspected: 0,
    removed: 0,
    terminated: 0,
    kept: 0,
  };

  try {
    await fs.promises.mkdir(registryDir, { recursive: true });
  } catch {
    return report;
  }

  let entries: fs.Dirent[];
  try {
    entries = await fs.promises.readdir(registryDir, { withFileTypes: true });
  } catch {
    return report;
  }

  const seenEnginePids = new Set<number>();

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const manifestPath = path.join(registryDir, entry.name);
    if (entry.name.endsWith('.tmp')) {
      await removeEngineProcessRecord(manifestPath);
      continue;
    }

    if (!entry.name.endsWith('.json')) {
      continue;
    }

    report.inspected += 1;

    let manifest: EngineProcessManifest | null = null;
    try {
      const raw = await fs.promises.readFile(manifestPath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<EngineProcessManifest>;
      if (
        parsed.version !== 1 ||
        (parsed.kind !== 'realtime' && parsed.kind !== 'blue-live') ||
        typeof parsed.pid !== 'number' ||
        typeof parsed.ownerPid !== 'number' ||
        typeof parsed.enginePath !== 'string' ||
        !Array.isArray(parsed.spawnArgs) ||
        typeof parsed.controlEndpoint !== 'string' ||
        typeof parsed.pubEndpoint !== 'string' ||
        typeof parsed.shmName !== 'string' ||
        typeof parsed.startedAt !== 'number'
      ) {
        throw new Error('invalid manifest');
      }

      manifest = parsed as EngineProcessManifest;
    } catch {
      await removeEngineProcessRecord(manifestPath);
      report.removed += 1;
      continue;
    }

    const ownerAlive = isProcessAlive(manifest.ownerPid);
    const engineAlive = isProcessAlive(manifest.pid);
    const plan = planEngineProcessSweep(manifest, {
      ownerAlive,
      engineAlive,
      commandLine: await readProcessCommandLine(manifest.pid),
    });

    switch (plan.action) {
      case 'keep':
        report.kept += 1;
        break;
      case 'remove':
        await removeEngineProcessRecord(manifestPath);
        report.removed += 1;
        break;
      case 'terminate':
        if (!seenEnginePids.has(manifest.pid)) {
          seenEnginePids.add(manifest.pid);
          await terminateEngineProcess(manifest.pid);
        }
        await removeEngineProcessRecord(manifestPath);
        report.terminated += 1;
        break;
    }
  }

  return report;
}

function isProcessAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

async function readProcessCommandLine(pid: number): Promise<string | null> {
  if (!Number.isInteger(pid) || pid <= 0) {
    return null;
  }

  try {
    if (process.platform === 'win32') {
      const { stdout } = await execFileAsync('powershell.exe', [
        '-NoProfile',
        '-Command',
        `(Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}").CommandLine`,
      ], { windowsHide: true });

      const commandLine = stdout.trim();
      return commandLine.length > 0 ? commandLine : null;
    }

    const { stdout } = await execFileAsync('ps', ['-p', String(pid), '-o', 'command='], {
      windowsHide: true,
    });
    const commandLine = stdout.trim();
    return commandLine.length > 0 ? commandLine : null;
  } catch {
    return null;
  }
}

async function terminateEngineProcess(pid: number): Promise<void> {
  if (!isProcessAlive(pid)) {
    return;
  }

  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    return;
  }

  for (const delayMs of [100, 200, 400]) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    if (!isProcessAlive(pid)) {
      return;
    }
  }

  try {
    process.kill(pid, 'SIGKILL');
  } catch {
    return;
  }
}
