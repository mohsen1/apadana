import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';

import prisma from '@/lib/prisma';
import { getRedisClient } from '@/lib/redis/client';

import { createLogger } from '@/utils/logger';

const logger = createLogger(import.meta.filename);

interface CloudFormationError {
  name: string;
  message: string;
}

type ConnectionCheck = {
  name: string;
  check: () => Promise<void>;
};

const connectionChecks: ConnectionCheck[] = [
  {
    name: 'RDS',
    check: checkRdsConnection,
  },
  {
    name: 'Redis',
    check: checkRedisConnection,
  },
  // Add new checks here in the future
];

async function checkRedisConnection() {
  logger.info('Checking Redis connection...');
  const client = await getRedisClient({
    socket: {
      connectTimeout: 30000,
      keepAlive: 0,
      reconnectStrategy: (retries) => {
        if (retries > 5) return new Error('Redis check failed');
        return Math.min(Math.pow(2, retries) * 1000, 32000);
      },
      tls: true,
      rejectUnauthorized: false,
    },
  });
  try {
    await client.ping();
    logger.info('Redis connection successful');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  } finally {
    await client.disconnect();
  }
}

async function checkRdsConnection() {
  logger.info('Checking RDS connection...');
  try {
    await prisma.$connect();
    // Simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('RDS connection successful');
  } catch (error) {
    logger.error('RDS connection failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
/**
 * Check for database connections and use an exponential backoff strategy
 * to retry until all connections are established or the maximum number of retries is reached.
 *
 * @param maxRetries - The maximum number of retries to attempt.
 * @param retryDelay - The initial delay in milliseconds before retrying.
 */
async function checkConnections(maxRetries = 100, retryDelay = 10) {
  const connectionStatus = new Map<string, boolean>();
  connectionChecks.forEach(({ name }) => connectionStatus.set(name, false));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Attempting database connections (attempt ${attempt}/${maxRetries})...`);

      // Run checks for services that haven't connected yet
      const pendingChecks = connectionChecks
        .filter(({ name }) => !connectionStatus.get(name))
        .map(async ({ name, check }) => {
          try {
            await check();
            connectionStatus.set(name, true);
            logger.info(`${name} connection established`);
          } catch (error) {
            logger.warn(`${name} connection failed:`, error);
          }
        });

      await Promise.all(pendingChecks);

      // Check if all services are connected
      const allConnected = Array.from(connectionStatus.values()).every((status) => status);
      if (allConnected) {
        logger.info('All connections established successfully');
        return;
      }

      // Log remaining services
      const pendingServices = Array.from(connectionStatus.entries())
        .filter(([, connected]) => !connected)
        .map(([name]) => name);
      logger.warn(`Still waiting for connections: ${pendingServices.join(', ')}`);

      if (attempt === maxRetries) {
        throw new Error(
          `Failed to connect after ${maxRetries} retries. Outstanding services: ${pendingServices.join(', ')}`,
        );
      }

      const nextDelay = retryDelay * 2;
      logger.info(`Waiting ${nextDelay / 1000}s before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, nextDelay));
    } catch (error) {
      if (attempt === maxRetries) throw error;
      logger.warn(`Attempt ${attempt} failed, retrying...`, error);
    }
  }
}

export async function waitForReady() {
  const env = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
  const stackNames = [
    `ap-iam-${env}`,
    `ap-network-${env}`,
    `ap-elasticache-${env}`,
    `ap-rds-${env}`,
    `ap-s3-${env}`,
  ];

  const client = new CloudFormationClient({});

  // First wait for all stacks to be ready
  for (const stackName of stackNames) {
    let isReady = false;
    logger.info(`Waiting for stack: ${stackName}`);

    while (!isReady) {
      try {
        const res = await client.send(new DescribeStacksCommand({ StackName: stackName }));
        const status = res.Stacks?.[0]?.StackStatus ?? 'UNKNOWN';
        logger.debug(`${stackName} => ${status}`);

        // Check if stable/successful
        if (status.endsWith('_COMPLETE') && !status.startsWith('ROLLBACK')) {
          isReady = true;
        } else if (status.endsWith('_FAILED') || status.includes('ROLLBACK')) {
          logger.error(`Stack ${stackName} failed with status: ${status}`);
          process.exit(1);
        } else {
          // Sleep 10 seconds, then check again
          await new Promise((resolve) => setTimeout(resolve, 10_000));
        }
      } catch (error) {
        const cfError = error as CloudFormationError;
        if (cfError.name === 'ValidationError' && cfError.message.includes('does not exist')) {
          logger.debug(`${stackName} => NOT_CREATED_YET`);
          await new Promise((resolve) => setTimeout(resolve, 10000));
        } else {
          throw error;
        }
      }
    }

    logger.info(`Stack ${stackName} is ready`);
  }

  logger.info('All stacks are ready. Checking database connections...');

  // Check database connections with retries
  await checkConnections();

  logger.info('All systems are ready.');
}

export async function main() {
  try {
    await waitForReady();
  } catch (err) {
    logger.error('Error waiting for resources:', err);
    process.exit(1);
  }
}

if (import.meta.url === new URL(import.meta.url).href) {
  void main();
}
