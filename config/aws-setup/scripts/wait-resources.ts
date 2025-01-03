#!/usr/bin/env node
import { config } from 'dotenv';
import _ from 'lodash';

import { createLogger } from '@/utils/logger';

import { getConfig } from '../config/factory';
import { validateResources } from '../config/validate';

const logger = createLogger('wait-resources');

// Load environment variables
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

const MAX_RETRIES = 30;
const RETRY_DELAY = 10000; // 10 seconds

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getProgressSymbol(status: boolean | undefined): string {
  if (status === undefined) return '⏳';
  return status ? '✅' : '❌';
}

function formatError(error: string): string {
  // Extract just the error message after the colon if it exists
  const colonIndex = error.lastIndexOf(':');
  if (colonIndex !== -1) {
    return error.substring(colonIndex + 1).trim();
  }
  return error;
}

async function main() {
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error('AWS credentials not found in environment variables');
  }

  const awsConfig = getConfig();
  logger.info(`Waiting for resources in environment: ${awsConfig.stack.environment}`);
  logger.info('Resources to check:');
  logger.info('  - RDS Database (waiting for availability and connection test)');
  logger.info('  - MemoryDB Cluster (waiting for availability and connection test)');
  logger.info('  - S3 Bucket (checking access)');
  logger.info('  - Secrets Manager (verifying secrets)');
  logger.info('\nStarting resource validation...\n');

  let retries = 0;
  let lastResources = {};
  let lastErrors = new Set<string>();

  while (retries < MAX_RETRIES) {
    const validation = await validateResources(awsConfig, credentials);
    const resources = validation.resources;
    const currentErrors = new Set(validation.errors.map(formatError));

    // Show status if resources or errors changed
    if (!_.isEqual(resources, lastResources) || !_.isEqual(currentErrors, lastErrors)) {
      logger.log(`\nStatus update (attempt ${retries + 1}/${MAX_RETRIES}):`);
      logger.log(`  RDS Database    ${getProgressSymbol(resources.rds)}`);
      logger.log(`  MemoryDB        ${getProgressSymbol(resources.memoryDb)}`);
      logger.log(`  S3 Bucket       ${getProgressSymbol(resources.s3)}`);
      logger.log(`  Secrets Manager ${getProgressSymbol(resources.secrets)}`);

      if (validation.errors.length > 0) {
        logger.log('\nCurrent issues:');
        validation.errors.forEach((error) => logger.log(`  - ${formatError(error)}`));
      }

      lastResources = { ...resources };
      lastErrors = currentErrors;
    } else {
      process.stdout.write('.');
    }

    if (validation.isValid) {
      logger.log('\n\n✅ All resources are ready and accepting connections!');
      logger.log('\nResource endpoints:');
      logger.log(`  RDS: ${awsConfig.resources.rds.instanceIdentifier}`);
      logger.log(`  MemoryDB: ${awsConfig.resources.memoryDb.clusterName}`);
      logger.log(`  S3: ${awsConfig.resources.s3.bucketPrefix}-${awsConfig.stack.environment}`);
      return;
    }

    retries++;
    if (retries < MAX_RETRIES) {
      if (validation.errors.length > 0) {
        logger.log(`\nWaiting ${RETRY_DELAY / 1000} seconds before next check...`);
      }
      await sleep(RETRY_DELAY);
    }
  }

  throw new Error('Timed out waiting for resources to be ready and accepting connections');
}

main().catch((error) => {
  logger.error('\n❌ Failed while waiting for resources:', error);
  process.exit(1);
});
