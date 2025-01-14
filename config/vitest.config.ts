/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react(), tsconfigPaths() as any],
  test: {
    silent: Boolean(process.env.CI),
    globals: true,
    setupFiles: ['dotenv/config', './src/__tests__/setup/vitest.setup.ts'],
    globalSetup: ['./src/__tests__/setup/vitest.global.setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx', '.github/scripts/*.test.mjs'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/__tests__/setup/'],
    },
    testTimeout: 20000,
    environmentMatchGlobs: [
      ['**/*.test.tsx', 'jsdom'],
      ['**/*.test.ts', 'node'],
    ],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, '../src'),
    },
  },
});
