import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: ['src/**/*.{ts,tsx}', 'e2e/**/*.ts', '*.{ts,js}', '*.config.{ts,js}'],
  includeEntryExports: true,
  vite: {
    entry: ['src/index.tsx'],
  },
  vitest: {
    config: 'vitest.config.ts',
  },
};

export default config;
