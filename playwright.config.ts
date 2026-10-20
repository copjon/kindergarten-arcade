import { defineConfig, devices } from '@playwright/test';

// BASE_URL points the suite at a deployed site (CI runs it against GitHub Pages
// right after each deploy). Without it, tests run against a local production build.
const deployedUrl = process.env.BASE_URL;
const localUrl = 'http://localhost:4173/kindergarten-arcade/';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: deployedUrl ?? localUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: deployedUrl
    ? undefined
    : {
        command: 'npx vite build && npx vite preview --port 4173 --strictPort',
        url: localUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
