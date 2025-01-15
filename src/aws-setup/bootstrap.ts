#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';

import { createLogger } from '@/utils/logger';

import { DeployerIamStack } from './stacks/deployer-iam-stack';

const logger = createLogger(import.meta.filename);

const app = new cdk.App();

const environment = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
const profile = process.env.AWS_PROFILE || 'default';

logger.info(`Using AWS profile: ${profile}`);
logger.info(`Bootstrapping CDK app for environment: ${environment}`);

// Create deployer stack with RETAIN policy since we need it for Vercel
new DeployerIamStack(app, `ap-deployer-iam-${environment}`, {
  environment,
  removalPolicy: cdk.RemovalPolicy.RETAIN,
});

app.synth();
