import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test-utils/setup.ts'],
    include: ['src/**/*.unit.test.{ts,tsx}', 'test-utils/**/*.unit.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test-utils/',
        '**/*.stories.tsx',
        '**/*.test.tsx',
        '**/*.test-stories.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test-utils': path.resolve(__dirname, './test-utils'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'],
  },
});
