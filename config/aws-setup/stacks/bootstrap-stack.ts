import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { SecurityConfig } from '../security-config';

export class BootstrapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create temporary bootstrap policy
    new iam.ManagedPolicy(this, 'BootstrapPolicy', {
      managedPolicyName: 'ApadanaBootstrapPolicy',
      description: 'Temporary policy for initial setup - will be removed after bootstrap',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['iam:*'],
          resources: ['*'],
          conditions: {
            StringLike: {
              'iam:ResourceTag/Project': 'Apadana',
            },
          },
        }),
      ],
    });

    // Create deployment user with minimal permissions
    const deploymentUser = new iam.User(this, 'DeploymentUser', {
      userName: 'apadana-cdk-deployer',
      managedPolicies: [
        new iam.ManagedPolicy(this, 'DeploymentPolicy', {
          statements: SecurityConfig.iam.minimalPermissions.map(
            (permission) =>
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [permission],
                resources: ['*'],
                conditions: {
                  StringLike: {
                    'aws:ResourceTag/Project': SecurityConfig.iam.requiredTags.Project,
                  },
                },
              }),
          ),
        }),
      ],
    });

    // Create access key for deployment user
    const accessKey = new iam.CfnAccessKey(this, 'DeploymentUserAccessKey', {
      userName: deploymentUser.userName,
    });

    // Output deployment user details
    new cdk.CfnOutput(this, 'DeploymentUserName', {
      value: deploymentUser.userName,
      description: 'Username for CDK deployment',
    });

    new cdk.CfnOutput(this, 'DeploymentUserAccessKeyId', {
      value: accessKey.ref,
      description: 'Access key ID for CDK deployment',
    });

    new cdk.CfnOutput(this, 'DeploymentUserSecretAccessKey', {
      value: accessKey.attrSecretAccessKey,
      description: 'Secret access key for CDK deployment',
    });

    // Add warning about removing bootstrap policy
    new cdk.CfnOutput(this, 'SecurityWarning', {
      value: 'IMPORTANT: Remove the ApadanaBootstrapPolicy from your user after setup is complete',
      description: 'Security reminder',
    });
  }
}
