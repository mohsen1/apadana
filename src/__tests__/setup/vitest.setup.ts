import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

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

process.env.E2E_TESTING_SECRET = 'e2e-testing-secret-during-unit-tesr';
// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Headers([['E2E_TESTING_SECRET', process.env.E2E_TESTING_SECRET ?? '']]),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

// mock redis
vi.mock('redis');

// mock stderr
vi.mock('@/utils/logger', () => ({
  default: {
    error: vi.fn(),
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
  createLogger: vi.fn().mockReturnValue({
    error: vi.fn(),
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
});
