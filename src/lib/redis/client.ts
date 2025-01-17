import _ from 'lodash';
import {
  createClient,
  RedisClientOptions,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from 'redis';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger('redis/client');

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

/**
 * Creates a Redis client based on the environment
 * In test environments, returns a mock Redis client
 * In production, returns a real Redis client
 */
export async function getRedisClient(
  optionsOverride: Partial<RedisClientOptions<RedisModules, RedisFunctions, RedisScripts>> = {},
): Promise<RedisClient> {
  if (redisClient) {
    return redisClient;
  }

  logger.info('Creating Redis client');

  if (!process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
    throw new Error('REDIS_URL environment variable is not set');
  }

  // Ensure URL uses TLS for ElastiCache
  // The URL should be in format: rediss://PRIMARY-ENDPOINT:6379
  // where PRIMARY-ENDPOINT matches the certificate's domain (*.ap-redis-{env}.xxxxx.region.cache.amazonaws.com)
  const redisUrl = process.env.REDIS_URL;

  // Check if we're running in local Docker environment (both dev and prod use redis://redis:6379)
  const isLocalDocker = redisUrl?.includes('redis://redis:6379');
  const shouldUseTls = !isLocalDocker && redisUrl?.startsWith('rediss://');

  logger.debug('Redis URL', { redisUrl, isLocalDocker, shouldUseTls });

  const mergedOptions = _.merge(
    {
      url: redisUrl,
      socket: {
        tls: shouldUseTls,
        // Only use TLS verification for AWS ElastiCache
        rejectUnauthorized: !isLocalDocker && shouldUseTls,
        connectTimeout: 30000, // 30 seconds for initial connection
        keepAlive: 30000, // Send keepalive every 30 seconds
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            logger.error('Max Redis reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          const delay = Math.min(retries * 1000, 5000);
          logger.debug(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
          return delay;
        },
      },
    },
    optionsOverride,
  );

  redisClient = createClient(mergedOptions);

  if (process.env.NODE_ENV !== 'test') {
    redisClient.on('error', (err) => {
      assertError(err);
      logger.error('Redis Client Error', { error: err });
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis client reconnecting');
    });

    redisClient.on('end', () => {
      logger.info('Redis client connection closed');
    });

    try {
      await redisClient.connect();
      // Test connection with ping
      await redisClient.ping();
      logger.info('Redis connection verified with ping');
    } catch (err) {
      logger.error('Failed to connect to Redis', {
        error: err,
        url: redisUrl?.replace(/rediss:\/\/(.*?)@/, 'rediss://***@'),
      });
      redisClient = null;
      throw err;
    }
  }

  return redisClient;
}

/**
 * Closes the Redis client connection
 */
export async function closeRedisClient(): Promise<void> {
  if (!redisClient) {
    return;
  }

  if (process.env.NODE_ENV !== 'test') {
    try {
      await redisClient.quit();
      logger.info('Redis client closed successfully');
    } catch (err) {
      logger.error('Error closing Redis client', { error: err });
      throw err;
    } finally {
      redisClient = null;
    }
  } else {
    redisClient = null;
  }
}
