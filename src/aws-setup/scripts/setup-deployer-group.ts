import {
  AddUserToGroupCommand,
  AttachGroupPolicyCommand,
  CreateGroupCommand,
  GetGroupCommand,
  IAMClient,
} from '@aws-sdk/client-iam';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForGroup(iamClient: IAMClient, groupName: string, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      logger.info(`Attempt ${i + 1}/${maxAttempts} to verify group ${groupName} exists...`);
      await iamClient.send(new GetGroupCommand({ GroupName: groupName }));
      logger.info(`Group ${groupName} exists!`);
      return true;
    } catch (err) {
      assertError(err);
      if (err.name !== 'NoSuchEntity') throw err;
      if (i === maxAttempts - 1) {
        logger.error(`Group ${groupName} still not found after ${maxAttempts} attempts`);
        return false;
      }
      logger.info(`Group ${groupName} not found yet, waiting 1s...`);
      await sleep(1000);
    }
  }
  return false;
}

async function setupDeployerGroup(environment: string) {
  const iamClient = new IAMClient({});
  const groupName = `ap-deployer-group-${environment}`;
  const userName = process.env.AWS_DEPLOYER_USER || 'ap-deployer';

  logger.info(`Setting up deployer group ${groupName} for user ${userName}...`);

  try {
    // Try to create the group first
    try {
      logger.info(`Creating group ${groupName}...`);
      await iamClient.send(new CreateGroupCommand({ GroupName: groupName }));
      logger.info(`Created group: ${groupName}`);
    } catch (err) {
      assertError(err);
      if (err.name !== 'EntityAlreadyExists') {
        throw err;
      }
      logger.info(`Group ${groupName} already exists`);
    }

    // Wait for group to be available
    logger.info(`Waiting for group ${groupName} to be available...`);
    const groupAvailable = await waitForGroup(iamClient, groupName);
    if (!groupAvailable) {
      throw new Error(`Group ${groupName} was not available after creation`);
    }

    // Attach required policies
    const policyArn = 'arn:aws:iam::aws:policy/AdministratorAccess';
    logger.info(`Attaching policy ${policyArn} to group ${groupName}...`);
    await iamClient.send(
      new AttachGroupPolicyCommand({
        GroupName: groupName,
        PolicyArn: policyArn,
      }),
    );
    logger.info(`Attached policy ${policyArn} to ${groupName}`);

    // Add user to group
    logger.info(`Adding user ${userName} to group ${groupName}...`);
    await iamClient.send(
      new AddUserToGroupCommand({
        GroupName: groupName,
        UserName: userName,
      }),
    );
    logger.info(`Added user ${userName} to group ${groupName}`);

    logger.info('✓ Successfully set up deployer group');
    process.exit(0);
  } catch (error) {
    assertError(error);
    logger.error('Failed to set up deployer group:', error);
    process.exit(1);
  }
}

const environment = process.env.AWS_DEPLOYMENT_STACK_ENV || process.env.VERCEL_ENV || 'development';
logger.info(`Starting setup for environment: ${environment}`);
void setupDeployerGroup(environment);
