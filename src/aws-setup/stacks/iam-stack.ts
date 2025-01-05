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

    // General deployment permissions
    const deploymentStatement = new iam.PolicyStatement({
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
      ],
      resources: ['*'],
    });

    // Specific Secrets Manager permissions
    const secretsStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret',
        'secretsmanager:CreateSecret',
        'secretsmanager:DeleteSecret',
        'secretsmanager:PutSecretValue',
        'secretsmanager:UpdateSecret',
        'secretsmanager:TagResource',
      ],
      resources: [
        // Allow managing all secrets during deployment
        `arn:aws:secretsmanager:${this.region}:${this.account}:secret:*`,
        // Specific read access to RDS secrets
        `arn:aws:secretsmanager:${this.region}:${this.account}:secret:ap-rds-secret-${props.environment}-*`,
      ],
    });

    const devPolicy = new iam.ManagedPolicy(this, 'DevDeploymentPolicy', {
      description: 'Allow needed actions for Apadana deployment',
      statements: [deploymentStatement, secretsStatement],
    });
    logger.debug('Created deployment policy');
  }
}
