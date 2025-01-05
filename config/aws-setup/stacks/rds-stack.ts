import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface RDSStackProps extends cdk.StackProps {
  environment: string;
  useExisting?: boolean;
}

export class RDSStack extends cdk.Stack {
  public readonly instance: rds.IDatabaseInstance;

  constructor(scope: Construct, id: string, props: RDSStackProps) {
    super(scope, id, props);

    const sharedVpc = ec2.Vpc.fromLookup(this, 'ImportedSharedVpc', {
      vpcName: 'apadana-shared-vpc',
    });

    const rdsSG = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
      vpc: sharedVpc,
      description: `Security group for RDS - ${props.environment}`,
      allowAllOutbound: true,
      securityGroupName: `apadana-rds-sg-${props.environment}`,
    });
    rdsSG.addIngressRule(ec2.Peer.ipv4(sharedVpc.vpcCidrBlock), ec2.Port.tcp(5432));

    const secretName = `apadana-${props.environment}-db-password`;
    const secret = new secretsmanager.Secret(this, 'RDSSecret', {
      secretName,
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

    const instanceIdentifier = `apadana-${props.environment}`;

    if (props.useExisting) {
      // Import existing instance by identifier
      this.instance = rds.DatabaseInstance.fromDatabaseInstanceAttributes(this, 'ImportedDB', {
        instanceEndpointAddress: cdk.Fn.importValue(`ApadanaDatabaseEndpoint-${props.environment}`),
        instanceIdentifier,
        port: 5432,
        securityGroups: [rdsSG],
      });
    } else {
      // Create new instance
      this.instance = new rds.DatabaseInstance(this, 'PostgresInstance', {
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_15,
        }),
        instanceIdentifier,
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
    }

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
