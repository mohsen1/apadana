import { IAM } from '@aws-sdk/client-iam';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

import { DEPLOYER_MANAGED_POLICIES, DEPLOYER_PERMISSIONS } from '../constants';

const logger = createLogger(import.meta.filename);
const iam = new IAM({});

export async function setupDeployerGroup(env: string, username: string) {
  logger.info('[setup-deployer-group.ts] Starting setup for environment:', env);
  const groupName = `ap-deployer-group-${env}`;

  logger.info(
    `[setup-deployer-group.ts] Setting up deployer group ${groupName} for user ${username}...`,
  );

  // Create the group if it doesn't exist
  logger.info(`[setup-deployer-group.ts] Creating group ${groupName}...`);
  try {
    await iam.createGroup({ GroupName: groupName });
    logger.info(`[setup-deployer-group.ts] Created group ${groupName}`);
  } catch (error) {
    assertError(error);
    if (error.name === 'EntityAlreadyExistsException') {
      logger.info(`[setup-deployer-group.ts] Group ${groupName} already exists`);
    } else {
      throw error;
    }
  }

  // Wait for group to be available
  logger.info(`[setup-deployer-group.ts] Waiting for group ${groupName} to be available...`);
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    attempts++;
    logger.info(
      `[setup-deployer-group.ts] Attempt ${attempts}/${maxAttempts} to verify group ${groupName} exists...`,
    );
    try {
      await iam.getGroup({ GroupName: groupName });
      logger.info(`[setup-deployer-group.ts] Group ${groupName} exists!`);
      break;
    } catch (error) {
      assertError(error);
      if (error.name === 'NoSuchEntity') {
        if (attempts === maxAttempts) {
          throw new Error(`Group ${groupName} not found after ${maxAttempts} attempts`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }

  // Detach existing managed policies
  logger.info(`[setup-deployer-group.ts] Detaching existing managed policies...`);
  try {
    const { AttachedPolicies } = await iam.listAttachedGroupPolicies({ GroupName: groupName });
    if (AttachedPolicies?.length) {
      for (const policy of AttachedPolicies) {
        if (!policy.PolicyArn) continue;
        logger.info(`[setup-deployer-group.ts] Detaching policy ${policy.PolicyArn}...`);
        await iam.detachGroupPolicy({
          GroupName: groupName,
          PolicyArn: policy.PolicyArn,
        });
        logger.info(`[setup-deployer-group.ts] Detached policy ${policy.PolicyArn}`);
      }
    }
  } catch (error) {
    logger.error('[setup-deployer-group.ts] Error detaching managed policies:', error);
    throw error;
  }

  // Delete existing inline policies
  logger.info(`[setup-deployer-group.ts] Checking for existing inline policies...`);
  try {
    const { PolicyNames } = await iam.listGroupPolicies({ GroupName: groupName });
    if (PolicyNames?.length) {
      for (const policyName of PolicyNames) {
        logger.info(`[setup-deployer-group.ts] Deleting inline policy ${policyName}...`);
        await iam.deleteGroupPolicy({
          GroupName: groupName,
          PolicyName: policyName,
        });
        logger.info(`[setup-deployer-group.ts] Deleted inline policy ${policyName}`);
      }
    }
  } catch (error) {
    logger.error('[setup-deployer-group.ts] Error deleting inline policies:', error);
    throw error;
  }

  // Create inline policy with specific permissions
  const inlinePolicyName = `${groupName}-inline-policy`;
  const inlinePolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: DEPLOYER_PERMISSIONS,
        Resource: '*',
      },
    ],
  };

  logger.info(`[setup-deployer-group.ts] Creating inline policy ${inlinePolicyName}...`);
  try {
    await iam.putGroupPolicy({
      GroupName: groupName,
      PolicyName: inlinePolicyName,
      PolicyDocument: JSON.stringify(inlinePolicy),
    });
    logger.info(`[setup-deployer-group.ts] Created inline policy ${inlinePolicyName}`);
  } catch (error) {
    logger.error('[setup-deployer-group.ts] Error creating inline policy:', error);
    throw error;
  }

  // Attach managed policies
  for (const policyArn of DEPLOYER_MANAGED_POLICIES) {
    logger.info(`[setup-deployer-group.ts] Attaching policy ${policyArn} to group ${groupName}...`);
    try {
      await iam.attachGroupPolicy({
        GroupName: groupName,
        PolicyArn: policyArn,
      });
      logger.info(`[setup-deployer-group.ts] Attached policy ${policyArn} to ${groupName}`);
    } catch (error) {
      assertError(error);
      if (error.name === 'EntityAlreadyExists' || error.name === 'LimitExceeded') {
        logger.info(
          `[setup-deployer-group.ts] Policy ${policyArn} already attached to ${groupName}`,
        );
      } else {
        throw error;
      }
    }
  }

  // Add user to group
  logger.info(`[setup-deployer-group.ts] Adding user ${username} to group ${groupName}...`);
  try {
    await iam.addUserToGroup({
      GroupName: groupName,
      UserName: username,
    });
    logger.info(`[setup-deployer-group.ts] Added user ${username} to group ${groupName}`);
  } catch (error) {
    assertError(error);
    if (error.name === 'EntityAlreadyExists') {
      logger.info(`[setup-deployer-group.ts] User ${username} already in group ${groupName}`);
    } else {
      throw error;
    }
  }

  logger.info('[setup-deployer-group.ts] ✓ Successfully set up deployer group');
}

const env = process.env.AWS_DEPLOYMENT_STACK_ENV;
if (!env) {
  logger.error('Environment not specified');
  process.exit(1);
}

const username = process.argv[2];
if (!username) {
  logger.error('Username not specified');
  process.exit(1);
}

setupDeployerGroup(env, username).catch((error) => {
  logger.error('Failed to set up deployer group:', error);
  process.exit(1);
});
