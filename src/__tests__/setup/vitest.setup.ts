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

process.env.E2E_TESTING_SECRET = 'e2e-testing-secret-during-unit-test';
// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Headers([['E2E_TESTING_SECRET', process.env.E2E_TESTING_SECRET ?? '']]),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

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

const mockData = new Set<string>();

const mockRedisClient = {
  connect: vi.fn().mockResolvedValue(undefined),
  quit: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  ping: vi.fn().mockResolvedValue('PONG'),
  set: vi.fn().mockImplementation(async (key: string, value: string) => {
    mockData.add(`${key}:${value}`);
    return 'OK';
  }),
  get: vi.fn().mockImplementation(async (key: string) => {
    const entry = Array.from(mockData).find((item) => item.startsWith(`${key}:`));
    return entry ? entry.split(':')[1] : null;
  }),
  del: vi.fn().mockImplementation(async (key: string) => {
    const entry = Array.from(mockData).find((item) => item.startsWith(`${key}:`));
    if (entry) {
      mockData.delete(entry);
      return 1;
    }
    return 0;
  }),
  flushAll: vi.fn().mockImplementation(async () => {
    mockData.clear();
    return 'OK';
  }),
};

vi.mock('redis', () => ({
  createClient: vi.fn().mockReturnValue(mockRedisClient),
}));
