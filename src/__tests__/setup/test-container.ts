import { exec as nativeExec } from 'node:child_process';
import { promisify } from 'node:util';

import prisma from '@/lib/prisma/client';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename, 'warn');
const exec = promisify(nativeExec);
const composeFile = 'docker-compose.test.yml';

async function waitForContainerHealthy(
  composeFile: string,
  serviceName: string,
  maxRetries = 10,
  retryTimeout = 1000,
) {
  let retries = maxRetries;
  while (retries > 0) {
    try {
      logger.debug('Checking container status...');
      const containerStatusResult = await exec(
        `docker compose -f ${composeFile} ps --format json`,
        {
          env: process.env,
        },
      );

      logger.debug(
        'Raw container status output:',
        containerStatusResult.stdout,
      );
      let containers: { Service: string; State: string; Health: string }[] =
        JSON.parse(containerStatusResult.stdout);

      if (!Array.isArray(containers)) {
        logger.debug(
          'Received a single container object, converting to array.',
        );
        containers = [containers];
      }

      if (!Array.isArray(containers)) {
        logger.error('Expected an array of containers, got:', containers);
        logger.error(
          'Check Docker Compose version or remove --format json. Requires Docker Compose v2 or newer.',
        );
        throw new Error('Invalid container status format - not an array');
      }

      const targetContainer = containers.find(
        (c: { Service: string; State: string; Health: string }) =>
          c.Service === serviceName,
      );
      if (!targetContainer || targetContainer.State !== 'running') {
        logger.info(
          `Container "${serviceName}" not running yet. Retries left: ${retries - 1}`,
        );
      } else if (targetContainer.Health !== 'healthy') {
        logger.info(
          `Container "${serviceName}" not healthy yet. Retries left: ${retries - 1}`,
        );
      } else {
        logger.debug(`Container "${serviceName}" is running and healthy.`);
        return;
      }

      retries--;
      if (retries > 0) {
        logger.debug(`Waiting ${retryTimeout}ms before re-checking...`);
        await new Promise((resolve) => setTimeout(resolve, retryTimeout));
      } else {
        throw new Error(
          `"${serviceName}" container not healthy after all retries`,
        );
      }
    } catch (error) {
      assertError(error);
      logger.warn(
        `Error checking container status: ${error.message}, retries left: ${retries - 1}`,
      );
      retries--;
      if (retries > 0) {
        logger.debug(`Waiting ${retryTimeout}ms before re-checking...`);
        await new Promise((resolve) => setTimeout(resolve, retryTimeout));
      } else {
        throw new Error('Failed to verify container health');
      }
    }
  }
}

export async function setupTestContainer() {
  logger.info('Setting up test database container...');

  const POSTGRES_USER = 'postgres';
  const POSTGRES_PASSWORD = 'postgres';
  const POSTGRES_DB = 'apadana_test';
  const POSTGRES_PORT = '5434';
  const DATABASE_URL = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}`;

  Object.assign(process.env, {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
    POSTGRES_PORT,
    DATABASE_URL,
  });

  logger.debug('Environment variables configured:', {
    POSTGRES_USER,
    POSTGRES_DB,
    POSTGRES_PORT,
    DATABASE_URL,
  });

  const composeFile = 'docker-compose.test.yml';

  try {
    logger.debug('Bringing down any existing test containers');
    await exec(`docker compose -f ${composeFile} down`, {
      env: process.env,
    });

    logger.debug('Starting test containers');
    await exec(`docker compose -f ${composeFile} up -d`, {
      env: process.env,
    });

    logger.log('⏳ Waiting for postgres container to be healthy...');

    await waitForContainerHealthy(composeFile, 'postgres_test', 10, 1000);

    logger.info('Running database migrations');
    await exec('pnpm prisma migrate deploy', {
      env: process.env,
    });

    logger.debug('Verifying DATABASE_URL is set:', process.env.DATABASE_URL);
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set after setup');
    }

    logger.info('Test database container setup complete');
  } catch (error) {
    assertError(error);
    logger.error('Failed to setup test container:', error);
    await teardownTestContainer();
    throw error;
  }
}

export async function teardownTestContainer() {
  logger.info('Tearing down test database container...');

  try {
    await exec(`docker compose -f ${composeFile} down`, {
      env: process.env,
    });
    logger.info('Test database container torn down successfully');
  } catch (error) {
    assertError(error);
    logger.error('Failed to tear down test container:', error);
    throw error;
  }
}

export async function clearDatabase() {
  logger.info('Clearing database...');
  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;
    logger.debug(`Found tables: ${tables.map((t) => t.tablename).join(', ')}`);

    await prisma.$transaction([
      prisma.$executeRawUnsafe("SET session_replication_role = 'replica';"),
      ...tables.map(({ tablename }) =>
        prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`),
      ),
      prisma.$executeRawUnsafe("SET session_replication_role = 'origin';"),
    ]);

    logger.info('Database successfully cleared');
  } catch (error) {
    assertError(error);
    logger.error('Failed to clear database:', error);
    throw error;
  }
}
