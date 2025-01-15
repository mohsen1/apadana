import * as cdk from 'aws-cdk-lib';
import {
  aws_iam as iam,
  aws_secretsmanager as secretsmanager,
  CfnOutput,
  custom_resources as cr,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { BaseStack, BaseStackProps } from './base-stack';
import { DEPLOYER_MANAGED_POLICIES, DEPLOYER_PERMISSIONS } from '../constants';

const logger = createLogger(import.meta.filename);

export class DeployerIamStack extends BaseStack {
  public readonly deployerUserName: string;
  public readonly deployerAccessKeySecret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    logger.info(`Creating Deployer IAM stack for environment: ${props.environment}`);

    // Add service-specific tag
    cdk.Tags.of(this).add('service', 'deployer-iam');

    // Import the existing deployer group
    const deployerGroupName = `ap-deployer-group-${props.environment}`;
    const deployerGroup = iam.Group.fromGroupName(this, 'ImportedDeployerGroup', deployerGroupName);

    // Create the Deployer user and attach to group
    this.deployerUserName = `ap-deployer-${props.environment}`;
    const deployerUser = new iam.User(this, 'DeployerUser', {
      userName: this.deployerUserName,
      groups: [deployerGroup],
    });

    // Create an Access Key for the user
    const deployerAccessKey = new iam.CfnAccessKey(this, 'DeployerUserAccessKey', {
      userName: deployerUser.userName,
    });

    // Store the key in Secrets Manager
    this.deployerAccessKeySecret = new secretsmanager.Secret(this, 'DeployerAccessKeySecret', {
      description: `Access key for user ${this.deployerUserName} in env ${props.environment}`,
      secretName: `ap-deployer-${props.environment}-access-key`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          AccessKeyId: deployerAccessKey.ref,
        }),
        generateStringKey: 'SecretAccessKey',
      },
    });

    // Custom resource to put the actual secret key into Secrets Manager
    const updateAccessKeySecret = new cr.AwsCustomResource(this, 'UpdateAccessKeySecret', {
      onCreate: {
        service: 'SecretsManager',
        action: 'putSecretValue',
        parameters: {
          SecretId: this.deployerAccessKeySecret.secretArn,
          SecretString: JSON.stringify({
            AccessKeyId: deployerAccessKey.ref,
            SecretAccessKey: deployerAccessKey.attrSecretAccessKey,
          }),
        },
        physicalResourceId: cr.PhysicalResourceId.of(
          `UpdateAccessKeySecret-${props.environment}-${this.account}`,
        ),
      },
      onDelete: {
        service: 'SecretsManager',
        action: 'deleteSecret',
        parameters: {
          SecretId: this.deployerAccessKeySecret.secretArn,
          ForceDeleteWithoutRecovery: true,
        },
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({ resources: ['*'] }),
    });

    updateAccessKeySecret.node.addDependency(this.deployerAccessKeySecret);

    // Print out instructions at the end
    new CfnOutput(this, 'DeployerInstructions', {
      value: [
        `Deployer user created: ${this.deployerUserName}`,
        `Access key stored in Secrets Manager: ${this.deployerAccessKeySecret.secretName}`,
        ``,
        `Retrieve your credentials (AccessKeyId, SecretAccessKey) by running:`,
        `aws secretsmanager get-secret-value --secret-id ${this.deployerAccessKeySecret.secretName}`,
        ``,
        `To add to Vercel, run:`,
        `vercel env add AWS_ACCESS_KEY_ID ${props.environment}`,
        `vercel env add AWS_SECRET_ACCESS_KEY ${props.environment}`,
      ].join('\n'),
      description: 'Instructions for using the newly created Deployer account',
    });
  }
}
