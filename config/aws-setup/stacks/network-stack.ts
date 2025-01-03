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

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    // Create VPC
    this.vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: 2,
      natGateways: 1,
      vpcName:
        props.environment === 'preview'
          ? 'apadana-vpc-preview'
          : `apadana-vpc-${props.environment}`,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name:
            props.environment === 'preview' ? 'private-preview' : `private-${props.environment}`,
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: props.environment === 'preview' ? 'public-preview' : `public-${props.environment}`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Create security group for MemoryDB
    this.memoryDbSG = new ec2.SecurityGroup(this, 'MemoryDBSecurityGroup', {
      vpc: this.vpc,
      description: `Security group for Apadana MemoryDB cluster - ${props.environment}`,
      allowAllOutbound: true,
      securityGroupName:
        props.environment === 'preview'
          ? 'apadana-memorydb-sg-preview'
          : `apadana-memorydb-sg-${props.environment}`,
    });

    this.memoryDbSG.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.tcp(6379),
      'Allow Redis access from within VPC',
    );

    // Create security group for RDS
    this.rdsSG = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
      vpc: this.vpc,
      description: `Security group for Apadana RDS instance - ${props.environment}`,
      allowAllOutbound: true,
      securityGroupName:
        props.environment === 'preview'
          ? 'apadana-rds-sg-preview'
          : `apadana-rds-sg-${props.environment}`,
    });

    this.rdsSG.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from within VPC',
    );

    // Tag all resources
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Project', 'Apadana');

    // Output VPC ID
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `ApadanaVpcId-${props.environment}`,
    });

    // Output Security Group IDs
    new cdk.CfnOutput(this, 'MemoryDBSecurityGroupId', {
      value: this.memoryDbSG.securityGroupId,
      description: 'MemoryDB Security Group ID',
      exportName: `ApadanaMemoryDBSecurityGroupId-${props.environment}`,
    });

    new cdk.CfnOutput(this, 'RDSSecurityGroupId', {
      value: this.rdsSG.securityGroupId,
      description: 'RDS Security Group ID',
      exportName: `ApadanaRDSSecurityGroupId-${props.environment}`,
    });
  }
}
