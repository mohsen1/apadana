# AWS Infrastructure Setup

This directory contains the AWS CDK code for setting up the infrastructure required by the Apadana application.

## Quick Start

### For Root Users (One-time Setup)

1. Configure AWS CLI with root credentials:

   ```bash
   aws configure
   ```

2. Create and attach bootstrap policy:

   - Go to AWS Console → IAM → Policies → Create Policy
   - Use this JSON:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "cloudformation:*",
           "ssm:*",
           "s3:*",
           "iam:*",
           "lambda:*",
           "ec2:*",
           "memorydb:*"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

3. Deploy bootstrap:

   ```bash
   pnpm cdk:bootstrap
   pnpm cdk:deploy:bootstrap
   ```

4. Share deployment credentials with developers:

   - Access key ID
   - Secret access key
   - AWS Console credentials (if needed)

5. Remove bootstrap policy from root user after verification

### For Developers

1. Configure AWS CLI with deployment credentials:

   ```bash
   aws configure --profile apadana
   export AWS_PROFILE=apadana
   ```

2. Create `.env.local`:

   ```bash
   AWS_REGION=us-east-1  # or preferred region
   ```

3. Deploy infrastructure:

   ```bash
   # For development environment
   AWS_DEPLOYMENT_STACK_ENV=development pnpm cdk:deploy:resources

   # For preview environment
   AWS_DEPLOYMENT_STACK_ENV=preview pnpm cdk:deploy:resources

   # For production environment
   AWS_DEPLOYMENT_STACK_ENV=production pnpm cdk:deploy:resources
   ```

## Infrastructure Components

### MemoryDB (Redis) Cluster

- Single shard with replica (production)
- Single shard, no replica (preview)
- Private subnet deployment
- VPC security groups
- TLS enabled
- Automatic backups
  - Production: 7 days retention
  - Preview/Development: 1 day retention

### RDS (PostgreSQL)

- PostgreSQL 15
- Instance types:
  - Production: t3.medium
  - Preview: t3.micro
  - Development: t3.medium
- Automated backups
  - Production: 7 days retention
  - Preview/Development: 1 day retention
- Storage:
  - Production: 20GB initial, up to 100GB
  - Preview: 10GB initial, up to 50GB
  - Development: 20GB initial, up to 50GB

### S3 Storage

- Separate buckets for each environment
- Private access only
- Server-side encryption
- Versioning enabled
- Lifecycle rules for cost optimization

### Security

- VPC-deployed resources, One VPC for all environments
- Security groups with minimal access
- TLS encryption for all services
- AWS Secrets Manager for credentials
- KMS encryption for sensitive data
- IAM roles with least privilege

## Environment Configurations

### Preview Environment

- Minimal resource allocation
- Reduced costs
- Short backup retention
- Suitable for PR reviews and testing

### Development Environment

- Moderate resource allocation
- Local development testing
- Short backup retention
- Debugging capabilities

### Production Environment

- Full resource allocation
- High availability
- Extended backup retention
- Delete protection enabled

## Available Commands

| Command                        | Description            | User       | Environment Variable     |
| ------------------------------ | ---------------------- | ---------- | ------------------------ |
| `pnpm cdk:bootstrap`           | Bootstrap CDK          | Root only  | -                        |
| `pnpm cdk:deploy:bootstrap`    | Create deployer        | Root only  | -                        |
| `pnpm cdk:deploy:resources`    | Deploy all stacks      | Developers | AWS_DEPLOYMENT_STACK_ENV |
| `pnpm cdk:deploy [stack-name]` | Deploy specific stack  | Developers | AWS_DEPLOYMENT_STACK_ENV |
| `pnpm cdk:destroy`             | Destroy stacks         | Developers | AWS_DEPLOYMENT_STACK_ENV |
| `pnpm cdk:diff`                | Show changes           | Developers | AWS_DEPLOYMENT_STACK_ENV |
| `pnpm cdk:synth`               | Generate template      | Developers | AWS_DEPLOYMENT_STACK_ENV |
| `pnpm aws:preflight`           | Run preflight checks   | Developers | AWS_DEPLOYMENT_STACK_ENV |
| `pnpm aws:deployer:create`     | Create/update deployer | Root only  | -                        |

## Stack Organization

```
config/aws-setup/
├── stacks/
│   ├── bootstrap-stack.ts    # Initial setup
│   ├── iam-stack.ts         # IAM roles and policies
│   ├── memory-db-stack.ts   # Redis cluster
│   ├── rds-stack.ts         # PostgreSQL database
│   ├── s3-stack.ts          # Storage buckets
│   └── shared-network-stack.ts # VPC and networking
├── scripts/
│   ├── create-deployer.ts   # Deployment user setup
│   └── preflight.ts         # Environment checks
├── config/
│   ├── factory.ts           # Configuration factory
│   ├── types.ts            # TypeScript types
│   └── validate.ts         # Configuration validation
└── cdk.ts                  # Main CDK app
```

## Adding New Resources

1. Create stack in `stacks/`:

   ```typescript
   export class NewStack extends cdk.Stack {
     constructor(scope: Construct, id: string, props: Props) {
       super(scope, id, props);
       // Resource definitions
     }
   }
   ```

2. Import in `cdk.ts`:

   ```typescript
   import { NewStack } from './stacks/new-stack';
   ```

3. Add to app:

   ```typescript
   new NewStack(app, `apadana-new-${environment}`, {
     environment,
     // other props
   });
   ```

4. Update README

5. Request permission updates if needed

## Security Best Practices

- Root user only for bootstrap
- Minimal permissions for developers
- VPC-deployed resources
- Restrictive security groups
- TLS encryption
- AWS Secrets Manager for credentials
- Regular secret rotation
- Resource tagging for access control
- Audit logging enabled

## Troubleshooting

1. Permission Issues:

   ```bash
   pnpm aws:deployer:create --env=preview
   ```

2. Stack Deployment Failures:

   ```bash
   AWS_DEPLOYMENT_STACK_ENV=preview pnpm aws:preflight
   ```

3. Resource Cleanup:
   ```bash
   AWS_DEPLOYMENT_STACK_ENV=preview pnpm cdk destroy [stack-name]
   ```

## Maintenance

1. Regular Updates:

   - Check for CDK updates
   - Review security groups
   - Rotate secrets
   - Update instance types

2. Monitoring:
   - CloudWatch metrics
   - RDS performance
   - MemoryDB cluster health
   - S3 usage and costs
