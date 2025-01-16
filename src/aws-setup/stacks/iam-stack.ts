import * as cdk from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { BaseStack, BaseStackProps } from './base-stack';

const logger = createLogger(import.meta.filename);

export class IamStack extends BaseStack {
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
            'execute-api:*',
            'route53:*',
            'acm:*',
            'cloudfront:*',
            'events:*',
            'sqs:*',
            'dynamodb:*',
            'wafv2:*',
            'cloudwatch:*',
            'logs:*',
            'codebuild:*',
            'codepipeline:*',
            'iam:PassRole',
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
  }
}
