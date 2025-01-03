import { DescribeClustersCommand, MemoryDBClient } from '@aws-sdk/client-memorydb';
import { DescribeDBInstancesCommand, RDSClient } from '@aws-sdk/client-rds';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

import { AWSConfig } from './types';

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

async function testPostgresConnection(connectionString: string): Promise<boolean> {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });
  try {
    await client.$connect();
    const result = await client.$queryRaw`SELECT 1`;
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    return false;
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
  } catch (error) {
    return false;
  } finally {
    await client.quit();
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

  // Check RDS
  try {
    const rdsClient = new RDSClient(clientConfig);
    const rdsResponse = await rdsClient.send(
      new DescribeDBInstancesCommand({
        DBInstanceIdentifier: config.resources.rds.instanceIdentifier,
      }),
    );

    const instance = rdsResponse.DBInstances?.[0];
    if (!instance) {
      throw new Error('RDS instance not found');
    }

    // Check instance status
    if (instance.DBInstanceStatus !== 'available') {
      throw new Error(`RDS instance status is ${instance.DBInstanceStatus}`);
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

    // Test database connection
    const connectionString = `postgresql://${config.resources.rds.username}:${dbPassword}@${dbEndpoint.Address}:${dbEndpoint.Port}/${config.resources.rds.dbName}`;
    const canConnect = await testPostgresConnection(connectionString);
    if (!canConnect) {
      throw new Error('Cannot establish connection to RDS instance');
    }

    result.resources.rds = true;
  } catch (error) {
    result.resources.rds = false;
    result.errors.push(
      `RDS instance '${config.resources.rds.instanceIdentifier}': ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  // Check MemoryDB
  try {
    const memoryDbClient = new MemoryDBClient(clientConfig);
    const memoryDbResponse = await memoryDbClient.send(
      new DescribeClustersCommand({
        ClusterName: config.resources.memoryDb.clusterName,
      }),
    );

    const cluster = memoryDbResponse.Clusters?.[0];
    if (!cluster) {
      throw new Error('MemoryDB cluster not found');
    }

    // Check cluster status
    if (cluster.Status !== 'available') {
      throw new Error(`MemoryDB cluster status is ${cluster.Status}`);
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

    result.resources.memoryDb = true;
  } catch (error) {
    result.resources.memoryDb = false;
    result.errors.push(
      `MemoryDB cluster '${config.resources.memoryDb.clusterName}': ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  // Check S3
  try {
    const s3Client = new S3Client(clientConfig);
    const s3Response = await s3Client.send(new ListBucketsCommand({}));
    const bucketName = `${config.resources.s3.bucketPrefix}-${config.stack.environment}`;
    result.resources.s3 = s3Response.Buckets?.some((bucket) => bucket.Name === bucketName) ?? false;
    if (!result.resources.s3) {
      result.errors.push(`S3 bucket '${bucketName}' not found`);
    }
  } catch (error) {
    result.resources.s3 = false;
    result.errors.push('Error accessing S3');
  }

  // Check Secrets
  try {
    const secretsClient = new SecretsManagerClient(clientConfig);
    const secretName = `${config.resources.secretsManager.dbSecretPrefix}-db-password`;
    await secretsClient.send(new GetSecretValueCommand({ SecretId: secretName }));
    result.resources.secrets = true;
  } catch (error) {
    result.resources.secrets = false;
    result.errors.push(
      `Secret '${config.resources.secretsManager.dbSecretPrefix}-db-password' not found`,
    );
  }

  result.isValid = result.errors.length === 0;
  return result;
}
