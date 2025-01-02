#!/usr/bin/env node
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { MemoryDBClient, DescribeClustersCommand } from '@aws-sdk/client-memorydb';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-secrets-manager';
import { randomBytes } from 'crypto';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Get environment from Vercel or fallback to development
const environment = process.env.VERCEL_ENV || 'development';
const region = process.env.AWS_REGION || 'us-east-1';

const rdsClient = new RDSClient({ region });
const memoryDbClient = new MemoryDBClient({ region });
const s3Client = new S3Client({ region });
const secretsClient = new SecretsManagerClient({ region });

async function getOrCreateDBPassword(): Promise<string> {
  const secretName = `apadana-${environment}-db-password`;

  try {
    // Try to get existing secret
    const response = await secretsClient.send(new GetSecretValueCommand({ SecretId: secretName }));
    return response.SecretString || '';
  } catch (error) {
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
  let DB_PASSWORD = '';
  let warnings: string[] = [];

  try {
    // Get or create DB password
    try {
      DB_PASSWORD = await getOrCreateDBPassword();
    } catch (error) {
      warnings.push('⚠️ Failed to get/create DB password. Check AWS Secrets Manager access.');
    }

    // Get RDS endpoint
    try {
      const rdsResponse = await rdsClient.send(
        new DescribeDBInstancesCommand({
          DBInstanceIdentifier: `apadana-${environment}`,
        }),
      );
      const dbEndpoint = rdsResponse.DBInstances?.[0]?.Endpoint;
      DATABASE_URL = dbEndpoint
        ? `postgresql://postgres:${DB_PASSWORD}@${dbEndpoint.Address}:${dbEndpoint.Port}/apadana`
        : '';
    } catch (error) {
      warnings.push(
        `⚠️ RDS instance 'apadana-${environment}' not found. Run 'pnpm cdk:deploy:resources' to create it.`,
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
      REDIS_URL = clusterEndpoint
        ? `redis://${clusterEndpoint.Address}:${clusterEndpoint.Port}`
        : '';
    } catch (error) {
      warnings.push(
        `⚠️ MemoryDB cluster 'apadana-${environment}' not found. Run 'pnpm cdk:deploy:resources' to create it.`,
      );
    }

    // Get S3 bucket
    try {
      const s3Response = await s3Client.send(new ListBucketsCommand({}));
      S3_BUCKET =
        s3Response.Buckets?.find((bucket) => bucket.Name === `apadana-uploads-${environment}`)
          ?.Name || '';
      if (!S3_BUCKET) {
        warnings.push(
          `⚠️ S3 bucket 'apadana-uploads-${environment}' not found. Run 'pnpm cdk:deploy:resources' to create it.`,
        );
      }
    } catch (error) {
      warnings.push('⚠️ Error accessing S3. Check your AWS credentials.');
    }

    // Output in .env format with warnings
    const envOutput = [
      `# AWS Configuration for ${environment} environment`,
      `# Generated on ${new Date().toISOString()}`,
      '',
      ...warnings.map((w) => `# ${w}`),
      '',
      `AWS_REGION="${region}"`,
      `DATABASE_URL="${DATABASE_URL}"`,
      `DB_PASSWORD="${DB_PASSWORD}"`,
      `REDIS_URL="${REDIS_URL}"`,
      `S3_BUCKET="${S3_BUCKET}"`,
      `NEXT_PUBLIC_S3_UPLOAD_BUCKET="${S3_BUCKET}"`,
      `NEXT_PUBLIC_S3_UPLOAD_REGION="${region}"`,
      `S3_UPLOAD_KEY="${process.env.AWS_ACCESS_KEY_ID || ''}"`,
      `S3_UPLOAD_SECRET="${process.env.AWS_SECRET_ACCESS_KEY || ''}"`,
      '',
    ].join('\n');

    // Print to stdout
    process.stdout.write(envOutput);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    process.exit(1);
  }
}

getConfigurations();
