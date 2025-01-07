import * as cdk from 'aws-cdk-lib';
import {
  aws_ec2 as ec2,
  aws_elasticache as elasticache,
  aws_elasticloadbalancingv2 as elbv2,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

import { getEnvConfig } from '../config/factory';

const logger = createLogger(__filename);

interface ElastiCacheStackProps extends cdk.StackProps {
  environment: string;
  vpc: ec2.IVpc;
  removalPolicy?: cdk.RemovalPolicy;
}

export class ElastiCacheStack extends cdk.Stack {
  public readonly redisHostOutput: cdk.CfnOutput;
  public readonly redisPublicHostOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: ElastiCacheStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating ElastiCache stack for environment: ${props.environment}`);

    cdk.Tags.of(this).add('managed-by', 'apadana-aws-setup');
    cdk.Tags.of(this).add('environment', props.environment);
    cdk.Tags.of(this).add('service', 'redis');
    cdk.Tags.of(this).add('created-at', new Date().toISOString());

    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'ElastiCacheSubnetGroup', {
      cacheSubnetGroupName: `apadana-elasticache-subnet-group-${cfg.environment}`,
      subnetIds: props.vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        onePerAz: true,
      }).subnetIds,
      description: 'Subnet group for ElastiCache Redis',
    });

    const redisSG = new ec2.SecurityGroup(this, 'ElastiCacheSG', {
      vpc: props.vpc,
      description: 'ElastiCache security group',
      allowAllOutbound: true,
    });

    // NLB security group
    const nlbSG = new ec2.SecurityGroup(this, 'NlbSG', {
      vpc: props.vpc,
      description: 'Security group for Redis NLB',
      allowAllOutbound: true,
    });

    // Allow inbound traffic from anywhere to NLB
    nlbSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(6379),
      'Allow Redis traffic from anywhere',
    );

    // Allow inbound traffic from NLB to Redis
    redisSG.addIngressRule(
      ec2.Peer.securityGroupId(nlbSG.securityGroupId),
      ec2.Port.tcp(6379),
      'Allow Redis traffic from NLB',
    );

    const redisCluster = new elasticache.CfnReplicationGroup(this, 'ElastiCacheCluster', {
      replicationGroupId: `ap-redis-${cfg.environment}`,
      replicationGroupDescription: `Apadana Redis cluster for ${cfg.environment}`,
      engine: 'redis',
      engineVersion: '7.1',
      cacheNodeType: cfg.redisNodeType,
      numNodeGroups: 1,
      replicasPerNodeGroup: 0,
      cacheSubnetGroupName: subnetGroup.ref,
      securityGroupIds: [redisSG.securityGroupId],
      transitEncryptionEnabled: false,
      atRestEncryptionEnabled: false,
      autoMinorVersionUpgrade: true,
      multiAzEnabled: false,
      automaticFailoverEnabled: false,
      port: 6379,
    });

    if (cfg.environment === 'production') {
      redisCluster.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    }

    // Create NLB in public subnets
    const nlb = new elbv2.NetworkLoadBalancer(this, 'RedisNLB', {
      vpc: props.vpc,
      internetFacing: true,
      crossZoneEnabled: true,
    });

    const listener = nlb.addListener('RedisListener', {
      port: 6379,
      protocol: elbv2.Protocol.TCP,
    });

    const targetGroup = new elbv2.NetworkTargetGroup(this, 'RedisTargets', {
      vpc: props.vpc,
      port: 6379,
      protocol: elbv2.Protocol.TCP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        protocol: elbv2.Protocol.TCP,
        port: '6379',
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        interval: cdk.Duration.seconds(10),
      },
    });

    listener.addTargetGroups('RedisForward', targetGroup);

    this.redisHostOutput = new cdk.CfnOutput(this, 'RedisEndpoint', {
      exportName: `${this.stackName}-RedisEndpoint`,
      value: redisCluster.attrPrimaryEndPointAddress,
      description: 'ElastiCache cluster private endpoint',
    });

    this.redisPublicHostOutput = new cdk.CfnOutput(this, 'RedisPublicEndpoint', {
      exportName: `${this.stackName}-RedisPublicEndpoint`,
      value: nlb.loadBalancerDnsName,
      description: 'ElastiCache public endpoint (via NLB)',
    });
  }
}
