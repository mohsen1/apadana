#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Check for required environment variables
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Error: Required AWS credentials not set"
  exit 1
fi

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
