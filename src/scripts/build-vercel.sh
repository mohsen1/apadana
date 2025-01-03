#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Check for required environment variables
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Error: Required AWS credentials not set"
  exit 1
fi

# Ensure AWS_REGION is set
if [ -z "$AWS_REGION" ]; then
  echo "Error: AWS_REGION not set. Defaulting to us-east-1"
  export AWS_REGION="us-east-1"
fi

echo "VERCEL_ENV: $VERCEL_ENV"

# Set environment name to 'development' if we are in a preview environment
if [[ "$VERCEL_ENV" == preview* ]]; then
  AWS_DEPLOYMENT_STACK_ENV="development"
else
  AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV
fi

echo "Using AWS_DEPLOYMENT_STACK_ENV: $AWS_DEPLOYMENT_STACK_ENV"

# Deploy AWS resources and wait for completion
echo "Deploying AWS resources..."
pnpm run cdk:deploy:resources:ci

echo "Waiting for AWS resources to be ready..."
pnpm run aws:wait-resources "$AWS_DEPLOYMENT_STACK_ENV"
if [ $? -ne 0 ]; then
  echo "Error: Failed to wait for AWS resources"
  exit 1
fi

echo "Fetching AWS configuration..."
pnpm --silent aws:env >.env.production

echo "Building Next.js application..."
pnpm build

echo "Build process completed successfully"
