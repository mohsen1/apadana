#!/bin/bash
set -e

echo "Starting Vercel build process..."

# Check for required environment variables
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Error: Required AWS credentials not set"
  exit 1
fi

# Set environment name to 'preview' if it starts with 'preview'
if [[ "$VERCEL_ENV" == preview* ]]; then
  sanitized_env="preview"
else
  # Sanitize the environment name for other cases
  sanitized_env=$(echo "$VERCEL_ENV" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')
fi

if [ ${#sanitized_env} -lt 3 ]; then
  echo "Error:AWS_DEPLOYMENT_STACK_ENV too short after sanitization"
  exit 1
fi

# Truncate to 63 chars, ensuring we don't cut in the middle of a hyphen
export AWS_DEPLOYMENT_STACK_ENV=$(echo "$sanitized_env" | cut -c 1-63 | sed 's/-$//g')
echo "Using sanitized AWS_DEPLOYMENT_STACK_ENV: $AWS_DEPLOYMENT_STACK_ENV"

# Deploy AWS resources
echo "Deploying AWS resources..."
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
