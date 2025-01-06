#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';

import { getEnvConfig } from '../config/factory';
import { validateConfig } from '../config/validate';
import { BootstrapStack } from '../stacks/bootstrap-stack';

const environment = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';

const app = new cdk.App();

// Add standard tags to all resources
Tags.of(app).add('managed-by', 'apadana-aws-setup');
Tags.of(app).add('environment', environment);
Tags.of(app).add('created-at', new Date().toISOString());

const cfg = getEnvConfig(environment);
validateConfig(cfg);

// Create the bootstrap stack
new BootstrapStack(app, `BootstrapStack-${environment}`, {
  environment,
  env: { region: cfg.region },
});

app.synth();
