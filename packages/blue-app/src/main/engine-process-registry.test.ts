import { describe, expect, it } from 'vitest';
import {
  getEngineProcessManifestPath,
  matchesTrackedEngineCommandLine,
  planEngineProcessSweep,
  type EngineProcessManifest,
} from './engine-process-registry';

function createManifest(): EngineProcessManifest {
  return {
    version: 1,
    kind: 'realtime',
    pid: 4321,
    ownerPid: 1234,
    enginePath: '/opt/homebrew/bin/blue-engine',
    spawnArgs: ['--port', '5555', '--pub-port', '5556', '--shm', 'blue-engine-123'],
    controlEndpoint: 'tcp://localhost:5555',
    pubEndpoint: 'tcp://localhost:5556',
    shmName: 'blue-engine-123',
    startedAt: 1700000000000,
  };
}

describe('engine-process-registry', () => {
  it('builds a registry path under the temp directory', () => {
    const manifest = createManifest();
    const filePath = getEngineProcessManifestPath(manifest);

    expect(filePath).toContain('blue-electron');
    expect(filePath).toContain('engine-processes');
    expect(filePath).toContain('blue-engine-realtime-1234-4321-1700000000000.json');
  });

  it('matches a tracked engine command line', () => {
    const manifest = createManifest();
    const commandLine = '/opt/homebrew/bin/blue-engine --port 5555 --pub-port 5556 --shm blue-engine-123';

    expect(matchesTrackedEngineCommandLine(commandLine, manifest)).toBe(true);
  });

  it('plans to keep engines whose owner is still alive', () => {
    const manifest = createManifest();
    const plan = planEngineProcessSweep(manifest, {
      ownerAlive: true,
      engineAlive: true,
      commandLine: '/opt/homebrew/bin/blue-engine --port 5555 --pub-port 5556 --shm blue-engine-123',
    });

    expect(plan.action).toBe('keep');
  });

  it('plans to terminate an orphaned tracked engine', () => {
    const manifest = createManifest();
    const plan = planEngineProcessSweep(manifest, {
      ownerAlive: false,
      engineAlive: true,
      commandLine: '/opt/homebrew/bin/blue-engine --port 5555 --pub-port 5556 --shm blue-engine-123',
    });

    expect(plan.action).toBe('terminate');
  });

  it('removes manifests whose process no longer matches', () => {
    const manifest = createManifest();
    const plan = planEngineProcessSweep(manifest, {
      ownerAlive: false,
      engineAlive: true,
      commandLine: '/usr/bin/other-process --flag',
    });

    expect(plan.action).toBe('remove');
  });
});
