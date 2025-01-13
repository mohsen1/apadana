import * as cdk from 'aws-cdk-lib';
import { aws_iam as iam, custom_resources as cr } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { BaseStack, BaseStackProps } from './base-stack';

const logger = createLogger(import.meta.filename);

export class IamStack extends BaseStack {
  public readonly deployerGroup: iam.IGroup;
  public readonly uploadRole: iam.Role;
  public readonly devPolicy: iam.ManagedPolicy;
  public readonly uploadPolicy: iam.ManagedPolicy;

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    logger.info(`Creating IAM stack for environment: ${props.environment}`);

    // Add service-specific tag
    cdk.Tags.of(this).add('service', 'iam');

    // Create policy for deployment and operations
    this.devPolicy = new iam.ManagedPolicy(this, 'DevDeploymentPolicy', {
      description: 'Allow needed actions for Apadana deployment',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'cloudformation:*',
            'ssm:*',
            's3:*',
            'iam:*',
            'lambda:*',
            'ec2:*',
            'elasticache:*',
            'rds:*',
            'secretsmanager:GetSecretValue',
            'secretsmanager:DescribeSecret',
            'secretsmanager:ListSecrets',
          ],
          resources: ['*'],
        }),
      ],
    });
    logger.debug('Created deployment policy');

    // Create policy for S3 uploads
    this.uploadPolicy = new iam.ManagedPolicy(this, 'S3UploadPolicy', {
      description: 'Allow S3 upload operations via presigned URLs',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject', 's3:ListBucket'],
          resources: [
            `arn:aws:s3:::ap-${props.environment}-${this.account}-${this.region}/*`,
            `arn:aws:s3:::ap-${props.environment}-${this.account}-${this.region}`,
          ],
        }),
      ],
    });
    logger.debug('Created S3 upload policy');

    // Create the deployer group using AwsCustomResource
    const groupName = `ap-deployer-group-${props.environment}`;
    const physicalResourceId = `${groupName}-resource`;

    // Create the deployer group
    new cr.AwsCustomResource(this, 'DeployerGroupResource', {
      onCreate: {
        service: 'IAM',
        action: 'createGroup',
        parameters: {
          GroupName: groupName,
        },
        physicalResourceId: cr.PhysicalResourceId.of(physicalResourceId),
      },
      onUpdate: {
        service: 'IAM',
        action: 'getGroup',
        parameters: {
          GroupName: groupName,
        },
        physicalResourceId: cr.PhysicalResourceId.of(physicalResourceId),
      },
      onDelete: {
        service: 'IAM',
        action: 'deleteGroup',
        parameters: {
          GroupName: groupName,
        },
        physicalResourceId: cr.PhysicalResourceId.of(physicalResourceId),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: ['*'],
      }),
    });

    // Attach policy to group
    new cr.AwsCustomResource(this, 'AttachGroupPolicy', {
      onCreate: {
        service: 'IAM',
        action: 'attachGroupPolicy',
        parameters: {
          GroupName: groupName,
          PolicyArn: this.devPolicy.managedPolicyArn,
        },
        physicalResourceId: cr.PhysicalResourceId.of(`${physicalResourceId}-policy`),
      },
      onUpdate: {
        service: 'IAM',
        action: 'attachGroupPolicy',
        parameters: {
          GroupName: groupName,
          PolicyArn: this.devPolicy.managedPolicyArn,
        },
        physicalResourceId: cr.PhysicalResourceId.of(`${physicalResourceId}-policy`),
      },
      onDelete: {
        service: 'IAM',
        action: 'detachGroupPolicy',
        parameters: {
          GroupName: groupName,
          PolicyArn: this.devPolicy.managedPolicyArn,
        },
        physicalResourceId: cr.PhysicalResourceId.of(`${physicalResourceId}-policy`),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: ['*'],
      }),
    });

    // Import the group after creation
    this.deployerGroup = iam.Group.fromGroupName(this, 'DeployerGroup', groupName);
    logger.debug('Created/updated deployer group');

    // Create a role for Lambda functions that need to generate presigned URLs
    this.uploadRole = new iam.Role(this, 'S3UploadRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for Lambda functions that generate S3 presigned URLs',
      managedPolicies: [this.uploadPolicy],
    });
    logger.debug('Created S3 upload role');

    new cdk.CfnOutput(this, 'UploadRoleArn', {
      exportName: `${this.stackName}-UploadRoleArn`,
      value: this.uploadRole.roleArn,
      description: 'ARN of the S3 upload role',
    });

    new cdk.CfnOutput(this, 'DeployerGroupName', {
      exportName: `${this.stackName}-DeployerGroupName`,
      value: this.deployerGroup.groupName,
      description: 'Name of the deployer group',
    });
  }
}
