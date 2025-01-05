import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class SharedNetworkStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new VPC with public and private subnets
    this.vpc = new ec2.Vpc(this, 'SharedVpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
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

    // Tag all resources
    cdk.Tags.of(this).add('Project', 'Apadana');
    cdk.Tags.of(this.vpc).add('Name', 'apadana-shared-vpc');

    // Output VPC ID for cross-stack references
    new cdk.CfnOutput(this, 'SharedVpcId', {
      value: this.vpc.vpcId,
      description: 'Shared VPC ID for Apadana',
      exportName: 'ApadanaSharedVpcId',
    });
  }
}
