import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_memorydb as memorydb, aws_ec2 as ec2 } from 'aws-cdk-lib';
import { getEnvConfig } from '../config/factory';

interface MemoryDbStackProps extends cdk.StackProps {
  environment: string;
  vpc: ec2.Vpc;
}

export class MemoryDbStack extends cdk.Stack {
  public readonly redisHostOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: MemoryDbStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);

    const subnetGroup = new memorydb.CfnSubnetGroup(this, 'MemoryDbSubnetGroup', {
      subnetGroupName: `apadana-memorydb-subnet-group-${cfg.environment}`,
      subnetIds: props.vpc.privateSubnets.map((s) => s.subnetId),
    });

    const memoryDbSG = new ec2.SecurityGroup(this, 'MemoryDbSG', {
      vpc: props.vpc,
      description: 'MemoryDB security group',
      allowAllOutbound: true,
    });

    const redisCluster = new memorydb.CfnCluster(this, 'MemoryDbCluster', {
      aclName: 'open-access',
      clusterName: `apadana-memorydb-${cfg.environment}`,
      engineVersion: '6.2',
      nodeType: cfg.memoryDbNodeType,
      numReplicasPerShard: cfg.memoryDbNumReplicas,
      numShards: cfg.memoryDbShardCount,
      subnetGroupName: subnetGroup.ref,
      securityGroupIds: [memoryDbSG.securityGroupId],
      tlsEnabled: true,
      autoMinorVersionUpgrade: true,
      snapshotRetentionLimit: cfg.backupRetentionDays,
    });

    this.redisHostOutput = new cdk.CfnOutput(this, 'RedisEndpoint', {
      exportName: `${this.stackName}-RedisEndpoint`,
      value: redisCluster.attrClusterEndpointAddress,
      description: 'MemoryDB cluster endpoint'
    });
  }
}