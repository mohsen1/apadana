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

  const mergedOptions = _.merge(
    {
      url: redisUrl,
      socket: {
        tls: true,
        // TODO: Use AWS Private Certificate Authority (AWS Private CA) to issue certificates for Redis Proxy.
        // You’ll still have to ensure the client trusts your CA’s root certificate. Steps:
        //  Use AWS Private Certificate Authority (AWS Private CA) to issue certificates for internal services.
        //  You’ll still have to ensure the client trusts your CA’s root certificate. Steps:
        // 	1.	Provision Private CA: Create or purchase a private CA in AWS Private CA.
        // 	2.	Generate a CSR: Either generate a CSR (certificate signing request)
        //      from your service or create a key pair and CSR using OpenSSL.
        // 	3.	Issue Certificate: Use your private CA to sign the CSR.
        // 	4.	Trust Chain: Add the private CA’s root certificate to your client’s trust store.
        // 	5.	Use Issued Cert: Instead of a self-signed cert, have your ECS container or proxy
        //     reference the newly signed certificate and key.
        // Clients that have your internal CA’s certificate in their trust chain will pass verification
        //  without complaining about self-signed certs.
        rejectUnauthorized: false, // Accept self-signed certificates
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
