import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

import { BaseStack } from './base-stack';

const logger = createLogger(__filename);

interface SharedNetworkStackProps extends cdk.StackProps {
  environment: string;
  removalPolicy?: cdk.RemovalPolicy;
}

export class SharedNetworkStack extends BaseStack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: SharedNetworkStackProps) {
    super(scope, id, props);

    logger.info(`Creating/importing network stack for environment: ${props.environment}`);

    // Add service-specific tag
    cdk.Tags.of(this).add('service', 'network');

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
        ipAddresses: ec2.IpAddresses.cidr('10.1.0.0/16'),
        subnetConfiguration: [
          {
            name: 'Public',
            subnetType: ec2.SubnetType.PUBLIC,
            cidrMask: 24,
            mapPublicIpOnLaunch: true,
          },
          {
            name: 'Private',
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            cidrMask: 24,
          },
          {
            name: 'Isolated',
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            cidrMask: 24,
          },
        ],
      });

      cdk.Tags.of(this.vpc).add('managed-by', 'apadana-aws-setup');
      cdk.Tags.of(this.vpc).add('environment', props.environment);

      logger.debug('Created new VPC');
    }
  }
}
