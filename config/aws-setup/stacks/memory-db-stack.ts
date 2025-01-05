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

    const sharedVpc = ec2.Vpc.fromLookup(this, 'ImportedSharedVpc', {
      vpcId: 'vpc-082ee4f6e9a6a861f',
    });

    const memoryDbSG = new ec2.SecurityGroup(this, 'MemoryDBSecurityGroup', {
      vpc: sharedVpc,
      description: `Security group for MemoryDB - ${props.environment}`,
      allowAllOutbound: true,
      securityGroupName: `apadana-memorydb-sg-${props.environment}`,
    });

    // Allow inbound access from the VPC CIDR
    memoryDbSG.addIngressRule(
      ec2.Peer.ipv4(sharedVpc.vpcCidrBlock),
      ec2.Port.tcp(props.port || 6379),
      'Allow Redis access from within VPC',
    );

    // Temporarily allow all inbound traffic for testing
    memoryDbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(props.port || 6379));

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
    let secret: secretsmanager.ISecret;
    let memoryDbPassword: string;

    try {
      // Try to import existing secret
      secret = secretsmanager.Secret.fromSecretNameV2(this, 'MemoryDBSecret', secretName);
      console.log('Using existing MemoryDB secret');
      memoryDbPassword = secret.secretValue.unsafeUnwrap();
    } catch (error) {
      // Create new secret with a timestamp to avoid conflicts
      const timestamp = new Date().getTime();
      const newSecretName = `${secretName}-${timestamp}`;
      const tempPassword = 'TempPassword123!'; // Temporary password for initial creation

      secret = new secretsmanager.Secret(this, 'MemoryDBSecret', {
        description: `MemoryDB user password for ${props.environment}`,
        secretName: newSecretName,
        generateSecretString: {
          excludePunctuation: true,
          includeSpace: false,
          passwordLength: 32,
          excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
        },
        removalPolicy:
          props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      });
      console.log('Created new MemoryDB secret with name:', newSecretName);
      memoryDbPassword = tempPassword;
    }

    // Create MemoryDB user with forced dependency on secret
    const userName = `apadana-user-${props.environment}`;
    const user = new memorydb.CfnUser(this, 'MemoryDBUser', {
      userName,
      accessString: SecurityConfig.memoryDb.accessString,
      authenticationMode: {
        Type: 'password',
        Passwords: [memoryDbPassword],
      },
    });

    // Force dependency on secret
    user.node.addDependency(secret);
    user.cfnOptions.deletionPolicy =
      props.environment === 'production'
        ? cdk.CfnDeletionPolicy.RETAIN
        : cdk.CfnDeletionPolicy.DELETE;

    // Create ACL with forced dependency on user
    const aclName = `apadana-acl-${props.environment}`;
    const acl = new memorydb.CfnACL(this, 'MemoryDBACL', {
      aclName,
      userNames: [userName],
    });

    // Force dependency on user
    acl.node.addDependency(user);
    acl.cfnOptions.deletionPolicy =
      props.environment === 'production'
        ? cdk.CfnDeletionPolicy.RETAIN
        : cdk.CfnDeletionPolicy.DELETE;

    const clusterName = `apadana-${props.environment}`;
    const cluster = new memorydb.CfnCluster(this, 'MemoryDBCluster', {
      clusterName,
      nodeType: props.nodeType || 'db.t4g.medium',
      numShards: props.numShards || 1,
      numReplicasPerShard: props.numReplicasPerShard || 1,
      engineVersion: props.engineVersion || '7.0',
      port: props.port || 6379,
      securityGroupIds: [memoryDbSG.securityGroupId],
      subnetGroupName: subnetGroup.subnetGroupName,
      tlsEnabled: true,
      kmsKeyId: key.keyArn,
      autoMinorVersionUpgrade: true,
      snapshotRetentionLimit: props.environment === 'production' ? 7 : 1,
      snapshotWindow: SecurityConfig.memoryDb.backup.snapshotWindow,
      maintenanceWindow: SecurityConfig.memoryDb.backup.preferredMaintenanceWindow,
      aclName: aclName,
    });

    // Force dependencies
    cluster.node.addDependency(acl);
    cluster.node.addDependency(subnetGroup);

    cluster.cfnOptions.deletionPolicy =
      props.environment === 'production'
        ? cdk.CfnDeletionPolicy.RETAIN
        : cdk.CfnDeletionPolicy.DELETE;

    // Outputs
    new cdk.CfnOutput(this, 'ClusterEndpoint', {
      value: cluster.attrClusterEndpointAddress,
      description: 'MemoryDB Cluster Endpoint',
      exportName: `apadana-memorydb-endpoint-${props.environment}`,
    });

    new cdk.CfnOutput(this, 'ClusterPort', {
      value: (props.port || 6379).toString(),
      description: 'MemoryDB Cluster Port',
      exportName: `apadana-memorydb-port-${props.environment}`,
    });

    new cdk.CfnOutput(this, 'MemoryDBUserName', {
      value: userName,
      description: 'MemoryDB User Name',
      exportName: `apadana-memorydb-username-${props.environment}`,
    });

    new cdk.CfnOutput(this, 'MemoryDBSecretArn', {
      value: secret.secretArn,
      description: 'MemoryDB Secret ARN',
      exportName: `apadana-memorydb-secret-arn-${props.environment}`,
    });

    // Tag all resources
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Project', 'Apadana');
  }
}
