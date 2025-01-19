import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2, aws_ecs as ecs, aws_elasticloadbalancingv2 as elb } from 'aws-cdk-lib';
import { aws_secretsmanager as secretsmanager } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createRequire } from 'module';
import seedrandom from 'seedrandom';

import { createLogger } from '@/utils/logger';

import { BaseStack, BaseStackProps } from './base-stack';
import { getEnvConfig } from '../config/factory';
const require = createRequire(import.meta.url);
const forge = require('node-forge') as typeof import('node-forge');

const logger = createLogger(import.meta.filename);

// Helper function to generate self-signed certificate
function generateSelfSignedCertificate(domain: string, environment: string) {
  // Use a deterministic seed based on domain and environment
  const seed = `${domain}-${environment}-fixed-seed-v1`;
  const random = seedrandom(seed);

  // Generate deterministic key pair using seeded random
  const keys = forge.pki.rsa.generateKeyPair({
    bits: 2048,
    e: 0x10001, // 65537
    prng: {
      // Implement deterministic random number generator
      getBytesSync: (count: number) => {
        const buffer = new forge.util.ByteStringBuffer();
        for (let i = 0; i < count; i++) {
          buffer.putByte(Math.floor(random() * 256));
        }
        return buffer.getBytes();
      },
    },
  });

  // Create certificate with fixed dates
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';

  // Use fixed dates for certificate validity
  const baseDate = new Date('2025-01-01T00:00:00Z');
  cert.validity.notBefore = baseDate;
  cert.validity.notAfter = new Date(baseDate);
  cert.validity.notAfter.setFullYear(baseDate.getFullYear() + 10); // 10 year validity

  const attrs = [
    {
      name: 'commonName',
      value: domain,
    },
    {
      name: 'organizationName',
      value: 'Apadana',
    },
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // Sign certificate with private key
  cert.sign(keys.privateKey);

  return {
    cert: forge.pki.certificateToPem(cert),
    key: forge.pki.privateKeyToPem(keys.privateKey),
  };
}

interface RedisProxyStackProps extends BaseStackProps {
  environment: string;
  vpc: ec2.IVpc;
  redisEndpoint: string;
  removalPolicy?: cdk.RemovalPolicy;
}

export class RedisProxyStack extends BaseStack {
  public readonly proxyEndpointOutput: cdk.CfnOutput;
  public readonly proxySecurityGroupOutput: cdk.CfnOutput;
  public readonly proxySecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: RedisProxyStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating Redis Proxy stack for environment: ${props.environment}`);

    // Add service-specific tag
    cdk.Tags.of(this).add('service', 'redis-proxy');

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

    // Generate self-signed certificate
    const domain = `redis-proxy.${cfg.environment}.internal`;
    const { cert: certPem, key: keyPem } = generateSelfSignedCertificate(domain, props.environment);

    // Store certificate and key in Secrets Manager
    const certSecret = new secretsmanager.Secret(this, 'RedisProxyCertSecret', {
      secretName: `ap-redis-proxy-cert-${cfg.environment}`,
      description: 'SSL certificate for Redis proxy',
      secretStringValue: cdk.SecretValue.unsafePlainText(certPem),
    });

    const keySecret = new secretsmanager.Secret(this, 'RedisProxyKeySecret', {
      secretName: `ap-redis-proxy-key-${cfg.environment}`,
      description: 'SSL key for Redis proxy',
      secretStringValue: cdk.SecretValue.unsafePlainText(keyPem),
    });

    // Add container to forward traffic on port 6379
    const container = taskDef.addContainer('ProxyContainer', {
      image: ecs.ContainerImage.fromRegistry('alpine/socat'),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: `ap-redis-proxy-${cfg.environment}`,
      }),
      healthCheck: {
        command: ['CMD-SHELL', 'nc -z localhost 6379 || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
      },
      secrets: {
        CERT: ecs.Secret.fromSecretsManager(certSecret),
        KEY: ecs.Secret.fromSecretsManager(keySecret),
      },
      entryPoint: ['/bin/sh', '-c'],
      command: [
        'mkdir -p /etc/ssl/proxy && ' +
          'echo "$CERT" > /etc/ssl/proxy/cert.pem && ' +
          'echo "$KEY" > /etc/ssl/proxy/key.pem && ' +
          'chmod 600 /etc/ssl/proxy/key.pem && ' +
          'socat ' +
          'openssl-listen:6379,cert=/etc/ssl/proxy/cert.pem,key=/etc/ssl/proxy/key.pem,verify=0,fork,reuseaddr ' +
          `openssl-connect:${props.redisEndpoint}:6379,verify=0,servername=${props.redisEndpoint},nodelay`,
      ],
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
      assignPublicIp: false,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
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
