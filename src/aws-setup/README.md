# AWS Infrastructure Setup

This directory contains the AWS CDK infrastructure code for Apadana's cloud resources. The infrastructure is designed to support multiple environments (development, preview, production) with appropriate resource configurations for each.

## Architecture Overview

The infrastructure is split into several independent stacks:

1. **BootstrapStack**: Initial CDK bootstrap resources (one-time setup)
2. **IamStack**: IAM roles, users, and policies for deployment and operations
3. **SharedNetworkStack**: VPC, subnets, and networking components
4. **ElastiCacheStack**: Redis cluster using AWS ElastiCache
5. **RdsStack**: PostgreSQL database using AWS RDS
6. **S3Stack**: S3 buckets for file storage

## Prerequisites

- AWS CLI installed and configured with appropriate credentials
- Node.js 18+ and pnpm installed
- AWS CDK CLI v2.x installed globally: `pnpm add -g aws-cdk`

## Environment Variables

Required environment variables:

```bash
AWS_REGION=us-east-1  # or your preferred region
AWS_DEPLOYMENT_STACK_ENV=development  # or 'preview' or 'production'
```

## Deployment Steps

1. First, run the preflight check to verify AWS credentials:

   ```bash
   pnpm cdk:preflight
   ```

2. Create a deployer user (if needed):

   ```bash
   pnpm cdk:deployer:create
   ```

3. Bootstrap the CDK (one-time setup per account/region):

   ```bash
   pnpm cdk:bootstrap
   ```

4. Deploy the bootstrap stack:

   ```bash
   pnpm cdk:deploy:bootstrap
   ```

5. Deploy all resources:

   ```bash
   # Normal deployment
   pnpm cdk:deploy:resources

   # Force replace existing resources (use with caution)
   AWS_FORCE_REPLACE=true pnpm cdk:deploy:resources
   ```

6. Wait for all stacks to be ready:
   ```bash
   pnpm cdk:wait
   ```

## Environment Configuration

The infrastructure supports three environments with different resource configurations:

### Development Environment

- **RDS**:
  - Instance: t3.medium
  - Storage: 20GB (max 50GB)
  - Public access: Enabled
- **ElastiCache**:
  - Node type: cache.t4g.small
  - Single shard, no replicas
  - Backup retention: 1 day
- **S3**:
  - Public read access enabled
  - CORS configured for web access
  - Server-side encryption
  - Versioning enabled

### Preview Environment

- **RDS**:
  - Instance: t3.micro
  - Storage: 10GB (max 50GB)
  - Public access: Enabled
- **ElastiCache**:
  - Node type: cache.t4g.small
  - Single shard, no replicas
  - Backup retention: 1 day
- **S3**:
  - Public read access enabled
  - CORS configured for web access
  - Server-side encryption
  - Versioning enabled

### Production Environment

- **RDS**:
  - Instance: t3.medium
  - Storage: 20GB (max 100GB)
  - Public access: Enabled
  - Deletion protection: Enabled
- **ElastiCache**:
  - Node type: cache.t4g.medium
  - Single shard with replica
  - Backup retention: 7 days
- **S3**:
  - Public read access enabled
  - CORS configured for web access
  - Server-side encryption
  - Versioning enabled

## Security Features

- All databases are deployed with appropriate security groups
- Database credentials stored in AWS Secrets Manager
- S3 buckets configured with public read access and CORS for web access
- Server-side encryption enabled for all storage
- TLS enabled for all services
- IAM roles follow the principle of least privilege

## Network Architecture

- VPC with public and private subnets across 2 AZs
- NAT Gateway for private subnet internet access
- Security groups controlling inbound/outbound traffic
- RDS instances can be placed in public or private subnets based on configuration

## Useful Commands

```bash
# View changes before deployment
pnpm cdk:diff

# Deploy a specific stack
pnpm cdk:deploy StackName-environment

# Destroy all resources (BE CAREFUL!)
pnpm cdk:destroy

# Synthesize CloudFormation template
pnpm cdk:synth

# Print deployment values
pnpm tsx src/aws-setup/scripts/print-deployment-values.ts
```

## Vercel Integration

The infrastructure is designed to work seamlessly with Vercel deployments:

- Environment variables are automatically populated during build
- Database credentials are securely retrieved from Secrets Manager
- S3 bucket names are configured for file uploads
- CORS configured for _.vercel.app, _.apadana.app, and local development
- Public database access is enabled for Vercel's IP ranges

## Troubleshooting

1. **Database Connection Issues**:

   - Verify security group rules allow inbound access
   - Check if the database is publicly accessible
   - Ensure credentials are correctly stored in Secrets Manager

2. **Deployment Failures**:

   - Check CloudFormation console for detailed error messages
   - Verify IAM permissions for the deployer user
   - Review CDK synthesis output for configuration issues
   - For resource conflicts:
     - First, check CloudFormation console for the exact error
     - If resources exist from a previous failed deployment:
       1. Go to CloudFormation console
       2. Delete the failed stack
       3. Wait for deletion to complete
       4. Retry deployment
     - If resources exist outside CloudFormation:
       1. Use `AWS_FORCE_REPLACE=true` to replace them
       2. Or manually delete the conflicting resources
       3. Retry deployment
     - For protected resources in production:
       1. Verify if deletion is really needed
       2. Remove the protection manually if necessary
       3. Retry deployment

3. **Resource Limits**:
   - Monitor RDS storage usage
   - Check ElastiCache connection limits and replica configuration
   - Review S3 bucket quotas
   - Ensure VPC has sufficient IP addresses and subnets

## Resource Management

### Handling Existing Resources

The infrastructure supports handling of existing resources:

```bash
# Force replace existing resources (use with caution)
AWS_FORCE_REPLACE=true pnpm cdk deploy StackName-environment
```

### Removal Policies

- Production resources have `RemovalPolicy.RETAIN` by default
- Development/Preview resources can be destroyed with `AWS_FORCE_REPLACE=true`
- ElastiCache clusters in production are protected from accidental deletion

### Resource Configuration Updates

- ElastiCache now conditionally enables Multi-AZ and automatic failover based on replica count
- VPC lookup is implemented to reuse existing VPCs when available
- All resources now include standard tags:
  - managed-by: apadana-aws-setup
  - environment: [development/preview/production]
  - service: [redis/rds/etc]
  - created-at: [timestamp]
