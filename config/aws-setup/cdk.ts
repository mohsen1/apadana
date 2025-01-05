#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

// Define required permissions - must match create-deployer.ts
const requiredPermissions = [
  // Self-inspection permissions
  'iam:GetUser',
  'iam:ListUserPolicies',
  'iam:GetUserPolicy',
  'iam:ListAttachedUserPolicies',
  'iam:PassRole',
  'iam:GetRole',
  'iam:ListRoles',
  // CloudFormation for stack management
  'cloudformation:*',
  // Network resources
  'ec2:*',
  'vpc:*',
  'elasticloadbalancing:*',
  // Database resources
  'rds:*',
  'elasticache:*',
  'memorydb:*',
  // Storage and encryption
  's3:*',
  'kms:*',
  // Monitoring and logging
  'logs:*',
  'cloudwatch:*',
  // Security and secrets
  'secretsmanager:*',
  'acm:*',
  // DNS management
  'route53:*',
  // Container services
  'ecs:*',
  'ecr:*',
  // Parameter store
  'ssm:*',
];

// Check AWS credentials and permissions
async function checkPermissions() {
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    console.error('❌ AWS credentials not found in environment variables.');
    console.error('Run pnpm aws:deployer:create first and add the credentials to .env.local');
    process.exit(1);
  }

  const iam = new IAM({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials,
  });

  try {
    const { User } = await iam.getUser({});
    if (!User?.Arn) throw new Error('Failed to get user info');

    const { PolicyNames } = await iam.listUserPolicies({ UserName: User.UserName });
    if (!PolicyNames?.includes('ApadanaDeployerInlinePolicy')) {
      console.error('❌ AWS credentials do not have the required inline policy.');
      console.error('Run pnpm aws:deployer:create to create a user with correct permissions.');
      process.exit(1);
    }

    const policy = await iam.getUserPolicy({
      UserName: User.UserName,
      PolicyName: 'ApadanaDeployerInlinePolicy',
    });

    if (!policy.PolicyDocument) {
      console.error('❌ Could not verify AWS permissions.');
      console.error('Run pnpm aws:deployer:create to create a user with correct permissions.');
      process.exit(1);
    }

    const policyDoc = JSON.parse(decodeURIComponent(policy.PolicyDocument));
    const hasAllPermissions = requiredPermissions.every((permission) => {
      return policyDoc.Statement.some(
        (statement: any) => statement.Effect === 'Allow' && statement.Action.includes(permission),
      );
    });

    if (!hasAllPermissions) {
      console.error('❌ AWS credentials do not have all required permissions for CDK deployment.');
      console.error('Required permissions:');
      console.error(requiredPermissions.join('\n'));
      console.error('\nRun pnpm aws:deployer:create to create a user with correct permissions.');
      process.exit(1);
    }

    console.log('✅ AWS credentials verified for CDK deployment');
  } catch (error) {
    console.error('❌ Failed to verify AWS permissions:', error);
    console.error('Run pnpm aws:deployer:create to create a user with correct permissions.');
    process.exit(1);
  }
}

async function main() {
  await checkPermissions();

  const app = new cdk.App();
  const stackType = process.env.STACK_TYPE || 'all';
  const region = process.env.AWS_REGION || 'us-east-1';

  console.log(`Deploying ${stackType} stacks to ${region} for environment: ${environment}`);

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

  if (stackType === 'network' || stackType === 'all') {
    // Deploy shared network stack (only once)
    new SharedNetworkStack(app, 'apadana-shared-network', {
      env: { region },
    });
  }

  if (stackType === 'resources' || stackType === 'all') {
    // S3 stack with environment prop
    new S3Stack(app, `apadana-s3-${environment}`, {
      env: { region },
      environment,
    });

    // MemoryDB stack with environment
    new MemoryDBStack(app, `apadana-memorydb-${environment}`, {
      env: { region },
      environment,
    });

    // RDS stack with environment
    new RDSStack(app, `apadana-rds-${environment}`, {
      env: { region },
      environment,
    });
  }
}

main().catch(console.error);
