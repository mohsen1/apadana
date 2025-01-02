import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

interface RDSStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
  environment: string;
}

export class RDSStack extends cdk.Stack {
  public readonly instance: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: RDSStackProps) {
    super(scope, id, props);

    this.instance = new rds.DatabaseInstance(this, 'PostgresInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceIdentifier: `apadana-${props.environment}`,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [props.securityGroup],
      databaseName: 'apadana',
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      backupRetention: cdk.Duration.days(7),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      publiclyAccessible: false,
      removalPolicy:
        props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      deletionProtection: props.environment === 'production',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.instance.instanceEndpoint.hostname,
      description: 'Database endpoint',
      exportName: `ApadanaDatabaseEndpoint-${props.environment}`,
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.instance.secret?.secretArn || '',
      description: 'Database credentials secret ARN',
      exportName: `ApadanaDatabaseSecretArn-${props.environment}`,
    });
  }
}
