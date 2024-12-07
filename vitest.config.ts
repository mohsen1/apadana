/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    // In future we can launch multiple test containers in parallel
    // (each with their own specific port)
    // and assign different databases URL to each parallel runner
    // but for now we need to run tests sequentially
    maxConcurrency: 1,
    environment: 'jsdom',
    globalSetup: './src/__tests__/setup/vitest.global.setup.ts',
    setupFiles: ['./src/__tests__/setup/vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    env: {
      VERCEL_URL: 'localhost:3000',
      NODE_ENV: 'test',
      NEXT_PUBLIC_TEST_ENV: 'unit',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/app/api/**',
        'src/types/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/constants/**',
        'src/middleware.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
