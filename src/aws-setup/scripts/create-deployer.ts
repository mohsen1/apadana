import {
  CreateAccessKeyCommand,
  CreateUserCommand,
  DeleteAccessKeyCommand,
  IAMClient,
  ListAccessKeysCommand,
} from '@aws-sdk/client-iam';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(import.meta.filename);
// logger.disable(); // Disable logging to have a clean output. For debugging, enable it.

async function setupDeployerGroup(environment: string) {
  const scriptPath = join(import.meta.dirname, 'setup-deployer-group.ts');
  const tsxPath = join(process.cwd(), 'node_modules', '.bin', 'tsx');

  return new Promise<void>((resolve, reject) => {
    const child = spawn(tsxPath, [scriptPath], {
      env: { ...process.env, AWS_DEPLOYMENT_STACK_ENV: environment },
      stdio: 'inherit',
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

async function addToVercel(accessKeyId: string, secretAccessKey: string, environment: string) {
  const tempKeyFile = join(import.meta.dirname, '.temp-key.txt');
  const tempSecretFile = join(import.meta.dirname, '.temp-secret.txt');

  try {
    // Create temp files with credentials
    await writeFile(tempKeyFile, accessKeyId);
    await writeFile(tempSecretFile, secretAccessKey);

    // Remove existing env vars if they exist
    logger.info('Removing existing AWS credentials from Vercel...');
    await new Promise<void>((resolve) => {
      const rm1 = spawn('vercel', ['env', 'rm', 'AWS_ACCESS_KEY_ID', environment, '--yes'], {
        stdio: 'inherit',
      });
      rm1.on('close', () => {
        const rm2 = spawn('vercel', ['env', 'rm', 'AWS_SECRET_ACCESS_KEY', environment, '--yes'], {
          stdio: 'inherit',
        });
        rm2.on('close', resolve);
      });
    });

    // Add new env vars using file redirection
    logger.info('Adding AWS credentials to Vercel...');
    await new Promise<void>((resolve, reject) => {
      const add1 = spawn(
        'sh',
        ['-c', `vercel env add AWS_ACCESS_KEY_ID ${environment} < ${tempKeyFile}`],
        {
          stdio: 'inherit',
        },
      );

      add1.on('close', (code1) => {
        if (code1 !== 0) {
          reject(new Error('Failed to add AWS_ACCESS_KEY_ID'));
          return;
        }

        const add2 = spawn(
          'sh',
          ['-c', `vercel env add AWS_SECRET_ACCESS_KEY ${environment} < ${tempSecretFile}`],
          {
            stdio: 'inherit',
          },
        );

        add2.on('close', (code2) => {
          if (code2 !== 0) {
            reject(new Error('Failed to add AWS_SECRET_ACCESS_KEY'));
            return;
          }
          resolve();
        });
      });
    });
  } finally {
    // Clean up temp files
    await Promise.all([
      unlink(tempKeyFile).catch(() => {}),
      unlink(tempSecretFile).catch(() => {}),
    ]);
  }
}

async function deleteExistingAccessKeys(iamClient: IAMClient, userName: string) {
  logger.info('Checking for existing access keys...');
  const { AccessKeyMetadata } = await iamClient.send(
    new ListAccessKeysCommand({ UserName: userName }),
  );

  if (!AccessKeyMetadata?.length) {
    logger.info('No existing access keys found');
    return;
  }

  logger.info(`Found ${AccessKeyMetadata.length} existing access keys, deleting...`);
  for (const key of AccessKeyMetadata) {
    if (!key.AccessKeyId) continue;
    logger.info(`Deleting access key: ${key.AccessKeyId}`);
    await iamClient.send(
      new DeleteAccessKeyCommand({
        UserName: userName,
        AccessKeyId: key.AccessKeyId,
      }),
    );
  }
  logger.info('Successfully deleted all existing access keys');
}

async function writeAwsProfile(accessKeyId: string, secretAccessKey: string, environment: string) {
  const awsDir = join(homedir(), '.aws');
  const credentialsFile = join(awsDir, 'credentials');

  // Create .aws directory if it doesn't exist
  if (!existsSync(awsDir)) {
    await mkdir(awsDir, { recursive: true });
  }

  const profileName = `ap-deployer-${environment}`;
  const newProfileContent = `[${profileName}]
aws_access_key_id = ${accessKeyId}
aws_secret_access_key = ${secretAccessKey}`;

  try {
    // Read existing credentials file if it exists
    let existingContent = '';
    try {
      existingContent = await readFile(credentialsFile, 'utf8');
    } catch {
      // File doesn't exist yet, that's fine
    }

    // Parse existing profiles
    const profiles = existingContent.split(/\n\s*\n/);
    const updatedProfiles = [];
    let profileUpdated = false;

    // Update or keep each profile
    for (const profile of profiles) {
      if (profile.trim().startsWith(`[${profileName}]`)) {
        updatedProfiles.push(newProfileContent);
        profileUpdated = true;
      } else if (profile.trim()) {
        updatedProfiles.push(profile);
      }
    }

    // If profile wasn't found, add it
    if (!profileUpdated) {
      updatedProfiles.push(newProfileContent);
    }

    // Write back the updated content
    await writeFile(credentialsFile, updatedProfiles.join('\n\n') + '\n');
    logger.info(`✓ ${profileUpdated ? 'Updated' : 'Added'} AWS profile: ${profileName}`);
  } catch (error) {
    assertError(error);
    logger.error('Failed to write AWS credentials:', error);
    throw error;
  }
}

async function createDeployer(environment: string, addToVercelEnv = false) {
  const iamClient = new IAMClient({});
  const userName = process.env.AWS_DEPLOYER_USER || 'ap-deployer';

  logger.info(`Creating deployer user ${userName}...`);

  try {
    // Create user if it doesn't exist
    try {
      await iamClient.send(new CreateUserCommand({ UserName: userName }));
      logger.info(`Created user: ${userName}`);
    } catch (err) {
      assertError(err);
      if (err.name === 'EntityAlreadyExistsException') {
        logger.info(`User ${userName} already exists`);
      } else {
        throw err;
      }
    }

    // Set up group and attach policies
    await setupDeployerGroup(environment);

    // Delete existing access keys
    await deleteExistingAccessKeys(iamClient, userName);

    // Create new access key
    const { AccessKey } = await iamClient.send(new CreateAccessKeyCommand({ UserName: userName }));

    if (!AccessKey?.AccessKeyId || !AccessKey?.SecretAccessKey) {
      throw new Error('Failed to create access key');
    }

    logger.info('Created access key:');
    logger.info(`Access Key ID: ${AccessKey.AccessKeyId}`);
    logger.info(`Secret Access Key: ${AccessKey.SecretAccessKey}`);

    // Write AWS profile
    await writeAwsProfile(AccessKey.AccessKeyId, AccessKey.SecretAccessKey, environment);

    if (addToVercelEnv) {
      await addToVercel(AccessKey.AccessKeyId, AccessKey.SecretAccessKey, environment);
      logger.info('✓ Successfully added AWS credentials to Vercel environment');
    }

    logger.info('✓ Successfully created deployer');
    process.exit(0);
  } catch (error) {
    assertError(error);
    logger.error('Failed to create deployer:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const addToVercelFlag = args.includes('--add-to-vercel');
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

logger.info(`Starting setup for environment: ${environment}`);
void createDeployer(environment, addToVercelFlag);
