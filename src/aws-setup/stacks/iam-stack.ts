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

    // Create a custom resource to handle the deployer group
    const groupName = `ap-deployer-group-${props.environment}`;
    const provider = new cr.Provider(this, 'DeployerGroupProvider', {
      onEventHandler: new cdk.aws_lambda.Function(this, 'DeployerGroupHandler', {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: cdk.aws_lambda.Code.fromInline(`
          const { IAMClient, GetGroupCommand, CreateGroupCommand, AttachGroupPolicyCommand, ListAttachedGroupPoliciesCommand } 
            = require('@aws-sdk/client-iam');
          
          exports.handler = async (event) => {
            const client = new IAMClient();
            const groupName = event.ResourceProperties.groupName;
            const policyArn = event.ResourceProperties.policyArn;
            
            try {
              // Always get the PhysicalResourceId from the event if it exists, otherwise use groupName
              const physicalId = event.PhysicalResourceId || groupName;
              
              if (event.RequestType === 'Create' || event.RequestType === 'Update') {
                let groupExists = false;
                try {
                  await client.send(new GetGroupCommand({ GroupName: groupName }));
                  groupExists = true;
                } catch (err) {
                  if (err.name === 'NoSuchEntityException') {
                    await client.send(new CreateGroupCommand({ GroupName: groupName }));
                  } else {
                    throw err;
                  }
                }
                
                // Only try to attach policy if group was just created
                if (!groupExists) {
                  try {
                    await client.send(new AttachGroupPolicyCommand({
                      GroupName: groupName,
                      PolicyArn: policyArn
                    }));
                  } catch (err) {
                    if (err.name !== 'EntityAlreadyExists' && err.name !== 'LimitExceeded') throw err;
                  }
                }
              }
              
              // Return response in CloudFormation custom resource format
              return {
                Status: 'SUCCESS',
                PhysicalResourceId: physicalId,
                Data: {
                  GroupName: groupName
                }
              };
            } catch (error) {
              console.error('Error:', error);
              // Even on error, we must return a PhysicalResourceId
              return {
                Status: 'FAILED',
                PhysicalResourceId: event.PhysicalResourceId || groupName,
                Reason: error.message || 'Unknown error occurred'
              };
            }
          }
        `),
        initialPolicy: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'iam:GetGroup',
              'iam:CreateGroup',
              'iam:AttachGroupPolicy',
              'iam:DetachGroupPolicy',
              'iam:ListAttachedGroupPolicies',
            ],
            resources: ['*'],
          }),
        ],
      }),
    });

    // Create the deployer group using the custom resource
    const deployerGroupResource = new cdk.CustomResource(this, 'DeployerGroupResource', {
      serviceToken: provider.serviceToken,
      properties: {
        groupName,
        policyArn: this.devPolicy.managedPolicyArn,
      },
    });

    // Import the group after creation
    this.deployerGroup = iam.Group.fromGroupName(
      this,
      'DeployerGroup',
      deployerGroupResource.getAttString('PhysicalResourceId'),
    );
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
