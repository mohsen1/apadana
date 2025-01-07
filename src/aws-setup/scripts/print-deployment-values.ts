import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename, 'debug');

(async () => {
  const env = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
  const stackNames = [
    `ap-elasticache-${env}`,
    `ap-rds-${env}`,
    `ap-s3-${env}`,
    `ap-cloudfront-${env}`,
    `ap-redis-proxy-${env}`,
  ];

  logger.info(`Fetching outputs for environment: ${env}`);

  const cfClient = new CloudFormationClient({});
  const secretsClient = new SecretsManagerClient({});

  let redisUrl = '';
  let dbUrl = '';
  let s3Bucket = '';
  let cloudfrontDomain = '';

  for (const stackName of stackNames) {
    try {
      logger.debug(`Describing stack: ${stackName}`);
      const res = await cfClient.send(new DescribeStacksCommand({ StackName: stackName }));
      const outputs = res.Stacks?.[0]?.Outputs || [];

      for (const out of outputs) {
        const key = out.OutputKey;
        const val = out.OutputValue;

        // Check for Redis Proxy
        if (key === 'RedisProxyEndpoint' && val) {
          redisUrl = `rediss://${val}:6379`;
          logger.debug('Found Redis proxy endpoint');
        }

        // Check for Redis (fallback to direct endpoint if proxy not available)
        if (key === 'RedisEndpoint' && val && !redisUrl) {
          redisUrl = `rediss://${val}:6379`;
          logger.debug('Found Redis endpoint');
        }

        // Check for RDS
        if (key === 'RdsEndpoint' && val) {
          const host = val;
          const secretKey = outputs.find((o) => o.OutputKey === 'RdsSecretName')?.OutputValue || '';
          if (secretKey) {
            logger.debug('Found RDS secret, fetching credentials');
            const secretRes = await secretsClient.send(
              new GetSecretValueCommand({ SecretId: secretKey }),
            );
            if (secretRes.SecretString) {
              const secretJson = JSON.parse(secretRes.SecretString) as {
                username: string;
                password: string;
              };
              const username = secretJson.username;
              const password = secretJson.password;
              dbUrl = `postgresql://${username}:${password}@${host}:5432/ap_db`;
              logger.debug('Built RDS connection string');
            }
          }
        }

        // Check for S3
        if (key === 'BucketName' && val) {
          s3Bucket = val;
          logger.debug('Found S3 bucket name');
        }

        // Check for CloudFront
        if (key === 'DistributionDomain' && val) {
          cloudfrontDomain = val;
          logger.debug('Found CloudFront distribution domain');
        }
      }
    } catch (err) {
      logger.error(`Error describing stack ${stackName}:`, err);
    }
  }

  const fileContent = [
    `REDIS_URL=${redisUrl}`,
    `DATABASE_URL=${dbUrl}`,
    `AWS_S3_BUCKET_NAME=${s3Bucket}`,
    `NEXT_PUBLIC_AWS_S3_BUCKET_NAME=${s3Bucket}`,
    `NEXT_PUBLIC_AWS_REGION=${process.env.AWS_REGION}`,
    `NEXT_PUBLIC_CLOUDFRONT_DOMAIN=${cloudfrontDomain}`,
  ];

  const tempFilePath = path.join(os.tmpdir(), `deployment-values.env`);
  fs.writeFileSync(tempFilePath, fileContent.join('\n'));

  logger.info(`Deployment values written to ${tempFilePath}`);
})();
