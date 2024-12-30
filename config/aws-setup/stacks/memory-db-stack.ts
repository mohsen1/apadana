import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as memorydb from 'aws-cdk-lib/aws-memorydb';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

import { SecurityConfig } from '../security-config';

interface MemoryDBStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
  environment: string;
  nodeType?: string;
  numShards?: number;
  numReplicasPerShard?: number;
  engineVersion?: string;
  port?: number;
}

export class MemoryDBStack extends cdk.Stack {
  private resourceName(name: string): string {
    return `apadana-${name}-${this.account}-${this.region}-${this.props.environment}`;
  }

  private shortResourceName(name: string): string {
    // Create a shorter name format for resources with length limits
    return `ap-${name}-${this.props.environment}`;
  }

  constructor(
    scope: Construct,
    id: string,
    private props: MemoryDBStackProps,
  ) {
    super(scope, id, props);

    // Create KMS key for encryption
    const key = new kms.Key(this, 'MemoryDBKey', {
      enableKeyRotation: SecurityConfig.memoryDb.encryption.kmsKeyRotation,
      description: `KMS key for MemoryDB encryption - ${props.environment}`,
    });

    // Create CloudWatch log group for future use
    // Note: Currently, CDK doesn't support direct log delivery configuration
    // This log group is created for future manual configuration
    const logGroup = new logs.LogGroup(this, 'MemoryDBLogs', {
      logGroupName: this.resourceName('memorydb-logs'),
      retention: 30, // 30 days
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      encryptionKey: key,
    });

    // Create subnet group for MemoryDB
    const subnetGroup = new memorydb.CfnSubnetGroup(this, 'MemoryDBSubnetGroup', {
      subnetIds: props.vpc.privateSubnets.map((subnet) => subnet.subnetId),
      subnetGroupName: this.resourceName('memorydb-subnet'),
    });

    // Create secret for MemoryDB user password
    const secret = new secretsmanager.Secret(this, 'MemoryDBSecret', {
      description: `MemoryDB user password for ${props.environment}`,
      secretName: this.resourceName('memorydb-secret'),
      generateSecretString: {
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 32,
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
    });

    // Create user for MemoryDB with restricted permissions
    const user = new memorydb.CfnUser(this, 'MemoryDBUser', {
      userName: this.shortResourceName('mdb-user'),
      accessString: SecurityConfig.memoryDb.accessString,
      authenticationMode: {
        Type: 'password',
        Passwords: [secret.secretValue.toString()],
      },
    });

    // Create ACL for MemoryDB
    const acl = new memorydb.CfnACL(this, 'MemoryDBACL', {
      aclName: this.resourceName('memorydb-acl'),
      userNames: [user.userName],
    });

    acl.addDependency(user);

    // Create MemoryDB cluster with security configurations
    const memoryDbCluster = new memorydb.CfnCluster(this, 'ApadanaMemoryDB', {
      clusterName: this.resourceName('memorydb'),
      nodeType: props.nodeType || 'db.t4g.small',
      numShards: props.numShards || 1,
      numReplicasPerShard: props.numReplicasPerShard || 1,
      subnetGroupName: subnetGroup.subnetGroupName,
      aclName: acl.aclName,
      engineVersion: props.engineVersion || '7.0',
      port: props.port || 6379,
      securityGroupIds: [props.securityGroup.securityGroupId],
      tlsEnabled: SecurityConfig.memoryDb.encryption.inTransit,
      kmsKeyId: key.keyArn,
      snapshotWindow: SecurityConfig.memoryDb.backup.snapshotWindow,
      snapshotRetentionLimit: SecurityConfig.memoryDb.backup.retentionDays,
      maintenanceWindow: SecurityConfig.memoryDb.backup.preferredMaintenanceWindow,
      tags: [
        { key: 'Name', value: this.resourceName('memorydb') },
        { key: 'Project', value: 'Apadana' },
        { key: 'Environment', value: props.environment },
      ],
    });

    // Add dependencies
    memoryDbCluster.addDependency(subnetGroup);
    memoryDbCluster.addDependency(acl);

    // Output the cluster endpoint
    new cdk.CfnOutput(this, 'ClusterEndpoint', {
      value: memoryDbCluster.attrClusterEndpointAddress,
      description: 'MemoryDB Cluster Endpoint',
      exportName: this.resourceName('memorydb-endpoint'),
    });

    new cdk.CfnOutput(this, 'ClusterPort', {
      value: memoryDbCluster.port?.toString() || '6379',
      description: 'MemoryDB Cluster Port',
      exportName: this.resourceName('memorydb-port'),
    });

    new cdk.CfnOutput(this, 'MemoryDBUserName', {
      value: user.userName,
      description: 'MemoryDB User Name',
      exportName: this.resourceName('memorydb-username'),
    });

    new cdk.CfnOutput(this, 'MemoryDBSecretArn', {
      value: secret.secretArn,
      description: 'MemoryDB Secret ARN',
      exportName: this.resourceName('memorydb-secret-arn'),
    });

    // Output log group name for manual configuration
    new cdk.CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'CloudWatch Log Group for MemoryDB',
      exportName: this.resourceName('memorydb-log-group'),
    });
  }
}
