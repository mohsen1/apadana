#!/usr/bin/env node
import { config } from 'dotenv';

import { getConfig } from '../config/factory';
import { validateResources } from '../config/validate';

// Load environment variables
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

async function main() {
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    console.error('❌ AWS credentials not found in environment variables');
    console.error('Run pnpm aws:deployer:create first and add the credentials to .env.local');
    process.exit(1);
  }

  console.log('🔍 Running preflight checks...');
  const awsConfig = getConfig();
  console.log(`Environment: ${awsConfig.stack.environment}`);
  console.log(`Region: ${awsConfig.stack.region}`);

  const validation = await validateResources(awsConfig, credentials);

  if (!validation.isValid) {
    console.error('❌ Preflight checks failed:');
    validation.errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log('✅ All resources are available:');
  Object.entries(validation.resources).forEach(([resource, exists]) => {
    console.log(`  - ${resource}: ${exists ? '✅' : '❌'}`);
  });
}

main().catch((error) => {
  console.error('Failed to run preflight checks:', error);
  process.exit(1);
});
