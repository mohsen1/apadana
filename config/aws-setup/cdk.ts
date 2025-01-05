#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { getEnvConfig } from './config/factory';
import { validateConfig } from './config/validate';

import { BootstrapStack } from './stacks/bootstrap-stack';
import { IamStack } from './stacks/iam-stack';
import { SharedNetworkStack } from './stacks/shared-network-stack';
import { MemoryDbStack } from './stacks/memory-db-stack';
import { RdsStack } from './stacks/rds-stack';
import { S3Stack } from './stacks/s3-stack';

const app = new cdk.App();

const environment = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
const cfg = getEnvConfig(environment);
validateConfig(cfg);

//
// Bootstrap stack is typically deployed once by a root user.
//
new BootstrapStack(app, 'BootstrapStack', { env: { account: cfg.account, region: cfg.region } });

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