/* eslint-disable no-console */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IAM } from '@aws-sdk/client-iam';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { spawn } from 'child_process';
import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

// Define required permissions that will be used in both create-deployer.ts and cdk.ts
const requiredPermissions = [
  // Self-inspection permissions
  'iam:GetUser',
  'iam:ListUserPolicies',
  'iam:GetUserPolicy',
  'iam:ListAttachedUserPolicies',
  'iam:PassRole',
  'iam:GetRole',
  'iam:ListRoles',
  // CloudFormation for stack management
  'cloudformation:*',
  // Network resources
  'ec2:*',
  'vpc:*',
  'elasticloadbalancing:*',
  // Database resources
  'rds:*',
  'elasticache:*',
  'memorydb:*',
  // Storage and encryption
  's3:*',
  'kms:*',
  // Monitoring and logging
  'logs:*',
  'cloudwatch:*',
  // Security and secrets
  'secretsmanager:*',
  'acm:*',
  // DNS management
  'route53:*',
  // Container services
  'ecs:*',
  'ecr:*',
  // Parameter store
  'ssm:*',
];

function execVercel(args: string[], inputFile?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('vercel', args);

    if (inputFile) {
      const readStream = createReadStream(inputFile);
      readStream.pipe(proc.stdin);
    }

    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`vercel command failed with code ${code}`));
      }
    });
  });
}

async function addToVercel(accessKeyId: string, secretAccessKey: string, env: string) {
  try {
    const tmpDir = tmpdir();
    const keyIdFile = join(tmpDir, 'aws-key-id');
    const secretFile = join(tmpDir, 'aws-secret');
    const regionFile = join(tmpDir, 'aws-region');

    await writeFile(keyIdFile, accessKeyId);
    await writeFile(secretFile, secretAccessKey);
    await writeFile(regionFile, 'us-east-1');

    await execVercel(['env', 'add', 'AWS_ACCESS_KEY_ID', env, '--force'], keyIdFile);
    await execVercel(
      ['env', 'add', 'AWS_SECRET_ACCESS_KEY', env, '--force', '--sensitive'],
      secretFile,
    );
    await execVercel(['env', 'add', 'AWS_REGION', env, '--force'], regionFile);

    console.log(`✅ AWS credentials added to Vercel ${env} environment`);
  } catch (error) {
    console.error('Error adding credentials to Vercel:', error);
    throw error;
  }
}

async function createDeployerUser() {
  const iam = new IAM({
    credentials: fromIni({ profile: 'default' }),
    region: 'us-east-1',
  });

  const username = 'apadana-deployer';
  const shouldAddToVercel = process.argv.includes('--add-to-vercel');
  const targetEnv =
    process.argv.find((arg) => arg.startsWith('--env='))?.split('=')[1] || 'preview';

  try {
    // Check if user exists
    try {
      await iam.getUser({ UserName: username });
      console.log(`User ${username} already exists, updating policies...`);
    } catch (error: any) {
      if (error.name === 'NoSuchEntityException') {
        // Create user if doesn't exist
        await iam.createUser({ UserName: username });
        console.log(`Created IAM user: ${username}`);
      } else {
        throw error;
      }
    }

    // List and delete existing access keys
    const { AccessKeyMetadata } = await iam.listAccessKeys({ UserName: username });
    if (AccessKeyMetadata && AccessKeyMetadata.length > 0) {
      console.log(`Found ${AccessKeyMetadata.length} existing access keys, deleting...`);
      for (const key of AccessKeyMetadata) {
        if (key.AccessKeyId) {
          await iam.deleteAccessKey({
            UserName: username,
            AccessKeyId: key.AccessKeyId,
          });
          console.log(`Deleted access key: ${key.AccessKeyId}`);
        }
      }
    }

    // Create new access key
    const { AccessKey } = await iam.createAccessKey({ UserName: username });
    if (!AccessKey || !AccessKey.AccessKeyId || !AccessKey.SecretAccessKey) {
      throw new Error('Failed to create access key or missing required properties');
    }

    // Output credentials immediately in .env format
    console.log('\n# AWS Credentials for Vercel Deployment');
    console.log('# Save these in your Vercel environment variables');
    console.log('# ----------------------------------------');
    console.log(`AWS_ACCESS_KEY_ID=${AccessKey.AccessKeyId}`);
    console.log(`AWS_SECRET_ACCESS_KEY=${AccessKey.SecretAccessKey}`);
    console.log('AWS_REGION=us-east-1\n');

    // Add to Vercel if flag is present
    if (shouldAddToVercel) {
      await addToVercel(AccessKey.AccessKeyId, AccessKey.SecretAccessKey, targetEnv);
    }

    // Attach inline policy to user
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: requiredPermissions,
          Resource: '*',
        },
      ],
    };

    // Delete existing policy if any
    try {
      await iam.deleteUserPolicy({
        UserName: username,
        PolicyName: 'ApadanaDeployerInlinePolicy',
      });
    } catch {
      // Ignore if policy doesn't exist
    }

    // Attach new policy
    await iam.putUserPolicy({
      UserName: username,
      PolicyName: 'ApadanaDeployerInlinePolicy',
      PolicyDocument: JSON.stringify(policyDocument),
    });

    console.log('✅ Deployer user updated successfully with required permissions');
  } catch (error) {
    console.error('Error managing deployer:', error);
    process.exit(1);
  }
}

createDeployerUser().catch(console.error);
