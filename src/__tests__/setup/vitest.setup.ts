import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import { clearDatabase } from './test-container';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

afterEach(async () => {
  await clearDatabase();
  vi.clearAllMocks();
});
