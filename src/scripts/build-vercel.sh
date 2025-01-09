#!/bin/bash

# This is essentially a postinstall
pnpm prisma:generate

# Exit on error
set -e

# Start timing AWS deployment
start_time=$(date +%s)

# Build for production. This script assumes all of the environment variables are set.
export AWS_DEPLOYMENT_STACK_ENV=$VERCEL_ENV

echo "Deploying AWS resources for '$AWS_DEPLOYMENT_STACK_ENV' environment in $AWS_REGION region"

# Run preflight checks
echo "Running preflight checks..."
pnpm cdk:preflight || exit 1

pnpm cdk:deploy --all --require-approval never --concurrency 10

# Check deployment time
end_time=$(date +%s)
elapsed=$((end_time - start_time))
if [ $elapsed -ge 2400 ]; then
  echo "Warning: AWS deployment took more than 40 minutes. This is likely because a lot of resources are being deployed."
  echo "Vercel build times are capped at 45 minutes. For faster iterations, consider running locally with:"
  echo "AWS_DEPLOYMENT_STACK_ENV=$AWS_DEPLOYMENT_STACK_ENV pnpm cdk:deploy --all"
  exit 124
fi

# Install Vercel CLI
echo "Installing Vercel CLI..."
export AVOID_UPDATE_NOTIFIER="1"
npm install --global --silent vercel@39.2.6

# Get AWS environment variables and set them in Vercel
echo "Setting AWS environment variables in Vercel..."
pnpm --silent cdk:env

echo "Deployment values:"
cat /tmp/deployment-values.env

cat /tmp/deployment-values.env | while IFS='=' read -r key value; do
  # Trim the value to remove any whitespace or newlines
  value=$(echo "$value" | tr -d '\n' | xargs)
  # Write the environment variable to a temporary file.
  # This is done because of how Vercel CLI handles environment variables.
  filename="/tmp/__TEMP_ENV_VAR__$key.env"
  # Only write the value part, not the key=value format
  echo -n "$value" >$filename
  cat $filename | vercel env add "$key" "$VERCEL_ENV" --force --token "$VERCEL_TOKEN"
  rm -f $filename
  # Export the environment variable to the current shell session for the build script to use.
  export $key="$value"
done

# Wait for resources to be ready
echo "Waiting for AWS resources to be ready..."
pnpm cdk:wait

# Deploy Prisma migrations
echo "Deploying database migrations..."
pnpm prisma:migrate

# In preview run seed
if [ "$VERCEL_ENV" == "preview" ]; then
  pnpm dev:prisma:seed
fi

# Build Next.js app
echo "Building Next.js application..."
pnpm build
