#!/usr/bin/env node
import { DescribeClustersCommand, MemoryDBClient } from '@aws-sdk/client-memorydb';
import { DescribeDBInstancesCommand, RDSClient } from '@aws-sdk/client-rds';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { config } from 'dotenv';

import { getConfig } from '../config/factory';

// Load environment variables
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

async function main() {
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error('AWS credentials not found in environment variables');
  }

  const awsConfig = getConfig();
  const { region } = awsConfig.stack;
  const clientConfig = { region, credentials };

  // Get RDS endpoint
  const rdsClient = new RDSClient(clientConfig);
  const rdsResponse = await rdsClient.send(
    new DescribeDBInstancesCommand({
      DBInstanceIdentifier: awsConfig.resources.rds.instanceIdentifier,
    }),
  );
  const dbEndpoint = rdsResponse.DBInstances?.[0]?.Endpoint;
  if (!dbEndpoint?.Address || !dbEndpoint.Port) {
    throw new Error('RDS endpoint information is incomplete');
  }

  // Get DB password
  const secretsClient = new SecretsManagerClient(clientConfig);
  const secretResponse = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: `${awsConfig.resources.secretsManager.dbSecretPrefix}-db-password`,
    }),
  );
  const dbPassword = secretResponse.SecretString;
  if (!dbPassword) {
    throw new Error('Failed to retrieve database password');
  }

  // Get MemoryDB endpoint
  const memoryDbClient = new MemoryDBClient(clientConfig);
  const memoryDbResponse = await memoryDbClient.send(
    new DescribeClustersCommand({
      ClusterName: awsConfig.resources.memoryDb.clusterName,
    }),
  );
  const clusterEndpoint = memoryDbResponse.Clusters?.[0]?.ClusterEndpoint;
  if (!clusterEndpoint?.Address || !clusterEndpoint.Port) {
    throw new Error('MemoryDB endpoint information is incomplete');
  }

  // Generate environment variables
  const envVars = [
    `# AWS Configuration for ${awsConfig.stack.environment} environment`,
    `# Generated on ${new Date().toISOString()}`,
    '',
    `AWS_REGION="${region}"`,
    `AWS_ACCESS_KEY_ID="${credentials.accessKeyId}"`,
    `AWS_SECRET_ACCESS_KEY="${credentials.secretAccessKey}"`,
    `DATABASE_URL="postgresql://${awsConfig.resources.rds.username}:${dbPassword}@${dbEndpoint.Address}:${dbEndpoint.Port}/${awsConfig.resources.rds.dbName}"`,
    `REDIS_URL="redis://${clusterEndpoint.Address}:${clusterEndpoint.Port}"`,
    `S3_BUCKET="${awsConfig.resources.s3.bucketPrefix}-${awsConfig.stack.environment}"`,
    `NEXT_PUBLIC_S3_UPLOAD_BUCKET="${awsConfig.resources.s3.bucketPrefix}-${awsConfig.stack.environment}"`,
  ];

  // Output to stdout
  console.log(envVars.join('\n'));
}

main().catch((error) => {
  console.error('Failed to generate environment variables:', error);
  process.exit(1);
});
