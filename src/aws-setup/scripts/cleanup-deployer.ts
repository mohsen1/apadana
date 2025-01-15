import { IAM } from '@aws-sdk/client-iam';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(import.meta.filename);
const iam = new IAM({});

export async function cleanupDeployer(env: string) {
  logger.info('[cleanup-deployer.ts] Starting cleanup for environment:', env);
  const groupName = `ap-deployer-group-${env}`;
  const userName = `ap-deployer-${env}`;
  let hasErrors = false;

  // Delete access keys first
  logger.info(`[cleanup-deployer.ts] Listing access keys for user ${userName}...`);
  try {
    const { AccessKeyMetadata } = await iam.listAccessKeys({ UserName: userName });
    if (AccessKeyMetadata?.length) {
      for (const key of AccessKeyMetadata) {
        if (!key.AccessKeyId) continue;
        logger.info(`[cleanup-deployer.ts] Deleting access key ${key.AccessKeyId}...`);
        try {
          await iam.deleteAccessKey({
            UserName: userName,
            AccessKeyId: key.AccessKeyId,
          });
        } catch (error) {
          assertError(error);
          if (error.name !== 'NoSuchEntity') {
            logger.error(`[cleanup-deployer.ts] Error deleting access key: ${error.message}`);
            hasErrors = true;
          }
        }
      }
    }
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      logger.error(`[cleanup-deployer.ts] Error listing access keys: ${error.message}`);
      hasErrors = true;
    }
  }

  // Remove user from group
  logger.info(`[cleanup-deployer.ts] Removing user ${userName} from group ${groupName}...`);
  try {
    await iam.removeUserFromGroup({
      GroupName: groupName,
      UserName: userName,
    });
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      logger.error(`[cleanup-deployer.ts] Error removing user from group: ${error.message}`);
      hasErrors = true;
    }
  }

  // Delete user
  logger.info(`[cleanup-deployer.ts] Deleting user ${userName}...`);
  try {
    await iam.deleteUser({ UserName: userName });
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      logger.error(`[cleanup-deployer.ts] Error deleting user: ${error.message}`);
      hasErrors = true;
    }
  }

  // Detach group policies
  logger.info(`[cleanup-deployer.ts] Detaching group policies...`);
  try {
    const { AttachedPolicies } = await iam.listAttachedGroupPolicies({ GroupName: groupName });
    if (AttachedPolicies?.length) {
      for (const policy of AttachedPolicies) {
        if (!policy.PolicyArn) continue;
        logger.info(`[cleanup-deployer.ts] Detaching policy ${policy.PolicyArn}...`);
        try {
          await iam.detachGroupPolicy({
            GroupName: groupName,
            PolicyArn: policy.PolicyArn,
          });
        } catch (error) {
          assertError(error);
          if (error.name !== 'NoSuchEntity') {
            logger.error(`[cleanup-deployer.ts] Error detaching policy: ${error.message}`);
            hasErrors = true;
          }
        }
      }
    }
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      logger.error(`[cleanup-deployer.ts] Error listing group policies: ${error.message}`);
      hasErrors = true;
    }
  }

  // Delete inline policies
  logger.info(`[cleanup-deployer.ts] Deleting inline policies...`);
  try {
    const { PolicyNames } = await iam.listGroupPolicies({ GroupName: groupName });
    if (PolicyNames?.length) {
      for (const policyName of PolicyNames) {
        logger.info(`[cleanup-deployer.ts] Deleting inline policy ${policyName}...`);
        try {
          await iam.deleteGroupPolicy({
            GroupName: groupName,
            PolicyName: policyName,
          });
        } catch (error) {
          assertError(error);
          if (error.name !== 'NoSuchEntity') {
            logger.error(`[cleanup-deployer.ts] Error deleting inline policy: ${error.message}`);
            hasErrors = true;
          }
        }
      }
    }
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      logger.error(`[cleanup-deployer.ts] Error listing inline policies: ${error.message}`);
      hasErrors = true;
    }
  }

  // Delete group
  logger.info(`[cleanup-deployer.ts] Deleting group ${groupName}...`);
  try {
    await iam.deleteGroup({ GroupName: groupName });
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      logger.error(`[cleanup-deployer.ts] Error deleting group: ${error.message}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    logger.warn('[cleanup-deployer.ts] Completed with some errors');
    process.exit(1);
  } else {
    logger.info('[cleanup-deployer.ts] ✓ Successfully cleaned up deployer resources');
  }
}

const env = process.env.AWS_DEPLOYMENT_STACK_ENV;
if (!env) {
  logger.error('Environment not specified');
  process.exit(1);
}

cleanupDeployer(env).catch((error) => {
  logger.error('Failed to clean up deployer:', error);
  process.exit(1);
});
