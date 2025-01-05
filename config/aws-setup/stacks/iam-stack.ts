 
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_iam as iam } from 'aws-cdk-lib';

interface IamStackProps extends cdk.StackProps {
  environment: string;
}

export class IamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);

    // Example: create a group/policy for developer deployments
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

    // You could attach it to a specific group or user if you like:
    // new iam.Group(this, 'DevGroup', {
    //   groupName: `apadana-dev-group-${props.environment}`,
    //   managedPolicies: [devPolicy],
    // });
  }
}
