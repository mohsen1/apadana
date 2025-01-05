import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class SharedNetworkStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Always create or import a single, shared VPC for every environment
    this.vpc = new ec2.Vpc(this, 'SharedVpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      natGateways: 1,
      enableDnsHostnames: true,
      enableDnsSupport: true,
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

    cdk.Tags.of(this).add('Name', 'apadana-shared-vpc');
    cdk.Tags.of(this.vpc).add('Project', 'Apadana');

    new cdk.CfnOutput(this, 'SharedVpcId', {
      value: this.vpc.vpcId,
      description: 'Shared VPC ID for Apadana',
      exportName: 'ApadanaSharedVpcId',
    });

    // Export subnet IDs
    this.vpc.publicSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PublicSubnet${index + 1}Id`, {
        value: subnet.subnetId,
        description: `Public Subnet ${index + 1} ID`,
        exportName: `ApadanaPublicSubnet${index + 1}Id`,
      });
    });

    this.vpc.privateSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PrivateSubnet${index + 1}Id`, {
        value: subnet.subnetId,
        description: `Private Subnet ${index + 1} ID`,
        exportName: `ApadanaPrivateSubnet${index + 1}Id`,
      });
    });

    this.vpc.isolatedSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `IsolatedSubnet${index + 1}Id`, {
        value: subnet.subnetId,
        description: `Isolated Subnet ${index + 1} ID`,
        exportName: `ApadanaIsolatedSubnet${index + 1}Id`,
      });
    });
  }
}
