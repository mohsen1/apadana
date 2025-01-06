import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface BootstrapStackProps extends cdk.StackProps {
  environment: string;
}

export class BootstrapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BootstrapStackProps) {
    super(scope, id, props);

    // Create the CDK toolkit bucket
    const cdkBucket = new s3.Bucket(this, 'CdkToolkitBucket', {
      bucketName: `cdk-hnb659fds-assets-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create the CDK execution role
    const executionRole = new iam.Role(this, 'CdkExecutionRole', {
      roleName: `cdk-hnb659fds-cfn-exec-role-${this.account}-${this.region}`,
      assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
    });

    // Create the CDK deploy role
    const deployRole = new iam.Role(this, 'CdkDeployRole', {
      roleName: `cdk-hnb659fds-deploy-role-${this.account}-${this.region}`,
      assumedBy: new iam.AccountPrincipal(this.account),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
    });

    // Create the file publishing role
    const filePublishingRole = new iam.Role(this, 'CdkFilePublishingRole', {
      roleName: `cdk-hnb659fds-file-publishing-role-${this.account}-${this.region}`,
      assumedBy: new iam.AccountPrincipal(this.account),
    });

    // Add bucket permissions to the file publishing role
    cdkBucket.grantReadWrite(filePublishingRole);

    // Create the lookup role
    const lookupRole = new iam.Role(this, 'CdkLookupRole', {
      roleName: `cdk-hnb659fds-lookup-role-${this.account}-${this.region}`,
      assumedBy: new iam.AccountPrincipal(this.account),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess')],
    });

    // Outputs
    new CfnOutput(this, 'CdkToolkitBucketOutput', {
      value: cdkBucket.bucketName,
      description: 'The name of the CDK toolkit bucket',
    });

    new CfnOutput(this, 'CdkExecutionRoleArnOutput', {
      value: executionRole.roleArn,
      description: 'The ARN of the CDK execution role',
    });

    new CfnOutput(this, 'CdkDeployRoleArnOutput', {
      value: deployRole.roleArn,
      description: 'The ARN of the CDK deploy role',
    });
  }
}
