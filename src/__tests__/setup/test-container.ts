import { execSync as exec } from 'node:child_process';

import prisma from '@/lib/prisma';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename, 'warn');

const composeFile = 'src/docker/docker-compose.yml';

function safeParse<T>(value: string): { value: string; parsed: T | null } {
  try {
    return {
      value,
      parsed: JSON.parse(value) as T,
    };
  } catch (error) {
    assertError(error);
    return {
      value,
      parsed: null,
    };
  }
}

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
      const containerStatusResult = exec(`docker compose -f ${composeFile} ps --format json`, {
        env: process.env,
        stdio: 'pipe',
      });

      logger.debug('Raw container status output:', containerStatusResult.toString());
      let { parsed: containers } = safeParse<{ Service: string; State: string; Health: string }[]>(
        containerStatusResult.toString(),
      );

      if (!containers) {
        logger.error('Failed to parse container status output:', containerStatusResult.toString());
        throw new Error('Failed to parse container status output');
      }

      if (!Array.isArray(containers)) {
        logger.debug('Received a single container object, converting to array.');
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
        (c: { Service: string; State: string; Health: string }) => c.Service === serviceName,
      );
      if (!targetContainer || targetContainer.State !== 'running') {
        logger.info(`Container "${serviceName}" not running yet. Retries left: ${retries - 1}`);
      } else if (targetContainer.Health !== 'healthy') {
        logger.info(`Container "${serviceName}" not healthy yet. Retries left: ${retries - 1}`);
      } else {
        logger.debug(`Container "${serviceName}" is running and healthy.`);
        return;
      }

      retries--;
      if (retries > 0) {
        logger.debug(`Waiting ${retryTimeout}ms before re-checking...`);
        await new Promise((resolve) => setTimeout(resolve, retryTimeout));
      } else {
        throw new Error(`"${serviceName}" container not healthy after all retries`);
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

async function cleanDatabaseSchema() {
  logger.info('Cleaning database schema...');
  try {
    await prisma.$transaction([
      // Drop all tables
      prisma.$executeRawUnsafe(`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
          END LOOP;
        END $$;
      `),
      // Drop all custom types (enums)
      prisma.$executeRawUnsafe(`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e') LOOP
            EXECUTE 'DROP TYPE IF EXISTS "' || r.typname || '" CASCADE';
          END LOOP;
        END $$;
      `),
    ]);
    logger.info('Database schema cleaned successfully');
  } catch (error) {
    assertError(error);
    logger.error('Failed to clean database schema:', error);
    throw error;
  }
}

export async function setupTestContainer() {
  logger.info('Setting up test database container...');

  try {
    // Check if container is already running and healthy
    try {
      await waitForContainerHealthy(composeFile, 'db_test', 1, 1000);
      logger.log('ℹ️ Test container is already running and healthy');

      // Clean the schema before running migrations
      await cleanDatabaseSchema();

      logger.info('Running database migrations on existing container');
      exec('pnpm prisma migrate deploy --schema=src/prisma/schema.prisma', {
        env: process.env,
        cwd: process.cwd(),
      });
      return;
    } catch {
      logger.debug('Container not running or not healthy, starting it up');

      // Start only the test database container
      logger.log('⏳ Launching test container...');
      exec(`docker compose -f ${composeFile} up db_test -d`, {
        env: process.env,
      });

      await waitForContainerHealthy(composeFile, 'db_test', 10, 1000);

      logger.info('Running database migrations');
      exec('pnpm prisma migrate deploy --schema=src/prisma/schema.prisma', {
        env: process.env,
        cwd: process.cwd(),
      });
    }

    logger.info('Test database container setup complete');
  } catch (error) {
    assertError(error);
    logger.error('Failed to setup test container:', error);
    throw error; // Don't tear down on failure
  }
}

export async function teardownTestContainer() {
  logger.info('Tearing down test database container...');

  try {
    exec(`docker compose -f ${composeFile} down`, {
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
