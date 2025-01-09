import {
  CreateAccessKeyCommand,
  CreateUserCommand,
  DeleteAccessKeyCommand,
  GetUserCommand,
  IAMClient,
  ListAccessKeysCommand,
} from '@aws-sdk/client-iam';
import { spawn } from 'child_process';
import { join } from 'path';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

function printEnv(accessKeyId: string, secretAccessKey: string) {
  const region = process.env.AWS_REGION || 'us-east-1';

  const envContent = [
    `AWS_ACCESS_KEY_ID=${accessKeyId}`,
    `AWS_SECRET_ACCESS_KEY=${secretAccessKey}`,
    `AWS_REGION=${region}`,
  ].join('\n');

  process.stdout.write(envContent);
}

async function deleteExistingAccessKeys(iamClient: IAMClient, userName: string) {
  const existingKeys = await iamClient.send(new ListAccessKeysCommand({ UserName: userName }));

  for (const key of existingKeys.AccessKeyMetadata || []) {
    if (!key.AccessKeyId) continue;

    logger.info(`Deleting existing access key: ${key.AccessKeyId}`);
    await iamClient.send(
      new DeleteAccessKeyCommand({
        UserName: userName,
        AccessKeyId: key.AccessKeyId,
      }),
    );
  }
}

async function setupDeployerGroup() {
  return new Promise<void>((resolve, reject) => {
    const scriptPath = join(__dirname, 'setup-deployer-group.ts');
    logger.info(`Running setup-deployer-group.ts at ${scriptPath}`);
    const child = spawn('tsx', [scriptPath], {
      stdio: 'inherit',
      env: {
        ...process.env,
        AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE: '1',
      },
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`setup-deployer-group.ts exited with code ${code}`));
      }
    });
  });
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

  // Delete existing access keys
  await deleteExistingAccessKeys(iamClient, userName);

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

    logger.info('Starting deployer setup...');
    const accessKey = await getOrCreateUser(iamClient, userName);
    if (!accessKey.AccessKeyId || !accessKey.SecretAccessKey) {
      throw new Error('Failed to get access key details');
    }

    // Set up the deployer group after creating the user
    logger.info('Setting up deployer group...');
    await setupDeployerGroup();

    printEnv(accessKey.AccessKeyId, accessKey.SecretAccessKey);
  } catch (error) {
    assertError(error);
    logger.error('Failed to create/get deployer:', error);
    process.exit(1);
  }
})();
