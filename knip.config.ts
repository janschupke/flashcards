import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  project: ['src/**/*.{ts,tsx}', '*.{ts,js}', '*.config.{ts,js}'],
  ignore: ['dist/**', 'node_modules/**'],
  vite: {
    entry: ['src/index.tsx'],
  },
  vitest: {
    config: 'vitest.config.ts',
  },
};

export default config;

