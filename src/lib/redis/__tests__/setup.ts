import { beforeEach, vi } from 'vitest';

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

beforeEach(() => {
  mockData.clear();
  vi.clearAllMocks();
});
