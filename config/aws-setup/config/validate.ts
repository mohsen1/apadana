import { DescribeClustersCommand, MemoryDBClient } from '@aws-sdk/client-memorydb';
import { DescribeDBInstancesCommand, RDSClient } from '@aws-sdk/client-rds';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

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
    await rdsClient.send(
      new DescribeDBInstancesCommand({
        DBInstanceIdentifier: config.resources.rds.instanceIdentifier,
      }),
    );
    result.resources.rds = true;
  } catch (error) {
    result.resources.rds = false;
    result.errors.push(
      `RDS instance '${config.resources.rds.instanceIdentifier}' not found or not ready`,
    );
  }

  // Check MemoryDB
  try {
    const memoryDbClient = new MemoryDBClient(clientConfig);
    await memoryDbClient.send(
      new DescribeClustersCommand({
        ClusterName: config.resources.memoryDb.clusterName,
      }),
    );
    result.resources.memoryDb = true;
  } catch (error) {
    result.resources.memoryDb = false;
    result.errors.push(
      `MemoryDB cluster '${config.resources.memoryDb.clusterName}' not found or not ready`,
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
