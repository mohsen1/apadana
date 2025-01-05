import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class SharedNetworkStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import existing shared VPC
    this.vpc = ec2.Vpc.fromLookup(this, 'SharedVpc', {
      tags: {
        Name: 'apadana-shared-vpc',
      },
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
