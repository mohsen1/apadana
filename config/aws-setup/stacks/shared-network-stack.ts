import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class SharedNetworkStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Single shared VPC
    this.vpc = new ec2.Vpc(this, 'SharedVpc', {
      vpcName: 'apadana-shared-vpc',
      ipAddresses: ec2.IpAddresses.cidr('172.31.0.0/16'),
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-subnet',
          subnetType: ec2.SubnetType.PUBLIC,
          mapPublicIpOnLaunch: true,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
      restrictDefaultSecurityGroup: false,
    });

    // Tag all resources
    cdk.Tags.of(this).add('Project', 'Apadana');

    // Output VPC ID for cross-stack references
    new cdk.CfnOutput(this, 'SharedVpcId', {
      value: this.vpc.vpcId,
      description: 'Shared VPC ID for Apadana',
      exportName: 'ApadanaSharedVpcId',
    });
  }
}
