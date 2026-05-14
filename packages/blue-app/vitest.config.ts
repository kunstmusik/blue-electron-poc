import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    include: ['src/main/**/*.test.ts', 'src/renderer/tests/**/*.test.{ts,tsx}'],
    globals: true,
    browser: {
      enabled: true,
      api: {
        middlewareMode: true,
      },
      provider: playwright({
        launchOptions: {
          channel: 'chrome',
        },
      }),
      instances: [
        {
          browser: 'chromium',
          name: 'bsb-geometry',
          include: ['src/renderer/browser/**/*.browser.test.tsx'],
          headless: true,
          fileParallelism: false,
          viewport: { width: 1280, height: 960 },
        },
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
    },
  },
});
