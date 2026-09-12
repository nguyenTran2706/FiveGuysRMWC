import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 5000 },
  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 1000 },
    launchOptions: { executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' },
    screenshot: 'only-on-failure',
    trace: { mode: 'retain-on-failure', screenshots: false },
  },
  reporter: [['list']],
});
