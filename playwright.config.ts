import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4344', channel: 'chrome', viewport: { width: 1440, height: 900 } },
  webServer: { command: 'npm run preview -- --port 4344 --ignore-lock', url: 'http://127.0.0.1:4344', reuseExistingServer: false },
});
