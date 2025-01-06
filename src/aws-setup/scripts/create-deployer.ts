import {
  AttachUserPolicyCommand,
  CreateAccessKeyCommand,
  CreateUserCommand,
  GetUserCommand,
  IAMClient,
} from '@aws-sdk/client-iam';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

function printEnv(accessKeyId: string, secretAccessKey: string) {
  const envContent = [
    `AWS_ACCESS_KEY_ID=${accessKeyId}`,
    `AWS_SECRET_ACCESS_KEY=${secretAccessKey}`,
    `AWS_REGION=${process.env.AWS_REGION || 'us-east-1'}`,
  ].join('\n');

  process.stdout.write(envContent);
}

async function getOrCreateUser(iamClient: IAMClient, userName: string) {
  try {
    // Try to get existing user first
    await iamClient.send(new GetUserCommand({ UserName: userName }));
    logger.info(`User ${userName} already exists, continuing...`);
  } catch (err) {
    assertError(err);
    if (err.name === 'NoSuchEntity') {
      // User doesn't exist, create it
      await iamClient.send(new CreateUserCommand({ UserName: userName }));
      logger.info(`Created user: ${userName}`);
    } else {
      throw err;
    }
  }

  // Ensure policy is attached
  const policyArn = 'arn:aws:iam::aws:policy/AdministratorAccess';
  await iamClient.send(
    new AttachUserPolicyCommand({
      PolicyArn: policyArn,
      UserName: userName,
    }),
  );
  logger.info(`Attached policy ${policyArn} to ${userName}`);

  // Create new access key
  const accessKey = await iamClient.send(new CreateAccessKeyCommand({ UserName: userName }));
  if (!accessKey.AccessKey?.AccessKeyId || !accessKey.AccessKey?.SecretAccessKey) {
    throw new Error('Failed to create access key');
  }

  return accessKey.AccessKey;
}

(async () => {
  try {
    const iamClient = new IAMClient({});
    const userName = process.env.AWS_DEPLOYER_USER || 'ap-deployer';

    const accessKey = await getOrCreateUser(iamClient, userName);
    if (!accessKey.AccessKeyId || !accessKey.SecretAccessKey) {
      throw new Error('Failed to get access key details');
    }
    printEnv(accessKey.AccessKeyId, accessKey.SecretAccessKey);
  } catch (error) {
    assertError(error);
    logger.error('Failed to create/get deployer:', error);
    process.exit(1);
  }
})();
