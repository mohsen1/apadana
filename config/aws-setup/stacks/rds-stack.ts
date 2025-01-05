import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  aws_rds as rds,
  aws_ec2 as ec2,
  aws_secretsmanager as secretsmanager
} from 'aws-cdk-lib';
import { getEnvConfig } from '../config/factory';

interface RdsStackProps extends cdk.StackProps {
  environment: string;
  vpc: ec2.Vpc;
}

export class RdsStack extends cdk.Stack {
  public readonly rdsHostOutput: cdk.CfnOutput;
  public readonly rdsSecretNameOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);

    const dbSG = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: props.vpc,
      description: 'RDS PostgreSQL Security Group',
      allowAllOutbound: true,
    });

    if (cfg.publicDbAccess) {
      dbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5432), 'Public inbound for Postgres');
    }

    const dbSecret = new rds.DatabaseSecret(this, 'DbSecret', {
      secretName: `ap-rds-secret-${cfg.environment}`,
      username: 'postgres',
    });

    const dbInstance = new rds.DatabaseInstance(this, 'ApadanaPostgres', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MEDIUM
      ),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [dbSG],
      credentials: rds.Credentials.fromSecret(dbSecret),
      allocatedStorage: cfg.rdsAllocatedStorage,
      maxAllocatedStorage: cfg.rdsMaxAllocatedStorage,
      backupRetention: cdk.Duration.days(cfg.backupRetentionDays),
      deletionProtection: cfg.environment === 'production',
      publiclyAccessible: cfg.publicDbAccess,
      databaseName: 'ap_db',
      instanceIdentifier: `ap-rds-${cfg.environment}`,
      storageEncrypted: true,
      autoMinorVersionUpgrade: true
    });

    this.rdsHostOutput = new cdk.CfnOutput(this, 'RdsEndpoint', {
      exportName: `${this.stackName}-Endpoint`,
      value: dbInstance.instanceEndpoint.hostname,
      description: 'RDS endpoint'
    });

    this.rdsSecretNameOutput = new cdk.CfnOutput(this, 'RdsSecretName', {
      exportName: `${this.stackName}-SecretName`,
      value: dbSecret.secretName,
      description: 'Name of SecretsManager secret for RDS'
    });
  }
}
