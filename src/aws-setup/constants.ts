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
  'secretsmanager:CreateSecret',
  'secretsmanager:PutSecretValue',
  'logs:*',
  'apigateway:*',
  'servicediscovery:*',
  // Execute API permissions
  'execute-api:Invoke',
  'execute-api:InvalidateCache',
  'execute-api:ManageConnections',
  // Route53 permissions
  'route53:ChangeResourceRecordSets',
  'route53:CreateHostedZone',
  'route53:DeleteHostedZone',
  'route53:GetChange',
  'route53:GetHostedZone',
  'route53:ListHostedZones',
  'route53:ListResourceRecordSets',
  'route53:ListTagsForResource',
  // ACM permissions
  'acm:RequestCertificate',
  'acm:DescribeCertificate',
  'acm:ListCertificates',
  'acm:DeleteCertificate',
  'acm:GetCertificate',
  // CloudFront permissions
  'cloudfront:CreateDistribution',
  'cloudfront:DeleteDistribution',
  'cloudfront:GetDistribution',
  'cloudfront:GetDistributionConfig',
  'cloudfront:ListDistributions',
  'cloudfront:UpdateDistribution',
  'cloudfront:CreateInvalidation',
  'cloudfront:ListInvalidations',
  'cloudfront:GetInvalidation',
  // EventBridge permissions
  'events:PutRule',
  'events:PutTargets',
  'events:DeleteRule',
  'events:RemoveTargets',
  'events:ListRules',
  'events:ListTargetsByRule',
  'events:DescribeRule',
  // SQS permissions
  'sqs:CreateQueue',
  'sqs:DeleteQueue',
  'sqs:GetQueueAttributes',
  'sqs:GetQueueUrl',
  'sqs:ListQueues',
  'sqs:SendMessage',
  'sqs:ReceiveMessage',
  'sqs:DeleteMessage',
  // DynamoDB permissions
  'dynamodb:CreateTable',
  'dynamodb:DeleteTable',
  'dynamodb:DescribeTable',
  'dynamodb:ListTables',
  'dynamodb:PutItem',
  'dynamodb:GetItem',
  'dynamodb:UpdateItem',
  'dynamodb:DeleteItem',
  'dynamodb:Query',
  'dynamodb:Scan',
  'dynamodb:BatchWriteItem',
  'dynamodb:BatchGetItem',
  // WAFv2 permissions
  'wafv2:GetWebACL',
  'wafv2:GetWebACLForResource',
  'wafv2:AssociateWebACL',
  'wafv2:DisassociateWebACL',
  'wafv2:ListResourcesForWebACL',
  'wafv2:CreateWebACL',
  'wafv2:UpdateWebACL',
  'wafv2:DeleteWebACL',
  'elasticloadbalancing:*',
  // IAM permissions for service roles
  'iam:CreateRole',
  'iam:DeleteRole',
  'iam:GetRole',
  'iam:PutRolePolicy',
  'iam:DeleteRolePolicy',
  'iam:PassRole',
  // Additional required permissions
  'kms:*',
  'application-autoscaling:*',
  'servicediscovery:*',
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
  'arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess',
  'arn:aws:iam::aws:policy/AmazonEventBridgeFullAccess',
  'arn:aws:iam::aws:policy/AWSServiceDiscoveryFullAccess',
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
