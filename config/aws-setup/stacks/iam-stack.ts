import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_iam as iam } from 'aws-cdk-lib';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

interface IamStackProps extends cdk.StackProps {
  environment: string;
}

export class IamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);

    logger.info(`Creating IAM stack for environment: ${props.environment}`);

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
            'secretsmanager:*'
          ],
          resources: ['*'],
        }),
      ],
    });
    logger.debug('Created deployment policy');
  }
}
