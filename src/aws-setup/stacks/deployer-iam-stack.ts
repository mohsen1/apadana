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

    //
    // 1) Create the Deployer group with inline policy + managed policies
    //
    const deployerGroupName = `ap-deployer-group-${props.environment}`;
    const deployerGroup = new iam.Group(this, 'DeployerGroup', {
      groupName: deployerGroupName,
    });

    // Add inline policy with all required deployer actions
    deployerGroup.addToPolicy(
      new iam.PolicyStatement({
        actions: [...DEPLOYER_PERMISSIONS],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      }),
    );

    // Attach AWS-managed policies
    const managedPolicies = DEPLOYER_MANAGED_POLICIES.map((policyArn) =>
      iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        `ManagedPolicy-${policyArn.split('/').pop()}`,
        policyArn,
      ),
    );

    // Then attach managed policies
    for (const policy of managedPolicies) {
      deployerGroup.addManagedPolicy(policy);
    }

    //
    // 2) Create the Deployer user and attach to group
    //
    this.deployerUserName = `ap-deployer-${props.environment}`;
    const deployerUser = new iam.User(this, 'DeployerUser', {
      userName: this.deployerUserName,
      groups: [deployerGroup],
    });

    //
    // 3) Create an Access Key for the user
    //
    const deployerAccessKey = new iam.CfnAccessKey(this, 'DeployerUserAccessKey', {
      userName: deployerUser.userName,
    });

    //
    // 4) Store the key in Secrets Manager
    //
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

    //
    // 5) Custom resource to put the actual secret key into Secrets Manager
    //
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

    // Add custom resource to handle policy cleanup during deletion
    const cleanupPolicies = new cr.AwsCustomResource(this, 'CleanupPolicies', {
      onDelete: {
        service: 'IAM',
        action: 'listAttachedGroupPolicies',
        parameters: {
          GroupName: deployerGroupName,
        },
        physicalResourceId: cr.PhysicalResourceId.of(`ListPolicies-${props.environment}`),
        outputPaths: ['AttachedPolicies'],
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    // For each managed policy, create a custom resource to detach it
    DEPLOYER_MANAGED_POLICIES.forEach((policyArn, index) => {
      const detachPolicy = new cr.AwsCustomResource(this, `DetachPolicy-${index}`, {
        onDelete: {
          service: 'IAM',
          action: 'detachGroupPolicy',
          parameters: {
            GroupName: deployerGroupName,
            PolicyArn: policyArn,
          },
          physicalResourceId: cr.PhysicalResourceId.of(
            `DetachPolicy-${index}-${props.environment}`,
          ),
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      });

      // Ensure proper deletion order
      detachPolicy.node.addDependency(cleanupPolicies);
      deployerGroup.node.addDependency(detachPolicy);
    });

    //
    // 6) Print out instructions at the end
    //
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
