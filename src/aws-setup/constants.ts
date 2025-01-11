/**
 * Permissions required for deployer accounts to deploy infrastructure
 */
export const DEPLOYER_PERMISSIONS = [
  'cloudformation:*',
  'ssm:*',
  's3:*',
  'lambda:*',
  'ec2:*',
  'elasticache:*',
  'rds:*',
  'secretsmanager:GetSecretValue',
  'secretsmanager:DescribeSecret',
  'secretsmanager:ListSecrets',
  'logs:*',
  'apigateway:*',
  'execute-api:*',
  'route53:*',
  'acm:*',
  'cloudfront:*',
  'events:*',
  'sns:*',
  'sqs:*',
  'dynamodb:*',
  'kms:*',
  'cloudwatch:*',
  'wafv2:*',
  'elasticloadbalancing:*',
] as const;

/**
 * AWS managed policies required for deployer accounts
 */
export const DEPLOYER_MANAGED_POLICIES = [
  'arn:aws:iam::aws:policy/AWSCloudFormationFullAccess',
  'arn:aws:iam::aws:policy/AmazonSSMFullAccess',
  'arn:aws:iam::aws:policy/AmazonS3FullAccess',
  'arn:aws:iam::aws:policy/AWSLambda_FullAccess',
  'arn:aws:iam::aws:policy/AmazonEC2FullAccess',
  'arn:aws:iam::aws:policy/AmazonElastiCacheFullAccess',
  'arn:aws:iam::aws:policy/AmazonRDSFullAccess',
  'arn:aws:iam::aws:policy/SecretsManagerReadWrite',
  'arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator',
  'arn:aws:iam::aws:policy/CloudFrontReadOnlyAccess',
  'arn:aws:iam::aws:policy/AmazonRoute53FullAccess',
  'arn:aws:iam::aws:policy/AWSCertificateManagerFullAccess',
  'arn:aws:iam::aws:policy/CloudWatchFullAccess',
  'arn:aws:iam::aws:policy/AmazonSNSFullAccess',
  'arn:aws:iam::aws:policy/AmazonSQSFullAccess',
  'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
  'arn:aws:iam::aws:policy/AWSKeyManagementServicePowerUser',
  'arn:aws:iam::aws:policy/AWSWAFConsoleFullAccess',
  'arn:aws:iam::aws:policy/AWSWAFV2FullAccess',
  'arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess',
  'arn:aws:iam::aws:policy/AmazonEventBridgeFullAccess',
  'arn:aws:iam::aws:policy/AWSExecuteAPIFullAccess',
] as const;

/**
 * Additional permissions required for admin accounts to manage deployers
 */
export const ADMIN_PERMISSIONS = [
  ...DEPLOYER_PERMISSIONS,
  'iam:*', // Required for creating and managing deployer accounts
] as const;

/**
 * AWS managed policies required for admin accounts
 */
export const ADMIN_MANAGED_POLICIES = [
  ...DEPLOYER_MANAGED_POLICIES,
  'arn:aws:iam::aws:policy/IAMFullAccess', // Required for managing IAM users and policies
] as const;
