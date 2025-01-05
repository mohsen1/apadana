import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface RDSStackProps extends cdk.StackProps {
  environment: string;
  useExisting?: boolean;
  instanceClass?: string;
  allocatedStorage?: number;
}

export class RDSStack extends cdk.Stack {
  public readonly instance: rds.IDatabaseInstance;

  constructor(scope: Construct, id: string, props: RDSStackProps) {
    super(scope, id, props);

    const sharedVpc = ec2.Vpc.fromLookup(this, 'ImportedSharedVpc', {
      vpcId: 'vpc-082ee4f6e9a6a861f',
    });

    const rdsSG = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
      vpc: sharedVpc,
      description: `Security group for RDS - ${props.environment}`,
      allowAllOutbound: true,
      securityGroupName: `apadana-rds-sg-${props.environment}`,
    });

    // Temporarily allow all inbound traffic for testing
    rdsSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from anywhere (temporary)',
    );

    // Allow inbound access from the VPC CIDR
    rdsSG.addIngressRule(
      ec2.Peer.ipv4(sharedVpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from within VPC',
    );

    const secretName = `apadana-${props.environment}-db-password`;
    let secret: secretsmanager.ISecret;
    try {
      // Try to import existing secret
      secret = secretsmanager.Secret.fromSecretNameV2(this, 'RDSSecret', secretName);
      console.log('Using existing RDS secret');
    } catch (error) {
      // Create new secret with a timestamp to avoid conflicts
      const timestamp = new Date().getTime();
      const newSecretName = `${secretName}-${timestamp}`;
      secret = new secretsmanager.Secret(this, 'RDSSecret', {
        secretName: newSecretName,
        description: `Database password for Apadana ${props.environment} environment`,
        generateSecretString: {
          excludePunctuation: true,
          includeSpace: false,
          passwordLength: 32,
          excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
          secretStringTemplate: JSON.stringify({
            username: 'postgres',
            dbname: 'apadana',
            engine: 'postgres',
            port: 5432,
            host: 'PLACEHOLDER',
          }),
          generateStringKey: 'password',
        },
        removalPolicy:
          props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      });
      console.log('Created new RDS secret with name:', newSecretName);
    }

    const instanceIdentifier = `apadana-${props.environment}`;

    // Create a custom parameter group
    const parameterGroup = new rds.ParameterGroup(this, 'CustomParameterGroup', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      description: `Custom parameter group for Apadana ${props.environment}`,
      parameters: {
        tcp_keepalives_idle: '60',
        tcp_keepalives_interval: '10',
        tcp_keepalives_count: '6',
        idle_in_transaction_session_timeout: '60000',
      },
    });

    // Determine instance type based on environment
    const instanceType = props.instanceClass
      ? ec2.InstanceType.of(ec2.InstanceClass.T3, props.instanceClass as ec2.InstanceSize)
      : ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM);

    // Create new instance
    this.instance = new rds.DatabaseInstance(this, 'PostgresInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceIdentifier,
      instanceType,
      vpc: sharedVpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
        onePerAz: true,
      },
      securityGroups: [rdsSG],
      databaseName: 'apadana',
      credentials: rds.Credentials.fromSecret(secret, 'postgres'),
      backupRetention: cdk.Duration.days(props.environment === 'production' ? 7 : 1),
      allocatedStorage: props.allocatedStorage || 20,
      maxAllocatedStorage: props.environment === 'production' ? 100 : 50,
      publiclyAccessible: true,
      removalPolicy:
        props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      deletionProtection: props.environment === 'production',
      networkType: rds.NetworkType.IPV4,
      port: 5432,
      parameterGroup,
    });

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.instance.instanceEndpoint.hostname,
      description: 'Database endpoint',
      exportName: `ApadanaDatabaseEndpoint-${props.environment}`,
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: secret.secretArn,
      description: 'Database credentials secret ARN',
      exportName: `ApadanaDatabaseSecretArn-${props.environment}`,
    });

    // Tag all resources
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Project', 'Apadana');
  }
}
