#!/usr/bin/env node
import { config } from 'dotenv';

import { getConfig } from '../config/factory';
import { validateResources } from '../config/validate';

// Load environment variables
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

async function main() {
  // Log environment state
  console.log('Environment variables:');
  console.log('  AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
  console.log(
    '  AWS_SECRET_ACCESS_KEY:',
    process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set',
  );
  console.log('  AWS_REGION:', process.env.AWS_REGION || 'us-east-1 (default)');
  console.log(
    '  AWS_DEPLOYMENT_STACK_ENV:',
    process.env.AWS_DEPLOYMENT_STACK_ENV || 'development (default)',
  );
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('');

  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    console.error('❌ AWS credentials not found in environment variables');
    console.error(
      'Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in Vercel environment variables',
    );
    process.exit(1);
  }

  console.log('🔍 Running preflight checks...');
  const awsConfig = getConfig();
  console.log(`Environment: ${awsConfig.stack.environment}`);
  console.log(`Region: ${awsConfig.stack.region}`);

  try {
    const validation = await validateResources(awsConfig, credentials);

    if (!validation.isValid) {
      console.error('\n❌ Preflight checks failed:');
      validation.errors.forEach((error) => console.error(`  - ${error}`));
      console.error('\nResource Status:');
      Object.entries(validation.resources).forEach(([resource, exists]) => {
        console.error(`  - ${resource}: ${exists ? '✅' : '❌'}`);
      });
      process.exit(1);
    }

    console.log('\n✅ All resources are available:');
    Object.entries(validation.resources).forEach(([resource, exists]) => {
      console.log(`  - ${resource}: ${exists ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('\n❌ Preflight validation failed with error:');
    console.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Failed to run preflight checks:');
  console.error(error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
