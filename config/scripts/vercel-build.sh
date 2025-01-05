#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Check environment
if [ -z "$VERCEL_ENV" ]; then
  echo "Error: VERCEL_ENV is not set"
  exit 1
fi

# Ensure AWS credentials
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Error: Missing AWS credentials in Vercel environment"
  exit 1
fi

# If AWS_REGION not set, default it
: "${AWS_REGION:=us-east-1}"

# Map Vercel env to deployment env
if [ "$VERCEL_ENV" = "preview" ]; then
  export AWS_DEPLOYMENT_STACK_ENV="preview"
elif [ "$VERCEL_ENV" = "development" ]; then
  export AWS_DEPLOYMENT_STACK_ENV="development"
else
  export AWS_DEPLOYMENT_STACK_ENV="production"
fi

echo "Using AWS_DEPLOYMENT_STACK_ENV=$AWS_DEPLOYMENT_STACK_ENV, AWS_REGION=$AWS_REGION"

# 1. Preflight: checks if resources exist and are valid
echo "Checking existing resources..."
if ! pnpm aws:preflight; then
  echo "Resources not found. Deploying..."

  # Deploy resources
  pnpm cdk:deploy:resources:ci || {
    echo "Resource deployment failed"
    exit 1
  }

  # Wait for resources to be ready
  pnpm aws:wait-resources || {
    echo "Timed out waiting for AWS resources"
    exit 1
  }
fi

# 2. Generate .env
echo "Generating .env configuration..."
pnpm aws:env >.env.production

# 3. Build Next.js
echo "Building Next.js application..."
pnpm build
