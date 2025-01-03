#!/usr/bin/env node
import { config } from 'dotenv';

import { getConfig } from '../config/factory';
import { validateResources } from '../config/validate';

// Load environment variables
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

const MAX_RETRIES = 30;
const RETRY_DELAY = 10000; // 10 seconds

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  let retries = 0;
  while (retries < MAX_RETRIES) {
    const validation = await validateResources(awsConfig, credentials);

    if (validation.isValid) {
      console.log('✅ All resources are ready:');
      Object.entries(validation.resources).forEach(([resource, exists]) => {
        console.log(`  - ${resource}: ${exists ? '✅' : '❌'}`);
      });
      return;
    }

    console.log(`\n⏳ Attempt ${retries + 1}/${MAX_RETRIES}:`);
    validation.errors.forEach((error) => console.log(`  - ${error}`));

    retries++;
    if (retries < MAX_RETRIES) {
      console.log(`Waiting ${RETRY_DELAY / 1000} seconds before next check...`);
      await sleep(RETRY_DELAY);
    }
  }

  throw new Error('Timed out waiting for resources to be ready');
}

main().catch((error) => {
  console.error('Failed while waiting for resources:', error);
  process.exit(1);
});
