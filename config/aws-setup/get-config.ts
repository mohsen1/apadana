#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IAM } from '@aws-sdk/client-iam';
import { DescribeClustersCommand, MemoryDBClient } from '@aws-sdk/client-memorydb';
import { DescribeDBInstancesCommand, RDSClient } from '@aws-sdk/client-rds';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import {
  CreateSecretCommand,
  GetSecretValueCommand,
  ResourceNotFoundException,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { randomBytes } from 'crypto';
import { config } from 'dotenv';

import { assertError } from '@/utils';

// Load environment variables
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

// Get environment from Vercel or fallback to development
const environment = process.env.VERCEL_ENV || 'development';
const region = process.env.AWS_REGION || 'us-east-1';

// AWS clients with explicit credentials
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
};

if (!credentials.accessKeyId || !credentials.secretAccessKey) {
  console.error('AWS credentials not found in environment variables.');
  console.error('Run pnpm aws:deployer:create first and add the credentials to .env.local');
  process.exit(1);
}

// Check required permissions before proceeding
async function checkPermissions() {
  const iam = new IAM({ region, credentials });
  const requiredServices = [
    'rds:*',
    'ec2:*',
    's3:*',
    'elasticache:*',
    'memorydb:*',
    'secretsmanager:*',
    'cloudformation:*',
    'iam:PassRole',
    'iam:GetRole',
    'iam:ListRoles',
    'logs:*',
    'kms:*',
    'route53:*',
    'acm:*',
    'ecs:*',
    'ecr:*',
    'ssm:*',
    'vpc:*',
    'elasticloadbalancing:*',
  ];

  try {
    const { User } = await iam.getUser({});
    if (!User?.Arn) throw new Error('Failed to get user info');

    const { PolicyNames } = await iam.listUserPolicies({ UserName: User.UserName });
    if (!PolicyNames?.includes('ApadanaDeployerInlinePolicy')) {
      console.error('AWS credentials do not have the required inline policy.');
      console.error('Run pnpm aws:deployer:create to create a user with correct permissions.');
      process.exit(1);
    }

    await iam.listAttachedUserPolicies({ UserName: User.UserName });
    const policy = await iam.getUserPolicy({
      UserName: User.UserName,
      PolicyName: 'ApadanaDeployerInlinePolicy',
    });

    if (!policy.PolicyDocument) {
      console.error('Could not verify AWS permissions.');
      console.error('Run pnpm aws:deployer:create to create a user with correct permissions.');
      process.exit(1);
    }

    const policyDoc = JSON.parse(decodeURIComponent(policy.PolicyDocument));
    const hasAllPermissions = requiredServices.every((permission) => {
      return policyDoc.Statement.some(
        (statement: any) => statement.Effect === 'Allow' && statement.Action.includes(permission),
      );
    });

    if (!hasAllPermissions) {
      console.error('AWS credentials do not have all required permissions.');
      console.error('Required permissions:');
      console.error(requiredServices.join('\n'));
      console.error('\nRun pnpm aws:deployer:create to create a user with correct permissions.');
      process.exit(1);
    }
  } catch (error) {
    assertError(error);
    console.error('Failed to verify AWS permissions:', error);
    console.error('Run pnpm aws:deployer:create to create a user with correct permissions.');
    process.exit(1);
  }
}

const rdsClient = new RDSClient({ region, credentials });
const memoryDbClient = new MemoryDBClient({ region, credentials });
const s3Client = new S3Client({ region, credentials });
const secretsClient = new SecretsManagerClient({ region, credentials });

async function getOrCreateDBPassword(): Promise<string> {
  const secretName = `apadana-${environment}-db-password`;

  try {
    // Try to get existing secret
    const response = await secretsClient.send(new GetSecretValueCommand({ SecretId: secretName }));
    return response.SecretString || '';
  } catch (error) {
    assertError(error);
    if (error instanceof ResourceNotFoundException) {
      // Generate a new password if secret doesn't exist
      const password = randomBytes(32)
        .toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '');

      await secretsClient.send(
        new CreateSecretCommand({
          Name: secretName,
          SecretString: password,
          Description: `Database password for Apadana ${environment} environment`,
        }),
      );

      return password;
    }
    throw error;
  }
}

