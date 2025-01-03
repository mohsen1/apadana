#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Check for required environment variables with detailed messages
if [ -z "$VERCEL_ENV" ]; then
  echo "Error: VERCEL_ENV is not set"
  echo "This script must be run in a Vercel environment"
  exit 1
fi

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  echo "Error: AWS_ACCESS_KEY_ID is not set"
  echo "Please add AWS_ACCESS_KEY_ID to your Vercel environment variables"
  exit 1
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Error: AWS_SECRET_ACCESS_KEY is not set"
  echo "Please add AWS_SECRET_ACCESS_KEY to your Vercel environment variables"
  exit 1
fi

if [ -z "$AWS_REGION" ]; then
  echo "Warning: AWS_REGION is not set, defaulting to us-east-1"
  export AWS_REGION="us-east-1"
fi

# Set AWS_DEPLOYMENT_STACK_ENV based on VERCEL_ENV
if [ "$VERCEL_ENV" = "preview" ]; then
  export AWS_DEPLOYMENT_STACK_ENV="preview"
else
  export AWS_DEPLOYMENT_STACK_ENV="production"
fi

echo "Using AWS deployment stack environment: $AWS_DEPLOYMENT_STACK_ENV"
echo "AWS Region: $AWS_REGION"

# Run preflight checks
echo "Running AWS preflight checks..."
pnpm run aws:preflight

# Deploy AWS resources and wait for completion
echo "Deploying AWS resources..."
pnpm run cdk:deploy:resources:ci

echo "Waiting for AWS resources to be ready..."
pnpm run aws:wait-resources

echo "Fetching AWS configuration..."
pnpm --silent aws:env >.env.production

echo "Building Next.js application..."
pnpm build
