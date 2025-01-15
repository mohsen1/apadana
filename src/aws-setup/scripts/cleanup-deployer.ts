import { createLogger } from '@/utils/logger';

import { cleanupIamGroup } from './cleanup-iam-group';

const logger = createLogger(import.meta.filename);

async function cleanupDeployer(environment: string) {
  const groupName = `ap-deployer-group-${environment}`;
  logger.info(`Cleaning up deployer group for environment: ${environment}`);
  await cleanupIamGroup(groupName);
}

// Parse command line arguments
const args = process.argv.slice(2);
const envIndex = args.indexOf('--env');
const environment =
  envIndex !== -1 && args[envIndex + 1]
    ? args[envIndex + 1]
    : process.env.AWS_DEPLOYMENT_STACK_ENV || process.env.VERCEL_ENV || 'development';

if (!['development', 'preview', 'production'].includes(environment)) {
  logger.error(
    `Invalid environment: ${environment}. Must be one of: development, preview, production`,
  );
  process.exit(1);
}

logger.info(`Starting cleanup for environment: ${environment}`);
void cleanupDeployer(environment);
