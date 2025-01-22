#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

import { createLogger } from '@/utils/logger';

import { CloudFrontStack } from './stacks/cloudfront-stack';
import { ElastiCacheStack } from './stacks/elasticache-stack';
import { IamStack } from './stacks/iam-stack';
import { RdsStack } from './stacks/rds-stack';
import { RedisProxyStack } from './stacks/redis-proxy-stack';
import { S3Stack } from './stacks/s3-stack';
import { SharedNetworkStack } from './stacks/shared-network-stack';

const logger = createLogger(import.meta.filename);

const app = new cdk.App();

const environment = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
const forceReplace = process.env.AWS_FORCE_REPLACE === 'true';

logger.info(`Using AWS profile: ${process.env.AWS_PROFILE}`);
logger.info(`Deploying CDK app for environment: ${environment}`);
logger.info(`Force replace: ${forceReplace}`);

// Set removal policy based on environment
const removalPolicy =
  environment === 'production'
    ? cdk.RemovalPolicy.RETAIN
    : forceReplace
      ? cdk.RemovalPolicy.DESTROY
      : cdk.RemovalPolicy.RETAIN;

logger.info(`Using removal policy: ${removalPolicy}`);

// Make other stacks depend on deployer
const sharedNetworkStack = new SharedNetworkStack(app, `ap-network-${environment}`, {
  environment,
  removalPolicy,
});
logger.debug('Created shared network stack');

new IamStack(app, `ap-iam-${environment}`, {
  environment,
  removalPolicy,
});
logger.debug('Created IAM stack');

const s3Stack = new S3Stack(app, `ap-s3-${environment}`, {
  environment,
  removalPolicy,
});
logger.debug('Created S3 stack');

new CloudFrontStack(app, `ap-cloudfront-${environment}`, {
  environment,
  bucket: s3Stack.bucket,
  removalPolicy,
});
logger.debug('Created CloudFront stack');

new RdsStack(app, `ap-rds-${environment}`, {
  environment,
  vpc: sharedNetworkStack.vpc,
  removalPolicy,
});
logger.debug('Created RDS stack');

// Create ElastiCache stack first
const elasticacheStack = new ElastiCacheStack(app, `ap-elasticache-${environment}`, {
  environment,
  vpc: sharedNetworkStack.vpc,
  removalPolicy,
});

// Add dependency on network stack
elasticacheStack.addDependency(sharedNetworkStack);
logger.debug('Created Elasticache stack');

// Then create Redis proxy stack with direct reference to ElastiCache endpoint
const redisProxyStack = new RedisProxyStack(app, `ap-redis-proxy-${environment}`, {
  environment,
  vpc: sharedNetworkStack.vpc,
  redisEndpoint: elasticacheStack.redisHostOutput.value as string,
  removalPolicy,
});

// Add explicit dependencies
redisProxyStack.addDependency(elasticacheStack);
redisProxyStack.addDependency(sharedNetworkStack);

logger.debug('Created Redis proxy stack');

app.synth();
