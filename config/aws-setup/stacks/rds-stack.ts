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
  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);

    const dbSG = new ec2.SecurityGroup(this, 'RdsSecurityGroup', {
      vpc: props.vpc,
      description: 'RDS PostgreSQL Security Group',
      allowAllOutbound: true,
    });

    // If you truly need public access (e.g. from Vercel), allow inbound from anywhere on port 5432.
    // This is not recommended for production. But if it's truly required:
    if (cfg.publicDbAccess) {
      dbSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5432), 'Public inbound for Postgres');
    }

    // Create a secret for the DB credentials
    const dbSecret = new rds.DatabaseSecret(this, 'DbSecret', {
      secretName: `ap-rds-secret-${cfg.environment}`,
      username: 'postgres',
    });

    // Create an RDS instance
    new rds.DatabaseInstance(this, 'ApadanaPostgres', {
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
      publiclyAccessible: cfg.publicDbAccess, // This sets up a public IP
      databaseName: 'ap_db',
      instanceIdentifier: `ap-rds-${cfg.environment}`,
      storageEncrypted: true,
      autoMinorVersionUpgrade: true
    });
  }
}
