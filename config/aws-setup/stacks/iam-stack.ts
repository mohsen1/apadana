import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class IAMStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create CDK deployment policy
    const cdkDeploymentPolicy = new iam.ManagedPolicy(this, 'CDKDeploymentPolicy', {
      managedPolicyName: 'ApadanaCDKDeploymentPolicy',
      statements: [
        // Allow assuming CDK roles
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['sts:AssumeRole'],
          resources: [
            `arn:aws:iam::${this.account}:role/cdk-*-deploy-role-${this.account}-${this.region}`,
            `arn:aws:iam::${this.account}:role/cdk-*-file-publishing-role-${this.account}-${this.region}`,
            `arn:aws:iam::${this.account}:role/cdk-*-lookup-role-${this.account}-${this.region}`,
          ],
        }),
        // CloudFormation permissions (scoped to our stacks)
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'cloudformation:DescribeStacks',
            'cloudformation:ListStacks',
            'cloudformation:DescribeStackEvents',
            'cloudformation:GetTemplateSummary',
            'cloudformation:ValidateTemplate',
          ],
          resources: ['*'],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'cloudformation:CreateStack',
            'cloudformation:UpdateStack',
            'cloudformation:DeleteStack',
          ],
          resources: [`arn:aws:cloudformation:${this.region}:${this.account}:stack/Apadana*/*`],
        }),
        // S3 permissions for CDK assets (scoped to CDK bucket)
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['s3:*'],
          resources: [
            `arn:aws:s3:::cdk-*-assets-${this.account}-${this.region}`,
            `arn:aws:s3:::cdk-*-assets-${this.account}-${this.region}/*`,
          ],
        }),
        // MemoryDB permissions (scoped to our resources)
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'memorydb:CreateCluster',
            'memorydb:DeleteCluster',
            'memorydb:DescribeClusters',
            'memorydb:ModifyCluster',
            'memorydb:CreateSubnetGroup',
            'memorydb:DeleteSubnetGroup',
            'memorydb:DescribeSubnetGroups',
            'memorydb:CreateUser',
            'memorydb:DeleteUser',
            'memorydb:DescribeUsers',
            'memorydb:CreateACL',
            'memorydb:DeleteACL',
            'memorydb:DescribeACLs',
          ],
          resources: [
            `arn:aws:memorydb:${this.region}:${this.account}:cluster/apadana*`,
            `arn:aws:memorydb:${this.region}:${this.account}:subnetgroup/apadana*`,
            `arn:aws:memorydb:${this.region}:${this.account}:user/apadana*`,
            `arn:aws:memorydb:${this.region}:${this.account}:acl/apadana*`,
          ],
        }),
        // VPC permissions (scoped to our VPC)
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            // Describe permissions (needed for CDK to check existing resources)
            'ec2:DescribeVpcs',
            'ec2:DescribeSubnets',
            'ec2:DescribeSecurityGroups',
            'ec2:DescribeNatGateways',
            'ec2:DescribeInternetGateways',
            'ec2:DescribeRouteTables',
            'ec2:DescribeNetworkInterfaces',
            'ec2:DescribeAvailabilityZones',
            'ec2:DescribeVpcAttribute',
            // Create/Delete operations
            'ec2:CreateVpc',
            'ec2:DeleteVpc',
            'ec2:ModifyVpcAttribute',
            'ec2:CreateSubnet',
            'ec2:DeleteSubnet',
            'ec2:ModifySubnetAttribute',
            'ec2:CreateSecurityGroup',
            'ec2:DeleteSecurityGroup',
            'ec2:AuthorizeSecurityGroupIngress',
            'ec2:RevokeSecurityGroupIngress',
            'ec2:CreateNatGateway',
            'ec2:DeleteNatGateway',
            'ec2:CreateInternetGateway',
            'ec2:DeleteInternetGateway',
            'ec2:AttachInternetGateway',
            'ec2:DetachInternetGateway',
            'ec2:AllocateAddress',
            'ec2:ReleaseAddress',
            'ec2:AssociateAddress',
            'ec2:DisassociateAddress',
            'ec2:CreateRouteTable',
            'ec2:DeleteRouteTable',
            'ec2:CreateRoute',
            'ec2:DeleteRoute',
            'ec2:AssociateRouteTable',
            'ec2:DisassociateRouteTable',
          ],
          resources: ['*'],
          conditions: {
            StringLike: {
              'aws:ResourceTag/Project': 'Apadana',
            },
          },
        }),
        // Allow describe operations without tag restrictions
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'ec2:DescribeVpcs',
            'ec2:DescribeSubnets',
            'ec2:DescribeSecurityGroups',
            'ec2:DescribeNatGateways',
            'ec2:DescribeInternetGateways',
            'ec2:DescribeRouteTables',
            'ec2:DescribeNetworkInterfaces',
            'ec2:DescribeAvailabilityZones',
            'ec2:DescribeVpcAttribute',
          ],
          resources: ['*'],
        }),
        // Allow tagging for our resources
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['ec2:CreateTags', 'ec2:DeleteTags'],
          resources: ['*'],
          conditions: {
            StringEquals: {
              'aws:RequestTag/Project': 'Apadana',
            },
          },
        }),
        // Secrets Manager permissions (scoped to our secrets)
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'secretsmanager:CreateSecret',
            'secretsmanager:DeleteSecret',
            'secretsmanager:GetSecretValue',
            'secretsmanager:PutSecretValue',
            'secretsmanager:UpdateSecret',
            'secretsmanager:TagResource',
            'secretsmanager:ListSecrets',
            'secretsmanager:DescribeSecret',
          ],
          resources: [
            `arn:aws:secretsmanager:${this.region}:${this.account}:secret:apadana-*`,
            `arn:aws:secretsmanager:${this.region}:${this.account}:secret:Apadana*`,
          ],
        }),
        // Add a separate statement for List operations that don't support resource-level permissions
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['secretsmanager:ListSecrets'],
          resources: ['*'],
        }),
      ],
    });

    // Create CDK admin group
    const cdkGroup = new iam.Group(this, 'CDKAdminGroup', {
      groupName: 'ApadanaCDKAdmins',
      managedPolicies: [cdkDeploymentPolicy],
    });

    // Output group name
    new cdk.CfnOutput(this, 'CDKGroupName', {
      value: cdkGroup.groupName,
      description: 'Add developers to this group for CDK deployment permissions',
      exportName: 'ApadanaCDKGroupName',
    });

    // Create deployment role with scoped permissions
    const deploymentRole = new iam.Role(this, 'CDKDeploymentRole', {
      roleName: 'ApadanaCDKDeploymentRole',
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('cloudformation.amazonaws.com'),
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ArnPrincipal(`arn:aws:iam::${this.account}:root`),
      ),
      // Instead of AdministratorAccess, use our scoped policy
      managedPolicies: [cdkDeploymentPolicy],
    });

    // Allow CDK admin group to assume deployment role
    deploymentRole.grantAssumeRole(cdkGroup);

    // Output role ARN
    new cdk.CfnOutput(this, 'DeploymentRoleArn', {
      value: deploymentRole.roleArn,
      description: 'ARN of the CDK deployment role',
      exportName: 'ApadanaCDKDeploymentRoleArn',
    });
  }
}
