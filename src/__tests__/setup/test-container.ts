import { execSync as exec } from 'node:child_process';

import prisma from '@/lib/prisma';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename, 'warn');

const composeFile = 'src/docker/docker-compose.yml';

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
      const containerStatusResult = exec(
        `docker compose -f ${composeFile} ps --format '{"service":"{{ .Service }}","state":"{{ .State }}","health":"{{ .Health }}"}'`,
        {
          env: process.env,
          stdio: 'pipe',
        },
      );

      const output = containerStatusResult.toString().trim();
      logger.debug('Container status output:', output);

      const statusLines = output.split('\n').filter(Boolean);

      for (const line of statusLines) {
        try {
          const container = JSON.parse(line) as {
            service: string;
            state: string;
            health: string;
          };
          if (container.service === serviceName) {
            if (container.state !== 'running') {
              logger.info(
                `Container "${serviceName}" not running yet. Retries left: ${retries - 1}`,
              );
            } else if (container.health !== 'healthy') {
              logger.info(
                `Container "${serviceName}" not healthy yet. Retries left: ${retries - 1}`,
              );
            } else {
              logger.info(`Container "${serviceName}" is running and healthy.`);
              return;
            }
          }
        } catch (parseError) {
          assertError(parseError);
          logger.debug(`Failed to parse line: ${line}`);
          continue;
        }
      }

      retries--;
      if (retries > 0) {
        logger.debug(`Waiting ${retryTimeout}ms before re-checking...`);
        await new Promise((resolve) => setTimeout(resolve, retryTimeout));
      } else {
        throw new Error(`Container "${serviceName}" not healthy after all retries`);
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
  throw new Error(`Container "${serviceName}" not healthy after ${maxRetries} retries`);
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
      exec(`docker compose -f ${composeFile} up --quiet-pull db_test -d`, {
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
