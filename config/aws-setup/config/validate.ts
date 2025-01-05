import { DescribeClustersCommand, MemoryDBClient } from '@aws-sdk/client-memorydb';
import {
  DescribeDBInstancesCommand,
  RDSClient,
  waitUntilDBInstanceAvailable,
} from '@aws-sdk/client-rds';
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

import { createLogger } from '@/utils/logger';

import { AWSConfig } from './types';

const logger = createLogger('validate');

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  resources: {
    rds?: boolean;
    memoryDb?: boolean;
    s3?: boolean;
    secrets?: boolean;
  };
}

async function waitForMemoryDbAvailable(
  client: MemoryDBClient,
  clusterName: string,
  maxAttempts = 30,
  delayMs = 10000,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const { Clusters } = await client.send(
      new DescribeClustersCommand({ ClusterName: clusterName }),
    );
    const status = Clusters?.[0]?.Status;
    if (status === 'available') return;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error('Timed out waiting for MemoryDB to become available');
}

async function testPostgresConnection(
  connectionString: string,
): Promise<{ success: boolean; error?: string }> {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: ['error'],
  });

  try {
    await client.$connect();
    const result = await client.$queryRaw`SELECT 1`;
    return { success: Array.isArray(result) && result.length > 0 };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database connection error',
    };
  } finally {
    await client.$disconnect();
  }
}

async function testRedisConnection(url: string): Promise<boolean> {
  const client = createClient({
    url,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: false,
    },
  });

  try {
    await client.connect();
    await client.ping();
    return true;
  } catch {
    return false;
  } finally {
    await client.quit();
  }
}

async function testS3Access(client: S3Client, bucketName: string): Promise<boolean> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return true;
  } catch {
    return false;
  }
}

export async function validateResources(
  config: AWSConfig,
  credentials: { accessKeyId: string; secretAccessKey: string },
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    resources: {},
  };

  const { region } = config.stack;
  const clientConfig = { region, credentials };

  // Run all checks in parallel
  await Promise.all([
    // Check RDS
    (async () => {
      try {
        const rdsClient = new RDSClient(clientConfig);

        // Get RDS instance details first
        const rdsResponse = await rdsClient.send(
          new DescribeDBInstancesCommand({
            DBInstanceIdentifier: config.resources.rds.instanceIdentifier,
          }),
        );

        const instance = rdsResponse.DBInstances?.[0];
        if (!instance) {
          throw new Error('RDS instance not found');
        }

        // Log instance status for debugging
        logger.info(`RDS Status: ${instance.DBInstanceStatus}`);

        // List of valid intermediate states
        const validIntermediateStates = [
          'backing-up',
          'creating',
          'modifying',
          'configuring-enhanced-monitoring',
        ];
        if (validIntermediateStates.includes(instance.DBInstanceStatus || '')) {
          logger.info(
            'RDS instance is in a valid intermediate state, waiting for it to become available...',
          );
          await waitUntilDBInstanceAvailable(
            { client: rdsClient, maxWaitTime: 900 }, // Increase timeout to 15 minutes
            { DBInstanceIdentifier: config.resources.rds.instanceIdentifier },
          );
        } else if (instance.DBInstanceStatus !== 'available') {
          throw new Error(`RDS instance is in an invalid state: ${instance.DBInstanceStatus}`);
        }

        const dbEndpoint = instance.Endpoint;
        if (!dbEndpoint?.Address || !dbEndpoint.Port) {
          throw new Error('RDS endpoint information is incomplete');
        }

        // Get DB password for connection test
        const secretsClient = new SecretsManagerClient(clientConfig);
        const secretResponse = await secretsClient.send(
          new GetSecretValueCommand({
            SecretId: `${config.resources.secretsManager.dbSecretPrefix}-db-password`,
          }),
        );
        const dbPassword = secretResponse.SecretString;
        if (!dbPassword) {
          throw new Error('Failed to retrieve database password');
        }

        // Test database connection with detailed error
        const connectionString = `postgresql://${config.resources.rds.username}:${dbPassword}@${dbEndpoint.Address}:${dbEndpoint.Port}/${config.resources.rds.dbName}`;
        logger.info(`Testing connection to: ${dbEndpoint.Address}:${dbEndpoint.Port}`);

        const connectionTest = await testPostgresConnection(connectionString);
        if (!connectionTest.success) {
          throw new Error(`Database connection failed: ${connectionTest.error}`);
        }

        result.resources.rds = true;
      } catch (error) {
        result.resources.rds = false;
        result.errors.push(
          `RDS instance '${config.resources.rds.instanceIdentifier}': ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    })(),

    // Check MemoryDB
    (async () => {
      try {
        const memoryDbClient = new MemoryDBClient(clientConfig);

        // Wait for MemoryDB cluster to be available
        await waitForMemoryDbAvailable(memoryDbClient, config.resources.memoryDb.clusterName);

        const memoryDbResponse = await memoryDbClient.send(
          new DescribeClustersCommand({
            ClusterName: config.resources.memoryDb.clusterName,
          }),
        );

        const cluster = memoryDbResponse.Clusters?.[0];
        if (!cluster) {
          throw new Error('MemoryDB cluster not found');
        }

        const clusterEndpoint = cluster.ClusterEndpoint;
        if (!clusterEndpoint?.Address || !clusterEndpoint.Port) {
          throw new Error('MemoryDB endpoint information is incomplete');
        }

        // Test Redis connection
        const redisUrl = `redis://${clusterEndpoint.Address}:${clusterEndpoint.Port}`;
        const canConnect = await testRedisConnection(redisUrl);
        if (!canConnect) {
          throw new Error('Cannot establish connection to MemoryDB cluster');
        }
      } catch (error) {
        result.resources.memoryDb = false;
        result.errors.push(
          `MemoryDB cluster '${config.resources.memoryDb.clusterName}': ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    })(),

    // Check S3
    (async () => {
      try {
        const s3Client = new S3Client(clientConfig);
        const bucketName = `${config.resources.s3.bucketPrefix}-${config.stack.environment}`;

        // Test S3 bucket access
        const canAccess = await testS3Access(s3Client, bucketName);
        if (!canAccess) {
          throw new Error(`Cannot access S3 bucket '${bucketName}'`);
        }

        result.resources.s3 = true;
      } catch (error) {
        result.resources.s3 = false;
        result.errors.push(
          `S3 bucket '${config.resources.s3.bucketPrefix}-${config.stack.environment}': ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    })(),

    // Check Secrets
    (async () => {
      try {
        const secretsClient = new SecretsManagerClient(clientConfig);
        const secretName = `${config.resources.secretsManager.dbSecretPrefix}-db-password`;
        await secretsClient.send(new GetSecretValueCommand({ SecretId: secretName }));
        result.resources.secrets = true;
      } catch (error) {
        result.resources.secrets = false;
        result.errors.push(
          `Secret '${config.resources.secretsManager.dbSecretPrefix}-db-password': ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    })(),
  ]);

  result.isValid = result.errors.length === 0;
  return result;
}
