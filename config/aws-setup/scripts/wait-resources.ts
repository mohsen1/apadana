#!/usr/bin/env node
import { config } from 'dotenv';
import _ from 'lodash';

import { getConfig } from '../config/factory';
import { validateResources } from '../config/validate';

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

async function main() {
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error('AWS credentials not found in environment variables');
  }

  const awsConfig = getConfig();
  console.log(`Waiting for resources in environment: ${awsConfig.stack.environment}`);
  console.log('Resources to check:');
  console.log('  - RDS Database');
  console.log('  - MemoryDB Cluster');
  console.log('  - S3 Bucket');
  console.log('  - Secrets Manager');
  console.log('\nChecking resource status and connectivity...\n');

  let retries = 0;
  let lastResources = {};

  while (retries < MAX_RETRIES) {
    const validation = await validateResources(awsConfig, credentials);
    const resources = validation.resources;

    // Only show status if something changed
    if (!_.isEqual(resources, lastResources)) {
      console.log(`\nStatus update (attempt ${retries + 1}/${MAX_RETRIES}):`);
      console.log(`  RDS Database    ${getProgressSymbol(resources.rds)}`);
      console.log(`  MemoryDB        ${getProgressSymbol(resources.memoryDb)}`);
      console.log(`  S3 Bucket       ${getProgressSymbol(resources.s3)}`);
      console.log(`  Secrets Manager ${getProgressSymbol(resources.secrets)}`);

      if (validation.errors.length > 0) {
        console.log('\nIssues:');
        validation.errors.forEach((error) => console.log(`  - ${error}`));
      }

      lastResources = { ...resources };
    } else {
      process.stdout.write('.');
    }

    if (validation.isValid) {
      console.log('\n\n✅ All resources are ready and accepting connections!');
      return;
    }

    retries++;
    if (retries < MAX_RETRIES) {
      if (validation.errors.length > 0) {
        console.log(`\nWaiting ${RETRY_DELAY / 1000} seconds before next check...`);
      }
      await sleep(RETRY_DELAY);
    }
  }

  throw new Error('Timed out waiting for resources to be ready and accepting connections');
}

main().catch((error) => {
  console.error('\n❌ Failed while waiting for resources:', error);
  process.exit(1);
});
