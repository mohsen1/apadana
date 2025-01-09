# AWS Infrastructure Setup

This directory contains the AWS CDK infrastructure code for Apadana's cloud resources. The infrastructure supports multiple environments (development, preview, production) with environment-specific configurations.

## Infrastructure Components

The infrastructure is organized into the following stacks:

1. **SharedNetworkStack**: VPC and networking (2 AZs, public/private/isolated subnets)
2. **S3Stack**: File storage with CloudFront CDN
3. **CloudFrontStack**: CDN distribution for S3 assets
4. **IamStack**: IAM roles and policies
5. **RdsStack**: PostgreSQL database
6. **ElastiCacheStack**: Redis cluster
7. **RedisProxyStack**: TLS proxy for Redis connections

## Quick Start

1. Set required environment variables:

```bash
export AWS_REGION=us-east-1
export AWS_DEPLOYMENT_STACK_ENV=development  # or 'preview' or 'production'
```

2. Run preflight check:

```bash
task cdk:preflight
```

3. Create deployer (first time only):

```bash
task cdk:deployer:create

# To also add credentials to Vercel:
task cdk:deployer:create -- --add-to-vercel
```

4. Deploy infrastructure:

```bash
# Deploy all resources
task cdk:deploy:resources

# Wait for resources to be ready
task cdk:wait
```

## Environment Configurations

### Development

- **RDS**: t3.medium, 20GB storage
- **Redis**: cache.t4g.small, single node
- **S3**: Public read disabled, CORS enabled
- **Backup**: 1 day retention

### Preview

- **RDS**: t3.micro, 10GB storage
- **Redis**: cache.t4g.small, single node
- **S3**: Public read disabled, CORS enabled
- **Backup**: 1 day retention

### Production

- **RDS**: t3.medium, 20GB storage
- **Redis**: cache.t4g.medium with replica
- **S3**: Public read disabled, CORS enabled
- **Backup**: 7 day retention

## Security Features

- TLS encryption for all services
- VPC isolation with private subnets
- Security groups for access control
- IAM least privilege principle
- S3 server-side encryption
- Redis auth via TLS proxy

## Vercel Integration

- Environment variables automatically configured
- Database access via proxy endpoints
- S3/CloudFront for file storage
- CORS configured for Vercel domains

## Troubleshooting

### Connection Issues

1. Check security group rules
2. Verify proxy endpoints are accessible
3. Test connections using provided utilities:

```bash
# Print connection details
task cdk:print-values
```

### Deployment Failures

1. Check CloudFormation console for errors
2. Verify IAM permissions
3. For resource conflicts:

```bash
# Force replace existing resources
AWS_FORCE_REPLACE=true task cdk:deploy:resources
```

### Resource Management

- Production resources protected from deletion
- Development/Preview resources can be destroyed
- Use `AWS_FORCE_REPLACE=true` with caution

## Useful Commands

```bash
# View planned changes
task cdk:diff

# Deploy specific stack
task cdk:deploy -- StackName-environment

# View deployment values
task cdk:print-values

# Destroy resources (careful!)
task cdk:destroy
```
