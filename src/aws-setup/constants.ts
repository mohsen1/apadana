/**
 * Permissions required for deployer accounts to deploy infrastructure
 */
export const DEPLOYER_PERMISSIONS = [
  // CloudFormation
  'cloudformation:*',

  // S3
  's3:*',

  // Lambda
  'lambda:*',

  // API Gateway
  'apigateway:*',
  'execute-api:*',

  // Route53
  'route53:*',

  // ACM
  'acm:*',

  // IAM (limited)
  'iam:Get*',
  'iam:List*',
  'iam:PassRole',

  // ECR
  'ecr:GetAuthorizationToken',
  'ecr:BatchCheckLayerAvailability',
  'ecr:CompleteLayerUpload',
  'ecr:GetDownloadUrlForLayer',
  'ecr:InitiateLayerUpload',
  'ecr:PutImage',
  'ecr:UploadLayerPart',

  // ECS
  'ecs:*',

  // CloudWatch Logs
  'logs:*',

  // Secrets Manager
  'secretsmanager:*',

  // SSM Parameter Store
  'ssm:PutParameter',
  'ssm:GetParameter',
  'ssm:GetParameters',
  'ssm:DeleteParameter',

  // CodeBuild
  'codebuild:*',

  // CodePipeline
  'codepipeline:*',

  // CloudFront
  'cloudfront:*',

  // EventBridge
  'events:*',

  // SQS
  'sqs:*',

  // DynamoDB
  'dynamodb:*',

  // WAFv2
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
  'arn:aws:iam::aws:policy/AmazonECS_FullAccess',
  'arn:aws:iam::aws:policy/AmazonECR_FullAccess',
  'arn:aws:iam::aws:policy/CloudWatchLogsFullAccess',
  'arn:aws:iam::aws:policy/SecretsManagerReadWrite',
  'arn:aws:iam::aws:policy/AWSCodeBuildAdminAccess',
  'arn:aws:iam::aws:policy/AWSCodePipelineFullAccess',
  'arn:aws:iam::aws:policy/CloudFrontFullAccess',
  'arn:aws:iam::aws:policy/AmazonRoute53FullAccess',
  'arn:aws:iam::aws:policy/AWSCertificateManagerFullAccess',
  'arn:aws:iam::aws:policy/AmazonEventBridgeFullAccess',
  'arn:aws:iam::aws:policy/AmazonSQSFullAccess',
  'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
  'arn:aws:iam::aws:policy/AWSWAFConsoleFullAccess',
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
