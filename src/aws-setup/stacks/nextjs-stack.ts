import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { NextjsGlobalFunctions } from 'cdk-nextjs';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { BaseStack, BaseStackProps } from './base-stack';
import { getEnvConfig } from '../config/factory';

const logger = createLogger(import.meta.filename);

interface NextJsStackProps extends BaseStackProps {
  vpc: ec2.IVpc;
}

export class NextJsStack extends BaseStack {
  constructor(scope: Construct, id: string, props: NextJsStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);

    // Add service-specific tag
    cdk.Tags.of(this).add('service', 'nextjs');

    new NextjsGlobalFunctions(this, `ap-nextjs-global-functions-${cfg.environment}`, {
      buildContext: '.',
      healthCheckPath: '/api/health',
      overrides: {
        nextjsVpc: {
          vpcProps: props.vpc,
        },
      },
    });

    logger.info('NextJS stack created');
  }
}
