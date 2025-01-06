import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { createClient } from 'redis';

import prisma from '@/lib/prisma';

import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

interface CloudFormationError {
  name: string;
  message: string;
}

async function checkRedisConnection() {
  logger.info('Checking Redis connection...');
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL is not defined');
  }

  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    await client.ping();
    logger.info('Redis connection successful');
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
  } finally {
    await prisma.$disconnect();
  }
}

export async function waitForReady() {
  const env = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
  const stackNames = [
    `IamStack-${env}`,
    `SharedNetworkStack-${env}`,
    `MemoryDbStack-${env}`,
    `RdsStack-${env}`,
    `S3Stack-${env}`,
  ];

  const client = new CloudFormationClient({});

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
  let retries = 5;
  while (retries > 0) {
    try {
      await Promise.all([checkRedisConnection(), checkRdsConnection()]);
      break;
    } catch (error) {
      logger.warn(`Database connection check failed. Retries left: ${retries - 1}`, error);
      if (retries === 1) {
        throw new Error('Failed to connect to databases after multiple retries');
      }
      retries--;
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

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

if (require.main === module) {
  void main();
}
