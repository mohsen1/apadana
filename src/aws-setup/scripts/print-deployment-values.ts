import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import fs from 'fs';

import { createLogger } from '@/utils/logger';

const logger = createLogger(import.meta.filename, 'debug');

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
  const awsRegion = process.env.AWS_REGION?.trim() || '';

  logger.info(`Using AWS region: ${awsRegion}`);

  for (const stackName of stackNames) {
    try {
      logger.info(`Processing stack: ${stackName}`);
      const res = await cfClient.send(new DescribeStacksCommand({ StackName: stackName }));
      const outputs = res.Stacks?.[0]?.Outputs || [];

      for (const out of outputs) {
        const key = out.OutputKey;
        const val = out.OutputValue;

        // Check for Redis Proxy
        if (key === 'RedisProxyEndpoint' && val) {
          redisUrl = `rediss://${val}:6379`;
          logger.info('Found Redis proxy endpoint');
        }

        // Check for Redis (fallback to direct endpoint if proxy not available)
        if (key === 'RedisEndpoint' && val && !redisUrl) {
          redisUrl = `rediss://${val}:6379`;
          logger.info('Found Redis endpoint');
        }

        // Check for RDS
        if (key === 'RdsEndpoint' && val) {
          const host = val;
          const secretKey = outputs.find((o) => o.OutputKey === 'RdsSecretName')?.OutputValue || '';
          if (secretKey) {
            logger.info('Found RDS secret, fetching credentials');
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
              logger.info('Built RDS connection string');
            }
          }
        }

        // Check for S3
        if (key === 'BucketName' && val) {
          s3Bucket = val;
          logger.info('Found S3 bucket name');
        }

        // Check for CloudFront
        if (key === 'DistributionDomain' && val) {
          cloudfrontDomain = val;
          logger.info('Found CloudFront distribution domain');
        }
      }
    } catch (err) {
      logger.error(`Error processing stack ${stackName}`);
    }
  }

  const fileContent = [
    `REDIS_URL=${redisUrl.trim()}`,
    `DATABASE_URL=${dbUrl.trim()}`,
    `AWS_S3_BUCKET_NAME=${s3Bucket.trim()}`,
    `NEXT_PUBLIC_AWS_S3_BUCKET_NAME=${s3Bucket.trim()}`,
    `NEXT_PUBLIC_AWS_REGION=${awsRegion}`,
    `NEXT_PUBLIC_CLOUDFRONT_DOMAIN=${cloudfrontDomain.trim()}`,
  ];

  logger.info('Generated environment variables');

  const tempFilePath = `/tmp/deployment-values.env`;
  fs.writeFileSync(tempFilePath, fileContent.join('\n'));

  logger.info(`Deployment values written to ${tempFilePath}`);
})();
