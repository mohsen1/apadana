#!/usr/bin/env node
import { config } from 'dotenv';

import { createLogger } from '@/utils/logger';

import { getConfig } from '../config/factory';
import { validateResources } from '../config/validate';

const logger = createLogger('preflight');

// Load environment variables
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

async function main() {
  // Log environment state
  logger.info('Environment variables:');
  logger.info('  AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
  logger.info(
    '  AWS_SECRET_ACCESS_KEY:',
    process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set',
  );
  logger.log('  AWS_REGION:', process.env.AWS_REGION || 'us-east-1 (default)');
  logger.log(
    '  AWS_DEPLOYMENT_STACK_ENV:',
    process.env.AWS_DEPLOYMENT_STACK_ENV || 'development (default)',
  );
  logger.log('  NODE_ENV:', process.env.NODE_ENV || 'not set');
  logger.log('');

  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    logger.error('❌ AWS credentials not found in environment variables');
    logger.error(
      'Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in Vercel environment variables',
    );
    process.exit(1);
  }

  logger.log('🔍 Running preflight checks...');
  const awsConfig = getConfig();
  logger.log(`Environment: ${awsConfig.stack.environment}`);
  logger.log(`Region: ${awsConfig.stack.region}`);

  try {
    const validation = await validateResources(awsConfig, credentials);

    if (!validation.isValid) {
      logger.error('\n❌ Preflight checks failed:');
      validation.errors.forEach((error) => logger.error(`  - ${error}`));
      logger.error('\nResource Status:');
      Object.entries(validation.resources).forEach(([resource, exists]) => {
        logger.error(`  - ${resource}: ${exists ? '✅' : '❌'}`);
      });
      process.exit(1);
    }

    logger.log('\n✅ All resources are available:');
    Object.entries(validation.resources).forEach(([resource, exists]) => {
      logger.log(`  - ${resource}: ${exists ? '✅' : '❌'}`);
    });
  } catch (error) {
    logger.error('\n❌ Preflight validation failed with error:');
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('\n❌ Failed to run preflight checks:');
  logger.error(error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
