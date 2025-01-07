import { createClient } from 'redis';
import { afterEach, beforeEach, describe, expect, it, Mocked, vi } from 'vitest';

import { closeRedisClient, getRedisClient } from '@/lib/redis/client';

describe('Redis Client', () => {
  // Redis is mocked in vitest.setup.ts
  const mockRedisClient = createClient() as unknown as Mocked<ReturnType<typeof createClient>>;
  beforeEach(async () => {
    await mockRedisClient.flushAll();
    vi.clearAllMocks();
  });
  afterEach(async () => {
    await closeRedisClient();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('should create a Redis client', async () => {
    const client = await getRedisClient();
    expect(client).toBeDefined();
    expect(typeof client.set).toBe('function');
    expect(typeof client.get).toBe('function');
  });

  it('should reuse the same client instance', async () => {
    const client1 = await getRedisClient();
    const client2 = await getRedisClient();
    expect(client1).toBe(client2);
  });

  it('should set and get values', async () => {
    const client = await getRedisClient();
    mockRedisClient.set.mockResolvedValueOnce('OK');
    mockRedisClient.get.mockResolvedValueOnce('test-value');

    await client.set('test-key', 'test-value');
    const value = await client.get('test-key');

    expect(value).toBe('test-value');
    expect(mockRedisClient.set).toHaveBeenCalledWith('test-key', 'test-value');
    expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
  });

  it('should handle multiple operations', async () => {
    const client = await getRedisClient();

    mockRedisClient.set.mockResolvedValueOnce('OK').mockResolvedValueOnce('OK');
    mockRedisClient.get
      .mockResolvedValueOnce('value1')
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('value2');
    mockRedisClient.del.mockResolvedValueOnce(1);

    await client.set('key1', 'value1');
    await client.set('key2', 'value2');

    const value1 = await client.get('key1');
    expect(value1).toBe('value1');

    await client.del('key1');
    const deletedValue = await client.get('key1');
    expect(deletedValue).toBeNull();

    const value2 = await client.get('key2');
    expect(value2).toBe('value2');
  });

  it('should clear data', async () => {
    const client = await getRedisClient();
    mockRedisClient.set.mockResolvedValueOnce('OK');
    mockRedisClient.flushAll.mockResolvedValueOnce('OK');
    mockRedisClient.get.mockResolvedValueOnce(null);

    await client.set('test-key', 'test-value');
    await client.flushAll();
    const value = await client.get('test-key');

    expect(value).toBeNull();
    expect(mockRedisClient.flushAll).toHaveBeenCalled();
  });
});
