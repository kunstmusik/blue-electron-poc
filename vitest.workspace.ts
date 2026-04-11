import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/blue-data/vitest.config.ts',
  'packages/blue-engine-client/vitest.config.ts',
  'packages/blue-app/vitest.config.ts',
]);
