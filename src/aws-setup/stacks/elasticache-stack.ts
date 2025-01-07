import * as cdk from 'aws-cdk-lib';
import {
  aws_ec2 as ec2,
  aws_elasticache as elasticache,
  aws_elasticloadbalancingv2 as elbv2,
  aws_iam as iam,
  aws_lambda as lambda,
  CustomResource,
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

    // Lambda function to register Redis IP with target group
    const registerTargetFunction = new lambda.Function(this, 'RegisterTargetFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const dns = require('dns');
        const { promisify } = require('util');
        const lookup = promisify(dns.lookup);

        exports.handler = async (event, context) => {
          console.log('Event:', JSON.stringify(event, null, 2));

          try {
            // Skip processing if this is not a Create or Update
            if (event.RequestType !== 'Create' && event.RequestType !== 'Update') {
              return await sendResponse(event, context, 'SUCCESS');
            }

            const elbv2 = new AWS.ELBv2();
            const elasticache = new AWS.ElastiCache();

            // Get Redis node info
            const redisInfo = await elasticache.describeReplicationGroups({
              ReplicationGroupId: '${redisCluster.ref}'
            }).promise();

            const primaryEndpoint = redisInfo.ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint;
            console.log('Redis endpoint:', primaryEndpoint);

            // Resolve Redis DNS to IP
            const { address: redisIp } = await lookup(primaryEndpoint.Address);
            console.log('Redis IP:', redisIp);

            // Deregister any existing targets
            const targets = await elbv2.describeTargetHealth({
              TargetGroupArn: '${targetGroup.targetGroupArn}'
            }).promise();

            if (targets.TargetHealthDescriptions.length > 0) {
              await elbv2.deregisterTargets({
                TargetGroupArn: '${targetGroup.targetGroupArn}',
                Targets: targets.TargetHealthDescriptions.map(t => ({ Id: t.Target.Id }))
              }).promise();
            }

            // Register new target
            await elbv2.registerTargets({
              TargetGroupArn: '${targetGroup.targetGroupArn}',
              Targets: [{
                Id: redisIp,
                Port: 6379
              }]
            }).promise();

            return await sendResponse(event, context, 'SUCCESS', { redisIp });
          } catch (error) {
            console.error('Error:', error);
            return await sendResponse(event, context, 'FAILED', { error: error.message });
          }
        };

        // Helper to send response to CloudFormation
        async function sendResponse(event, context, status, data = {}) {
          const responseBody = {
            Status: status,
            Reason: status === 'FAILED' ? 'See CloudWatch logs' : 'OK',
            PhysicalResourceId: context.logStreamName,
            StackId: event.StackId,
            RequestId: event.RequestId,
            LogicalResourceId: event.LogicalResourceId,
            Data: data
          };

          const https = require('https');
          const url = require('url');
          const responseUrl = url.parse(event.ResponseURL);

          return new Promise((resolve, reject) => {
            const options = {
              hostname: responseUrl.hostname,
              port: 443,
              path: responseUrl.path,
              method: 'PUT',
              headers: {
                'Content-Type': '',
                'Content-Length': Buffer.byteLength(JSON.stringify(responseBody))
              }
            };

            const request = https.request(options, response => {
              console.log('Status:', response.statusCode);
              console.log('Headers:', JSON.stringify(response.headers));
              resolve();
            });

            request.on('error', error => {
              console.error('Send response failed:', error);
              reject(error);
            });

            request.write(JSON.stringify(responseBody));
            request.end();
          });
        }
      `),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
      description: 'Registers ElastiCache IP with NLB target group',
    });

    // Add required permissions
    registerTargetFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'elasticloadbalancing:RegisterTargets',
          'elasticloadbalancing:DeregisterTargets',
          'elasticloadbalancing:DescribeTargetHealth',
        ],
        resources: [targetGroup.targetGroupArn],
      }),
    );

    registerTargetFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['elasticache:DescribeReplicationGroups'],
        resources: ['*'],
      }),
    );

    // Create custom resource to trigger Lambda
    new CustomResource(this, 'RegisterRedisTarget', {
      serviceToken: registerTargetFunction.functionArn,
      properties: {
        UpdateToken: new Date().toISOString(), // Force update on each deployment
      },
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
  }
}
