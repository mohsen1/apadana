import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

interface SharedNetworkStackProps extends cdk.StackProps {
  environment: string;
  removalPolicy?: cdk.RemovalPolicy;
}

export class SharedNetworkStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: SharedNetworkStackProps) {
    super(scope, id, props);

    logger.info(`Creating/importing network stack for environment: ${props.environment}`);

    // Try to look up existing VPC first
    try {
      this.vpc = ec2.Vpc.fromLookup(this, 'ExistingVpc', {
        vpcName: `ap-vpc-${props.environment}`,
      });
      logger.debug('Found existing VPC');
    } catch (error) {
      assertError(error);
      logger.debug('No existing VPC found, creating new one');
      this.vpc = new ec2.Vpc(this, 'ApadanaVpc', {
        maxAzs: 2,
        natGateways: 1,
        vpcName: `ap-vpc-${props.environment}`,
      });
      logger.debug('Created new VPC');
    }
  }
}
