import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { closeRedisClient, getRedisClient } from '@/lib/redis/client';

describe('Redis Client', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(async () => {
    await closeRedisClient();
    vi.unstubAllEnvs();
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
    await client.set('test-key', 'test-value');
    const value = await client.get('test-key');
    expect(value).toBe('test-value');
  });

  it('should handle multiple operations', async () => {
    const client = await getRedisClient();

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
    await client.set('test-key', 'test-value');
    await client.flushAll();
    const value = await client.get('test-key');
    expect(value).toBeNull();
  });

  it('should create a real Redis client in non-test environment', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('REDIS_URL', 'redis://localhost:6379');

    const client = await getRedisClient();
    expect(client).toBeDefined();

    // Verify that connect was called for real client
    const { createClient } = await import('redis');
    expect(createClient).toHaveBeenCalledWith({
      url: 'redis://localhost:6379',
    });
  });
});
