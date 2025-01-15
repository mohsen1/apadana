import { IAM } from '@aws-sdk/client-iam';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(import.meta.filename);
const iam = new IAM({});

export async function cleanupDeployer(env: string) {
  logger.info('[cleanup-deployer.ts] Starting cleanup for environment:', env);
  const groupName = `ap-deployer-group-${env}`;
  const userName = `ap-deployer-${env}`;

  // Delete access keys first
  logger.info(`[cleanup-deployer.ts] Listing access keys for user ${userName}...`);
  try {
    const { AccessKeyMetadata } = await iam.listAccessKeys({ UserName: userName });
    if (AccessKeyMetadata?.length) {
      for (const key of AccessKeyMetadata) {
        if (!key.AccessKeyId) continue;
        logger.info(`[cleanup-deployer.ts] Deleting access key ${key.AccessKeyId}...`);
        await iam.deleteAccessKey({
          UserName: userName,
          AccessKeyId: key.AccessKeyId,
        });
      }
    }
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      throw error;
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
      throw error;
    }
  }

  // Delete user
  logger.info(`[cleanup-deployer.ts] Deleting user ${userName}...`);
  try {
    await iam.deleteUser({ UserName: userName });
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      throw error;
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
        await iam.detachGroupPolicy({
          GroupName: groupName,
          PolicyArn: policy.PolicyArn,
        });
      }
    }
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      throw error;
    }
  }

  // Delete inline policies
  logger.info(`[cleanup-deployer.ts] Deleting inline policies...`);
  try {
    const { PolicyNames } = await iam.listGroupPolicies({ GroupName: groupName });
    if (PolicyNames?.length) {
      for (const policyName of PolicyNames) {
        logger.info(`[cleanup-deployer.ts] Deleting inline policy ${policyName}...`);
        await iam.deleteGroupPolicy({
          GroupName: groupName,
          PolicyName: policyName,
        });
      }
    }
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      throw error;
    }
  }

  // Delete group
  logger.info(`[cleanup-deployer.ts] Deleting group ${groupName}...`);
  try {
    await iam.deleteGroup({ GroupName: groupName });
  } catch (error) {
    assertError(error);
    if (error.name !== 'NoSuchEntity') {
      throw error;
    }
  }

  logger.info('[cleanup-deployer.ts] ✓ Successfully cleaned up deployer resources');
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
