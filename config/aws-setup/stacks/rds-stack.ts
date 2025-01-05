import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface RDSStackProps extends cdk.StackProps {
  environment: string;
}

export class RDSStack extends cdk.Stack {
  public readonly instance: rds.DatabaseInstance;

  constructor(scope: Construct, id: string, props: RDSStackProps) {
    super(scope, id, props);

    // Import the shared VPC
    const sharedVpc = ec2.Vpc.fromLookup(this, 'ImportedSharedVpc', {
      vpcName: 'apadana-shared-vpc',
    });

    // Create environment-specific security group
    const rdsSG = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
      vpc: sharedVpc,
      description: `Security group for RDS - ${props.environment}`,
      allowAllOutbound: true,
      securityGroupName: `apadana-rds-sg-${props.environment}`,
    });
    rdsSG.addIngressRule(ec2.Peer.ipv4(sharedVpc.vpcCidrBlock), ec2.Port.tcp(5432));

    // Create secret for RDS credentials
    const secret = new secretsmanager.Secret(this, 'RDSSecret', {
      secretName: `apadana-${props.environment}-db-password`,
      description: `Database password for Apadana ${props.environment} environment`,
      generateSecretString: {
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 32,
        excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
      },
      removalPolicy:
        props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    this.instance = new rds.DatabaseInstance(this, 'PostgresInstance', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceIdentifier: `apadana-${props.environment}`,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      vpc: sharedVpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [rdsSG],
      databaseName: 'apadana',
      credentials: rds.Credentials.fromSecret(secret, 'postgres'),
      backupRetention: cdk.Duration.days(7),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      publiclyAccessible: false,
      removalPolicy:
        props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      deletionProtection: props.environment === 'production',
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
