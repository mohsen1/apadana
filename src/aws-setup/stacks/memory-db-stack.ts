import * as cdk from 'aws-cdk-lib';
import {
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elbv2,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_memorydb as memorydb,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { getEnvConfig } from '../config/factory';

const logger = createLogger(__filename);

interface MemoryDbStackProps extends cdk.StackProps {
  environment: string;
  vpc: ec2.Vpc;
}

export class MemoryDbStack extends cdk.Stack {
  public readonly redisHostOutput: cdk.CfnOutput;
  public readonly redisPublicHostOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: MemoryDbStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating MemoryDB stack for environment: ${props.environment}`);

    const subnetGroup = new memorydb.CfnSubnetGroup(this, 'MemoryDbSubnetGroup', {
      subnetGroupName: `apadana-memorydb-subnet-group-${cfg.environment}`,
      subnetIds: props.vpc.privateSubnets.map((s) => s.subnetId),
    });
    logger.debug('Created MemoryDB subnet group');

    const memoryDbSG = new ec2.SecurityGroup(this, 'MemoryDbSG', {
      vpc: props.vpc,
      description: 'MemoryDB security group',
      allowAllOutbound: true,
    });
    logger.debug('Created MemoryDB security group');

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
    logger.debug('Created MemoryDB cluster');

    const nlb = new elbv2.NetworkLoadBalancer(this, 'MemoryDbNLB', {
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

    const nlbSG = new ec2.SecurityGroup(this, 'MemoryDbNlbSG', {
      vpc: props.vpc,
      description: 'Security group for MemoryDB NLB',
      allowAllOutbound: true,
    });
    nlbSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(6379),
      'Allow Redis traffic from anywhere',
    );
    logger.debug('Created and configured NLB security group');

    memoryDbSG.addIngressRule(
      ec2.Peer.securityGroupId(nlbSG.securityGroupId),
      ec2.Port.tcp(6379),
      'Allow Redis traffic from NLB',
    );
    logger.debug('Added ingress rule to MemoryDB security group');

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
          const aws = require('aws-sdk');
          const elbv2 = new aws.ELBv2();
          
          if (event.RequestType === 'Create' || event.RequestType === 'Update') {
            await elbv2.registerTargets({
              TargetGroupArn: '${targetGroup.targetGroupArn}',
              Targets: [{
                Id: '${redisCluster.attrClusterEndpointAddress}',
                Port: 6379
              }]
            }).promise();
          }
          
          return { PhysicalResourceId: 'RegisterTarget' };
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
      value: redisCluster.attrClusterEndpointAddress,
      description: 'MemoryDB cluster private endpoint',
    });

    this.redisPublicHostOutput = new cdk.CfnOutput(this, 'RedisPublicEndpoint', {
      exportName: `${this.stackName}-RedisPublicEndpoint`,
      value: nlb.loadBalancerDnsName,
      description: 'MemoryDB public endpoint (via NLB)',
    });
    logger.debug('Added Redis endpoints outputs');
  }
}
