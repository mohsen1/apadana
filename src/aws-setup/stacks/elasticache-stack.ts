import * as cdk from 'aws-cdk-lib';
import {
  aws_ec2 as ec2,
  aws_elasticache as elasticache,
  aws_elasticloadbalancingv2 as elbv2,
  aws_iam as iam,
  aws_lambda as lambda,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { getEnvConfig } from '../config/factory';

const logger = createLogger(__filename);

interface ElastiCacheStackProps extends cdk.StackProps {
  environment: string;
  vpc: ec2.IVpc;
}

export class ElastiCacheStack extends cdk.Stack {
  public readonly redisHostOutput: cdk.CfnOutput;
  public readonly redisPublicHostOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: ElastiCacheStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating ElastiCache stack for environment: ${props.environment}`);

    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'ElastiCacheSubnetGroup', {
      cacheSubnetGroupName: `apadana-elasticache-subnet-group-${cfg.environment}`,
      subnetIds: props.vpc.privateSubnets.map((s) => s.subnetId),
      description: 'Subnet group for ElastiCache Redis',
    });
    logger.debug('Created ElastiCache subnet group');

    const redisSG = new ec2.SecurityGroup(this, 'ElastiCacheSG', {
      vpc: props.vpc,
      description: 'ElastiCache security group',
      allowAllOutbound: true,
    });
    logger.debug('Created ElastiCache security group');

    const redisCluster = new elasticache.CfnReplicationGroup(this, 'ElastiCacheCluster', {
      replicationGroupId: `ap-redis-${cfg.environment}`,
      replicationGroupDescription: `Apadana Redis cluster for ${cfg.environment}`,
      engine: 'redis',
      engineVersion: '7.1',
      cacheNodeType: cfg.redisNodeType,
      numNodeGroups: cfg.redisShardCount,
      replicasPerNodeGroup: cfg.redisNumReplicas,
      cacheSubnetGroupName: subnetGroup.ref,
      securityGroupIds: [redisSG.securityGroupId],
      transitEncryptionEnabled: true,
      atRestEncryptionEnabled: true,
      autoMinorVersionUpgrade: true,
      multiAzEnabled: true,
      port: 6379,
    });
    logger.debug('Created ElastiCache cluster');

    const nlb = new elbv2.NetworkLoadBalancer(this, 'ElastiCacheNLB', {
      vpc: props.vpc,
      internetFacing: true,
      crossZoneEnabled: true,
    });
    logger.debug('Created Network Load Balancer');

    const listener = nlb.addListener('RedisListener', {
      port: 6379,
      protocol: elbv2.Protocol.TCP,
    });
    logger.debug('Added Redis listener to NLB');

    const nlbSG = new ec2.SecurityGroup(this, 'ElastiCacheNlbSG', {
      vpc: props.vpc,
      description: 'Security group for ElastiCache NLB',
      allowAllOutbound: true,
    });
    nlbSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(6379),
      'Allow Redis traffic from anywhere',
    );
    logger.debug('Created and configured NLB security group');

    redisSG.addIngressRule(
      ec2.Peer.securityGroupId(nlbSG.securityGroupId),
      ec2.Port.tcp(6379),
      'Allow Redis traffic from NLB',
    );
    logger.debug('Added ingress rule to ElastiCache security group');

    const targetGroup = new elbv2.NetworkTargetGroup(this, 'RedisTargets', {
      vpc: props.vpc,
      port: 6379,
      protocol: elbv2.Protocol.TCP,
      healthCheck: {
        enabled: true,
        protocol: elbv2.Protocol.TCP,
        port: '6379',
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        interval: cdk.Duration.seconds(10),
      },
      targetType: elbv2.TargetType.IP,
    });

    listener.addTargetGroups('RedisForward', targetGroup);

    const registerTargetFunction = new lambda.Function(this, 'RegisterTargetFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          try {
            const aws = require('aws-sdk');
            const elbv2 = new aws.ELBv2();
            
            if (event.RequestType === 'Create' || event.RequestType === 'Update') {
              await elbv2.registerTargets({
                TargetGroupArn: '${targetGroup.targetGroupArn}',
                Targets: [{
                  Id: '${redisCluster.attrPrimaryEndPointAddress}',
                  Port: 6379
                }]
              }).promise();
            }
            
            return { PhysicalResourceId: 'RegisterTarget' };
          } catch (error) {
            console.error('Error registering target:', error);
            throw error;
          }
        }
      `),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [nlbSG],
    });

    registerTargetFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['elasticloadbalancing:RegisterTargets', 'elasticloadbalancing:DeregisterTargets'],
        resources: [targetGroup.targetGroupArn],
      }),
    );

    new cdk.CustomResource(this, 'RegisterTarget', {
      serviceToken: registerTargetFunction.functionArn,
    });

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
    logger.debug('Added Redis endpoints outputs');
  }
}
