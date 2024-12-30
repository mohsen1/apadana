import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface NetworkStackProps extends cdk.StackProps {
  environment: string;
}

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly memoryDbSG: ec2.SecurityGroup;
  public readonly rdsSG: ec2.SecurityGroup;

  private resourceName(name: string): string {
    return `apadana-${name}-${this.account}-${this.region}-${this.props.environment}`;
  }

  constructor(
    scope: Construct,
    id: string,
    private props: NetworkStackProps,
  ) {
    super(scope, id, props);

    // Create VPC
    this.vpc = new ec2.Vpc(this, 'ApadanaVPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create security group for MemoryDB
    this.memoryDbSG = new ec2.SecurityGroup(this, 'MemoryDBSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Apadana MemoryDB cluster',
      allowAllOutbound: true,
    });

    this.memoryDbSG.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.tcp(6379),
      'Allow Redis access from within VPC',
    );

    // Create security group for RDS
    this.rdsSG = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Apadana RDS instance',
      allowAllOutbound: true,
    });

    this.rdsSG.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from within VPC',
    );

    // Output VPC ID
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: 'ApadanaVpcId',
    });

    // Output Security Group IDs
    new cdk.CfnOutput(this, 'MemoryDBSecurityGroupId', {
      value: this.memoryDbSG.securityGroupId,
      description: 'MemoryDB Security Group ID',
      exportName: 'ApadanaMemoryDBSecurityGroupId',
    });

    new cdk.CfnOutput(this, 'RDSSecurityGroupId', {
      value: this.rdsSG.securityGroupId,
      description: 'RDS Security Group ID',
      exportName: 'ApadanaRDSSecurityGroupId',
    });
  }
}
