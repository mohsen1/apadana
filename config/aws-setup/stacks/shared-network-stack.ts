import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';

interface SharedNetworkStackProps extends cdk.StackProps {
  environment: string;
}

export class SharedNetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: SharedNetworkStackProps) {
    super(scope, id, props);

    // Create or import a VPC
    this.vpc = new ec2.Vpc(this, 'ApadanaVpc', {
      maxAzs: 2,
      natGateways: 1,
      vpcName: `ap-vpc-${props.environment}`,
    });
  }
} 