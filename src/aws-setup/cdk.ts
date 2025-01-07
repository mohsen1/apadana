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

const logger = createLogger(__filename);

const app = new cdk.App();

const environment = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
const forceReplace = process.env.AWS_FORCE_REPLACE === 'true';

logger.info(`Deploying CDK app for environment: ${environment}`);
logger.info(`Force replace: ${forceReplace}`);

const sharedNetworkStack = new SharedNetworkStack(app, `ap-network-${environment}`, {
  environment,
  removalPolicy: forceReplace ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
});
logger.debug('Created shared network stack');

const s3Stack = new S3Stack(app, `ap-s3-${environment}`, {
  environment,
  removalPolicy: forceReplace ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
});
logger.debug('Created S3 stack');

new CloudFrontStack(app, `ap-cloudfront-${environment}`, {
  environment,
  bucket: s3Stack.bucket,
});
logger.debug('Created CloudFront stack');

new IamStack(app, `ap-iam-${environment}`, {
  environment,
  removalPolicy: forceReplace ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
});
logger.debug('Created IAM stack');

new RdsStack(app, `ap-rds-${environment}`, {
  environment,
  vpc: sharedNetworkStack.vpc,
  removalPolicy: forceReplace ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
});
logger.debug('Created RDS stack');

const elasticacheStack = new ElastiCacheStack(app, `ap-elasticache-${environment}`, {
  environment,
  vpc: sharedNetworkStack.vpc,
  removalPolicy: forceReplace ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
});
logger.debug('Created Elasticache stack');

// Create Redis proxy stack
new RedisProxyStack(app, `ap-redis-proxy-${environment}`, {
  environment,
  vpc: sharedNetworkStack.vpc,
  redisEndpoint: elasticacheStack.redisHostOutput.value,
  removalPolicy: forceReplace ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
});
logger.debug('Created Redis proxy stack');

app.synth();
