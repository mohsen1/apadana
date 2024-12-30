#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';

import { BootstrapStack } from './stacks/bootstrap-stack';
import { IAMStack } from './stacks/iam-stack';
import { MemoryDBStack } from './stacks/memory-db-stack';
import { NetworkStack } from './stacks/network-stack';

// Load environment variables from .env.local
config({ path: '.env.local' });

const app = new cdk.App();

// Get AWS region from environment variable or use default
const region = process.env.AWS_REGION || 'us-east-1';
const env = { region };

// Deploy stacks based on STACK_TYPE environment variable
const stackType = process.env.STACK_TYPE || 'all';
const environment = process.env.NODE_ENV || 'development';

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
  });

  // Then deploy MemoryDB stack
  new MemoryDBStack(app, 'ApadanaMemoryDBStack', {
    env,
    vpc: networkStack.vpc,
    securityGroup: networkStack.memoryDbSG,
    environment,
  });
}

app.synth();
