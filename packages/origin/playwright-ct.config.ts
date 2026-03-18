import { defineConfig, devices } from '@playwright/experimental-ct-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './src/components',
  testMatch: '**/*.test.tsx',
  testIgnore: ['**/*.unit.test.tsx'],
  snapshotDir: './__snapshots__',
  timeout: 10000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    ctPort: 3100,
    trace: 'on-first-retry',
    ctViteConfig: {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            api: 'modern-compiler',
            // Mirror next.config.js sassOptions.includePaths
            loadPaths: [path.resolve(__dirname, './src/tokens')],
          },
        },
      },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

