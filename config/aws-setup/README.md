# AWS Infrastructure Setup

This directory contains the AWS CDK code for setting up the infrastructure required by the Apadana application.

## For Root Users: Initial Setup

As a root user, you need to perform these steps only once to set up the infrastructure deployment pipeline:

1. Configure AWS CLI with root credentials:

```bash
aws configure
# Enter your root user access key and secret
```

2. Check existing resources:

   1. Go to AWS Console → MemoryDB
   2. Note if you have any existing clusters or ACLs
   3. The stack will use the default ACL if it exists

3. Create initial bootstrap policy (one-time setup):
   1. Go to AWS Console → IAM → Policies → Create Policy
   2. Choose JSON and paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["cloudformation:*", "ssm:*", "s3:*", "iam:*", "lambda:*", "ec2:*", "memorydb:*"],
      "Resource": "*"
    }
  ]
}
```

4.  Name it `ApadanaCDKBootstrapPolicy`
5.  Add tags if needed
6.  Click "Create Policy"

7.  Attach the policy to your user:

    1.  Go to AWS Console → IAM → Users → Your User
    2.  Click "Add permissions"
    3.  Choose "Attach policies directly"
    4.  Search for `ApadanaCDKBootstrapPolicy`
    5.  Select it and click "Next"
    6.  Click "Add permissions"

8.  Bootstrap the AWS environment:

```bash
pnpm cdk:bootstrap
```

9. Deploy the bootstrap stack:

```bash
pnpm cdk:deploy:bootstrap
```

10. After successful deployment, you'll receive outputs containing:

- Deployment user name (`apadana-cdk-deployer`)
- Access key ID
- Secret access key

11. Create IAM Console access for developers:

    1. Go to AWS Console → IAM → Users
    2. Create a new user for each developer
    3. Enable Console access
    4. Add user to appropriate groups
    5. Share console credentials securely

12. Share deployment credentials with the development team securely:

    - Access key ID
    - Secret access key
    - AWS Console credentials (if needed)

### Cleanup After Bootstrap

After successful bootstrap and verification that developers can deploy:

1. Go to AWS Console → IAM → Users → Your User
2. Under "Permissions" tab, find `ApadanaCDKBootstrapPolicy`
3. Click the "X" to remove it or use the "Remove" button
4. Confirm removal

## For Developers (Non-Root Users)

Before deploying infrastructure:

1. Get AWS Console access from root user
2. Create access keys for deployment:

   1. Log into AWS Console
   2. Go to IAM → Users → `apadana-cdk-deployer`
   3. Security credentials tab → Create access key
   4. Store the credentials securely

3. Configure AWS CLI with the deployment credentials:

```bash
aws configure --profile apadana
# Enter the access key and secret you created
```

4. Set the AWS profile:

```bash
export AWS_PROFILE=apadana
```

5. Create `.env.local` in the project root:

```bash
AWS_REGION=us-east-1  # or your preferred region
```

6. Deploy infrastructure:

```bash
pnpm cdk:deploy:resources
```

## Current Infrastructure

- MemoryDB (Redis) cluster for caching and session management
  - Single shard with one replica for high availability
  - Running in private subnets
  - Secured with VPC security groups
  - TLS enabled

## Available Commands

```bash
# For root users only
pnpm cdk:bootstrap        # Bootstrap CDK environment (root only)
pnpm cdk:deploy:bootstrap # Create deployment user (root only)

# For developers
pnpm cdk:deploy:resources # Deploy all infrastructure stacks
pnpm cdk:destroy         # Destroy all stacks
pnpm cdk:diff           # Show changes to be deployed
pnpm cdk:synth         # Synthesize CloudFormation template
```

## Security Considerations

- Root user only needed for initial bootstrap
- Developers use dedicated deployment user with minimal permissions
- All resources are deployed within a VPC
- Security groups are configured with minimal required access
- TLS is enabled for all applicable services
- Credentials and sensitive data are managed through AWS Secrets Manager

## Adding New Resources

When adding new AWS resources:

1. Create a new stack file in the `stacks` directory
2. Import and use it in `cdk.ts`
3. Update this README with the new resource details
4. If new permissions are needed, ask root user to update the bootstrap stack
