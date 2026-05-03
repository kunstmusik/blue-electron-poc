import { describe, expect, it, vi } from 'vitest';

import { saveGeneratedCsdToDisk } from './csd-export';

describe('saveGeneratedCsdToDisk', () => {
  it('calls toDiskCSD and writes the selected CSD file', async () => {
    const toDiskCSD = vi.fn(() => 'disk-csd');
    const send = vi.fn();
    const showSaveDialog = vi.fn(async () => ({
      canceled: false,
      filePath: '/tmp/project',
    }));
    const writeFile = vi.fn(async () => undefined);

    const filePath = await saveGeneratedCsdToDisk({
      currentData: { toDiskCSD },
      currentFilePath: '/Users/stevenyi/work/blue-electron/project.blue',
      mainWindow: { webContents: { send } } as any,
      dialogApi: { showSaveDialog } as any,
      writeFile: writeFile as any,
    });

    expect(toDiskCSD).toHaveBeenCalledTimes(1);
    expect(showSaveDialog).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith('/tmp/project.csd', 'disk-csd', 'utf-8');
    expect(send).toHaveBeenCalledWith('save-complete', {
      filePath: '/tmp/project.csd',
    });
    expect(filePath).toBe('/tmp/project.csd');
  });
});
