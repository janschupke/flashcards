import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

/**
 * Browser accessibility tests.
 *
 * jsdom has no layout, so the Vitest axe tests cannot judge colour contrast or
 * any hover/focus state. These run axe against the built bundle in Chromium.
 */
export default defineConfig({
  testDir: 'e2e',
  // One browser at a time: a default pool opens a Chromium per core next to
  // the preview server, and is slower for it.
  workers: 1,
  fullyParallel: false,
  forbidOnly: process.env['CI'] !== undefined,
  retries: 0,
  reporter: process.env['CI'] !== undefined ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Triggers the prefers-reduced-motion rule in index.css, which cuts
    // transitions to 0.01ms, so a hover style is fully applied when read.
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      // Hover and Tab-order probes need a pointer and a keyboard.
      testIgnore: /interaction-states/,
    },
  ],
  // Serves dist/, so the bundle under test is the one users get. `test:e2e`
  // builds first; a server left over from another run is never reused, since
  // it could be serving a stale build.
  webServer: {
    command: 'npm run preview',
    port: PORT,
    reuseExistingServer: false,
  },
});
