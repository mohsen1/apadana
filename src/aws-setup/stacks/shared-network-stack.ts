import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

interface SharedNetworkStackProps extends cdk.StackProps {
  environment: string;
}

export class SharedNetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: SharedNetworkStackProps) {
    super(scope, id, props);

    logger.info(`Creating network stack for environment: ${props.environment}`);

    this.vpc = new ec2.Vpc(this, 'ApadanaVpc', {
      maxAzs: 2,
      natGateways: 1,
      vpcName: `ap-vpc-${props.environment}`,
    });
    logger.debug('Created VPC');
  }
}
