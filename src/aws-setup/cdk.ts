#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

import { createLogger } from '@/utils/logger';

import { CloudFrontStack } from './stacks/cloudfront-stack';
import { IamStack } from './stacks/iam-stack';
import { MemoryDbStack } from './stacks/memory-db-stack';
import { RdsStack } from './stacks/rds-stack';
import { S3Stack } from './stacks/s3-stack';
import { SharedNetworkStack } from './stacks/shared-network-stack';

const logger = createLogger(__filename);

const app = new cdk.App();

const environment = process.env.ENVIRONMENT || 'development';
logger.info(`Deploying CDK app for environment: ${environment}`);

const sharedNetworkStack = new SharedNetworkStack(app, `ap-network-${environment}`, {
  environment,
});
logger.debug('Created shared network stack');

const s3Stack = new S3Stack(app, `ap-s3-${environment}`, {
  environment,
});
logger.debug('Created S3 stack');

new CloudFrontStack(app, `ap-cloudfront-${environment}`, {
  environment,
  bucket: s3Stack.bucket,
});
logger.debug('Created CloudFront stack');

new IamStack(app, `ap-iam-${environment}`, {
  environment,
});
logger.debug('Created IAM stack');

new RdsStack(app, `ap-rds-${environment}`, {
  environment,
  vpc: sharedNetworkStack.vpc,
});
logger.debug('Created RDS stack');

new MemoryDbStack(app, `ap-memorydb-${environment}`, {
  environment,
  vpc: sharedNetworkStack.vpc,
});
logger.debug('Created MemoryDB stack');

app.synth();
