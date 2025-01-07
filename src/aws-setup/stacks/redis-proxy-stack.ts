import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2, aws_ecs as ecs, aws_elasticloadbalancingv2 as elb } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { getEnvConfig } from '../config/factory';

const logger = createLogger(__filename);

interface RedisProxyStackProps extends cdk.StackProps {
  environment: string;
  vpc: ec2.IVpc;
  redisEndpoint: string;
  removalPolicy?: cdk.RemovalPolicy;
}

export class RedisProxyStack extends cdk.Stack {
  public readonly proxyEndpointOutput: cdk.CfnOutput;
  public readonly proxySecurityGroupOutput: cdk.CfnOutput;
  public readonly proxySecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: RedisProxyStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating Redis Proxy stack for environment: ${props.environment}`);

    cdk.Tags.of(this).add('managed-by', 'apadana-aws-setup');
    cdk.Tags.of(this).add('environment', props.environment);
    cdk.Tags.of(this).add('service', 'redis-proxy');
    cdk.Tags.of(this).add('created-at', new Date().toISOString());

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'RedisProxyCluster', {
      vpc: props.vpc,
      clusterName: `ap-redis-proxy-cluster-${cfg.environment}`,
      containerInsights: true,
    });
    logger.debug('Created ECS cluster');

    // Define a Fargate task for the TCP proxy
    const taskDef = new ecs.FargateTaskDefinition(this, 'RedisProxyTaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
      family: `ap-redis-proxy-task-${cfg.environment}`,
    });
    logger.debug('Created Fargate task definition');

    // Add a container to forward traffic on port 6379
    const container = taskDef.addContainer('ProxyContainer', {
      image: ecs.ContainerImage.fromRegistry('alpine/socat'),
      command: [
        'tcp-listen:6379,fork,reuseaddr',
        // Use TLS for connecting to ElastiCache
        `openssl-connect:${props.redisEndpoint}:6379,verify=0`,
      ],
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: `ap-redis-proxy-${cfg.environment}`,
      }),
      healthCheck: {
        command: ['CMD-SHELL', 'nc -z localhost 6379 || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
      },
    });
    container.addPortMappings({ containerPort: 6379 });
    logger.debug('Added proxy container to task definition');

    // Security group for the ECS service
    const serviceSG = new ec2.SecurityGroup(this, 'RedisProxyServiceSG', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: 'Security group for Redis proxy service',
    });
    serviceSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(6379),
      'Allow inbound Redis traffic from anywhere',
    );

    this.proxySecurityGroup = serviceSG;
    this.proxySecurityGroupOutput = new cdk.CfnOutput(this, 'ProxySecurityGroupId', {
      exportName: `${this.stackName}-SecurityGroupId`,
      value: serviceSG.securityGroupId,
      description: 'Security group ID for Redis proxy service',
    });

    // Add ingress rule to ElastiCache security group
    const elasticacheSGId = cdk.Fn.importValue(
      `ap-elasticache-${props.environment}-RedisSecurityGroupId`,
    );
    const elasticacheSG = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'ImportedElastiCacheSG',
      elasticacheSGId,
      { allowAllOutbound: true, mutable: true },
    );
    elasticacheSG.addIngressRule(
      ec2.Peer.securityGroupId(serviceSG.securityGroupId),
      ec2.Port.tcp(6379),
      'Allow Redis traffic from proxy service',
    );

    logger.debug('Created security group for proxy service');

    // Create the Fargate service
    const service = new ecs.FargateService(this, 'RedisProxyService', {
      cluster,
      taskDefinition: taskDef,
      securityGroups: [serviceSG],
      desiredCount: 1,
      serviceName: `ap-redis-proxy-service-${cfg.environment}`,
      assignPublicIp: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });
    logger.debug('Created Fargate service');

    // Create a public Network Load Balancer
    const nlb = new elb.NetworkLoadBalancer(this, 'RedisProxyNLB', {
      vpc: props.vpc,
      internetFacing: true,
      loadBalancerName: `ap-redis-proxy-nlb-${cfg.environment}`,
    });
    logger.debug('Created Network Load Balancer');

    // Listener forwarding TCP on port 6379 to the Fargate service
    const listener = nlb.addListener('RedisListener', {
      port: 6379,
      protocol: elb.Protocol.TCP,
    });
    listener.addTargets('RedisProxyTargets', {
      port: 6379,
      protocol: elb.Protocol.TCP,
      targets: [service],
      healthCheck: {
        protocol: elb.Protocol.TCP,
        port: '6379',
        interval: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
      },
    });
    logger.debug('Added listener and targets to NLB');

    this.proxyEndpointOutput = new cdk.CfnOutput(this, 'RedisProxyEndpoint', {
      exportName: `${this.stackName}-ProxyEndpoint`,
      value: nlb.loadBalancerDnsName,
      description: 'Public Redis proxy endpoint (use this for Vercel)',
    });
  }
}
