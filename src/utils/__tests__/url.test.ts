import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getBaseUrl } from '../url';

describe('getBaseUrl', () => {
  const originalWindow = global.window;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv } as typeof process.env;
  });

  afterEach(() => {
    // Restore window and process.env
    global.window = originalWindow;
    process.env = originalEnv;
  });

  it('should return browser URL when running in browser', () => {
    // Mock window
    // @ts-expect-error window is not defined in the global scope
    globalThis.window = {
      location: {
        protocol: 'https:',
        host: 'test.apadana.app',
      },
    } as unknown as Window;

    expect(getBaseUrl()).toBe('https://test.apadana.app');
  });

  it('should return production URL when VERCEL_ENV is production', () => {
    // Remove window to simulate server environment
    // @ts-expect-error window is not defined in the global scope
    global.window = undefined as unknown as Window;
    process.env = { ...originalEnv, VERCEL_ENV: 'production' };

    expect(getBaseUrl()).toBe('https://apadana.app');
  });

  it('should return Vercel preview URL when VERCEL_URL is set', () => {
    // @ts-expect-error window is not defined in the global scope
    global.window = undefined as unknown as Window;
    process.env = {
      ...originalEnv,
      VERCEL_ENV: 'preview',
      VERCEL_URL: 'preview-123.vercel.app',
    };

    expect(getBaseUrl()).toBe('https://preview-123.vercel.app');
  });

  it('should return dev URL as fallback', () => {
    // @ts-expect-error window is not defined in the global scope
    global.window = undefined as unknown as Window;
    process.env = { ...originalEnv };
    delete process.env.VERCEL_ENV;
    // @ts-expect-error VERCEL_URL is not defined in the global scope
    delete process.env.VERCEL_URL;

    expect(getBaseUrl()).toBe('https://dev.apadana.local');
  });
});
