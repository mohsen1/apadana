import * as cdk from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

interface IamStackProps extends cdk.StackProps {
  environment: string;
}

export class IamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);

    logger.info(`Creating IAM stack for environment: ${props.environment}`);

    // Create policy for deployment and operations
    const devPolicy = new iam.ManagedPolicy(this, 'DevDeploymentPolicy', {
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
            'memorydb:*',
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
    const uploadPolicy = new iam.ManagedPolicy(this, 'S3UploadPolicy', {
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

    // Create a group for deployers
    new iam.Group(this, 'DeployerGroup', {
      groupName: `ap-deployer-group-${props.environment}`,
      managedPolicies: [devPolicy],
    });
    logger.debug('Created deployer group');

    // Create a role for Lambda functions that need to generate presigned URLs
    const uploadRole = new iam.Role(this, 'S3UploadRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for Lambda functions that generate S3 presigned URLs',
      managedPolicies: [uploadPolicy],
    });
    logger.debug('Created S3 upload role');

    new cdk.CfnOutput(this, 'UploadRoleArn', {
      exportName: `${this.stackName}-UploadRoleArn`,
      value: uploadRole.roleArn,
      description: 'ARN of the S3 upload role',
    });
  }
}
