#!/usr/bin/env node
import {
  CloudFormationClient,
  DeleteStackCommand,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import * as cdk from 'aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';

import { createLogger } from '@/utils/logger';

import { getEnvConfig } from '../config/factory';
import { validateConfig } from '../config/validate';
import { BootstrapStack } from '../stacks/bootstrap-stack';

const logger = createLogger(__filename);

async function cleanupOldBootstrap(environment: string, region: string) {
  const client = new CloudFormationClient({ region });
  const stackName = `CDKToolkit-${environment}`;

  try {
    // Check if stack exists
    await client.send(new DescribeStacksCommand({ StackName: stackName }));

    // Delete the stack if it exists
    logger.info(`Deleting existing CDK toolkit stack: ${stackName}`);
    await client.send(new DeleteStackCommand({ StackName: stackName }));

    // Wait for stack deletion
    logger.info('Waiting for stack deletion...');
    let isDeleted = false;
    while (!isDeleted) {
      try {
        await client.send(new DescribeStacksCommand({ StackName: stackName }));
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        // Stack not found means deletion is complete
        isDeleted = true;
      }
    }
    logger.info('Old CDK toolkit stack deleted successfully');
  } catch (error) {
    // Stack doesn't exist, nothing to clean up
    logger.debug('No existing CDK toolkit stack found');
  }
}

async function bootstrap() {
  const environment = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
  const cfg = getEnvConfig(environment);
  validateConfig(cfg);

  // Clean up old bootstrap stack if it exists
  await cleanupOldBootstrap(environment, cfg.region);

  const app = new cdk.App();

  // Add standard tags to all resources
  Tags.of(app).add('managed-by', 'apadana-aws-setup');
  Tags.of(app).add('environment', environment);
  Tags.of(app).add('created-at', new Date().toISOString());

  // Create the bootstrap stack
  new BootstrapStack(app, `BootstrapStack-${environment}`, {
    environment,
    env: { region: cfg.region },
  });

  app.synth();
}

// Run bootstrap
bootstrap().catch((error) => {
  logger.error('Bootstrap failed:', error);
  process.exit(1);
});
