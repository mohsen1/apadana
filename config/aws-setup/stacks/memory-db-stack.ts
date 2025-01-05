import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as memorydb from 'aws-cdk-lib/aws-memorydb';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

import { SecurityConfig } from '../security-config';

interface MemoryDBStackProps extends cdk.StackProps {
  environment: string;
  nodeType?: string;
  numShards?: number;
  numReplicasPerShard?: number;
  engineVersion?: string;
  port?: number;
}

export class MemoryDBStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MemoryDBStackProps) {
    super(scope, id, props);

    // Import the shared VPC
    const sharedVpc = ec2.Vpc.fromLookup(this, 'ImportedSharedVpc', {
      vpcName: 'apadana-shared-vpc',
    });

    // Create environment-specific security group
    const memoryDbSG = new ec2.SecurityGroup(this, 'MemoryDBSecurityGroup', {
      vpc: sharedVpc,
      description: `Security group for MemoryDB - ${props.environment}`,
      allowAllOutbound: true,
      securityGroupName: `apadana-memorydb-sg-${props.environment}`,
    });
    memoryDbSG.addIngressRule(ec2.Peer.ipv4(sharedVpc.vpcCidrBlock), ec2.Port.tcp(6379));

    // Create KMS key for encryption
    const key = new kms.Key(this, 'MemoryDBKey', {
      alias: `apadana-memorydb-key-${props.environment}`,
      description: `KMS key for MemoryDB encryption - ${props.environment}`,
      enableKeyRotation: true,
      removalPolicy:
        props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Create CloudWatch log group
    const logGroupName = `/apadana/memorydb/${props.environment}`;
    let logGroup: logs.ILogGroup;
    try {
      logGroup = logs.LogGroup.fromLogGroupName(this, 'MemoryDBLogs', logGroupName);
    } catch {
      logGroup = new logs.LogGroup(this, 'MemoryDBLogsGroup', {
        logGroupName,
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy:
          props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      });
    }

    // Create subnet group for MemoryDB
    const subnetGroup = new memorydb.CfnSubnetGroup(this, 'MemoryDBSubnetGroup', {
      subnetIds: sharedVpc.publicSubnets.map((subnet) => subnet.subnetId),
      subnetGroupName: `apadana-memorydb-subnet-${props.environment}`,
    });
    subnetGroup.cfnOptions.deletionPolicy =
      props.environment === 'production'
        ? cdk.CfnDeletionPolicy.RETAIN
        : cdk.CfnDeletionPolicy.DELETE;

    // Create secret for MemoryDB user password
    const secret = new secretsmanager.Secret(this, 'MemoryDBSecret', {
      description: `MemoryDB user password for ${props.environment}`,
      secretName: `apadana-memorydb-secret-${props.environment}`,
      generateSecretString: {
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 32,
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
      removalPolicy:
        props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Create user for MemoryDB with restricted permissions
    const user = new memorydb.CfnUser(this, 'MemoryDBUser', {
      userName: `apadana-mdb-user-${props.environment}`,
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

    // Create ACL for MemoryDB
    const acl = new memorydb.CfnACL(this, 'MemoryDBACL', {
      aclName: `apadana-mdb-acl-${props.environment}`,
      userNames: [user.userName],
    });
    acl.cfnOptions.deletionPolicy =
      props.environment === 'production'
        ? cdk.CfnDeletionPolicy.RETAIN
        : cdk.CfnDeletionPolicy.DELETE;

    acl.addDependency(user);

    // Create MemoryDB cluster with security configurations
    const memoryDbCluster = new memorydb.CfnCluster(this, 'ApadanaMemoryDB', {
      clusterName: `apadana-${props.environment}`,
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
      snapshotWindow: SecurityConfig.memoryDb.backup.snapshotWindow,
      snapshotRetentionLimit: SecurityConfig.memoryDb.backup.retentionDays,
      maintenanceWindow: SecurityConfig.memoryDb.backup.preferredMaintenanceWindow,
      tags: [
        { key: 'Name', value: `apadana-memorydb-${props.environment}` },
        { key: 'Project', value: 'Apadana' },
        { key: 'Environment', value: props.environment },
      ],
    });
    memoryDbCluster.cfnOptions.deletionPolicy =
      props.environment === 'production'
        ? cdk.CfnDeletionPolicy.RETAIN
        : cdk.CfnDeletionPolicy.DELETE;

    memoryDbCluster.addDependency(subnetGroup);
    memoryDbCluster.addDependency(acl);

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
