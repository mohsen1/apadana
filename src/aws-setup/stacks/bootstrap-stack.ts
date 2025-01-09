import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { BaseStack, BaseStackProps } from './base-stack';

export class BootstrapStack extends BaseStack {
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    // Create the CDK toolkit bucket with standard name
    const cdkBucket = new s3.Bucket(this, 'StagingBucket', {
      bucketName: `cdk-${this.account}-assets-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Create the CDK execution role with standard name
    const executionRole = new iam.Role(this, 'CloudFormationExecutionRole', {
      roleName: `cdk-${props.environment}-cfn-exec-role-${this.account}-${this.region}`,
      assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
    });

    // Create the CDK deploy role with standard name
    const deployRole = new iam.Role(this, 'DeployRole', {
      roleName: `cdk-${props.environment}-deploy-role-${this.account}-${this.region}`,
      assumedBy: new iam.AccountPrincipal(this.account),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
    });

    // Create the file publishing role with standard name
    const filePublishingRole = new iam.Role(this, 'FilePublishingRole', {
      roleName: `cdk-${props.environment}-file-publishing-role-${this.account}-${this.region}`,
      assumedBy: new iam.AccountPrincipal(this.account),
    });

    // Add bucket permissions to the file publishing role
    cdkBucket.grantReadWrite(filePublishingRole);

    // Create the lookup role with standard name
    new iam.Role(this, 'LookupRole', {
      roleName: `cdk-${props.environment}-lookup-role-${this.account}-${this.region}`,
      assumedBy: new iam.AccountPrincipal(this.account),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('ReadOnlyAccess')],
    });

    // Outputs
    new CfnOutput(this, 'BucketName', {
      value: cdkBucket.bucketName,
      description: 'The name of the CDK toolkit bucket',
    });

    new CfnOutput(this, 'ExecutionRoleArn', {
      value: executionRole.roleArn,
      description: 'The ARN of the CDK execution role',
    });

    new CfnOutput(this, 'DeployRoleArn', {
      value: deployRole.roleArn,
      description: 'The ARN of the CDK deploy role',
    });
  }
}