async function getConfigurations() {
  let DATABASE_URL = '';
  let REDIS_URL = '';
  let S3_BUCKET = '';
  let errors: string[] = [];
  let databasePassword = '';

  try {
    // Get or create DB password
    try {
      databasePassword = await getOrCreateDBPassword();
    } catch (error) {
      assertError(error);
      throw new Error(
        'Failed to get/create DB password. Check AWS Secrets Manager access. ' +
          'This is likely due to a permissions issue with the deployer user.',
      );
    }

    // Get RDS endpoint
    try {
      const rdsResponse = await rdsClient.send(
        new DescribeDBInstancesCommand({
          DBInstanceIdentifier: `apadana-${environment}`,
        }),
      );
      const dbEndpoint = rdsResponse.DBInstances?.[0]?.Endpoint;
      if (!dbEndpoint?.Address || !dbEndpoint.Port) {
        throw new Error('RDS endpoint information is incomplete');
      }
      DATABASE_URL = `postgresql://postgres:${databasePassword}@${dbEndpoint.Address}:${dbEndpoint.Port}/apadana`;
    } catch (error) {
      assertError(error);
      errors.push(
        `RDS instance 'apadana-${environment}' not found or not ready. Run 'pnpm cdk:deploy:resources' to create it.`,
      );
    }

    // Get MemoryDB endpoint
    try {
      const memoryDbResponse = await memoryDbClient.send(
        new DescribeClustersCommand({
          ClusterName: `apadana-${environment}`,
        }),
      );
      const clusterEndpoint = memoryDbResponse.Clusters?.[0]?.ClusterEndpoint;
      if (!clusterEndpoint?.Address || !clusterEndpoint.Port) {
        throw new Error('MemoryDB endpoint information is incomplete');
      }
      REDIS_URL = `redis://${clusterEndpoint.Address}:${clusterEndpoint.Port}`;
    } catch (error) {
      assertError(error);
      errors.push(
        `MemoryDB cluster 'apadana-${environment}' not found or not ready. Run 'pnpm cdk:deploy:resources' to create it.`,
      );
    }

    // Get S3 bucket
    try {
      const s3Response = await s3Client.send(new ListBucketsCommand({}));
      S3_BUCKET =
        s3Response.Buckets?.find((bucket) => bucket.Name === `apadana-uploads-${environment}`)
          ?.Name || '';
      if (!S3_BUCKET) {
        errors.push(
          `S3 bucket 'apadana-uploads-${environment}' not found. Run 'pnpm cdk:deploy:resources' to create it.`,
        );
      }
    } catch (error) {
      assertError(error);
      errors.push('Error accessing S3. Check your AWS credentials.');
    }

    if (errors.length > 0) {
      throw new Error('Required AWS resources are not available:\n' + errors.join('\n'));
    }

    // Output in .env format
    const envOutput = [
      `# AWS Configuration for ${environment} environment`,
      `# Generated on ${new Date().toISOString()}`,
      '',
      `AWS_REGION="${region}"`,
      `AWS_ACCESS_KEY_ID="${credentials.accessKeyId}"`,
      `AWS_SECRET_ACCESS_KEY="${credentials.secretAccessKey}"`,
      `DATABASE_URL="${DATABASE_URL}"`,
      `REDIS_URL="${REDIS_URL}"`,
      `S3_BUCKET="${S3_BUCKET}"`,
      `NEXT_PUBLIC_S3_UPLOAD_BUCKET="${S3_BUCKET}"`,
      `NEXT_PUBLIC_S3_UPLOAD_REGION="${region}"`,
      `S3_UPLOAD_KEY="${credentials.accessKeyId}"`,
      `S3_UPLOAD_SECRET="${credentials.secretAccessKey}"`,
      '',
    ].join('\n');

    // Print to stdout
    process.stdout.write(envOutput);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    process.exit(1);
  }
}

async function main() {
  await checkPermissions();
  await getConfigurations();
}

main().catch(console.error);
