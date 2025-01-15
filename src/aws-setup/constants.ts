/**
 * Permissions required for deployer accounts to deploy infrastructure
 */
export const DEPLOYER_PERMISSIONS = [
  'acm:*',
  'cloudformation:*',
  'cloudfront:*',
  'cloudwatch:*',
  'codebuild:*',
  'codepipeline:*',
  'dynamodb:*',
  'events:*',
  'execute-api:*',
  'iam:*',
  'logs:*',
  'route53:*',
  's3:*',
  's3:DeleteBucketPolicy',
  's3:DeletePublicAccessBlock',
  's3:PutBucketPolicy',
  's3:PutBucketPublicAccessBlock',
  'secretsmanager:*',
  'sqs:*',
  'ssm:*',
  'wafv2:*',
] as const;

/**
 * AWS managed policies required for deployer accounts
 */
export const DEPLOYER_MANAGED_POLICIES = [
  'arn:aws:iam::aws:policy/AWSCloudFormationFullAccess',
  'arn:aws:iam::aws:policy/AmazonS3FullAccess',
  'arn:aws:iam::aws:policy/AWSLambda_FullAccess',
  'arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator',
  'arn:aws:iam::aws:policy/IAMReadOnlyAccess',
  'arn:aws:iam::aws:policy/AmazonECSFullAccess',
  'arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess',
  'arn:aws:iam::aws:policy/CloudFrontFullAccess',
  'arn:aws:iam::aws:policy/AWSWAFFullAccess',
] as const;

/**
 * Additional permissions required for admin accounts to manage deployers
 */
export const ADMIN_PERMISSIONS = [
  '*', // Full access to all services
] as const;

/**
 * AWS managed policies required for admin accounts
 */
export const ADMIN_MANAGED_POLICIES = [
  'arn:aws:iam::aws:policy/AdministratorAccess', // Full admin access
] as const;
