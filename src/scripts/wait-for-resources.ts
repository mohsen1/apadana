import { CloudFormation } from '@aws-sdk/client-cloudformation';

import { createLogger } from '@/utils/logger';

const logger = createLogger(import.meta.filename);

const cloudformation = new CloudFormation({});

async function checkStackStatus(stackName: string): Promise<boolean> {
  try {
    const { Stacks } = await cloudformation.describeStacks({
      StackName: stackName,
    });

    if (!Stacks?.[0]) return false;

    const status = Stacks[0].StackStatus;
    return status === 'CREATE_COMPLETE' || status === 'UPDATE_COMPLETE';
  } catch (error) {
    logger.error('Error checking stack status:', error);
    return false;
  }
}

async function waitForResources(env: string, maxAttempts = 30): Promise<boolean> {
  const stackNames = [`apadana-s3-${env}`, `apadana-rds-${env}`, `apadana-memorydb-${env}`];

  let attempts = 0;
  while (attempts < maxAttempts) {
    logger.info(`Checking resources availability (attempt ${attempts + 1}/${maxAttempts})`);

    const statuses = await Promise.all(stackNames.map((stack) => checkStackStatus(stack)));

    if (statuses.every((status) => status)) {
      logger.info('All resources are available');
      return true;
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds between checks
  }

  logger.error('Timed out waiting for resources');
  return false;
}

// Allow running directly from command line
if (import.meta.url === new URL(import.meta.url).href) {
  const env = process.env.AWS_DEPLOYMENT_STACK_ENV || process.argv[2];
  if (!env) {
    logger.error('Environment not specified');
    process.exit(1);
  }

  waitForResources(env)
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

export default waitForResources;
