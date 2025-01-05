import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_memorydb as memorydb, aws_ec2 as ec2 } from 'aws-cdk-lib';
import { getEnvConfig } from '../config/factory';

interface MemoryDbStackProps extends cdk.StackProps {
  environment: string;
  vpc: ec2.Vpc;
}

export class MemoryDbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MemoryDbStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);

    const subnetGroup = new memorydb.CfnSubnetGroup(this, 'MemoryDbSubnetGroup', {
      subnetGroupName: `apadana-memorydb-subnet-group-${cfg.environment}`,
      subnetIds: props.vpc.privateSubnets.map((s) => s.subnetId),
    });

    // Example security group
    const memoryDbSG = new ec2.SecurityGroup(this, 'MemoryDbSG', {
      vpc: props.vpc,
      description: 'MemoryDB security group',
      allowAllOutbound: true,
    });

    // For publicly accessible resources, you'd add inbound rules if needed.
    // But typically MemoryDB is kept private. Modify if you truly want public.
    // memoryDbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(6379), 'Allow inbound Redis');

    new memorydb.CfnCluster(this, 'MemoryDbCluster', {
      aclName: 'open-access', // or "default". 'open-access' if you want no ACL restrictions
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
  }
}