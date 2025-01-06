#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';

import { getEnvConfig } from './config/factory';
import { validateConfig } from './config/validate';
import { IamStack } from './stacks/iam-stack';
import { MemoryDbStack } from './stacks/memory-db-stack';
import { RdsStack } from './stacks/rds-stack';
import { S3Stack } from './stacks/s3-stack';
import { SharedNetworkStack } from './stacks/shared-network-stack';

const environment = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';

const app = new cdk.App();

// Add standard tags to all resources
Tags.of(app).add('managed-by', 'apadana-aws-setup');
Tags.of(app).add('environment', environment);
Tags.of(app).add('created-at', new Date().toISOString());

const cfg = getEnvConfig(environment);
validateConfig(cfg);

//
// Shared IAM stack
//
new IamStack(app, `IamStack-${environment}`, {
  environment,
  env: { account: cfg.account, region: cfg.region },
});

//
// Shared network (VPC, subnets, etc.)
//
const networkStack = new SharedNetworkStack(app, `SharedNetworkStack-${environment}`, {
  environment,
  env: { account: cfg.account, region: cfg.region },
});

//
// MemoryDB (Redis) stack
//
new MemoryDbStack(app, `MemoryDbStack-${environment}`, {
  environment,
  vpc: networkStack.vpc,
  env: { account: cfg.account, region: cfg.region },
});

//
// RDS (PostgreSQL) stack
//
new RdsStack(app, `RdsStack-${environment}`, {
  environment,
  vpc: networkStack.vpc,
  env: { account: cfg.account, region: cfg.region },
});

//
// S3 stack
//
new S3Stack(app, `S3Stack-${environment}`, {
  environment,
  env: { account: cfg.account, region: cfg.region },
});
