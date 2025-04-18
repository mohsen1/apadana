import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2, aws_elasticache as elasticache } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { BaseStack, BaseStackProps } from './base-stack';
import { getEnvConfig } from '../config/factory';

const logger = createLogger(import.meta.filename);

interface ElastiCacheStackProps extends BaseStackProps {
  vpc: ec2.IVpc;
}

export class ElastiCacheStack extends BaseStack {
  public readonly redisHostOutput: cdk.CfnOutput;
  public readonly redisSecurityGroup: ec2.SecurityGroup;
  public readonly redisSecurityGroupOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: ElastiCacheStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating ElastiCache stack for environment: ${props.environment}`);

    // Add service-specific tag
    cdk.Tags.of(this).add('service', 'redis');

    // Create security group first
    this.redisSecurityGroup = new ec2.SecurityGroup(this, 'ElastiCacheSG', {
      vpc: props.vpc,
      description: 'ElastiCache security group',
      allowAllOutbound: true,
    });

    // Allow access from private subnets (proxy will be here)
    props.vpc.privateSubnets.forEach((subnet, index) => {
      this.redisSecurityGroup.addIngressRule(
        ec2.Peer.ipv4(subnet.ipv4CidrBlock),
        ec2.Port.tcp(6379),
        `Allow Redis traffic from private subnet ${index + 1}`,
      );
    });

    // Create subnet group
    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'ElastiCacheSubnetGroup', {
      cacheSubnetGroupName: `ap-elasticache-subnet-group-${cfg.environment}`,
      subnetIds: props.vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        onePerAz: true,
      }).subnetIds,
      description: 'Subnet group for ElastiCache Redis',
    });

    const replicationGroupId = `ap-redis-${cfg.environment}`;
    const redisCluster = new elasticache.CfnReplicationGroup(this, 'ElastiCacheCluster', {
      replicationGroupId,
      replicationGroupDescription: `Apadana Redis cluster for ${cfg.environment}`,
      engine: 'redis',
      engineVersion: '7.1',
      cacheNodeType: cfg.redisNodeType,
      numNodeGroups: 1,
      replicasPerNodeGroup: 0,
      cacheSubnetGroupName: subnetGroup.ref,
      securityGroupIds: [this.redisSecurityGroup.securityGroupId],
      transitEncryptionEnabled: true,
      atRestEncryptionEnabled: true,
      autoMinorVersionUpgrade: true,
      multiAzEnabled: false,
      automaticFailoverEnabled: false,
      port: 6379,
    });

    // Add explicit dependency on subnet group
    redisCluster.addDependency(subnetGroup);

    // Apply removal policy for production
    if (cfg.environment === 'production') {
      redisCluster.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
      subnetGroup.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    }

    // Create outputs after the cluster is created
    this.redisHostOutput = new cdk.CfnOutput(this, 'RedisEndpoint', {
      exportName: `ap-elasticache-${props.environment}-RedisEndpoint`,
      value: redisCluster.attrPrimaryEndPointAddress,
      description: 'ElastiCache cluster endpoint (accessible via proxy)',
    });

    this.redisSecurityGroupOutput = new cdk.CfnOutput(this, 'RedisSecurityGroupId', {
      exportName: `ap-elasticache-${props.environment}-RedisSecurityGroupId`,
      value: this.redisSecurityGroup.securityGroupId,
      description: 'ElastiCache security group ID',
    });
  }
}
