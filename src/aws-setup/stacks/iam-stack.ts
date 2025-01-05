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
            'secretsmanager:CreateSecret',
            'secretsmanager:DeleteSecret',
            'secretsmanager:PutSecretValue',
            'secretsmanager:UpdateSecret',
            'secretsmanager:TagResource',
          ],
          resources: ['*'],
        }),
      ],
    });
    logger.debug('Created deployment policy');

    // Create a group for deployers
    const deployerGroup = new iam.Group(this, 'DeployerGroup', {
      groupName: `ap-deployer-group-${props.environment}`,
      managedPolicies: [devPolicy],
    });
    logger.debug('Created deployer group');
  }
}
