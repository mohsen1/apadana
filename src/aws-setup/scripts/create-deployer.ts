import {
  AttachUserPolicyCommand,
  CreateAccessKeyCommand,
  CreateUserCommand,
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

(async () => {
  const iamClient = new IAMClient({});

  const userName = process.env.AWS_DEPLOYER_USER || 'ap-deployer';
  try {
    await iamClient.send(new CreateUserCommand({ UserName: userName }));
    logger.info(`Created user: ${userName}`);
  } catch (err) {
    assertError(err);
    if (err.name === 'EntityAlreadyExists') {
      logger.info(`User ${userName} already exists, continuing...`);
    } else {
      throw err;
    }
  }

  const policyArn = 'arn:aws:iam::aws:policy/AdministratorAccess';
  await iamClient.send(
    new AttachUserPolicyCommand({
      PolicyArn: policyArn,
      UserName: userName,
    }),
  );
  logger.info(`Attached policy ${policyArn} to ${userName}`);

  const accessKey = await iamClient.send(new CreateAccessKeyCommand({ UserName: userName }));
  if (!accessKey.AccessKey?.AccessKeyId || !accessKey.AccessKey?.SecretAccessKey) {
    throw new Error('Failed to create access key');
  }

  printEnv(accessKey.AccessKey.AccessKeyId, accessKey.AccessKey.SecretAccessKey);
})();
