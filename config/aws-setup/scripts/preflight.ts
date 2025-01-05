#!/usr/bin/env node
import { config } from 'dotenv';

import { createLogger } from '@/utils/logger';

import { getConfig } from '../config/factory';
import { validateResources } from '../config/validate';
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { MemoryDBClient, DescribeClustersCommand } from '@aws-sdk/client-memorydb';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { AWSConfig } from 'config/aws-setup/config/types';

const logger = createLogger('preflight');

// Load environment variables
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

async function checkExistingResources(config: AWSConfig) {
  const existingResources = {
    rds: false,
    memorydb: false,
    s3: false,
  };

  logger.info('🔍 Checking RDS instance...');
  try {
    const rdsClient = new RDSClient({ region: config.stack.region });
    const rdsResponse = await rdsClient.send(
      new DescribeDBInstancesCommand({
        DBInstanceIdentifier: config.resources.rds.instanceIdentifier,
      }),
    );
    existingResources.rds = (rdsResponse.DBInstances?.length ?? 0) > 0;
    logger.info(`✅ RDS instance ${existingResources.rds ? 'found' : 'not found'}`);
    if (existingResources.rds && rdsResponse.DBInstances?.[0]) {
      logger.info(`  Status: ${rdsResponse.DBInstances[0].DBInstanceStatus}`);
      logger.info(`  Endpoint: ${rdsResponse.DBInstances[0].Endpoint?.Address}`);
    }
  } catch (error) {
    logger.error(
      '❌ Error checking RDS:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }

  logger.info('\n🔍 Checking MemoryDB cluster...');
  try {
    const memoryDbClient = new MemoryDBClient({ region: config.stack.region });
    const memoryDbResponse = await memoryDbClient.send(
      new DescribeClustersCommand({
        ClusterName: config.resources.memoryDb.clusterName,
      }),
    );
    existingResources.memorydb = (memoryDbResponse.Clusters?.length ?? 0) > 0;
    logger.info(`✅ MemoryDB cluster ${existingResources.memorydb ? 'found' : 'not found'}`);
    if (existingResources.memorydb && memoryDbResponse.Clusters?.[0]) {
      logger.info(`  Status: ${memoryDbResponse.Clusters[0].Status}`);
      logger.info(`  Endpoint: ${memoryDbResponse.Clusters[0].ClusterEndpoint?.Address}`);
    }
  } catch (error) {
    logger.error(
      '❌ Error checking MemoryDB:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  }

  logger.info('\n🔍 Checking S3 bucket...');
  try {
    const s3Client = new S3Client({ region: config.stack.region });
    const bucketName = `${config.resources.s3.bucketPrefix}-${config.stack.environment}`;
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    existingResources.s3 = true;
    logger.info(`✅ S3 bucket '${bucketName}' found`);
  } catch (error) {
    logger.error('❌ Error checking S3:', error instanceof Error ? error.message : 'Unknown error');
  }

  return existingResources;
}

async function main() {
  logger.info('🚀 Starting preflight checks...\n');

  // Log environment state
  logger.info('📋 Environment variables:');
  logger.info('  AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
  logger.info(
    '  AWS_SECRET_ACCESS_KEY:',
    process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set',
  );
  logger.info('  AWS_REGION:', process.env.AWS_REGION || 'us-east-1 (default)');
  logger.info(
    '  AWS_DEPLOYMENT_STACK_ENV:',
    process.env.AWS_DEPLOYMENT_STACK_ENV || 'development (default)',
  );
  logger.info('  NODE_ENV:', process.env.NODE_ENV || 'not set');
  logger.info('');

  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    logger.error('❌ AWS credentials not found in environment variables');
    logger.error(
      'Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in Vercel environment variables',
    );
    process.exit(1);
  }

  const awsConfig = getConfig();
  logger.info('⚙️ AWS Configuration:');
  logger.info(`  Environment: ${awsConfig.stack.environment}`);
  logger.info(`  Region: ${awsConfig.stack.region}`);
  logger.info('');

  logger.info('🔍 Checking existing resources...');
  const existingResources = await checkExistingResources(awsConfig);
  logger.info('\n📊 Resource existence summary:', existingResources);

  try {
    logger.info('\n🔍 Validating resource configuration...');
    const validation = await validateResources(awsConfig, credentials);

    if (!validation.isValid) {
      logger.error('\n❌ Preflight validation failed:');
      validation.errors.forEach((error) => logger.error(`  - ${error}`));
      logger.error('\n📊 Resource Status:');
      Object.entries(validation.resources).forEach(([resource, exists]) => {
        logger.error(`  - ${resource}: ${exists ? '✅' : '❌'}`);
      });
      process.exit(1);
    }

    logger.info('\n✅ All resources validated successfully:');
    Object.entries(validation.resources).forEach(([resource, exists]) => {
      logger.info(`  - ${resource}: ${exists ? '✅' : '❌'}`);
    });
  } catch (error) {
    logger.error('\n❌ Preflight validation failed with error:');
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('\n❌ Failed to run preflight checks:');
  logger.error(error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
