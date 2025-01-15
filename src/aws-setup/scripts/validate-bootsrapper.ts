import { IAM, paginateListAttachedUserPolicies } from '@aws-sdk/client-iam';
import { STS } from '@aws-sdk/client-sts';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(import.meta.filename);

async function validateBootstrapPermissions(awsRegion = 'us-east-1') {
  const iam = new IAM({});
  const sts = new STS({});

  try {
    // Get current user identity
    const { Arn: userArn, Account: accountId } = await sts.getCallerIdentity({});
    if (!userArn) throw new Error('Failed to get user ARN');

    logger.info(`Using AWS account: ${accountId}`);
    logger.info(`Using AWS profile: ${process.env.AWS_PROFILE || 'default'}`);
    logger.info(`Current user: ${userArn}`);

    // Extract username from ARN
    const username = userArn.split('/').pop();
    if (!username) throw new Error('Failed to extract username from ARN');

    // Check user's policies
    const policies = [];
    for await (const page of paginateListAttachedUserPolicies(
      { client: iam },
      { UserName: username },
    )) {
      policies.push(...(page.AttachedPolicies || []));
    }

    // Check if user has admin access
    const hasAdminAccess = policies.some(
      (policy) => policy.PolicyArn === 'arn:aws:iam::aws:policy/AdministratorAccess',
    );

    if (hasAdminAccess) {
      logger.info('✓ User has AdministratorAccess policy');
      return true;
    }

    // If no admin access, warn about required permissions
    logger.warn(
      '! User does not have AdministratorAccess policy. Attach it by following these steps:',
    );
    logger.info(
      `1. Go to https://${awsRegion}.console.aws.amazon.com/iam/home#/users/details/${username}?section=permissions`,
    );
    logger.info(`2. Click "Add Permission"`);
    logger.info(`3. Select "Attach policies directly"`);
    logger.info(`4. Find "AdministratorAccess" and select`);
    logger.info(`5. Click "Next"`);
    logger.info(`6. Click "Add permissions"`);
    return false;
  } catch (error) {
    assertError(error);
    logger.error('Failed to validate bootstrap permissions:', error);
    return false;
  }
}

// Parse command line arguments
const environment = process.argv[2];

if (!environment) {
  logger.error('Environment not specified');
  logger.error('Usage: validate-bootsrapper.ts <environment>');
  process.exit(1);
}

if (!['development', 'preview', 'production'].includes(environment)) {
  logger.error(
    `Invalid environment: ${environment}. Must be one of: development, preview, production`,
  );
  process.exit(1);
}

void validateBootstrapPermissions(environment);
