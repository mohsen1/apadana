import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as memorydb from 'aws-cdk-lib/aws-memorydb';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';
import { SecurityConfig } from '../security-config';

const logger = createLogger('MemoryDBStack');

interface MemoryDBStackProps extends cdk.StackProps {
  environment: string;
  useExisting?: boolean;
  nodeType?: string;
  numShards?: number;
  numReplicasPerShard?: number;
  engineVersion?: string;
  port?: number;
}

export class MemoryDBStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MemoryDBStackProps) {
    super(scope, id, props);

    const isProd = props.environment === 'production';

    // Only try to import existing cluster if useExisting is true
    if (props.useExisting) {
      try {
        const existingCluster = cdk.Fn.importValue(
          `apadana-memorydb-endpoint-${props.environment}`,
        );
        if (existingCluster) {
          logger.info('Successfully imported existing MemoryDB cluster');
          return;
        }
      } catch (error) {
        logger.info('No existing MemoryDB cluster found, creating new one');
      }
    }

    // Import the shared VPC using the exported value
    const sharedVpcId = cdk.Fn.importValue('ApadanaSharedVpcId');
    const sharedVpc = ec2.Vpc.fromVpcAttributes(this, 'ImportedSharedVpc', {
      vpcId: sharedVpcId,
      availabilityZones: cdk.Stack.of(this).availabilityZones,
      privateSubnetIds: [
        cdk.Fn.importValue('ApadanaPrivateSubnet1Id'),
        cdk.Fn.importValue('ApadanaPrivateSubnet2Id'),
      ],
    });

    const memoryDbSG = new ec2.SecurityGroup(this, 'MemoryDBSecurityGroup', {
      vpc: sharedVpc,
      description: `Security group for MemoryDB - ${props.environment}`,
      allowAllOutbound: true,
      securityGroupName: `apadana-memorydb-sg-${props.environment}`,
    });
    memoryDbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(6379));

    const key = new kms.Key(this, 'MemoryDBKey', {
      alias: `apadana-memorydb-key-${props.environment}`,
      description: `KMS key for MemoryDB encryption - ${props.environment}`,
      enableKeyRotation: true,
      removalPolicy:
        props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    const logGroupName = `/apadana/memorydb/${props.environment}`;
    const logGroup = logs.LogGroup.fromLogGroupName(this, 'MemoryDBLogs', logGroupName);

    const subnetGroupName = `apadana-memorydb-subnet-${props.environment}`;
    const subnetGroup = new memorydb.CfnSubnetGroup(this, 'MemoryDBSubnetGroup', {
      subnetIds: sharedVpc.privateSubnets.map((subnet) => subnet.subnetId),
      subnetGroupName,
    });
    subnetGroup.cfnOptions.deletionPolicy =
      props.environment === 'production'
        ? cdk.CfnDeletionPolicy.RETAIN
        : cdk.CfnDeletionPolicy.DELETE;

    const secretName = `apadana-memorydb-secret-${props.environment}`;
    const secret = new secretsmanager.Secret(this, 'MemoryDBSecret', {
      description: `MemoryDB user password for ${props.environment}`,
      secretName,
      generateSecretString: {
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 32,
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
      removalPolicy:
        props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    const userName = `apadana-mdb-user-${props.environment}`;
    const clusterName = `apadana-${props.environment}`;

    // Create new user
    const user = new memorydb.CfnUser(this, 'MemoryDBUser', {
      userName,
      accessString: SecurityConfig.memoryDb.accessString,
      authenticationMode: {
        Type: 'password',
        Passwords: [secret.secretValue.toString()],
      },
    });
    user.cfnOptions.deletionPolicy =
      props.environment === 'production'
        ? cdk.CfnDeletionPolicy.RETAIN
        : cdk.CfnDeletionPolicy.DELETE;

    // Create new ACL
    const acl = new memorydb.CfnACL(this, 'MemoryDBACL', {
      aclName: `apadana-mdb-acl-${props.environment}`,
      userNames: [user.userName],
    });
    acl.cfnOptions.deletionPolicy =
      props.environment === 'production'
        ? cdk.CfnDeletionPolicy.RETAIN
        : cdk.CfnDeletionPolicy.DELETE;
    acl.addDependency(user);

    // Create new cluster with retention
    const memoryDbCluster = new memorydb.CfnCluster(this, 'ApadanaMemoryDB', {
      clusterName,
      nodeType: props.nodeType || 'db.t4g.small',
      numShards: props.numShards || 1,
      numReplicasPerShard: props.numReplicasPerShard || 1,
      subnetGroupName: subnetGroup.subnetGroupName,
      aclName: acl.aclName,
      engineVersion: props.engineVersion || '7.0',
      port: props.port || 6379,
      securityGroupIds: [memoryDbSG.securityGroupId],
      tlsEnabled: SecurityConfig.memoryDb.encryption.inTransit,
      kmsKeyId: key.keyArn,
      maintenanceWindow: SecurityConfig.memoryDb.backup.preferredMaintenanceWindow,
    });

    memoryDbCluster.addDependency(subnetGroup);
    memoryDbCluster.addDependency(acl);

    memoryDbCluster.addPropertyOverride('Tags', [
      { Key: 'Name', Value: `apadana-memorydb-${props.environment}` },
      { Key: 'Project', Value: 'Apadana' },
      { Key: 'Environment', Value: props.environment },
    ]);
    memoryDbCluster.cfnOptions.deletionPolicy = isProd
      ? cdk.CfnDeletionPolicy.RETAIN
      : cdk.CfnDeletionPolicy.DELETE;
    memoryDbCluster.cfnOptions.updateReplacePolicy = cdk.CfnDeletionPolicy.RETAIN;

    // Outputs
    new cdk.CfnOutput(this, 'ClusterEndpoint', {
      value: memoryDbCluster.attrClusterEndpointAddress,
      description: 'MemoryDB Cluster Endpoint',
      exportName: `apadana-memorydb-endpoint-${props.environment}`,
    });

    new cdk.CfnOutput(this, 'ClusterPort', {
      value: memoryDbCluster.port?.toString() || '6379',
      description: 'MemoryDB Cluster Port',
      exportName: `apadana-memorydb-port-${props.environment}`,
    });

    new cdk.CfnOutput(this, 'MemoryDBUserName', {
      value: user.userName,
      description: 'MemoryDB User Name',
      exportName: `apadana-memorydb-username-${props.environment}`,
    });

    new cdk.CfnOutput(this, 'MemoryDBSecretArn', {
      value: secret.secretArn,
      description: 'MemoryDB Secret ARN',
      exportName: `apadana-memorydb-secret-arn-${props.environment}`,
    });

    new cdk.CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'CloudWatch Log Group for MemoryDB',
      exportName: `apadana-memorydb-log-group-${props.environment}`,
    });

    // Tag all resources
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Project', 'Apadana');
  }
}
