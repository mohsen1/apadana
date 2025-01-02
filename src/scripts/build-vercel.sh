#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Check for required environment variables
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Error: Required AWS credentials not set"
  exit 1
fi

# Deploy AWS resources
echo "Deploying AWS resources..."
export AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV
pnpm run cdk:deploy:resources:ci

echo "Fetching AWS configuration..."
if ! output=$(pnpm --silent aws:env 2>&1); then
  echo "Failed to fetch AWS configuration: $output"
  exit 1
fi
echo "output: $output" # TODO: remove this
echo "$output" >.env.production

echo "Building Next.js application..."
pnpm build

echo "Build process completed successfully"
