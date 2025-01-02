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
import { NetworkStack } from './stacks/network-stack';
import { RDSStack } from './stacks/rds-stack';
import { S3Stack } from './stacks/s3-stack';

// Load environment variables from .env.local
config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });

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

  // Get AWS region from environment variable or use default
  const region = process.env.AWS_REGION || 'us-east-1';
  const env = { region };

  // Deploy stacks based on AWS_DEPLOYMENT_STACK_TYLE environment variable
  const stackType = process.env.AWS_DEPLOYMENT_STACK_TYLE || 'all';
  const environment = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';

  if (stackType === 'bootstrap') {
    // Deploy bootstrap stack for initial setup
    new BootstrapStack(app, 'ApadanaBootstrapStack', { env });
  } else if (stackType === 'iam') {
    // Deploy IAM stack for permissions
    new IAMStack(app, 'ApadanaIAMStack', { env });
  } else if (stackType === 'resources' || stackType === 'all') {
    // Deploy network stack first
    const networkStack = new NetworkStack(app, 'ApadanaNetworkStack', {
      env,
      environment,
      stackName: `apadana-network-${environment}`,
    });

    // Then deploy MemoryDB stack with explicit dependency
    const memoryDbStack = new MemoryDBStack(app, 'ApadanaMemoryDBStack', {
      env,
      vpc: networkStack.vpc,
      securityGroup: networkStack.memoryDbSG,
      environment,
      stackName: `apadana-memorydb-${environment}`,
    });
    memoryDbStack.addDependency(networkStack);

    // Deploy RDS stack with explicit dependency
    const rdsStack = new RDSStack(app, 'ApadanaRDSStack', {
      env,
      vpc: networkStack.vpc,
      securityGroup: networkStack.rdsSG,
      environment,
      stackName: `apadana-rds-${environment}`,
    });
    rdsStack.addDependency(networkStack);

    // Deploy S3 stack
    new S3Stack(app, 'ApadanaS3Stack', {
      env,
      environment,
      stackName: `apadana-s3-${environment}`,
    });
  }

  app.synth();
}

main().catch((error) => {
  console.error('Failed to deploy:', error);
  process.exit(1);
});
