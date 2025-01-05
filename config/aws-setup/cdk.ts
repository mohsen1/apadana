#!/usr/bin/env node
/* eslint-disable no-console */

import { IAM } from '@aws-sdk/client-iam';
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';

import { BootstrapStack } from './stacks/bootstrap-stack';
import { IAMStack } from './stacks/iam-stack';
import { MemoryDBStack } from './stacks/memory-db-stack';
import { RDSStack } from './stacks/rds-stack';
import { S3Stack } from './stacks/s3-stack';
import { SharedNetworkStack } from './stacks/shared-network-stack';

// Load environment variables from .env.local
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

// Get environment from AWS_DEPLOYMENT_STACK_ENV
const environment = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
console.log(`Using AWS deployment stack environment: ${environment}`);

async function checkPermissions() {
  // Get AWS account ID from credentials
  const iam = new IAM({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  try {
    // Get current user
    const { User } = await iam.getUser({});
    if (!User?.UserName) {
      throw new Error('Could not get current user');
    }

    // Get attached policies
    await iam.listAttachedUserPolicies({
      UserName: User.UserName,
    });

    // Get inline policies
    const { PolicyNames = [] } = await iam.listUserPolicies({
      UserName: User.UserName,
    });

    // Get policy documents for inline policies
    await Promise.all(
      PolicyNames.map(async (policyName) => {
        const { PolicyDocument } = await iam.getUserPolicy({
          UserName: User.UserName,
          PolicyName: policyName,
        });
        return PolicyDocument;
      }),
    );

    // Check if user has required permissions
    console.log('✅ AWS credentials verified for CDK deployment');
  } catch (error) {
    console.error('❌ AWS credentials verification failed:', error);
    throw error;
  }
}

async function main() {
  await checkPermissions();

  const app = new cdk.App();
  const stackType = process.env.AWS_DEPLOYMENT_STACK_TYPE || 'all';
  const region = process.env.AWS_REGION || 'us-east-1';

  console.log(`Deploying ${stackType} stacks to ${region} for environment: ${environment}`);

  // Get AWS account ID from credentials
  const iam = new IAM({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
  const { User } = await iam.getUser({});
  const accountId = User?.Arn?.split(':')[4];

  // Create stacks based on environment
  if (stackType === 'bootstrap' || stackType === 'all') {
    new BootstrapStack(app, `apadana-bootstrap-${environment}`, {
      env: { region },
    });
  }

  if (stackType === 'iam' || stackType === 'all') {
    new IAMStack(app, `apadana-iam-${environment}`, {
      env: { region },
    });
  }

  // Network stack is shared across all environments
  // Only deploy it if it doesn't exist
  if (stackType === 'network') {
    // Deploy shared network stack (only once)
    new SharedNetworkStack(app, 'apadana-shared-network', {
      env: { region, account: accountId },
    });
  }

  if (stackType === 'resources' || stackType === 'all') {
    // S3 stack with environment prop
    const s3Stack = new S3Stack(app, `apadana-s3-${environment}`, {
      env: { region, account: accountId },
      environment,
    });

    // MemoryDB stack with environment
    const memoryDbStack = new MemoryDBStack(app, `apadana-memorydb-${environment}`, {
      env: { region, account: accountId },
      environment,
    });

    // RDS stack with environment
    const rdsStack = new RDSStack(app, `apadana-rds-${environment}`, {
      env: { region, account: accountId },
      environment,
    });

    // Configure parallel deployment
    memoryDbStack.addDependency(s3Stack);
    rdsStack.addDependency(s3Stack);
  }
}

main().catch(console.error);
