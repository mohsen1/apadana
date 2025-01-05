# AWS Infrastructure Setup

This directory contains the AWS CDK infrastructure code for Apadana's cloud resources.

## Prerequisites

- AWS CLI installed and configured with appropriate credentials
- Node.js 18+ and pnpm installed
- AWS CDK CLI installed globally: `pnpm add -g aws-cdk`

## Environment Variables

Required environment variables:

```bash
CDK_DEFAULT_ACCOUNT=your-aws-account-id
AWS_REGION=us-east-1  # or your preferred region
AWS_DEPLOYMENT_STACK_ENV=development  # or 'preview' or 'production'
```

## Stack Overview

The infrastructure is split into several stacks:

1. **BootstrapStack**: Initial CDK bootstrap resources
2. **IamStack**: IAM roles and policies
3. **SharedNetworkStack**: VPC and networking components
4. **MemoryDbStack**: Redis cluster using AWS MemoryDB
5. **RdsStack**: PostgreSQL database using AWS RDS
6. **S3Stack**: S3 buckets for file storage

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
   pnpm cdk:deploy:resources
   ```

6. Wait for all stacks to be ready:
   ```bash
   pnpm cdk:wait
   ```

## Environment Configuration

The infrastructure supports three environments:

- **Development**: Minimal resources for local development

  - RDS: t3.medium, 20GB storage
  - MemoryDB: Single shard, no replicas
  - 1-day backup retention

- **Preview**: Staging environment with reduced capacity

  - RDS: t3.micro, 10GB storage
  - MemoryDB: Single shard, no replicas
  - 1-day backup retention

- **Production**: Full production setup with high availability
  - RDS: t3.medium, 20GB storage (up to 100GB)
  - MemoryDB: Single shard with replica
  - 7-day backup retention
  - Deletion protection enabled

Configuration for each environment is defined in `config/factory.ts`.

## Security Features

- All databases are deployed in private subnets
- Database credentials stored in AWS Secrets Manager
- S3 buckets have public access blocked
- Server-side encryption enabled for all storage
- TLS enabled for all services
- IAM roles follow the principle of least privilege

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
```
